import {
  Appointment,
  Barber,
  BusinessConfig,
  ClientSubscription,
  Comanda,
  ComandaItem,
  Customer,
  FinancialEntry,
  GalleryPhoto,
  PaymentMethod,
  Product,
  Service,
  SubscriptionPlan,
  SuppliesItem,
} from '../types';

import heroImgUrl from '../assets/images/barbershop_hero_1793279569824.jpg';
import barberMarcusImgUrl from '../assets/images/barber_marcus_1793279571037.jpg';
import barberLucasImgUrl from '../assets/images/barber_lucas_1793279572541.jpg';
import barberRafaelImgUrl from '../assets/images/barber_rafael_1793279571807.jpg';

// Image paths bundled by Vite for Vercel and production deployment
export const HERO_IMAGE = heroImgUrl;
export const BARBER_MARCUS_IMG = barberMarcusImgUrl;
export const BARBER_LUCAS_IMG = barberLucasImgUrl;
export const BARBER_RAFAEL_IMG = barberRafaelImgUrl;

// Helper to normalize any legacy string URLs to the bundled assets
export function resolveImageUrl(url: string | undefined): string {
  if (!url) return BARBER_MARCUS_IMG;
  if (url.includes('barber_marcus') || url.includes('marcus_1793279571037')) return BARBER_MARCUS_IMG;
  if (url.includes('barber_lucas') || url.includes('lucas_1793279572541')) return BARBER_LUCAS_IMG;
  if (url.includes('barber_rafael') || url.includes('rafael_1793279571807')) return BARBER_RAFAEL_IMG;
  if (url.includes('barbershop_hero') || url.includes('hero_1793279569824')) return HERO_IMAGE;
  return url;
}

// Helper to convert and compress uploaded File to compact Base64 Data URL (prevents localStorage QuotaExceededError on Vercel)
export function compressImageFile(file: File, maxWidth = 480, maxHeight = 480, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        resolve(BARBER_MARCUS_IMG);
        return;
      }
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(result);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch {
          resolve(result);
        }
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = () => resolve(BARBER_MARCUS_IMG);
    reader.readAsDataURL(file);
  });
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return compressImageFile(file);
}

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-combo-rei',
    name: 'Combo Rei Império (Corte + Barba + Sobrancelha)',
    category: 'combo',
    description: 'Corte completo personalizado, barboterapia com toalha quente e alinhamento de sobrancelha.',
    durationMinutes: 70,
    price: 95,
    popular: true,
  },
  {
    id: 'srv-corte-imperial',
    name: 'Corte Imperial (Degradê & Tesoura)',
    category: 'cabelo',
    description: 'Fade com navalha ou tesoura artesanal, lavagem com shampoo refrescante e finalização com pomada matte.',
    durationMinutes: 45,
    price: 55,
    popular: true,
  },
  {
    id: 'srv-barboterapia',
    name: 'Barboterapia Imperial com Toalha Quente',
    category: 'barba',
    description: 'Massagem facial, esfoliação, toalha quente aromática, desenho na navalha e balm hidratante especial.',
    durationMinutes: 35,
    price: 45,
    popular: true,
  },
  {
    id: 'srv-corte-barba-express',
    name: 'Combo Clássico (Corte + Barba Simples)',
    category: 'combo',
    description: 'Corte tradicional e alinhamento rápido da barba na lâmina.',
    durationMinutes: 55,
    price: 85,
  },
  {
    id: 'srv-pigmentacao',
    name: 'Pigmentação de Barba & Contorno',
    category: 'quimica',
    description: 'Preenchimento de falhas e destaque impecável dos contornos com tintura especial hipoalergênica.',
    durationMinutes: 30,
    price: 40,
  },
  {
    id: 'srv-sobrancelha',
    name: 'Design de Sobrancelha na Navalha',
    category: 'especial',
    description: 'Alinhamento preciso e limpeza mantendo o aspecto natural masculino.',
    durationMinutes: 15,
    price: 20,
  },
  {
    id: 'srv-alisamento',
    name: 'Alinhamento Capilar / Selagem Orgânica',
    category: 'quimica',
    description: 'Redução de volume e controle do frizz sem formol, fios alinhados e sedosos.',
    durationMinutes: 60,
    price: 90,
  },
  {
    id: 'srv-kids',
    name: 'Corte Teen / Infantil com Paciência',
    category: 'cabelo',
    description: 'Atendimento especial e descontraído para crianças e adolescentes.',
    durationMinutes: 35,
    price: 45,
  },
];

export const INITIAL_BARBERS: Barber[] = [
  {
    id: 'barber-marcus',
    name: 'Marcus "Imperador"',
    nickname: 'Marcus',
    role: 'Master Barber & Fundador',
    rating: 4.98,
    totalReviews: 342,
    photoUrl: BARBER_MARCUS_IMG,
    bio: 'Mais de 12 anos de experiência. Especialista em degradê milimétrico e visagismo masculino.',
    specialties: ['Degradê Navalhado', 'Visagismo', 'Corte Clássico'],
    active: true,
    commissionPercentage: 55,
    workingHours: { start: '09:00', end: '20:00' },
  },
  {
    id: 'barber-lucas',
    name: 'Lucas "Navalha"',
    nickname: 'Lucas',
    role: 'Barbeiro Estilista',
    rating: 4.95,
    totalReviews: 218,
    photoUrl: BARBER_LUCAS_IMG,
    bio: 'Referência em cortes modernos, freestyle e cortes jovens de alta precisão.',
    specialties: ['Fade Moderno', 'Freestyle', 'Texturização'],
    active: true,
    commissionPercentage: 50,
    workingHours: { start: '09:00', end: '19:30' },
  },
  {
    id: 'barber-rafael',
    name: 'Rafael "Clássico"',
    nickname: 'Rafael',
    role: 'Especialista em Barbas & Barboterapia',
    rating: 4.97,
    totalReviews: 289,
    photoUrl: BARBER_RAFAEL_IMG,
    bio: 'Mestre da lâmina tradicional, toalha quente e cuidados com barbas longas e desenhadas.',
    specialties: ['Barboterapia', 'Tratamentos de Barba', 'Tesoura'],
    active: true,
    commissionPercentage: 50,
    workingHours: { start: '10:00', end: '20:00' },
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Pomada Modeladora Matte Império (120g)',
    category: 'pomada',
    price: 48,
    costPrice: 18,
    stock: 24,
    description: 'Efeito seco, fixação forte e fragrância amadeirada nobre. Não deixa resíduos.',
    active: true,
  },
  {
    id: 'prod-2',
    name: 'Óleo Hidratante Premium para Barba (30ml)',
    category: 'barba',
    price: 38,
    costPrice: 14,
    stock: 19,
    description: 'Óleo de argan e jojoba. Hidratação profunda, brilho natural e maciez imediata.',
    active: true,
  },
  {
    id: 'prod-3',
    name: 'Balm Modelador & Refrescante Pós-Barba (100ml)',
    category: 'barba',
    price: 35,
    costPrice: 12,
    stock: 15,
    description: 'Acalma a pele após a lâmina, previne foliculite e perfuma suavemente.',
    active: true,
  },
  {
    id: 'prod-4',
    name: 'Shampoo Antiqueda & Mentol Ice (300ml)',
    category: 'shampoo',
    price: 42,
    costPrice: 16,
    stock: 11,
    description: 'Estimula a circulação do couro cabeludo e proporciona frescor revigorante.',
    active: true,
  },
  {
    id: 'prod-5',
    name: 'Cerveja Artesanal IPA Império (600ml)',
    category: 'bebida',
    price: 22,
    costPrice: 9.5,
    stock: 42,
    description: 'Cerveja artesanal puro malte gelada servida no lounge da barbearia.',
    active: true,
  },
  {
    id: 'prod-6',
    name: 'Minoxidil Fortalecedor Capilar & Barba 5%',
    category: 'outro',
    price: 65,
    costPrice: 28,
    stock: 8,
    description: 'Tratamento intensivo para preenchimento de falhas de barba e densidade capilar.',
    active: true,
  },
];

export const INITIAL_CONFIG: BusinessConfig = {
  name: 'Império Barbearia',
  slogan: 'Onde o homem moderno encontra o padrão de rei.',
  whatsappBusiness: '',
  phone: '',
  address: '',
  neighborhood: '',
  city: 'São Paulo',
  state: 'SP',
  instagram: '@imperiobarbearia',
  openingHour: '09:00',
  closingHour: '20:00',
  slotIntervalMinutes: 30,
  pixKey: '',
  heroImageUrl: HERO_IMAGE,
  galleryPhotos: [
    {
      id: 'gal-1',
      url: HERO_IMAGE,
      title: 'Salão Principal & Cadeiras Retrô',
      category: 'ambiente',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'gal-2',
      url: BARBER_MARCUS_IMG,
      title: 'Mestre da Tesoura e Visagismo',
      category: 'equipe',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'gal-3',
      url: BARBER_LUCAS_IMG,
      title: 'Fade Moderno & Acabamento na Lâmina',
      category: 'corte',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'gal-4',
      url: BARBER_RAFAEL_IMG,
      title: 'Barboterapia com Toalha Quente',
      category: 'ambiente',
      createdAt: new Date().toISOString(),
    },
  ],
};

export const INITIAL_SUPPLIES: SuppliesItem[] = [
  {
    id: 'sup-1',
    name: 'Lâminas de Barbear Platinum Duplo Fio',
    category: 'descartavel',
    quantity: 120,
    minQuantity: 30,
    unit: 'un',
    costPrice: 0.85,
    supplier: 'Distribuidora Barber Pro SP',
    lastRestocked: '2025-05-10',
  },
  {
    id: 'sup-2',
    name: 'Golas Higiênicas Descartáveis (Rolos 100un)',
    category: 'higiene',
    quantity: 8,
    minQuantity: 3,
    unit: 'cx',
    costPrice: 18.5,
    supplier: 'Distribuidora Barber Pro SP',
    lastRestocked: '2025-05-12',
  },
  {
    id: 'sup-3',
    name: 'Toalhas Descartáveis Premium Algodão (Pct 50un)',
    category: 'descartavel',
    quantity: 6,
    minQuantity: 2,
    unit: 'pct',
    costPrice: 32,
    supplier: 'Mega Barber Brasil',
    lastRestocked: '2025-05-08',
  },
  {
    id: 'sup-4',
    name: 'Álcool 70% Spray Antisséptico Barbearia',
    category: 'higiene',
    quantity: 4,
    minQuantity: 2,
    unit: 'litros',
    costPrice: 14,
    supplier: 'Mega Barber Brasil',
    lastRestocked: '2025-05-01',
  },
  {
    id: 'sup-5',
    name: 'Loção Pós-Barba Refrescante Galão 5L',
    category: 'quimica',
    quantity: 2,
    minQuantity: 1,
    unit: 'litros',
    costPrice: 75,
    supplier: 'Cosméticos Barber King',
    lastRestocked: '2025-04-20',
  },
  {
    id: 'sup-6',
    name: 'Café Espresso Gourmet em Grãos (Lounge)',
    category: 'lounge',
    quantity: 3,
    minQuantity: 2,
    unit: 'pct',
    costPrice: 48,
    supplier: 'Torrefação Mogiana',
    lastRestocked: '2025-05-11',
  },
];

export const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-cabelo-vip',
    name: 'Plano Cabelo VIP',
    priceMonthly: 89.9,
    description: 'Para quem gosta de manter o fade sempre afiado na régua toda semana.',
    benefits: [
      'Cortes ilimitados no mês (ou até 4 visitas)',
      'Lavagem especial e massagem capilar inclusa',
      '10% de desconto em qualquer produto do balcão',
      'Cerveja artesanal ou café expresso grátis em cada visita',
      'Agendamento prioritário no app',
    ],
    popular: true,
    active: true,
  },
  {
    id: 'plan-barba-rei',
    name: 'Plano Barba de Rei',
    priceMonthly: 79.9,
    description: 'Sua barba desenhada, alinhada e macia sempre com tratamento vip.',
    benefits: [
      'Barboterapia completa ilimitada (até 4 visitas/mês)',
      'Toalha quente com essência aromática',
      'Hidratação profunda com óleo e balm exclusivo',
      '10% de desconto em pomadas e óleos',
      'Bebida gelada de cortesia',
    ],
    popular: false,
    active: true,
  },
  {
    id: 'plan-imperio-black',
    name: 'Clube Império Black Total',
    priceMonthly: 139.9,
    description: 'Experiência completa e ilimitada de cabelo e barba com status de rei.',
    benefits: [
      'Cortes e Barboterapia ilimitados no mês',
      'Alinhamento de sobrancelha cortesia',
      'Horários preferenciais inclusive sextas e sábados',
      '15% de desconto em toda a linha de produtos',
      'Open bar de cervejas artesanais e drinks no lounge',
      'Cartão fidelidade VIP digital',
    ],
    popular: true,
    active: true,
  },
];

// Start with clean customer list
export const INITIAL_CUSTOMERS: Customer[] = [];

// Helper to get formatted today string (YYYY-MM-DD)
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatBRL(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function cleanPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function formatPhone(phone: string): string {
  const digits = cleanPhoneDigits(phone);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

// Storage keys
const STORAGE_APPOINTMENTS = 'barbearia_imperio_appointments_v1';
const STORAGE_CUSTOMERS = 'barbearia_imperio_customers_v1';
const STORAGE_BARBERS = 'barbearia_imperio_barbers_v1';
const STORAGE_SERVICES = 'barbearia_imperio_services_v1';
const STORAGE_PRODUCTS = 'barbearia_imperio_products_v1';
const STORAGE_SUPPLIES = 'barbearia_imperio_supplies_v1';
const STORAGE_PLANS = 'barbearia_imperio_plans_v1';
const STORAGE_FINANCIAL = 'barbearia_imperio_financial_v1';
const STORAGE_CONFIG = 'barbearia_imperio_config_v1';
const STORAGE_SUBSCRIPTIONS = 'barbearia_imperio_subscriptions_v1';
const STORAGE_COMANDAS = 'barbearia_imperio_comandas_v1';
const STORAGE_CLEAN_KEY = 'barbearia_imperio_clean_slate_applied_v3';

// Zeroed initial financial entries
export function getInitialFinancialEntries(): FinancialEntry[] {
  return [];
}

// Zeroed initial appointments
export function getInitialAppointments(): Appointment[] {
  return [];
}

// Ensure clean slate on startup as requested by owner
export function applyCleanSlateIfNeeded(): void {
  try {
    if (!localStorage.getItem(STORAGE_CLEAN_KEY)) {
      localStorage.setItem(STORAGE_APPOINTMENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_FINANCIAL, JSON.stringify([]));
      localStorage.setItem(STORAGE_CUSTOMERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_COMANDAS, JSON.stringify([]));
      localStorage.setItem(STORAGE_CLEAN_KEY, 'true');
    }
  } catch {
    // ignore
  }
}
applyCleanSlateIfNeeded();

// Cross-tab and window real-time broadcast channel (100% functional on Vercel)
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('imperio_sync_channel');
    broadcastChannel.onmessage = (event) => {
      if (event.data?.type === 'STORAGE_CHANGED') {
        window.dispatchEvent(new Event('imperio_storage_updated'));
      }
    };
  } catch {
    // fallback to storage event
  }
}

// Dispatches local event and broadcasts to all other browser tabs/windows
export function notifyStorageUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('imperio_storage_updated'));
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type: 'STORAGE_CHANGED', timestamp: Date.now() });
      } catch {
        // ignore
      }
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', () => {
    window.dispatchEvent(new Event('imperio_storage_updated'));
  });
}

// Multi-browser and server synchronization helper
export function pushToServer(key: string, data: any): void {
  try {
    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: data }),
    }).catch(() => {
      // Server not reachable or static host without backend: perfectly normal, data is already saved locally!
    });
  } catch {
    // ignore
  }
}

// Global server sync to ensure all devices / browsers share the exact same state
export async function syncWithServer(): Promise<boolean> {
  try {
    const res = await fetch('/api/db');
    if (!res.ok) return false;
    const contentType = res.headers.get('content-type') || '';
    // If the host returned an HTML fallback (Vercel SPA rewrite), ignore gracefully
    if (!contentType.includes('application/json')) return false;

    const data = await res.json();
    if (!data || typeof data !== 'object') return false;

    // If server has no barbers/services yet (brand new server instance), initialize server with current defaults
    if (!data.barbers || data.barbers.length === 0) {
      const initialBundle = {
        config: loadConfig(),
        services: loadServices(),
        barbers: loadBarbers(),
        products: loadProducts(),
        supplies: loadSupplies(),
        plans: loadPlans(),
        appointments: loadAppointments(),
        customers: loadCustomers(),
        financialEntries: loadFinancialEntries(),
        comandas: loadComandas(),
        subscriptions: loadSubscriptions(),
      };
      await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initialBundle),
      }).catch(() => {});
      return true;
    }

    // Server has data: synchronize into this browser's localStorage using non-destructive Smart Merge!
    let hasChanges = false;
    if (data.barbers && Array.isArray(data.barbers) && data.barbers.length > 0) {
      const currentLocal = loadBarbers();
      const barberMap = new Map<string, Barber>();
      data.barbers.forEach((b: Barber) => {
        if (b && b.id) barberMap.set(b.id, { ...b, photoUrl: resolveImageUrl(b.photoUrl) });
      });
      currentLocal.forEach((b: Barber) => {
        if (b && b.id) barberMap.set(b.id, { ...b, photoUrl: resolveImageUrl(b.photoUrl) });
      });
      const mergedBarbers = Array.from(barberMap.values());
      localStorage.setItem(STORAGE_BARBERS, JSON.stringify(mergedBarbers));
      if (mergedBarbers.length > data.barbers.length) {
        pushToServer('barbers', mergedBarbers);
      }
      hasChanges = true;
    }

    if (data.services && Array.isArray(data.services) && data.services.length > 0) {
      const currentLocal = loadServices();
      const serviceMap = new Map<string, Service>();
      data.services.forEach((s: Service) => {
        if (s && s.id) serviceMap.set(s.id, s);
      });
      currentLocal.forEach((s: Service) => {
        if (s && s.id) serviceMap.set(s.id, s);
      });
      const mergedServices = Array.from(serviceMap.values());
      localStorage.setItem(STORAGE_SERVICES, JSON.stringify(mergedServices));
      hasChanges = true;
    }

    if (data.products && Array.isArray(data.products) && data.products.length > 0) {
      const currentLocal = loadProducts();
      const productMap = new Map<string, Product>();
      data.products.forEach((p: Product) => {
        if (p && p.id) productMap.set(p.id, p);
      });
      currentLocal.forEach((p: Product) => {
        if (p && p.id) productMap.set(p.id, p);
      });
      localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(Array.from(productMap.values())));
      hasChanges = true;
    }

    if (data.supplies && Array.isArray(data.supplies) && data.supplies.length > 0) {
      const currentLocal = loadSupplies();
      const supplyMap = new Map<string, SuppliesItem>();
      data.supplies.forEach((s: SuppliesItem) => {
        if (s && s.id) supplyMap.set(s.id, s);
      });
      currentLocal.forEach((s: SuppliesItem) => {
        if (s && s.id) supplyMap.set(s.id, s);
      });
      localStorage.setItem(STORAGE_SUPPLIES, JSON.stringify(Array.from(supplyMap.values())));
      hasChanges = true;
    }

    if (data.plans && Array.isArray(data.plans) && data.plans.length > 0) {
      const currentLocal = loadPlans();
      const planMap = new Map<string, SubscriptionPlan>();
      data.plans.forEach((p: SubscriptionPlan) => {
        if (p && p.id) planMap.set(p.id, p);
      });
      currentLocal.forEach((p: SubscriptionPlan) => {
        if (p && p.id) planMap.set(p.id, p);
      });
      localStorage.setItem(STORAGE_PLANS, JSON.stringify(Array.from(planMap.values())));
      hasChanges = true;
    }

    if (data.config && typeof data.config === 'object' && Object.keys(data.config).length > 0) {
      localStorage.setItem(STORAGE_CONFIG, JSON.stringify(data.config));
      hasChanges = true;
    }

    if (data.appointments !== undefined && Array.isArray(data.appointments)) {
      const currentLocal = loadAppointments();
      const aptMap = new Map<string, Appointment>();
      data.appointments.forEach((a: Appointment) => {
        if (a && a.id) aptMap.set(a.id, a);
      });
      currentLocal.forEach((a: Appointment) => {
        if (a && a.id) aptMap.set(a.id, a);
      });
      localStorage.setItem(STORAGE_APPOINTMENTS, JSON.stringify(Array.from(aptMap.values())));
      hasChanges = true;
    }

    if (data.customers !== undefined && Array.isArray(data.customers)) {
      const currentLocal = loadCustomers();
      const custMap = new Map<string, Customer>();
      data.customers.forEach((c: Customer) => {
        if (c && c.id) custMap.set(c.id, c);
      });
      currentLocal.forEach((c: Customer) => {
        if (c && c.id) custMap.set(c.id, c);
      });
      localStorage.setItem(STORAGE_CUSTOMERS, JSON.stringify(Array.from(custMap.values())));
      hasChanges = true;
    }

    if (data.financialEntries !== undefined && Array.isArray(data.financialEntries)) {
      const currentLocal = loadFinancialEntries();
      const finMap = new Map<string, FinancialEntry>();
      data.financialEntries.forEach((f: FinancialEntry) => {
        if (f && f.id) finMap.set(f.id, f);
      });
      currentLocal.forEach((f: FinancialEntry) => {
        if (f && f.id) finMap.set(f.id, f);
      });
      localStorage.setItem(STORAGE_FINANCIAL, JSON.stringify(Array.from(finMap.values())));
      hasChanges = true;
    }

    if (data.comandas !== undefined && Array.isArray(data.comandas)) {
      const currentLocal = loadComandas();
      const cmdMap = new Map<string, Comanda>();
      data.comandas.forEach((c: Comanda) => {
        if (c && c.id) cmdMap.set(c.id, c);
      });
      currentLocal.forEach((c: Comanda) => {
        if (c && c.id) cmdMap.set(c.id, c);
      });
      localStorage.setItem(STORAGE_COMANDAS, JSON.stringify(Array.from(cmdMap.values())));
      hasChanges = true;
    }

    if (data.subscriptions !== undefined && Array.isArray(data.subscriptions)) {
      const currentLocal = loadSubscriptions();
      const subMap = new Map<string, ClientSubscription>();
      data.subscriptions.forEach((s: ClientSubscription) => {
        if (s && s.id) subMap.set(s.id, s);
      });
      currentLocal.forEach((s: ClientSubscription) => {
        if (s && s.id) subMap.set(s.id, s);
      });
      localStorage.setItem(STORAGE_SUBSCRIPTIONS, JSON.stringify(Array.from(subMap.values())));
      hasChanges = true;
    }

    if (hasChanges) {
      notifyStorageUpdated();
    }
    return true;
  } catch (err) {
    return false;
  }
}

// Kick off server sync on startup
if (typeof window !== 'undefined') {
  syncWithServer();
  // Keep alive sync when window gains focus or online
  window.addEventListener('focus', () => syncWithServer());
}

// Manually zero all operational data (agenda, finance, customers, comandas)
export function resetAllAdminData(): void {
  localStorage.setItem(STORAGE_APPOINTMENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_FINANCIAL, JSON.stringify([]));
  localStorage.setItem(STORAGE_CUSTOMERS, JSON.stringify([]));
  localStorage.setItem(STORAGE_COMANDAS, JSON.stringify([]));
  try {
    fetch('/api/reset-operational', { method: 'POST' }).catch(() => {});
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event('imperio_storage_updated'));
}

// Storage helpers
export function loadServices(): Service[] {
  try {
    const raw = localStorage.getItem(STORAGE_SERVICES);
    if (!raw) {
      localStorage.setItem(STORAGE_SERVICES, JSON.stringify(INITIAL_SERVICES));
      return INITIAL_SERVICES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SERVICES;
  }
}

export function saveServices(services: Service[]): void {
  localStorage.setItem(STORAGE_SERVICES, JSON.stringify(services));
  pushToServer('services', services);
  notifyStorageUpdated();
}

export function loadBarbers(): Barber[] {
  try {
    const raw = localStorage.getItem(STORAGE_BARBERS);
    if (!raw) {
      localStorage.setItem(STORAGE_BARBERS, JSON.stringify(INITIAL_BARBERS));
      return INITIAL_BARBERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((b: Barber) => ({
        ...b,
        photoUrl: resolveImageUrl(b.photoUrl),
      }));
    }
    return INITIAL_BARBERS;
  } catch {
    return INITIAL_BARBERS;
  }
}

export function saveBarbers(barbers: Barber[]): void {
  try {
    localStorage.setItem(STORAGE_BARBERS, JSON.stringify(barbers));
  } catch (err) {
    console.warn('LocalStorage error while saving barbers:', err);
    try {
      // If quota exceeded, sanitize extra large images
      const sanitized = barbers.map((b) => ({
        ...b,
        photoUrl: b.photoUrl && b.photoUrl.length > 80000 ? BARBER_MARCUS_IMG : b.photoUrl,
      }));
      localStorage.setItem(STORAGE_BARBERS, JSON.stringify(sanitized));
    } catch {
      // ignore
    }
  }
  pushToServer('barbers', barbers);
  notifyStorageUpdated();
}

export function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
  pushToServer('products', products);
  notifyStorageUpdated();
}

export function loadSupplies(): SuppliesItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_SUPPLIES);
    if (!raw) {
      localStorage.setItem(STORAGE_SUPPLIES, JSON.stringify(INITIAL_SUPPLIES));
      return INITIAL_SUPPLIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SUPPLIES;
  }
}

export function saveSupplies(supplies: SuppliesItem[]): void {
  localStorage.setItem(STORAGE_SUPPLIES, JSON.stringify(supplies));
  pushToServer('supplies', supplies);
  notifyStorageUpdated();
}

export function loadPlans(): SubscriptionPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_PLANS);
    if (!raw) {
      localStorage.setItem(STORAGE_PLANS, JSON.stringify(INITIAL_PLANS));
      return INITIAL_PLANS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PLANS;
  }
}

export function savePlans(plans: SubscriptionPlan[]): void {
  localStorage.setItem(STORAGE_PLANS, JSON.stringify(plans));
  pushToServer('plans', plans);
  notifyStorageUpdated();
}

export function loadFinancialEntries(): FinancialEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_FINANCIAL);
    if (!raw) {
      const initial = getInitialFinancialEntries();
      localStorage.setItem(STORAGE_FINANCIAL, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialFinancialEntries();
  }
}

export function saveFinancialEntries(entries: FinancialEntry[]): void {
  localStorage.setItem(STORAGE_FINANCIAL, JSON.stringify(entries));
  pushToServer('financialEntries', entries);
  notifyStorageUpdated();
}

export function addFinancialEntry(entry: Omit<FinancialEntry, 'id' | 'createdAt'>): FinancialEntry {
  const entries = loadFinancialEntries();
  const newEntry: FinancialEntry = {
    ...entry,
    id: 'fin-' + Date.now(),
    createdAt: new Date().toISOString(),
  };
  saveFinancialEntries([newEntry, ...entries]);
  return newEntry;
}

export function loadCustomers(): Customer[] {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOMERS);
    if (!raw) {
      localStorage.setItem(STORAGE_CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
      return INITIAL_CUSTOMERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CUSTOMERS;
  }
}

export function saveCustomers(customers: Customer[]): void {
  localStorage.setItem(STORAGE_CUSTOMERS, JSON.stringify(customers));
  pushToServer('customers', customers);
  notifyStorageUpdated();
}

export function loadAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_APPOINTMENTS);
    if (!raw) {
      const initial = getInitialAppointments();
      localStorage.setItem(STORAGE_APPOINTMENTS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialAppointments();
  }
}

export function saveAppointments(appointments: Appointment[]): void {
  localStorage.setItem(STORAGE_APPOINTMENTS, JSON.stringify(appointments));
  pushToServer('appointments', appointments);
  notifyStorageUpdated();
}

export function loadConfig(): BusinessConfig {
  try {
    const raw = localStorage.getItem(STORAGE_CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_CONFIG, JSON.stringify(INITIAL_CONFIG));
      return INITIAL_CONFIG;
    }
    const parsed: BusinessConfig = JSON.parse(raw);
    if (!parsed.galleryPhotos || parsed.galleryPhotos.length === 0) {
      parsed.galleryPhotos = INITIAL_CONFIG.galleryPhotos;
    } else {
      parsed.galleryPhotos = parsed.galleryPhotos.map((p) => ({
        ...p,
        url: resolveImageUrl(p.url),
      }));
    }
    if (!parsed.heroImageUrl) {
      parsed.heroImageUrl = INITIAL_CONFIG.heroImageUrl;
    } else {
      parsed.heroImageUrl = resolveImageUrl(parsed.heroImageUrl);
    }
    return parsed;
  } catch {
    return INITIAL_CONFIG;
  }
}

export function saveConfig(config: BusinessConfig): void {
  localStorage.setItem(STORAGE_CONFIG, JSON.stringify(config));
  pushToServer('config', config);
  notifyStorageUpdated();
}

// Find customer by whatsapp digits
export function findCustomerByPhone(rawPhone: string): Customer | null {
  const digits = cleanPhoneDigits(rawPhone);
  if (digits.length < 8) return null;
  const customers = loadCustomers();
  // Check exact match or last 8/9 digits match
  return (
    customers.find((c) => {
      const cDigits = cleanPhoneDigits(c.whatsapp);
      if (cDigits === digits) return true;
      if (digits.length >= 8 && cDigits.endsWith(digits)) return true;
      if (cDigits.length >= 8 && digits.endsWith(cDigits)) return true;
      return false;
    }) || null
  );
}

// Save or auto-register customer
export function registerOrUpdateCustomer(name: string, rawPhone: string, notes?: string): Customer {
  const digits = cleanPhoneDigits(rawPhone);
  const customers = loadCustomers();
  const existing = findCustomerByPhone(rawPhone);

  if (existing) {
    const updated: Customer = {
      ...existing,
      name: name.trim() || existing.name,
      notes: notes || existing.notes,
      totalAppointments: existing.totalAppointments + 1,
      lastVisit: getTodayDateString(),
    };
    const newList = customers.map((c) => (c.id === existing.id ? updated : c));
    saveCustomers(newList);
    return updated;
  } else {
    const newCustomer: Customer = {
      id: 'cust-' + Date.now(),
      name: name.trim(),
      whatsapp: digits,
      notes: notes || '',
      totalAppointments: 1,
      lastVisit: getTodayDateString(),
      createdAt: getTodayDateString(),
    };
    saveCustomers([newCustomer, ...customers]);
    return newCustomer;
  }
}

// Time calculation helpers
export function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Generate available time slots for a given date, barber, and total duration
export function getAvailableSlots(
  date: string,
  barberId: string,
  durationMinutes: number = 30
): { time: string; available: boolean; conflictReason?: string }[] {
  const config = loadConfig();
  const barbers = loadBarbers();
  const appointments = loadAppointments();

  const barber = barbers.find((b) => b.id === barberId);
  const startMin = barber?.workingHours?.start
    ? parseTimeToMinutes(barber.workingHours.start)
    : parseTimeToMinutes(config.openingHour || '09:00');
  const endMin = barber?.workingHours?.end
    ? parseTimeToMinutes(barber.workingHours.end)
    : parseTimeToMinutes(config.closingHour || '20:00');
  const interval = config.slotIntervalMinutes || 30;

  // Filter existing active appointments for this barber and date
  const bookedSlots = appointments.filter(
    (apt) =>
      apt.date === date &&
      apt.barberId === barberId &&
      apt.status !== 'cancelado'
  );

  const slots: { time: string; available: boolean; conflictReason?: string }[] = [];

  for (let current = startMin; current + durationMinutes <= endMin; current += interval) {
    const timeStr = formatMinutesToTime(current);
    const slotEnd = current + durationMinutes;

    // Check collision with any booked appointment
    const hasConflict = bookedSlots.some((apt) => {
      const aptStart = parseTimeToMinutes(apt.time);
      const aptEnd = aptStart + (apt.totalDuration || 30);
      return current < aptEnd && slotEnd > aptStart;
    });

    slots.push({
      time: timeStr,
      available: !hasConflict,
      conflictReason: hasConflict ? 'Horário já reservado' : undefined,
    });
  }

  return slots;
}

// Generate direct WhatsApp link with pre-filled message
export function createCustomerWhatsAppMessageUrl(appointment: Appointment, config: BusinessConfig): string {
  const phone = cleanPhoneDigits(config.whatsappBusiness);
  const dateFormatted = appointment.date.split('-').reverse().join('/');
  
  const text = `👑 *Império Barbearia - Confirmação de Agendamento*
Olá! Gostaria de confirmar meu agendamento:

✂️ *Serviço(s):* ${appointment.servicesNames.join(' + ')}
💈 *Barbeiro:* ${appointment.barberName}
📅 *Data:* ${dateFormatted} às *${appointment.time}*
💰 *Valor:* ${formatBRL(appointment.totalPrice)}
👤 *Cliente:* ${appointment.customerName}
📱 *WhatsApp:* ${formatPhone(appointment.customerWhatsapp)}

Obrigado! Aguardo o atendimento no padrão Império.`;

  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
}

// Generate direct WhatsApp link to customer (from Admin dashboard)
export function createAdminToCustomerWhatsAppUrl(appointment: Appointment): string {
  const phone = cleanPhoneDigits(appointment.customerWhatsapp);
  const dateFormatted = appointment.date.split('-').reverse().join('/');

  const text = `Olá, *${appointment.customerName}*! Tudo bem?
Aqui é da *Império Barbearia* passando para lembrar do seu horário hoje/em breve:

✂️ *Serviço:* ${appointment.servicesNames.join(' + ')}
💈 *Profissional:* ${appointment.barberName}
📅 *Data:* ${dateFormatted} às *${appointment.time}*

Podemos confirmar sua presença? Estamos prontos para te receber com café gelado/cerveja artesanal no melhor estilo! 👑`;

  // Prepend 55 if not present
  const fullPhone = phone.length <= 11 ? `55${phone}` : phone;
  return `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(text)}`;
}

// ==========================================
// SUBSCRIPTIONS & MERCADO PAGO INTEGRATION
// ==========================================

export function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadSubscriptions(): ClientSubscription[] {
  try {
    const raw = localStorage.getItem(STORAGE_SUBSCRIPTIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSubscriptions(subs: ClientSubscription[]): void {
  localStorage.setItem(STORAGE_SUBSCRIPTIONS, JSON.stringify(subs));
  pushToServer('subscriptions', subs);
  notifyStorageUpdated();
}

// Checks if subscription is still valid to use benefits
// CRITICAL USER REQUIREMENT: After cancellation, client retains full access until expiration day!
export function isSubscriptionValid(sub: ClientSubscription): boolean {
  if (!sub || !sub.expiresAt) return false;
  const expireTime = new Date(`${sub.expiresAt}T23:59:59`).getTime();
  const now = Date.now();
  return now <= expireTime;
}

export function getSubscriptionRemainingDays(sub: ClientSubscription): number {
  if (!sub || !sub.expiresAt) return 0;
  const expireTime = new Date(`${sub.expiresAt}T23:59:59`).getTime();
  const now = Date.now();
  const diffMs = expireTime - now;
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function findSubscriptionByPhone(phone: string): ClientSubscription | null {
  const digits = cleanPhoneDigits(phone);
  if (!digits || digits.length < 8) return null;
  const subs = loadSubscriptions();
  // Find most recent valid or active subscription
  const matching = subs.filter((s) => {
    const sDigits = cleanPhoneDigits(s.customerWhatsapp);
    return sDigits === digits || sDigits.endsWith(digits) || digits.endsWith(sDigits);
  });
  if (matching.length === 0) return null;
  // Prioritize active or still valid
  const valid = matching.find((s) => isSubscriptionValid(s));
  return valid || matching[0];
}

export function createSubscription(
  data: Omit<ClientSubscription, 'id' | 'createdAt'>
): ClientSubscription {
  const subs = loadSubscriptions();
  const newSub: ClientSubscription = {
    ...data,
    id: 'sub-' + Date.now(),
    createdAt: new Date().toISOString(),
  };
  saveSubscriptions([newSub, ...subs]);

  // Record financial entry for initial monthly payment
  addFinancialEntry({
    type: 'receita_servico',
    description: `Assinatura ${data.planName} (Mercado Pago / Mensal)`,
    amount: data.priceMonthly,
    date: data.startDate || getTodayDateString(),
    paymentMethod: data.paymentMethod === 'mercado_pago' ? 'cartao_credito' : 'pix',
    category: 'Assinaturas & Planos',
  });

  // Also auto-register or update customer
  registerOrUpdateCustomer(data.customerName, data.customerWhatsapp, `Assinante do ${data.planName}`);

  return newSub;
}

// User-friendly cancellation: customer can cancel whenever they want,
// and benefits remain 100% active until expiresAt!
export function cancelSubscription(id: string): ClientSubscription | null {
  const subs = loadSubscriptions();
  const found = subs.find((s) => s.id === id);
  if (!found) return null;

  const updated: ClientSubscription = {
    ...found,
    status: 'cancelled',
    cancelledAt: new Date().toISOString(),
    autoRenew: false,
    // IMPORTANT: expiresAt is strictly preserved so they can use it until the end of the paid period!
  };

  saveSubscriptions(subs.map((s) => (s.id === id ? updated : s)));
  return updated;
}

export function reactivateSubscription(id: string): ClientSubscription | null {
  const subs = loadSubscriptions();
  const found = subs.find((s) => s.id === id);
  if (!found) return null;

  // If already expired, extend 30 days from today
  const today = getTodayDateString();
  const newExpiresAt = isSubscriptionValid(found) ? found.expiresAt : addDaysToDate(today, 30);

  const updated: ClientSubscription = {
    ...found,
    status: 'active',
    cancelledAt: undefined,
    autoRenew: true,
    expiresAt: newExpiresAt,
  };

  saveSubscriptions(subs.map((s) => (s.id === id ? updated : s)));
  return updated;
}

// ==========================================
// COMANDAS (TABS) & PDV MANAGEMENT
// ==========================================

export function loadComandas(): Comanda[] {
  try {
    const raw = localStorage.getItem(STORAGE_COMANDAS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveComandas(comandas: Comanda[]): void {
  localStorage.setItem(STORAGE_COMANDAS, JSON.stringify(comandas));
  pushToServer('comandas', comandas);
  notifyStorageUpdated();
}

export function getNextComandaCode(): number {
  const comandas = loadComandas();
  if (comandas.length === 0) return 101;
  const max = Math.max(...comandas.map((c) => c.code || 100));
  return max + 1;
}

export function createComanda(
  data: Omit<Comanda, 'id' | 'code' | 'openedAt'>
): Comanda {
  const comandas = loadComandas();
  const nextCode = getNextComandaCode();
  const newComanda: Comanda = {
    ...data,
    id: 'cmd-' + Date.now(),
    code: nextCode,
    openedAt: new Date().toISOString(),
  };

  saveComandas([newComanda, ...comandas]);
  return newComanda;
}

export function updateComanda(comanda: Comanda): void {
  const comandas = loadComandas();
  const updated = comandas.map((c) => (c.id === comanda.id ? comanda : c));
  saveComandas(updated);
}

// Closes Comanda, deducts product stock, records financial entry, and updates appointment
export function closeComanda(
  comandaId: string,
  paymentMethod: PaymentMethod | 'mercado_pago' | 'plano_vip',
  amountReceived?: number,
  changeDue?: number
): Comanda | null {
  const comandas = loadComandas();
  const found = comandas.find((c) => c.id === comandaId);
  if (!found) return null;

  const closedComanda: Comanda = {
    ...found,
    status: 'fechada',
    closedAt: new Date().toISOString(),
    paymentMethod,
    amountReceived,
    changeDue,
  };

  saveComandas(comandas.map((c) => (c.id === comandaId ? closedComanda : c)));

  // Deduct product inventory for products consumed in comanda
  try {
    const products = loadProducts();
    let productsModified = false;
    found.items.forEach((item) => {
      if (item.type === 'produto' && item.itemId) {
        const prod = products.find((p) => p.id === item.itemId);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
          productsModified = true;
        }
      }
    });
    if (productsModified) {
      saveProducts(products);
    }
  } catch (err) {
    console.warn('Erro ao atualizar estoque da comanda:', err);
  }

  // Record financial entry if amount > 0
  if (closedComanda.total > 0) {
    let method: PaymentMethod = 'dinheiro';
    if (paymentMethod === 'pix') method = 'pix';
    else if (paymentMethod === 'cartao_credito' || paymentMethod === 'mercado_pago') method = 'cartao_credito';
    else if (paymentMethod === 'cartao_debito') method = 'cartao_debito';

    addFinancialEntry({
      type: 'receita_servico',
      description: `Comanda #${closedComanda.code} - ${closedComanda.customerName} (${closedComanda.barberName})`,
      amount: closedComanda.total,
      date: getTodayDateString(),
      paymentMethod: method,
      category: 'Atendimento Barbearia',
      barberId: closedComanda.barberId,
      barberName: closedComanda.barberName,
    });
  }

  // If this comanda came from an appointment, mark appointment as 'concluido'
  if (closedComanda.appointmentId) {
    try {
      const appointments = loadAppointments();
      const updatedApts = appointments.map((apt) =>
        apt.id === closedComanda.appointmentId ? { ...apt, status: 'concluido' as const } : apt
      );
      saveAppointments(updatedApts);
    } catch {
      // ignore
    }
  }

  // Update customer visit info
  if (closedComanda.customerWhatsapp) {
    registerOrUpdateCustomer(
      closedComanda.customerName,
      closedComanda.customerWhatsapp,
      `Atendido na Comanda #${closedComanda.code}`
    );
  }

  return closedComanda;
}

export function cancelComanda(comandaId: string): Comanda | null {
  const comandas = loadComandas();
  const found = comandas.find((c) => c.id === comandaId);
  if (!found) return null;

  const cancelled: Comanda = {
    ...found,
    status: 'cancelada',
    closedAt: new Date().toISOString(),
  };

  saveComandas(comandas.map((c) => (c.id === comandaId ? cancelled : c)));
  return cancelled;
}

// Generate formatted plain text for Nota Não Fiscal / Recibo Térmico
export function createReceiptFormattedText(comanda: Comanda, config: BusinessConfig): string {
  const dateObj = new Date(comanda.closedAt || comanda.openedAt);
  const dateFormatted = `${String(dateObj.getDate()).padStart(2, '0')}/${String(
    dateObj.getMonth() + 1
  ).padStart(2, '0')}/${dateObj.getFullYear()}`;
  const timeFormatted = `${String(dateObj.getHours()).padStart(2, '0')}:${String(
    dateObj.getMinutes()
  ).padStart(2, '0')}`;

  const shopName = config.name || 'IMPÉRIO BARBEARIA';
  const address = config.address ? `${config.address}, ${config.city || 'SP'}` : 'Atendimento Presencial';
  const phone = formatPhone(config.whatsappBusiness || config.phone || '');
  const cnpj = config.cnpj ? `CNPJ: ${config.cnpj}` : 'DOCUMENTO NÃO FISCAL';

  let itemsText = '';
  comanda.items.forEach((it) => {
    itemsText += `\n• ${it.quantity}x ${it.name} - ${formatBRL(it.total)}`;
  });

  const paymentMethodLabel: Record<string, string> = {
    pix: 'PIX Instantâneo',
    cartao_credito: 'Cartão de Crédito',
    cartao_debito: 'Cartão de Débito',
    dinheiro: 'Dinheiro em Espécie',
    mercado_pago: 'Mercado Pago',
    plano_vip: 'Plano Assinatura VIP',
  };

  const methodStr = paymentMethodLabel[comanda.paymentMethod || ''] || 'Presencial';

  return `👑 *${shopName}*
${address} | ${phone}
${cnpj}
---------------------------------------------
*CUPOM DE ATENDIMENTO - NÃO FISCAL*
*Comanda:* #${comanda.code}
*Data/Hora:* ${dateFormatted} às ${timeFormatted}
*Barbeiro:* ${comanda.barberName}
*Cliente:* ${comanda.customerName} (${formatPhone(comanda.customerWhatsapp)})
---------------------------------------------
*ITENS / SERVIÇOS:*${itemsText}
---------------------------------------------
*Subtotal:* ${formatBRL(comanda.subtotal)}${
    comanda.discount > 0 ? `\n*Desconto:* -${formatBRL(comanda.discount)}` : ''
  }${comanda.tip > 0 ? `\n*Gorjeta Barbeiro:* +${formatBRL(comanda.tip)}` : ''}
*TOTAL PAGO:* ${formatBRL(comanda.total)}
*Forma de Pagamento:* ${methodStr}${
    comanda.amountReceived && comanda.changeDue !== undefined && comanda.changeDue > 0
      ? `\n*Valor Recebido:* ${formatBRL(comanda.amountReceived)} | *Troco:* ${formatBRL(comanda.changeDue)}`
      : ''
  }
---------------------------------------------
Muito obrigado pela preferência!
Seu visual no padrão de rei. Volte sempre! ✂️👑`;
}

// Generate WhatsApp dispatch link with pre-filled receipt
export function createReceiptWhatsAppUrl(comanda: Comanda, config: BusinessConfig): string {
  const phone = cleanPhoneDigits(comanda.customerWhatsapp);
  if (!phone) return '';
  const text = createReceiptFormattedText(comanda, config);
  const fullPhone = phone.length <= 11 ? `55${phone}` : phone;
  return `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(text)}`;
}
