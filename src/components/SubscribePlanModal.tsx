import React, { useState } from 'react';
import {
  X,
  Crown,
  CheckCircle2,
  QrCode,
  CreditCard,
  ShieldCheck,
  Copy,
  Check,
  Calendar,
  AlertCircle,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { SubscriptionPlan, BusinessConfig, ClientUser, ClientSubscription } from '../types';
import {
  formatBRL,
  formatPhone,
  cleanPhoneDigits,
  getTodayDateString,
  addDaysToDate,
  createSubscription,
} from '../services/storage';

interface SubscribePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  config: BusinessConfig;
  currentUser: ClientUser | null;
  onSubscribed: (subscription: ClientSubscription) => void;
}

export const SubscribePlanModal: React.FC<SubscribePlanModalProps> = ({
  isOpen,
  onClose,
  plan,
  config,
  currentUser,
  onSubscribed,
}) => {
  if (!isOpen || !plan) return null;

  // Form states
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.whatsapp ? formatPhone(currentUser.whatsapp) : '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');

  // Payment tab: 'pix' | 'card'
  const [paymentTab, setPaymentTab] = useState<'pix' | 'card'>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [successSubscription, setSuccessSubscription] = useState<ClientSubscription | null>(null);

  // Credit card inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(currentUser?.name || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Generate mock Mercado Pago PIX payload or use configured PIX
  const pixPayload = config.pixKey
    ? `00020126580014BR.GOV.BCB.PIX0136${config.pixKey}5204000053039865405${plan.priceMonthly.toFixed(2)}5802BR5917IMPERIO BARBEARIA6009SAO PAULO62070503***6304`
    : `00020126580014BR.GOV.BCB.PIX0136imperio@barbearia.com.br5204000053039865405${plan.priceMonthly.toFixed(2)}5802BR5917IMPERIO BARBEARIA6009SAO PAULO62070503***6304`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  // Format card inputs
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : raw);
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handleSubmitSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;
    const digits = cleanPhoneDigits(customerPhone);
    if (digits.length < 10) return;

    setIsProcessing(true);

    setTimeout(() => {
      const today = getTodayDateString();
      const expiresAt = addDaysToDate(today, 30); // 30 days of benefits

      const newSub = createSubscription({
        planId: plan.id,
        planName: plan.name,
        priceMonthly: plan.priceMonthly,
        customerName: customerName.trim(),
        customerWhatsapp: digits,
        customerEmail: customerEmail.trim() || undefined,
        startDate: today,
        expiresAt: expiresAt,
        status: 'active',
        paymentMethod: paymentTab === 'pix' ? 'pix' : 'mercado_pago',
        autoRenew: true,
      });

      setIsProcessing(false);
      setSuccessSubscription(newSub);
      onSubscribed(newSub);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-neutral-100 flex items-center gap-1.5">
                <span>Assinatura Clube Império</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Mercado Pago
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">{plan.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {successSubscription ? (
          <div className="p-6 sm:p-8 text-center space-y-4 overflow-y-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/5">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="font-display text-xl font-bold text-neutral-100">
              Parabéns, você agora é Cliente VIP!
            </h3>

            <p className="text-xs text-neutral-300 leading-relaxed max-w-sm mx-auto">
              Sua assinatura do <strong className="text-amber-400">{plan.name}</strong> foi ativada com sucesso.
            </p>

            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-neutral-400">Assinante:</span>
                <span className="font-semibold text-neutral-200">{successSubscription.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">WhatsApp:</span>
                <span className="font-mono text-neutral-200">
                  {formatPhone(successSubscription.customerWhatsapp)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Valor Mensal:</span>
                <span className="font-bold text-amber-400">
                  {formatBRL(successSubscription.priceMonthly)}/mês
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-800">
                <span className="text-neutral-400">Acesso Válido até:</span>
                <span className="font-bold text-emerald-400">
                  {successSubscription.expiresAt.split('-').reverse().join('/')}
                </span>
              </div>
            </div>

            {/* Clear Cancellation Rule Explanation */}
            <div className="bg-amber-400/10 border border-amber-400/20 rounded-2xl p-3.5 text-[11px] text-amber-200/90 text-left space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Liberdade Total & Cancelamento Transparente</span>
              </div>
              <p>
                Você pode cancelar sua assinatura a qualquer momento no seu painel.
                <strong>
                  {' '}Após o cancelamento, você continua utilizando todos os benefícios do plano normalmente até o dia {successSubscription.expiresAt.split('-').reverse().join('/')}.
                </strong>
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-400/10"
            >
              Concluir & Voltar à Barbearia
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitSubscription} className="p-4 sm:p-6 overflow-y-auto space-y-5">
            {/* Plan Price Summary */}
            <div className="bg-neutral-950 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">
                  Plano Selecionado
                </span>
                <h4 className="font-display text-sm font-bold text-neutral-100">{plan.name}</h4>
              </div>
              <div className="text-right">
                <span className="text-xl font-black font-display text-amber-400">
                  {formatBRL(plan.priceMonthly)}
                </span>
                <span className="text-[10px] text-neutral-400 block">/mês</span>
              </div>
            </div>

            {/* Subscriber Info Fields */}
            <div className="space-y-3 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                1. Seus Dados de Assinante
              </span>

              <div>
                <label className="block text-neutral-300 mb-1 font-medium">Nome Completo *</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1 font-medium">WhatsApp *</label>
                  <input
                    type="tel"
                    placeholder="(11) 98765-4321"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(formatPhone(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1 font-medium">E-mail</label>
                  <input
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Payment Options (Mercado Pago PIX or Card) */}
            <div className="space-y-3 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                2. Forma de Pagamento (Mercado Pago Seguro)
              </span>

              {/* Tab Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentTab('pix')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    paymentTab === 'pix'
                      ? 'border-amber-400 bg-amber-400/10 text-neutral-100 shadow-sm'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>PIX Instantâneo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentTab('card')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    paymentTab === 'card'
                      ? 'border-amber-400 bg-amber-400/10 text-neutral-100 shadow-sm'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  <span>Cartão de Crédito</span>
                </button>
              </div>

              {/* PIX Details */}
              {paymentTab === 'pix' && (
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300 font-semibold flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-amber-400" />
                      <span>QR Code & Chave Copia e Cola</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Aprovação Imediata
                    </span>
                  </div>

                  {/* QR Code Placeholder Graphic */}
                  <div className="bg-white p-3 rounded-xl w-32 h-32 mx-auto flex flex-col items-center justify-center shadow-inner">
                    <QrCode className="w-24 h-24 text-neutral-950" />
                    <span className="text-[8px] font-mono text-neutral-700 -mt-1 font-bold">
                      PIX MERCADO PAGO
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-neutral-400 block">Código Copia e Cola:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={pixPayload}
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-[10px] font-mono text-neutral-300 select-all truncate"
                      />
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1 border border-neutral-700"
                      >
                        {pixCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{pixCopied ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Details */}
              {paymentTab === 'card' && (
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="font-semibold flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-cyan-400" />
                      <span>Dados do Cartão de Crédito</span>
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                      <Lock className="w-3 h-3 text-cyan-400" />
                      <span>Criptografia SSL</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Número do Cartão</label>
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 font-mono text-xs focus:outline-none focus:border-cyan-400"
                      required={paymentTab === 'card'}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Nome Impresso no Cartão</label>
                    <input
                      type="text"
                      placeholder="Como impresso no cartão"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 uppercase text-xs focus:outline-none focus:border-cyan-400"
                      required={paymentTab === 'card'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Validade (MM/AA)</label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 font-mono text-xs focus:outline-none focus:border-cyan-400"
                        required={paymentTab === 'card'}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">CVV (3 dígitos)</label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 font-mono text-xs focus:outline-none focus:border-cyan-400"
                        required={paymentTab === 'card'}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reassurance Badge */}
            <div className="text-[11px] text-neutral-400 flex items-start gap-2 bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/80">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Cancele quando quiser diretamente no app. Sem fidelidade forçada. Após o cancelamento, seu plano permanece ativo até o fim do ciclo de 30 dias.
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-400/10 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                    <span>Processando Assinatura no Mercado Pago...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4" />
                    <span>Confirmar Assinatura ({formatBRL(plan.priceMonthly)}/mês)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
