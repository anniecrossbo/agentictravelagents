import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowUp, Star } from 'lucide-react';
import { useOverlay } from '@/app/useOverlay';
import type { RoomType, Supplier, SupplierItem } from '@/contracts';
import { useSupplier } from '@/data/hooks';
import { availabilityLevel, nextDays } from '@/lib/availability';
import { money } from '@/lib/format';
import { Popup } from '../Popup';
import { Scene } from '../Scene';
import { Button, Chip, CloseButton, Dot, EmptyNote, SelectChip, SoftTabs, cx } from '../Primitives';
import { useToast } from '../Toast';

type TabKey = 'first' | 'second' | 'bookings' | 'info';

const TAB_KEYS: Record<Supplier['category'], [string, string, string, string]> = {
  hotel: ['supplierTab.rooms', 'supplierTab.experiences', 'supplierTab.bookings', 'supplierTab.hotelInfo'],
  experience: ['supplierTab.activities', 'supplierTab.departures', 'supplierTab.bookings', 'supplierTab.supplierInfo'],
  transfer: ['supplierTab.vehicles', 'supplierTab.routes', 'supplierTab.bookings', 'supplierTab.supplierInfo'],
  flight: ['supplierTab.activities', 'supplierTab.departures', 'supplierTab.bookings', 'supplierTab.supplierInfo'],
  cruise: ['supplierTab.activities', 'supplierTab.departures', 'supplierTab.bookings', 'supplierTab.supplierInfo'],
  dmc: ['supplierTab.activities', 'supplierTab.departures', 'supplierTab.bookings', 'supplierTab.supplierInfo'],
};

const LEVEL_CLASS = { available: 'bg-positive-soft text-positive', low: 'bg-warning-soft text-warning', soldOut: 'bg-danger-soft text-danger' } as const;
const LEVEL_TONE = { available: 'positive', low: 'warning', soldOut: 'danger' } as const;
const LEVEL_KEY = { available: 'supplier.legendAvailable', low: 'supplier.legendLow', soldOut: 'supplier.legendSoldOut' } as const;

function AvailabilityPanel({ room }: { room: RoomType }) {
  const { t } = useTranslation();
  const days = nextDays(new Date(), 14);
  return (
    <div className="border-t border-border px-4 py-4">
      <h4 className="text-sm font-semibold text-fg-subtle">{t('supplier.availabilityTitle')}</h4>
      <ul className="mt-3 grid gap-1 overflow-x-auto" style={{ gridTemplateColumns: 'repeat(14, minmax(2.5rem, 1fr))' }}>
        {days.map((d, i) => {
          const left = room.inventory[i] ?? 0;
          const level = availabilityLevel(left);
          return (
            <li key={d.key} aria-label={t('supplier.dayLeft', { weekday: d.weekday, day: d.day, month: d.month, count: left })} className="flex flex-col items-center gap-1.5">
              <span aria-hidden className="text-sm text-fg-muted">
                {d.day}
              </span>
              <span aria-hidden className={cx('flex h-8 min-w-9 items-center justify-center rounded-pill px-2 text-sm font-semibold', LEVEL_CLASS[level])}>
                {left}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 flex flex-wrap gap-2">
        {(['available', 'low', 'soldOut'] as const).map((l) => (
          <Chip key={l} tone={LEVEL_TONE[l]}>
            {t(LEVEL_KEY[l])}
          </Chip>
        ))}
      </p>
    </div>
  );
}

function RatesList({ room }: { room: RoomType }) {
  const { t } = useTranslation();
  const toast = useToast();
  return (
    <ul className="divide-y divide-border border-t border-border bg-surface-tint">
      {room.rates.map((r) => (
        <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              {r.name}
              <Chip tone={r.tone}>{r.code}</Chip>
            </span>
            <span className="block text-xs text-fg-muted">{r.terms}</span>
          </span>
          <span className="text-right">
            <span className="block text-lg font-semibold">{money(r.netRate)}</span>
            <span className="block text-xs font-semibold text-positive">{t('supplier.commissionPct', { percent: r.commission })}</span>
          </span>
          <button type="button" onClick={() => toast(t('supplier.protoQuoteRate', { room: room.name, rate: r.name }))} className="min-h-11 px-2 text-sm font-semibold text-brand hover:underline">
            {t('supplier.quoteRate')}
          </button>
        </li>
      ))}
    </ul>
  );
}

function RoomCard({ room }: { room: RoomType }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [showAvailability, setShowAvailability] = useState(false);
  const [showRates, setShowRates] = useState(false);
  const margin = room.suggested - room.netRate;
  const marginPct = Math.round((margin / room.suggested) * 100);
  const soldOut = room.availability === 'Sold out';
  return (
    <li className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
      <div className="flex max-sm:flex-col">
        <div className="relative sm:w-44 sm:shrink-0">
          <Scene kind={room.scene} className="h-32 w-full sm:h-full" />
          <Chip tone={soldOut ? 'danger' : room.availability === 'Available' ? 'positive' : 'warning'} className="absolute left-2 top-2">
            {room.availability}
          </Chip>
        </div>
        <div className="min-w-0 flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold">{room.name}</h3>
            <span className="text-[0.65rem] text-fg-muted">{room.code}</span>
          </div>
          <p className="text-xs text-fg-muted">{room.sleeps}</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {room.amenities.map((a) => (
              <li key={a} className="rounded-chip bg-surface-sunken px-2 py-0.5 text-[0.7rem] text-fg-subtle">
                {a}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-fg-subtle">{room.blurb}</p>
          <p className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-2xl font-semibold">{money(room.netRate)}</span>
            <span className="text-xs text-fg-muted">{t('supplier.perNight')}</span>
            <Chip tone="brand">{t('supplier.netRate')}</Chip>
            <Chip tone="positive">{t('supplier.bestAvailable')}</Chip>
            <Chip>BAR</Chip>
          </p>
          <p className="text-xs text-fg-muted">{t('supplier.suggested', { sell: money(room.suggested), margin: money(margin), percent: marginPct })}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button size="sm" disabled={soldOut} onClick={() => toast(t('supplier.protoQuote', { room: room.name }))}>
              {t('supplier.quoteThis')}
            </Button>
            <Button variant="secondary" size="sm" aria-expanded={showAvailability} onClick={() => setShowAvailability((v) => !v)}>
              {t(showAvailability ? 'supplier.hideAvailability' : 'supplier.checkAvailability')}
            </Button>
          </div>
        </div>
      </div>
      {showAvailability && <AvailabilityPanel room={room} />}
      {room.rates.length > 0 && (
        <>
          <button type="button" aria-expanded={showRates} onClick={() => setShowRates((v) => !v)} className="flex min-h-12 w-full items-center gap-2 border-t border-border px-4 text-sm font-semibold text-brand hover:bg-surface-tint">
            {t(showRates ? 'supplier.hideRates' : 'supplier.moreRates', { count: room.rates.length })}
            {showRates ? <ArrowUp size={14} aria-hidden /> : <ArrowDown size={14} aria-hidden />}
          </button>
          {showRates && <RatesList room={room} />}
        </>
      )}
    </li>
  );
}

function ItemCard({ item }: { item: SupplierItem }) {
  return (
    <li className="flex overflow-hidden rounded-card border border-border bg-surface shadow-card max-sm:flex-col">
      <Scene kind={item.scene} className="h-28 w-full sm:h-auto sm:w-40 sm:shrink-0" />
      <div className="min-w-0 flex-1 p-4">
        <h3 className="text-base font-semibold">{item.name}</h3>
        <p className="text-xs text-fg-muted">{item.meta}</p>
        <p className="mt-1.5 text-sm text-fg-subtle">{item.blurb}</p>
        <p className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">{item.price}</span>
          <Chip>{item.note}</Chip>
        </p>
      </div>
    </li>
  );
}

export function SupplierPopup({ id, tab }: { id: string; tab: string }) {
  const { t } = useTranslation();
  const overlay = useOverlay();
  const toast = useToast();
  const supplier = useSupplier(id);
  const [dates, setDates] = useState('12–16 Oct');
  const [guests, setGuests] = useState('2');
  if (!supplier) return null;

  const active = (['first', 'second', 'bookings', 'info'].includes(tab) ? tab : 'first') as TabKey;
  const keys = TAB_KEYS[supplier.category];
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'first', label: t(keys[0]) },
    { key: 'second', label: t(keys[1]) },
    { key: 'bookings', label: t(keys[2]) },
    { key: 'info', label: t(keys[3]) },
  ];
  const isHotel = supplier.category === 'hotel';
  const firstItems = isHotel ? [] : supplier.catalogue;

  return (
    <Popup label={supplier.name} onClose={overlay.close} tone="canvas">
      <header className="flex flex-wrap items-start gap-3 px-6 pb-3 pt-5">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">{supplier.name}</h1>
          <p className="flex flex-wrap items-center gap-1.5 text-xs text-fg-muted">
            {supplier.place.split(' · ')[1] ?? supplier.place}
            {supplier.rating !== null && (
              <>
                <span aria-hidden>·</span>
                <Star size={12} aria-hidden className="fill-warning-dot text-warning-dot" />
                {supplier.rating}
              </>
            )}
            <span aria-hidden>·</span>
            {supplier.facts[0]?.value} {supplier.facts[0]?.label.toLowerCase()}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => toast(t('supplier.protoMessage', { name: supplier.name }))}>
          {t('supplier.message')}
        </Button>
        <Button size="sm" onClick={() => toast(t('supplier.protoBook', { name: supplier.name }))}>
          {t('supplier.bookForMe')}
        </Button>
        <CloseButton onClick={overlay.close} />
      </header>
      <div className="grid min-h-0 flex-1 gap-4 px-6 pb-6 lg:h-[36rem] lg:grid-cols-[17rem_1fr]">
        <aside className="overflow-y-auto rounded-card border border-border bg-surface p-4">
          <Scene kind={isHotel ? 'room' : supplier.catalogue[0]?.scene ?? 'city'} className="h-32 w-full rounded-tile" />
          <p className="mt-3 text-xs text-fg-muted">{supplier.phone}</p>
          <p className="break-all text-xs text-fg-muted">{supplier.email}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {supplier.badges.map((b) => (
              <Chip key={b.label} tone={b.tone}>
                {b.label}
              </Chip>
            ))}
          </div>
          <dl className="mt-4 divide-y divide-border border-t border-border text-sm">
            {supplier.facts.map((f) => (
              <div key={f.label} className="flex justify-between py-2">
                <dt className="text-fg-muted">{f.label}</dt>
                <dd className={f.label.startsWith('Earned') ? 'font-semibold text-brand' : 'font-semibold'}>{f.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
        <div className="flex min-h-0 flex-col gap-3 overflow-hidden rounded-card border border-border bg-surface p-4">
          <SoftTabs options={tabs} value={active} onChange={(k) => overlay.swap({ kind: 'supplier', id, tab: k })} />
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {active === 'first' && isHotel && (
              <>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-fg-muted">{t('supplier.roomSummary', { count: supplier.rooms.length, dates, guests })}</p>
                  <div className="flex gap-2">
                    <SelectChip
                      label={t('supplier.dates')}
                      value={dates}
                      onChange={setDates}
                      options={['12–16 Oct', '20–24 Oct', '3–7 Nov'].map((d) => ({ key: d, label: d }))}
                    />
                    <SelectChip
                      label={t('supplier.guests')}
                      value={guests}
                      onChange={setGuests}
                      options={['1', '2', '3', '4'].map((g) => ({ key: g, label: t('supplier.guestsOption', { count: Number(g) }) }))}
                    />
                  </div>
                </div>
                <ul className="space-y-3">
                  {supplier.rooms.map((r) => (
                    <RoomCard key={r.id} room={r} />
                  ))}
                </ul>
              </>
            )}
            {active === 'first' && !isHotel && (
              <ul className="space-y-3">
                {firstItems.map((i) => (
                  <ItemCard key={i.id} item={i} />
                ))}
                {firstItems.length === 0 && <EmptyNote>{t('supplier.noItems')}</EmptyNote>}
              </ul>
            )}
            {active === 'second' && (
              <ul className="space-y-3">
                {supplier.secondary.map((i) => (
                  <ItemCard key={i.id} item={i} />
                ))}
                {supplier.secondary.length === 0 && <EmptyNote>{t('supplier.noItems')}</EmptyNote>}
              </ul>
            )}
            {active === 'bookings' && (
              <ul className="space-y-2">
                {supplier.bookings.map((b) => (
                  <li key={b.id} className="flex items-center gap-3 rounded-tile border border-border p-3.5">
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{b.customer}</span>
                      <span className="block text-xs text-fg-muted">{`${b.detail} · ${b.dates}`}</span>
                    </span>
                    <span className="text-sm font-semibold">{b.amount}</span>
                    <Chip tone={b.tone}>{b.status}</Chip>
                  </li>
                ))}
                {supplier.bookings.length === 0 && <EmptyNote>{t('supplier.noBookings')}</EmptyNote>}
              </ul>
            )}
            {active === 'info' && (
              <dl className="divide-y divide-border">
                {supplier.info.map((f) => (
                  <div key={f.label} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr]">
                    <dt className="text-xs text-fg-muted">{f.label}</dt>
                    <dd className="text-sm">{f.value}</dd>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-3 text-xs text-fg-muted">
                  <Dot tone={supplier.statusTone} />
                  {supplier.status}
                </div>
              </dl>
            )}
          </div>
        </div>
      </div>
    </Popup>
  );
}
