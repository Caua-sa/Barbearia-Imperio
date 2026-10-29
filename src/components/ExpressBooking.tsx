import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  Share2,
  Copy,
  Sparkles,
  Phone,
  ArrowRight,
  ChevronLeft,
  CalendarCheck,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import {
  loadServices,
  loadBarbers,
  loadConfig,
  getAvailableSlots,
  findCustomerByPhone,
  registerOrUpdateCustomer,
  saveAppointments,
  loadAppointments,
  formatPhone,
  cleanPhoneDigits,
  formatBRL,
  createCustomerWhatsAppMessageUrl,
  getTodayDateString,
} from '../services/storage';
import { Appointment, Barber, Customer, Service } from '../types';

interface ExpressBookingProps {
  onGoHome?: () => void;
  preselectedServiceId?: string;
  preselectedBarberId?: string;
}

export const ExpressBooking: React.FC<ExpressBookingProps> = ({
  onGoHome,
  preselectedServiceId,
  preselectedBarberId,
}) => {
  const services = useMemo(() => loadServices(), []);
  const barbers = useMemo(() => loadBarbers().filter((b) => b.active), []);
  const config = useMemo(() => loadConfig(), []);

  // Form states
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    preselectedServiceId ? [preselectedServiceId] : ['srv-combo-rei']
  );
  const [selectedBarberId, setSelectedBarberId] = useState<string>(
    preselectedBarberId || barbers[0]?.id || ''
  );
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedTime, setSelectedTime] = useState<string>('');

  // WhatsApp and customer identification states
  const [whatsappInput, setWhatsappInput] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [clientNotes, setClientNotes] = useState<string>('');
  const [identifiedCustomer, setIdentifiedCustomer] = useState<Customer | null>(null);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Booking result state
  const [completedAppointment, setCompletedAppointment] = useState<Appointment | null>(null);
  const [formError, setFormError] = useState<string>('');

  // Calculate total price and duration
  const selectedServices = useMemo(() => {
    return services.filter((s) => selectedServiceIds.includes(s.id));
  }, [services, selectedServiceIds]);

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.price, 0);
  }, [selectedServices]);

  const totalDuration = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [selectedServices]);

  const selectedBarber = useMemo(() => {
    return barbers.find((b) => b.id === selectedBarberId);
  }, [barbers, selectedBarberId]);

  // Compute available slots
  const availableSlots = useMemo(() => {
    if (!selectedBarberId || !selectedDate) return [];
    return getAvailableSlots(selectedDate, selectedBarberId, totalDuration || 30);
  }, [selectedDate, selectedBarberId, totalDuration]);

  // Reset selected time if slots change and selected time is no longer available
  useEffect(() => {
    if (selectedTime) {
      const match = availableSlots.find((s) => s.time === selectedTime && s.available);
      if (!match) {
        setSelectedTime('');
      }
    }
  }, [availableSlots, selectedTime]);

  // Generate next 7 days for quick tab selection
  const upcomingDays = useMemo(() => {
    const list: { dateStr: string; label: string; weekday: string; dayNum: string }[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      let label = '';
      if (i === 0) label = 'Hoje';
      else if (i === 1) label = 'Amanhã';
      else {
        const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        label = weekdays[d.getDay()];
      }

      const dayNum = String(d.getDate());
      const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');

      list.push({ dateStr, label, weekday, dayNum });
    }
    return list;
  }, []);

  // Check WhatsApp on input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatPhone(rawVal);
    setWhatsappInput(formatted);
    setFormError('');

    const digits = cleanPhoneDigits(rawVal);
    if (digits.length >= 10) {
      setIsSearchingCustomer(true);
      const found = findCustomerByPhone(digits);
      setIsSearchingCustomer(false);
      if (found) {
        setIdentifiedCustomer(found);
        setCustomerName(found.name);
      } else {
        setIdentifiedCustomer(null);
      }
    } else {
      setIdentifiedCustomer(null);
    }
  };

  const toggleService = (srvId: string) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(srvId)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((id) => id !== srvId);
      } else {
        return [...prev, srvId];
      }
    });
  };

  const handleCopyQuickLink = () => {
    const url = window.location.origin + window.location.pathname + '?express=true';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Submit appointment
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (selectedServices.length === 0) {
      setFormError('Selecione pelo menos um serviço.');
      return;
    }
    if (!selectedBarber) {
      setFormError('Selecione o profissional de sua preferência.');
      return;
    }
    if (!selectedTime) {
      setFormError('Escolha um horário disponível para o seu atendimento.');
      return;
    }
    const digits = cleanPhoneDigits(whatsappInput);
    if (digits.length < 10) {
      setFormError('Informe um número de WhatsApp válido com DDD (ex: 11 98765-4321).');
      return;
    }
    if (!identifiedCustomer && (!customerName || customerName.trim().length < 2)) {
      setFormError('Por favor, digite seu nome para que possamos te identificar e salvar seu cadastro.');
      return;
    }

    // Auto-register or update customer in CRM database
    const savedCustomer = registerOrUpdateCustomer(customerName, whatsappInput, clientNotes);

    const newAppointment: Appointment = {
      id: 'apt-' + Date.now(),
      customerId: savedCustomer.id,
      customerName: savedCustomer.name,
      customerWhatsapp: savedCustomer.whatsapp,
      barberId: selectedBarber.id,
      barberName: selectedBarber.name,
      serviceIds: selectedServices.map((s) => s.id),
      servicesNames: selectedServices.map((s) => s.name),
      totalPrice,
      totalDuration,
      date: selectedDate,
      time: selectedTime,
      status: 'confirmado',
      notes: clientNotes,
      createdAt: new Date().toISOString(),
    };

    // Save to appointments store
    const existing = loadAppointments();
    saveAppointments([newAppointment, ...existing]);

    setCompletedAppointment(newAppointment);
  };

  // If completed, render royal confirmation screen
  if (completedAppointment) {
    const whatsappUrl = createCustomerWhatsAppMessageUrl(completedAppointment, config);
    const dateFormatted = completedAppointment.date.split('-').reverse().join('/');

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center">
          {/* Subtle gold glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-neutral-950 mx-auto mb-4 shadow-lg shadow-amber-500/20">
            <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
          </div>

          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
            Agendamento Confirmado
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-100 mt-1 mb-2">
            Horário Garantido no Império!
          </h2>
          <p className="text-neutral-400 text-sm max-w-md mx-auto mb-6">
            Obrigado, <strong className="text-neutral-200">{completedAppointment.customerName}</strong>! Seus dados foram salvos com sucesso e você receberá o atendimento VIP.
          </p>

          {/* Details summary */}
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-5 mb-6 text-left space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
              <span className="text-xs text-neutral-400">Serviços</span>
              <span className="text-sm font-semibold text-neutral-200 text-right">
                {completedAppointment.servicesNames.join(' + ')}
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
              <span className="text-xs text-neutral-400">Barbeiro</span>
              <span className="text-sm font-semibold text-amber-400">
                {completedAppointment.barberName}
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
              <span className="text-xs text-neutral-400">Data & Horário</span>
              <span className="text-sm font-semibold text-neutral-200 tabular-nums">
                {dateFormatted} às {completedAppointment.time} ({completedAppointment.totalDuration} min)
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
              <span className="text-xs text-neutral-400">Cliente (WhatsApp)</span>
              <span className="text-sm text-neutral-300 tabular-nums">
                {formatPhone(completedAppointment.customerWhatsapp)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-neutral-400">Valor Total Estimado</span>
              <span className="text-lg font-bold text-emerald-400 tabular-nums">
                {formatBRL(completedAppointment.totalPrice)}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-colors shadow-lg shadow-emerald-600/20"
            >
              <MessageCircle className="w-5 h-5" />
              Notificar Barbearia via WhatsApp
            </a>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setCompletedAppointment(null);
                  setSelectedTime('');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
              >
                Fazer Outro Agendamento
              </button>

              {onGoHome && (
                <button
                  onClick={onGoHome}
                  className="w-full py-2.5 px-4 rounded-xl bg-neutral-950 border border-neutral-700 hover:border-neutral-500 text-neutral-300 text-xs font-medium transition-colors"
                >
                  Ir para Página Inicial
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-neutral-800/80 flex items-center justify-center gap-2 text-xs text-neutral-400">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Na sua próxima visita, basta digitar seu WhatsApp para agendar em 1 clique!</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      {/* Top Banner with Express Share Link */}
      <div className="bg-gradient-to-r from-amber-500/10 via-neutral-900 to-amber-500/10 border border-amber-500/20 rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
              Link de Agendamento Rápido
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-xs text-neutral-400">Express para Clientes</span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-neutral-100 mt-0.5">
            Agende seu Horário na Barbearia Império
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Escolha o serviço, selecione seu barbeiro e confirme pelo WhatsApp. Rápido e sem burocracia.
          </p>
        </div>

        <button
          onClick={handleCopyQuickLink}
          className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 hover:text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
          title="Copie este link para enviar pelo WhatsApp aos seus clientes"
        >
          {copiedLink ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Link Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copiar Link para Clientes</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmitBooking} className="space-y-8">
        {/* Step 1: Select Services */}
        <section className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-bold border border-amber-500/20">
                1
              </div>
              <h2 className="text-base font-semibold text-neutral-100">
                Escolha o(s) Serviço(s)
              </h2>
            </div>
            <div className="text-xs text-neutral-400">
              Total: <span className="text-amber-400 font-semibold">{totalDuration} min</span> ·{' '}
              <span className="text-emerald-400 font-semibold">{formatBRL(totalPrice)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((srv) => {
              const isSelected = selectedServiceIds.includes(srv.id);
              return (
                <button
                  type="button"
                  key={srv.id}
                  onClick={() => toggleService(srv.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/60 shadow-sm'
                      : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-sm font-medium text-neutral-200 leading-snug">
                      {srv.name}
                    </span>
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center text-xs shrink-0 border ${
                        isSelected
                          ? 'bg-amber-400 border-amber-400 text-neutral-950 font-bold'
                          : 'border-neutral-700 bg-neutral-900'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 line-clamp-2 mb-3">
                    {srv.description}
                  </p>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800/60">
                    <span className="text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      {srv.durationMinutes} min
                    </span>
                    <span className="text-sm font-bold text-neutral-100 tabular-nums">
                      {formatBRL(srv.price)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2: Select Barber */}
        <section className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-bold border border-amber-500/20">
              2
            </div>
            <h2 className="text-base font-semibold text-neutral-100">
              Selecione o Barbeiro
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {barbers.map((barber) => {
              const isSelected = selectedBarberId === barber.id;
              return (
                <button
                  type="button"
                  key={barber.id}
                  onClick={() => setSelectedBarberId(barber.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/60 shadow-sm'
                      : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <img
                    src={barber.photoUrl}
                    alt={barber.name}
                    className="w-13 h-13 rounded-full object-cover border-2 border-neutral-700 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="overflow-hidden">
                    <h3 className="text-sm font-semibold text-neutral-200 truncate">
                      {barber.name}
                    </h3>
                    <p className="text-xs text-amber-400 truncate font-medium">
                      {barber.role}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1">
                      <span>⭐ {barber.rating.toFixed(1)}</span>
                      <span>·</span>
                      <span>{barber.totalReviews} avaliações</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 3: Date and Time Slot */}
        <section className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-bold border border-amber-500/20">
                3
              </div>
              <h2 className="text-base font-semibold text-neutral-100">
                Data & Horário
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                min={getTodayDateString()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Quick Date Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
            {upcomingDays.map((item) => {
              const isSelected = selectedDate === item.dateStr;
              return (
                <button
                  type="button"
                  key={item.dateStr}
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`px-3.5 py-2 rounded-xl text-center shrink-0 border transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-neutral-950 font-bold border-amber-400 shadow-md'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider">{item.label}</div>
                  <div className="text-sm font-semibold tabular-nums mt-0.5">{item.dayNum}</div>
                </button>
              );
            })}
          </div>

          {/* Available Slots Grid */}
          <div>
            <div className="text-xs text-neutral-400 mb-2 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>Horários disponíveis em tempo real:</span>
            </div>

            {availableSlots.length === 0 ? (
              <div className="text-center py-6 text-neutral-500 text-xs">
                Nenhum horário de atendimento configurado para esta data.
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {availableSlots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      type="button"
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      title={slot.available ? 'Disponível' : slot.conflictReason}
                      className={`py-2 px-1 text-xs rounded-lg font-medium tabular-nums transition-all border ${
                        !slot.available
                          ? 'bg-neutral-950/40 text-neutral-600 border-neutral-900 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-amber-400 text-neutral-950 font-bold border-amber-400 shadow-sm'
                          : 'bg-neutral-950 text-neutral-200 border-neutral-800 hover:border-amber-500/50 hover:text-white'
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Step 4: WhatsApp Identification & Instant Recognition */}
        <section className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 sm:p-6 relative overflow-hidden">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-bold border border-amber-500/20">
              4
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-100">
                Identificação Rápida via WhatsApp
              </h2>
              <p className="text-xs text-neutral-400">
                Se já tiver cadastro, o sistema reconhece automaticamente na hora.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Número de WhatsApp (com DDD)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="(11) 98765-4321"
                  value={whatsappInput}
                  onChange={handlePhoneChange}
                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none tabular-nums"
                  required
                />
                <Phone className="w-4 h-4 text-neutral-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Smart Detection Banner */}
            {identifiedCustomer && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 text-xs text-emerald-300 flex items-start gap-3 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-emerald-200">
                    🎉 Bem-vindo de volta, {identifiedCustomer.name}!
                  </p>
                  <p className="mt-0.5 text-neutral-300">
                    Localizamos seu cadastro com <strong>{identifiedCustomer.totalAppointments} atendimentos</strong> na Barbearia Império. Seus dados já estão salvos e você não precisa preencher nada a mais!
                  </p>
                </div>
              </div>
            )}

            {/* If New Customer, show Name input */}
            {!identifiedCustomer && cleanPhoneDigits(whatsappInput).length >= 10 && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>Novo no Império? Informe seu nome para salvar seu cadastro:</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Carlos Silva"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none"
                    required
                  />
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    ✓ Seus dados serão salvos automaticamente para que o próximo agendamento seja instantâneo.
                  </span>
                </div>
              </div>
            )}

            {/* Optional notes */}
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Observações ou Preferências (opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Lavar cabelo antes, barba desenhada sem navalha, etc."
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-700 rounded-xl px-4 py-2 text-xs text-neutral-300 placeholder-neutral-600 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Error message */}
        {formError && (
          <div className="bg-rose-950/50 border border-rose-500/50 text-rose-200 text-xs rounded-xl p-3.5 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        {/* Submit Button Bar */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="text-xs text-neutral-400">Resumo do Horário:</div>
            <div className="text-sm font-semibold text-neutral-200">
              {selectedBarber?.name} · {selectedTime || 'Selecione um horário'}
            </div>
            <div className="text-xs text-emerald-400 font-bold tabular-nums">
              Total: {formatBRL(totalPrice)} ({totalDuration} min)
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Confirmar Agendamento</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
