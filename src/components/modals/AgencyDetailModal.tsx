import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { SegmentedTabs } from '../SegmentedTabs';
import { StatusBadge } from '../StatusBadge';
import { formatMoney } from '../../lib/booking-view';
import { sumInReportingCurrency } from '../../lib/finance-view';
import { countryName } from '../../lib/countries';
import type {
  Agency,
  Agent,
  BookingRequest,
  Document,
  FinanceObligation,
} from '../../lib/types';

type AgencyDetailModalProps = {
  visible: boolean;
  onClose: () => void;
  agency: Agency;
  members: readonly Agent[];
  bookings: readonly BookingRequest[];
  documents: readonly Document[];
  obligations: readonly FinanceObligation[];
  reportingCurrency: string;
  guestNameFor: (booking: BookingRequest) => string;
  onOpenAgent?: (agent: Agent) => void;
};

const TABS = [
  { key: 'overview', labelKey: 'agency.tabs.overview' },
  { key: 'members', labelKey: 'agency.tabs.members' },
  { key: 'bookings', labelKey: 'agency.tabs.bookings' },
  { key: 'documents', labelKey: 'agency.tabs.documents' },
];

function Field({ labelKey, value }: { labelKey: string; value: string }) {
  const { t } = useTranslation();
  return (
    <View className="min-w-[150px] flex-1 gap-1">
      <Text className="text-[10px] font-semibold uppercase text-fg-muted">{t(labelKey)}</Text>
      <Text className="text-sm text-fg">{value || t('common.none')}</Text>
    </View>
  );
}

export function AgencyDetailModal({
  visible,
  onClose,
  agency,
  members,
  bookings,
  documents,
  obligations,
  reportingCurrency,
  guestNameFor,
  onOpenAgent,
}: AgencyDetailModalProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState('overview');

  const bookingValue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const outstanding = sumInReportingCurrency(
    obligations.filter((o) => o.remainingBalance > 0 && o.status !== 'written_off'),
    reportingCurrency,
    (o) => o.remainingBalance,
  );

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={agency.name}
      subtitle="agency.travelAgency"
      badge={{
        label: `agent.status.${agency.status}`,
        variant: agency.status === 'active' ? 'positive' : 'neutral',
      }}
    >
      <View className="w-[720px] max-w-full gap-5">
        <SegmentedTabs tabs={TABS} selected={tab} onSelect={setTab} />

        {tab === 'overview' && (
          <View className="gap-4">
            <View className="flex-row flex-wrap gap-4">
              <Field labelKey="agency.iata" value={agency.iataNumber ?? ''} />
              <Field labelKey="agency.country" value={countryName(agency.country)} />
              <Field labelKey="agent.email" value={agency.email} />
            </View>
            <View className="flex-row flex-wrap gap-4">
              <Field labelKey="agent.partnershipStatus" value={agency.partnershipStatus} />
              <Field labelKey="agent.paymentTerms" value={agency.paymentTerms} />
              <Field labelKey="agent.collectionModel" value={agency.collectionModel} />
            </View>
            <View className="flex-row flex-wrap gap-4">
              <Field labelKey="agent.settlementCurrency" value={agency.settlementCurrency} />
              <Field labelKey="agent.settlementMethod" value={agency.settlementMethod ?? ''} />
              <Field
                labelKey="agency.creditLimit"
                value={
                  agency.creditLimit != null
                    ? formatMoney(agency.creditLimit, agency.settlementCurrency)
                    : ''
                }
              />
            </View>

            {/* Finance summary — §22.3 lists it among an agency's required sections */}
            <View className="gap-2 border-t border-border pt-4">
              <Text className="text-[10px] font-semibold uppercase text-fg-muted">
                {t('agency.financeSummary')}
              </Text>
              <View className="flex-row flex-wrap gap-3">
                <View className="min-w-[150px] flex-1 gap-1 rounded-lg bg-surface-page p-3">
                  <Text className="text-[10px] font-semibold uppercase text-fg-muted">
                    {t('agency.totalBookingValue')}
                  </Text>
                  <Text className="text-base font-bold text-fg">
                    {formatMoney(bookingValue, reportingCurrency)}
                  </Text>
                </View>
                <View className="min-w-[150px] flex-1 gap-1 rounded-lg bg-surface-page p-3">
                  <Text className="text-[10px] font-semibold uppercase text-fg-muted">
                    {t('agency.outstanding')}
                  </Text>
                  <Text className="text-base font-bold text-fg">
                    {formatMoney(outstanding.total, reportingCurrency)}
                  </Text>
                </View>
                <View className="min-w-[150px] flex-1 gap-1 rounded-lg bg-surface-page p-3">
                  <Text className="text-[10px] font-semibold uppercase text-fg-muted">
                    {t('agency.members')}
                  </Text>
                  <Text className="text-base font-bold text-fg">{members.length}</Text>
                </View>
              </View>
              {outstanding.unconverted > 0 && (
                <Text className="text-[10px] text-warning">
                  {t('finance.unconvertedWarning', { count: outstanding.unconverted })}
                </Text>
              )}
            </View>
          </View>
        )}

        {tab === 'members' && (
          <View className="gap-2">
            {members.map((m) => (
              <Pressable
                key={m.id}
                onPress={() => onOpenAgent?.(m)}
                accessibilityRole="button"
                accessibilityLabel={`${m.firstName} ${m.lastName}`}
                className="flex-row items-center gap-3 rounded-lg border border-border px-3 py-2.5 active:bg-surface-page"
              >
                <Avatar name={`${m.firstName} ${m.lastName}`} size="sm" />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-fg">
                    {m.firstName} {m.lastName}
                  </Text>
                  <Text className="text-xs text-fg-muted">{m.email}</Text>
                </View>
                <Badge
                  label={`agent.status.${m.status}`}
                  variant={m.status === 'active' ? 'positive' : 'neutral'}
                />
              </Pressable>
            ))}
            {members.length === 0 && (
              <Text className="py-6 text-center text-sm text-fg-muted">
                {t('agency.noMembers')}
              </Text>
            )}
          </View>
        )}

        {tab === 'bookings' && (
          <View className="gap-2">
            {bookings.map((b) => (
              <View
                key={b.id}
                className="flex-row items-center gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <View className="flex-1">
                  <Text className="text-sm font-medium text-fg">{guestNameFor(b)}</Text>
                  <Text className="text-xs text-fg-muted">
                    {b.checkIn} → {b.checkOut} · {b.humanId}
                  </Text>
                </View>
                <Text className="text-sm font-semibold text-fg">
                  {formatMoney(b.totalAmount, b.currency)}
                </Text>
                <StatusBadge
                  status={b.state.charAt(0).toLowerCase() + b.state.slice(1)}
                  type="booking"
                />
              </View>
            ))}
            {bookings.length === 0 && (
              <Text className="py-6 text-center text-sm text-fg-muted">
                {t('agent.noBookings')}
              </Text>
            )}
          </View>
        )}

        {tab === 'documents' && (
          <View className="gap-2">
            {documents.map((doc) => (
              <View
                key={doc.id}
                className="flex-row items-center gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <View className="flex-1">
                  <Text className="text-sm font-medium text-fg">{doc.type}</Text>
                  <Text className="text-xs text-fg-muted">
                    {doc.fileName}
                    {doc.expiryDate ? ` · ${doc.expiryDate}` : ''}
                  </Text>
                </View>
                <StatusBadge
                  status={doc.status === 'under_review' ? 'underReview' : doc.status}
                  type="document"
                />
              </View>
            ))}
            {documents.length === 0 && (
              <Text className="py-6 text-center text-sm text-fg-muted">
                {t('agent.noDocuments')}
              </Text>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}
