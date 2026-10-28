import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { formatMoney } from '../../lib/booking-view';
import type { RateQuote } from '../../lib/rate-quote';

type RateLookupModalProps = {
  visible: boolean;
  onClose: () => void;
  quotes: readonly RateQuote[];
  checkIn: string;
  checkOut: string;
  onCopyToProposal?: (quote: RateQuote) => void;
};

function QuoteCard({
  quote,
  onCopy,
}: {
  quote: RateQuote;
  onCopy?: (q: RateQuote) => void;
}) {
  const { t } = useTranslation();

  return (
    <View className="gap-3 rounded-xl border border-border p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-fg">{quote.roomTypeName}</Text>
          <Text className="text-xs text-fg-muted">
            {quote.rateCode} · {quote.rateName}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-lg font-bold text-fg">
            {formatMoney(quote.total, quote.currency)}
          </Text>
          <Text className="text-[10px] text-fg-muted">
            {t('inventory.nightsTotal', { count: quote.nights })}
          </Text>
        </View>
      </View>

      {/* Price breakdown */}
      <View className="gap-1 rounded-lg bg-surface-page p-3">
        <Text className="mb-1 text-[10px] font-semibold uppercase text-fg-muted">
          {t('inventory.priceBreakdown')}
        </Text>
        <View className="flex-row justify-between">
          <Text className="text-xs text-fg-muted">{t('inventory.perNight')}</Text>
          <Text className="text-xs text-fg">
            {formatMoney(quote.pricePerNight, quote.currency)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-fg-muted">
            {t('inventory.nightsTotal', { count: quote.nights })}
          </Text>
          <Text className="text-xs text-fg">
            {formatMoney(quote.subtotal, quote.currency)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-fg-muted">{t('booking.taxes')}</Text>
          <Text className="text-xs text-fg">
            {formatMoney(quote.taxAmount, quote.currency)}
          </Text>
        </View>
        <View className="mt-1 flex-row justify-between border-t border-border pt-1">
          <Text className="text-xs font-semibold text-fg">{t('booking.totalValue')}</Text>
          <Text className="text-xs font-semibold text-fg">
            {formatMoney(quote.total, quote.currency)}
          </Text>
        </View>
      </View>

      {/* Commission + restrictions */}
      <View className="flex-row flex-wrap gap-4">
        <View className="min-w-[160px] flex-1 gap-1">
          <Text className="text-[10px] font-semibold uppercase text-fg-muted">
            {t('inventory.commissionTreatment')}
          </Text>
          <Text className="text-xs text-fg">
            {quote.isCommissionable && quote.commissionAmount != null
              ? `${Math.round((quote.commissionRate ?? 0) * 100)}% · ${formatMoney(quote.commissionAmount, quote.currency)}`
              : t('common.none')}
          </Text>
        </View>
        <View className="min-w-[160px] flex-1 gap-1">
          <Text className="text-[10px] font-semibold uppercase text-fg-muted">
            {t('booking.cancellationPolicy')}
          </Text>
          <Text className="text-xs text-fg">{quote.cancellationPolicy}</Text>
        </View>
      </View>

      {quote.restrictions.length > 0 && (
        <View className="gap-1">
          <Text className="text-[10px] font-semibold uppercase text-fg-muted">
            {t('inventory.restrictions')}
          </Text>
          <View className="flex-row flex-wrap gap-1.5">
            {quote.restrictions.map((r) => (
              <Badge key={r} label={r} variant="neutral" />
            ))}
          </View>
        </View>
      )}

      {onCopy && (
        <Button
          label="inventory.copyToProposal"
          variant="secondary"
          size="sm"
          onPress={() => onCopy(quote)}
        />
      )}
    </View>
  );
}

export function RateLookupModal({
  visible,
  onClose,
  quotes,
  checkIn,
  checkOut,
  onCopyToProposal,
}: RateLookupModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="inventory.rateLookupResults"
      subtitle={`${checkIn} → ${checkOut}`}
    >
      <View className="w-[680px] max-w-full gap-4">
        {/* PRD 7.17.1: copying never holds or guarantees a rate */}
        <Text className="rounded-lg bg-warning-bg px-3 py-2 text-xs text-warning">
          {t('inventory.noHoldNotice')}
        </Text>

        {quotes.length === 0 ? (
          <Text className="py-6 text-center text-sm text-fg-muted">
            {t('inventory.noRatesFound')}
          </Text>
        ) : (
          quotes.map((q) => (
            <QuoteCard
              key={`${q.roomTypeId}-${q.rateCodeId}`}
              quote={q}
              onCopy={onCopyToProposal}
            />
          ))
        )}
      </View>
    </Modal>
  );
}
