import React, { useState } from 'react';
import { Scissors, Plus, Edit2, Trash2, CheckCircle2, Star, Clock, DollarSign, X } from 'lucide-react';
import { Service, ServiceCategory } from '../../types';
import { formatBRL, saveServices } from '../../services/storage';

interface AdminServicesTabProps {
  services: Service[];
  onServicesChange: (services: Service[]) => void;
  showToast: (msg: string) => void;
}

export const AdminServicesTab: React.FC<AdminServicesTabProps> = ({
  services,
  onServicesChange,
  showToast,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('todos');

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('cabelo');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [price, setPrice] = useState(55);
  const [popular, setPopular] = useState(false);
  const [active, setActive] = useState(true);

  const openNewModal = () => {
    setEditingService(null);
    setName('');
    setCategory('cabelo');
    setDescription('');
    setDurationMinutes(45);
    setPrice(55);
    setPopular(false);
    setActive(true);
    setShowModal(true);
  };

  const openEditModal = (srv: Service) => {
    setEditingService(srv);
    setName(srv.name);
    setCategory(srv.category);
    setDescription(srv.description);
    setDurationMinutes(srv.durationMinutes);
    setPrice(srv.price);
    setPopular(!!srv.popular);
    setActive(srv.active !== false);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let updated: Service[];
    if (editingService) {
      updated = services.map((s) =>
        s.id === editingService.id
          ? {
              ...s,
              name: name.trim(),
              category,
              description: description.trim(),
              durationMinutes: Number(durationMinutes),
              price: Number(price),
              popular,
              active,
            }
          : s
      );
      showToast(`Serviço "${name}" atualizado com sucesso!`);
    } else {
      const newSrv: Service = {
        id: 'srv-' + Date.now(),
        name: name.trim(),
        category,
        description: description.trim(),
        durationMinutes: Number(durationMinutes),
        price: Number(price),
        popular,
        active,
      };
      updated = [newSrv, ...services];
      showToast(`Serviço "${name}" cadastrado com sucesso!`);
    }

    onServicesChange(updated);
    saveServices(updated);
    setShowModal(false);
  };

  const handleDelete = (id: string, srvName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o serviço "${srvName}"?`)) return;
    const updated = services.filter((s) => s.id !== id);
    onServicesChange(updated);
    saveServices(updated);
    showToast(`Serviço removido.`);
  };

  const filteredServices = services.filter((s) =>
    filterCategory === 'todos' ? true : s.category === filterCategory
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-neutral-100 flex items-center gap-2">
            <Scissors className="w-5 h-5 text-amber-400" />
            <span>Cadastro & Modificação de Serviços</span>
          </h2>
          <p className="text-xs text-neutral-400">
            Cadastre novos cortes, barboterapias, combos ou altere valores e tempos de atendimento.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-amber-400/10"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Serviço</span>
        </button>
      </div>

      {/* Category filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'todos', label: 'Todos os Serviços' },
          { id: 'cabelo', label: 'Cabelo / Cortes' },
          { id: 'barba', label: 'Barba & Barboterapia' },
          { id: 'combo', label: 'Combos Especiais' },
          { id: 'quimica', label: 'Química / Pigmentação' },
          { id: 'especial', label: 'Especiais / Outros' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filterCategory === cat.id
                ? 'bg-amber-400 text-neutral-950 font-semibold'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((srv) => (
          <div
            key={srv.id}
            className={`bg-neutral-900 border rounded-2xl p-5 flex flex-col justify-between transition-colors ${
              srv.active !== false ? 'border-neutral-800' : 'border-neutral-800/40 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-amber-400">
                  {srv.category}
                </span>
                <div className="flex items-center gap-1">
                  {srv.popular && (
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" /> Mais Pedido
                    </span>
                  )}
                  {srv.active === false && (
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-neutral-800 text-neutral-400">
                      Inativo
                    </span>
                  )}
                </div>
              </div>

              <h3 className="font-display text-base font-bold text-neutral-100 mb-1">
                {srv.name}
              </h3>
              <p className="text-xs text-neutral-400 mb-4 line-clamp-2 leading-relaxed">
                {srv.description}
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-800/80">
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{srv.durationMinutes} min</span>
                </div>
                <div className="text-base font-bold text-amber-400 tabular-nums">
                  {formatBRL(srv.price)}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(srv)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Modificar</span>
                </button>
                <button
                  onClick={() => handleDelete(srv.id, srv.name)}
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                  title="Excluir serviço"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: New / Edit Service */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-display text-base font-bold text-neutral-100 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-amber-400" />
                <span>{editingService ? 'Modificar Serviço' : 'Cadastrar Novo Serviço'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-500 hover:text-neutral-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-300 mb-1">
                  Nome do Serviço / Corte *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Corte Degrade Navalhado + Sobrancelha"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Categoria *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="cabelo">Cabelo / Corte</option>
                    <option value="barba">Barba / Barboterapia</option>
                    <option value="combo">Combo (Cabelo + Barba)</option>
                    <option value="quimica">Química / Luzes / Pigmentação</option>
                    <option value="especial">Especial / Sobrancelha</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-300 mb-1">
                    Preço (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-neutral-500">R$</span>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-400 font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">
                  Duração Estimada (Minutos) *
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-400 font-mono"
                >
                  <option value={15}>15 minutos (Alinhamento rápido)</option>
                  <option value={30}>30 minutos (Barba simples ou máquina)</option>
                  <option value={45}>45 minutos (Corte padrão degradê/tesoura)</option>
                  <option value={60}>60 minutos (1 hora - Barboterapia ou Corte)</option>
                  <option value={75}>75 minutos (1h 15m - Combo Corte + Barba)</option>
                  <option value={90}>90 minutos (1h 30m - Combo Completo VIP)</option>
                  <option value={120}>120 minutos (2 horas - Química/Pigmentação)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">
                  Descrição do Serviço (Visível para o cliente)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Ex: Corte estilizado, lavagem com shampoo refrescante, finalização com pomada matte e toalha perfumada."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800">
                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={popular}
                    onChange={(e) => setPopular(e.target.checked)}
                    className="rounded text-amber-400 focus:ring-0"
                  />
                  <span>Destacar como "Mais Pedido / Popular"</span>
                </label>

                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded text-amber-400 focus:ring-0"
                  />
                  <span>Serviço ativo para agendamento online dos clientes</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold"
                >
                  {editingService ? 'Salvar Alterações' : 'Cadastrar Serviço'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
