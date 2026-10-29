import React, { useRef } from 'react';
import { X, Printer, MessageCircle, Copy, Check, Scissors, AlertCircle } from 'lucide-react';
import { Comanda, BusinessConfig } from '../../types';
import { formatBRL, formatPhone, createReceiptWhatsAppUrl, createReceiptFormattedText } from '../../services/storage';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  comanda: Comanda | null;
  config: BusinessConfig;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  comanda,
  config,
}) => {
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !comanda) return null;

  const dateObj = new Date(comanda.closedAt || comanda.openedAt);
  const dateFormatted = `${String(dateObj.getDate()).padStart(2, '0')}/${String(
    dateObj.getMonth() + 1
  ).padStart(2, '0')}/${dateObj.getFullYear()}`;
  const timeFormatted = `${String(dateObj.getHours()).padStart(2, '0')}:${String(
    dateObj.getMinutes()
  ).padStart(2, '0')}`;

  const shopName = config.name || 'IMPÉRIO BARBEARIA';
  const address = config.address
    ? `${config.address}${config.neighborhood ? ', ' + config.neighborhood : ''} - ${config.city || 'São Paulo'}, ${config.state || 'SP'}`
    : 'Atendimento Presencial VIP';
  const phone = formatPhone(config.whatsappBusiness || config.phone || '');
  const cnpj = config.cnpj || '45.892.112/0001-44';

  const paymentMethodLabel: Record<string, string> = {
    pix: 'PIX Instantâneo',
    cartao_credito: 'Cartão de Crédito',
    cartao_debito: 'Cartão de Débito',
    dinheiro: 'Dinheiro em Espécie',
    mercado_pago: 'Mercado Pago Online',
    plano_vip: 'Plano Assinatura VIP',
  };

  const handleCopyText = () => {
    const text = createReceiptFormattedText(comanda, config);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const waUrl = createReceiptWhatsAppUrl(comanda, config);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Print styles injected for clean 80mm/58mm thermal print */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #thermal-receipt, #thermal-receipt * {
            visibility: visible;
          }
          #thermal-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm !important;
            margin: 0;
            padding: 4mm !important;
            color: #000 !important;
            background: #fff !important;
            font-size: 11px !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[95vh] my-auto">
        {/* Header bar */}
        <div className="p-4 sm:p-5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-neutral-100 flex items-center gap-1.5">
                <span>Nota Não-Fiscal Emitida</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  PAGA
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">Comanda #{comanda.code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thermal Slip Preview Container */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-neutral-950/60 flex justify-center">
          <div
            id="thermal-receipt"
            ref={printRef}
            className="w-full max-w-[320px] bg-white text-neutral-900 p-5 rounded-lg shadow-xl font-mono text-[11px] leading-relaxed border border-neutral-300 select-text"
          >
            {/* Header */}
            <div className="text-center pb-3 border-b border-dashed border-neutral-400">
              <div className="font-extrabold text-sm uppercase tracking-wider text-black">
                {shopName}
              </div>
              <div className="text-[10px] text-neutral-600 mt-0.5">{address}</div>
              <div className="text-[10px] text-neutral-600">Tel/WhatsApp: {phone}</div>
              <div className="text-[10px] text-neutral-600">CNPJ: {cnpj}</div>
            </div>

            {/* Non-Fiscal Badge */}
            <div className="text-center py-2 border-b border-dashed border-neutral-400">
              <div className="font-black text-[12px] tracking-wider text-black">
                *** DOCUMENTO NÃO FISCAL ***
              </div>
              <div className="text-[9px] text-neutral-700 tracking-wider">
                CUPOM DE ATENDIMENTO & PAGAMENTO
              </div>
            </div>

            {/* Metadata */}
            <div className="py-2.5 border-b border-dashed border-neutral-400 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>COMANDA: #{comanda.code}</span>
                <span>DATA: {dateFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span>HORA: {timeFormatted}</span>
                <span>STATUS: FINALIZADO</span>
              </div>
              <div className="pt-1">
                <span className="font-bold">BARBEIRO:</span> {comanda.barberName}
              </div>
              <div>
                <span className="font-bold">CLIENTE:</span> {comanda.customerName}
              </div>
              <div>
                <span className="font-bold">CONTATO:</span> {formatPhone(comanda.customerWhatsapp)}
              </div>
            </div>

            {/* Items Table */}
            <div className="py-2.5 border-b border-dashed border-neutral-400">
              <div className="grid grid-cols-12 font-bold text-[10px] pb-1 border-b border-neutral-300">
                <span className="col-span-2">QTD</span>
                <span className="col-span-6">DESCRIÇÃO</span>
                <span className="col-span-4 text-right">TOTAL</span>
              </div>
              <div className="pt-1.5 space-y-1">
                {comanda.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 text-[10px]">
                    <span className="col-span-2 text-neutral-700">{item.quantity}x</span>
                    <span className="col-span-6 truncate font-medium">{item.name}</span>
                    <span className="col-span-4 text-right font-semibold">
                      {formatBRL(item.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="py-2.5 border-b border-dashed border-neutral-400 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>{formatBRL(comanda.subtotal)}</span>
              </div>
              {comanda.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>DESCONTO:</span>
                  <span>- {formatBRL(comanda.discount)}</span>
                </div>
              )}
              {comanda.tip > 0 && (
                <div className="flex justify-between text-neutral-700">
                  <span>GORJETA BARBEIRO:</span>
                  <span>+ {formatBRL(comanda.tip)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-black pt-1 border-t border-neutral-300 text-black">
                <span>TOTAL A PAGAR:</span>
                <span>{formatBRL(comanda.total)}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="py-2.5 border-b border-dashed border-neutral-400 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>FORMA PGTO:</span>
                <span className="font-bold uppercase">
                  {paymentMethodLabel[comanda.paymentMethod || ''] || 'DINHEIRO'}
                </span>
              </div>
              {comanda.amountReceived !== undefined && comanda.amountReceived > 0 && (
                <div className="flex justify-between">
                  <span>VALOR RECEBIDO:</span>
                  <span>{formatBRL(comanda.amountReceived)}</span>
                </div>
              )}
              {comanda.changeDue !== undefined && comanda.changeDue > 0 && (
                <div className="flex justify-between font-bold text-black">
                  <span>TROCO:</span>
                  <span>{formatBRL(comanda.changeDue)}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 text-center space-y-1 text-[9px] text-neutral-600">
              <div className="font-bold text-[10px] text-black">
                OBRIGADO PELA PREFERÊNCIA!
              </div>
              <div>Seu visual no verdadeiro padrão de rei.</div>
              <div>Instagram: {config.instagram || '@imperiobarbearia'}</div>
              <div className="text-[8px] text-neutral-400 pt-1 tracking-widest uppercase">
                CONTROLE INTERNO • AUT: IMP-{comanda.code}-{(Date.now() % 10000).toString().padStart(4, '0')}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-5 bg-neutral-950 border-t border-neutral-800 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-400/10"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Cupom Térmico</span>
          </button>

          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar 2ª Via no WhatsApp</span>
            </a>
          )}

          <button
            onClick={handleCopyText}
            className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-neutral-700"
            title="Copiar texto do cupom"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
