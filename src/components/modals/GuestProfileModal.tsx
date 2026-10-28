import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { Badge } from '../Badge';
import { StatusBadge } from '../StatusBadge';
import { countryName } from '../../lib/countries';
import { formatMoney } from '../../lib/booking-view';
import type { BookingRequest } from '../../lib/types';
import type { MockGuest } from '../../mocks';

type GuestProfileModalProps = {
  visible: boolean;
  onClose: () => void;
  guest: MockGuest;
  stays: readonly BookingRequest[];
  /** Present when the guest has been matched to an OPERA profile. */
  operaProfileId?: string;
  /** Opens a prior stay's booking. */
  onOpenStay?: (booking: BookingRequest) => void;
};

function Field({ labelKey, value }: { labelKey: string; value: string }) {
  const { t } = useTranslation();
  return (
    <View className="min-w-[150px] flex-1 gap-1">
      <Text className="text-[10px] font-semibold uppercase text-fg-muted">{t(labelKey)}</Text>
      <Text className="text-sm text-fg">{value || t('common.none')}</Text>
    </View>
  );
}

export function GuestProfileModal({
  visible,
  onClose,
  guest,
  stays,
  operaProfileId,
  onOpenStay,
}: GuestProfileModalProps) {
  const { t } = useTranslation();
  const fullName = `${guest.firstName} ${guest.lastName}`;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={fullName}
      subtitle="guest.profile"
      badge={guest.isVip ? { label: 'guest.vip', variant: 'vip' } : undefined}
    >
      <View className="w-[640px] max-w-full gap-5">
        <View className="gap-3">
          <Text className="text-[10px] font-semibold uppercase text-fg-muted">
            {t('guest.contact')}
          </Text>
          <View className="flex-row flex-wrap gap-4">
            <Field labelKey="guest.email" value={guest.email} />
            <Field labelKey="guest.phone" value={guest.phone} />
          </View>
        </View>

        <View className="gap-3 border-t border-border pt-4">
          <Text className="text-[10px] font-semibold uppercase text-fg-muted">
            {t('guest.identity')}
          </Text>
          <View className="flex-row flex-wrap gap-4">
            <Field labelKey="guest.nationality" value={countryName(guest.nationality)} />
            <Field labelKey="guest.passport" value={guest.passportNumber ?? ''} />
            <Field labelKey="guest.dateOfBirth" value={guest.dateOfBirth ?? ''} />
          </View>
        </View>

        <View className="gap-2 border-t border-border pt-4">
          <Text className="text-[10px] font-semibold uppercase text-fg-muted">
            {t('guest.operaProfile')}
          </Text>
          <View className="flex-row items-center gap-2">
            <Badge
              label={operaProfileId ? 'guest.matched' : 'guest.unmatched'}
              variant={operaProfileId ? 'positive' : 'neutral'}
            />
            {operaProfileId && <Text className="text-xs text-fg-muted">{operaProfileId}</Text>}
          </View>
          {guest.loyaltyTier && (
            <View className="mt-1 flex-row items-center gap-2">
              <Text className="text-xs text-fg-muted">{t('guest.loyaltyTier')}</Text>
              <Badge label={guest.loyaltyTier} variant="brand" />
            </View>
          )}
        </View>

        <View className="gap-2 border-t border-border pt-4">
          <Text className="text-[10px] font-semibold uppercase text-fg-muted">
            {t('guest.priorStays')}
          </Text>
          {stays.length === 0 ? (
            <Text className="text-sm text-fg-muted">{t('guest.noPriorStays')}</Text>
          ) : (
            stays.map((s) => (
              <Pressable
                key={s.id}
                onPress={onOpenStay ? () => onOpenStay(s) : undefined}
                disabled={!onOpenStay}
                accessibilityRole="button"
                accessibilityLabel={s.humanId}
                className="flex-row items-center gap-3 rounded-lg border border-border px-3 py-2.5 active:bg-surface-page"
              >
                <View className="flex-1">
                  <Text className="text-sm font-medium text-fg">{s.humanId}</Text>
                  <Text className="text-xs text-fg-muted">
                    {s.checkIn} → {s.checkOut}
                  </Text>
                </View>
                <Text className="text-sm font-semibold text-fg">
                  {formatMoney(s.totalAmount, s.currency)}
                </Text>
                <StatusBadge
                  status={s.state.charAt(0).toLowerCase() + s.state.slice(1)}
                  type="booking"
                />
              </Pressable>
            ))
          )}
        </View>
      </View>
    </Modal>
  );
}
