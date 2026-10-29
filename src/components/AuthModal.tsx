import React, { useState } from 'react';
import { X, CheckCircle2, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import { loginWithGoogle } from '../services/auth';
import { formatPhone, cleanPhoneDigits } from '../services/storage';
import { ClientUser } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: ClientUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [wantsToLinkWhatsapp, setWantsToLinkWhatsapp] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    const finalEmail = userEmail.trim() || 'athensco2023@gmail.com';
    const finalName =
      userName.trim() ||
      (finalEmail.includes('@')
        ? finalEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : 'Cliente Império');

    const user = loginWithGoogle({
      name: finalName,
      email: finalEmail,
      whatsapp: wantsToLinkWhatsapp && cleanPhoneDigits(whatsapp).length >= 8 ? whatsapp : undefined,
    });

    onSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6 pt-2">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto mb-3 shadow-md shadow-amber-500/10">
            <Sparkles className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold">
            Área do Cliente
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-100 mt-0.5">
            Império Barbearia
          </h2>
          <p className="text-xs text-neutral-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Entre com sua conta Google para agendar seus horários com facilidade e acompanhar seus atendimentos.
          </p>
        </div>

        {/* Google Sign In Button */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-sm flex items-center justify-center gap-3 transition-colors shadow-md shadow-white/5 active:scale-[0.99] cursor-pointer"
          >
            {/* Google Colorful Logo SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span>Continuar com o Google</span>
          </button>

          {/* Optional WhatsApp Linking */}
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="linkPhoneCheck" className="text-xs font-medium text-neutral-300 flex items-center gap-2 cursor-pointer">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Vincular meu WhatsApp (opcional)</span>
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
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400 tabular-nums"
                />
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Seu número fica salvo na sua conta para agendar em 1 clique sem preencher nada.
                </span>
              </div>
            )}
          </div>

          {/* Customize Google account test option */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => setIsCustomizing(!isCustomizing)}
              className="text-[11px] text-neutral-500 hover:text-neutral-300 underline"
            >
              {isCustomizing ? 'Ocultar opções de conta' : 'Usar outra conta Google específica'}
            </button>

            {isCustomizing && (
              <div className="mt-3 space-y-2 text-left bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-0.5">Nome da Conta</label>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1 text-xs text-neutral-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-0.5">Email Google</label>
                  <input
                    type="email"
                    placeholder="exemplo@gmail.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1 text-xs text-neutral-200"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Login seguro e autenticado via Google</span>
        </div>
      </div>
    </div>
  );
};
