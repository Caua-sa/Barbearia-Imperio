import React, { useState } from 'react';
import { Search, Calendar, Clock, Scissors, MessageCircle, AlertCircle } from 'lucide-react';
import {
  loadAppointments,
  formatBRL,
  formatPhone,
  cleanPhoneDigits,
  createCustomerWhatsAppMessageUrl,
  loadConfig,
} from '../services/storage';
import { Appointment } from '../types';

interface MyBookingsProps {
  onStartBooking: () => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({ onStartBooking }) => {
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [searched, setSearched] = useState<boolean>(false);
  const config = loadConfig();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = cleanPhoneDigits(phoneInput);
    if (!digits || digits.length < 8) return;

    const all = loadAppointments();
    const filtered = all.filter((apt) => {
      const cDigits = cleanPhoneDigits(apt.customerWhatsapp);
      return cDigits.includes(digits) || digits.includes(cDigits);
    });

    setAppointments(filtered);
    setSearched(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-neutral-100">
          Meus Agendamentos no Império
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-md mx-auto">
          Digite seu WhatsApp para localizar todos os seus horários e histórico de atendimento.
        </p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="tel"
              placeholder="Digite seu WhatsApp com DDD..."
              value={phoneInput}
              onChange={(e) => setPhoneInput(formatPhone(e.target.value))}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              required
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-colors shrink-0"
          >
            Buscar Horários
          </button>
        </form>
      </div>

      {searched && (
        <div className="space-y-4">
          {appointments && appointments.length > 0 ? (
            appointments.map((apt) => {
              const dateFormatted = apt.date.split('-').reverse().join('/');
              const waUrl = createCustomerWhatsAppMessageUrl(apt, config);

              return (
                <div
                  key={apt.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-bold text-base text-neutral-100">
                        {apt.servicesNames.join(' + ')}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          apt.status === 'confirmado'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : apt.status === 'pendente'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                            : apt.status === 'concluido'
                            ? 'bg-blue-950 text-blue-400'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
                      <span>Barbeiro: <strong className="text-amber-400">{apt.barberName}</strong></span>
                      <span>·</span>
                      <span className="tabular-nums font-medium text-neutral-300">
                        📅 {dateFormatted} às {apt.time}
                      </span>
                      <span>·</span>
                      <span className="tabular-nums font-semibold text-emerald-400">
                        {formatBRL(apt.totalPrice)}
                      </span>
                    </div>
                  </div>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              );
            })
          ) : (
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-8 text-center text-xs text-neutral-400">
              <AlertCircle className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p>Nenhum agendamento ativo encontrado para este número.</p>
              <button
                onClick={onStartBooking}
                className="mt-3 text-amber-400 font-semibold hover:underline"
              >
                + Agendar um corte agora na Barbearia Império
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
