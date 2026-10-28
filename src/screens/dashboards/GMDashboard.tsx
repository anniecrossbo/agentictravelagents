import { useState, useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { SearchBar } from '../../components/SearchBar';
import { FilterPills } from '../../components/FilterPills';
import { DataTable } from '../../components/DataTable';
import { ChatPanel } from '../../components/ChatPanel';
import { LineChart } from '../../components/LineChart';
import { WidgetGrid, WidgetCell } from '../../components/WidgetGrid';
import { tokens } from '../../theme/tokens';
import {
  useBookings,
  useGuests,
  useAgents,
  useFinance,
  useCommunications,
  useDashboardStats,
} from '../../lib/hooks';
import type { FinanceObligation } from '../../lib/types';
import {
  buildAgentConversations,
  buildGuestConversations,
  buildThreadMessages,
} from './helpers';

const PAYMENT_FILTERS = [
  { key: 'all', labelKey: 'agent.title', count: 2846 },
  { key: 'active', labelKey: 'home.activeBookings', count: 31 },
  { key: 'inactive', labelKey: 'agent.status.inactive', count: 7 },
];

const PAYMENT_COLUMNS = [
  { key: 'date', headerKey: 'common.date', width: 100 },
  { key: 'agent', headerKey: 'booking.agent' },
];

export function GMDashboard() {
  const { t } = useTranslation();
  const { all: allBookings } = useBookings();
  const guestsHook = useGuests();
  const agentsHook = useAgents();
  const finance = useFinance();
  const comms = useCommunications();
  const stats = useDashboardStats();

  const [paymentFilter, setPaymentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const agentConvos = useMemo(
    () =>
      buildAgentConversations(
        comms.agentConversations,
        agentsHook.byId,
        agentsHook.agencyById,
        tokens.color.avatar,
        { messages: comms.messages, summaryFor: comms.summaryFor },
      ),
    [comms.agentConversations, agentsHook],
  );

  const guestConvos = useMemo(
    () => buildGuestConversations(comms.guestConversations, guestsHook.byId, tokens.color.avatar, {
        messages: comms.messages,
        summaryFor: comms.summaryFor,
      }),
    [comms.guestConversations, guestsHook],
  );

  const threadMessages = useMemo(
    () => buildThreadMessages([...agentConvos, ...guestConvos], comms.messages),
    [agentConvos, guestConvos, comms.messages],
  );

  // PROTO: mock monthly series
  const revenueChartLines = [
    {
      key: 'revenue',
      labelKey: 'home.revenueGenerated',
      color: tokens.color.brand.DEFAULT,
      data: [4000, 6500, 8200, 7800, 9500, 11000, 12000, 10500, 11500, 12500, 13000, 12000],
    },
    {
      key: 'commission',
      labelKey: 'home.commission',
      color: tokens.color.warning.DEFAULT,
      data: [400, 650, 820, 780, 950, 1100, 1200, 1050, 1150, 1250, 1300, 1200],
    },
  ];
  const revenueXLabels = ['1st', '5th', '10th', '15th', '20th'];

  const paymentRows = finance.all.slice(0, 10).map((ob) => {
    const booking = allBookings.find((b) => b.id === ob.bookingId);
    const agent = booking?.agentId ? agentsHook.byId(booking.agentId) : undefined;
    const agency = agent?.agencyId ? agentsHook.agencyById(agent.agencyId) : undefined;
    return {
      date: booking?.createdAt?.slice(5, 10).replace('-', ' ') ?? '',
      agent: agency?.name ?? (agent ? `${agent.firstName} ${agent.lastName}` : t('agent.independent')),
    };
  });

  const obligationRow = (ob: FinanceObligation, amount: number) => {
    const booking = allBookings.find((b) => b.id === ob.bookingId);
    const guest = booking?.guestId ? guestsHook.byId(booking.guestId) : undefined;
    const guestName = guest ? `${guest.firstName} ${guest.lastName}` : ob.humanId;

    return (
      <View key={ob.id} className="flex-row items-center gap-2.5">
        <Avatar name={guestName} size="sm" />
        <View className="flex-1">
          <Text className="text-sm font-medium text-fg" numberOfLines={1}>
            {guestName}
          </Text>
          <Text className="text-xs text-fg-muted" numberOfLines={1}>
            {booking?.checkIn} – {booking?.checkOut}
          </Text>
        </View>
        <Text className="text-sm font-semibold text-fg">€{amount.toLocaleString()}</Text>
      </View>
    );
  };

  return (
    <WidgetGrid columns={4}>
      {/* Payments — full-height left widget */}
      <WidgetCell col={0} row={0} rowSpan={2} title="home.allPayments">
        <View className="mb-3">
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="common.search"
          />
        </View>
        <View className="mb-2.5">
          <FilterPills
            options={PAYMENT_FILTERS}
            selected={paymentFilter}
            onSelect={setPaymentFilter}
          />
        </View>
        <DataTable columns={PAYMENT_COLUMNS} data={paymentRows} />
      </WidgetCell>

      {/* Revenue vs Commission — combined cell */}
      <WidgetCell col={1} row={0} colSpan={2} title="home.revenueVsCommission">
        <Text className="mb-1 text-xs text-fg-muted">
          {t('home.forPeriod', { period: 'September' })}
        </Text>
        <View className="mb-3 flex-row gap-6">
          <View>
            <Text className="text-xl font-bold text-fg">$12000</Text>
            <Text className="text-[10px] text-fg-muted">{t('home.generated')}</Text>
          </View>
          <View>
            <Text className="text-xl font-bold text-fg">$1200</Text>
            <Text className="text-[10px] text-fg-muted">{t('home.commission')}</Text>
          </View>
        </View>
        <LineChart lines={revenueChartLines} xLabels={revenueXLabels} height={140} />
      </WidgetCell>

      {/* Chat — full-height right widget */}
      <WidgetCell col={3} row={0} rowSpan={2} scrollable={false}>
        <ChatPanel
          agentConversations={agentConvos}
          guestConversations={guestConvos}
          messagesByThread={threadMessages}
          defaultTab="guests"
        />
      </WidgetCell>

      <WidgetCell col={1} row={1} title="home.toPay">
        <View className="gap-2.5">
          {finance.toPay
            .slice(0, 5)
            .map((ob) => obligationRow(ob, ob.payAmount ?? ob.commissionAmount ?? 0))}
        </View>
      </WidgetCell>

      <WidgetCell col={2} row={1} title="home.toCollect">
        <View className="gap-2.5">
          {finance.toCollect
            .slice(0, 5)
            .map((ob) => obligationRow(ob, ob.collectAmount ?? ob.grossAmount))}
        </View>
      </WidgetCell>
    </WidgetGrid>
  );
}
