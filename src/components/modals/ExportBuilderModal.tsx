import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { Button } from '../Button';
import {
  EXPORT_FIELDS,
  type ExportField,
  type CurrencyRepresentation,
  type ExportFormat,
} from '../../lib/finance-import';

type ExportBuilderModalProps = {
  visible: boolean;
  onClose: () => void;
  /** Rows the current ledger filter would export. */
  rowCount: number;
  scopeLabel: string;
  reportingCurrency: string;
  onGenerate?: (opts: {
    fields: ExportField[];
    currency: CurrencyRepresentation;
    format: ExportFormat;
  }) => void;
};

function Choice<T extends string>({
  labelKey,
  options,
  selected,
  onSelect,
}: {
  labelKey: string;
  options: { key: T; label: string }[];
  selected: T;
  onSelect: (k: T) => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="gap-1.5">
      <Text className="text-[10px] font-semibold uppercase text-fg-muted">{t(labelKey)}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((o) => {
          const isActive = o.key === selected;
          return (
            <Pressable
              key={o.key}
              onPress={() => onSelect(o.key)}
              accessibilityRole="radio"
              accessibilityLabel={o.label}
              accessibilityState={{ selected: isActive }}
              className={`rounded-pill border px-3 py-1.5 ${
                isActive ? 'border-brand bg-brand-light' : 'border-border-input bg-surface'
              }`}
              hitSlop={{ top: 6, bottom: 6 }}
            >
              <Text className={`text-xs font-medium ${isActive ? 'text-brand' : 'text-fg'}`}>
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function ExportBuilderModal({
  visible,
  onClose,
  rowCount,
  scopeLabel,
  reportingCurrency,
  onGenerate,
}: ExportBuilderModalProps) {
  const { t } = useTranslation();
  const [fields, setFields] = useState<Set<ExportField>>(
    new Set(EXPORT_FIELDS.map((f) => f.key)),
  );
  const [currency, setCurrency] = useState<CurrencyRepresentation>('original');
  const [format, setFormat] = useState<ExportFormat>('csv');

  const toggleField = (key: ExportField) =>
    setFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <Modal visible={visible} onClose={onClose} title="finance.export.title" subtitle={scopeLabel}>
      <View className="w-[560px] max-w-full gap-5">
        <View className="gap-1 rounded-lg bg-surface-page p-3">
          <Text className="text-[10px] font-semibold uppercase text-fg-muted">
            {t('finance.export.scope')}
          </Text>
          <Text className="text-sm text-fg">{scopeLabel}</Text>
          <Text className="mt-1 text-xs text-fg-muted">
            {t('finance.export.expectedRows', { n: rowCount })}
          </Text>
        </View>

        {/* Field selection */}
        <View className="gap-1.5">
          <Text className="text-[10px] font-semibold uppercase text-fg-muted">
            {t('finance.export.fields')}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {EXPORT_FIELDS.map((f) => {
              const isOn = fields.has(f.key);
              return (
                <Pressable
                  key={f.key}
                  onPress={() => toggleField(f.key)}
                  accessibilityRole="checkbox"
                  accessibilityLabel={t(f.labelKey)}
                  accessibilityState={{ checked: isOn }}
                  className={`rounded-pill border px-3 py-1.5 ${
                    isOn ? 'border-brand bg-brand-light' : 'border-border-input bg-surface'
                  }`}
                  hitSlop={{ top: 6, bottom: 6 }}
                >
                  <Text className={`text-xs font-medium ${isOn ? 'text-brand' : 'text-fg-muted'}`}>
                    {t(f.labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {fields.size === 0 && (
            <Text className="text-xs text-danger">{t('finance.export.noFields')}</Text>
          )}
        </View>

        <Choice
          labelKey="finance.export.currencyRepresentation"
          selected={currency}
          onSelect={setCurrency}
          options={[
            { key: 'original' as CurrencyRepresentation, label: t('finance.export.original') },
            {
              key: 'reporting' as CurrencyRepresentation,
              label: `${t('finance.export.reporting')} (${reportingCurrency})`,
            },
          ]}
        />

        <Choice
          labelKey="finance.export.format"
          selected={format}
          onSelect={setFormat}
          options={[
            { key: 'csv' as ExportFormat, label: 'CSV' },
            { key: 'xlsx' as ExportFormat, label: 'XLSX' },
          ]}
        />

        {/* §7.14 — completion and scope are audited */}
        <Text className="text-xs text-fg-muted">{t('finance.export.auditNotice')}</Text>

        <View className="flex-row gap-2 border-t border-border pt-4">
          {/* PROTO: no file is produced; production streams the export and audits it */}
          <Button
            label="finance.export.generate"
            disabled={fields.size === 0 || rowCount === 0}
            onPress={() => {
              onGenerate?.({ fields: [...fields], currency, format });
              onClose();
            }}
          />
          <Button label="common.cancel" variant="secondary" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
