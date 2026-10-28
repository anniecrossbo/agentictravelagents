import { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MessageSquareText } from 'lucide-react-native';
import { tokens } from '../../theme/tokens';
import { Modal } from '../Modal';
import { SegmentedTabs } from '../SegmentedTabs';
import { SearchBar } from '../SearchBar';
import { AccountSummaryPanel } from '../AccountSummaryPanel';
import { ActionBanner } from '../ActionBanner';
import { DetailFieldCard } from '../DetailFieldCard';
import { BookingRow } from '../BookingRow';
import { RateCodeCard } from '../RateCodeCard';
import { DocumentCard } from '../DocumentCard';
import { formatMoney, bookingStateBadge } from '../../lib/booking-view';
import { shortDate } from '../../lib/dates';
import { buildRateCardView, formatStayRange, matchesQuery } from '../../lib/room-detail';
import {
  documentCardView,
  mostOverdueInvoice,
  revenueWindows,
  type RevenueWindowKey,
} from '../../lib/agent-profile';
import { resolveTab } from '../../lib/routes';
import type {
  Agent,
  Agency,
  BookingRequest,
  Document,
  FinanceObligation,
  RateCode,
  RoomType,
} from '../../lib/types';

/** Whose profile this is: an individual agent (with their agency, if any) or an agency itself. */
export type ProfileAccount = { kind: 'agent'; agent: Agent } | { kind: 'agency' };

type AccountProfileModalProps = {
  visible: boolean;
  onClose: () => void;
  account: ProfileAccount;
  /** The agent's agency, or the agency being viewed. */
  agency?: Agency;
  /** Tab to open on; unknown values fall back to Overview. */
  initialTab?: string;
  bookings: readonly BookingRequest[];
  /** Rate plans this account can sell. */
  rateCodes: readonly RateCode[];
  /** Room type whose price stands in for rates that vary by room ("from" price). */
  rateBasisRoomType?: RoomType;
  documents: readonly Document[];
  /** Receivables owed by the account. */
  obligations: readonly FinanceObligation[];
  businessDate: string;
  reportingCurrency: string;
  guestNameFor: (booking: BookingRequest) => string;
  roomNameFor: (booking: BookingRequest) => string | undefined;
  onOpenBooking?: (booking: BookingRequest) => void;
  onOpenChat?: () => void;
  onSendReminder?: (obligation: FinanceObligation) => void;
};

type TabKey = 'overview' | 'bookings' | 'rates' | 'documents';

const TABS: { key: TabKey; labelKey: string }[] = [
  { key: 'overview', labelKey: 'agent.tabs.overview' },
  { key: 'bookings', labelKey: 'agent.tabs.bookings' },
  { key: 'rates', labelKey: 'agent.tabs.rates' },
  { key: 'documents', labelKey: 'agent.tabs.documents' },
];

const SEARCH_PLACEHOLDER: Partial<Record<TabKey, string>> = {
  bookings: 'agent.profile.searchBookings',
  rates: 'agent.profile.searchRatePlans',
  documents: 'agent.profile.searchDocuments',
};

const PERIOD_LABEL: Record<RevenueWindowKey, string> = {
  currentMonth: 'agency.currentMonth',
  last90Days: 'agency.last90Days',
  ytd: 'agency.ytd',
};

/** Below this width the two panes stack and the whole body scrolls. */
const SPLIT_MIN_WIDTH = 900;
/** Body height: 0.8x the design's 638, matching the room detail. */
const BODY_HEIGHT = 510;

/** Agent and agency profile: contact + revenue sidebar, account tabs. */
export function AccountProfileModal({
  visible,
  onClose,
  account,
  agency,
  initialTab,
  bookings,
  rateCodes,
  rateBasisRoomType,
  documents,
  obligations,
  businessDate,
  reportingCurrency,
  guestNameFor,
  roomNameFor,
  onOpenBooking,
  onOpenChat,
  onSendReminder,
}: AccountProfileModalProps) {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const [tab, setTab] = useState<TabKey>(
    () => resolveTab(initialTab, TABS.map((x) => x.key), 'overview') as TabKey,
  );
  const [queries, setQueries] = useState<Record<TabKey, string>>({
    overview: '',
    bookings: '',
    rates: '',
    documents: '',
  });
  const [remindedId, setRemindedId] = useState<string | null>(null);
  const query = queries[tab];

  const isSplit = width >= SPLIT_MIN_WIDTH;
  const bodyHeight = Math.min(BODY_HEIGHT, height - 160);
  const agent = account.kind === 'agent' ? account.agent : undefined;
  const title = agent ? `${agent.firstName} ${agent.lastName}` : (agency?.name ?? '');
  const email = agent?.email ?? agency?.email ?? '';
  const phone = agent?.phone ?? agency?.phone ?? '';
  const none = t('common.none');

  const revenue = revenueWindows(bookings, businessDate).map((w) => ({
    key: w.key,
    period: t(PERIOD_LABEL[w.key]),
    bookings: t('agent.profile.bookingCount', { count: w.bookingCount }),
    amount: formatMoney(w.total, reportingCurrency),
  }));

  const overdue = mostOverdueInvoice(obligations, businessDate);

  const valueLabel = (group: string, raw: string | undefined) =>
    raw ? t(`agent.values.${group}.${raw}`, { defaultValue: raw }) : none;

  const visibleBookings = useMemo(
    () =>
      bookings.filter((b) =>
        matchesQuery(queries.bookings, [guestNameFor(b), b.humanId, roomNameFor(b)]),
      ),
    [bookings, queries.bookings, guestNameFor, roomNameFor],
  );

  const visibleRates = useMemo(
    () => rateCodes.filter((rc) => matchesQuery(queries.rates, [rc.code, rc.name])),
    [rateCodes, queries.rates],
  );

  const visibleDocuments = useMemo(
    () => documents.filter((d) => matchesQuery(queries.documents, [d.type, d.fileName])),
    [documents, queries.documents],
  );

  const subtitle = !agency
    ? t('agent.independent')
    : t(
        `agent.profile.${account.kind === 'agency' ? 'agencySubtitle' : 'subtitle'}${
          agency.iataNumber ? '' : 'NoIata'
        }`,
        { agency: agency.name, iata: agency.iataNumber, country: agency.country },
      );

  const emptyText = (key: string) => (
    <Text className="py-6 text-center text-sm text-fg-muted">
      {t(query ? 'common.noResults' : key)}
    </Text>
  );

  const tabContent = (
    <View className="gap-4.5">
      {tab !== 'overview' && (
        <SearchBar
          variant="pill"
          value={query}
          onChangeText={(text) => setQueries((q) => ({ ...q, [tab]: text }))}
          placeholder={SEARCH_PLACEHOLDER[tab]}
        />
      )}

      {tab === 'overview' && (
        <>
          <View className="gap-1">
            <Text className="text-lg font-semibold text-fg">
              {t('agent.profile.accountOverview')}
            </Text>
            <Text className="text-xs text-fg-muted">
              {t('agent.profile.accountOverviewSubtitle')}
            </Text>
          </View>

          {overdue && (
            <ActionBanner
              title={t('agent.invoiceOverdue', {
                invoiceId: overdue.obligation.humanId,
                count: overdue.daysOverdue,
              })}
              meta={t('agent.profile.outstandingDue', {
                amount: formatMoney(
                  overdue.obligation.remainingBalance,
                  overdue.obligation.originalCurrency,
                ),
                date: shortDate(overdue.obligation.dueDate),
              })}
              actionLabel={t('agent.sendReminder')}
              onAction={
                onSendReminder
                  ? () => {
                      onSendReminder(overdue.obligation);
                      setRemindedId(overdue.obligation.id);
                    }
                  : undefined
              }
              doneLabel={
                remindedId === overdue.obligation.id ? t('agent.profile.reminderSent') : undefined
              }
            />
          )}

          {agency ? (
            <>
              <View className="gap-3">
                <Text className="text-sm font-semibold text-fg">
                  {t('agent.commercialRelationship')}
                </Text>
                <DetailFieldCard
                  fields={[
                    {
                      label: t('agent.collectionModel'),
                      value: valueLabel('collectionModel', agency.collectionModel),
                    },
                    {
                      label: t('agent.partnershipStatus'),
                      value: valueLabel('partnershipStatus', agency.partnershipStatus),
                    },
                    { label: t('agent.paymentTerms'), value: agency.paymentTerms || none },
                    { label: t('agent.settlementCurrency'), value: agency.settlementCurrency || none },
                  ]}
                />
              </View>

              <View className="gap-3">
                <Text className="text-sm font-semibold text-fg">{t('agent.agreement')}</Text>
                <DetailFieldCard
                  fields={[
                    { label: t('agent.agreementId'), value: agency.agreementId ?? none },
                    {
                      label: t('agent.profile.contractValidity'),
                      value: agency.agreementValidTo
                        ? t('agent.profile.contractValidUntil', {
                            date: shortDate(agency.agreementValidTo),
                          })
                        : none,
                    },
                    {
                      label: t('agent.profile.creditLimit'),
                      value:
                        agency.creditLimit != null
                          ? formatMoney(agency.creditLimit, agency.settlementCurrency)
                          : none,
                    },
                    {
                      label: t('agent.settlementMethod'),
                      value: valueLabel('settlementMethod', agency.settlementMethod),
                    },
                  ]}
                />
              </View>
            </>
          ) : (
            <Text className="text-sm text-fg-muted">{t('agent.profile.noAgency')}</Text>
          )}
        </>
      )}

      {tab === 'bookings' && (
        <View className="gap-2">
          {visibleBookings.map((b) => (
            <BookingRow
              key={b.id}
              guestName={guestNameFor(b)}
              bookingRef={b.humanId}
              guestCount={b.adults + b.children}
              stayDates={formatStayRange(b.checkIn, b.checkOut)}
              amount={formatMoney(b.totalAmount, b.currency)}
              channel={agency?.name ?? t('agent.independent')}
              status={bookingStateBadge(b.state)}
              onPress={onOpenBooking ? () => onOpenBooking(b) : undefined}
            />
          ))}
          {visibleBookings.length === 0 && emptyText('agent.noBookings')}
        </View>
      )}

      {tab === 'rates' && (
        <View className="gap-2">
          {visibleRates.map((rc) => {
            const view = rateBasisRoomType
              ? buildRateCardView(rc, rateBasisRoomType, [])
              : undefined;
            const money = (n: number) => formatMoney(n, view?.currency ?? rc.currency);
            return (
              <RateCodeCard
                key={rc.id}
                code={rc.code}
                name={rc.name}
                price={money(view?.nightly ?? rc.pricePerNight)}
                detail={
                  view?.detail.kind === 'occupancy'
                    ? {
                        kind: 'text',
                        text: t('inventory.roomDetail.occupancyPricing', {
                          adults: view.detail.baseAdults,
                          base: money(view.detail.base),
                          extraAdult: money(view.detail.extraAdult),
                          extraChild: money(view.detail.extraChild),
                        }),
                      }
                    : undefined
                }
                tags={view?.tags ?? []}
              />
            );
          })}
          {visibleRates.length === 0 && emptyText('agent.noRates')}
        </View>
      )}

      {tab === 'documents' && (
        <View className="gap-2">
          {visibleDocuments.map((doc) => {
            const view = documentCardView(doc, businessDate);
            return (
              <DocumentCard
                key={doc.id}
                title={view.title}
                fileLine={t('agent.profile.docFileLine', {
                  fileName: view.fileName,
                  date: view.uploadedOn,
                })}
                status={view.status}
                tags={view.tags}
              />
            );
          })}
          {visibleDocuments.length === 0 && emptyText('agent.noDocuments')}
        </View>
      )}
    </View>
  );

  const summaryPane = (
    <View
      className={`rounded-2xl bg-surface-glass px-5.5 py-4.5 shadow-md ${isSplit ? 'w-[280px]' : 'w-full'}`}
    >
      <AccountSummaryPanel email={email} phone={phone} revenue={revenue} />
    </View>
  );

  const detailHeader = (
    <View className="gap-4">
      <SegmentedTabs
        variant="pill"
        tabs={TABS}
        selected={tab}
        onSelect={(key) => setTab(key as TabKey)}
      />
      <View className="h-px w-full bg-surface" />
    </View>
  );

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      variant="sheet"
      title={title}
      subtitle={subtitle}
      headerActions={
        onOpenChat && (
          <Pressable
            onPress={onOpenChat}
            accessibilityRole="button"
            accessibilityLabel={t('agent.profile.openChat', { name: title })}
            className="h-9 w-9 items-center justify-center rounded-pill bg-brand-10 active:opacity-70"
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <MessageSquareText size={19} color={tokens.color.brand.DEFAULT} />
          </Pressable>
        )
      }
    >
      {isSplit ? (
        <View className="flex-row gap-4" style={{ height: bodyHeight }}>
          {summaryPane}
          <View className="flex-1 gap-4 overflow-hidden rounded-2xl bg-surface-glass px-[26px] py-[21px] shadow-md">
            {detailHeader}
            <ScrollView className="flex-1" showsVerticalScrollIndicator>
              {tabContent}
            </ScrollView>
          </View>
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-4">
          {summaryPane}
          <View className="gap-5 rounded-2xl bg-surface-glass p-4 shadow-md">
            {detailHeader}
            {tabContent}
          </View>
        </ScrollView>
      )}
    </Modal>
  );
}
