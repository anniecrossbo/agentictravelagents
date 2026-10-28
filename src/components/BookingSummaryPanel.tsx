import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

type SummaryRow = {
  key: string;
  label: string;
  /** A resolved string, or custom content such as a status chip. */
  value: React.ReactNode;
};

type BookingSummaryPanelProps = {
  /** Headline figure shown large at the top, e.g. total value. */
  headline: { label: string; value: string };
  rows: readonly SummaryRow[];
};

export function BookingSummaryPanel({ headline, rows }: BookingSummaryPanelProps) {
  const { t } = useTranslation();

  return (
    <View>
      <Text className="text-[10px] font-semibold uppercase text-fg-muted">
        {t('booking.detail.summaryTitle')}
      </Text>
      <View className="mt-3.5 gap-1.25 py-3">
        <Text className="text-[10px] font-semibold uppercase text-fg-muted">{headline.label}</Text>
        <Text className="text-2xl font-semibold text-brand">{headline.value}</Text>
      </View>
      {rows.map((row) => (
        <View key={row.key} className="gap-1.25 border-t border-chip-neutralBg py-3">
          <Text className="text-[10px] font-semibold uppercase text-fg-muted">{row.label}</Text>
          {typeof row.value === 'string' ? (
            <Text className="text-[13px] font-semibold text-fg">{row.value}</Text>
          ) : (
            row.value
          )}
        </View>
      ))}
    </View>
  );
}
