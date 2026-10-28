import type { CommissionBar, RoomType, RoomRate, Supplier, SupplierBooking, SupplierCategory, SupplierItem } from '@/contracts';
import { initialsOf } from '@/lib/format';

type RoomInput = Omit<RoomType, 'rates' | 'inventory'>;

const PATTERN = [8, 5, 2, 0, 6, 3, 0, 7, 4, 1, 8, 5, 2, 0];

/** Adds the extra rate codes and the 14-day inventory to a room, so each room needs only its basics. */
function withRates(r: RoomInput): RoomType {
  const shift = [...r.id].reduce((n, c) => n + c.charCodeAt(0), 0) % PATTERN.length;
  const rotated = PATTERN.map((_, i) => PATTERN[(i + shift) % PATTERN.length] ?? 0);
  const inventory = r.availability === 'Sold out' ? rotated.map((n) => (n > 5 ? 1 : 0)) : rotated;
  const rates: RoomRate[] = [
    { id: `${r.id}-pkg`, name: 'Half Board Package', code: 'PKG', tone: 'warning', terms: 'Half board · Free cancellation 72h', netRate: Math.round((r.netRate * 1.25) / 5) * 5, commission: 10 },
    { id: `${r.id}-nr`, name: 'Non-Refundable Saver', code: 'NR', tone: 'danger', terms: 'Room only · Non-refundable', netRate: Math.round((r.netRate * 0.78) / 5) * 5, commission: 15 },
  ];
  return { ...r, rates, inventory };
}

const room = withRates;
const item = (i: SupplierItem): SupplierItem => i;
const bk = (id: string, customer: string, detail: string, dates: string, amount: string, status: string, tone: SupplierBooking['tone']): SupplierBooking => ({
  id,
  customer,
  detail,
  dates,
  amount,
  status,
  tone,
});

const casaRooms: RoomType[] = [
  room({ id: 'dlx-k', name: 'Deluxe King', code: 'DLX-K', sleeps: 'Sleeps 2 · King bed · 45 m²', size: '45 m²', scene: 'room', availability: '3 left', amenities: ['WiFi', 'Mini bar', 'Safe', 'Nespresso', 'Rain shower', 'Smart TV'], blurb: 'Neutral tones, Arabesque window overlooking the pool, and a king bed in Egyptian cotton.', netRate: 240, suggested: 290 }),
  room({ id: 'dlx-t', name: 'Deluxe Twin', code: 'DLX-T', sleeps: 'Sleeps 2 · Twin beds · 42 m²', size: '42 m²', scene: 'house', availability: 'Available', amenities: ['WiFi', 'Safe', 'Balcony', 'Mini bar', 'Rain shower'], blurb: 'Whitewashed walls, colourful patterned fabrics, Oriental lamps, and a pool-view balcony.', netRate: 220, suggested: 265 }),
  room({ id: 'jnr-s', name: 'Junior Suite', code: 'JNR-S', sleeps: 'Sleeps 3 · King bed and sofa bed · 62 m²', size: '62 m²', scene: 'room', availability: '2 left', amenities: ['WiFi', 'Terrace', 'Bath', 'Nespresso', 'Safe'], blurb: 'A private terrace facing the lagoon, a deep soaking bath, and a separate seating area.', netRate: 310, suggested: 375 }),
  room({ id: 'fam-s', name: 'Family Suite', code: 'FAM-S', sleeps: 'Sleeps 4 · Two bedrooms · 85 m²', size: '85 m²', scene: 'house', availability: 'Available', amenities: ['WiFi', 'Two bathrooms', 'Kitchenette', 'Terrace', 'Safe'], blurb: 'Two connected bedrooms with a shared living space and direct access to the family pool.', netRate: 420, suggested: 505 }),
  room({ id: 'lag-v', name: 'Lagoon Villa', code: 'LAG-V', sleeps: 'Sleeps 2 · King bed · 95 m²', size: '95 m²', scene: 'island', availability: '1 left', amenities: ['Private plunge pool', 'WiFi', 'Outdoor shower', 'Mini bar', 'Smart TV'], blurb: 'A private villa on the lagoon with its own plunge pool and sunset deck.', netRate: 560, suggested: 670 }),
  room({ id: 'pen-s', name: 'Penthouse Suite', code: 'PEN-S', sleeps: 'Sleeps 4 · King bed and twin · 140 m²', size: '140 m²', scene: 'room', availability: 'Sold out', amenities: ['Rooftop terrace', 'WiFi', 'Butler on request', 'Bath', 'Nespresso'], blurb: 'The top floor of the hotel with a wraparound terrace and views of the Red Sea.', netRate: 780, suggested: 930 }),
];

const casa: Supplier = {
  id: 'casa-cook',
  name: 'Casa Cook El Gouna',
  initials: 'CC',
  tone: 1,
  category: 'hotel',
  place: 'Hotel · El Gouna, Egypt',
  status: 'Contract active',
  statusTone: 'positive',
  earned: 14280,
  phone: '+20 65 358 0010',
  email: 'reservations@casacook-elgouna.example',
  rating: 4.6,
  badges: [
    { label: 'Net rate partner', tone: 'brand' },
    { label: 'Contract active', tone: 'positive' },
  ],
  facts: [
    { label: 'Room types', value: '6' },
    { label: 'Rate plans', value: '12' },
    { label: 'Your bookings', value: '47' },
    { label: 'Commission', value: '12%' },
    { label: 'Earned YTD', value: '€14,280' },
  ],
  catalogue: [],
  rooms: casaRooms,
  secondary: [
    item({ id: 'x1', name: 'Sunrise yoga on the deck', meta: 'Daily · 7:00 · 60 minutes', blurb: 'Gentle class on the lagoon deck, mats provided.', price: '€25 per person', note: 'Free for villa guests', scene: 'island' }),
    item({ id: 'x2', name: 'Kitesurf lesson', meta: 'Daily · 2 hours · all levels', blurb: 'Private lesson with equipment included.', price: '€110 per person', note: 'Book 24 hours ahead', scene: 'island' }),
    item({ id: 'x3', name: 'Sunset dhow cruise', meta: 'Daily · 90 minutes', blurb: 'Traditional sailing boat with drinks and snacks.', price: '€55 per person', note: 'Minimum 2 guests', scene: 'island' }),
    item({ id: 'x4', name: 'Hammam and spa ritual', meta: 'By appointment · 2 hours', blurb: 'Steam, scrub and massage in the hotel spa.', price: '€140 per person', note: 'Couples rooms available', scene: 'room' }),
  ],
  bookings: [
    bk('b1', 'Clara Bennett', 'Deluxe King · 2 adults', '12–16 Oct', '€960', 'Stayed', 'positive'),
    bk('b2', 'Hannah Lee', 'Junior Suite · 2 adults', '2–8 Feb', '€1,860', 'Confirmed', 'brand'),
    bk('b3', 'Jonas Weber', 'Deluxe Twin · 2 adults', '9–15 Dec', '€1,320', 'Confirmed', 'brand'),
    bk('b4', 'Liam Becker', 'Lagoon Villa · 2 adults', '14–19 Apr', '€2,800', 'Rates requested', 'warning'),
  ],
  info: [
    { label: 'Address', value: 'South Marina, El Gouna, Red Sea Governorate, Egypt' },
    { label: 'Check-in / check-out', value: '15:00 / 12:00' },
    { label: 'Contract', value: 'Net rate partner · Active until 31 Dec 2027' },
    { label: 'Commission', value: '12% on room revenue, paid 30 days after stay' },
    { label: 'Cancellation', value: 'Free up to 7 days before arrival, then first night' },
    { label: 'Contact', value: 'Reservations team · reservations@casacook-elgouna.example' },
  ],
};

const safari: Supplier = {
  id: 'desert-safari',
  name: 'Desert Safari Co.',
  initials: 'DS',
  tone: 4,
  category: 'experience',
  place: 'Experiences · Hurghada, Egypt',
  status: 'Contract active',
  statusTone: 'positive',
  earned: 4120,
  phone: '+20 65 344 2200',
  email: 'bookings@desertsafari.example',
  rating: 4.8,
  badges: [
    { label: 'Direct rates', tone: 'brand' },
    { label: 'Contract active', tone: 'positive' },
  ],
  facts: [
    { label: 'Activities', value: '4' },
    { label: 'Weekly departures', value: '14' },
    { label: 'Your bookings', value: '38' },
    { label: 'Commission', value: '15%' },
    { label: 'Earned YTD', value: '€4,120' },
  ],
  catalogue: [
    item({ id: 'a1', name: 'Sunset desert safari', meta: '5 hours · small group', blurb: 'Jeep through the dunes, camel ride, and dinner in a Bedouin camp.', price: '€85 per person', note: 'Includes hotel pickup', scene: 'desert' }),
    item({ id: 'a2', name: 'Quad bike and Bedouin dinner', meta: '6 hours · from 16 years', blurb: 'Guided quad ride at sunset followed by dinner under the stars.', price: '€110 per person', note: 'Helmet and goggles provided', scene: 'desert' }),
    item({ id: 'a3', name: 'Stargazing night', meta: '4 hours · evening', blurb: 'Telescope session with a local guide, tea and blankets.', price: '€95 per person', note: 'Weather dependent', scene: 'desert' }),
    item({ id: 'a4', name: 'Sunrise camel trek', meta: '3 hours · early start', blurb: 'Quiet trek across the dunes with breakfast at the camp.', price: '€60 per person', note: 'Minimum 2 guests', scene: 'desert' }),
  ],
  rooms: [],
  secondary: [
    item({ id: 'd1', name: 'Mon, Wed, Fri', meta: 'Sunset safari · pickup 14:30', blurb: '12 seats per departure.', price: '8 seats left this week', note: 'Cut-off 24 hours before', scene: 'desert' }),
    item({ id: 'd2', name: 'Tue, Thu', meta: 'Quad bike and dinner · pickup 15:00', blurb: '8 seats per departure.', price: '5 seats left this week', note: 'Cut-off 24 hours before', scene: 'desert' }),
    item({ id: 'd3', name: 'Saturday', meta: 'Stargazing night · pickup 18:00', blurb: '10 seats per departure.', price: '10 seats left', note: 'Cut-off 48 hours before', scene: 'desert' }),
    item({ id: 'd4', name: 'Sunday', meta: 'Sunrise camel trek · pickup 04:30', blurb: '6 seats per departure.', price: '2 seats left', note: 'Cut-off 48 hours before', scene: 'desert' }),
  ],
  bookings: [
    bk('s1', 'Aisha Nour', 'Sunset desert safari · 2 guests', '16 Jan', '€170', 'Confirmed', 'brand'),
    bk('s2', 'Liam Becker', 'Quad bike and dinner · 2 guests', '16 Apr', '€220', 'Requested', 'warning'),
    bk('s3', 'Sara Mansour', 'Stargazing night · 3 guests', '5 Mar', '€285', 'Confirmed', 'brand'),
  ],
  info: [
    { label: 'Base', value: 'Sahl Hasheesh Road, Hurghada, Egypt' },
    { label: 'Group size', value: 'Up to 12 per departure' },
    { label: 'Contract', value: 'Direct rates · Active until 30 Jun 2027' },
    { label: 'Commission', value: '15% on every booking, paid monthly' },
    { label: 'Cancellation', value: 'Free up to 48 hours before departure' },
  ],
};

const kyoto: Supplier = {
  id: 'kyoto-transfers',
  name: 'Kyoto Private Transfers',
  initials: 'KP',
  tone: 5,
  category: 'transfer',
  place: 'Transfers · Kyoto, Japan',
  status: 'Contract active',
  statusTone: 'positive',
  earned: 1860,
  phone: '+81 75 555 0142',
  email: 'dispatch@kyotoprivate.example',
  rating: 4.9,
  badges: [
    { label: 'Fixed rates', tone: 'brand' },
    { label: 'Contract active', tone: 'positive' },
  ],
  facts: [
    { label: 'Vehicles', value: '3' },
    { label: 'Routes', value: '8' },
    { label: 'Your bookings', value: '21' },
    { label: 'Commission', value: '10%' },
    { label: 'Earned YTD', value: '€1,860' },
  ],
  catalogue: [
    item({ id: 'v1', name: 'Toyota Alphard', meta: 'Up to 6 guests · 6 bags', blurb: 'Comfortable minivan with an English-speaking driver.', price: 'From €45 per transfer', note: 'Most booked', scene: 'car' }),
    item({ id: 'v2', name: 'Premium sedan', meta: 'Up to 3 guests · 3 bags', blurb: 'Quiet sedan for couples and business travellers.', price: 'From €38 per transfer', note: 'Child seat on request', scene: 'car' }),
    item({ id: 'v3', name: 'Mini coach', meta: 'Up to 14 guests · 14 bags', blurb: 'For groups, with luggage space and a driver guide.', price: 'From €120 per transfer', note: 'Book 3 days ahead', scene: 'car' }),
  ],
  rooms: [],
  secondary: [
    item({ id: 'r1', name: 'Kyoto Station → hotel', meta: '20–30 minutes', blurb: 'Meet and greet at the platform.', price: '€45 Alphard · €38 sedan', note: 'Fixed rate', scene: 'car' }),
    item({ id: 'r2', name: 'Kansai Airport (KIX) → Kyoto', meta: '90 minutes', blurb: 'Includes luggage help and a flight check.', price: '€140 Alphard · €120 sedan', note: 'Fixed rate', scene: 'car' }),
    item({ id: 'r3', name: 'Kyoto → Nara, full day', meta: '10 hours', blurb: 'Driver waits while you explore Nara.', price: '€320 Alphard · €280 sedan', note: 'Includes parking and tolls', scene: 'car' }),
    item({ id: 'r4', name: 'Kyoto → Osaka hotel', meta: '60 minutes', blurb: 'Direct to your Osaka hotel door.', price: '€110 Alphard · €95 sedan', note: 'Fixed rate', scene: 'car' }),
  ],
  bookings: [
    bk('k1', 'Sharma Family', 'KIX → Kyoto · Alphard', '12 Nov', '€140', 'Requested', 'warning'),
    bk('k2', 'Kapoor Family', 'Kyoto → Nara · Alphard', '8 Dec', '€320', 'Confirmed', 'brand'),
  ],
  info: [
    { label: 'Dispatch', value: 'Open 06:00–23:00 daily, +81 75 555 0142' },
    { label: 'Languages', value: 'English, Japanese, Mandarin' },
    { label: 'Contract', value: 'Fixed rates · Active until 31 Mar 2027' },
    { label: 'Commission', value: '10% on all transfers, paid monthly' },
    { label: 'Cancellation', value: 'Free up to 24 hours before pickup' },
  ],
};

function generic(
  id: string,
  name: string,
  tone: Supplier['tone'],
  category: SupplierCategory,
  place: string,
  status: string,
  statusTone: Supplier['statusTone'],
  earned: number | null,
): Supplier {
  const label = category === 'hotel' ? 'Rooms' : category === 'transfer' ? 'Vehicles' : 'Activities';
  const base: Supplier = {
    id,
    name,
    initials: initialsOf(name),
    tone,
    category,
    place,
    status,
    statusTone,
    earned,
    phone: '+00 000 000 0000', // PROTO: placeholder contact details
    email: `${id}@example.com`,
    rating: category === 'hotel' ? 4.4 : null,
    badges: [{ label: status, tone: statusTone }],
    facts: [
      { label: label, value: '4' },
      { label: 'Your bookings', value: earned ? '12' : '0' },
      { label: 'Commission', value: '10%' },
      { label: 'Earned YTD', value: earned ? `€${earned.toLocaleString('en-GB')}` : '—' },
    ],
    catalogue: [],
    rooms: [],
    secondary: [],
    bookings: earned ? [bk(`${id}-b1`, 'Clara Bennett', 'Standard booking · 2 guests', 'Last month', '€640', 'Completed', 'positive')] : [],
    info: [
      { label: 'Location', value: place.split(' · ')[1] ?? place },
      { label: 'Contract', value: status },
      { label: 'Commission', value: '10% on bookings' },
    ],
  };
  if (category === 'hotel') {
    base.rooms = casaRooms.slice(0, 3).map((r) => withRates({ ...r, id: `${id}-${r.id}`, netRate: Math.round(r.netRate * 1.1), suggested: Math.round(r.suggested * 1.1) }));
    base.secondary = casa.secondary.slice(0, 2);
  } else if (category === 'transfer') {
    base.catalogue = kyoto.catalogue.slice(0, 2);
    base.secondary = kyoto.secondary.slice(0, 2);
  } else {
    base.catalogue = safari.catalogue.slice(0, 2);
    base.secondary = safari.secondary.slice(0, 2);
  }
  return base;
}

export const suppliers: Supplier[] = [
  casa,
  generic('ritz-difc', 'Ritz-Carlton DIFC', 2, 'hotel', 'Hotel · Dubai', 'Contracted', 'positive', 9360),
  generic('marina-bay', 'Marina Bay Hotel Dubai', 3, 'hotel', 'Hotel · Dubai', 'Contract expiring', 'warning', 5240),
  generic('shinjuku-garden', 'Shinjuku Garden Hotel', 1, 'hotel', 'Hotel · Tokyo', 'Waiting for reply', 'warning', null),
  generic('phuket-beach', 'Phuket Beach Resort', 5, 'hotel', 'Hotel · Thailand', 'Needs your input', 'danger', 1320),
  safari,
  generic('kyoto-tea', 'Kyoto Tea House', 2, 'experience', 'Experiences · Kyoto, Japan', 'Offer in', 'brand', 640),
  kyoto,
  generic('dubai-transfers', 'Dubai Premier Transfers', 3, 'transfer', 'Transfers · Dubai', 'Contract expiring', 'warning', 980),
  generic('lucerne-lake', 'Lucerne Lake Hotel', 6, 'hotel', 'Hotel · Lucerne, Switzerland', 'Needs your input', 'danger', 2100),
];

export const supplierChipCounts: Record<'all' | SupplierCategory, number> = {
  all: 214,
  hotel: 126,
  transfer: 22,
  experience: 31,
  flight: 14,
  cruise: 9,
  dmc: 12,
};

export const commissionBars: CommissionBar[] = [
  { label: 'Casa Cook', value: 14300 },
  { label: 'Ritz-Carlton', value: 9400 },
  { label: 'Marina Bay', value: 5200 },
  { label: 'Desert Safari', value: 4100 },
];
