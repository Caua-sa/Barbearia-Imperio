import React, { useState, useMemo } from 'react';
import {
  X,
  DollarSign,
  CreditCard,
  QrCode,
  Banknote,
  Receipt,
  Crown,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Calculator,
  User,
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
  closeComanda,
  updateComanda,
  findSubscriptionByPhone,
  isSubscriptionValid,
} from '../../services/storage';

interface PDVCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  comanda: Comanda | null;
  config: BusinessConfig;
  services: Service[];
  products: Product[];
  barbers: Barber[];
  onCompleted: (closedComanda: Comanda) => void;
  showToast: (msg: string) => void;
}

export const PDVCheckoutModal: React.FC<PDVCheckoutModalProps> = ({
  isOpen,
  onClose,
  comanda,
  config,
  services,
  products,
  barbers,
  onCompleted,
  showToast,
}) => {
  if (!isOpen || !comanda) return null;

  // Local working copy of comanda items and pricing
  const [items, setItems] = useState<ComandaItem[]>(() => [...comanda.items]);
  const [discount, setDiscount] = useState<number>(comanda.discount || 0);
  const [tip, setTip] = useState<number>(comanda.tip || 0);
  const [notes, setNotes] = useState<string>(comanda.notes || '');

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | 'mercado_pago' | 'plano_vip'>(
    'pix'
  );
  const [cashReceived, setCashReceived] = useState<string>('');

  // Add Item Dropdowns
  const [selectedServiceToAdd, setSelectedServiceToAdd] = useState<string>('');
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>('');

  // Check if customer has an active VIP subscription
  const customerSubscription = useMemo(() => {
    if (!comanda.customerWhatsapp) return null;
    const sub = findSubscriptionByPhone(comanda.customerWhatsapp);
    if (sub && isSubscriptionValid(sub)) return sub;
    return null;
  }, [comanda.customerWhatsapp]);

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  const total = useMemo(() => {
    const val = subtotal - Number(discount || 0) + Number(tip || 0);
    return Math.max(0, val);
  }, [subtotal, discount, tip]);

  // Cash change calculation
  const amountReceivedNum = Number(cashReceived) || 0;
  const changeDue = Math.max(0, amountReceivedNum - total);

  // Quick cash helper
  const handleQuickCash = (amount: number) => {
    setCashReceived(String(amount));
  };

  // Add service item
  const handleAddService = (srvId: string) => {
    if (!srvId) return;
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
    setItems((prev) => [...prev, newItem]);
    setSelectedServiceToAdd('');
    showToast(`Serviço "${srv.name}" adicionado à comanda!`);
  };

  // Add product item
  const handleAddProduct = (prodId: string) => {
    if (!prodId) return;
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;

    // Check if already in items
    const existingIndex = items.findIndex((it) => it.type === 'produto' && it.itemId === prod.id);
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].price;
      setItems(updated);
    } else {
      const newItem: ComandaItem = {
        id: 'it-' + Date.now(),
        type: 'produto',
        itemId: prod.id,
        name: prod.name,
        price: prod.price,
        quantity: 1,
        total: prod.price,
      };
      setItems((prev) => [...prev, newItem]);
    }
    setSelectedProductToAdd('');
    showToast(`Produto "${prod.name}" adicionado!`);
  };

  // Remove item
  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  // VIP Subscription discount quick action
  const handleApplyVipBenefit = () => {
    if (!customerSubscription) return;
    // Find the primary haircut/service and discount its value
    const primaryService = items.find((it) => it.type === 'servico');
    if (primaryService) {
      setDiscount(primaryService.price);
      setPaymentMethod('plano_vip');
      showToast(`Benefício VIP aplicado! Corte no valor de ${formatBRL(primaryService.price)} isentado pela assinatura.`);
    } else {
      setDiscount(subtotal);
      showToast('Benefício VIP aplicado para o atendimento!');
    }
  };

  // Submit payment and close comanda
  const handleFinalize = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      showToast('Adicione pelo menos um item à comanda.');
      return;
    }

    if (paymentMethod === 'dinheiro' && total > 0) {
      if (amountReceivedNum < total) {
        showToast('O valor recebido em dinheiro é inferior ao total da comanda.');
        return;
      }
    }

    // Save current items and details in comanda first
    const updatedComanda: Comanda = {
      ...comanda,
      items,
      subtotal,
      discount: Number(discount) || 0,
      tip: Number(tip) || 0,
      total,
      notes,
    };
    updateComanda(updatedComanda);

    // Close comanda, deduct products, add financial entry, update appointment
    const closed = closeComanda(
      comanda.id,
      paymentMethod,
      paymentMethod === 'dinheiro' ? amountReceivedNum : total,
      paymentMethod === 'dinheiro' ? changeDue : 0
    );

    if (closed) {
      showToast(`Comanda #${closed.code} finalizada com sucesso! Cupom emitido.`);
      onCompleted(closed);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center font-black">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-bold text-neutral-100">
                  PDV & Fechamento de Comanda
                </h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  #{comanda.code}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Cliente: <strong className="text-neutral-200">{comanda.customerName}</strong> • Barbeiro: <strong className="text-neutral-200">{comanda.barberName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split 2 Columns */}
        <form onSubmit={handleFinalize} className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Comanda Items & Quick Add (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* VIP Customer Alert if subscribed */}
            {customerSubscription && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-400 block">
                      Assinante VIP Ativo: {customerSubscription.planName}
                    </span>
                    <span className="text-[11px] text-neutral-300">
                      Válido até {customerSubscription.expiresAt.split('-').reverse().join('/')}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleApplyVipBenefit}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs shrink-0 transition-colors shadow-sm"
                >
                  Usar Benefício VIP
                </button>
              </div>
            )}

            {/* Quick Add Bar */}
            <div className="bg-neutral-950/60 border border-neutral-800 rounded-2xl p-3.5 space-y-2.5">
              <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Adicionar Itens à Comanda (Cortes ou Produtos)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Add Service */}
                <div>
                  <select
                    value={selectedServiceToAdd}
                    onChange={(e) => {
                      setSelectedServiceToAdd(e.target.value);
                      handleAddService(e.target.value);
                    }}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-400 text-xs"
                  >
                    <option value="">+ Adicionar Serviço...</option>
                    {services
                      .filter((s) => s.active !== false)
                      .map((srv) => (
                        <option key={srv.id} value={srv.id}>
                          {srv.name} - {formatBRL(srv.price)}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Add Product from Inventory */}
                <div>
                  <select
                    value={selectedProductToAdd}
                    onChange={(e) => {
                      setSelectedProductToAdd(e.target.value);
                      handleAddProduct(e.target.value);
                    }}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-400 text-xs"
                  >
                    <option value="">+ Adicionar Produto (Estoque)...</option>
                    {products
                      .filter((p) => p.active !== false)
                      .map((prod) => (
                        <option key={prod.id} value={prod.id} disabled={prod.stock <= 0}>
                          {prod.name} ({prod.stock > 0 ? `${prod.stock} em estoque` : 'Esgotado'}) - {formatBRL(prod.price)}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold px-1">
                <span>Itens Lançados ({items.length})</span>
                <span>Subtotal: {formatBRL(subtotal)}</span>
              </div>

              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-neutral-800 rounded-2xl text-neutral-500 text-xs">
                    Nenhum item na comanda ainda. Adicione serviços ou produtos acima.
                  </div>
                ) : (
                  items.map((it) => (
                    <div
                      key={it.id}
                      className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            it.type === 'servico'
                              ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                              : 'bg-blue-400/10 text-blue-400 border border-blue-400/20'
                          }`}
                        >
                          {it.type}
                        </span>
                        <div className="truncate">
                          <span className="font-semibold text-neutral-200 block truncate">
                            {it.name}
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            {it.quantity}x a {formatBRL(it.price)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono font-bold text-neutral-100">
                          {formatBRL(it.total)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(it.id)}
                          className="p-1 rounded text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                          title="Remover item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Adjustments: Discount & Barber Tip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Desconto Concedido (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-neutral-500 text-xs">R$</span>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={discount || ''}
                    onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                    placeholder="0,00"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-8 pr-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Gorjeta do Barbeiro (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-neutral-500 text-xs">R$</span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={tip || ''}
                    onChange={(e) => setTip(Math.max(0, Number(e.target.value)))}
                    placeholder="0,00"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-8 pr-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                {/* Tip chips */}
                <div className="flex gap-1.5 mt-1.5">
                  {[5, 10, 20].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTip(val)}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-colors ${
                        tip === val
                          ? 'bg-amber-400 text-neutral-950 font-bold'
                          : 'bg-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      +R$ {val}
                    </button>
                  ))}
                  {tip > 0 && (
                    <button
                      type="button"
                      onClick={() => setTip(0)}
                      className="text-[10px] px-1.5 py-0.5 rounded text-neutral-500 hover:text-rose-400"
                    >
                      Zerar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Payment & Totals (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-neutral-950/80 border border-neutral-800 rounded-2xl p-5 space-y-5">
            <div>
              {/* Payment Method Selector */}
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                Forma de Pagamento
              </label>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { id: 'pix', label: 'PIX', icon: QrCode, color: 'text-amber-400' },
                  { id: 'cartao_credito', label: 'Crédito', icon: CreditCard, color: 'text-blue-400' },
                  { id: 'cartao_debito', label: 'Débito', icon: CreditCard, color: 'text-indigo-400' },
                  { id: 'dinheiro', label: 'Dinheiro', icon: Banknote, color: 'text-emerald-400' },
                  { id: 'mercado_pago', label: 'Mercado Pago', icon: Sparkles, color: 'text-cyan-400' },
                  { id: 'plano_vip', label: 'Plano VIP', icon: Crown, color: 'text-amber-300' },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/10 text-neutral-100 shadow-sm'
                          : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${m.color}`} />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dinheiro specifics: Valor Recebido & Troco */}
              {paymentMethod === 'dinheiro' && (
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-300">Valor Recebido (R$):</span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder={total.toFixed(2)}
                      className="w-28 bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1 text-right font-mono font-bold text-amber-400 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Quick pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleQuickCash(total)}
                      className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-300"
                    >
                      Exato ({formatBRL(total)})
                    </button>
                    {[50, 100, 150, 200].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => handleQuickCash(v)}
                        className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-300"
                      >
                        R$ {v}
                      </button>
                    ))}
                  </div>

                  {/* Change display */}
                  <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                    <span className="text-xs text-neutral-400 font-medium">Troco a Devolver:</span>
                    <span
                      className={`text-base font-display font-black tabular-nums ${
                        changeDue > 0 ? 'text-emerald-400' : 'text-neutral-500'
                      }`}
                    >
                      {formatBRL(changeDue)}
                    </span>
                  </div>
                </div>
              )}

              {/* PIX / Mercado Pago info */}
              {paymentMethod === 'pix' && config.pixKey && (
                <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3 text-[11px] text-neutral-400 mb-4 space-y-1">
                  <span className="font-semibold text-neutral-300 block">Chave PIX da Barbearia:</span>
                  <span className="font-mono text-amber-400 select-all block bg-neutral-950 p-1.5 rounded border border-neutral-800 truncate">
                    {config.pixKey}
                  </span>
                </div>
              )}

              {paymentMethod === 'mercado_pago' && (
                <div className="bg-neutral-900/80 border border-cyan-500/30 rounded-xl p-3 text-[11px] text-neutral-300 mb-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Mercado Pago API</span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    {config.mpAccessToken
                      ? 'Processamento automático com credenciais configuradas.'
                      : 'Modo Demonstração / Simulador ativo. Adicione suas credenciais no painel de Planos.'}
                  </p>
                </div>
              )}

              {/* Financial Breakdown */}
              <div className="bg-neutral-900 rounded-xl p-3.5 space-y-1.5 text-xs border border-neutral-800">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatBRL(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Desconto:</span>
                    <span className="font-mono">- {formatBRL(discount)}</span>
                  </div>
                )}
                {tip > 0 && (
                  <div className="flex justify-between text-amber-400 font-medium">
                    <span>Gorjeta:</span>
                    <span className="font-mono">+ {formatBRL(tip)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-display font-black text-neutral-100 pt-2 border-t border-neutral-800">
                  <span>TOTAL A COBRAR:</span>
                  <span className="text-amber-400 tabular-nums">{formatBRL(total)}</span>
                </div>
              </div>
            </div>

            {/* Final Action Button */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-400/10 cursor-pointer"
              >
                <Receipt className="w-4 h-4" />
                <span>Confirmar Pagamento & Emitir Cupom</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold"
              >
                Voltar / Manter Comanda Aberta
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
