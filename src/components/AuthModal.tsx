import React, { useState } from 'react';
import { X, CheckCircle2, Phone, ShieldCheck, Sparkles, User, Mail, ArrowRight } from 'lucide-react';
import { loginWithGoogle } from '../services/auth';
import { formatPhone, cleanPhoneDigits } from '../services/storage';
import { ClientUser } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: ClientUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [wantsToLinkWhatsapp, setWantsToLinkWhatsapp] = useState<boolean>(true);
  const [formError, setFormError] = useState<string>('');

  if (!isOpen) return null;

  // Preset demo client profiles for fast testing
  const handleQuickClient = (name: string, email: string, phone: string) => {
    setUserName(name);
    setUserEmail(email);
    setWhatsapp(phone);
    setFormError('');
  };

  const handleGoogleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanEmail = userEmail.trim().toLowerCase();
    const cleanName = userName.trim();

    if (!cleanName || cleanName.length < 2) {
      setFormError('Por favor, digite o nome do cliente.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setFormError('Por favor, informe um e-mail válido (ex: seuemail@gmail.com).');
      return;
    }

    const user = loginWithGoogle({
      name: cleanName,
      email: cleanEmail,
      whatsapp: wantsToLinkWhatsapp && cleanPhoneDigits(whatsapp).length >= 8 ? whatsapp : undefined,
    });

    onSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6 pt-1">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto mb-3 shadow-md shadow-amber-500/10">
            <Sparkles className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold">
            Área do Cliente • Login Google
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-100 mt-0.5">
            Conta do Cliente
          </h2>
          <p className="text-xs text-neutral-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Identifique-se como cliente para agendar seus cortes com prioridade, acompanhar seus horários e acumular pontos VIP.
          </p>
        </div>

        {/* Quick Client Suggestions */}
        <div className="mb-4 bg-neutral-950/60 border border-neutral-800 rounded-xl p-3">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-2">
            Escolher conta de cliente rápida:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickClient('Carlos Henrique', 'carlos.henrique@gmail.com', '(11) 98765-4321')}
              className="text-left p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-[11px] transition-colors"
            >
              <span className="font-semibold text-neutral-200 block truncate">Carlos Henrique</span>
              <span className="text-[10px] text-neutral-400 block truncate">carlos.h@gmail.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickClient('Rafael Santos', 'rafael.santos@gmail.com', '(11) 99123-4567')}
              className="text-left p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-[11px] transition-colors"
            >
              <span className="font-semibold text-neutral-200 block truncate">Rafael Santos</span>
              <span className="text-[10px] text-neutral-400 block truncate">rafael.s@gmail.com</span>
            </button>
          </div>
        </div>

        {/* Form to enter Client account */}
        <form onSubmit={handleGoogleSignIn} className="space-y-4 text-xs">
          <div>
            <label className="block text-neutral-300 mb-1 font-medium flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Nome Completo do Cliente *</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Matheus Oliveira"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2.5 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-neutral-300 mb-1 font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>E-mail Google do Cliente *</span>
            </label>
            <input
              type="email"
              placeholder="Ex: matheus.oliveira@gmail.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2.5 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-xs"
              required
            />
          </div>

          {/* Optional WhatsApp Linking */}
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="linkPhoneCheck" className="text-xs font-medium text-neutral-300 flex items-center gap-2 cursor-pointer">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp do Cliente (Recomendado)</span>
              </label>
              <input
                type="checkbox"
                id="linkPhoneCheck"
                checked={wantsToLinkWhatsapp}
                onChange={(e) => setWantsToLinkWhatsapp(e.target.checked)}
                className="rounded border-neutral-700 text-amber-400 focus:ring-0 cursor-pointer"
              />
            </div>

            {wantsToLinkWhatsapp && (
              <div>
                <input
                  type="tel"
                  placeholder="(11) 98765-4321"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400 tabular-nums font-mono"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Permite confirmar seus agendamentos diretamente pelo WhatsApp da barbearia.
                </span>
              </div>
            )}
          </div>

          {formError && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
              {formError}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-3 transition-colors shadow-md shadow-white/5 active:scale-[0.99] cursor-pointer"
          >
            {/* Google Colorful Logo SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Fazer Login como Cliente</span>
          </button>
        </form>

        {/* Security badge */}
        <div className="mt-5 pt-3 border-t border-neutral-800/80 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Login seguro para clientes da Barbearia Império</span>
        </div>
      </div>
    </div>
  );
};
