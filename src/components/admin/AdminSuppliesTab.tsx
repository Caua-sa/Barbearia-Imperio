import React, { useState } from 'react';
import { Layers, Plus, AlertTriangle, Edit2, Trash2, ArrowUpRight, CheckCircle2, X } from 'lucide-react';
import { SuppliesItem } from '../../types';
import { formatBRL, saveSupplies, addFinancialEntry, getTodayDateString } from '../../services/storage';

interface AdminSuppliesTabProps {
  supplies: SuppliesItem[];
  onSuppliesChange: (supplies: SuppliesItem[]) => void;
  showToast: (msg: string) => void;
  onRefreshFinancial?: () => void;
}

export const AdminSuppliesTab: React.FC<AdminSuppliesTabProps> = ({
  supplies,
  onSuppliesChange,
  showToast,
  onRefreshFinancial,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<SuppliesItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SuppliesItem['category']>('descartavel');
  const [quantity, setQuantity] = useState(10);
  const [minQuantity, setMinQuantity] = useState(5);
  const [unit, setUnit] = useState<SuppliesItem['unit']>('un');
  const [costPrice, setCostPrice] = useState(10);
  const [supplier, setSupplier] = useState('');

  // Quick Restock modal
  const [restockItem, setRestockItem] = useState<SuppliesItem | null>(null);
  const [restockQty, setRestockQty] = useState(10);
  const [logAsExpense, setLogAsExpense] = useState(true);

  const openNewModal = () => {
    setEditingItem(null);
    setName('');
    setCategory('descartavel');
    setQuantity(20);
    setMinQuantity(5);
    setUnit('un');
    setCostPrice(15);
    setSupplier('');
    setShowModal(true);
  };

  const openEditModal = (item: SuppliesItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setQuantity(item.quantity);
    setMinQuantity(item.minQuantity);
    setUnit(item.unit);
    setCostPrice(item.costPrice);
    setSupplier(item.supplier || '');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let updated: SuppliesItem[];
    if (editingItem) {
      updated = supplies.map((s) =>
        s.id === editingItem.id
          ? {
              ...s,
              name: name.trim(),
              category,
              quantity: Number(quantity),
              minQuantity: Number(minQuantity),
              unit,
              costPrice: Number(costPrice),
              supplier: supplier.trim() || undefined,
            }
          : s
      );
      showToast(`Insumo "${name}" atualizado!`);
    } else {
      const newItem: SuppliesItem = {
        id: 'sup-' + Date.now(),
        name: name.trim(),
        category,
        quantity: Number(quantity),
        minQuantity: Number(minQuantity),
        unit,
        costPrice: Number(costPrice),
        supplier: supplier.trim() || undefined,
        lastRestocked: getTodayDateString(),
      };
      updated = [newItem, ...supplies];
      showToast(`Insumo "${name}" cadastrado com sucesso!`);
    }

    onSuppliesChange(updated);
    saveSupplies(updated);
    setShowModal(false);
  };

  const handleDelete = (id: string, itemName: string) => {
    if (!window.confirm(`Tem certeza que deseja remover o insumo "${itemName}"?`)) return;
    const updated = supplies.filter((s) => s.id !== id);
    onSuppliesChange(updated);
    saveSupplies(updated);
    showToast('Insumo removido.');
  };

  // Quick Restock action
  const handleQuickRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem || restockQty <= 0) return;

    const updated = supplies.map((s) =>
      s.id === restockItem.id
        ? {
            ...s,
            quantity: s.quantity + Number(restockQty),
            lastRestocked: getTodayDateString(),
          }
        : s
    );
    onSuppliesChange(updated);
    saveSupplies(updated);

    if (logAsExpense) {
      const totalCost = restockItem.costPrice * Number(restockQty);
      addFinancialEntry({
        type: 'despesa',
        description: `Reposição de Insumo: ${restockQty} ${restockItem.unit} de ${restockItem.name}`,
        amount: totalCost,
        date: getTodayDateString(),
        paymentMethod: 'pix',
        category: 'Insumos & Descartáveis',
      });
      if (onRefreshFinancial) onRefreshFinancial();
      showToast(`Estoque reposto (+${restockQty}) e despesa de ${formatBRL(totalCost)} lançada no financeiro!`);
    } else {
      showToast(`Estoque de "${restockItem.name}" reposto (+${restockQty}).`);
    }

    setRestockItem(null);
  };

  const lowStockCount = supplies.filter((s) => s.quantity <= s.minQuantity).length;
  const totalInvestedInSupplies = supplies.reduce((acc, s) => acc + s.quantity * s.costPrice, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Operação Interna
            </span>
            {lowStockCount > 0 && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {lowStockCount} precisando de reposição
              </span>
            )}
          </div>
          <h2 className="font-display text-lg font-bold text-neutral-100 flex items-center gap-2 mt-1">
            <Layers className="w-5 h-5 text-amber-400" />
            <span>Controle de Insumos da Barbearia</span>
          </h2>
          <p className="text-xs text-neutral-400">
            Itens operacionais para trabalho dos barbeiros: lâminas descartáveis, golas higiênicas, toalhas, loções e insumos de lounge.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-amber-400/10"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Insumo</span>
        </button>
      </div>

      {/* KPI bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <span className="text-xs text-neutral-400 block mb-1">Total de Tipos de Insumo</span>
          <span className="text-xl font-bold text-neutral-100">{supplies.length} itens</span>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <span className="text-xs text-neutral-400 block mb-1">Alertas de Estoque Baixo</span>
          <span className={`text-xl font-bold ${lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {lowStockCount} {lowStockCount === 1 ? 'item' : 'itens'}
          </span>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <span className="text-xs text-neutral-400 block mb-1">Valor Total em Insumos</span>
          <span className="text-xl font-bold text-amber-400">{formatBRL(totalInvestedInSupplies)}</span>
        </div>
      </div>

      {/* Supplies Table / Cards */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Insumo / Material</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4 text-center">Quantidade Atual</th>
                <th className="py-3 px-4 text-center">Mínimo Alerta</th>
                <th className="py-3 px-4">Custo Unitário</th>
                <th className="py-3 px-4">Fornecedor</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {supplies.map((item) => {
                const isLow = item.quantity <= item.minQuantity;
                return (
                  <tr key={item.id} className="hover:bg-neutral-850/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-neutral-200">{item.name}</div>
                      {item.lastRestocked && (
                        <div className="text-[10px] text-neutral-500">
                          Última reposição: {item.lastRestocked.split('-').reverse().join('/')}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-400 text-[10px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 font-bold font-mono">
                        <span className={`text-sm ${isLow ? 'text-rose-400' : 'text-neutral-100'}`}>
                          {item.quantity} {item.unit}
                        </span>
                        {isLow && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Abaixo do estoque mínimo!" />
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center text-neutral-400 font-mono">
                      {item.minQuantity} {item.unit}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300 font-mono">
                      {formatBRL(item.costPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400">
                      {item.supplier || <span className="text-neutral-600">-</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setRestockItem(item);
                            setRestockQty(10);
                          }}
                          className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                          title="Repor estoque agora"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Repor</span>
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1 rounded text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New / Edit Insumo */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-display text-base font-bold text-neutral-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>{editingItem ? 'Modificar Insumo' : 'Cadastrar Insumo da Barbearia'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-neutral-500 hover:text-neutral-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-300 mb-1">Nome do Insumo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Lâminas de Barbear Platinum (cx 100un)"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Categoria *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="descartavel">Descartável (Lâminas, Golas)</option>
                    <option value="higiene">Higiene & Antisséptico</option>
                    <option value="quimica">Química / Loções em Galão</option>
                    <option value="lounge">Lounge / Café / Bebidas</option>
                    <option value="outro">Outros Materiais</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Unidade de Medida *</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-400 font-mono"
                  >
                    <option value="un">Unidade (un)</option>
                    <option value="cx">Caixa (cx)</option>
                    <option value="pct">Pacote (pct)</option>
                    <option value="litros">Litros (litros)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Qtd Atual *</label>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Qtd Mínima *</label>
                  <input
                    type="number"
                    min="0"
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-300 mb-1">Custo (R$) *</label>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Fornecedor / Distribuidor</label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Ex: Distribuidora Barber Pro SP"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-400"
                />
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
                  {editingItem ? 'Salvar Insumo' : 'Cadastrar Insumo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Fast Restock */}
      {restockItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="font-display text-sm font-bold text-neutral-100">
                Repor Insumo: {restockItem.name}
              </h3>
              <button onClick={() => setRestockItem(null)} className="text-neutral-500 hover:text-neutral-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickRestock} className="space-y-4 text-xs">
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex justify-between items-center">
                <span className="text-neutral-400">Estoque Atual:</span>
                <strong className="text-neutral-100 font-mono text-sm">
                  {restockItem.quantity} {restockItem.unit}
                </strong>
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">
                  Quantidade a Adicionar ({restockItem.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 font-mono text-base font-bold"
                  required
                  autoFocus
                />
              </div>

              <div className="bg-neutral-950/80 p-3 rounded-xl border border-neutral-800 space-y-2">
                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={logAsExpense}
                    onChange={(e) => setLogAsExpense(e.target.checked)}
                    className="rounded text-amber-400 focus:ring-0"
                  />
                  <span>Lançar custo automaticamente em Despesas do Financeiro</span>
                </label>
                {logAsExpense && (
                  <div className="text-[11px] text-amber-400 flex justify-between pt-1 border-t border-neutral-800">
                    <span>Valor total da reposição:</span>
                    <strong className="font-mono">{formatBRL(restockItem.costPrice * Number(restockQty))}</strong>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setRestockItem(null)}
                  className="px-3 py-2 rounded-xl text-neutral-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold"
                >
                  Confirmar Reposição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
