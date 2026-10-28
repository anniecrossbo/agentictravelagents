import { useState } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { TextInput } from '../TextInput';
import { formatMoney } from '../../lib/booking-view';
import {
  obligationStatusBadge,
  availableActions,
  daysUntilDue,
  type SettlementAction,
} from '../../lib/finance-view';
import type { FinanceObligation, SettlementRecord } from '../../lib/types';

type ObligationDetailModalProps = {
  visible: boolean;
  onClose: () => void;
  obligation: FinanceObligation;
  settlements: readonly SettlementRecord[];
  counterpartyName: string;
  bookingHumanId?: string;
  businessDate: string;
  onOpenBooking?: () => void;
};

const ACTION_LABEL: Record<SettlementAction, string> = {
  approve: 'finance.actions.approveSettlement',
  mark_collected: 'finance.actions.markCollected',
  mark_paid: 'finance.actions.markPaid',
  reverse: 'finance.actions.reverse',
};

const ACTION_CONFIRM: Record<SettlementAction, string> = {
  approve: 'finance.confirmApprove',
  mark_collected: 'finance.confirmCollected',
  mark_paid: 'finance.confirmPaid',
  reverse: 'finance.confirmReverse',
};

function Line({
  labelKey,
  value,
  emphasis,
}: {
  labelKey: string;
  value: string;
  emphasis?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-row justify-between py-1">
      <Text className={`text-xs ${emphasis ? 'font-semibold text-fg' : 'text-fg-muted'}`}>
        {t(labelKey)}
      </Text>
      <Text className={`text-xs ${emphasis ? 'font-semibold text-fg' : 'text-fg'}`}>{value}</Text>
    </View>
  );
}

function Fact({ labelKey, value }: { labelKey: string; value: string }) {
  const { t } = useTranslation();
  return (
    <View className="min-w-[150px] flex-1 gap-1">
      <Text className="text-[10px] font-semibold uppercase text-fg-muted">{t(labelKey)}</Text>
      <Text className="text-sm text-fg">{value || t('common.none')}</Text>
    </View>
  );
}

export function ObligationDetailModal({
  visible,
  onClose,
  obligation: o,
  settlements,
  counterpartyName,
  bookingHumanId,
  businessDate,
  onOpenBooking,
}: ObligationDetailModalProps) {
  const { t } = useTranslation();
  const [pending, setPending] = useState<SettlementAction | null>(null);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [reason, setReason] = useState('');

  const actions = availableActions(o);
  const days = daysUntilDue(o.dueDate, businessDate);
  const dueLabel =
    days === 0
      ? t('finance.dueToday')
      : days < 0
        ? t('finance.daysOverdue', { n: Math.abs(days) })
        : t('finance.dueInDays', { n: days });

  // §12.1 reversals require a reason; settlement records require an amount.
  const needsReason = pending === 'reverse';
  const needsAmount = pending === 'mark_collected' || pending === 'mark_paid';
  const canCommit =
    pending != null &&
    (!needsReason || reason.trim().length > 0) &&
    (!needsAmount || Number(amount) > 0);

  const reset = () => {
    setPending(null);
    setAmount('');
    setReference('');
    setReason('');
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={o.humanId}
      subtitle={counterpartyName}
      badge={obligationStatusBadge(o.status)}
    >
      <View className="w-[660px] max-w-full gap-5">
        {/* §12.1 — CrossBo never moves money */}
        <Text className="rounded-lg bg-surface-page px-3 py-2 text-xs text-fg-muted">
          {t('finance.trackingBoundary')}
        </Text>

        <View className="flex-row flex-wrap gap-4">
          <Fact labelKey="finance.typeLabel" value={t(`finance.type.${o.type === 'to_collect' ? 'toCollect' : 'toPay'}`)} />
          <Fact labelKey="finance.counterparty" value={counterpartyName} />
          <Fact labelKey="finance.dueDate" value={`${o.dueDate} · ${dueLabel}`} />
          {bookingHumanId && <Fact labelKey="booking.bookingId" value={bookingHumanId} />}
        </View>

        {/* Calculation lines — §7.14 Obligation Detail */}
        <View className="gap-1 rounded-xl bg-surface-page p-4">
          <Text className="mb-1 text-[10px] font-semibold uppercase text-fg-muted">
            {t('finance.calculationLines')}
          </Text>
          <Line labelKey="finance.grossValue" value={formatMoney(o.grossAmount, o.originalCurrency)} />
          {o.commissionBasis != null && (
            <Line
              labelKey="finance.commissionBasis"
              value={formatMoney(o.commissionBasis, o.originalCurrency)}
            />
          )}
          {o.commissionAmount != null && (
            <Line
              labelKey="finance.commission"
              value={formatMoney(o.commissionAmount, o.originalCurrency)}
            />
          )}
          <Line labelKey="finance.netRevenue" value={formatMoney(o.netAmount, o.originalCurrency)} />
          <View className="my-1 h-px bg-border" />
          <Line
            labelKey={o.type === 'to_collect' ? 'finance.toCollect' : 'finance.toPay'}
            value={formatMoney(o.collectAmount ?? o.payAmount ?? o.netAmount, o.originalCurrency)}
            emphasis
          />
          <Line labelKey="finance.settledAmount" value={formatMoney(o.settledAmount, o.originalCurrency)} />
          <Line
            labelKey="finance.remainingBalance"
            value={formatMoney(o.remainingBalance, o.originalCurrency)}
            emphasis
          />
        </View>

        {/* Currency evidence — §12.3 */}
        {o.reportingCurrency && o.reportingCurrency !== o.originalCurrency && (
          <View className="flex-row flex-wrap gap-4 rounded-lg border border-border p-3">
            <Fact
              labelKey="finance.originalAmount"
              value={formatMoney(o.grossAmount, o.originalCurrency)}
            />
            <Fact
              labelKey="finance.reportingAmount"
              value={
                o.reportingAmount != null
                  ? formatMoney(o.reportingAmount, o.reportingCurrency)
                  : ''
              }
            />
            <Fact labelKey="finance.exchangeRate" value={o.exchangeRate?.toString() ?? ''} />
            <Fact labelKey="finance.rateSource" value={o.exchangeRateSource ?? ''} />
          </View>
        )}

        {o.evidence.length > 0 && (
          <View className="gap-1.5">
            <Text className="text-[10px] font-semibold uppercase text-fg-muted">
              {t('finance.evidence')}
            </Text>
            <View className="flex-row flex-wrap gap-1.5">
              {o.evidence.map((e) => (
                <Badge key={e} label={e} variant="neutral" />
              ))}
            </View>
          </View>
        )}

        {/* Settlement history */}
        <View className="gap-2 border-t border-border pt-4">
          <Text className="text-[10px] font-semibold uppercase text-fg-muted">
            {t('finance.history')}
          </Text>
          {settlements.length === 0 ? (
            <Text className="text-sm text-fg-muted">{t('finance.noHistory')}</Text>
          ) : (
            settlements.map((s) => (
              <View key={s.id} className="flex-row items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-fg">
                    {t(`finance.actions.${s.type === 'collection' ? 'markCollected' : s.type === 'payment' ? 'markPaid' : 'reverse'}`)}
                  </Text>
                  <Text className="text-xs text-fg-muted">
                    {s.date} · {s.reference}
                    {s.reason ? ` · ${s.reason}` : ''}
                  </Text>
                </View>
                <Text className="text-sm font-semibold text-fg">
                  {formatMoney(s.amount, s.currency)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Actions */}
        <View className="gap-3 border-t border-border pt-4">
          {pending && (
            <View className="gap-2">
              {needsAmount && (
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="finance.amountRecorded"
                  keyboardType="numeric"
                />
              )}
              {(needsAmount || pending === 'approve') && (
                <TextInput
                  value={reference}
                  onChangeText={setReference}
                  placeholder="finance.reference"
                />
              )}
              {needsReason && (
                <>
                  <TextInput
                    value={reason}
                    onChangeText={setReason}
                    placeholder="finance.reason"
                    multiline
                  />
                  <Text className="text-xs text-warning">{t('finance.reversalNeedsReason')}</Text>
                </>
              )}
            </View>
          )}

          <View className="flex-row flex-wrap gap-2">
            {pending === null ? (
              <>
                {actions.map((a) => (
                  <Button
                    key={a}
                    label={ACTION_LABEL[a]}
                    variant={a === 'reverse' ? 'danger' : a === 'approve' ? 'primary' : 'secondary'}
                    onPress={() => setPending(a)}
                  />
                ))}
                {onOpenBooking && (
                  <Button label="finance.openBooking" variant="ghost" onPress={onOpenBooking} />
                )}
              </>
            ) : (
              <>
                {/* PROTO: records evidence locally; production commits through the finance service */}
                <Button
                  label={ACTION_CONFIRM[pending]}
                  variant={pending === 'reverse' ? 'danger' : 'primary'}
                  disabled={!canCommit}
                  onPress={() => {
                    reset();
                    onClose();
                  }}
                />
                <Button label="common.cancel" variant="secondary" onPress={reset} />
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
