import React from 'react';
import { Crown, Calendar, Scissors, User as UserIcon } from 'lucide-react';
import { ClientUser } from '../types';

interface NavbarProps {
  currentView: 'home' | 'express' | 'admin' | 'my-bookings';
  onNavigate: (view: 'home' | 'express' | 'admin' | 'my-bookings') => void;
  currentUser: ClientUser | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onOpenAuth,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 sm:gap-8 h-18">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group transition-transform focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform">
              <Crown className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-wider text-neutral-100 uppercase group-hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
                Império Barbearia
              </span>
              <span className="text-[10px] tracking-widest text-neutral-400 uppercase -mt-0.5">
                Cortes & Estilo
              </span>
            </div>
          </button>

          {/* Zone 2: Nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-400">
            <button
              onClick={() => onNavigate('express')}
              className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentView === 'express' ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              <Scissors className="w-4 h-4" />
              Agendamento Rápido
            </button>
            <button
              onClick={() => onNavigate('home')}
              className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'home' ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              Serviços & Barbeiros
            </button>
            <button
              onClick={() => {
                onNavigate('home');
                setTimeout(() => {
                  document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Crown className="w-4 h-4 text-amber-400" />
              Planos VIP
            </button>
            <button
              onClick={() => onNavigate('my-bookings')}
              className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentView === 'my-bookings' ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              <Calendar className="w-4 h-4" />
              Meus Horários
            </button>
          </nav>

          {/* Zone 3: 1 primary action + Google Client Account trigger */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Google User Avatar / Sign In */}
            {currentUser ? (
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full bg-neutral-900 border border-neutral-700/80 hover:border-amber-500/60 transition-colors group cursor-pointer"
                title="Minha Conta Google"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-amber-400"
                />
                <span className="hidden sm:inline text-xs font-medium text-neutral-200 group-hover:text-amber-400 truncate max-w-[100px]">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/80 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Entrar com conta Google"
              >
                {/* Small Google G */}
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                <span className="hidden sm:inline">Entrar com Google</span>
                <span className="sm:hidden">Entrar</span>
              </button>
            )}

            {currentView === 'admin' ? (
              <button
                onClick={() => onNavigate('home')}
                className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-700 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                Voltar à Loja
              </button>
            ) : (
              <button
                onClick={() => onNavigate('express')}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-amber-400/20"
              >
                Agendar Agora
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
