import React from 'react';
import { Crown, Calendar, ShieldCheck, Scissors } from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'express' | 'admin' | 'my-bookings';
  onNavigate: (view: 'home' | 'express' | 'admin' | 'my-bookings') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  return (
    <header className="sticky top-0 z-50 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-18">
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
                Barbearia Império
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
              onClick={() => onNavigate('my-bookings')}
              className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentView === 'my-bookings' ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              <Calendar className="w-4 h-4" />
              Meus Horários
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            {currentView === 'admin' ? (
              <button
                onClick={() => onNavigate('home')}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-700 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
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
