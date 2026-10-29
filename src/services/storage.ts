import { Appointment, Barber, BusinessConfig, Customer, FinancialEntry, Product, Service } from '../types';

// Image paths generated for Barbearia Império
export const HERO_IMAGE = '/src/assets/images/barbershop_hero_1793279569824.jpg';
export const BARBER_MARCUS_IMG = '/src/assets/images/barber_marcus_1793279571037.jpg';
export const BARBER_LUCAS_IMG = '/src/assets/images/barber_lucas_1793279572541.jpg';
export const BARBER_RAFAEL_IMG = '/src/assets/images/barber_rafael_1793279571807.jpg';

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
  name: 'Barbearia Império',
  slogan: 'Onde o homem moderno encontra o padrão de rei.',
  whatsappBusiness: '5511998765432',
  phone: '(11) 99876-5432',
  address: 'Av. Paulista, 1842 - Sala 12',
  neighborhood: 'Bela Vista',
  city: 'São Paulo',
  state: 'SP',
  instagram: '@barbeariaimperio.oficial',
  openingHour: '09:00',
  closingHour: '20:00',
  slotIntervalMinutes: 30,
  pixKey: 'financeiro@barbeariaimperio.com.br',
};

// Seed sample pre-registered customers for instant test of WhatsApp auto-identification
export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Carlos Eduardo Silva',
    whatsapp: '11987654321',
    email: 'carlos.silva@exemplo.com',
    notes: 'Prefere fade baixo e barba alinhada sem pó descolorante.',
    totalAppointments: 8,
    lastVisit: '2026-10-15',
    createdAt: '2026-03-10',
  },
  {
    id: 'cust-2',
    name: 'Rodrigo Santos Mendes',
    whatsapp: '11991234567',
    email: 'rodrigo.mendes@exemplo.com',
    notes: 'Cliente pontual, gosta de café espresso.',
    totalAppointments: 14,
    lastVisit: '2026-10-20',
    createdAt: '2026-01-14',
  },
  {
    id: 'cust-3',
    name: 'Felipe Alcantara',
    whatsapp: '11977778888',
    notes: 'Corte na tesoura sem máquina dos lados.',
    totalAppointments: 4,
    lastVisit: '2026-09-28',
    createdAt: '2026-05-18',
  },
];

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
const STORAGE_FINANCIAL = 'barbearia_imperio_financial_v1';
const STORAGE_CONFIG = 'barbearia_imperio_config_v1';

// Initial financial entries
export function getInitialFinancialEntries(): FinancialEntry[] {
  const today = getTodayDateString();
  return [
    {
      id: 'fin-1',
      type: 'receita_servico',
      description: 'Atendimento Corte Imperial (Carlos Eduardo)',
      amount: 55,
      date: today,
      paymentMethod: 'pix',
      category: 'Serviços',
      barberId: 'barber-marcus',
      barberName: 'Marcus "Imperador"',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'fin-2',
      type: 'receita_produto',
      description: 'Venda de Pomada Matte Império (1x)',
      amount: 48,
      date: today,
      paymentMethod: 'cartao_credito',
      category: 'Venda de Produtos',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'fin-3',
      type: 'despesa',
      description: 'Insumos Toalhas Quentes, Óleos & Golas Higiênicas',
      amount: 115,
      date: today,
      paymentMethod: 'pix',
      category: 'Insumos Barbearia',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'fin-4',
      type: 'receita_servico',
      description: 'Atendimento Combo Rei (Rodrigo Mendes)',
      amount: 95,
      date: today,
      paymentMethod: 'cartao_debito',
      category: 'Serviços',
      barberId: 'barber-lucas',
      barberName: 'Lucas "Navalha"',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'fin-5',
      type: 'despesa',
      description: 'Café Gourmet em Grãos & Cervejas Lounge',
      amount: 80,
      date: today,
      paymentMethod: 'pix',
      category: 'Lounge & Cortesias',
      createdAt: new Date().toISOString(),
    },
  ];
}

// Initialize default appointments for today if empty
export function getInitialAppointments(): Appointment[] {
  const today = getTodayDateString();
  return [
    {
      id: 'apt-seed-1',
      customerId: 'cust-1',
      customerName: 'Carlos Eduardo Silva',
      customerWhatsapp: '11987654321',
      barberId: 'barber-marcus',
      barberName: 'Marcus "Imperador"',
      serviceIds: ['srv-combo-rei'],
      servicesNames: ['Combo Rei Império'],
      totalPrice: 95,
      totalDuration: 70,
      date: today,
      time: '10:00',
      status: 'confirmado',
      notes: 'Fade baixo com navalha',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'apt-seed-2',
      customerId: 'cust-2',
      customerName: 'Rodrigo Santos Mendes',
      customerWhatsapp: '11991234567',
      barberId: 'barber-lucas',
      barberName: 'Lucas "Navalha"',
      serviceIds: ['srv-corte-imperial'],
      servicesNames: ['Corte Imperial'],
      totalPrice: 55,
      totalDuration: 45,
      date: today,
      time: '14:30',
      status: 'pendente',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'apt-seed-3',
      customerId: 'cust-3',
      customerName: 'Felipe Alcantara',
      customerWhatsapp: '11977778888',
      barberId: 'barber-rafael',
      barberName: 'Rafael "Clássico"',
      serviceIds: ['srv-barboterapia'],
      servicesNames: ['Barboterapia Imperial'],
      totalPrice: 45,
      totalDuration: 35,
      date: today,
      time: '16:00',
      status: 'confirmado',
      createdAt: new Date().toISOString(),
    },
  ];
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
}

export function loadBarbers(): Barber[] {
  try {
    const raw = localStorage.getItem(STORAGE_BARBERS);
    if (!raw) {
      localStorage.setItem(STORAGE_BARBERS, JSON.stringify(INITIAL_BARBERS));
      return INITIAL_BARBERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BARBERS;
  }
}

export function saveBarbers(barbers: Barber[]): void {
  localStorage.setItem(STORAGE_BARBERS, JSON.stringify(barbers));
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
}

export function loadConfig(): BusinessConfig {
  try {
    const raw = localStorage.getItem(STORAGE_CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_CONFIG, JSON.stringify(INITIAL_CONFIG));
      return INITIAL_CONFIG;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CONFIG;
  }
}

export function saveConfig(config: BusinessConfig): void {
  localStorage.setItem(STORAGE_CONFIG, JSON.stringify(config));
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
  
  const text = `👑 *Barbearia Império - Confirmação de Agendamento*
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
Aqui é da *Barbearia Império* passando para lembrar do seu horário hoje/em breve:

✂️ *Serviço:* ${appointment.servicesNames.join(' + ')}
💈 *Profissional:* ${appointment.barberName}
📅 *Data:* ${dateFormatted} às *${appointment.time}*

Podemos confirmar sua presença? Estamos prontos para te receber com café gelado/cerveja artesanal no melhor estilo! 👑`;

  // Prepend 55 if not present
  const fullPhone = phone.length <= 11 ? `55${phone}` : phone;
  return `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(text)}`;
}
