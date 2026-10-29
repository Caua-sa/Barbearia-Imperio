import React, { useState, useMemo } from 'react';
import {
  Scissors,
  Plus,
  Search,
  Filter,
  DollarSign,
  Clock,
  User,
  ShoppingBag,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  Calendar,
  X,
  CreditCard,
  Crown,
} from 'lucide-react';
import {
  Comanda,
  ComandaItem,
  BusinessConfig,
  Service,
  Product,
  Barber,
  PaymentMethod,
} from '../../types';
import {
  formatBRL,
  formatPhone,
  cleanPhoneDigits,
  getTodayDateString,
  createComanda,
  updateComanda,
  cancelComanda,
  saveComandas,
} from '../../services/storage';

interface AdminComandasTabProps {
  comandas: Comanda[];
  onComandasChange: (comandas: Comanda[]) => void;
  config: BusinessConfig;
  services: Service[];
  products: Product[];
  barbers: Barber[];
  onOpenPDV: (comanda: Comanda) => void;
  onOpenReceipt: (comanda: Comanda) => void;
  showToast: (msg: string) => void;
}

export const AdminComandasTab: React.FC<AdminComandasTabProps> = ({
  comandas,
  onComandasChange,
  config,
  services,
  products,
  barbers,
  onOpenPDV,
  onOpenReceipt,
  showToast,
}) => {
  const [filterStatus, setFilterStatus] = useState<'todas' | 'aberta' | 'fechada'>('todas');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal: New Walk-in Comanda
  const [showNewModal, setShowNewModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newBarberId, setNewBarberId] = useState(barbers[0]?.id || '');
  const [newSelectedServiceId, setNewSelectedServiceId] = useState(services[0]?.id || '');

  // Modal: Quick Item Editor
  const [editingComanda, setEditingComanda] = useState<Comanda | null>(null);
  const [addServiceId, setAddServiceId] = useState('');
  const [addProductId, setAddProductId] = useState('');

  // Elapsed time formatter
  const getElapsedTime = (isoString: string) => {
    try {
      const opened = new Date(isoString).getTime();
      const now = Date.now();
      const diffMins = Math.floor((now - opened) / (1000 * 60));
      if (diffMins < 1) return 'Iniciou agora';
      if (diffMins < 60) return `Há ${diffMins} min`;
      const hrs = Math.floor(diffMins / 60);
      const rem = diffMins % 60;
      return `Há ${hrs}h ${rem}m`;
    } catch {
      return '';
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const today = getTodayDateString();
    const abertas = comandas.filter((c) => c.status === 'aberta');
    const fechadasHoje = comandas.filter((c) => {
      if (c.status !== 'fechada') return false;
      const datePart = (c.closedAt || c.openedAt).slice(0, 10);
      return datePart === today;
    });

    const faturamentoHoje = fechadasHoje.reduce((acc, c) => acc + c.total, 0);

    return {
      abertasCount: abertas.length,
      fechadasCount: fechadasHoje.length,
      faturamentoHoje,
    };
  }, [comandas]);

  // Filtered comandas list
  const filteredComandas = useMemo(() => {
    return comandas.filter((cmd) => {
      if (filterStatus !== 'todas' && cmd.status !== filterStatus) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const codeMatch = String(cmd.code).includes(term);
        const nameMatch = cmd.customerName.toLowerCase().includes(term);
        const barberMatch = cmd.barberName.toLowerCase().includes(term);
        const phoneMatch = cleanPhoneDigits(cmd.customerWhatsapp).includes(cleanPhoneDigits(term));
        if (!codeMatch && !nameMatch && !barberMatch && !phoneMatch) return false;
      }
      return true;
    });
  }, [comandas, filterStatus, searchTerm]);

  // Create new walk-in comanda
  const handleCreateNewComanda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) {
      showToast('Informe o nome do cliente.');
      return;
    }

    const barber = barbers.find((b) => b.id === newBarberId) || barbers[0];
    const service = services.find((s) => s.id === newSelectedServiceId);

    const initialItems: ComandaItem[] = [];
    let initialSubtotal = 0;

    if (service) {
      initialItems.push({
        id: 'it-' + Date.now(),
        type: 'servico',
        itemId: service.id,
        name: service.name,
        price: service.price,
        quantity: 1,
        total: service.price,
      });
      initialSubtotal += service.price;
    }

    const created = createComanda({
      customerName: newCustomerName.trim(),
      customerWhatsapp: cleanPhoneDigits(newCustomerPhone),
      barberId: barber.id,
      barberName: barber.name,
      status: 'aberta',
      items: initialItems,
      subtotal: initialSubtotal,
      discount: 0,
      tip: 0,
      total: initialSubtotal,
    });

    onComandasChange([created, ...comandas]);
    setShowNewModal(false);
    setNewCustomerName('');
    setNewCustomerPhone('');
    showToast(`Comanda #${created.code} aberta com sucesso!`);
  };

  // Add service in editing comanda
  const handleAddServiceToEditing = (srvId: string) => {
    if (!editingComanda || !srvId) return;
    const srv = services.find((s) => s.id === srvId);
    if (!srv) return;

    const newItem: ComandaItem = {
      id: 'it-' + Date.now(),
      type: 'servico',
      itemId: srv.id,
      name: srv.name,
      price: srv.price,
      quantity: 1,
      total: srv.price,
    };

    const newItems = [...editingComanda.items, newItem];
    const newSubtotal = newItems.reduce((acc, it) => acc + it.total, 0);
    const newTotal = Math.max(0, newSubtotal - editingComanda.discount + editingComanda.tip);

    const updated: Comanda = {
      ...editingComanda,
      items: newItems,
      subtotal: newSubtotal,
      total: newTotal,
    };

    updateComanda(updated);
    setEditingComanda(updated);
    onComandasChange(comandas.map((c) => (c.id === updated.id ? updated : c)));
    setAddServiceId('');
    showToast(`Serviço "${srv.name}" adicionado à comanda!`);
  };

  // Add product in editing comanda
  const handleAddProductToEditing = (prodId: string) => {
    if (!editingComanda || !prodId) return;
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;

    const existingIdx = editingComanda.items.findIndex(
      (it) => it.type === 'produto' && it.itemId === prod.id
    );

    let newItems = [...editingComanda.items];
    if (existingIdx >= 0) {
      newItems[existingIdx].quantity += 1;
      newItems[existingIdx].total = newItems[existingIdx].quantity * newItems[existingIdx].price;
    } else {
      newItems.push({
        id: 'it-' + Date.now(),
        type: 'produto',
        itemId: prod.id,
        name: prod.name,
        price: prod.price,
        quantity: 1,
        total: prod.price,
      });
    }

    const newSubtotal = newItems.reduce((acc, it) => acc + it.total, 0);
    const newTotal = Math.max(0, newSubtotal - editingComanda.discount + editingComanda.tip);

    const updated: Comanda = {
      ...editingComanda,
      items: newItems,
      subtotal: newSubtotal,
      total: newTotal,
    };

    updateComanda(updated);
    setEditingComanda(updated);
    onComandasChange(comandas.map((c) => (c.id === updated.id ? updated : c)));
    setAddProductId('');
    showToast(`Produto "${prod.name}" adicionado!`);
  };

  // Remove item from editing comanda
  const handleRemoveItemFromEditing = (itemId: string) => {
    if (!editingComanda) return;
    const newItems = editingComanda.items.filter((it) => it.id !== itemId);
    const newSubtotal = newItems.reduce((acc, it) => acc + it.total, 0);
    const newTotal = Math.max(0, newSubtotal - editingComanda.discount + editingComanda.tip);

    const updated: Comanda = {
      ...editingComanda,
      items: newItems,
      subtotal: newSubtotal,
      total: newTotal,
    };

    updateComanda(updated);
    setEditingComanda(updated);
    onComandasChange(comandas.map((c) => (c.id === updated.id ? updated : c)));
  };

  // Cancel Comanda
  const handleCancelComanda = (comandaId: string, code: number) => {
    if (!window.confirm(`Tem certeza que deseja cancelar a Comanda #${code}?`)) return;
    const cancelled = cancelComanda(comandaId);
    if (cancelled) {
      onComandasChange(comandas.map((c) => (c.id === comandaId ? cancelled : c)));
      showToast(`Comanda #${code} cancelada.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Operação de Salão & PDV
            </span>
          </div>
          <h2 className="font-display text-lg font-bold text-neutral-100 flex items-center gap-2 mt-1">
            <Receipt className="w-5 h-5 text-amber-400" />
            <span>Comandas & Ponto de Venda (PDV)</span>
          </h2>
          <p className="text-xs text-neutral-400">
            Acompanhe cortes em andamento, lance produtos consumidos, finalize no PDV e emita o cupom não fiscal térmico.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-amber-400/10 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Abrir Comanda Balcão</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium block">Comandas em Atendimento</span>
            <span className="text-2xl font-black font-display text-amber-400">
              {metrics.abertasCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <Scissors className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium block">Finalizadas Hoje</span>
            <span className="text-2xl font-black font-display text-emerald-400">
              {metrics.fechadasCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium block">Faturamento PDV Hoje</span>
            <span className="text-2xl font-black font-display text-neutral-100">
              {formatBRL(metrics.faturamentoHoje)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-900/60 p-3 rounded-2xl border border-neutral-800">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'todas', label: 'Todas as Comandas' },
            { id: 'aberta', label: `Em Atendimento (${metrics.abertasCount})` },
            { id: 'fechada', label: 'Finalizadas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStatus === tab.id
                  ? 'bg-amber-400 text-neutral-950 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por código, cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Comandas Grid */}
      {filteredComandas.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-neutral-800 rounded-3xl space-y-3 bg-neutral-900/20">
          <Receipt className="w-10 h-10 text-neutral-600 mx-auto" />
          <h4 className="font-display text-sm font-bold text-neutral-300">
            Nenhuma comanda encontrada
          </h4>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Abra uma nova comanda para atender clientes no balcão ou inicie um corte diretamente da Agenda.
          </p>
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Abrir Nova Comanda</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredComandas.map((cmd) => {
            const isAberta = cmd.status === 'aberta';
            const elapsed = isAberta ? getElapsedTime(cmd.openedAt) : '';

            return (
              <div
                key={cmd.id}
                className={`bg-neutral-900 border rounded-2xl p-5 flex flex-col justify-between transition-all relative overflow-hidden ${
                  isAberta
                    ? 'border-amber-500/40 shadow-xl shadow-amber-500/5 bg-gradient-to-b from-amber-950/10 to-neutral-900'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Status chip */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-amber-400">
                      #{cmd.code}
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        isAberta
                          ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30 animate-pulse'
                          : cmd.status === 'fechada'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {isAberta ? 'Em Atendimento' : cmd.status === 'fechada' ? 'Finalizada' : 'Cancelada'}
                    </span>
                  </div>

                  {isAberta && (
                    <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{elapsed}</span>
                    </span>
                  )}
                </div>

                {/* Customer & Barber Details */}
                <div className="space-y-1 mb-4">
                  <h4 className="font-bold text-sm text-neutral-100 truncate">
                    {cmd.customerName}
                  </h4>
                  <div className="text-xs text-neutral-400 flex items-center gap-1.5 truncate">
                    <Scissors className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span>Barbeiro: <strong>{cmd.barberName}</strong></span>
                  </div>
                  {cmd.customerWhatsapp && (
                    <div className="text-[11px] text-neutral-500 font-mono">
                      {formatPhone(cmd.customerWhatsapp)}
                    </div>
                  )}
                </div>

                {/* Items Summary */}
                <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-3 mb-4 space-y-1.5 text-xs">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                    Itens Lançados ({cmd.items.length}):
                  </span>
                  <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                    {cmd.items.map((it) => (
                      <div key={it.id} className="flex justify-between items-center text-neutral-300 text-[11px]">
                        <span className="truncate pr-2">
                          {it.quantity}x {it.name}
                        </span>
                        <span className="font-mono text-neutral-400 shrink-0">
                          {formatBRL(it.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-neutral-800 flex justify-between items-center">
                    <span className="text-xs font-bold text-neutral-300">Total da Comanda:</span>
                    <span className="font-mono text-base font-black text-amber-400">
                      {formatBRL(cmd.total)}
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  {isAberta ? (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => onOpenPDV(cmd)}
                        className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-amber-400/10"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Fechar Comanda no PDV</span>
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingComanda(cmd)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar Itens</span>
                        </button>

                        <button
                          onClick={() => handleCancelComanda(cmd.id, cmd.code)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                          title="Cancelar comanda"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => onOpenReceipt(cmd)}
                        className="flex-1 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-neutral-700"
                      >
                        <Receipt className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ver Cupom Não Fiscal</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Open Walk-In Comanda */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-display text-base font-bold text-neutral-100 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-400" />
                <span>Abrir Nova Comanda (Balcão / Sem Agendamento)</span>
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-neutral-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewComanda} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-300 mb-1">Nome do Cliente *</label>
                <input
                  type="text"
                  placeholder="Nome do cliente"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">WhatsApp (Opcional)</label>
                <input
                  type="tel"
                  placeholder="(11) 98765-4321"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(formatPhone(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Barbeiro Responsável *</label>
                <select
                  value={newBarberId}
                  onChange={(e) => setNewBarberId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-400"
                >
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.nickname})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Serviço Inicial</label>
                <select
                  value={newSelectedServiceId}
                  onChange={(e) => setNewSelectedServiceId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="">Nenhum serviço inicial (adicionar depois)</option>
                  {services
                    .filter((s) => s.active !== false)
                    .map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.name} - {formatBRL(srv.price)}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold"
                >
                  Abrir Comanda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Item Editor */}
      {editingComanda && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-display text-base font-bold text-neutral-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Adicionar Itens na Comanda #{editingComanda.code}</span>
              </h3>
              <button onClick={() => setEditingComanda(null)} className="text-neutral-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">+ Serviço</label>
                  <select
                    value={addServiceId}
                    onChange={(e) => {
                      setAddServiceId(e.target.value);
                      handleAddServiceToEditing(e.target.value);
                    }}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                  >
                    <option value="">Selecione um serviço...</option>
                    {services
                      .filter((s) => s.active !== false)
                      .map((srv) => (
                        <option key={srv.id} value={srv.id}>
                          {srv.name} ({formatBRL(srv.price)})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-300 mb-1">+ Produto (Estoque)</label>
                  <select
                    value={addProductId}
                    onChange={(e) => {
                      setAddProductId(e.target.value);
                      handleAddProductToEditing(e.target.value);
                    }}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100"
                  >
                    <option value="">Selecione um produto...</option>
                    {products
                      .filter((p) => p.active !== false)
                      .map((prod) => (
                        <option key={prod.id} value={prod.id} disabled={prod.stock <= 0}>
                          {prod.name} (Qtd: {prod.stock}) - {formatBRL(prod.price)}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Current Items List */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <span className="font-semibold text-neutral-300 block">Itens Atuais na Comanda:</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {editingComanda.items.map((it) => (
                    <div
                      key={it.id}
                      className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-neutral-200">{it.name}</span>
                        <span className="text-[11px] text-neutral-400 block">
                          {it.quantity}x a {formatBRL(it.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-neutral-100">{formatBRL(it.total)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItemFromEditing(it.id)}
                          className="p-1 rounded text-neutral-500 hover:text-rose-400 hover:bg-neutral-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-neutral-800">
                <div className="text-xs">
                  <span className="text-neutral-400">Total:</span>{' '}
                  <strong className="font-mono text-base text-amber-400">
                    {formatBRL(editingComanda.total)}
                  </strong>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingComanda(null)}
                    className="px-4 py-2 rounded-xl text-neutral-300 hover:text-white"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cmd = editingComanda;
                      setEditingComanda(null);
                      onOpenPDV(cmd);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold"
                  >
                    Ir para PDV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
