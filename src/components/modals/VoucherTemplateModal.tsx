import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { TextInput } from '../TextInput';
import { canArchiveTemplate, canSetDefault } from '../../lib/settings-rules';
import type { VoucherTemplate } from '../../lib/types';

type VoucherTemplateModalProps = {
  visible: boolean;
  onClose: () => void;
  template: VoucherTemplate;
  allTemplates: readonly VoucherTemplate[];
};

const LANGUAGES = ['en', 'ar', 'fr', 'de'];

export function VoucherTemplateModal({
  visible,
  onClose,
  template,
  allTemplates,
}: VoucherTemplateModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(template.name);
  const [content, setContent] = useState(template.content);
  const [languages, setLanguages] = useState<Set<string>>(new Set(template.supportedLanguages));
  const [confirmDefault, setConfirmDefault] = useState(false);

  const archiveGuard = canArchiveTemplate(template, allTemplates);
  const defaultGuard = canSetDefault(template);
  const nextVersion = template.version + 1;

  const toggleLanguage = (code: string) =>
    setLanguages((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="settings.vouchersSection.editTitle"
      subtitle={template.name}
      badge={{
        label: `voucher.state.${template.state}`,
        variant: template.isDefault ? 'positive' : 'neutral',
      }}
    >
      <View className="w-[620px] max-w-full gap-4">
        <View className="gap-1">
          <Text className="text-[10px] font-semibold uppercase text-fg-muted">
            {t('settings.vouchersSection.templateNameLabel')}
          </Text>
          <TextInput value={name} onChangeText={setName} />
        </View>

        <View className="gap-1.5">
          <Text className="text-[10px] font-semibold uppercase text-fg-muted">
            {t('settings.vouchersSection.supportedLanguages')}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {LANGUAGES.map((code) => {
              const on = languages.has(code);
              return (
                <Pressable
                  key={code}
                  onPress={() => toggleLanguage(code)}
                  accessibilityRole="checkbox"
                  accessibilityLabel={code}
                  accessibilityState={{ checked: on }}
                  className={`rounded-pill border px-3 py-1.5 ${
                    on ? 'border-brand bg-brand-light' : 'border-border-input bg-surface'
                  }`}
                  hitSlop={{ top: 6, bottom: 6 }}
                >
                  <Text className={`text-xs font-medium ${on ? 'text-brand' : 'text-fg-muted'}`}>
                    {code.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="gap-1">
          <Text className="text-[10px] font-semibold uppercase text-fg-muted">
            {t('settings.vouchersSection.previewTitle')}
          </Text>
          <TextInput value={content} onChangeText={setContent} multiline />
        </View>

        {/* §7.19.4 step 2 — saving creates a new version */}
        <Text className="rounded-lg bg-surface-page px-3 py-2 text-xs text-fg-muted">
          {t('settings.vouchersSection.newVersionNotice', { n: nextVersion })}
        </Text>

        {/* §7.19.4 step 3 — set default requires confirmation */}
        {confirmDefault && (
          <View className="gap-1 rounded-lg bg-warning-bg p-3">
            <Text className="text-xs font-semibold text-warning">
              {t('settings.vouchersSection.setDefaultNotice')}
            </Text>
          </View>
        )}

        <View className="flex-row flex-wrap gap-2 border-t border-border pt-4">
          {/* PROTO: no version is written; production publishes a new template version */}
          <Button
            label="settings.vouchersSection.saveTemplate"
            disabled={name.trim().length === 0 || languages.size === 0}
            onPress={onClose}
          />

          {!template.isDefault &&
            (confirmDefault ? (
              <Button
                label="settings.vouchersSection.confirmSetDefault"
                onPress={onClose}
              />
            ) : (
              <Button
                label="settings.vouchersSection.setDefault"
                variant="secondary"
                disabled={!defaultGuard.allowed}
                onPress={() => setConfirmDefault(true)}
              />
            ))}

          <Button
            label="settings.vouchersSection.archive"
            variant="danger"
            disabled={!archiveGuard.allowed}
            onPress={onClose}
          />
          <Button label="common.cancel" variant="ghost" onPress={onClose} />
        </View>

        {/* §7.19.4 step 4 — why archiving or defaulting is blocked */}
        {!archiveGuard.allowed && (
          <Text className="text-xs text-warning">{t(archiveGuard.reasonKey)}</Text>
        )}
        {!defaultGuard.allowed && !template.isDefault && (
          <Text className="text-xs text-warning">{t(defaultGuard.reasonKey)}</Text>
        )}
        {template.isDefault && (
          <Badge label="settings.vouchersSection.default" variant="positive" />
        )}
      </View>
    </Modal>
  );
}
