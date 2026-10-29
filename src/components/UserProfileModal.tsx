import React, { useState } from 'react';
import { X, Phone, LogOut, CheckCircle2, Crown, Calendar, Sparkles } from 'lucide-react';
import { updateLinkedWhatsapp, logoutClient } from '../services/auth';
import { formatPhone, cleanPhoneDigits } from '../services/storage';
import { ClientUser } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  user: ClientUser | null;
  onClose: () => void;
  onGoToBookings: () => void;
  onLoggedOut: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  user,
  onClose,
  onGoToBookings,
  onLoggedOut,
}) => {
  const [isEditingPhone, setIsEditingPhone] = useState<boolean>(false);
  const [newPhone, setNewPhone] = useState<string>(user?.whatsapp ? formatPhone(user.whatsapp) : '');
  const [successToast, setSuccessToast] = useState<string>('');

  if (!isOpen || !user) return null;

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    updateLinkedWhatsapp(newPhone);
    setIsEditingPhone(false);
    setSuccessToast('Número de WhatsApp atualizado com sucesso!');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleLogout = () => {
    logoutClient();
    onLoggedOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Google Lockup */}
        <div className="flex items-center gap-3.5 mb-6 pt-2">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-14 h-14 rounded-full border-2 border-amber-400 object-cover shadow-md"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-display text-lg font-bold text-neutral-100">{user.name}</h2>
              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
            </div>
            <p className="text-xs text-neutral-400">{user.email}</p>
            <span className="inline-block text-[10px] uppercase font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20 mt-1">
              Conta Google Ativa
            </span>
          </div>
        </div>

        {/* Linked Phone Section */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Número de WhatsApp Vinculado</span>
            </span>
            {user.whatsapp && !isEditingPhone && (
              <button
                onClick={() => setIsEditingPhone(true)}
                className="text-[11px] text-amber-400 hover:underline"
              >
                Alterar
              </button>
            )}
          </div>

          {isEditingPhone || !user.whatsapp ? (
            <form onSubmit={handleSavePhone} className="space-y-2.5 mt-2">
              <input
                type="tel"
                placeholder="(11) 98765-4321"
                value={newPhone}
                onChange={(e) => setNewPhone(formatPhone(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400 font-mono"
              />
              <div className="flex items-center justify-end gap-2">
                {user.whatsapp && (
                  <button
                    type="button"
                    onClick={() => setIsEditingPhone(false)}
                    className="text-xs text-neutral-400 hover:text-white px-2 py-1"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs"
                >
                  Salvar WhatsApp
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between text-xs text-neutral-300 pt-1">
              <span className="font-mono text-sm tabular-nums text-neutral-100">
                {formatPhone(user.whatsapp)}
              </span>
              <span className="text-emerald-400 text-[11px] flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Vinculado</span>
              </span>
            </div>
          )}
        </div>

        {/* Toast */}
        {successToast && (
          <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs p-2.5 rounded-xl mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Império VIP Club Card */}
        <div className="bg-gradient-to-br from-amber-500/10 via-neutral-950 to-neutral-950 border border-amber-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cartão Fidelidade Império</span>
            </span>
            <span className="text-[11px] text-neutral-400">Nível Ouro</span>
          </div>
          <div className="w-full bg-neutral-900 rounded-full h-2 mb-2 overflow-hidden border border-neutral-800">
            <div className="bg-amber-400 h-full rounded-full w-3/5" />
          </div>
          <div className="flex justify-between text-[11px] text-neutral-400">
            <span>6 cortes realizados</span>
            <span className="text-amber-300 font-semibold">Faltam 4 para o corte grátis</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              onClose();
              onGoToBookings();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Ver Meus Agendamentos</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Desconectar da Conta Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};
