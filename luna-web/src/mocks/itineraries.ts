import type { Itinerary, ItineraryDay, ItineraryItem } from '@/contracts';

let counter = 0;
const it = (
  kind: ItineraryItem['kind'],
  title: string,
  detail: string,
  estimate: string,
  price: string,
  status: string,
  tone: ItineraryItem['tone'],
  scene?: string,
): ItineraryItem => ({ id: `it-${++counter}`, kind, title, detail, estimate, price, status, tone, scene });

const day = (weekday: string, d: number, month: string, place: string, label: string, items: ItineraryItem[]): ItineraryDay => ({
  id: `day-${++counter}`,
  weekday,
  day: d,
  month,
  place,
  label,
  items,
});

const free = (title: string, detail: string, estimate: string, status = 'Idea to check') => it('experience', title, detail, estimate, 'Free', status, 'neutral');

function omarDays(stay: { title: string; estimate: string; price: string; scene: string }, spa: string): ItineraryDay[] {
  return [
    day('WED', 3, 'Feb', 'Malé', 'Day 1 · Arrive in the Maldives', [
      it('flight', 'Dubai → Malé · 2 guests', 'Economy, direct', 'Fare to be requested', '—', 'Not booked yet', 'neutral'),
      it('transfer', 'Seaplane to the resort', 'Shared seaplane, 35 minutes', 'Estimate €90 per person each way', '€360', 'Not requested yet', 'neutral'),
      it('stay', stay.title, 'Private deck, breakfast included', stay.estimate, stay.price, 'Rates requested', 'warning', stay.scene),
      free('Honeymoon welcome in the villa', 'Flowers and a welcome drink, if the resort offers it', 'To be confirmed with the resort'),
    ]),
    day('THU', 4, 'Feb', 'Resort island', 'Day 2 · Reef and sunrise', [
      free('Snorkel the house reef', 'Self-guided', 'Included with the villa'),
      free('Sunrise yoga on the deck', 'Optional', 'Included with the villa'),
    ]),
    day('FRI', 5, 'Feb', 'Resort island', 'Day 3 · Spa day', [
      it('experience', 'Couples spa treatment', '90 minutes, afternoon', spa, '€240', 'Idea to check', 'neutral'),
    ]),
    day('SAT', 6, 'Feb', 'Resort island', 'Day 4 · Sunset at sea', [
      it('experience', 'Sunset dolphin cruise', '2 hours, shared boat', 'Estimate €60 per person', '€120', 'Idea to check', 'neutral'),
    ]),
    day('SUN', 7, 'Feb', 'Resort island', 'Day 5 · Dinner for two', [
      it('experience', 'Private dinner on the sandbank', 'Set menu, sunset start', 'Estimate €140 per person', '€280', 'Idea to check', 'neutral'),
    ]),
    day('MON', 8, 'Feb', 'Resort island', 'Day 6 · Slow day', [
      free('Free day on the island', 'No plans, towels and loungers by the water', 'Included with the villa', 'Your choice'),
      free('Candlelit farewell on the beach', 'Dinner at the resort restaurant', 'Included with the villa', 'Idea to check'),
    ]),
    day('TUE', 9, 'Feb', 'Malé', 'Day 7 · Fly home', [
      it('transfer', 'Seaplane to Malé', 'Shared seaplane, 35 minutes', 'Included in the transfer above', 'Included', 'Not requested yet', 'neutral'),
      it('flight', 'Malé → Dubai · 2 guests', 'Economy, direct', 'Fare to be requested', '—', 'Not booked yet', 'neutral'),
    ]),
  ];
}

export const itineraries: Itinerary[] = [
  {
    id: 'omar-maldives',
    customerId: 'omar',
    title: 'Maldives Honeymoon · Itinerary',
    status: 'Draft',
    meta: 'Omar Ghali · 3–9 Feb 2027 · 2 guests · 6 nights',
    scene: 'island',
    intro:
      "I've planned Option A as an overwater villa on a quiet island, with a spa treatment and a few sunset moments. Nothing is booked yet. The resort rates below are indicative until it confirms, so this is a planning estimate, not a quotation.",
    options: [
      { id: 'a', label: 'Option A · Overwater villa', days: omarDays({ title: 'Overwater villa · 6 nights', estimate: 'Indicative €500 a night · taxes added on top', price: '€3,000', scene: 'room' }, 'Estimate €120 per person × 2') },
      { id: 'b', label: 'Option B · Beach villa', days: omarDays({ title: 'Beach villa · 6 nights', estimate: 'Indicative €350 a night · taxes added on top', price: '€2,100', scene: 'house' }, 'Estimate €100 per person × 2') },
    ],
  },
  {
    id: 'aisha-egypt',
    customerId: 'aisha',
    title: 'Egypt Stay · Itinerary',
    status: 'Proposal sent',
    meta: 'Aisha Nour · 14–21 Jan 2027 · 2 guests · 7 nights',
    scene: 'desert',
    intro: "Cairo, the Nile and Giza at an easy pace. Transfers are the one thing still open, and I'll update them after your call with Aisha.",
    options: [
      {
        id: 'a',
        label: 'Main plan',
        days: [
          day('THU', 14, 'Jan', 'Cairo', 'Day 1 · Arrive in Cairo', [
            it('flight', 'London → Cairo · 2 guests', 'Economy, direct', 'Fare confirmed', '€640', 'Booked', 'positive'),
            it('transfer', 'Private car to the hotel', 'Meet and greet at arrivals', 'Estimate €55', '€55', 'To discuss', 'warning'),
            it('stay', 'Cairo hotel · 3 nights', 'Nile view, breakfast included', 'Confirmed €310 a night', '€930', 'Confirmed', 'positive', 'room'),
          ]),
          day('FRI', 15, 'Jan', 'Giza', 'Day 2 · Pyramids and Sphinx', [
            it('experience', 'Private pyramids tour', 'Half day with an Egyptologist', 'Estimate €90 per person', '€180', 'Confirmed', 'positive', 'desert'),
          ]),
          day('SAT', 16, 'Jan', 'Cairo', 'Day 3 · Old Cairo', [
            free('Khan el-Khalili market walk', 'Late afternoon, with a guide', 'Optional', 'Idea to check'),
          ]),
          day('SUN', 17, 'Jan', 'Nile', 'Day 4 · Nile cruise', [
            it('stay', 'Nile cruise · 4 nights', 'Luxor to Aswan, full board', 'Confirmed €260 a night', '€1,040', 'Confirmed', 'positive', 'island'),
          ]),
        ],
      },
    ],
  },
  {
    id: 'sharma-japan',
    customerId: 'sharma',
    title: 'Japan Holiday · Itinerary',
    status: 'Proposal sent',
    meta: 'Sharma Family · 12–22 Nov 2026 · 4 guests · 10 nights',
    scene: 'tea',
    intro: 'Plan A is the fuller trip with Hakone, Plan B keeps Tokyo and Kyoto only. Both leave free afternoons. Hotel rates are being confirmed.',
    options: [
      {
        id: 'a',
        label: 'Plan A · Tokyo, Hakone, Kyoto',
        days: [
          day('THU', 12, 'Nov', 'Tokyo', 'Day 1 · Arrive in Tokyo', [
            it('flight', 'Mumbai → Tokyo · 4 guests', 'Economy, one stop', 'Fare to be requested', '—', 'Not booked yet', 'neutral'),
            it('stay', 'Tokyo hotel · 4 nights', 'Family room in Shinjuku', 'Waiting for rates', '—', 'Rates requested', 'warning', 'room'),
          ]),
          day('FRI', 13, 'Nov', 'Tokyo', 'Day 2 · Food and markets', [
            it('experience', 'Tsukiji food walk', 'Vegetarian-friendly, 3 hours', 'Estimate €55 per person', '€220', 'Idea to check', 'neutral', 'food'),
          ]),
          day('SAT', 14, 'Nov', 'Tokyo', 'Day 3 · Free afternoon', [free('Teamlab visit', 'Optional evening', 'Estimate €30 per person')]),
          day('SUN', 16, 'Nov', 'Hakone', 'Day 5 · Hakone', [
            it('transfer', 'Romancecar to Hakone', 'Reserved seats', 'Estimate €25 per person', '€100', 'Not requested yet', 'neutral', 'rail'),
            it('stay', 'Ryokan stay · 1 night', 'Onsen and kaiseki dinner', 'Waiting for rates', '—', 'Rates requested', 'warning', 'house'),
          ]),
          day('TUE', 18, 'Nov', 'Kyoto', 'Day 7 · Kyoto', [
            it('transfer', 'Shinkansen to Kyoto', 'Reserved seats', 'Estimate €95 per person', '€380', 'Not requested yet', 'neutral', 'rail'),
            it('stay', 'Machiya stay · 4 nights', 'Traditional townhouse', 'Waiting for rates', '—', 'Rates requested', 'warning', 'house'),
          ]),
        ],
      },
      {
        id: 'b',
        label: 'Plan B · Tokyo and Kyoto',
        days: [
          day('THU', 12, 'Nov', 'Tokyo', 'Day 1 · Arrive in Tokyo', [
            it('flight', 'Mumbai → Tokyo · 4 guests', 'Economy, one stop', 'Fare to be requested', '—', 'Not booked yet', 'neutral'),
            it('stay', 'Tokyo hotel · 5 nights', 'Family room in Ginza', 'Waiting for rates', '—', 'Rates requested', 'warning', 'room'),
          ]),
          day('TUE', 17, 'Nov', 'Kyoto', 'Day 6 · Kyoto', [
            it('transfer', 'Shinkansen to Kyoto', 'Reserved seats', 'Estimate €95 per person', '€380', 'Not requested yet', 'neutral', 'rail'),
            it('stay', 'Machiya stay · 5 nights', 'Traditional townhouse', 'Waiting for rates', '—', 'Rates requested', 'warning', 'house'),
          ]),
        ],
      },
    ],
  },
  {
    id: 'jonas-swiss',
    customerId: 'jonas',
    title: 'Switzerland rail trip · Itinerary',
    status: 'Draft',
    meta: 'Jonas Weber · 9–15 Dec 2026 · 2 guests · 6 nights',
    scene: 'rail',
    intro: "A scenic rail loop. I'm clarifying the budget before I pick hotels, so these are placeholders.",
    options: [
      {
        id: 'a',
        label: 'Main plan',
        days: [
          day('WED', 9, 'Dec', 'Zurich', 'Day 1 · Zurich', [
            it('stay', 'Zurich hotel · 2 nights', 'Old town', 'Budget to be confirmed', '—', 'Not requested yet', 'neutral', 'room'),
          ]),
          day('FRI', 11, 'Dec', 'Lucerne', 'Day 3 · Lucerne', [
            it('transfer', 'Scenic train to Lucerne', 'Reserved window seats', 'Estimate €30 per person', '€60', 'Not requested yet', 'neutral', 'rail'),
            it('stay', 'Lucerne Lake Hotel · 2 nights', 'Lake view', 'Needs terms decision', '—', 'Needs your input', 'danger', 'room'),
          ]),
          day('SUN', 13, 'Dec', 'Interlaken', 'Day 5 · Interlaken', [
            it('transfer', 'Golden Pass to Interlaken', 'First class', 'Estimate €70 per person', '€140', 'Idea to check', 'neutral', 'rail'),
          ]),
        ],
      },
    ],
  },
  {
    id: 'hannah-sg',
    customerId: 'hannah',
    title: 'Singapore · Itinerary',
    status: 'Draft',
    meta: 'Hannah Lee · 2–8 Feb 2027 · 3 guests · 6 nights',
    scene: 'food',
    intro: 'Option 1 is city and food. Option 2 adds Sentosa for the children and is still being drafted.',
    options: [
      {
        id: 'a',
        label: 'Option 1 · City and food',
        days: [
          day('TUE', 2, 'Feb', 'Singapore', 'Day 1 · Arrive', [
            it('stay', 'Marina hotel · 6 nights', 'City view, breakfast included', 'Indicative €280 a night', '€1,680', 'Rates requested', 'warning', 'room'),
          ]),
          day('WED', 3, 'Feb', 'Singapore', 'Day 2 · Hawker centres', [
            it('experience', 'Hawker food tour', 'Evening, 3 hours', 'Estimate €45 per person', '€135', 'Idea to check', 'neutral', 'food'),
          ]),
          day('THU', 4, 'Feb', 'Singapore', 'Day 3 · Gardens', [free('Gardens by the Bay', 'Light show at dusk', 'Estimate €20 per person')]),
        ],
      },
      {
        id: 'b',
        label: 'Option 2 · With Sentosa',
        days: [
          day('TUE', 2, 'Feb', 'Singapore', 'Day 1 · Arrive', [
            it('stay', 'Sentosa resort · 6 nights', 'Family room, pool', 'Still drafting', '—', 'Not requested yet', 'neutral', 'room'),
          ]),
        ],
      },
    ],
  },
];
