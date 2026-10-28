import { useState, useMemo, useCallback } from 'react';
import { router } from 'expo-router';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { tokens } from '../theme/tokens';
import { WorkspaceHeader } from '../components/WorkspaceHeader';
import { WidgetGrid, WidgetCell } from '../components/WidgetGrid';
import { SearchBar } from '../components/SearchBar';
import { FilterPills } from '../components/FilterPills';
import { Badge } from '../components/Badge';
import { DirectoryRowCard } from '../components/DirectoryRowCard';
import { ComparisonMetric } from '../components/ComparisonMetric';
import { RankedBarList } from '../components/RankedBarList';
import { ChatPanel } from '../components/ChatPanel';
import { AccountProfileModal } from '../components/modals';
import { BookingDetailHost } from './BookingDetailHost';
import {
  buildAgentConversations,
  buildGuestConversations,
  buildThreadMessages,
} from './dashboards/helpers';
import { useAuth } from '../lib/auth-context';
import { rememberListState, recallListState } from '../lib/routes';
import {
  useAgents,
  useBookings,
  useGuests,
  useAgentOverview,
  useCommunications,
  useInventory,
  useDocuments,
  useFinance,
  useProperty,
} from '../lib/hooks';
import { entryRoomType, ratePlansFor } from '../lib/agent-profile';
import {
  comparisonBar,
  filterDirectoryRows,
  percentChange,
  topSources,
  type DirectoryFilter,
} from '../lib/agent-directory';
import { formatMoney } from '../lib/booking-view';
import { monthName, previousPeriod } from '../lib/dates';


const LIST_KEY = 'agents';

type AgentsWorkspaceProps = {
  /** Agent or agency id from the route — both are canonical here (§22.3). */
  openEntityId?: string;
  /** Addressable tab within the agent profile (§22.2). */
  initialTab?: string;
};

export function AgentsWorkspace({ openEntityId, initialTab }: AgentsWorkspaceProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    all: allAgents,
    agencies,
    bookingsForAgent,
    byId: agentsById,
    agencyById,
  } = useAgents();
  const { all: allBookings } = useBookings();
  const { byId: guestById } = useGuests();
  const inventory = useInventory();
  const documentsHook = useDocuments();
  const finance = useFinance();
  const property = useProperty();

  const openAgent = openEntityId ? agentsById(openEntityId) : undefined;
  const openAgency = openEntityId ? agencyById(openEntityId) : undefined;
  const openAgentAgency = openAgent?.agencyId ? agencyById(openAgent.agencyId) : undefined;
  const profileAgencyId = openAgent ? openAgent.agencyId : openAgency?.id;

  const guestNameFor = (b: (typeof allBookings)[number]) => {
    const g = b.guestId ? guestById(b.guestId) : undefined;
    return g ? `${g.firstName} ${g.lastName}` : b.humanId;
  };
  const { rows: directoryRows, overview } = useAgentOverview();
  const { agentConversations, guestConversations, messages, summaryFor } = useCommunications();

  const [stackedBookingId, setStackedBookingId] = useState<string | null>(null);

  const restored = recallListState(LIST_KEY);
  const [searchQuery, setSearchQuery] = useState(restored.query ?? '');
  const [activeFilter, setActiveFilter] = useState<DirectoryFilter>(
    (restored.filter as DirectoryFilter) ?? 'all',
  );

  const openEntityRoute = useCallback(
    (id: string) => {
      rememberListState(LIST_KEY, { query: searchQuery, filter: activeFilter });
      router.push({ pathname: '/(tabs)/agents/[id]', params: { id } });
    },
    [searchQuery, activeFilter],
  );

  const closeEntityRoute = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/agents');
  }, []);


  const filteredRows = useMemo(
    () => filterDirectoryRows(directoryRows, activeFilter, searchQuery),
    [directoryRows, activeFilter, searchQuery],
  );

  const filterOptions = [
    { key: 'all', labelKey: 'agent.directoryPage.filterAll', count: directoryRows.length },
    {
      key: 'active',
      labelKey: 'agent.directoryPage.filterActive',
      count: directoryRows.filter((r) => r.activeBookings > 0).length,
    },
    {
      key: 'inactive',
      labelKey: 'agent.directoryPage.filterInactive',
      count: directoryRows.filter((r) => r.activeBookings === 0).length,
    },
  ];

  const month = monthName(overview.period);
  const priorMonthShort = monthName(previousPeriod(overview.period)).slice(0, 3);
  const bookingsChange = percentChange(overview.agentBookings);
  const { top: topAgencies, othersCount } = topSources(overview.bookingsBySource, 3);
  const metricRows = [
    {
      key: 'agents',
      metric: overview.activeAgents,
      label: t('agent.directoryPage.activeAgents'),
      format: (n: number) => String(n),
      fillClassName: 'bg-chart-seriesPositive',
    },
    {
      key: 'value',
      metric: overview.averageBookingValue,
      label: t('agent.directoryPage.averageBookingValue'),
      format: (n: number) => formatMoney(n, overview.currency),
      fillClassName: 'bg-chart-seriesWarning',
    },
    {
      key: 'stay',
      metric: overview.averageStayNights,
      label: t('agent.directoryPage.averageStayLength'),
      format: (n: number) => t('agent.directoryPage.nightsValue', { count: n }),
      fillClassName: 'bg-chart-series',
    },
  ];

  const agentConvos = useMemo(
    () =>
      buildAgentConversations(
        agentConversations,
        agentsById,
        agencyById,
        tokens.color.avatar,
        { messages, summaryFor },
      ),
    [agentConversations, agentsById, agencyById, messages, summaryFor],
  );

  const guestConvos = useMemo(
    () =>
      buildGuestConversations(guestConversations, guestById, tokens.color.avatar, {
        messages,
        summaryFor,
      }),
    [guestConversations, guestById, messages, summaryFor],
  );

  const threadMessages = useMemo(
    () => buildThreadMessages([...agentConvos, ...guestConvos], messages),
    [agentConvos, guestConvos, messages],
  );

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
          {/* Chat — full-height left widget */}
          <WidgetCell col={0} row={0} rowSpan={2} scrollable={false}>
            <ChatPanel
              agentConversations={agentConvos}
              guestConversations={guestConvos}
              messagesByThread={threadMessages}
              defaultTab="agents"
            />
          </WidgetCell>

          {/* Agency directory — combined cell, full height */}
          <WidgetCell col={1} row={0} colSpan={2} rowSpan={2} title="agent.title">
            <SearchBar
              variant="pill"
              bordered
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="agent.directoryPage.searchPlaceholder"
            />
            <View className="mt-3 border-b border-border pb-4">
              <FilterPills
                options={filterOptions}
                selected={activeFilter}
                onSelect={(key) => setActiveFilter(key as DirectoryFilter)}
              />
            </View>
            <View className="mt-4 gap-2">
              {filteredRows.map((row) => (
                <DirectoryRowCard
                  key={row.id}
                  name={row.name}
                  subtitle={row.contactName ?? t('agent.directoryPage.independent')}
                  activeBookings={row.activeBookings}
                  inactiveBookings={row.inactiveBookings}
                  revenue={formatMoney(row.revenue, overview.currency)}
                  onPress={() => openEntityRoute(row.id)}
                />
              ))}
              {filteredRows.length === 0 && (
                <Text className="py-8 text-center text-sm text-fg-muted">
                  {t('agent.emptyFiltered')}
                </Text>
              )}
            </View>
          </WidgetCell>

          <WidgetCell
            col={3}
            row={0}
            title="agent.bookingOverview"
            subtitle={t('agent.directoryPage.forPeriod', { month })}
            divider
          >
            <View className="gap-4 pt-4">
              {metricRows.map((m) => {
                const bar = comparisonBar(m.metric);
                return (
                  <ComparisonMetric
                    key={m.key}
                    value={m.format(m.metric.current)}
                    label={m.label}
                    previousLabel={priorMonthShort}
                    fill={bar.fill}
                    marker={bar.marker}
                    fillClassName={m.fillClassName}
                    accessibilityLabel={t('agent.directoryPage.metricSummary', {
                      label: m.label,
                      current: m.format(m.metric.current),
                      previous: m.format(m.metric.previous),
                      previousMonth: monthName(previousPeriod(overview.period)),
                    })}
                  />
                );
              })}
            </View>
          </WidgetCell>

          <WidgetCell
            col={3}
            row={1}
            title={t('agent.directoryPage.bookingsByAgentTitle', { month })}
            divider
          >
            <View className="gap-5 pt-4">
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[32px] font-semibold leading-8 text-fg">
                    {overview.agentBookings.current}
                  </Text>
                  {bookingsChange != null && (
                    <Badge
                      label={t('agent.directoryPage.changeVsLastMonth', {
                        sign: bookingsChange >= 0 ? '+' : '',
                        pct: bookingsChange,
                      })}
                      variant={bookingsChange >= 0 ? 'positive' : 'warning'}
                      size="sm"
                    />
                  )}
                </View>
                <Text className="text-[11px] text-fg-muted">
                  {t('agent.directoryPage.totalViaAgents')}
                </Text>
              </View>
              <RankedBarList
                items={[
                  ...topAgencies.map((s) => ({ key: s.id, label: s.name, value: s.count })),
                  ...(othersCount > 0
                    ? [{ key: 'others', label: t('agent.directoryPage.others'), value: othersCount, muted: true }]
                    : []),
                ]}
              />
            </View>
          </WidgetCell>
        </WidgetGrid>
      </View>

      {(openAgent || openAgency) && (
        <AccountProfileModal
          visible={!stackedBookingId}
          onClose={closeEntityRoute}
          account={openAgent ? { kind: 'agent', agent: openAgent } : { kind: 'agency' }}
          agency={openAgent ? openAgentAgency : openAgency}
          initialTab={initialTab}
          bookings={
            openAgent
              ? bookingsForAgent(openAgent.id)
              : allBookings.filter((b) => {
                  const a = b.agentId ? agentsById(b.agentId) : undefined;
                  return a?.agencyId === openAgency?.id;
                })
          }
          rateCodes={ratePlansFor(
            { agentId: openAgent?.id, agencyId: openAgent ? openAgent.agencyId : openAgency?.id },
            inventory.rateCodes,
            inventory.rateAssignments,
          )}
          rateBasisRoomType={entryRoomType(inventory.roomTypes)}
          documents={profileAgencyId ? documentsHook.byAgency(profileAgencyId) : []}
          obligations={finance.all.filter(
            (o) =>
              (openAgent && o.counterpartyId === openAgent.id) ||
              (profileAgencyId && o.counterpartyId === profileAgencyId),
          )}
          businessDate={property.businessDate}
          reportingCurrency={property.reportingCurrency}
          guestNameFor={guestNameFor}
          roomNameFor={(b) => inventory.roomTypes.find((rt) => rt.id === b.roomTypeId)?.name}
          onOpenBooking={(b) => setStackedBookingId(b.id)}
          // PROTO: closes the profile to reveal the Agents chat panel; real build deep-links to this account's thread
          onOpenChat={closeEntityRoute}
          // PROTO: no message is sent; real build calls the communication service's sendMessage
          onSendReminder={() => {}}
        />
      )}
      {/* Booking opens over this sheet; the sheet hides until it closes */}
      {stackedBookingId && (
        <BookingDetailHost bookingId={stackedBookingId} onClose={() => setStackedBookingId(null)} />
      )}
    </View>
  );
}
