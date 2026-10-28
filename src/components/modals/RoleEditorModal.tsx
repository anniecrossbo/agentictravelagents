import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { TextInput } from '../TextInput';
import { CAPABILITY_GROUPS, isHighRisk, effectiveCapabilities } from '../../lib/settings-rules';
import type { Capability, User, UserRole } from '../../lib/types';

type RoleEditorModalProps = {
  visible: boolean;
  onClose: () => void;
  /** Omitted when creating a new role. */
  role?: UserRole;
  roleName?: string;
  allUsers: readonly User[];
  roleLabelKey: (role: UserRole) => string;
};

const ROLES: UserRole[] = [
  'reservation_manager',
  'revenue_manager',
  'general_manager',
];

export function RoleEditorModal({
  visible,
  onClose,
  role,
  roleName,
  allUsers,
  roleLabelKey,
}: RoleEditorModalProps) {
  const { t } = useTranslation();
  const isCreate = role == null;

  const [name, setName] = useState(roleName ?? '');
  const [duplicateFrom, setDuplicateFrom] = useState<UserRole | null>(null);
  const [granted, setGranted] = useState<Set<Capability>>(
    new Set(role ? effectiveCapabilities(role, allUsers) : []),
  );

  const applyDuplicate = (source: UserRole) => {
    setDuplicateFrom(source);
    setGranted(new Set(effectiveCapabilities(source, allUsers)));
  };

  const toggle = (c: Capability) =>
    setGranted((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });

  const highRiskCount = [...granted].filter(isHighRisk).length;
  const affectedMembers = role ? allUsers.filter((u) => u.role === role).length : 0;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={isCreate ? 'settings.rolesSection.createTitle' : 'settings.rolesSection.editTitle'}
      subtitle={role ? roleLabelKey(role) : undefined}
    >
      <View className="w-[660px] max-w-full gap-5">
        {isCreate && (
          <>
            <View className="gap-1">
              <Text className="text-[10px] font-semibold uppercase text-fg-muted">
                {t('settings.rolesSection.roleName')}
              </Text>
              <TextInput value={name} onChangeText={setName} />
            </View>

            {/* §7.19.2 step 1 — start blank or duplicate */}
            <View className="gap-1.5">
              <Text className="text-[10px] font-semibold uppercase text-fg-muted">
                {t('settings.rolesSection.duplicateFrom')}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                <Pressable
                  onPress={() => {
                    setDuplicateFrom(null);
                    setGranted(new Set());
                  }}
                  accessibilityRole="radio"
                  accessibilityLabel={t('settings.rolesSection.startBlank')}
                  accessibilityState={{ selected: duplicateFrom === null }}
                  className={`rounded-pill border px-3 py-1.5 ${
                    duplicateFrom === null
                      ? 'border-brand bg-brand-light'
                      : 'border-border-input bg-surface'
                  }`}
                  hitSlop={{ top: 6, bottom: 6 }}
                >
                  <Text
                    className={`text-xs font-medium ${duplicateFrom === null ? 'text-brand' : 'text-fg'}`}
                  >
                    {t('settings.rolesSection.startBlank')}
                  </Text>
                </Pressable>
                {ROLES.map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => applyDuplicate(r)}
                    accessibilityRole="radio"
                    accessibilityLabel={t(roleLabelKey(r))}
                    accessibilityState={{ selected: duplicateFrom === r }}
                    className={`rounded-pill border px-3 py-1.5 ${
                      duplicateFrom === r
                        ? 'border-brand bg-brand-light'
                        : 'border-border-input bg-surface'
                    }`}
                    hitSlop={{ top: 6, bottom: 6 }}
                  >
                    <Text
                      className={`text-xs font-medium ${duplicateFrom === r ? 'text-brand' : 'text-fg'}`}
                    >
                      {t(roleLabelKey(r))}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}

        {/* §7.19.2 step 2 — permissions grouped by capability class */}
        <View className="gap-3">
          <Text className="text-[10px] font-semibold uppercase text-fg-muted">
            {t('settings.rolesSection.permissions')}
          </Text>
          {CAPABILITY_GROUPS.map((group) => (
            <View key={group.group} className="gap-1.5">
              <Text className="text-xs font-semibold text-fg">{t(group.labelKey)}</Text>
              <View className="flex-row flex-wrap gap-1.5">
                {group.capabilities.map((c) => {
                  const on = granted.has(c);
                  const risky = isHighRisk(c);
                  return (
                    <Pressable
                      key={c}
                      onPress={() => toggle(c)}
                      accessibilityRole="checkbox"
                      accessibilityLabel={c.replaceAll('_', ' ')}
                      accessibilityState={{ checked: on }}
                      className={`flex-row items-center gap-1.5 rounded-pill border px-3 py-1.5 ${
                        on
                          ? risky
                            ? 'border-warning bg-warning-bg'
                            : 'border-brand bg-brand-light'
                          : 'border-border-input bg-surface'
                      }`}
                      hitSlop={{ top: 6, bottom: 6 }}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          on ? (risky ? 'text-warning' : 'text-brand') : 'text-fg-muted'
                        }`}
                      >
                        {c.replaceAll('_', ' ')}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* §7.19.2 step 3 — affected members and high-risk disclosure */}
        <View className="gap-1.5 rounded-lg bg-surface-page p-3">
          {highRiskCount > 0 && (
            <View className="flex-row items-center gap-2">
              <Badge label="settings.rolesSection.highRisk" variant="warning" />
              <Text className="text-xs text-warning">
                {t('settings.rolesSection.highRiskNotice', { count: highRiskCount })}
              </Text>
            </View>
          )}
          {!isCreate && (
            <Text className="text-xs text-fg-muted">
              {t('settings.rolesSection.affectedMembers', { count: affectedMembers })}
            </Text>
          )}
          <Text className="text-xs text-fg-muted">
            {t('settings.rolesSection.archivedNotice')}
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-2 border-t border-border pt-4">
          {/* PROTO: authorization is not changed; production updates grants server-side */}
          <Button
            label="settings.rolesSection.saveRole"
            disabled={isCreate && name.trim().length === 0}
            onPress={onClose}
          />
          {!isCreate && (
            <Button
              label="settings.rolesSection.archive"
              variant="danger"
              disabled={affectedMembers > 0}
              onPress={onClose}
            />
          )}
          <Button label="common.cancel" variant="ghost" onPress={onClose} />
        </View>

        {!isCreate && affectedMembers > 0 && (
          <Text className="text-xs text-fg-muted">
            {t('settings.rolesSection.cannotArchiveDefault')}
          </Text>
        )}
      </View>
    </Modal>
  );
}
