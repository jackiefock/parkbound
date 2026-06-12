// Park catalog and the deterministic day builder.
// Moved server-side so the API owns the data and the client just renders it.

export const PARKS = [
  { id: 'mk', name: 'Magic Kingdom' },
  { id: 'ep', name: 'EPCOT' },
  { id: 'hs', name: 'Hollywood Studios' },
  { id: 'ak', name: 'Animal Kingdom' }
];

const POOLS = {
  hs: [
    { t: 'Moana: Voyage to the Stage',       type: 'musical',  loc: 'Sunset Showcase Theater', film: 'Moana' },
    { t: 'Encanto LIVE!',                     type: 'musical',  loc: 'Sunset Showcase Theater', film: 'Encanto' },
    { t: 'Tangled: The Musical Spectacular',  type: 'musical',  loc: 'Backlot Stage', film: 'Tangled' },
    { t: "Hercules: A Hero's Anthem",         type: 'musical',  loc: 'Backlot Stage', film: 'Hercules' },
    { t: 'Meet the cast of Starfall Academy', type: 'cast',     loc: 'Studio Plaza Stage' },
    { t: 'Galaxy Garage cast signing',        type: 'cast',     loc: 'Commissary Lawn' }
  ],
  ak: [
    { t: 'The Lion King: Rhythms of the Pride Lands', type: 'live', loc: 'Harambe Theater', film: 'The Lion King' },
    { t: 'Zootopia: Wild District Live',              type: 'live', loc: 'Discovery Amphitheater', film: 'Zootopia' },
    { t: 'Tarzan: Call of the Jungle',                type: 'live', loc: 'Canopy Stage', film: 'Tarzan' },
    { t: 'Brother Bear: Spirits of the Forest',       type: 'live', loc: 'Harambe Theater', film: 'Brother Bear' },
    { t: "Meet Moana at Voyagers' Cove",              type: 'character', loc: 'Discovery Trails', film: 'Moana' }
  ],
  mk: [
    { t: 'Festival of Fantasy Parade',      type: 'parade',    loc: 'Main Street Parade Route' },
    { t: 'Luminous Skies Fireworks',        type: 'parade',    loc: 'Castle Hub' },
    { t: 'Meet Mirabel at Casa Madrigal',   type: 'character', loc: 'Fantasy Courtyard', film: 'Encanto' },
    { t: 'Elsa & Anna Royal Greeting',      type: 'character', loc: 'Royal Hall', film: 'Frozen' },
    { t: 'Woody & Jessie at Roundup Plaza', type: 'character', loc: 'Frontier Plaza', film: 'Toy Story' }
  ],
  ep: [
    { t: "Chef's Table: Flavors of Agrabah", type: 'dining',    loc: 'World Showcase Pavilion', film: 'Aladdin' },
    { t: 'Festival of Lights & Lanterns',    type: 'parade',    loc: 'Showcase Lagoon' },
    { t: 'Meet Joy from the Mind Pavilion',  type: 'character', loc: 'Imagination Hub', film: 'Inside Out' },
    { t: 'Coco: Remember Me Live',           type: 'live',      loc: 'Showcase Plaza Stage', film: 'Coco' }
  ]
};

const TIMES = ['10:30 AM', '12:00 PM', '1:45 PM', '3:30 PM', '5:15 PM', '7:00 PM', '8:45 PM'];

export function isValidPark(id) {
  return PARKS.some((p) => p.id === id);
}

// FNV-1a hash, gives a stable number from the park+date string.
function seedFrom(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Linear congruential generator seeded by the date, so a park+date is reproducible.
function rng(seed) {
  let s = seed;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function pick(arr, rand, n) {
  const copy = [...arr];
  const out = [];
  n = Math.min(n, copy.length);
  for (let i = 0; i < n; i++) {
    out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  }
  return out;
}

// Build one day's lineup and the films to bound to for a given park and date.
export function buildDay(park, dateStr) {
  const rand = rng(seedFrom(dateStr + park));
  const count = 3 + Math.floor(rand() * 3); // 3 to 5 events
  const chosen = pick(POOLS[park], rand, count);
  const times = pick(TIMES, rand, chosen.length).sort(
    (a, b) => new Date('1/1/2000 ' + a) - new Date('1/1/2000 ' + b)
  );

  const events = chosen.map((e, i) => ({
    title: e.t,
    type: e.type,
    location: e.loc,
    film: e.film || null,
    time: times[i]
  }));

  // Featured films come straight from the day's events, deduped, in schedule order.
  const films = [...new Set(events.map((e) => e.film).filter(Boolean))];

  return { park, date: dateStr, films, events };
}
