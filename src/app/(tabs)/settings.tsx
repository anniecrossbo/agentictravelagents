import { useState, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WorkspaceHeader } from '../../components/WorkspaceHeader';
import { WidgetGrid, WidgetCell } from '../../components/WidgetGrid';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import {
  TeamMemberModal,
  RoleEditorModal,
  DocumentTypeModal,
  VoucherTemplateModal,
} from '../../components/modals';
import type { UserRole } from '../../lib/types';
import { ordinalDate } from '../../lib/dates';
import { useDocuments, useVouchers, useProperty, useBookings } from '../../lib/hooks';
import { users } from '../../mocks/users';
import { tokens } from '../../theme/tokens';

const ROLE_ORDER: UserRole[] = [
  'reservation_manager',
  'revenue_manager',
  'general_manager',
];

const ROLE_KEY_MAP: Record<string, string> = {
  reservation_manager: 'roles.reservationManager',
  revenue_manager: 'roles.revenueManager',
  general_manager: 'roles.generalManager',
};

const STATUS_VARIANT: Record<string, 'positive' | 'warning' | 'neutral'> = {
  active: 'positive',
  inactive: 'neutral',
  pending: 'warning',
};

const STATE_VARIANT: Record<string, 'positive' | 'brand' | 'warning' | 'neutral'> = {
  Default: 'positive',
  ActiveNonDefault: 'brand',
  Draft: 'warning',
  Archived: 'neutral',
  Starter: 'neutral',
};

function Field({ labelKey, value }: { labelKey: string; value: string }) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center gap-3 border-b border-border py-2 last:border-b-0">
      <Text className="w-36 text-[10px] font-semibold uppercase text-fg-muted">
        {t(labelKey)}
      </Text>
      <Text className="flex-1 text-sm text-fg">{value}</Text>
    </View>
  );
}

/**
 * PRD v6 §7.6: the Settings four-by-two grid shows Team at two-by-one,
 * Roles at one-by-two, plus Required Documents and Voucher Templates —
 * all visible at once rather than behind a navigation rail.
 */
export default function SettingsScreen() {
  const { t } = useTranslation();
  const { documentTypes, all: allDocuments } = useDocuments();
  const { templates } = useVouchers();
  const { all: allBookings } = useBookings();
  const property = useProperty();

  const [openMemberId, setOpenMemberId] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [creatingRole, setCreatingRole] = useState(false);
  const [editRole, setEditRole] = useState<UserRole | null>(null);
  const [addingDoc, setAddingDoc] = useState(false);
  const [editDocId, setEditDocId] = useState<string | null>(null);
  const [editTemplateId, setEditTemplateId] = useState<string | null>(null);

  const openMember = users.find((u) => u.id === openMemberId);
  const editDocType = documentTypes.find((d) => d.id === editDocId);
  const editTemplate = templates.find((tpl) => tpl.id === editTemplateId);
  const roleLabelKey = (r: UserRole) => ROLE_KEY_MAP[r] ?? r;

  const roleRows = useMemo(
    () =>
      ROLE_ORDER.map((role) => {
        const members = users.filter((u) => u.role === role);
        const perms = members[0]?.permissions ?? [];
        return {
          role: t(roleLabelKey(role)),
          members: String(members.length),
          permissions: String(perms.filter((p) => p.granted).length),
        };
      }),
    [t],
  );

  const propertyFields = [
    { labelKey: 'settings.propertySection.propertyName', value: property.name },
    { labelKey: 'settings.propertySection.timezone', value: property.timezone },
    { labelKey: 'settings.propertySection.currency', value: property.reportingCurrency },
    { labelKey: 'settings.propertySection.checkInTime', value: property.checkInTime },
    { labelKey: 'settings.propertySection.checkOutTime', value: property.checkOutTime },
    { labelKey: 'settings.propertySection.operaId', value: property.operaPropertyId ?? '—' },
  ];

  return (
    <View className="flex-1 bg-surface-page">
      <WorkspaceHeader businessDate="21 Sep 2026" />

      <View
        className="flex-1"
        style={{
          paddingHorizontal: tokens.size.pageGutter,
          paddingTop: tokens.space['5'],
          paddingBottom: tokens.size.navClearance,
        }}
      >
        <WidgetGrid columns={4}>
          {/* Team — two by one (§7.6) */}
          <WidgetCell
            col={0}
            row={0}
            colSpan={2}
            title="settings.team"
            count={users.length}
            action={
              <Button
                label="settings.teamSection.invite"
                onPress={() => setInviting(true)}
                size="sm"
              />
            }
          >
            <View className="gap-3">
              {users.map((u) => (
                <Pressable
                  key={u.id}
                  onPress={() => setOpenMemberId(u.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${u.firstName} ${u.lastName}`}
                  className="flex-row items-center gap-3 border-b border-border pb-3 active:bg-surface-page last:border-b-0 last:pb-0"
                >
                  <Avatar name={`${u.firstName} ${u.lastName}`} size="md" />
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-fg" numberOfLines={1}>
                      {u.firstName} {u.lastName}
                    </Text>
                    <Text className="text-xs text-fg-muted" numberOfLines={1}>
                      {u.email}
                    </Text>
                  </View>
                  <View className="w-40">
                    <Badge label={roleLabelKey(u.role)} variant="brand" size="sm" />
                  </View>
                  <View className="w-20">
                    <Badge
                      label={`common.${u.status}`}
                      variant={STATUS_VARIANT[u.status] ?? 'neutral'}
                      size="sm"
                    />
                  </View>
                  <View className="w-28">
                    <Text className="text-[10px] text-fg-muted">
                      {t('settings.teamSection.lastActive')}
                    </Text>
                    <Text className="text-xs text-fg">
                      {u.lastAccessAt ? ordinalDate(u.lastAccessAt.slice(0, 10)) : t('common.none')}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </WidgetCell>

          {/* Required Documents */}
          <WidgetCell
            col={2}
            row={0}
            title="settings.requiredDocuments"
            count={documentTypes.length}
            action={
              <Button
                label="settings.documentsSection.addShort"
                onPress={() => setAddingDoc(true)}
                size="sm"
              />
            }
          >
            <View className="gap-2">
              {documentTypes.map((dt) => (
                <Pressable
                  key={dt.id}
                  onPress={() => setEditDocId(dt.id)}
                  accessibilityRole="button"
                  accessibilityLabel={dt.name}
                  className="gap-1 rounded-lg border border-border p-3 active:bg-surface-page"
                >
                  <Text className="text-sm font-semibold text-fg" numberOfLines={1}>
                    {dt.name}
                  </Text>
                  <View className="flex-row flex-wrap items-center gap-1.5">
                    <Badge
                      label={
                        dt.required
                          ? 'settings.documentsSection.metaRequired'
                          : 'settings.documentsSection.metaOptional'
                      }
                      variant={dt.required ? 'brand' : 'neutral'}
                      size="sm"
                    />
                    {dt.requiresReview && (
                      <Badge label="settings.documentsSection.metaReview" variant="warning" size="sm" />
                    )}
                    {!dt.isActive && (
                      <Badge label="settings.documentsSection.metaInactive" variant="neutral" size="sm" />
                    )}
                    <Text className="text-[10px] text-fg-muted">
                      {(dt.maxFileSize / 1_000_000).toFixed(0)} MB
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </WidgetCell>

          {/* Roles — one by two (§7.6) */}
          <WidgetCell
            col={3}
            row={0}
            rowSpan={2}
            title="settings.roles"
            action={
              <Button
                label="settings.rolesSection.createShort"
                onPress={() => setCreatingRole(true)}
                size="sm"
              />
            }
          >
            <View className="gap-2">
              {ROLE_ORDER.map((role, index) => {
                const row = roleRows[index];
                if (!row) return null;
                return (
                  <Pressable
                    key={role}
                    onPress={() => setEditRole(role)}
                    accessibilityRole="button"
                    accessibilityLabel={row.role}
                    className="gap-1 rounded-lg border border-border p-3 active:bg-surface-page"
                  >
                    <Text className="text-sm font-semibold text-fg" numberOfLines={1}>
                      {row.role}
                    </Text>
                    <Text className="text-[10px] text-fg-muted">
                      {t('settings.rolesSection.memberCount', {
                        members: row.members,
                        permissions: row.permissions,
                      })}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </WidgetCell>

          {/* Voucher Templates */}
          <WidgetCell
            col={0}
            row={1}
            title="settings.voucherTemplates"
            count={templates.length}
          >
            <View className="gap-2">
              {templates.map((tpl) => (
                <Pressable
                  key={tpl.id}
                  onPress={() => setEditTemplateId(tpl.id)}
                  accessibilityRole="button"
                  accessibilityLabel={tpl.name}
                  className="gap-1 rounded-lg border border-border p-3 active:bg-surface-page"
                >
                  <View className="flex-row items-center gap-2">
                    <Text className="flex-1 text-sm font-semibold text-fg" numberOfLines={1}>
                      {tpl.name}
                    </Text>
                    <Badge
                      label={`voucher.state.${tpl.state}`}
                      variant={STATE_VARIANT[tpl.state] ?? 'neutral'}
                      size="sm"
                    />
                  </View>
                  <Text className="text-[10px] text-fg-muted">
                    v{tpl.version} · {tpl.supportedLanguages.join(', ')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </WidgetCell>

          {/* Property Preferences */}
          <WidgetCell col={1} row={1} title="settings.propertyPreferences">
            <View>
              {propertyFields.map((f) => (
                <Field key={f.labelKey} labelKey={f.labelKey} value={f.value} />
              ))}
            </View>
          </WidgetCell>

          {/* Integration Status */}
          <WidgetCell col={2} row={1} title="settings.integrationStatus">
            <View className="gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-fg">
                  {t('settings.integration.operaStatus')}
                </Text>
                <Badge label="settings.integration.healthy" variant="positive" size="sm" />
              </View>
              {/* PROTO: integration telemetry is static */}
              <View className="gap-3">
                <Field labelKey="settings.integration.lastSync" value="2 min ago" />
                <Field labelKey="settings.integration.eventLag" value="340ms" />
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-[10px] font-semibold uppercase text-fg-muted">
                  {t('settings.integration.mode')}
                </Text>
                <Badge label="settings.integration.mock" variant="warning" size="sm" />
              </View>
            </View>
          </WidgetCell>
        </WidgetGrid>
      </View>

      <TeamMemberModal
        visible={inviting}
        onClose={() => setInviting(false)}
        allUsers={users}
        roleLabelKey={roleLabelKey}
      />
      {openMember && (
        <TeamMemberModal
          visible
          onClose={() => setOpenMemberId(null)}
          member={openMember}
          allUsers={users}
          roleLabelKey={roleLabelKey}
        />
      )}

      <RoleEditorModal
        visible={creatingRole}
        onClose={() => setCreatingRole(false)}
        allUsers={users}
        roleLabelKey={roleLabelKey}
      />
      {editRole && (
        <RoleEditorModal
          visible
          onClose={() => setEditRole(null)}
          role={editRole}
          roleName={t(roleLabelKey(editRole))}
          allUsers={users}
          roleLabelKey={roleLabelKey}
        />
      )}

      <DocumentTypeModal
        visible={addingDoc}
        onClose={() => setAddingDoc(false)}
        bookings={allBookings}
        documents={allDocuments}
      />
      {editDocType && (
        <DocumentTypeModal
          visible
          onClose={() => setEditDocId(null)}
          documentType={editDocType}
          bookings={allBookings}
          documents={allDocuments}
        />
      )}

      {editTemplate && (
        <VoucherTemplateModal
          visible
          onClose={() => setEditTemplateId(null)}
          template={editTemplate}
          allTemplates={templates}
        />
      )}
    </View>
  );
}
