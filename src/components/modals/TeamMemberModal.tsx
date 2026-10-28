import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { TextInput } from '../TextInput';
import {
  CAPABILITY_GROUPS,
  effectiveCapabilities,
  isHighRisk,
  canDeactivate,
  canChangeRole,
  isFullAdministrator,
} from '../../lib/settings-rules';
import type { User, UserRole } from '../../lib/types';

type TeamMemberModalProps = {
  visible: boolean;
  onClose: () => void;
  /** Omitted when inviting someone new. */
  member?: User;
  allUsers: readonly User[];
  roleLabelKey: (role: UserRole) => string;
};

const ROLES: UserRole[] = [
  'reservation_manager',
  'revenue_manager',
  'general_manager',
];

export function TeamMemberModal({
  visible,
  onClose,
  member,
  allUsers,
  roleLabelKey,
}: TeamMemberModalProps) {
  const { t } = useTranslation();
  const isInvite = member == null;

  const [firstName, setFirstName] = useState(member?.firstName ?? '');
  const [lastName, setLastName] = useState(member?.lastName ?? '');
  const [email, setEmail] = useState(member?.email ?? '');
  const [role, setRole] = useState<UserRole>(member?.role ?? 'reservation_manager');

  // §7.19.1 step 2 — effective permissions are shown before the invitation goes out
  const capabilities = effectiveCapabilities(role, allUsers);
  const roleIsAdmin = (r: UserRole) =>
    allUsers.some((u) => u.role === r && isFullAdministrator(u));

  const deactivateGuard = member
    ? canDeactivate(member, allUsers)
    : ({ allowed: true } as const);
  const roleGuard = member
    ? canChangeRole(member, role, allUsers, roleIsAdmin)
    : ({ allowed: true } as const);

  const canSubmit = isInvite
    ? firstName.trim() && lastName.trim() && email.includes('@')
    : roleGuard.allowed;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={isInvite ? 'settings.teamSection.inviteTitle' : 'settings.teamSection.editTitle'}
      subtitle={member ? member.email : undefined}
      badge={
        member
          ? {
              label: `common.${member.status}`,
              variant: member.status === 'active' ? 'positive' : 'neutral',
            }
          : undefined
      }
    >
      <View className="w-[620px] max-w-full gap-5">
        {isInvite && (
          <View className="gap-3">
            <View className="flex-row gap-3">
              <View className="flex-1 gap-1">
                <Text className="text-[10px] font-semibold uppercase text-fg-muted">
                  {t('settings.teamSection.firstName')}
                </Text>
                <TextInput value={firstName} onChangeText={setFirstName} />
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-[10px] font-semibold uppercase text-fg-muted">
                  {t('settings.teamSection.lastName')}
                </Text>
                <TextInput value={lastName} onChangeText={setLastName} />
              </View>
            </View>
            <View className="gap-1">
              <Text className="text-[10px] font-semibold uppercase text-fg-muted">
                {t('settings.teamSection.email')}
              </Text>
              <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" />
            </View>
          </View>
        )}

        {/* Role selection */}
        <View className="gap-1.5">
          <Text className="text-[10px] font-semibold uppercase text-fg-muted">
            {t('settings.teamSection.role')}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {ROLES.map((r) => {
              const isActive = r === role;
              return (
                <Pressable
                  key={r}
                  onPress={() => setRole(r)}
                  accessibilityRole="radio"
                  accessibilityLabel={t(roleLabelKey(r))}
                  accessibilityState={{ selected: isActive }}
                  className={`rounded-pill border px-3 py-1.5 ${
                    isActive ? 'border-brand bg-brand-light' : 'border-border-input bg-surface'
                  }`}
                  hitSlop={{ top: 6, bottom: 6 }}
                >
                  <Text className={`text-xs font-medium ${isActive ? 'text-brand' : 'text-fg'}`}>
                    {t(roleLabelKey(r))}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Effective permissions */}
        <View className="gap-2 rounded-xl bg-surface-page p-4">
          <Text className="text-[10px] font-semibold uppercase text-fg-muted">
            {t('settings.teamSection.effectivePermissions')}
          </Text>
          {CAPABILITY_GROUPS.map((group) => {
            const granted = group.capabilities.filter((c) => capabilities.includes(c));
            if (granted.length === 0) return null;
            return (
              <View key={group.group} className="gap-1">
                <Text className="text-[10px] font-semibold text-fg">{t(group.labelKey)}</Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {granted.map((c) => (
                    <Badge
                      key={c}
                      label={c.replaceAll('_', ' ')}
                      variant={isHighRisk(c) ? 'warning' : 'neutral'}
                    />
                  ))}
                </View>
              </View>
            );
          })}
          <Text className="mt-1 text-xs text-fg-muted">
            {t('settings.teamSection.effectiveNotice')}
          </Text>
        </View>

        {/* §7.19.1 step 5 — final administrator protection */}
        {!roleGuard.allowed && (
          <Text className="rounded-lg bg-danger px-3 py-2 text-xs text-fg-inverse">
            {t(roleGuard.reasonKey)}
          </Text>
        )}

        <Text className="text-xs text-fg-muted">
          {isInvite
            ? t('settings.teamSection.pendingNotice')
            : t('settings.teamSection.auditNotice')}
        </Text>

        <View className="flex-row flex-wrap gap-2 border-t border-border pt-4">
          {/* PROTO: no invitation is sent and no grant changes; production commits server-side */}
          <Button
            label={isInvite ? 'settings.teamSection.sendInvite' : 'settings.teamSection.saveRole'}
            disabled={!canSubmit}
            onPress={onClose}
          />
          {member && member.status === 'active' && (
            <Button
              label="settings.teamSection.confirmDeactivate"
              variant="danger"
              disabled={!deactivateGuard.allowed}
              onPress={onClose}
            />
          )}
          {member && member.status !== 'active' && (
            <Button
              label="settings.teamSection.confirmReactivate"
              variant="secondary"
              onPress={onClose}
            />
          )}
          {member && (
            <Button label="settings.teamSection.resend" variant="ghost" onPress={() => {}} />
          )}
          <Button label="common.cancel" variant="ghost" onPress={onClose} />
        </View>

        {!deactivateGuard.allowed && member?.status === 'active' && (
          <Text className="text-xs text-danger">{t(deactivateGuard.reasonKey)}</Text>
        )}
      </View>
    </Modal>
  );
}
