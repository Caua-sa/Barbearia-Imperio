export type ServiceCategory = 'cabelo' | 'barba' | 'combo' | 'quimica' | 'especial';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  durationMinutes: number;
  price: number;
  popular?: boolean;
  active?: boolean;
}

export interface Barber {
  id: string;
  name: string;
  nickname: string;
  role: string;
  rating: number;
  totalReviews: number;
  photoUrl: string;
  bio: string;
  specialties: string[];
  active: boolean;
  commissionPercentage: number; // e.g. 50%
  workingHours: {
    start: string; // e.g. "09:00"
    end: string;   // e.g. "20:00"
  };
}

export interface Product {
  id: string;
  name: string;
  category: 'pomada' | 'barba' | 'shampoo' | 'bebida' | 'acessorio' | 'outro';
  price: number;
  costPrice: number;
  stock: number;
  description: string;
  active: boolean;
  imageUrl?: string;
}

export type FinancialType = 'receita_servico' | 'receita_produto' | 'despesa';
export type PaymentMethod = 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro';

export interface FinancialEntry {
  id: string;
  type: FinancialType;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  category: string;
  barberId?: string;
  barberName?: string;
  appointmentId?: string;
  productId?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
  notes?: string;
  totalAppointments: number;
  lastVisit?: string;
  createdAt: string;
}

export type AppointmentStatus = 'pendente' | 'confirmado' | 'concluido' | 'cancelado';

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerWhatsapp: string;
  barberId: string;
  barberName: string;
  serviceIds: string[];
  servicesNames: string[];
  totalPrice: number;
  totalDuration: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface SuppliesItem {
  id: string;
  name: string;
  category: 'descartavel' | 'higiene' | 'quimica' | 'lounge' | 'outro';
  quantity: number;
  minQuantity: number;
  unit: 'un' | 'cx' | 'pct' | 'litros';
  costPrice: number;
  supplier?: string;
  lastRestocked?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  description: string;
  benefits: string[];
  popular?: boolean;
  active: boolean;
  checkoutUrl?: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  title: string;
  category?: 'ambiente' | 'corte' | 'equipe' | 'outro';
  createdAt: string;
}

export interface BusinessConfig {
  name: string;
  slogan: string;
  whatsappBusiness: string; // digits only or formatted
  phone: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  instagram: string;
  openingHour: string; // "09:00"
  closingHour: string; // "20:00"
  slotIntervalMinutes: number; // 30
  pixKey: string;
  heroImageUrl?: string;
  galleryPhotos?: GalleryPhoto[];
  plansPaymentPix?: string;
  plansPaymentLink?: string;
  plansInstructions?: string;
  cnpj?: string;
  // Mercado Pago API integration
  mpAccessToken?: string;
  mpPublicKey?: string;
  mpEnvironment?: 'sandbox' | 'production';
}

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  whatsapp?: string; // Linked WhatsApp number (optional)
  provider: 'google';
  createdAt: string;
}

export interface ClientSubscription {
  id: string;
  planId: string;
  planName: string;
  priceMonthly: number;
  customerName: string;
  customerWhatsapp: string;
  customerEmail?: string;
  startDate: string; // YYYY-MM-DD
  expiresAt: string; // YYYY-MM-DD
  status: 'active' | 'cancelled' | 'expired';
  cancelledAt?: string; // YYYY-MM-DD HH:mm:ss
  paymentMethod: 'mercado_pago' | 'pix' | 'cartao' | 'balcao';
  mpPaymentId?: string;
  autoRenew: boolean;
  createdAt: string;
}

export interface ComandaItem {
  id: string;
  type: 'servico' | 'produto' | 'outro';
  itemId?: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Comanda {
  id: string;
  code: number; // e.g. 101, 102
  appointmentId?: string;
  customerName: string;
  customerWhatsapp: string;
  barberId: string;
  barberName: string;
  status: 'aberta' | 'fechada' | 'cancelada';
  openedAt: string; // ISO string
  closedAt?: string; // ISO string
  items: ComandaItem[];
  subtotal: number;
  discount: number;
  tip: number; // gorjeta do barbeiro
  total: number;
  paymentMethod?: PaymentMethod | 'mercado_pago' | 'plano_vip';
  amountReceived?: number;
  changeDue?: number;
  notes?: string;
}
