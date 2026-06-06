'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { searchOffers, getCities, SearchParams } from './actions/offers'
import SearchBar from '@/components/search/SearchBar'
import OfferCard from '@/components/offers/OfferCard'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { OfferWithDetails } from '@/lib/types/database'
import { TrendingDown, Clock, Star, ChevronRight, MapPin } from 'lucide-react'
import Footer from '@/components/layout/Footer'
import OfferPreview from '@/components/offers/OfferPreview'
import { useLocation } from '@/lib/context/LocationContext'
import HomepagePizzaPizzaCard from '@/components/direct-ordering/HomepagePizzaPizzaCard'

export default function HomePage() {
  const { city } = useLocation()
  const [cities, setCities] = useState<Array<{ id: string; name: string }>>([])
  const [offers, setOffers] = useState<OfferWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Kaikki')
  const [hoveredOffer, setHoveredOffer] = useState<OfferWithDetails | null>(null)

  const [sortBy, setSortBy] = useState<'price_asc' | 'savings_desc'>('price_asc')
  const [freeDelivery, setFreeDelivery] = useState(false)

  // Load cities on mount
  useEffect(() => {
    getCities().then((data) => {
      setCities(data)
    })
  }, [])

  const generateDemoOffers = (): OfferWithDetails[] => {
    const demoDeals = [
      {
        id: '1',
        meal: { name: 'Gourmet Pepperoni Pizza', restaurant: { name: 'Napoli Woodfire', rating: 4.8, city: { name: 'Helsinki' } }, diet_flags: [], image_path: 'pizza' },
        source: { name: 'Wolt' },
        price_cents: 1290,
        old_price_cents: 1650,
        delivery_fee_cents: 0,
        eta_minutes: 35
      },
      {
        id: '2',
        meal: { name: 'Sushi Selection Platter', restaurant: { name: 'Sakura Sushi', rating: 4.6, city: { name: 'Espoo' } }, diet_flags: ['gluten_free'], image_path: 'sushi' },
        source: { name: 'UberEats' },
        price_cents: 1850,
        old_price_cents: 2200,
        delivery_fee_cents: 390,
        eta_minutes: 45
      },
      {
        id: '3',
        meal: { name: 'Double Cheese Smashburger', restaurant: { name: 'Burger Co.', rating: 4.5, city: { name: 'Tampere' } }, diet_flags: [], image_path: 'burger' },
        source: { name: 'UberEats' },
        price_cents: 1090,
        old_price_cents: null,
        delivery_fee_cents: 190,
        eta_minutes: 25
      },
      {
        id: '4',
        meal: { name: 'Vegan Buddha Bowl', restaurant: { name: 'Green Leaf', rating: 4.9, city: { name: 'Helsinki' } }, diet_flags: ['vegan', 'healthy'], image_path: 'pizza' },
        source: { name: 'Wolt' },
        price_cents: 1450,
        old_price_cents: 1590,
        delivery_fee_cents: 0,
        eta_minutes: 30
      },
      {
        id: '5',
        meal: { name: 'BBQ Chicken Pizza', restaurant: { name: 'Pizza Hut', rating: 4.2, city: { name: 'Vantaa' } }, diet_flags: [], image_path: 'pizza' },
        source: { name: 'UberEats' },
        price_cents: 1390,
        old_price_cents: 1890,
        delivery_fee_cents: 290,
        eta_minutes: 40
      },
      {
        id: '6',
        meal: { name: 'Salmon Nigiri Set (12pc)', restaurant: { name: 'Oishii Kitchen', rating: 4.7, city: { name: 'Helsinki' } }, diet_flags: ['pescatarian'], image_path: 'sushi' },
        source: { name: 'Wolt' },
        price_cents: 1600,
        old_price_cents: null,
        delivery_fee_cents: 490,
        eta_minutes: 50
      },
      {
        id: '7',
        meal: { name: 'Kebab with Rice', restaurant: { name: 'Jyväskylä Kebab', rating: 4.3, city: { name: 'Jyväskylä' } }, diet_flags: [], image_path: 'pizza' },
        source: { name: 'UberEats' },
        price_cents: 1150,
        old_price_cents: 1350,
        delivery_fee_cents: 290,
        eta_minutes: 40
      },
      {
        id: '8',
        meal: { name: 'Aura Cheese Burger', restaurant: { name: 'Revolution', rating: 4.5, city: { name: 'Jyväskylä' } }, diet_flags: [], image_path: 'burger' },
        source: { name: 'Wolt' },
        price_cents: 1490,
        old_price_cents: 1890,
        delivery_fee_cents: 0,
        eta_minutes: 35
      },
      {
        id: '9',
        meal: { name: 'Reindeer Pizza', restaurant: { name: 'Lapland Pizzeria', rating: 4.6, city: { name: 'Oulu' } }, diet_flags: [], image_path: 'pizza' },
        source: { name: 'Wolt' },
        price_cents: 1550,
        old_price_cents: 1750,
        delivery_fee_cents: 190,
        eta_minutes: 30
      },
      {
        id: '10',
        meal: { name: 'Aurajoki Burger', restaurant: { name: 'Turku Burger', rating: 4.4, city: { name: 'Turku' } }, diet_flags: [], image_path: 'burger' },
        source: { name: 'UberEats' },
        price_cents: 1290,
        old_price_cents: 1590,
        delivery_fee_cents: 390,
        eta_minutes: 45
      },
      {
        id: '11',
        meal: { name: 'Vegetarian Pasta', restaurant: { name: 'Pasta & Co', rating: 4.2, city: { name: 'Kuopio' } }, diet_flags: ['vegetarian'], image_path: 'pizza' },
        source: { name: 'UberEats' },
        price_cents: 1190,
        old_price_cents: null,
        delivery_fee_cents: 250,
        eta_minutes: 35
      },
      {
        id: '12',
        meal: { name: 'Salmon Soup', restaurant: { name: 'Fish Market', rating: 4.8, city: { name: 'Oulu' } }, diet_flags: ['healthy', 'gluten_free'], image_path: 'sushi' },
        source: { name: 'Wolt' },
        price_cents: 1350,
        old_price_cents: 1600,
        delivery_fee_cents: 0,
        eta_minutes: 25
      },
      {
        id: '13',
        meal: { name: 'Chicken Wings (10pcs)', restaurant: { name: 'Siipiweikot', rating: 4.7, city: { name: 'Tampere' } }, diet_flags: [], image_path: 'burger' },
        source: { name: 'UberEats' },
        price_cents: 1250,
        old_price_cents: 1450,
        delivery_fee_cents: 350,
        eta_minutes: 40
      },
      {
        id: '14',
        meal: { name: 'Kebab Pitas', restaurant: { name: 'Hervanta Kebab', rating: 4.1, city: { name: 'Tampere' } }, diet_flags: [], image_path: 'pizza' },
        source: { name: 'Wolt' },
        price_cents: 990,
        old_price_cents: 1290,
        delivery_fee_cents: 190,
        eta_minutes: 30
      },
      {
        id: '15',
        meal: { name: 'Falafel Salad', restaurant: { name: 'Fafa\'s', rating: 4.6, city: { name: 'Jyväskylä' } }, diet_flags: ['vegan', 'gluten_free'], image_path: 'burger' },
        source: { name: 'Wolt' },
        price_cents: 1390,
        old_price_cents: null,
        delivery_fee_cents: 0,
        eta_minutes: 25
      }
    ]

    return demoDeals as unknown as OfferWithDetails[]
  }

  const handleSearch = useCallback(async (
    query: string,
    _city: string,
    category: string = 'Kaikki',
    sort: 'price_asc' | 'savings_desc' = sortBy,
    isFreeDel: boolean = freeDelivery
  ) => {
    setLoading(true)
    setSearchQuery(query)
    setSelectedCategory(category)

    // Map city name to ID if possible, otherwise use name (lowercase)
    const targetCityId = cities.find(c => c.name.toLowerCase() === city.toLowerCase())?.id || city.toLowerCase()

    const params: SearchParams = {
      query: category !== 'Kaikki' ? `${query} ${category}`.trim() : query,
      cityId: targetCityId,
      sortBy: sort,
      freeDelivery: isFreeDel
    }

    if (category === 'Vegaani') {
      params.dietFlags = ['vegan']
    }

    try {
      const results = await searchOffers(params)
      if (results && results.length > 0) {
        setOffers(results)
      } else {
        // Filter demo offers by selected city AND category
        let demoOffers = generateDemoOffers().filter(offer =>
          offer.meal.restaurant.city.name.toLowerCase() === city.toLowerCase()
        )

        // Filter by free delivery
        if (isFreeDel) {
          demoOffers = demoOffers.filter(offer => offer.delivery_fee_cents === 0)
        }

        if (category && category !== 'Kaikki') {
          const catLower = category.toLowerCase()
          demoOffers = demoOffers.filter(offer => {
            // Basic category mapping for demo data
            if (catLower === 'vegaani') return offer.meal.diet_flags?.includes('vegan')
            if (catLower === 'kiinalainen') return false // No chinese in demo yet
            if (catLower === 'leipomo') return false // No bakery in demo yet

            // Default name match (Burger -> Burger, Pizza -> Pizza, Sushi -> Sushi)
            return offer.meal.name.toLowerCase().includes(catLower.slice(0, -1)) || // Removes last char for plurals mostly
              offer.meal.name.toLowerCase().includes(catLower)
          })
        }

        // Filter by search query if present
        if (query) {
          const qLower = query.toLowerCase()
          demoOffers = demoOffers.filter(offer =>
            offer.meal.name.toLowerCase().includes(qLower) ||
            offer.meal.restaurant.name.toLowerCase().includes(qLower)
          )
        }

        // Sort demo offers
        if (sort === 'price_asc') {
          demoOffers.sort((a, b) => a.price_cents - b.price_cents)
        } else if (sort === 'savings_desc') {
          demoOffers.sort((a, b) => {
            const aSavings = a.old_price_cents ? (a.old_price_cents - a.price_cents) / a.old_price_cents : 0
            const bSavings = b.old_price_cents ? (b.old_price_cents - b.price_cents) / b.old_price_cents : 0
            return bSavings - aSavings
          })
        }

        setOffers(demoOffers)
      }
    } catch (error) {
      console.error('Search error:', error)
      let demoOffers = generateDemoOffers().filter(offer =>
        offer.meal.restaurant.city.name.toLowerCase() === city.toLowerCase()
      )

      if (category && category !== 'Kaikki') {
        const catLower = category.toLowerCase()
        demoOffers = demoOffers.filter(offer => {
          if (catLower === 'vegaani') return offer.meal.diet_flags?.includes('vegan')
          return offer.meal.name.toLowerCase().includes(catLower.slice(0, 4)) // "Burg", "Pizz", "Sush"
        })
      }

      // Filter by search query if present
      if (query) {
        const qLower = query.toLowerCase()
        demoOffers = demoOffers.filter(offer =>
          offer.meal.name.toLowerCase().includes(qLower) ||
          offer.meal.restaurant.name.toLowerCase().includes(qLower)
        )
      }

      setOffers(demoOffers)
    } finally {
      setLoading(false)
    }
  }, [cities, city, sortBy, freeDelivery])

  // Load initial offers and refresh when city changes
  useEffect(() => {
    handleSearch(searchQuery, city, selectedCategory, sortBy, freeDelivery)
  }, [handleSearch, searchQuery, city, selectedCategory, sortBy, freeDelivery])

  return (
    <div className="min-h-screen bg-[#fffcf8] pb-20">
      {/* Search Header Section - Now wider for web */}
      <section className="bg-white px-4 pt-6 pb-10 border-b border-[#f1ebd8] rounded-b-[3rem] card-shadow relative z-10 transition-all duration-500">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-black text-[#3d1d11] tracking-tight">
                Mitä tekisi mieli <span className="text-[#d35400]">syödä?</span>
              </h1>
              <p className="text-[#a08a7e] font-medium">Löydä kaupungin parhaat tarjoukset ja säästä jopa -50%</p>
            </div>

            <div className="w-full lg:max-w-xl">
              <SearchBar
                onSearch={(q, c) => handleSearch(q, c, selectedCategory, sortBy, freeDelivery)}
                initialQuery={searchQuery}
                initialCity={city}
                currentSort={sortBy}
                isFreeDelivery={freeDelivery}
                onSortChange={setSortBy}
                onToggleFreeDelivery={() => setFreeDelivery(prev => !prev)}
              />
            </div>
          </div>

          {/* Quick Categories & Filters Tier */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {['Kaikki', 'Burgerit', 'Sushi', 'Pizza', 'Salaatit', 'Kiinalainen', 'Vegaani', 'Leipomo'].map((tag, i) => (
                <button
                  key={tag}
                  onClick={() => {
                    // If clicking same category, toggle off (back to Kaikki)? Or just select it.
                    // Usually distinct selection.
                    handleSearch('', city, tag, sortBy, freeDelivery)
                  }}
                  className={`flex-shrink-0 px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all border ${selectedCategory === tag
                    ? 'bg-[#3d1d11] text-white border-[#3d1d11] shadow-lg scale-105'
                    : 'bg-white text-[#3d1d11] border-[#f1ebd8] hover:border-[#d35400]/30 hover:bg-[#fdf2e2]/50'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-7xl pt-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Main Content Area */}
          <div className="flex-1 space-y-12">

            {/* Featured Section - More wide for Web */}
            {!searchQuery && (
              <section className="relative">
                <div
                  className="featured-card h-[400px] md:h-[500px] group cursor-pointer shadow-2xl"
                  onMouseEnter={() => setHoveredOffer({
                    id: 'featured-special',
                    meal: {
                      name: 'Gourmet Burger Kitchen Special',
                      description: 'Ravintolan suosituimmat säästöateriat vain tänään puoleen hintaan. Koe kaupungin parhaat burgerit uskomattomin hinnoin.',
                      restaurant: { name: 'Gourmet Burger Kitchen', rating: 4.9, city: { name: 'Helsinki' } },
                      diet_flags: [],
                      image_path: 'burger'
                    },
                    source: { name: 'Päivän Erikoistarjous' },
                    price_cents: 890,
                    old_price_cents: 1780,
                    delivery_fee_cents: 0,
                    eta_minutes: 20
                  } as any)}
                  onMouseLeave={() => setHoveredOffer(null)}
                >
                  <Image
                    src="/images/burger.jpg"
                    alt="Daily Special"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#3d1d11] via-[#3d1d11]/40 to-transparent" />

                  <div className="absolute top-10 left-10 anim-float">
                    <div className="bg-[#f3d179] text-[#3d1d11] text-lg md:text-xl font-black px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-white/20">
                      <div className="bg-[#3d1d11] text-white p-1 rounded-lg">
                        <TrendingDown className="w-5 h-5" />
                      </div>
                      SÄÄSTÄ -50%
                    </div>
                  </div>

                  <div className="absolute bottom-12 left-12 right-12 text-white">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      <span className="bg-[#d35400] text-white text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg border border-white/10">PÄIVÄN ERIKOINEN</span>
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border border-white/10">
                        <Clock className="w-4 h-4 text-[#f3d179]" />
                        15–25 min
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border border-white/10">
                        <Star className="w-4 h-4 text-[#f3d179] fill-[#f3d179]" />
                        4.9 (500+)
                      </div>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-none">Gourmet Burger <br /><span className="text-[#f3d179]">Kitchen</span></h2>
                    <p className="text-[#fdf2e2]/70 font-medium max-w-xl text-lg leading-relaxed hidden md:block border-l-4 border-[#d35400] pl-6">
                      Ravintolan suosituimmat säästöateriat vain tänään puoleen hintaan. Koe kaupungin parhaat burgerit uskomattomin hinnoin.
                    </p>
                    <Link href="/search">
                      <button className="mt-8 bg-white text-[#3d1d11] px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-[#f3d179] hover:scale-105 active:scale-95 transition-all shadow-xl">
                        Tilaa Heti
                      </button>
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* Direct-order partner spotlight (additive — separate from the aggregator feed) */}
            <HomepagePizzaPizzaCard />

            {/* Daily Best Deals - Responsive Grid */}
            <section>
              <div className="flex items-end justify-between mb-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#d35400] text-xs font-black uppercase tracking-[0.2em]">
                    <div className="w-8 h-[2px] bg-[#d35400]" />
                    Top Poiminnat
                  </div>
                  <h2 className="text-4xl font-black text-[#3d1d11] tracking-tight">Päivän parhaat <span className="text-[#d35400]">tarjoukset</span></h2>
                  <p className="text-[#a08a7e] font-medium">Parhaat hinnat juuri nyt lähelläsi päivitettynä reaaliajassa</p>
                </div>
                <Link href="/search">
                  <button className="flex items-center gap-3 text-[#3d1d11] hover:text-[#d35400] transition-colors p-4 rounded-2xl bg-white border border-[#f1ebd8] shadow-sm font-black uppercase text-[10px] tracking-widest group">
                    Katso kaikki
                    <div className="bg-[#3d1d11] group-hover:bg-[#d35400] p-1 rounded-lg transition-colors">
                      <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                  </button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
                ) : offers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    onMouseEnter={() => setHoveredOffer(offer)}
                    onMouseLeave={() => setHoveredOffer(null)}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Desktop Web Sidebar - Sticky Preview & Info */}
          <aside className="hidden lg:block w-[400px] flex-shrink-0">
            <div className="sticky top-8 space-y-8">
              {/* Quick Preview Panel */}
              <div className="app-shadow rounded-[3rem]">
                <OfferPreview offer={hoveredOffer || offers[0] || null} />
              </div>

              {/* Stats Card */}
              <div className="bg-[#3d1d11] rounded-[3rem] p-10 text-white card-shadow overflow-hidden relative group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#d35400]/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#f3d179]/10 blur-3xl rounded-full" />

                <h3 className="text-xl font-black mb-8 flex items-center gap-3 relative z-10">
                  <div className="bg-[#f3d179] p-2 rounded-xl">
                    <Star className="w-5 h-5 text-[#3d1d11] fill-[#3d1d11]" />
                  </div>
                  FoodAi Tilastot
                </h3>

                <div className="space-y-8 relative z-10">
                  <div className="flex items-center justify-between group/item">
                    <span className="text-sm font-bold text-white/50 group-hover/item:text-white/80 transition-colors">Ravintoloita</span>
                    <div className="text-right">
                      <span className="text-2xl font-black block">1,240+</span>
                      <span className="text-[10px] text-[#f39c12] font-black uppercase tracking-widest">+12 tänään</span>
                    </div>
                  </div>
                  <div className="h-[1px] bg-white/5" />
                  <div className="flex items-center justify-between group/item">
                    <span className="text-sm font-bold text-white/50 group-hover/item:text-white/80 transition-colors">Kaupunkeja</span>
                    <span className="text-2xl font-black">{cities.length || 15}</span>
                  </div>
                  <div className="h-[1px] bg-white/5" />
                  <div className="flex items-center justify-between group/item">
                    <span className="text-sm font-bold text-white/50 group-hover/item:text-white/80 transition-colors">Tarjouksia</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-[#f3d179]">3,450+</span>
                      <span className="text-[10px] text-[#27ae60] font-black uppercase tracking-widest">Aktiivisia</span>
                    </div>
                  </div>
                </div>

                <Link href="#">
                  <button className="w-full mt-10 bg-white/5 hover:bg-white/10 border border-white/10 transition-all py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
                    Lataa Sovellus
                  </button>
                </Link>
              </div>

              {/* Newsletter / Promo */}
              <div className="bg-[#fdf2e2] rounded-[3rem] p-10 border border-[#3d1d11]/5 relative overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#d35400]/5 rounded-full -mr-12 -mt-12" />
                <h4 className="text-lg font-black text-[#3d1d11] mb-2 uppercase tracking-tight">Uutiskirje</h4>
                <p className="text-sm text-[#a08a7e] mb-6 font-medium">Saa parhaat säästövinkit suoraan sähköpostiisi viikoittain.</p>
                <div className="relative group">
                  <input
                    type="email"
                    placeholder="Sähköpostiosoite"
                    className="w-full bg-white rounded-2xl py-5 px-6 text-sm border-none focus:ring-2 focus:ring-[#d35400] app-shadow placeholder:text-[#a08a7e]/50 transition-all"
                  />
                  <button className="absolute right-2 top-2 bottom-2 px-6 bg-[#3d1d11] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#d35400] transition-colors shadow-lg">Tilaa</button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Categories Section - Wider for Web */}
        <section className="mt-32">
          <div className="flex items-center justify-between mb-12">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#d35400] text-xs font-black uppercase tracking-[0.2em]">
                <div className="w-8 h-[2px] bg-[#d35400]" />
                Selaa Lajin mukaan
              </div>
              <h2 className="text-4xl font-black text-[#3d1d11] tracking-tight">Suositut <span className="text-[#d35400]">kategoriat</span></h2>
            </div>
            <div className="flex gap-3">
              <button className="w-12 h-12 rounded-full bg-white border border-[#f1ebd8] hover:bg-[#3d1d11] hover:text-white transition-all flex items-center justify-center app-shadow group">
                <ChevronRight className="w-5 h-5 rotate-180 group-hover:scale-110 transition-transform" />
              </button>
              <button className="w-12 h-12 rounded-full bg-white border border-[#f1ebd8] hover:bg-[#3d1d11] hover:text-white transition-all flex items-center justify-center app-shadow group">
                <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              { label: 'Suomalainen', icon: '🍲', count: '124', color: '#f0f4ff' },
              { label: 'Leipomo', icon: '🥐', count: '86', color: '#fff9f0' },
              { label: 'Aasialainen', icon: '🍣', count: '210', color: '#fff0f0' },
              { label: 'Vegaani', icon: '🥗', count: '54', color: '#f0fff4' },
              { label: 'Italia', icon: '🍕', count: '312', color: '#fff5f0' },
              { label: 'Burgerit', icon: '🍔', count: '145', color: '#fffbef' },
            ].map((cat) => (
              <div key={cat.label} className="category-item group">
                <div
                  className="w-28 h-28 md:w-32 md:h-32 rounded-[2.5rem] flex items-center justify-center mb-4 transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-2xl relative overflow-hidden"
                  style={{ backgroundColor: cat.color }}
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-5xl md:text-6xl transform group-hover:scale-110 transition-transform duration-500 z-10">{cat.icon}</span>
                </div>
                <div className="text-center">
                  <span className="block text-sm font-black uppercase tracking-widest text-[#3d1d11] mb-1">{cat.label}</span>
                  <span className="text-[10px] text-[#a08a7e] font-bold uppercase tracking-tighter bg-[#fdf2e2] px-2 py-0.5 rounded-lg border border-[#3d1d11]/5">{cat.count} tarjousta</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Secondary Results / Recommendation Grid */}
        <section className="mt-32 pb-20">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-4xl font-black text-[#3d1d11] tracking-tight">Sinulle <span className="text-[#d35400]">suositeltua</span></h2>
            <div className="flex-grow h-[2px] bg-[#f1ebd8] rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(offers.length > 0 ? offers.slice(0, 4) : generateDemoOffers().slice(0, 4)).map((offer) => (
              <OfferCard key={`rec-${offer.id}`} offer={offer} />
            ))}
          </div>
        </section>
      </div>

      <Footer />

      {/* Floating Map Button - Still useful on web */}
      <div className="fixed bottom-10 right-10 z-40 hidden md:block">
        <button className="bg-[#3d1d11] text-white pl-6 pr-8 py-4 rounded-full flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all group font-black uppercase text-xs tracking-[0.15em]">
          <div className="w-8 h-8 rounded-full bg-[#f3d179] flex items-center justify-center -ml-2 text-[#3d1d11]">
            <MapPin className="w-4 h-4" />
          </div>
          Karttanäkymä
        </button>
      </div>
    </div>
  )
}
