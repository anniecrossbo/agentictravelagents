import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { formatMoney } from '../../lib/booking-view';
import { canGenerateVoucher } from '../../lib/voucher-rules';
import type { BookingRequest, VoucherTemplate, VoucherInstance } from '../../lib/types';

type Recipient = 'agent' | 'guest';
type Channel = 'email' | 'chat';

type GenerateVoucherModalProps = {
  visible: boolean;
  onClose: () => void;
  booking: BookingRequest;
  guestName: string;
  roomTypeName?: string;
  templates: readonly VoucherTemplate[];
  existingVoucher?: VoucherInstance;
  onGenerate?: (templateId: string, recipient: Recipient, channel: Channel) => void;
};

function OptionRow<T extends string>({
  labelKey,
  options,
  selected,
  onSelect,
}: {
  labelKey: string;
  options: { key: T; labelKey: string }[];
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
              accessibilityLabel={t(o.labelKey)}
              accessibilityState={{ selected: isActive }}
              className={`rounded-pill border px-3 py-1.5 ${
                isActive ? 'border-brand bg-brand-light' : 'border-border-input bg-surface'
              }`}
              hitSlop={{ top: 6, bottom: 6 }}
            >
              <Text className={`text-xs font-medium ${isActive ? 'text-brand' : 'text-fg'}`}>
                {t(o.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function GenerateVoucherModal({
  visible,
  onClose,
  booking,
  guestName,
  roomTypeName,
  templates,
  existingVoucher,
  onGenerate,
}: GenerateVoucherModalProps) {
  const { t } = useTranslation();

  const selectable = templates.filter(
    (tpl) => tpl.state === 'Default' || tpl.state === 'ActiveNonDefault',
  );
  const defaultTemplate = selectable.find((tpl) => tpl.isDefault) ?? selectable[0];

  const [templateId, setTemplateId] = useState(defaultTemplate?.id ?? '');
  // Every booking comes from an agent, so the agent is the default recipient
  const [recipient, setRecipient] = useState<Recipient>('agent');
  const [channel, setChannel] = useState<Channel>('email');

  const gate = canGenerateVoucher(booking);
  const template = selectable.find((tpl) => tpl.id === templateId);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="voucher.generateFor"
      subtitle={booking.humanId}
    >
      <View className="w-[600px] max-w-full gap-5">
        {/* PRD 11.3: a voucher may only be issued from a reservation confirmed in OPERA */}
        {!gate.allowed ? (
          <View className="gap-2 rounded-lg bg-warning-bg p-3">
            <Text className="text-sm font-semibold text-warning">
              {t(gate.reasonKey)}
            </Text>
          </View>
        ) : (
          <>
            {existingVoucher && (
              <View className="gap-1 rounded-lg bg-warning-bg p-3">
                <Text className="text-xs font-semibold text-warning">
                  {t('voucher.existingVoucher')}
                </Text>
                <Text className="text-xs text-warning">{t('voucher.willSupersede')}</Text>
              </View>
            )}

            {/* Reservation snapshot the voucher will freeze */}
            <View className="gap-2 rounded-lg bg-surface-page p-3">
              <Text className="text-[10px] font-semibold uppercase text-fg-muted">
                {t('voucher.reservationVersion')}
              </Text>
              <View className="flex-row flex-wrap gap-x-6 gap-y-1">
                <Text className="text-sm text-fg">{guestName}</Text>
                <Text className="text-sm text-fg-muted">
                  {booking.checkIn} → {booking.checkOut}
                </Text>
                <Text className="text-sm text-fg-muted">{roomTypeName ?? booking.roomTypeId}</Text>
                <Text className="text-sm font-semibold text-fg">
                  {formatMoney(booking.totalAmount, booking.currency)}
                </Text>
              </View>
              <Text className="text-xs text-fg-muted">
                {t('booking.operaId')}: {booking.operaConfirmationId}
              </Text>
            </View>

            {/* Template choice — default preselected per PRD 11.2 */}
            <View className="gap-1.5">
              <Text className="text-[10px] font-semibold uppercase text-fg-muted">
                {t('voucher.selectTemplate')}
              </Text>
              {selectable.map((tpl) => {
                const isActive = tpl.id === templateId;
                return (
                  <Pressable
                    key={tpl.id}
                    onPress={() => setTemplateId(tpl.id)}
                    accessibilityRole="radio"
                    accessibilityLabel={tpl.name}
                    accessibilityState={{ selected: isActive }}
                    className={`flex-row items-center gap-2 rounded-lg border px-3 py-2.5 ${
                      isActive ? 'border-brand bg-brand-light' : 'border-border bg-surface'
                    }`}
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-fg">{tpl.name}</Text>
                      <Text className="text-xs text-fg-muted">
                        v{tpl.version} · {tpl.supportedLanguages.join(', ')}
                      </Text>
                    </View>
                    {tpl.isDefault && (
                      <Badge label="settings.vouchersSection.default" variant="positive" />
                    )}
                  </Pressable>
                );
              })}
            </View>

            <OptionRow
              labelKey="voucher.selectRecipient"
              selected={recipient}
              onSelect={setRecipient}
              options={[
                { key: 'agent' as Recipient, labelKey: 'voucher.recipientAgent' },
                { key: 'guest' as Recipient, labelKey: 'voucher.recipientGuest' },
              ].filter((o) => o.key !== 'agent' || booking.agentId != null)}
            />

            <OptionRow
              labelKey="communication.title"
              selected={channel}
              onSelect={setChannel}
              options={[
                { key: 'email' as Channel, labelKey: 'voucher.channelEmail' },
                { key: 'chat' as Channel, labelKey: 'voucher.channelChat' },
              ]}
            />

            <View className="flex-row gap-2 border-t border-border pt-4">
              {/* PROTO: generation and delivery are faked; production snapshots the
                  reservation + template version and queues a real send. */}
              <Button
                label="voucher.confirmGenerate"
                disabled={!template}
                onPress={() => {
                  if (template) onGenerate?.(template.id, recipient, channel);
                  onClose();
                }}
              />
              <Button label="voucher.previewVoucher" variant="secondary" onPress={() => {}} />
              <Button label="common.cancel" variant="ghost" onPress={onClose} />
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}
