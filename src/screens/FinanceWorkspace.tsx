import { useMemo, useState, useCallback } from 'react';
import { router } from 'expo-router';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WorkspaceHeader } from '../components/WorkspaceHeader';
import { WidgetGrid, WidgetCell } from '../components/WidgetGrid';
import { SearchBar } from '../components/SearchBar';
import { FilterPills } from '../components/FilterPills';
import { Badge } from '../components/Badge';
import { StatusBadge } from '../components/StatusBadge';
import { LineChart } from '../components/LineChart';
import { BarChart } from '../components/BarChart';
import {
  ObligationDetailModal,
  ImportPreviewModal,
  ExportBuilderModal,
} from '../components/modals';
import { Button } from '../components/Button';
import { useAuth } from '../lib/auth-context';
import {
  useFinance,
  useBookings,
  useAgents,
  useGuests,
  useProperty,
  useDashboardStats,
} from '../lib/hooks';
import {
  buildFinanceStages,
  byDueThenSeverity,
  sumInReportingCurrency,
} from '../lib/finance-view';
import { formatMoney } from '../lib/booking-view';
import { tokens } from '../theme/tokens';
import type { FinanceObligation } from '../lib/types';
import { rememberListState, recallListState } from '../lib/routes';
import { BookingDetailHost } from './BookingDetailHost';

type LedgerFilter = 'all' | 'to_collect' | 'to_pay' | 'overdue' | 'disputed';

const LIST_KEY = 'finance';

type FinanceWorkspaceProps = {
  /** Canonical obligation from the route (§22.2). */
  openObligationId?: string;
};

export function FinanceWorkspace({ openObligationId }: FinanceWorkspaceProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const finance = useFinance();
  const { all: allBookings } = useBookings();
  const agentsHook = useAgents();
  const { byId: guestById } = useGuests();
  const property = useProperty();
  const stats = useDashboardStats();

  const restored = recallListState(LIST_KEY);
  const [query, setQuery] = useState(restored.query ?? '');
  const [filter, setFilter] = useState<LedgerFilter>(
    (restored.filter as LedgerFilter) ?? 'all',
  );

  const openObligationRoute = useCallback(
    (id: string) => {
      rememberListState(LIST_KEY, { query, filter });
      router.push({ pathname: '/(tabs)/finance/[id]', params: { id } });
    },
    [query, filter],
  );

  const closeObligationRoute = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/finance');
  }, []);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [stackedBookingId, setStackedBookingId] = useState<string | null>(null);

  const reporting = property.reportingCurrency;

  const counterpartyName = (o: FinanceObligation): string => {
    if (o.counterpartyType === 'agency') {
      return agentsHook.agencyById(o.counterpartyId)?.name ?? o.counterpartyId;
    }
    const agent = agentsHook.byId(o.counterpartyId);
    if (agent) return `${agent.firstName} ${agent.lastName}`;
    const booking = allBookings.find((b) => b.id === o.bookingId);
    const guest = booking?.guestId ? guestById(booking.guestId) : undefined;
    return guest ? `${guest.firstName} ${guest.lastName}` : o.counterpartyId;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return finance.all.filter((o) => {
      if (filter === 'to_collect' && o.type !== 'to_collect') return false;
      if (filter === 'to_pay' && o.type !== 'to_pay') return false;
      if (filter === 'overdue' && o.status !== 'overdue') return false;
      if (filter === 'disputed' && o.status !== 'disputed') return false;
      if (!q) return true;
      return (
        o.humanId.toLowerCase().includes(q) ||
        counterpartyName(o).toLowerCase().includes(q)
      );
    });
  }, [finance.all, filter, query]);

  const filterOptions = [
    { key: 'all', labelKey: 'finance.filters.all', count: finance.all.length },
    { key: 'to_collect', labelKey: 'finance.filters.toCollect', count: finance.toCollect.length },
    { key: 'to_pay', labelKey: 'finance.filters.toPay', count: finance.toPay.length },
    { key: 'overdue', labelKey: 'finance.filters.overdue', count: finance.overdue.length },
    { key: 'disputed', labelKey: 'finance.filters.disputed', count: finance.disputed.length },
  ];

  const stages = useMemo(
    () =>
      buildFinanceStages(
        finance.all,
        reporting,
        finance.pendingBookingValue,
        finance.pendingBookingCount,
      ),
    [finance, reporting],
  );

  const outstanding = (o: FinanceObligation) =>
    o.remainingBalance > 0 && o.status !== 'written_off';
  const collectList = finance.toCollect
    .filter(outstanding)
    .sort(byDueThenSeverity(property.businessDate));
  const payList = finance.toPay
    .filter(outstanding)
    .sort(byDueThenSeverity(property.businessDate));

  const collectTotal = sumInReportingCurrency(collectList, reporting, (o) => o.remainingBalance);
  const payTotal = sumInReportingCurrency(payList, reporting, (o) => o.remainingBalance);

  const openObligation = openObligationId ? finance.byId(openObligationId) : undefined;

  // PROTO: mock monthly series until the finance service exposes periods
  const revenueLines = [
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

  const agentBars = stats.agentBookingCounts.map((a) => ({ label: a.name, value: a.count }));

  const obligationRow = (o: FinanceObligation) => (
    <Pressable
      key={o.id}
      onPress={() => openObligationRoute(o.id)}
      accessibilityRole="button"
      accessibilityLabel={o.humanId}
      className="flex-row items-center gap-2.5 border-b border-border py-2.5 active:bg-surface-page"
    >
      <View className="flex-1">
        <Text className="text-xs font-semibold text-fg" numberOfLines={1}>
          {counterpartyName(o)}
        </Text>
        <Text className="text-[10px] text-fg-muted" numberOfLines={1}>
          {o.humanId} · {o.dueDate}
        </Text>
      </View>
      <Text className="text-xs font-semibold text-fg">
        {formatMoney(o.remainingBalance, o.originalCurrency)}
      </Text>
    </Pressable>
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
          {/* Obligations Ledger — full-height left widget */}
          <WidgetCell col={0} row={0} rowSpan={2} title="finance.ledger" count={filtered.length}>
            <View className="mb-3 flex-row gap-2">
              <Button
                label="finance.actions.import"
                variant="secondary"
                size="sm"
                onPress={() => setImportOpen(true)}
              />
              <Button
                label="finance.actions.export"
                variant="secondary"
                size="sm"
                onPress={() => setExportOpen(true)}
              />
            </View>
            <View className="mb-3">
              <SearchBar value={query} onChangeText={setQuery} placeholder="common.search" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3"
            >
              <FilterPills
                options={filterOptions}
                selected={filter}
                onSelect={(k) => setFilter(k as LedgerFilter)}
              />
            </ScrollView>
            {filtered.map((o) => (
              <Pressable
                key={o.id}
                onPress={() => openObligationRoute(o.id)}
                accessibilityRole="button"
                accessibilityLabel={o.humanId}
                className="gap-1 border-b border-border py-2.5 active:bg-surface-page"
              >
                <View className="flex-row items-center gap-2">
                  <Text className="flex-1 text-xs font-semibold text-fg" numberOfLines={1}>
                    {counterpartyName(o)}
                  </Text>
                  <StatusBadge status={o.status === 'partially_settled' ? 'partiallySettled' : o.status === 'written_off' ? 'writtenOff' : o.status} type="finance" />
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="flex-1 text-[10px] text-fg-muted" numberOfLines={1}>
                    {o.humanId} · {t(`finance.type.${o.type === 'to_collect' ? 'toCollect' : 'toPay'}`)} · {o.dueDate}
                  </Text>
                  <Text className="text-xs font-semibold text-fg">
                    {formatMoney(o.remainingBalance, o.originalCurrency)}
                  </Text>
                </View>
              </Pressable>
            ))}
            {filtered.length === 0 && (
              <Text className="py-6 text-center text-xs text-fg-muted">
                {t('finance.noObligations')}
              </Text>
            )}
          </WidgetCell>

          {/* Finance Pipeline — combined cell */}
          <WidgetCell col={1} row={0} colSpan={2} title="finance.pipeline">
            <View className="flex-row gap-2.5">
              {stages.map((s) => (
                <View key={s.key} className="flex-1 gap-1 rounded-sm bg-surface-column p-2.5">
                  <Text className="text-[10px] font-medium text-pipeline-label" numberOfLines={2}>
                    {t(s.labelKey)}
                  </Text>
                  <Text className="text-base font-bold text-fg">
                    {formatMoney(s.amount, reporting)}
                  </Text>
                  <Text className="text-[10px] text-fg-muted">{s.count}</Text>
                </View>
              ))}
            </View>
            <Text className="mt-3 text-[10px] text-fg-muted">
              {t('finance.trackingBoundary')}
            </Text>
          </WidgetCell>

          {/* Revenue versus Commission */}
          <WidgetCell col={3} row={0} title="finance.revenueVsCommission">
            <View className="mb-3 flex-row gap-5">
              <View>
                <Text className="text-lg font-bold text-fg">
                  {formatMoney(finance.totalRevenue, reporting)}
                </Text>
                <Text className="text-[10px] text-fg-muted">{t('home.generated')}</Text>
              </View>
              <View>
                <Text className="text-lg font-bold text-fg">
                  {formatMoney(finance.totalCommission, reporting)}
                </Text>
                <Text className="text-[10px] text-fg-muted">{t('home.commission')}</Text>
              </View>
            </View>
            <LineChart lines={revenueLines} xLabels={['1st', '5th', '10th', '15th', '20th']} height={120} />
          </WidgetCell>

          {/* To Collect */}
          <WidgetCell col={1} row={1} title="finance.toCollect" count={collectList.length}>
            <View className="mb-2 flex-row items-end gap-2">
              <Text className="text-xl font-bold text-fg">
                {formatMoney(collectTotal.total, reporting)}
              </Text>
              {collectTotal.unconverted > 0 && (
                <Badge label="common.filter" variant="warning" />
              )}
            </View>
            {collectTotal.unconverted > 0 && (
              <Text className="mb-2 text-[10px] text-warning">
                {t('finance.unconvertedWarning', { count: collectTotal.unconverted })}
              </Text>
            )}
            {collectList.map(obligationRow)}
          </WidgetCell>

          {/* To Pay */}
          <WidgetCell col={2} row={1} title="finance.toPay" count={payList.length}>
            <View className="mb-2 flex-row items-end gap-2">
              <Text className="text-xl font-bold text-fg">
                {formatMoney(payTotal.total, reporting)}
              </Text>
            </View>
            {payTotal.unconverted > 0 && (
              <Text className="mb-2 text-[10px] text-warning">
                {t('finance.unconvertedWarning', { count: payTotal.unconverted })}
              </Text>
            )}
            {payList.map(obligationRow)}
          </WidgetCell>

          {/* Agent Booking Revenue */}
          <WidgetCell col={3} row={1} title="finance.agentBookingRevenue">
            <BarChart data={agentBars} direction="horizontal" showLabels />
          </WidgetCell>
        </WidgetGrid>
      </View>

      <ImportPreviewModal
        visible={importOpen}
        onClose={() => setImportOpen(false)}
        fileName="reconciliation-2026-09-24.csv"
        rows={finance.importRows}
        obligations={finance.all}
        settlements={finance.settlements}
      />

      <ExportBuilderModal
        visible={exportOpen}
        onClose={() => setExportOpen(false)}
        rowCount={filtered.length}
        scopeLabel={t(filterOptions.find((f) => f.key === filter)?.labelKey ?? 'finance.filters.all')}
        reportingCurrency={reporting}
      />

      {openObligation && (
        <ObligationDetailModal
          visible={!stackedBookingId}
          onClose={closeObligationRoute}
          obligation={openObligation}
          settlements={finance.settlementsFor(openObligation.id)}
          counterpartyName={counterpartyName(openObligation)}
          bookingHumanId={allBookings.find((b) => b.id === openObligation.bookingId)?.humanId}
          businessDate={property.businessDate}
          onOpenBooking={() => setStackedBookingId(openObligation.bookingId)}
        />
      )}
      {/* Booking opens over this sheet; the sheet hides until it closes */}
      {stackedBookingId && (
        <BookingDetailHost bookingId={stackedBookingId} onClose={() => setStackedBookingId(null)} />
      )}
    </View>
  );
}
