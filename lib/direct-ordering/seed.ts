import type {
    DirectRestaurant, MenuItem, DeliveryZone,
    MenuItemSize, CustomizationGroup,
} from './types';

// Demo seed used by the in-memory fallback (when Supabase env is missing).
// Matches the rows inserted by supabase/migrations/20260606000000_direct_ordering.sql.

export const PIZZAPIZZA: DirectRestaurant = {
    id: 'demo-pizzapizza',
    slug: 'pizzapizza',
    name: 'PizzaPizza',
    description: 'Käsintehtyjä napolilaisia pizzoja Jyväskylän sydämessä.',
    city: 'Jyväskylä',
    address: 'Kauppakatu 25, 40100 Jyväskylä',
    lat: 62.2426,
    lon: 25.7473,
    logoUrl: '/images/pizzapizza-logo.svg',
    coverUrl: '/images/pizza.jpg',
    rating: 4.7,
    etaMin: 25,
    etaMax: 40,
    isActive: true,
};

// Two sizes for every pizza, each with its own absolute price.
// Helper factory keeps the surcharges consistent across the menu.
function sizesFor(basePriceCents: number): MenuItemSize[] {
    return [
        { id: 'sz-normaali',  label: 'Normaali (32 cm)',  priceCents: basePriceCents },
        { id: 'sz-perhe',     label: 'Perhepizza (40 cm)', priceCents: basePriceCents + 500 },
    ];
}

// Wolt-style customization for the build-your-own pizza ("Oma valinta").
const OMA_VALINTA_GROUPS: CustomizationGroup[] = [
    {
        id: 'grp-pohja',
        label: 'Valitse pohja',
        type: 'single',
        minSelect: 1,
        maxSelect: 1,
        options: [
            { id: 'pohja-normaali',   label: 'Normaali',    priceCents: 0    },
            { id: 'pohja-ruis',       label: 'Ruispizza',   priceCents: 100  },
            { id: 'pohja-gluteeniton',label: 'Gluteeniton', priceCents: 100  },
            { id: 'pohja-pannu',      label: 'Pannupizza',  priceCents: 200  },
        ],
    },
    {
        id: 'grp-taytteet',
        label: 'Lisätäytteet',
        type: 'multi',
        minSelect: 2,
        freeQuantity: 4,
        helperText: 'Valitse vähintään 2 kpl · Ensimmäiset 4 ovat ilmaisia',
        options: [
            { id: 'top-jauheliha',      label: 'Jauheliha',      priceCents: 150 },
            { id: 'top-kebabliha',      label: 'Kebabliha',      priceCents: 150 },
            { id: 'top-kanadoner',      label: 'Kanadöner',      priceCents: 150 },
            { id: 'top-kinkku',         label: 'Kinkku',         priceCents: 150 },
            { id: 'top-salamimakkara',  label: 'Salamimakkara',  priceCents: 150 },
            { id: 'top-pekoni',         label: 'Pekoni',         priceCents: 150 },
            { id: 'top-kana',           label: 'Kana',           priceCents: 150 },
            { id: 'top-tonnikala',      label: 'Tonnikala',      priceCents: 150 },
            { id: 'top-katkarapu',      label: 'Katkarapu',      priceCents: 150 },
            { id: 'top-sienet',         label: 'Sienet',         priceCents: 150 },
            { id: 'top-ananas',         label: 'Ananas',         priceCents: 150 },
            { id: 'top-aurajuusto',     label: 'Aurajuusto',     priceCents: 150 },
            { id: 'top-paprika',        label: 'Paprika',        priceCents: 150 },
            { id: 'top-jalapeno',       label: 'Jalapeño',       priceCents: 150 },
        ],
    },
];

export const PIZZAPIZZA_MENU: MenuItem[] = [
    {
        id: 'demo-mi-margherita',
        restaurantId: PIZZAPIZZA.id,
        name: 'Margherita',
        description:
            'Klassikko: San Marzano -tomaattikastike, fior di latte -mozzarella, tuore basilika, oliiviöljy.',
        priceCents: 1190,
        currency: 'EUR',
        imageUrl: '/images/pizza.jpg',
        category: 'Pizza',
        isAvailable: true,
        sortOrder: 1,
        sizes: sizesFor(1190),
    },
    {
        id: 'demo-mi-diavola',
        restaurantId: PIZZAPIZZA.id,
        name: 'Diavola',
        description: 'Tulinen salami, mozzarella, tomaattikastike, ripaus chiliöljyä.',
        priceCents: 1390,
        currency: 'EUR',
        imageUrl: '/images/pizza.jpg',
        category: 'Pizza',
        isAvailable: true,
        sortOrder: 2,
        sizes: sizesFor(1390),
    },
    {
        id: 'demo-mi-quattro',
        restaurantId: PIZZAPIZZA.id,
        name: 'Quattro Formaggi',
        description: 'Neljä juustoa: mozzarella, gorgonzola, parmesan, savustettu provola.',
        priceCents: 1490,
        currency: 'EUR',
        imageUrl: '/images/pizza.jpg',
        category: 'Pizza',
        isAvailable: true,
        sortOrder: 3,
        sizes: sizesFor(1490),
    },
    {
        id: 'demo-mi-oma-valinta',
        restaurantId: PIZZAPIZZA.id,
        name: 'Oma valinta',
        description:
            'Rakenna oma pizzasi: valitse pohja ja täytteet. Vähintään 2 täytettä, ensimmäiset 4 ovat ilmaisia.',
        priceCents: 1300,
        currency: 'EUR',
        imageUrl: '/images/pizza.jpg',
        category: 'Pizza',
        isAvailable: true,
        sortOrder: 4,
        sizes: sizesFor(1300),
        customizationGroups: OMA_VALINTA_GROUPS,
    },
];

export const PIZZAPIZZA_ZONE: DeliveryZone = {
    restaurantId: PIZZAPIZZA.id,
    centerLat: 62.2426,
    centerLon: 25.7473,
    radiusM: 5000,
    feeCents: 290,
    minOrderCents: 1500,
    allowedPostalCodes: [
        '40100', '40200', '40320', '40400', '40500', '40520', '40600', '40700', '40720',
    ],
};
