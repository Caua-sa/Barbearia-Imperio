import React, { useState, useEffect } from 'react';
import {
  Crown,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  QrCode,
  Link2,
  FileText,
  Star,
  X,
  Save,
  Sparkles,
  ShieldCheck,
  Key,
  Users,
  AlertCircle,
  Clock,
  RotateCcw,
  MessageCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { BusinessConfig, SubscriptionPlan, ClientSubscription } from '../../types';
import {
  formatBRL,
  savePlans,
  saveConfig,
  loadSubscriptions,
  saveSubscriptions,
  cancelSubscription,
  reactivateSubscription,
  isSubscriptionValid,
  getSubscriptionRemainingDays,
  formatPhone,
  cleanPhoneDigits,
} from '../../services/storage';

interface AdminPlansTabProps {
  plans: SubscriptionPlan[];
  onPlansChange: (plans: SubscriptionPlan[]) => void;
  config: BusinessConfig;
  onConfigChange: (config: BusinessConfig) => void;
  showToast: (msg: string) => void;
}

export const AdminPlansTab: React.FC<AdminPlansTabProps> = ({
  plans,
  onPlansChange,
  config,
  onConfigChange,
  showToast,
}) => {
  // Payment configuration form state
  const [pixKey, setPixKey] = useState(config.plansPaymentPix || config.pixKey || '');
  const [paymentLink, setPaymentLink] = useState(config.plansPaymentLink || '');
  const [instructions, setInstructions] = useState(
    config.plansInstructions ||
      'Ao assinar, o cliente tem acesso imediato aos cortes e privilégios VIP do clube.'
  );

  // Mercado Pago API Config State
  const [mpAccessToken, setMpAccessToken] = useState(config.mpAccessToken || '');
  const [mpPublicKey, setMpPublicKey] = useState(config.mpPublicKey || '');
  const [mpEnvironment, setMpEnvironment] = useState<'sandbox' | 'production'>(
    config.mpEnvironment || 'production'
  );
  const [showToken, setShowToken] = useState(false);

  // Subscriptions list state
  const [subscriptions, setSubscriptions] = useState<ClientSubscription[]>(() => loadSubscriptions());
  const [subFilter, setSubFilter] = useState<'todos' | 'ativos' | 'cancelados'>('todos');

  // Plan modal state
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  // Plan form fields
  const [name, setName] = useState('');
  const [priceMonthly, setPriceMonthly] = useState(89.9);
  const [description, setDescription] = useState('');
  const [benefitsText, setBenefitsText] = useState('');
  const [popular, setPopular] = useState(false);
  const [active, setActive] = useState(true);
  const [customCheckoutUrl, setCustomCheckoutUrl] = useState('');

  // Reload subscriptions when needed
  const refreshSubscriptions = () => {
    setSubscriptions(loadSubscriptions());
  };

  // Save payment & Mercado Pago config
  const handleSavePaymentConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedConfig: BusinessConfig = {
      ...config,
      plansPaymentPix: pixKey.trim(),
      plansPaymentLink: paymentLink.trim(),
      plansInstructions: instructions.trim(),
      mpAccessToken: mpAccessToken.trim(),
      mpPublicKey: mpPublicKey.trim(),
      mpEnvironment,
    };
    onConfigChange(updatedConfig);
    saveConfig(updatedConfig);
    showToast('Configurações do Mercado Pago e canais de pagamento salvas!');
  };

  const openNewPlanModal = () => {
    setEditingPlan(null);
    setName('');
    setPriceMonthly(89.9);
    setDescription('');
    setBenefitsText('Cortes ilimitados no mês\nLavagem especial inclusa\n10% de desconto em produtos\nCerveja ou café de cortesia');
    setPopular(false);
    setActive(true);
    setCustomCheckoutUrl('');
    setShowModal(true);
  };

  const openEditPlanModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setPriceMonthly(plan.priceMonthly);
    setDescription(plan.description);
    setBenefitsText(plan.benefits.join('\n'));
    setPopular(!!plan.popular);
    setActive(plan.active !== false);
    setCustomCheckoutUrl(plan.checkoutUrl || '');
    setShowModal(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const benefits = benefitsText
      .split('\n')
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    let updatedList: SubscriptionPlan[];
    if (editingPlan) {
      updatedList = plans.map((p) =>
        p.id === editingPlan.id
          ? {
              ...p,
              name: name.trim(),
              priceMonthly: Number(priceMonthly),
              description: description.trim(),
              benefits,
              popular,
              active,
              checkoutUrl: customCheckoutUrl.trim() || undefined,
            }
          : p
      );
      showToast(`Plano "${name}" atualizado com sucesso!`);
    } else {
      const newPlan: SubscriptionPlan = {
        id: 'plan-' + Date.now(),
        name: name.trim(),
        priceMonthly: Number(priceMonthly),
        description: description.trim(),
        benefits,
        popular,
        active,
        checkoutUrl: customCheckoutUrl.trim() || undefined,
      };
      updatedList = [...plans, newPlan];
      showToast(`Plano "${name}" criado com sucesso!`);
    }

    onPlansChange(updatedList);
    savePlans(updatedList);
    setShowModal(false);
  };

  const handleDeletePlan = (id: string, planName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o plano "${planName}"?`)) return;
    const updated = plans.filter((p) => p.id !== id);
    onPlansChange(updated);
    savePlans(updated);
    showToast('Plano de assinatura excluído.');
  };

  // Cancel subscription action with explicit notice
  const handleCancelSub = (sub: ClientSubscription) => {
    const formattedEnd = sub.expiresAt.split('-').reverse().join('/');
    const confirmed = window.confirm(
      `Deseja cancelar a assinatura de ${sub.customerName}?\n\nConforme a regra do clube, o cliente continuará com direito a usar o plano até o dia ${formattedEnd} sem cobrança seguinte.`
    );
    if (!confirmed) return;

    const updated = cancelSubscription(sub.id);
    if (updated) {
      refreshSubscriptions();
      showToast(`Assinatura cancelada. O cliente usará o plano até ${formattedEnd}.`);
    }
  };

  // Reactivate subscription
  const handleReactivateSub = (sub: ClientSubscription) => {
    const updated = reactivateSubscription(sub.id);
    if (updated) {
      refreshSubscriptions();
      showToast(`Assinatura de ${sub.customerName} reativada com sucesso!`);
    }
  };

  // Filter subscriptions
  const filteredSubs = subscriptions.filter((sub) => {
    const isValid = isSubscriptionValid(sub);
    if (subFilter === 'ativos') return sub.status === 'active' && isValid;
    if (subFilter === 'cancelados') return sub.status === 'cancelled';
    return true;
  });

  // Calculate MRR
  const activeSubsCount = subscriptions.filter((s) => s.status === 'active' && isSubscriptionValid(s)).length;
  const mrrTotal = subscriptions
    .filter((s) => s.status === 'active' && isSubscriptionValid(s))
    .reduce((acc, s) => acc + s.priceMonthly, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Recorrência & Mercado Pago
            </span>
          </div>
          <h2 className="font-display text-lg font-bold text-neutral-100 flex items-center gap-2 mt-1">
            <Crown className="w-5 h-5 text-amber-400" />
            <span>Planos de Assinatura, Mercado Pago & Assinantes</span>
          </h2>
          <p className="text-xs text-neutral-400">
            Cadastre as credenciais do Mercado Pago, gerencie os valores dos planos e controle as assinaturas ativas e canceladas.
          </p>
        </div>

        <button
          onClick={openNewPlanModal}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-amber-400/10"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Plano</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium block">Assinantes VIP Ativos</span>
            <span className="text-2xl font-black font-display text-amber-400">
              {activeSubsCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium block">Faturamento Mensal (MRR)</span>
            <span className="text-2xl font-black font-display text-emerald-400">
              {formatBRL(mrrTotal)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium block">Status Mercado Pago</span>
            <span className="text-xs font-bold text-neutral-200 mt-1 block">
              {mpAccessToken ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Conectado ({mpEnvironment})
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Modo Simulador / Teste
                </span>
              )}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Key className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Mercado Pago API Configuration Card */}
      <form
        onSubmit={handleSavePaymentConfig}
        className="bg-neutral-900 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 space-y-4 relative overflow-hidden"
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-neutral-100 flex items-center gap-2">
                <span>Configuração da API do Mercado Pago</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Assinaturas & Checkout
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                Insira suas chaves do Mercado Pago (Access Token e Public Key) para cobrança recorrente e PIX automatizado.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-medium text-neutral-300 mb-1 flex items-center justify-between">
              <span>Ambiente Mercado Pago</span>
            </label>
            <select
              value={mpEnvironment}
              onChange={(e) => setMpEnvironment(e.target.value as any)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-cyan-400"
            >
              <option value="production">Produção (Chaves reais / APP_USR-...)</option>
              <option value="sandbox">Sandbox / Homologação (TEST-...)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-neutral-300 mb-1">
              Public Key (Chave Pública)
            </label>
            <input
              type="text"
              value={mpPublicKey}
              onChange={(e) => setMpPublicKey(e.target.value)}
              placeholder="APP_USR-xxxxxx ou TEST-xxxxxx"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-300 mb-1 flex items-center justify-between">
              <span>Access Token (Token de Acesso) *</span>
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1"
              >
                {showToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showToken ? 'Ocultar' : 'Mostrar'}</span>
              </button>
            </label>
            <input
              type={showToken ? 'text' : 'password'}
              value={mpAccessToken}
              onChange={(e) => setMpAccessToken(e.target.value)}
              placeholder="APP_USR-xxxxxx..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Fallback Channels */}
          <div>
            <label className="block font-medium text-neutral-300 mb-1 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Chave PIX Direta da Barbearia</span>
            </label>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="CNPJ, CPF ou Chave Aleatória"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-medium text-neutral-300 mb-1 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Link de Checkout Externo Opcional</span>
            </label>
            <input
              type="url"
              value={paymentLink}
              onChange={(e) => setPaymentLink(e.target.value)}
              placeholder="https://mpago.la/... ou link da sua recorrência"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 font-mono focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-[11px] text-neutral-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {mpAccessToken
                ? 'API pronta para processar assinaturas de clientes com checkout transparente.'
                : 'Você pode testar a assinatura a qualquer momento com o simulador interativo embutido.'}
            </span>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Configuração da API</span>
          </button>
        </div>
      </form>

      {/* Subscriptions Management Section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div>
            <h3 className="font-display text-sm font-bold text-neutral-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Gerenciamento de Assinantes & Cancelamentos</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Assinaturas registradas no sistema com controle de validade e carência pós-cancelamento.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            {[
              { id: 'todos', label: `Todos (${subscriptions.length})` },
              { id: 'ativos', label: `Ativos (${activeSubsCount})` },
              { id: 'cancelados', label: 'Cancelados' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSubFilter(f.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  subFilter === f.id
                    ? 'bg-amber-400 text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subscriptions Table / Cards */}
        {filteredSubs.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
            Nenhuma assinatura encontrada nesta categoria.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredSubs.map((sub) => {
              const isValid = isSubscriptionValid(sub);
              const remainingDays = getSubscriptionRemainingDays(sub);
              const formattedExp = sub.expiresAt.split('-').reverse().join('/');
              const isCancelled = sub.status === 'cancelled';
              const waLink = `https://api.whatsapp.com/send?phone=55${cleanPhoneDigits(sub.customerWhatsapp)}`;

              return (
                <div
                  key={sub.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-colors ${
                    isCancelled && isValid
                      ? 'bg-amber-950/10 border-amber-500/30'
                      : isCancelled && !isValid
                      ? 'bg-neutral-950/40 border-neutral-800/80 opacity-60'
                      : 'bg-neutral-950 border-neutral-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-100 text-sm">
                        {sub.customerName}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                          !isCancelled && isValid
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : isCancelled && isValid
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {!isCancelled && isValid
                          ? 'Ativa'
                          : isCancelled && isValid
                          ? `Cancelada (Válida até ${formattedExp})`
                          : 'Expirada'}
                      </span>
                    </div>

                    <div className="text-[11px] text-neutral-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Plano: <strong className="text-amber-400">{sub.planName}</strong> ({formatBRL(sub.priceMonthly)}/mês)</span>
                      <span>WhatsApp: <strong className="font-mono text-neutral-300">{formatPhone(sub.customerWhatsapp)}</strong></span>
                      <span className="flex items-center gap-1 text-neutral-300">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>
                          {isValid ? `${remainingDays} dias restantes de uso (até ${formattedExp})` : `Venceu em ${formattedExp}`}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {sub.customerWhatsapp && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1 transition-colors"
                        title="Enviar WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    )}

                    {!isCancelled ? (
                      <button
                        onClick={() => handleCancelSub(sub)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold text-xs transition-colors"
                      >
                        Cancelar Assinatura
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReactivateSub(sub)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-semibold text-xs flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reativar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Subscription Plans List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base font-bold text-neutral-100 flex items-center gap-2">
            <span>Planos Cadastrados no Império ({plans.length})</span>
          </h3>
          <span className="text-xs text-neutral-400">
            Estes planos aparecem em destaque na Landing Page pública.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-neutral-900 border rounded-2xl p-6 flex flex-col justify-between transition-all relative overflow-hidden ${
                plan.popular
                  ? 'border-amber-500/50 shadow-xl shadow-amber-500/5 bg-gradient-to-b from-amber-950/20 to-neutral-900'
                  : plan.active
                  ? 'border-neutral-800'
                  : 'border-neutral-800/40 opacity-60'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-amber-400 text-neutral-950 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <Star className="w-3 h-3 fill-neutral-950" />
                  <span>Mais Vendido</span>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                      plan.active !== false
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {plan.active !== false ? 'Ativo na Landing Page' : 'Inativo'}
                  </span>
                </div>

                <h4 className="font-display text-lg font-bold text-neutral-100 mb-1">
                  {plan.name}
                </h4>
                <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                  {plan.description}
                </p>

                <div className="mb-5 pb-5 border-b border-neutral-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-display">
                      {formatBRL(plan.priceMonthly)}
                    </span>
                    <span className="text-xs text-neutral-400">/mês</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <span className="text-[11px] font-semibold text-neutral-300 block mb-2">
                    Benefícios Inclusos:
                  </span>
                  {plan.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                <button
                  onClick={() => openEditPlanModal(plan)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar Plano & Valor</span>
                </button>

                <button
                  onClick={() => handleDeletePlan(plan.id, plan.name)}
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                  title="Excluir plano"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: New / Edit Plan */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-display text-base font-bold text-neutral-100 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>{editingPlan ? 'Editar Plano de Assinatura' : 'Cadastrar Novo Plano'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-neutral-500 hover:text-neutral-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-300 mb-1">Nome do Plano *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Plano Cabelo VIP"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Valor Mensal (R$) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-neutral-500">R$</span>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    value={priceMonthly}
                    onChange={(e) => setPriceMonthly(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-neutral-100 font-mono text-base font-bold focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Descrição Comercial</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Ex: Para quem gosta de manter o fade sempre impecável toda semana."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">
                  Benefícios (um por linha) *
                </label>
                <textarea
                  value={benefitsText}
                  onChange={(e) => setBenefitsText(e.target.value)}
                  rows={4}
                  placeholder="Cortes ilimitados no mês&#10;Lavagem especial inclusa&#10;10% de desconto em produtos"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 font-mono focus:outline-none focus:border-amber-400"
                  required
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Cada linha digitada será um item de check list exibido na Landing Page.
                </span>
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">
                  Link de Checkout Específico para este Plano (Opcional)
                </label>
                <input
                  type="url"
                  value={customCheckoutUrl}
                  onChange={(e) => setCustomCheckoutUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800">
                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={popular}
                    onChange={(e) => setPopular(e.target.checked)}
                    className="rounded text-amber-400 focus:ring-0"
                  />
                  <span>Destacar como "Mais Vendido / Recomendado"</span>
                </label>

                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded text-amber-400 focus:ring-0"
                  />
                  <span>Plano ativo (visível na Landing Page dos clientes)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold"
                >
                  {editingPlan ? 'Salvar Plano' : 'Criar Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
