import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOverlay } from '@/app/useOverlay';
import type { ItineraryItem } from '@/contracts';
import { useAgents, useItinerary } from '@/data/hooks';
import { Popup } from '../Popup';
import { Portrait } from '../Portrait';
import { Scene } from '../Scene';
import { BackButton, Button, Chip, CloseButton, Eyebrow, Segmented, cx } from '../Primitives';
import { useToast } from '../Toast';

const kindClass: Record<ItineraryItem['kind'], string> = {
  flight: 'bg-info-soft text-info',
  transfer: 'bg-surface-sunken text-fg-subtle',
  stay: 'bg-brand-soft text-brand',
  experience: 'bg-warning-soft text-warning',
};

function ItemRow({ item }: { item: ItineraryItem }) {
  const { t } = useTranslation();
  return (
    <li className="flex gap-4 py-3">
      {item.scene && <Scene kind={item.scene} className="hidden h-14 w-24 shrink-0 rounded-tile sm:block" />}
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2">
          <span className={cx('rounded-chip px-2 py-0.5 text-[0.7rem] font-medium', kindClass[item.kind])}>{t(`itinerary.kind.${item.kind}`)}</span>
          <span className="text-sm font-semibold">{item.title}</span>
        </p>
        <p className="mt-0.5 text-xs text-fg-muted">{item.detail}</p>
        <p className="text-xs font-medium text-brand">{item.estimate}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="text-sm font-semibold">{item.price}</span>
        <Chip tone={item.tone}>{item.status}</Chip>
      </div>
    </li>
  );
}

export function ItineraryPopup({ id }: { id: string }) {
  const { t } = useTranslation();
  const overlay = useOverlay();
  const toast = useToast();
  const itinerary = useItinerary(id);
  const agents = useAgents() ?? [];
  const [optionId, setOptionId] = useState<string | null>(null);
  const designer = agents.find((a) => a.id === 'designer');
  if (!itinerary) return null;
  const option = itinerary.options.find((o) => o.id === optionId) ?? itinerary.options[0];

  return (
    <Popup label={itinerary.title} onClose={overlay.close} width="max-w-[60rem]">
      <header className="flex flex-wrap items-center gap-4 px-6 pb-3 pt-5">
        {overlay.hasFrom && <BackButton onClick={overlay.back} />}
        <Scene kind={itinerary.scene} className="hidden h-14 w-20 shrink-0 rounded-tile sm:block" />
        <div className="min-w-0 flex-1">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold">
            {itinerary.title}
            <Chip>{itinerary.status}</Chip>
          </h1>
          <p className="text-xs text-fg-muted">{itinerary.meta}</p>
        </div>
        {itinerary.options.length > 1 && (
          <div className="w-full sm:w-auto">
            <Segmented options={itinerary.options.map((o) => ({ key: o.id, label: o.label }))} value={option?.id ?? ''} onChange={setOptionId} />
          </div>
        )}
        <Button variant="secondary" size="sm" onClick={() => toast(t('itinerary.protoEdit'))}>
          {t('itinerary.edit')}
        </Button>
        <CloseButton onClick={overlay.close} />
      </header>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pb-6 lg:max-h-[34rem]">
        <div className="flex items-start gap-3 rounded-card border border-border bg-brand-tint p-4">
          {designer && <Portrait spec={designer.portrait} size={44} />}
          <div>
            <Eyebrow>{t('itinerary.designerNote')}</Eyebrow>
            <p className="mt-0.5 text-sm">{itinerary.intro}</p>
          </div>
        </div>
        {option?.days.map((d) => (
          <section key={d.id} className="flex gap-4 rounded-card border border-border bg-surface p-4 shadow-card">
            <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-tile bg-brand-soft text-brand">
              <span className="text-[0.65rem] font-semibold">{d.weekday}</span>
              <span className="text-2xl font-semibold leading-none">{d.day}</span>
              <span className="text-[0.65rem] text-fg-muted">{d.month}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold">
                {d.place} <span className="text-xs font-normal text-fg-muted">{d.label}</span>
              </h2>
              <ul className="divide-y divide-border">
                {d.items.map((i) => (
                  <ItemRow key={i.id} item={i} />
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>
    </Popup>
  );
}
