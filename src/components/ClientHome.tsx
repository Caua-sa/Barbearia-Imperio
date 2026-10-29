import React, { useState, useMemo } from 'react';
import {
  Scissors,
  Clock,
  Sparkles,
  Calendar,
  Phone,
  MapPin,
  Instagram,
  ArrowRight,
  Coffee,
  CheckCircle2,
  Search,
  MessageCircle,
  Copy,
  ChevronRight,
  Star
} from 'lucide-react';
import {
  HERO_IMAGE,
  loadServices,
  loadBarbers,
  loadConfig,
  loadAppointments,
  formatBRL,
  formatPhone,
  cleanPhoneDigits,
  createCustomerWhatsAppMessageUrl,
} from '../services/storage';
import { Appointment, ServiceCategory } from '../types';

interface ClientHomeProps {
  onStartBooking: (serviceId?: string, barberId?: string) => void;
  onGoToAdmin: () => void;
}

export const ClientHome: React.FC<ClientHomeProps> = ({ onStartBooking, onGoToAdmin }) => {
  const services = useMemo(() => loadServices(), []);
  const barbers = useMemo(() => loadBarbers().filter((b) => b.active), []);
  const config = useMemo(() => loadConfig(), []);

  // Category filter state
  const [activeCategory, setActiveCategory] = useState<string>('todos');

  // Customer search appointments state
  const [searchWhatsapp, setSearchWhatsapp] = useState<string>('');
  const [customerBookings, setCustomerBookings] = useState<Appointment[] | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Filtered services
  const filteredServices = useMemo(() => {
    if (activeCategory === 'todos') return services;
    return services.filter((s) => s.category === activeCategory);
  }, [services, activeCategory]);

  const handleSearchBookings = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = cleanPhoneDigits(searchWhatsapp);
    if (!digits || digits.length < 8) return;

    const allApts = loadAppointments();
    const matches = allApts.filter((apt) => {
      const cDigits = cleanPhoneDigits(apt.customerWhatsapp);
      return cDigits.includes(digits) || digits.includes(cDigits);
    });

    setCustomerBookings(matches);
    setHasSearched(true);
  };

  const handleCopyLink = () => {
    const url = window.location.origin + window.location.pathname + '?express=true';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-neutral-800">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Interior da Barbearia Império"
            className="w-full h-full object-cover object-center brightness-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center sm:text-left">
          <div className="max-w-2xl">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs uppercase tracking-widest text-amber-400 font-semibold mb-3">
              <span>Experiência Premium</span>
              <span>·</span>
              <span>Cortes & Barba Artesanais</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-100 tracking-tight leading-[1.15] mb-5">
              O Padrão <span className="text-amber-400">Império</span> para Seu Visual.
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed mb-8 max-w-xl">
              Agende online em tempo real. Identificação instantânea pelo WhatsApp, profissionais de elite e ambiente reservado com café especial e atendimento de mestre.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3.5">
              <button
                onClick={() => onStartBooking()}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-400/20 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <Scissors className="w-4 h-4" />
                <span>Agendar Meu Horário Agora</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Link Rápido Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Link para Mandar a Amigos</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Quality Indicators */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-neutral-200">Visagismo & Fade</h3>
              <p className="text-[11px] text-neutral-400">Degradê preciso e alinhamento</p>
            </div>
          </div>

          <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-neutral-200">Barboterapia</h3>
              <p className="text-[11px] text-neutral-400">Toalha quente e óleos nobres</p>
            </div>
          </div>

          <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-neutral-200">Lounge Exclusivo</h3>
              <p className="text-[11px] text-neutral-400">Café espresso cortesia</p>
            </div>
          </div>

          <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-neutral-200">Sem Fila de Espera</h3>
              <p className="text-[11px] text-neutral-400">Horário pontual garantido</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section id="servicos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-1">
              Cardápio de Serviços
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-100">
              Cuidados sob Medida
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'combo', label: 'Combos' },
              { id: 'cabelo', label: 'Cabelo' },
              { id: 'barba', label: 'Barba' },
              { id: 'quimica', label: 'Tratamentos' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-amber-400 text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-neutral-200 bg-neutral-900 border border-neutral-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className={`bg-neutral-900/80 border rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-amber-500/40 relative ${
                service.popular ? 'border-amber-500/50' : 'border-neutral-800'
              }`}
            >
              {service.popular && (
                <div className="absolute top-3.5 right-4 text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Mais Pedido
                </div>
              )}

              <div>
                <h3 className="text-base font-semibold text-neutral-100 mb-1 pr-14">
                  {service.name}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  {service.description}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                <div>
                  <div className="text-xs text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{service.durationMinutes} minutos</span>
                  </div>
                  <div className="text-lg font-bold text-neutral-100 tabular-nums">
                    {formatBRL(service.price)}
                  </div>
                </div>

                <button
                  onClick={() => onStartBooking(service.id)}
                  className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-amber-400 hover:text-neutral-950 text-neutral-200 text-xs font-semibold transition-all flex items-center gap-1"
                >
                  <span>Agendar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Meet the Barbers */}
      <section id="barbeiros" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center sm:text-left mb-8">
          <div className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-1">
            Equipe de Especialistas
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-100">
            Nossos Barbeiros
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Profissionais certificados apaixonados pela arte da cutelaria e barbearia clássica.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden group hover:border-amber-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square overflow-hidden bg-neutral-950">
                  <img
                    src={barber.photoUrl}
                    alt={barber.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 bg-neutral-950/80 px-2.5 py-1 rounded-md backdrop-blur-sm border border-amber-500/20">
                      ★ {barber.rating.toFixed(2)} ({barber.totalReviews})
                    </span>
                    <span className="text-[11px] text-neutral-300 bg-neutral-950/80 px-2 py-0.5 rounded backdrop-blur-sm">
                      {barber.workingHours.start} às {barber.workingHours.end}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-display text-lg font-bold text-neutral-100">
                    {barber.name}
                  </h3>
                  <p className="text-xs text-amber-400 font-medium mb-2.5">{barber.role}</p>
                  <p className="text-xs text-neutral-400 leading-relaxed mb-4">{barber.bio}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {barber.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="text-[11px] text-neutral-300 bg-neutral-800/80 px-2 py-0.5 rounded-md"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => onStartBooking(undefined, barber.id)}
                  className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-amber-400 hover:text-neutral-950 text-neutral-200 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Agendar com {barber.nickname}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Quick Lookup / "Meus Agendamentos" */}
      <section id="meus-agendamentos" className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-100">
                Consultar Meus Agendamentos
              </h2>
              <p className="text-xs text-neutral-400">
                Digite seu número de WhatsApp para ver seus horários marcados ou histórico
              </p>
            </div>
          </div>

          <form onSubmit={handleSearchBookings} className="flex gap-2.5 mt-4 mb-6">
            <input
              type="tel"
              placeholder="(11) 98765-4321"
              value={searchWhatsapp}
              onChange={(e) => setSearchWhatsapp(formatPhone(e.target.value))}
              className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs transition-colors shrink-0"
            >
              Buscar
            </button>
          </form>

          {hasSearched && (
            <div>
              {customerBookings && customerBookings.length > 0 ? (
                <div className="space-y-3">
                  <span className="text-xs text-neutral-400">
                    Encontramos {customerBookings.length} agendamento(s) para este número:
                  </span>
                  {customerBookings.map((apt) => {
                    const dateFormatted = apt.date.split('-').reverse().join('/');
                    const waUrl = createCustomerWhatsAppMessageUrl(apt, config);
                    return (
                      <div
                        key={apt.id}
                        className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-neutral-200">
                              {apt.servicesNames.join(' + ')}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                apt.status === 'confirmado'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                  : apt.status === 'pendente'
                                  ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                                  : 'bg-neutral-800 text-neutral-400'
                              }`}
                            >
                              {apt.status}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-400 mt-1">
                            Barbeiro: <strong className="text-amber-400">{apt.barberName}</strong> ·{' '}
                            <span>{dateFormatted} às {apt.time}</span> ·{' '}
                            <span className="text-emerald-400">{formatBRL(apt.totalPrice)}</span>
                          </div>
                        </div>

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-neutral-400 text-xs">
                  Nenhum agendamento encontrado para este WhatsApp.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Location & Info Footer */}
      <footer className="border-t border-neutral-800 pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
            <div>
              <h3 className="font-display text-lg font-bold text-neutral-100 uppercase tracking-wider mb-2">
                Barbearia Império
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-sm mb-4">
                {config.slogan}
              </p>
              <div className="text-xs text-neutral-400 flex items-center gap-2">
                <Instagram className="w-4 h-4 text-amber-400" />
                <span className="text-neutral-300 font-medium">{config.instagram}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-3">
                Localização & Contato
              </h4>
              <p className="text-xs text-neutral-400 flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{config.address}, {config.neighborhood} - {config.city}/{config.state}</span>
              </p>
              <p className="text-xs text-neutral-400 flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{config.phone}</span>
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-3">
                Horário de Atendimento
              </h4>
              <p className="text-xs text-neutral-400 mb-1">
                Segunda a Sábado: <strong className="text-neutral-200">{config.openingHour} às {config.closingHour}</strong>
              </p>
              <p className="text-xs text-neutral-400">
                Domingo: Sob consulta prévia para eventos/noivos.
              </p>
            </div>
          </div>

          <div className="border-t border-neutral-900 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
            <div>
              © {new Date().getFullYear()} Barbearia Império. Todos os direitos reservados.
            </div>
            <div>
              {/* Discreet staff link */}
              <button
                onClick={onGoToAdmin}
                className="text-neutral-700 hover:text-neutral-400 text-[11px] transition-colors flex items-center gap-1"
                title="Acesso restrito para a gerência e barbeiros"
              >
                <span>Área Restrita / Equipe</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
