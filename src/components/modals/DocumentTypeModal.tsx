import { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { TextInput } from '../TextInput';
import { previewRequiredDocumentImpact } from '../../lib/settings-rules';
import type { DocumentType, Document, BookingRequest } from '../../lib/types';

type DocumentTypeModalProps = {
  visible: boolean;
  onClose: () => void;
  /** Omitted when adding a new type. */
  documentType?: DocumentType;
  bookings: readonly BookingRequest[];
  documents: readonly Document[];
};

function Toggle({
  labelKey,
  value,
  onChange,
}: {
  labelKey: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityLabel={t(labelKey)}
      accessibilityState={{ checked: value }}
      className="flex-row items-center justify-between rounded-lg border border-border px-3 py-2.5 active:bg-surface-page"
      hitSlop={{ top: 4, bottom: 4 }}
    >
      <Text className="flex-1 text-sm text-fg">{t(labelKey)}</Text>
      <View
        className={`h-5 w-9 justify-center rounded-pill px-0.5 ${
          value ? 'items-end bg-brand' : 'items-start bg-surface-track'
        }`}
      >
        <View className="h-4 w-4 rounded-pill bg-surface" />
      </View>
    </Pressable>
  );
}

export function DocumentTypeModal({
  visible,
  onClose,
  documentType,
  bookings,
  documents,
}: DocumentTypeModalProps) {
  const { t } = useTranslation();
  const isCreate = documentType == null;

  const [name, setName] = useState(documentType?.name ?? '');
  const [required, setRequired] = useState(documentType?.required ?? false);
  const [requiresReview, setRequiresReview] = useState(documentType?.requiresReview ?? true);
  const [isActive, setIsActive] = useState(documentType?.isActive ?? true);
  const [maxSizeMb, setMaxSizeMb] = useState(
    String(Math.round((documentType?.maxFileSize ?? 10_000_000) / 1_000_000)),
  );

  // §7.19.3 step 2 — preview which active bookings would become incomplete
  const impact = useMemo(
    () => previewRequiredDocumentImpact(name || documentType?.name || '', bookings, documents),
    [name, documentType, bookings, documents],
  );
  const willAffect = required && isActive;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={isCreate ? 'settings.documentsSection.addTitle' : 'settings.documentsSection.editTitle'}
      subtitle={documentType?.name}
    >
      <View className="w-[580px] max-w-full gap-4">
        <View className="gap-1">
          <Text className="text-[10px] font-semibold uppercase text-fg-muted">
            {t('settings.documentsSection.typeName')}
          </Text>
          <TextInput value={name} onChangeText={setName} />
        </View>

        <Toggle
          labelKey="settings.documentsSection.requiredToggle"
          value={required}
          onChange={setRequired}
        />
        <Toggle
          labelKey="settings.documentsSection.reviewToggle"
          value={requiresReview}
          onChange={setRequiresReview}
        />
        <Toggle
          labelKey="settings.documentsSection.activeToggle"
          value={isActive}
          onChange={setIsActive}
        />

        <View className="gap-1">
          <Text className="text-[10px] font-semibold uppercase text-fg-muted">
            {t('settings.documentsSection.maxSizeMb')}
          </Text>
          <TextInput value={maxSizeMb} onChangeText={setMaxSizeMb} keyboardType="numeric" />
        </View>

        {/* Impact preview */}
        <View className="gap-1 rounded-xl bg-surface-page p-4">
          <Text className="text-[10px] font-semibold uppercase text-fg-muted">
            {t('settings.documentsSection.impactTitle')}
          </Text>
          <Text
            className={`text-sm ${willAffect && impact.affectedCount > 0 ? 'text-warning' : 'text-fg'}`}
          >
            {willAffect && impact.affectedCount > 0
              ? t('settings.documentsSection.impactCount', { count: impact.affectedCount })
              : t('settings.documentsSection.impactNone')}
          </Text>
          <Text className="mt-1 text-xs text-fg-muted">
            {t('settings.documentsSection.noFilesDeleted')}
          </Text>
        </View>

        <View className="flex-row gap-2 border-t border-border pt-4">
          {/* PROTO: the rule is not persisted; production recalculates readiness and signals */}
          <Button
            label="settings.documentsSection.confirmSave"
            disabled={name.trim().length === 0}
            onPress={onClose}
          />
          <Button label="common.cancel" variant="secondary" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
