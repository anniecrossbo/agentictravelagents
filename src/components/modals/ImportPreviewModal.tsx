import { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { formatMoney } from '../../lib/booking-view';
import { classifyImport, type ImportRow, type RowVerdict } from '../../lib/finance-import';
import type { FinanceObligation, SettlementRecord } from '../../lib/types';

type ImportPreviewModalProps = {
  visible: boolean;
  onClose: () => void;
  fileName: string;
  rows: readonly ImportRow[];
  obligations: readonly FinanceObligation[];
  settlements: readonly SettlementRecord[];
  onConfirm?: (rowNumbers: number[]) => void;
};

const VERDICT_BADGE: Record<RowVerdict, { labelKey: string; variant: 'positive' | 'danger' | 'warning' }> = {
  valid: { labelKey: 'finance.import.valid', variant: 'positive' },
  invalid: { labelKey: 'finance.import.invalid', variant: 'danger' },
  duplicate: { labelKey: 'finance.import.duplicate', variant: 'warning' },
};

function Tally({ labelKey, count, variant }: { labelKey: string; count: number; variant: 'positive' | 'danger' | 'warning' }) {
  const { t } = useTranslation();
  const tone =
    variant === 'positive' ? 'text-positive' : variant === 'danger' ? 'text-danger' : 'text-warning';
  return (
    <View className="min-w-[110px] flex-1 gap-1 rounded-lg bg-surface-page p-3">
      <Text className="text-[10px] font-semibold uppercase text-fg-muted">{t(labelKey)}</Text>
      <Text className={`text-xl font-bold ${tone}`}>{count}</Text>
    </View>
  );
}

export function ImportPreviewModal({
  visible,
  onClose,
  fileName,
  rows,
  obligations,
  settlements,
  onConfirm,
}: ImportPreviewModalProps) {
  const { t } = useTranslation();
  const [excluded, setExcluded] = useState<Set<number>>(new Set());

  const summary = useMemo(
    () => classifyImport(rows, obligations, settlements),
    [rows, obligations, settlements],
  );

  const includedValid = summary.rows.filter(
    (r) => r.verdict === 'valid' && !excluded.has(r.lineNumber),
  );

  const toggle = (line: number) =>
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(line)) next.delete(line);
      else next.add(line);
      return next;
    });

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="finance.import.preview"
      subtitle={fileName}
    >
      <View className="w-[760px] max-w-full gap-5">
        {/* §7.15.3 — nothing commits before confirmation */}
        <Text className="rounded-lg bg-warning-bg px-3 py-2 text-xs text-warning">
          {t('finance.import.nothingCommits')}
        </Text>

        <View className="flex-row flex-wrap gap-3">
          <Tally labelKey="finance.import.valid" count={summary.valid} variant="positive" />
          <Tally labelKey="finance.import.invalid" count={summary.invalid} variant="danger" />
          <Tally labelKey="finance.import.duplicate" count={summary.duplicate} variant="warning" />
        </View>

        {/* Totals per currency — never combined (§12.3) */}
        <View className="gap-1.5">
          <Text className="text-[10px] font-semibold uppercase text-fg-muted">
            {t('finance.import.totals')}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {summary.totalsByCurrency.map((tot) => (
              <View key={tot.currency} className="rounded-lg border border-border px-3 py-2">
                <Text className="text-sm font-semibold text-fg">
                  {formatMoney(tot.amount, tot.currency)}
                </Text>
                <Text className="text-[10px] text-fg-muted">
                  {t('finance.import.rows', { n: tot.count })}
                </Text>
              </View>
            ))}
            {summary.totalsByCurrency.length === 0 && (
              <Text className="text-sm text-fg-muted">{t('finance.import.noValidRows')}</Text>
            )}
          </View>
        </View>

        {/* Row detail */}
        <View className="gap-1.5 border-t border-border pt-4">
          {summary.rows.map((r) => {
            const badge = VERDICT_BADGE[r.verdict];
            const isExcluded = excluded.has(r.lineNumber);
            return (
              <View
                key={r.lineNumber}
                className={`flex-row items-center gap-3 rounded-lg border border-border px-3 py-2.5 ${
                  isExcluded ? 'opacity-50' : ''
                }`}
              >
                <Text className="w-10 text-[10px] text-fg-muted">
                  {t('finance.import.line')} {r.lineNumber}
                </Text>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-fg" numberOfLines={1}>
                    {r.reference} · {r.counterparty}
                  </Text>
                  <Text className="text-xs text-fg-muted" numberOfLines={1}>
                    {r.date}
                    {r.reasonKey ? ` · ${t(r.reasonKey)}` : ''}
                  </Text>
                </View>
                <Text className="text-sm font-semibold text-fg">
                  {formatMoney(r.amount, r.currency)}
                </Text>
                <Badge label={badge.labelKey} variant={badge.variant} />
                {r.verdict === 'valid' && (
                  <Pressable
                    onPress={() => toggle(r.lineNumber)}
                    accessibilityRole="button"
                    accessibilityLabel={t(isExcluded ? 'finance.import.includeRow' : 'finance.import.excludeRow')}
                    className="rounded-pill border border-border-input px-2.5 py-1"
                    hitSlop={{ top: 6, bottom: 6 }}
                  >
                    <Text className="text-[10px] font-medium text-fg">
                      {t(isExcluded ? 'finance.import.includeRow' : 'finance.import.excludeRow')}
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>

        <View className="flex-row gap-2 border-t border-border pt-4">
          {/* PROTO: confirmation is local; production commits through the finance service */}
          <Button
            label={t('finance.import.confirmImport', { n: includedValid.length })}
            disabled={includedValid.length === 0}
            onPress={() => {
              onConfirm?.(includedValid.map((r) => r.lineNumber));
              onClose();
            }}
          />
          <Button label="common.cancel" variant="secondary" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
