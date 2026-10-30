import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  Scissors,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Plus,
  Share2,
  Copy,
  Settings,
  Phone,
  Search,
  Filter,
  Lock,
  Unlock,
  ChevronDown,
  Trash2,
  Edit2,
  Package,
  ShoppingCart,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Receipt,
  Percent,
  LogOut,
  Sparkles,
  Layers,
  Crown,
  Image as ImageIcon,
  Upload,
  RefreshCw,
} from 'lucide-react';
import {
  loadAppointments,
  saveAppointments,
  loadCustomers,
  saveCustomers,
  loadServices,
  saveServices,
  loadBarbers,
  saveBarbers,
  loadProducts,
  saveProducts,
  loadSupplies,
  saveSupplies,
  loadPlans,
  savePlans,
  loadFinancialEntries,
  saveFinancialEntries,
  addFinancialEntry,
  loadConfig,
  saveConfig,
  loadComandas,
  saveComandas,
  createComanda,
  resetAllAdminData,
  readFileAsDataUrl,
  formatBRL,
  formatPhone,
  cleanPhoneDigits,
  getTodayDateString,
  createAdminToCustomerWhatsAppUrl,
  registerOrUpdateCustomer,
  syncWithServer,
  BARBER_MARCUS_IMG,
  BARBER_LUCAS_IMG,
  BARBER_RAFAEL_IMG,
} from '../services/storage';
import {
  Appointment,
  AppointmentStatus,
  Customer,
  Service,
  Barber,
  BusinessConfig,
  Product,
  SuppliesItem,
  SubscriptionPlan,
  FinancialEntry,
  PaymentMethod,
  FinancialType,
  Comanda,
} from '../types';
import { AdminServicesTab } from './admin/AdminServicesTab';
import { AdminSuppliesTab } from './admin/AdminSuppliesTab';
import { AdminPlansTab } from './admin/AdminPlansTab';
import { AdminGalleryTab } from './admin/AdminGalleryTab';
import { AdminComandasTab } from './admin/AdminComandasTab';
import { PDVCheckoutModal } from './admin/PDVCheckoutModal';
import { ReceiptModal } from './admin/ReceiptModal';

interface AdminDashboardProps {
  onBackToApp: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToApp }) => {
  // Check auth session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('barbearia_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Active tab
  type AdminTab =
    | 'agenda'
    | 'comandas'
    | 'financeiro'
    | 'servicos'
    | 'barbeiros'
    | 'produtos'
    | 'insumos'
    | 'planos'
    | 'fotos'
    | 'clientes'
    | 'config';

  const [activeTab, setActiveTab] = useState<AdminTab>('agenda');

  // Core data states
  const [appointments, setAppointments] = useState<Appointment[]>(() => loadAppointments());
  const [customers, setCustomers] = useState<Customer[]>(() => loadCustomers());
  const [services, setServices] = useState<Service[]>(() => loadServices());
  const [barbers, setBarbers] = useState<Barber[]>(() => loadBarbers());
  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [supplies, setSupplies] = useState<SuppliesItem[]>(() => loadSupplies());
  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => loadPlans());
  const [financialEntries, setFinancialEntries] = useState<FinancialEntry[]>(() => loadFinancialEntries());
  const [config, setConfig] = useState<BusinessConfig>(() => loadConfig());
  const [comandas, setComandas] = useState<Comanda[]>(() => loadComandas());

  // Comanda & PDV modal states
  const [selectedPDVComanda, setSelectedPDVComanda] = useState<Comanda | null>(null);
  const [selectedReceiptComanda, setSelectedReceiptComanda] = useState<Comanda | null>(null);

  // Agenda filters
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [barberFilter, setBarberFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Customer search
  const [customerSearch, setCustomerSearch] = useState<string>('');

  // Financial filter
  const [financialTypeFilter, setFinancialTypeFilter] = useState<'todos' | 'entradas' | 'saidas'>('todos');

  // Modals
  const [showNewAptModal, setShowNewAptModal] = useState<boolean>(false);
  const [showBarberModal, setShowBarberModal] = useState<boolean>(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [barberPhotoPreview, setBarberPhotoPreview] = useState<string>('');

  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [showSellProductModal, setShowSellProductModal] = useState<boolean>(false);
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);

  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Sync data across all browsers and devices in real time
  React.useEffect(() => {
    const handleStorageUpdate = () => {
      setAppointments(loadAppointments());
      setCustomers(loadCustomers());
      setServices(loadServices());
      setBarbers(loadBarbers());
      setProducts(loadProducts());
      setSupplies(loadSupplies());
      setPlans(loadPlans());
      setFinancialEntries(loadFinancialEntries());
      setConfig(loadConfig());
      setComandas(loadComandas());
    };

    window.addEventListener('imperio_storage_updated', handleStorageUpdate);

    // Initial sync with backend
    syncWithServer();

    // Auto-sync polling every 8 seconds so appointments/barbers appear live across browsers
    const interval = setInterval(() => {
      syncWithServer();
    }, 8000);

    return () => {
      window.removeEventListener('imperio_storage_updated', handleStorageUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncWithServer();
      // Reload states from updated localStorage
      setAppointments(loadAppointments());
      setCustomers(loadCustomers());
      setServices(loadServices());
      setBarbers(loadBarbers());
      setProducts(loadProducts());
      setSupplies(loadSupplies());
      setPlans(loadPlans());
      setFinancialEntries(loadFinancialEntries());
      setConfig(loadConfig());
      setComandas(loadComandas());
      showToast(res ? 'Dados sincronizados com o servidor com sucesso!' : 'Servidor atualizado!');
    } catch {
      showToast('Erro ao sincronizar com servidor.');
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'imperio123' || passwordInput === 'admin') {
      sessionStorage.setItem('barbearia_admin_auth', 'true');
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Senha incorreta. (Senha padrão: imperio123)');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('barbearia_admin_auth');
    setIsAuthenticated(false);
    onBackToApp();
  };

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchDate = !selectedDate || apt.date === selectedDate;
      const matchBarber = barberFilter === 'todos' || apt.barberId === barberFilter;
      const matchStatus = statusFilter === 'todos' || apt.status === statusFilter;
      return matchDate && matchBarber && matchStatus;
    });
  }, [appointments, selectedDate, barberFilter, statusFilter]);

  // Financial calculations
  const totalReceitas = useMemo(() => {
    return financialEntries
      .filter((e) => e.type === 'receita_servico' || e.type === 'receita_produto')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [financialEntries]);

  const totalDespesas = useMemo(() => {
    return financialEntries
      .filter((e) => e.type === 'despesa')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [financialEntries]);

  const lucroLiquido = totalReceitas - totalDespesas;

  // Today financial stats
  const todayEntries = useMemo(() => {
    const today = getTodayDateString();
    return financialEntries.filter((e) => e.date === today);
  }, [financialEntries]);

  const todayReceitas = useMemo(() => {
    return todayEntries
      .filter((e) => e.type === 'receita_servico' || e.type === 'receita_produto')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [todayEntries]);

  const todayDespesas = useMemo(() => {
    return todayEntries
      .filter((e) => e.type === 'despesa')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [todayEntries]);

  // Barbers performance & commission calculation
  const barbersCommissions = useMemo(() => {
    return barbers.map((barber) => {
      // Find appointments completed or confirmed
      const barberApts = appointments.filter(
        (a) => a.barberId === barber.id && a.status !== 'cancelado'
      );
      const totalBilled = barberApts.reduce((sum, a) => sum + a.totalPrice, 0);
      const commissionRate = (barber.commissionPercentage || 50) / 100;
      const commissionValue = totalBilled * commissionRate;
      const shopKeep = totalBilled - commissionValue;

      return {
        barber,
        totalAppointments: barberApts.length,
        totalBilled,
        commissionRatePercent: barber.commissionPercentage || 50,
        commissionValue,
        shopKeep,
      };
    });
  }, [barbers, appointments]);

  // Appointment status update
  const updateAppointmentStatus = (aptId: string, newStatus: AppointmentStatus) => {
    const targetApt = appointments.find((a) => a.id === aptId);
    const updated = appointments.map((apt) =>
      apt.id === aptId ? { ...apt, status: newStatus } : apt
    );
    setAppointments(updated);
    saveAppointments(updated);

    // If marked as concluded, automatically log financial revenue entry if not already logged
    if (newStatus === 'concluido' && targetApt) {
      const alreadyLogged = financialEntries.some((f) => f.appointmentId === aptId);
      if (!alreadyLogged) {
        const newEntry = addFinancialEntry({
          type: 'receita_servico',
          description: `Serviço Concluído: ${targetApt.servicesNames.join(' + ')} (${targetApt.customerName})`,
          amount: targetApt.totalPrice,
          date: targetApt.date,
          paymentMethod: 'pix',
          category: 'Serviços',
          barberId: targetApt.barberId,
          barberName: targetApt.barberName,
          appointmentId: targetApt.id,
        });
        setFinancialEntries(loadFinancialEntries());
        showToast('Atendimento concluído e receita lançada no Financeiro!');
        return;
      }
    }
    showToast(`Status atualizado para ${newStatus.toUpperCase()}`);
  };

  const deleteAppointment = (aptId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este agendamento?')) return;
    const updated = appointments.filter((apt) => apt.id !== aptId);
    setAppointments(updated);
    saveAppointments(updated);
    showToast('Agendamento excluído.');
  };

  // Start service & open comanda for appointment
  const handleStartServiceAndOpenComanda = (apt: Appointment) => {
    // Check if open comanda already exists for this appointment
    const existing = comandas.find((c) => c.appointmentId === apt.id && c.status === 'aberta');
    if (existing) {
      setActiveTab('comandas');
      showToast(`Comanda #${existing.code} já está aberta para ${apt.customerName}.`);
      return;
    }

    const items = apt.servicesNames.map((name, idx) => {
      const sId = apt.serviceIds[idx];
      const srv = services.find((s) => s.id === sId);
      const price = srv ? srv.price : apt.totalPrice;
      return {
        id: 'it-' + Date.now() + '-' + idx,
        type: 'servico' as const,
        itemId: sId,
        name,
        price,
        quantity: 1,
        total: price,
      };
    });

    const created = createComanda({
      appointmentId: apt.id,
      customerName: apt.customerName,
      customerWhatsapp: apt.customerWhatsapp,
      barberId: apt.barberId,
      barberName: apt.barberName,
      status: 'aberta',
      items,
      subtotal: apt.totalPrice,
      discount: 0,
      tip: 0,
      total: apt.totalPrice,
    });

    // If appointment was pending, mark as confirmed
    if (apt.status === 'pendente') {
      const updatedApts = appointments.map((a) =>
        a.id === apt.id ? { ...a, status: 'confirmado' as const } : a
      );
      setAppointments(updatedApts);
      saveAppointments(updatedApts);
    }

    const freshComandas = loadComandas();
    setComandas(freshComandas);
    setActiveTab('comandas');
    showToast(`Comanda #${created.code} aberta! Corte iniciado.`);
  };

  // Barber management
  const handleSaveBarber = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = (formData.get('name') as string)?.trim();
    if (!name) {
      showToast('Por favor, digite o nome do barbeiro.');
      return;
    }
    const nickname = (formData.get('nickname') as string)?.trim() || name.split(' ')[0];
    const role = (formData.get('role') as string)?.trim() || 'Barbeiro Profissional';
    const bio = (formData.get('bio') as string)?.trim() || 'Profissional especialista da Império Barbearia.';
    const start = (formData.get('start') as string) || '09:00';
    const end = (formData.get('end') as string) || '20:00';
    const commission = Number(formData.get('commission') || 50);
    const photoFromInput = (formData.get('photoUrl') as string)?.trim();
    const finalPhoto = barberPhotoPreview || photoFromInput || (editingBarber ? editingBarber.photoUrl : BARBER_MARCUS_IMG);
    const specialtiesStr = (formData.get('specialties') as string) || 'Corte Imperial, Barba, Alinhamento';
    const active = formData.get('active') === 'on' || formData.get('active') === 'true';

    const specialties = specialtiesStr.split(',').map((s) => s.trim()).filter(Boolean);

    let updatedList: Barber[];
    if (editingBarber) {
      updatedList = barbers.map((b) =>
        b.id === editingBarber.id
          ? {
              ...b,
              name,
              nickname,
              role,
              bio,
              workingHours: { start, end },
              commissionPercentage: commission,
              photoUrl: finalPhoto,
              specialties: specialties.length ? specialties : ['Corte Imperial', 'Barba'],
              active,
            }
          : b
      );
      showToast('Barbeiro atualizado e sincronizado com sucesso!');
    } else {
      const newBarber: Barber = {
        id: 'barber-' + Date.now(),
        name,
        nickname,
        role,
        rating: 5.0,
        totalReviews: 1,
        photoUrl: finalPhoto,
        bio,
        specialties: specialties.length ? specialties : ['Corte Imperial', 'Barba'],
        active,
        commissionPercentage: commission,
        workingHours: { start, end },
      };
      updatedList = [...barbers, newBarber];
      showToast('Novo barbeiro salvo e disponível para agendamento!');
    }

    setBarbers(updatedList);
    saveBarbers(updatedList);
    setShowBarberModal(false);
    setEditingBarber(null);
    setBarberPhotoPreview('');
  };

  const handleDeleteBarber = (barberId: string) => {
    if (!window.confirm('Tem certeza que deseja remover este barbeiro?')) return;
    const updated = barbers.filter((b) => b.id !== barberId);
    setBarbers(updated);
    saveBarbers(updated);
    showToast('Barbeiro removido.');
  };

  // Product management
  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const category = formData.get('category') as any;
    const price = Number(formData.get('price'));
    const costPrice = Number(formData.get('costPrice') || 0);
    const stock = Number(formData.get('stock'));
    const description = formData.get('description') as string;
    const active = formData.get('active') === 'on';

    let updatedList: Product[];
    if (editingProduct) {
      updatedList = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name,
              category,
              price,
              costPrice,
              stock,
              description,
              active,
            }
          : p
      );
      showToast('Produto atualizado com sucesso!');
    } else {
      const newProd: Product = {
        id: 'prod-' + Date.now(),
        name,
        category,
        price,
        costPrice,
        stock,
        description,
        active,
      };
      updatedList = [newProd, ...products];
      showToast('Novo produto cadastrado no estoque!');
    }

    setProducts(updatedList);
    saveProducts(updatedList);
    setShowProductModal(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (prodId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    const updated = products.filter((p) => p.id !== prodId);
    setProducts(updated);
    saveProducts(updated);
    showToast('Produto removido.');
  };

  // Register product sale (Sell Product)
  const handleSellProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productId = formData.get('productId') as string;
    const qty = Number(formData.get('quantity') || 1);
    const paymentMethod = formData.get('paymentMethod') as PaymentMethod;

    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    if (prod.stock < qty) {
      alert(`Estoque insuficiente! Apenas ${prod.stock} unidade(s) disponíveis.`);
      return;
    }

    // Decrement stock
    const updatedProducts = products.map((p) =>
      p.id === productId ? { ...p, stock: p.stock - qty } : p
    );
    setProducts(updatedProducts);
    saveProducts(updatedProducts);

    // Record financial entry
    const totalSale = prod.price * qty;
    addFinancialEntry({
      type: 'receita_produto',
      description: `Venda de Produto: ${qty}x ${prod.name}`,
      amount: totalSale,
      date: getTodayDateString(),
      paymentMethod,
      category: 'Venda de Produtos',
      productId: prod.id,
    });
    setFinancialEntries(loadFinancialEntries());

    setShowSellProductModal(false);
    showToast(`Venda de ${formatBRL(totalSale)} registrada com sucesso!`);
  };

  // Register Expense
  const handleAddExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const description = formData.get('description') as string;
    const amount = Number(formData.get('amount'));
    const category = formData.get('category') as string;
    const paymentMethod = formData.get('paymentMethod') as PaymentMethod;
    const date = (formData.get('date') as string) || getTodayDateString();

    addFinancialEntry({
      type: 'despesa',
      description,
      amount,
      date,
      paymentMethod,
      category,
    });
    setFinancialEntries(loadFinancialEntries());
    setShowExpenseModal(false);
    showToast('Despesa registrada no controle financeiro.');
  };

  // Copy share link
  const handleCopyLink = () => {
    const url = window.location.origin + window.location.pathname + '?express=true';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Auth gate if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl relative">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/20 shadow-lg shadow-amber-500/10">
            <Lock className="w-7 h-7" />
          </div>
          <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold">
            Acesso Restrito
          </span>
          <h2 className="font-display text-2xl font-bold text-neutral-100 mt-1 mb-2">
            Área Administrativa
          </h2>
          <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
            Área exclusiva e protegida para os gestores e barbeiros da <strong>Império Barbearia</strong>.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Digite sua senha de acesso..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                autoFocus
              />
              {authError && <p className="text-xs text-rose-400 mt-2">{authError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm transition-colors shadow-md shadow-amber-400/20"
            >
              Entrar no Painel
            </button>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem('barbearia_admin_auth', 'true');
                  setIsAuthenticated(true);
                }}
                className="text-xs text-neutral-500 hover:text-amber-400 underline transition-colors"
              >
                Entrar com Senha Padrão (imperio123)
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-neutral-800">
            <button
              onClick={onBackToApp}
              className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              ← Voltar para a Tela do Cliente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-neutral-900 border border-amber-500/50 text-amber-300 text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
              Gestão Império Barbearia
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-xs text-emerald-400 font-semibold">Área Privada Segura</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-neutral-100 mt-1">
            Painel Geral do Proprietário
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-amber-400 text-neutral-300 hover:text-amber-400 text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            title="Sincronizar dados em tempo real com todos os navegadores e dispositivos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-amber-500/30 text-amber-400 hover:text-amber-300 hover:bg-neutral-800 text-xs font-semibold flex items-center gap-2 transition-colors"
            title="Copiar o link rápido para enviar para clientes no WhatsApp"
          >
            {copiedLink ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Link Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Link Rápido para Clientes</span>
              </>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 border border-neutral-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair do ADM</span>
          </button>
        </div>
      </div>

      {/* Quick Financial KPI Snapshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Faturamento Hoje</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 tabular-nums">
            {formatBRL(todayReceitas)}
          </div>
          <span className="text-[11px] text-neutral-400 mt-0.5 block">
            Serviços & produtos hoje
          </span>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Lucro Líquido Geral</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`text-xl sm:text-2xl font-bold tabular-nums ${lucroLiquido >= 0 ? 'text-neutral-100' : 'text-rose-400'}`}>
            {formatBRL(lucroLiquido)}
          </div>
          <span className="text-[11px] text-neutral-400 mt-0.5 block">
            Receitas menos despesas
          </span>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Barbeiros Cadastrados</span>
            <Scissors className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-neutral-100 tabular-nums">
            {barbers.length}
          </div>
          <span className="text-[11px] text-neutral-400 mt-0.5 block">
            {barbers.filter((b) => b.active).length} ativos na agenda
          </span>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Produtos em Estoque</span>
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-neutral-100 tabular-nums">
            {products.reduce((acc, p) => acc + p.stock, 0)} un
          </div>
          <span className="text-[11px] text-neutral-400 mt-0.5 block">
            {products.length} itens cadastrados
          </span>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 overflow-x-auto scrollbar-none">
        {[
          { id: 'agenda', label: 'Agenda & Horários', icon: Calendar },
          {
            id: 'comandas',
            label: 'Comandas & PDV',
            icon: Receipt,
            badge: comandas.filter((c) => c.status === 'aberta').length,
          },
          { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
          { id: 'servicos', label: 'Serviços & Cortes', icon: Scissors },
          { id: 'barbeiros', label: 'Barbeiros & Fotos', icon: User },
          { id: 'produtos', label: 'Produtos (Balcão)', icon: Package },
          { id: 'insumos', label: 'Insumos da Barbearia', icon: Layers },
          { id: 'planos', label: 'Planos & Pagamentos', icon: Crown },
          { id: 'fotos', label: 'Fotos & Landing Page', icon: ImageIcon },
          { id: 'clientes', label: 'Clientes (WhatsApp)', icon: Users },
          { id: 'config', label: 'Configurações', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap relative ${
                isActive
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 bg-neutral-900/60 border border-neutral-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {Boolean(tab.badge && tab.badge > 0) && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-neutral-950 text-amber-400'
                      : 'bg-amber-400 text-neutral-950'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB: COMANDAS & PDV */}
      {/* ========================================================= */}
      {activeTab === 'comandas' && (
        <AdminComandasTab
          comandas={comandas}
          onComandasChange={setComandas}
          config={config}
          services={services}
          products={products}
          barbers={barbers}
          onOpenPDV={(cmd) => setSelectedPDVComanda(cmd)}
          onOpenReceipt={(cmd) => setSelectedReceiptComanda(cmd)}
          showToast={showToast}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 1: AGENDA */}
      {/* ========================================================= */}
      {activeTab === 'agenda' && (
        <div className="space-y-6">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Data:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={() => setSelectedDate(getTodayDateString())}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Hoje
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Barbeiro:</span>
                <select
                  value={barberFilter}
                  onChange={(e) => setBarberFilter(e.target.value)}
                  className="bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="todos">Todos os Barbeiros</option>
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="todos">Todos</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="pendente">Pendente</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowNewAptModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento Manual</span>
            </button>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-12 text-center text-neutral-400 text-xs">
              <Calendar className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p>Nenhum agendamento para a data selecionada.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map((apt) => {
                const waCustomerUrl = createAdminToCustomerWhatsAppUrl(apt);
                return (
                  <div
                    key={apt.id}
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-neutral-100 tabular-nums">
                          {apt.time}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {apt.totalDuration} min
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-neutral-100">
                            {apt.customerName}
                          </h3>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              apt.status === 'confirmado'
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                                : apt.status === 'pendente'
                                ? 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                                : apt.status === 'concluido'
                                ? 'bg-blue-950/80 text-blue-400 border border-blue-500/30'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>

                        <p className="text-xs text-neutral-300 mt-1">
                          Serviço: <strong className="text-neutral-100">{apt.servicesNames.join(' + ')}</strong>
                        </p>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400 mt-1">
                          <span>Barbeiro: <strong className="text-amber-400">{apt.barberName}</strong></span>
                          <span>·</span>
                          <span className="tabular-nums font-semibold text-emerald-400">
                            {formatBRL(apt.totalPrice)}
                          </span>
                          <span>·</span>
                          <span className="tabular-nums">
                            WhatsApp: {formatPhone(apt.customerWhatsapp)}
                          </span>
                          {apt.notes && (
                            <>
                              <span>·</span>
                              <span className="italic text-neutral-400">"{apt.notes}"</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-neutral-800">
                      <a
                        href={waCustomerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        title="Enviar lembrete amigável pelo WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chamar WhatsApp</span>
                      </a>

                      {/* Abrir Comanda / Iniciar Corte */}
                      {apt.status !== 'concluido' && apt.status !== 'cancelado' && (
                        <button
                          onClick={() => handleStartServiceAndOpenComanda(apt)}
                          className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                        >
                          <Scissors className="w-3.5 h-3.5" />
                          <span>Iniciar Corte & Comanda</span>
                        </button>
                      )}

                      {apt.status !== 'confirmado' && apt.status !== 'concluido' && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'confirmado')}
                          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-emerald-400 text-xs font-semibold transition-colors"
                        >
                          Confirmar
                        </button>
                      )}

                      {apt.status !== 'concluido' && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'concluido')}
                          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-blue-400 text-xs font-semibold transition-colors"
                        >
                          Concluir & Faturar
                        </button>
                      )}

                      {apt.status !== 'cancelado' && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'cancelado')}
                          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-rose-400 text-xs font-semibold transition-colors"
                        >
                          Cancelar
                        </button>
                      )}

                      <button
                        onClick={() => deleteAppointment(apt.id)}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors"
                        title="Excluir agendamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CONTROLE FINANCEIRO */}
      {/* ========================================================= */}
      {activeTab === 'financeiro' && (
        <div className="space-y-8">
          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-lg font-bold text-neutral-100">
              Fluxo de Caixa & Lançamentos
            </h2>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowExpenseModal(true)}
                className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-rose-500/30 text-rose-400 hover:bg-rose-950/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Registrar Despesa</span>
              </button>

              <button
                onClick={() => setShowSellProductModal(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Registrar Venda de Produto</span>
              </button>
            </div>
          </div>

          {/* Commission calculation card per barber */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-amber-400" />
                  <span>Comissões dos Barbeiros</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Cálculo automático de repasse baseado na porcentagem de comissão cadastrada
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {barbersCommissions.map((item) => (
                <div
                  key={item.barber.id}
                  className="bg-neutral-950 border border-neutral-800/90 rounded-xl p-4 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.barber.photoUrl}
                        alt={item.barber.name}
                        className="w-10 h-10 rounded-full object-cover border border-amber-500/30"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-neutral-200">{item.barber.name}</h4>
                        <span className="text-[10px] text-amber-400 font-semibold">
                          Comissão: {item.commissionRatePercent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs pt-2 border-t border-neutral-900">
                    <div className="flex justify-between text-neutral-400">
                      <span>Cortes Realizados:</span>
                      <strong className="text-neutral-200 tabular-nums">{item.totalAppointments}</strong>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Total Faturado:</span>
                      <strong className="text-neutral-200 tabular-nums">{formatBRL(item.totalBilled)}</strong>
                    </div>
                    <div className="flex justify-between text-amber-400 font-semibold pt-1 border-t border-neutral-900">
                      <span>Comissão a Pagar:</span>
                      <strong className="tabular-nums">{formatBRL(item.commissionValue)}</strong>
                    </div>
                    <div className="flex justify-between text-emerald-400 text-[11px]">
                      <span>Fica para a Barbearia:</span>
                      <span className="tabular-nums">{formatBRL(item.shopKeep)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Transactions List */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-neutral-100">Extrato de Entradas & Saídas</span>
              </div>

              <div className="flex items-center gap-1.5">
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: 'entradas', label: 'Entradas (+)' },
                  { id: 'saidas', label: 'Saídas (-)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFinancialTypeFilter(f.id as any)}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      financialTypeFilter === f.id
                        ? 'bg-amber-400 text-neutral-950 font-bold'
                        : 'text-neutral-400 hover:text-white bg-neutral-950'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Data</th>
                    <th className="py-3 px-4 font-semibold">Tipo</th>
                    <th className="py-3 px-4 font-semibold">Descrição</th>
                    <th className="py-3 px-4 font-semibold">Categoria</th>
                    <th className="py-3 px-4 font-semibold">Pagamento</th>
                    <th className="py-3 px-4 font-semibold text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {financialEntries
                    .filter((entry) => {
                      if (financialTypeFilter === 'entradas')
                        return entry.type === 'receita_servico' || entry.type === 'receita_produto';
                      if (financialTypeFilter === 'saidas') return entry.type === 'despesa';
                      return true;
                    })
                    .map((entry) => {
                      const isPositive = entry.type !== 'despesa';
                      const dateFormatted = entry.date.split('-').reverse().join('/');

                      return (
                        <tr key={entry.id} className="hover:bg-neutral-800/30 transition-colors">
                          <td className="py-3 px-4 text-neutral-400 tabular-nums">{dateFormatted}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                isPositive
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-950 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {entry.type === 'receita_servico'
                                ? 'Serviço'
                                : entry.type === 'receita_produto'
                                ? 'Produto'
                                : 'Despesa'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-neutral-200">
                            {entry.description}
                          </td>
                          <td className="py-3 px-4 text-neutral-400">{entry.category}</td>
                          <td className="py-3 px-4 uppercase text-neutral-400 font-mono text-[11px]">
                            {entry.paymentMethod.replace('_', ' ')}
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-bold tabular-nums ${
                              isPositive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isPositive ? '+' : '-'} {formatBRL(entry.amount)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: CADASTRAR & MODIFICAR SERVIÇOS DE CORTE / BARBA */}
      {/* ========================================================= */}
      {activeTab === 'servicos' && (
        <AdminServicesTab
          services={services}
          onServicesChange={setServices}
          showToast={showToast}
        />
      )}

      {/* ========================================================= */}
      {/* TAB: MODIFICAR BARBEIROS */}
      {/* ========================================================= */}
      {activeTab === 'barbeiros' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold text-neutral-100">
                Gerenciar Equipe de Barbeiros & Fotos
              </h2>
              <p className="text-xs text-neutral-400">
                Adicione barbeiros, envie fotos do celular ou computador, defina horários de expediente e porcentagem de comissão.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingBarber(null);
                setBarberPhotoPreview(BARBER_MARCUS_IMG);
                setShowBarberModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-400/10"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Novo Barbeiro</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbers.map((barber) => (
              <div
                key={barber.id}
                className={`bg-neutral-900 border rounded-2xl p-5 flex flex-col justify-between transition-colors ${
                  barber.active ? 'border-neutral-800' : 'border-neutral-800/40 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={barber.photoUrl}
                      alt={barber.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/30 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-base font-bold text-neutral-100">
                          {barber.name}
                        </h3>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            barber.active
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : 'bg-neutral-800 text-neutral-500'
                          }`}
                        >
                          {barber.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <p className="text-xs text-amber-400 font-medium">{barber.role}</p>
                      <div className="text-[11px] text-neutral-400 mt-1">
                        Horário: <strong className="text-neutral-200">{barber.workingHours.start} às {barber.workingHours.end}</strong>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 mb-3 leading-relaxed">{barber.bio}</p>

                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 space-y-1 text-xs mb-4">
                    <div className="flex justify-between text-neutral-400">
                      <span>Comissão de Repasse:</span>
                      <strong className="text-amber-400">{barber.commissionPercentage || 50}%</strong>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Avaliação Média:</span>
                      <span className="text-neutral-200">⭐ {barber.rating.toFixed(2)} ({barber.totalReviews} votos)</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Especialidades:</span>
                      <span className="text-neutral-300 truncate max-w-[150px]">
                        {barber.specialties.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                  <button
                    onClick={() => {
                      setEditingBarber(barber);
                      setBarberPhotoPreview(barber.photoUrl);
                      setShowBarberModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Modificar</span>
                  </button>

                  <button
                    onClick={() => handleDeleteBarber(barber.id)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                    title="Excluir barbeiro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: MODIFICAR & ADICIONAR PRODUTOS */}
      {/* ========================================================= */}
      {activeTab === 'produtos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold text-neutral-100">
                Produtos & Controle de Estoque
              </h2>
              <p className="text-xs text-neutral-400">
                Cadastre pomadas, óleos, tônicos, cervejas e registre vendas com baixa automática no estoque.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowSellProductModal(true)}
                className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Vender Produto</span>
              </button>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Novo Produto</span>
              </button>
            </div>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((prod) => {
              const profitMargin = prod.price - prod.costPrice;
              const isLowStock = prod.stock <= 5;

              return (
                <div
                  key={prod.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                          {prod.category}
                        </span>
                        <h3 className="text-sm font-bold text-neutral-100 mt-1.5">
                          {prod.name}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-neutral-100 tabular-nums">
                          {formatBRL(prod.price)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-400 mb-4 line-clamp-2">
                      {prod.description}
                    </p>

                    <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-3 space-y-1.5 text-xs mb-4">
                      <div className="flex justify-between items-center text-neutral-400">
                        <span>Estoque Disponível:</span>
                        <span
                          className={`font-bold tabular-nums flex items-center gap-1 ${
                            isLowStock ? 'text-amber-400' : 'text-neutral-200'
                          }`}
                        >
                          {isLowStock && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                          {prod.stock} un
                        </span>
                      </div>

                      <div className="flex justify-between text-neutral-400">
                        <span>Preço de Custo:</span>
                        <span className="tabular-nums">{formatBRL(prod.costPrice)}</span>
                      </div>

                      <div className="flex justify-between text-emerald-400 font-semibold pt-1 border-t border-neutral-900">
                        <span>Lucro por Unidade:</span>
                        <span className="tabular-nums">+{formatBRL(profitMargin)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                    <button
                      onClick={() => {
                        setEditingProduct(prod);
                        setShowProductModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Modificar</span>
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                      title="Excluir produto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: INSUMOS DA BARBEARIA (USO INTERNO) */}
      {/* ========================================================= */}
      {activeTab === 'insumos' && (
        <AdminSuppliesTab
          supplies={supplies}
          onSuppliesChange={setSupplies}
          showToast={showToast}
          onRefreshFinancial={() => setFinancialEntries(loadFinancialEntries())}
        />
      )}

      {/* ========================================================= */}
      {/* TAB: PLANOS DE ASSINATURA & PAGAMENTOS */}
      {/* ========================================================= */}
      {activeTab === 'planos' && (
        <AdminPlansTab
          plans={plans}
          onPlansChange={setPlans}
          config={config}
          onConfigChange={setConfig}
          showToast={showToast}
        />
      )}

      {/* ========================================================= */}
      {/* TAB: FOTOS & GALERIA DA LANDING PAGE */}
      {/* ========================================================= */}
      {activeTab === 'fotos' && (
        <AdminGalleryTab
          config={config}
          onConfigChange={setConfig}
          showToast={showToast}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 5: CLIENTES (CRM) */}
      {/* ========================================================= */}
      {activeTab === 'clientes' && (
        <div className="space-y-6">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Buscar cliente por nome ou WhatsApp..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="text-xs text-neutral-400">
              {customers.length} clientes salvos automaticamente pelo agendamento WhatsApp
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Cliente</th>
                    <th className="py-3 px-4 font-semibold">WhatsApp</th>
                    <th className="py-3 px-4 font-semibold text-center">Atendimentos</th>
                    <th className="py-3 px-4 font-semibold">Última Visita</th>
                    <th className="py-3 px-4 font-semibold">Observações</th>
                    <th className="py-3 px-4 font-semibold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {customers
                    .filter((c) => {
                      if (!customerSearch) return true;
                      const q = customerSearch.toLowerCase();
                      return (
                        c.name.toLowerCase().includes(q) ||
                        cleanPhoneDigits(c.whatsapp).includes(cleanPhoneDigits(q))
                      );
                    })
                    .map((customer) => {
                      const waUrl = `https://api.whatsapp.com/send?phone=55${cleanPhoneDigits(
                        customer.whatsapp
                      )}&text=${encodeURIComponent(
                        `Olá, ${customer.name}! Tudo bem? Aqui é da Barbearia Império passando para saber se está na hora de renovar seu corte no padrão de rei! 👑`
                      )}`;

                      return (
                        <tr key={customer.id} className="hover:bg-neutral-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-neutral-200">
                            {customer.name}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-neutral-300 tabular-nums">
                            {formatPhone(customer.whatsapp)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                              {customer.totalAppointments}x
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-neutral-400">
                            {customer.lastVisit
                              ? customer.lastVisit.split('-').reverse().join('/')
                              : 'Hoje'}
                          </td>
                          <td className="py-3.5 px-4 text-neutral-400 max-w-xs truncate">
                            {customer.notes || '—'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white font-medium transition-colors"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: CONFIGURAÇÕES */}
      {/* ========================================================= */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveConfig(config);
              showToast('Configurações salvas com sucesso!');
            }}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 max-w-3xl"
          >
          <h2 className="font-display text-lg font-bold text-neutral-100">
            Dados do Estabelecimento & Horários
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Nome da Barbearia
              </label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2 text-xs text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                WhatsApp Comercial
              </label>
              <input
                type="text"
                value={config.whatsappBusiness}
                onChange={(e) => setConfig({ ...config, whatsappBusiness: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2 text-xs text-neutral-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Horário de Abertura
              </label>
              <input
                type="time"
                value={config.openingHour}
                onChange={(e) => setConfig({ ...config, openingHour: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2 text-xs text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Horário de Fechamento
              </label>
              <input
                type="time"
                value={config.closingHour}
                onChange={(e) => setConfig({ ...config, closingHour: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2 text-xs text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Endereço
              </label>
              <input
                type="text"
                value={config.address}
                onChange={(e) => setConfig({ ...config, address: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2 text-xs text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Chave PIX
              </label>
              <input
                type="text"
                value={config.pixKey}
                onChange={(e) => setConfig({ ...config, pixKey: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2 text-xs text-neutral-100"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-400/10"
            >
              Salvar Alterações
            </button>
          </div>
        </form>

        {/* Clean slate card */}
        <div className="bg-neutral-900 border border-rose-500/20 rounded-2xl p-6 sm:p-8 space-y-4 max-w-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-neutral-100">
                Zerar Dados Operacionais de Teste
              </h3>
              <p className="text-xs text-neutral-400">
                Limpa agendamentos, lançamentos financeiros e clientes de teste para você iniciar com sua barbearia real zerada.
              </p>
            </div>
          </div>

          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-xs text-neutral-300 space-y-1">
            <p>
              ⚠️ <strong className="text-rose-400">O que será zerado:</strong> Todos os agendamentos da agenda, entradas e despesas do financeiro e histórico de clientes.
            </p>
            <p>
              ✅ <strong className="text-emerald-400">O que será mantido:</strong> Seus serviços cadastrados, sua equipe de barbeiros, seus produtos, insumos e planos de assinatura.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowResetConfirmModal(true)}
              className="px-5 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Zerar Dados Operacionais Agora</span>
            </button>
          </div>
        </div>
      </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: NOVO / EDITAR BARBEIRO */}
      {/* ========================================================= */}
      {showBarberModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-display text-base font-bold text-neutral-100">
                {editingBarber ? 'Modificar Barbeiro' : 'Adicionar Novo Barbeiro'}
              </h3>
              <button
                onClick={() => {
                  setShowBarberModal(false);
                  setEditingBarber(null);
                }}
                className="text-neutral-500 hover:text-neutral-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBarber} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingBarber?.name || ''}
                    placeholder="Ex: Matheus Oliveira"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Apelido / Como é Chamado</label>
                  <input
                    type="text"
                    name="nickname"
                    defaultValue={editingBarber?.nickname || ''}
                    placeholder="Ex: Matheus"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Cargo / Título</label>
                  <input
                    type="text"
                    name="role"
                    defaultValue={editingBarber?.role || 'Barbeiro Especialista'}
                    placeholder="Ex: Barbeiro Estilista"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">% de Comissão (Repasse)</label>
                  <input
                    type="number"
                    name="commission"
                    defaultValue={editingBarber?.commissionPercentage || 50}
                    min={0}
                    max={100}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Horário Início</label>
                  <input
                    type="time"
                    name="start"
                    defaultValue={editingBarber?.workingHours?.start || '09:00'}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Horário Fim</label>
                  <input
                    type="time"
                    name="end"
                    defaultValue={editingBarber?.workingHours?.end || '20:00'}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Especialidades (separadas por vírgula)</label>
                <input
                  type="text"
                  name="specialties"
                  defaultValue={editingBarber?.specialties.join(', ') || 'Degradê, Barboterapia, Tesoura'}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Biografia Resumida</label>
                <textarea
                  name="bio"
                  rows={2}
                  defaultValue={editingBarber?.bio || ''}
                  placeholder="Experiência e estilo do profissional..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                />
              </div>

              {/* Barber Photo Upload & Preview */}
              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-3">
                <label className="block font-semibold text-neutral-200">
                  Foto do Barbeiro (Upload ou URL)
                </label>

                <div className="flex items-center gap-4">
                  <img
                    src={barberPhotoPreview || editingBarber?.photoUrl || BARBER_MARCUS_IMG}
                    alt="Preview Barbeiro"
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shrink-0 shadow-lg"
                  />
                  <div className="flex-1 space-y-2">
                    <label className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-amber-500/30 hover:border-amber-400 rounded-lg cursor-pointer bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 font-semibold transition-colors text-center">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Enviar foto do seu dispositivo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const dataUrl = await readFileAsDataUrl(file);
                            setBarberPhotoPreview(dataUrl);
                          } catch {
                            alert('Erro ao carregar imagem.');
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="url"
                      name="photoUrl"
                      placeholder="Ou cole a URL da foto (https://...)"
                      value={barberPhotoPreview}
                      onChange={(e) => setBarberPhotoPreview(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-100 placeholder-neutral-500 text-[11px] focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-neutral-400">Modelos:</span>
                  <button
                    type="button"
                    onClick={() => setBarberPhotoPreview(BARBER_MARCUS_IMG)}
                    className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 hover:text-amber-400 border border-neutral-800"
                  >
                    Marcus
                  </button>
                  <button
                    type="button"
                    onClick={() => setBarberPhotoPreview(BARBER_LUCAS_IMG)}
                    className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 hover:text-amber-400 border border-neutral-800"
                  >
                    Lucas
                  </button>
                  <button
                    type="button"
                    onClick={() => setBarberPhotoPreview(BARBER_RAFAEL_IMG)}
                    className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 hover:text-amber-400 border border-neutral-800"
                  >
                    Rafael
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  defaultChecked={editingBarber ? editingBarber.active : true}
                  className="rounded text-amber-400 focus:ring-0"
                />
                <label htmlFor="active" className="text-neutral-300">
                  Barbeiro ativo (disponível para agendamentos online de clientes)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowBarberModal(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold"
                >
                  Salvar Barbeiro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: NOVO / EDITAR PRODUTO */}
      {/* ========================================================= */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-display text-base font-bold text-neutral-100">
                {editingProduct ? 'Modificar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                }}
                className="text-neutral-500 hover:text-neutral-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-300 mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingProduct?.name || ''}
                  placeholder="Ex: Pomada Efeito Brilho 150g"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Categoria</label>
                  <select
                    name="category"
                    defaultValue={editingProduct?.category || 'pomada'}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                  >
                    <option value="pomada">Pomada / Cera</option>
                    <option value="barba">Óleo / Balm Barba</option>
                    <option value="shampoo">Shampoo / Condicionador</option>
                    <option value="bebida">Bebida / Cerveja Lounge</option>
                    <option value="acessorio">Acessório / Pente</option>
                    <option value="outro">Outro Tratamento</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Quantidade em Estoque</label>
                  <input
                    type="number"
                    name="stock"
                    min={0}
                    defaultValue={editingProduct?.stock ?? 10}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Preço de Venda (R$) *</label>
                  <input
                    type="number"
                    name="price"
                    step="0.5"
                    min={0}
                    defaultValue={editingProduct?.price || 40}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Preço de Custo (R$)</label>
                  <input
                    type="number"
                    name="costPrice"
                    step="0.5"
                    min={0}
                    defaultValue={editingProduct?.costPrice || 15}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Descrição</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingProduct?.description || ''}
                  placeholder="Benefícios e modo de uso..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeProd"
                  name="active"
                  defaultChecked={editingProduct ? editingProduct.active : true}
                  className="rounded text-amber-400"
                />
                <label htmlFor="activeProd" className="text-neutral-300">
                  Produto ativo para venda no balcão
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VENDER PRODUTO */}
      {/* ========================================================= */}
      {showSellProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-display text-base font-bold text-neutral-100 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                <span>Registrar Venda no Balcão</span>
              </h3>
              <button
                onClick={() => setShowSellProductModal(false)}
                className="text-neutral-500 hover:text-neutral-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSellProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-300 mb-1">Produto</label>
                <select
                  name="productId"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                  required
                >
                  {products
                    .filter((p) => p.active && p.stock > 0)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {formatBRL(p.price)} (Estoque: {p.stock})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Quantidade</label>
                  <input
                    type="number"
                    name="quantity"
                    min={1}
                    defaultValue={1}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Forma de Pagamento</label>
                  <select
                    name="paymentMethod"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                  >
                    <option value="pix">PIX</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="dinheiro">Dinheiro</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowSellProductModal(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Confirmar Venda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: REGISTRAR DESPESA */}
      {/* ========================================================= */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-display text-base font-bold text-neutral-100 flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
                <span>Registrar Nova Despesa</span>
              </h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-neutral-500 hover:text-neutral-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-300 mb-1">Descrição do Gasto *</label>
                <input
                  type="text"
                  name="description"
                  placeholder="Ex: Compra de toalhas descartáveis, Conta de Luz..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    name="amount"
                    step="0.5"
                    min={0.1}
                    placeholder="0,00"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Categoria</label>
                  <select
                    name="category"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                  >
                    <option value="Insumos Barbearia">Insumos Barbearia</option>
                    <option value="Aluguel & Contas">Aluguel & Contas</option>
                    <option value="Lounge & Cortesias">Lounge & Bebidas</option>
                    <option value="Manutenção">Manutenção / Equipamentos</option>
                    <option value="Marketing">Marketing / Divulgação</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Forma de Pagamento</label>
                  <select
                    name="paymentMethod"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                  >
                    <option value="pix">PIX</option>
                    <option value="cartao_debito">Cartão Débito</option>
                    <option value="cartao_credito">Cartão Crédito</option>
                    <option value="dinheiro">Dinheiro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Data</label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={getTodayDateString()}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Lançar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: NOVO AGENDAMENTO MANUAL */}
      {/* ========================================================= */}
      {showNewAptModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-display text-base font-bold text-neutral-100">
                Novo Agendamento Manual (Presencial / Telefone)
              </h3>
              <button
                onClick={() => setShowNewAptModal(false)}
                className="text-neutral-500 hover:text-neutral-300"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                const phone = formData.get('phone') as string;
                const barberId = formData.get('barberId') as string;
                const serviceId = formData.get('serviceId') as string;
                const date = formData.get('date') as string;
                const time = formData.get('time') as string;
                const notes = formData.get('notes') as string;

                const savedCust = registerOrUpdateCustomer(name, phone, notes);
                const barber = barbers.find((b) => b.id === barberId) || barbers[0];
                const srv = services.find((s) => s.id === serviceId) || services[0];

                const newApt: Appointment = {
                  id: 'apt-manual-' + Date.now(),
                  customerId: savedCust.id,
                  customerName: savedCust.name,
                  customerWhatsapp: savedCust.whatsapp,
                  barberId: barber.id,
                  barberName: barber.name,
                  serviceIds: [srv.id],
                  servicesNames: [srv.name],
                  totalPrice: srv.price,
                  totalDuration: srv.durationMinutes,
                  date,
                  time,
                  status: 'confirmado',
                  notes,
                  createdAt: new Date().toISOString(),
                };

                const updated = [newApt, ...appointments];
                setAppointments(updated);
                saveAppointments(updated);
                setCustomers(loadCustomers());
                setShowNewAptModal(false);
                showToast('Agendamento manual criado com sucesso!');
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-medium text-neutral-300 mb-1">Nome do Cliente *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nome completo"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">WhatsApp do Cliente *</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="(11) 98765-4321"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Barbeiro</label>
                  <select
                    name="barberId"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                  >
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Serviço Principal</label>
                  <select
                    name="serviceId"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({formatBRL(s.price)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Data</label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={selectedDate || getTodayDateString()}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Horário</label>
                  <input
                    type="time"
                    name="time"
                    defaultValue="10:00"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Observações</label>
                <input
                  type="text"
                  name="notes"
                  placeholder="Ex: Agendou por telefone, etc."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowNewAptModal(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CONFIRMAR ZERAR DADOS OPERACIONAIS */}
      {/* ========================================================= */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-rose-500/30 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-display text-lg font-bold text-neutral-100">
                Zerar Todos os Dados Operacionais?
              </h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Esta ação vai limpar todos os agendamentos da agenda, todo o histórico do financeiro e a lista de clientes para você iniciar suas operações 100% limpas.
              </p>
            </div>

            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs text-neutral-300">
              <p className="font-semibold text-emerald-400 mb-1">
                Seus serviços, barbeiros, produtos e configurações NÃO serão apagados.
              </p>
              <p className="text-neutral-500 text-[11px]">
                Apenas dados operacionais de teste serão removidos.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAllAdminData();
                  setAppointments([]);
                  setCustomers([]);
                  setFinancialEntries([]);
                  setComandas([]);
                  setShowResetConfirmModal(false);
                  showToast('Painel operacional zerado com sucesso! Pronto para cadastrar suas informações reais.');
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20"
              >
                Sim, Zerar Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: FECHAMENTO DE COMANDA & PDV */}
      {/* ========================================================= */}
      {selectedPDVComanda && (
        <PDVCheckoutModal
          isOpen={!!selectedPDVComanda}
          onClose={() => setSelectedPDVComanda(null)}
          comanda={selectedPDVComanda}
          config={config}
          services={services}
          products={products}
          barbers={barbers}
          onCompleted={(closed) => {
            setSelectedPDVComanda(null);
            setComandas(loadComandas());
            setFinancialEntries(loadFinancialEntries());
            setAppointments(loadAppointments());
            setProducts(loadProducts());
            setSelectedReceiptComanda(closed);
          }}
          showToast={showToast}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: NOTA NÃO FISCAL / CUPOM TÉRMICO */}
      {/* ========================================================= */}
      {selectedReceiptComanda && (
        <ReceiptModal
          isOpen={!!selectedReceiptComanda}
          onClose={() => setSelectedReceiptComanda(null)}
          comanda={selectedReceiptComanda}
          config={config}
        />
      )}
    </div>
  );
};
