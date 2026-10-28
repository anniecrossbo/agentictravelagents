import { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Mail,
  Phone,
  MessageSquare,
  Search,
  ChevronRight,
  Pencil,
  Trash2,
} from 'lucide-react-native';
import { tokens } from '../../theme/tokens';
import { Modal } from '../Modal';
import { Badge } from '../Badge';
import { SegmentedTabs } from '../SegmentedTabs';
import type {
  CustomerDetail,
  CustomerBookingHistoryRow,
  CustomerDocument,
  CustomerTravelPreference,
} from '../../contracts/agent-portal-dashboard';

// PROTO: all data from mocks — real implementation calls the agent portal API

const AVATAR_COLOR_MAP: Record<string, string> = {
  'bg-avatar-red': tokens.color.avatar.red,
  'bg-avatar-green': tokens.color.avatar.green,
  'bg-avatar-grey': tokens.color.avatar.grey,
  'bg-avatar-brown': tokens.color.avatar.brown,
  'bg-avatar-teal': tokens.color.avatar.teal,
  'bg-avatar-ink': tokens.color.avatar.ink,
};

function avatarHex(className: string): string {
  return AVATAR_COLOR_MAP[className] ?? tokens.color.avatar.green;
}

const TABS = [
  { key: 'overview', labelKey: 'agentPortal.customer.overview' },
  { key: 'bookings', labelKey: 'agentPortal.customer.bookings' },
  { key: 'travelProfile', labelKey: 'agentPortal.customer.travelProfile' },
  { key: 'documents', labelKey: 'agentPortal.customer.documents' },
];

const BOOKING_STATUS_VARIANT: Record<string, 'positive' | 'warning' | 'danger' | 'neutral'> = {
  confirmed: 'positive',
  pending: 'warning',
  cancelled: 'danger',
  checked_out: 'neutral',
};

const BOOKING_STATUS_KEY: Record<string, string> = {
  confirmed: 'agentPortal.customer.confirmed',
  pending: 'agentPortal.customer.pending',
  cancelled: 'agentPortal.customer.cancelled',
  checked_out: 'agentPortal.customer.checkedOut',
};

// ── Left sidebar ─────────────────────────────────────────────────────────────

function StatCard({
  labelKey,
  bookings,
  amount,
  currency,
}: {
  labelKey: string;
  bookings: number;
  amount: number;
  currency: string;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center justify-between rounded-xl border border-border-light px-4 py-3.5">
      <View className="gap-0.5">
        <Text className="text-[10px] font-bold uppercase text-fg-muted">{t(labelKey)}</Text>
        <Text className="text-xs text-fg-muted">
          {t('agentPortal.customer.bookingsCount', { count: bookings })}
        </Text>
      </View>
      <Text className="text-lg font-bold text-brand">
        {currency === 'EUR' ? '€' : '$'}{amount.toLocaleString()}
      </Text>
    </View>
  );
}

function Sidebar({ customer }: { customer: CustomerDetail }) {
  return (
    <View className="w-[280px] gap-4 border-r border-border-light pr-6">
      <View className="gap-2">
        <View className="flex-row items-center gap-2">
          <Mail size={14} color={tokens.color.fg.muted} />
          <Text className="text-sm text-fg">{customer.email}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Phone size={14} color={tokens.color.fg.muted} />
          <Text className="text-sm text-fg-muted">{customer.phone}</Text>
        </View>
      </View>

      <View className="h-px bg-border-light" />

      <View className="gap-2.5">
        <StatCard
          labelKey="agentPortal.customer.currentMonth"
          bookings={customer.currentMonthBookings}
          amount={customer.currentMonthValue}
          currency={customer.currency}
        />
        <StatCard
          labelKey="agentPortal.customer.last90Days"
          bookings={customer.last90DaysBookings}
          amount={customer.last90DaysValue}
          currency={customer.currency}
        />
        <StatCard
          labelKey="agentPortal.customer.ytd"
          bookings={customer.ytdBookings}
          amount={customer.ytdValue}
          currency={customer.currency}
        />
      </View>
    </View>
  );
}

// ── Overview tab ─────────────────────────────────────────────────────────────

function Field({ labelKey, value }: { labelKey: string; value: string }) {
  const { t } = useTranslation();
  return (
    <View className="min-w-[150px] flex-1 gap-1">
      <Text className="text-[10px] font-semibold uppercase text-fg-muted">{t(labelKey)}</Text>
      <Text className="text-sm text-fg">{value}</Text>
    </View>
  );
}

function OverviewTab({ customer }: { customer: CustomerDetail }) {
  const { t } = useTranslation();
  const totalBookings = customer.ytdBookings;
  const totalValue = customer.ytdValue;

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerClassName="gap-6 pb-4">
      {/* Notes callout */}
      {customer.notes && (
        <View className="rounded-xl border-l-[3px] border-brand bg-brand-05 px-4 py-3.5">
          <Text className="text-[11px] font-bold uppercase text-brand">
            {t('agentPortal.customer.notes')}
          </Text>
          <Text className="mt-1 text-sm leading-5 text-fg">{customer.notes}</Text>
        </View>
      )}

      {/* Travel Preferences grid */}
      <View>
        <Text className="mb-3 text-base font-semibold text-fg">
          {t('agentPortal.customer.travelPreferences')}
        </Text>
        <View className="rounded-xl bg-surface-page p-4">
          <View className="flex-row flex-wrap gap-y-4">
            {customer.travelPreferences.map((pref) => (
              <View key={pref.key} className="w-1/2">
                <Field labelKey={pref.labelKey} value={pref.value} />
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Special Requirements */}
      {customer.specialRequirements && (
        <View>
          <Text className="mb-2 text-base font-semibold text-fg">
            {t('agentPortal.customer.specialRequirements')}
          </Text>
          <View className="rounded-xl bg-surface-page p-4">
            <Text className="text-sm leading-5 text-fg">{customer.specialRequirements}</Text>
          </View>
        </View>
      )}

      {/* Loyalty Programs */}
      {customer.loyaltyPrograms && customer.loyaltyPrograms.length > 0 && (
        <View>
          <Text className="mb-2 text-base font-semibold text-fg">
            {t('agentPortal.customer.loyaltyPrograms')}
          </Text>
          <View className="rounded-xl bg-surface-page p-4">
            <View className="flex-row flex-wrap gap-2">
              {customer.loyaltyPrograms.map((program) => (
                <View key={program} className="rounded-pill bg-brand-10 px-3 py-1.5">
                  <Text className="text-xs font-medium text-brand">{program}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ── Bookings tab ─────────────────────────────────────────────────────────────

function BookingRow({ booking }: { booking: CustomerBookingHistoryRow }) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center gap-3 border-b border-border-light px-4 py-3.5">
      <View
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: avatarHex(booking.avatarColor) }}
      >
        <Text className="text-[10px] font-bold text-fg-inverse">{booking.initials}</Text>
      </View>
      <View className="w-[140px]">
        <Text className="text-sm font-semibold text-fg" numberOfLines={1}>{booking.guestName}</Text>
        <Text className="text-[11px] text-fg-muted">
          {booking.bookingRef} · {t('agentPortal.customer.guests', { count: booking.guestCount })}
        </Text>
      </View>
      <Text className="w-[100px] text-sm text-fg">{booking.dates}</Text>
      <Text className="w-[70px] text-sm font-semibold text-fg">
        €{booking.amount.toLocaleString()}
      </Text>
      <Text className="flex-1 text-sm text-fg">{booking.hotelName}</Text>
      <View className="w-[100px]">
        <Badge
          label={BOOKING_STATUS_KEY[booking.status] ?? ''}
          variant={BOOKING_STATUS_VARIANT[booking.status] ?? 'neutral'}
          size="sm"
        />
      </View>
      <ChevronRight size={16} color={tokens.color.fg.muted} />
    </View>
  );
}

function BookingsTab({ customer }: { customer: CustomerDetail }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customer.bookings;
    return customer.bookings.filter(
      (b) =>
        b.guestName.toLowerCase().includes(q) ||
        b.bookingRef.toLowerCase().includes(q) ||
        b.hotelName.toLowerCase().includes(q),
    );
  }, [query, customer.bookings]);

  return (
    <View className="flex-1 gap-3">
      <View className="flex-row items-center gap-2 rounded-xl bg-surface-page px-4 py-3">
        <Search size={16} color={tokens.color.fg.placeholder} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('agentPortal.customer.searchBookings')}
          placeholderTextColor={tokens.color.fg.placeholder}
          accessibilityLabel={t('agentPortal.customer.searchBookings')}
          className="flex-1 text-sm text-fg"
        />
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {filtered.map((booking) => (
          <BookingRow key={booking.id} booking={booking} />
        ))}
      </ScrollView>
    </View>
  );
}

// ── Travel Profile tab ───────────────────────────────────────────────────────

function TravelProfileTab({ customer }: { customer: CustomerDetail }) {
  const { t } = useTranslation();

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerClassName="gap-6 pb-4">
      <View>
        <Text className="mb-3 text-base font-semibold text-fg">
          {t('agentPortal.customer.travelPreferences')}
        </Text>
        <View className="rounded-xl bg-surface-page p-4">
          <View className="flex-row flex-wrap gap-y-4">
            {customer.travelPreferences.map((pref) => (
              <View key={pref.key} className="w-1/2">
                <Field labelKey={pref.labelKey} value={pref.value} />
              </View>
            ))}
          </View>
        </View>
      </View>

      {customer.specialRequirements && (
        <View>
          <Text className="mb-2 text-base font-semibold text-fg">
            {t('agentPortal.customer.specialRequirements')}
          </Text>
          <View className="rounded-xl bg-surface-page p-4">
            <Text className="text-sm leading-5 text-fg">{customer.specialRequirements}</Text>
          </View>
        </View>
      )}

      {customer.loyaltyPrograms && customer.loyaltyPrograms.length > 0 && (
        <View>
          <Text className="mb-2 text-base font-semibold text-fg">
            {t('agentPortal.customer.loyaltyPrograms')}
          </Text>
          <View className="rounded-xl bg-surface-page p-4">
            <View className="flex-row flex-wrap gap-2">
              {customer.loyaltyPrograms.map((program) => (
                <View key={program} className="rounded-pill bg-brand-10 px-3 py-1.5">
                  <Text className="text-xs font-medium text-brand">{program}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ── Documents tab ────────────────────────────────────────────────────────────

function DocumentRow({ doc }: { doc: CustomerDocument }) {
  const { t } = useTranslation();
  const statusVariant = doc.statusTone === 'positive' ? 'positive'
    : doc.statusTone === 'warning' ? 'warning'
    : doc.statusTone === 'danger' ? 'danger'
    : 'neutral';

  return (
    <View className="gap-2 rounded-xl border border-border-light bg-surface px-4 py-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 gap-1">
          <Text className="text-sm font-semibold text-fg">{doc.name}</Text>
          <Text className="text-xs text-fg-muted">
            {doc.fileName} · Uploaded {doc.uploadedDate}
          </Text>
        </View>
        <Badge label={doc.statusKey} variant={statusVariant} size="sm" />
      </View>
      <View className="flex-row items-center gap-2">
        <View className="rounded-md bg-surface-page px-2 py-1">
          <Text className="text-[11px] font-medium text-fg-muted">
            {doc.fileType} · {doc.fileSize}
          </Text>
        </View>
        {doc.expiryInfo && (
          <View className={`rounded-md px-2 py-1 ${
            doc.expiryTone === 'danger' ? 'bg-danger-bg' :
            doc.expiryTone === 'warning' ? 'bg-warning-bg' :
            'bg-surface-page'
          }`}>
            <Text className={`text-[11px] font-medium ${
              doc.expiryTone === 'danger' ? 'text-danger' :
              doc.expiryTone === 'warning' ? 'text-warning' :
              doc.expiryTone === 'positive' ? 'text-positive' :
              'text-fg-muted'
            }`}>
              {doc.expiryInfo}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function DocumentsTab({ customer }: { customer: CustomerDetail }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customer.documents;
    return customer.documents.filter((d) => d.name.toLowerCase().includes(q) || d.fileName.toLowerCase().includes(q));
  }, [query, customer.documents]);

  return (
    <View className="flex-1 gap-3">
      <View className="flex-row items-center gap-2 rounded-xl bg-surface-page px-4 py-3">
        <Search size={16} color={tokens.color.fg.placeholder} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('agentPortal.customer.searchDocuments')}
          placeholderTextColor={tokens.color.fg.placeholder}
          accessibilityLabel={t('agentPortal.customer.searchDocuments')}
          className="flex-1 text-sm text-fg"
        />
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerClassName="gap-3">
        {filtered.map((doc) => (
          <DocumentRow key={doc.id} doc={doc} />
        ))}
      </ScrollView>
    </View>
  );
}

// ── Main Modal ───────────────────────────────────────────────────────────────

type CustomerDetailModalProps = {
  visible: boolean;
  onClose: () => void;
  customer: CustomerDetail;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function CustomerDetailModal({
  visible,
  onClose,
  customer,
  onEdit,
  onDelete,
}: CustomerDetailModalProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    onDelete?.();
  }, [onDelete]);

  const headerActions = (
    <>
      {onDelete && (
        <Pressable
          onPress={() => setShowDeleteConfirm(true)}
          accessibilityRole="button"
          accessibilityLabel={t('agentPortal.customer.deleteCustomer')}
          className="h-9 w-9 items-center justify-center rounded-pill bg-danger-bg active:opacity-70"
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Trash2 size={16} color={tokens.color.danger.DEFAULT} />
        </Pressable>
      )}
      {onEdit && (
        <Pressable
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={t('agentPortal.customer.editCustomer')}
          className="h-9 w-9 items-center justify-center rounded-pill bg-brand-10 active:opacity-70"
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Pencil size={16} color={tokens.color.brand.DEFAULT} />
        </Pressable>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('communication.openChat')}
        className="h-9 w-9 items-center justify-center rounded-pill bg-brand-10 active:opacity-70"
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      >
        <MessageSquare size={16} color={tokens.color.brand.DEFAULT} />
      </Pressable>
    </>
  );

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={customer.name}
      subtitle={customer.subtitle}
      badge={customer.isVip ? { label: 'guest.vip', variant: 'vip' } : undefined}
      variant="sheet"
      headerActions={headerActions}
    >
      {showDeleteConfirm && (
        <View className="mb-4 flex-row items-center justify-between rounded-xl border border-danger bg-danger-bg px-4 py-3">
          <Text className="flex-1 text-sm text-danger">
            {t('agentPortal.customer.deleteConfirm')}
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setShowDeleteConfirm(false)}
              accessibilityRole="button"
              accessibilityLabel={t('agentPortal.customer.deleteCancel')}
              className="rounded-lg border border-border px-4 py-2 active:opacity-70"
            >
              <Text className="text-xs font-semibold text-fg">
                {t('agentPortal.customer.deleteCancel')}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleDelete}
              accessibilityRole="button"
              accessibilityLabel={t('common.delete')}
              className="rounded-lg bg-danger px-4 py-2 active:opacity-80"
            >
              <Text className="text-xs font-semibold text-fg-inverse">
                {t('common.delete')}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      <View className="h-[520px] flex-row gap-6">
        <Sidebar customer={customer} />

        <View className="flex-1 gap-4">
          <SegmentedTabs tabs={TABS} selected={tab} onSelect={setTab} />

          {tab === 'overview' && <OverviewTab customer={customer} />}
          {tab === 'bookings' && <BookingsTab customer={customer} />}
          {tab === 'travelProfile' && <TravelProfileTab customer={customer} />}
          {tab === 'documents' && <DocumentsTab customer={customer} />}
        </View>
      </View>
    </Modal>
  );
}
