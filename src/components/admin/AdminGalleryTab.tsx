import React, { useState } from 'react';
import { Image, Upload, Plus, Trash2, CheckCircle2, Eye, Star, Sparkles, X, Globe } from 'lucide-react';
import { BusinessConfig, GalleryPhoto } from '../../types';
import { readFileAsDataUrl, saveConfig, HERO_IMAGE } from '../../services/storage';

interface AdminGalleryTabProps {
  config: BusinessConfig;
  onConfigChange: (config: BusinessConfig) => void;
  showToast: (msg: string) => void;
}

export const AdminGalleryTab: React.FC<AdminGalleryTabProps> = ({
  config,
  onConfigChange,
  showToast,
}) => {
  // Hero photo management
  const [heroInputUrl, setHeroInputUrl] = useState(config.heroImageUrl || HERO_IMAGE);
  const [heroPreview, setHeroPreview] = useState(config.heroImageUrl || HERO_IMAGE);

  // Gallery photo modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<GalleryPhoto['category']>('ambiente');
  const [newUrl, setNewUrl] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<GalleryPhoto | null>(null);

  // Handle local file upload for Hero Banner
  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setHeroPreview(dataUrl);
      setHeroInputUrl(dataUrl);

      const updated: BusinessConfig = {
        ...config,
        heroImageUrl: dataUrl,
      };
      onConfigChange(updated);
      saveConfig(updated);
      showToast('Nova foto de capa da Landing Page salva!');
    } catch {
      alert('Erro ao carregar imagem local.');
    }
  };

  // Handle URL change for Hero Banner
  const handleSaveHeroUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroInputUrl.trim()) return;

    const updated: BusinessConfig = {
      ...config,
      heroImageUrl: heroInputUrl.trim(),
    };
    setHeroPreview(heroInputUrl.trim());
    onConfigChange(updated);
    saveConfig(updated);
    showToast('Foto de capa da Landing Page atualizada!');
  };

  // Handle local file upload for Gallery photo
  const handleGalleryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setNewUrl(dataUrl);
    } catch {
      alert('Erro ao carregar imagem local.');
    }
  };

  // Add new photo to gallery
  const handleAddGalleryPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) {
      alert('Por favor, selecione um arquivo de imagem ou insira a URL da foto.');
      return;
    }

    const newPhoto: GalleryPhoto = {
      id: 'gal-' + Date.now(),
      url: newUrl.trim(),
      title: newTitle.trim() || 'Foto da Barbearia',
      category: newCategory,
      createdAt: new Date().toISOString(),
    };

    const currentList = config.galleryPhotos || [];
    const updatedPhotos = [newPhoto, ...currentList];
    const updatedConfig: BusinessConfig = {
      ...config,
      galleryPhotos: updatedPhotos,
    };

    onConfigChange(updatedConfig);
    saveConfig(updatedConfig);
    setShowAddModal(false);
    setNewTitle('');
    setNewUrl('');
    showToast('Nova foto adicionada à galeria da Landing Page!');
  };

  // Delete photo from gallery
  const handleDeletePhoto = (photoId: string) => {
    if (!window.confirm('Tem certeza que deseja remover esta foto da galeria?')) return;
    const currentList = config.galleryPhotos || [];
    const updatedPhotos = currentList.filter((p) => p.id !== photoId);
    const updatedConfig: BusinessConfig = {
      ...config,
      galleryPhotos: updatedPhotos,
    };
    onConfigChange(updatedConfig);
    saveConfig(updatedConfig);
    showToast('Foto removida da galeria.');
  };

  // Set photo as Hero cover
  const handleSetAsHero = (photoUrl: string) => {
    const updatedConfig: BusinessConfig = {
      ...config,
      heroImageUrl: photoUrl,
    };
    setHeroPreview(photoUrl);
    setHeroInputUrl(photoUrl);
    onConfigChange(updatedConfig);
    saveConfig(updatedConfig);
    showToast('Esta foto foi definida como a Capa Principal da Landing Page!');
  };

  const galleryList = config.galleryPhotos || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Identidade Visual & Marketing
            </span>
          </div>
          <h2 className="font-display text-lg font-bold text-neutral-100 flex items-center gap-2 mt-1">
            <Image className="w-5 h-5 text-amber-400" />
            <span>Gerenciador de Fotos da Landing Page</span>
          </h2>
          <p className="text-xs text-neutral-400">
            Adicione fotos reais da sua barbearia tiradas do seu celular ou computador para ilustrar o salão, cortes e equipe.
          </p>
        </div>

        <button
          onClick={() => {
            setNewTitle('');
            setNewUrl('');
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-amber-400/10"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Foto na Galeria</span>
        </button>
      </div>

      {/* SECTION 1: HERO / COVER IMAGE */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h3 className="font-display text-base font-bold text-neutral-100 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span>Foto de Capa Principal (Banner Hero)</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Esta é a primeira imagem imersiva que o cliente vê ao abrir a página inicial da barbearia.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Live Preview of Hero Banner */}
          <div className="lg:col-span-7 relative h-48 sm:h-64 rounded-xl overflow-hidden border border-neutral-700 shadow-2xl group">
            <img
              src={heroPreview}
              alt="Capa Landing Page"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent flex flex-col justify-end p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                Visualização ao Vivo da Capa
              </span>
              <h4 className="font-display text-lg font-bold text-white drop-shadow-md">
                {config.name}
              </h4>
              <p className="text-xs text-neutral-300 drop-shadow">
                {config.slogan}
              </p>
            </div>
          </div>

          {/* Change Controls */}
          <div className="lg:col-span-5 space-y-4 text-xs">
            {/* Local Upload */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="font-semibold text-neutral-200 block">
                Opção 1: Enviar Foto do seu Celular / Computador
              </span>
              <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-amber-500/30 hover:border-amber-400 rounded-xl cursor-pointer bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 transition-colors">
                <Upload className="w-4 h-4" />
                <span className="font-semibold text-xs">Escolher arquivo de imagem</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeroFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-[10px] text-neutral-500 block text-center">
                JPG, PNG ou WEBP. A foto é salva instantaneamente.
              </span>
            </div>

            {/* URL Input */}
            <form onSubmit={handleSaveHeroUrl} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="font-semibold text-neutral-200 block">
                Opção 2: Inserir Link direto da imagem (URL)
              </span>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={heroInputUrl}
                  onChange={(e) => setHeroInputUrl(e.target.value)}
                  placeholder="https://exemplo.com/foto.jpg"
                  className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-amber-400 text-xs"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* SECTION 2: GALLERY PHOTOS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-neutral-100 flex items-center gap-2">
            <span>Galeria de Fotos da Barbearia ({galleryList.length})</span>
          </h3>
          <span className="text-xs text-neutral-400">
            Exibida na seção "Ambiente & Estilo" da Landing Page para encantar novos clientes.
          </span>
        </div>

        {galleryList.length === 0 ? (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-12 text-center text-neutral-500 text-xs">
            <Image className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>Nenhuma foto cadastrada na galeria ainda.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 text-amber-400 hover:underline font-semibold"
            >
              + Adicionar primeira foto agora
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryList.map((photo) => (
              <div
                key={photo.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-neutral-700 transition-colors"
              >
                <div className="relative h-44 overflow-hidden bg-neutral-950">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-amber-400 border border-amber-500/20">
                      {photo.category || 'ambiente'}
                    </span>
                  </div>

                  <button
                    onClick={() => setPreviewPhoto(photo)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black text-white backdrop-blur-sm transition-colors"
                    title="Ampliar foto"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3.5 space-y-2">
                  <h4 className="font-semibold text-xs text-neutral-200 line-clamp-1">
                    {photo.title}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                    <button
                      onClick={() => handleSetAsHero(photo.url)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                      title="Usar esta foto como a capa da página inicial"
                    >
                      <Star className="w-3 h-3" />
                      <span>Definir Capa</span>
                    </button>

                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-1 rounded text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                      title="Excluir da galeria"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add Photo to Gallery */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-display text-base font-bold text-neutral-100 flex items-center gap-2">
                <Image className="w-4 h-4 text-amber-400" />
                <span>Adicionar Foto na Galeria</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-500 hover:text-neutral-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGalleryPhoto} className="space-y-4 text-xs">
              {/* Image Preview if selected */}
              {newUrl && (
                <div className="h-40 rounded-xl overflow-hidden border border-neutral-700 relative">
                  <img src={newUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setNewUrl('')}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Upload button */}
              <div>
                <label className="block font-medium text-neutral-300 mb-1">
                  1. Enviar Foto do seu Celular / Computador
                </label>
                <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-neutral-700 hover:border-amber-400 rounded-xl cursor-pointer bg-neutral-950 text-neutral-300 hover:text-amber-400 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="font-semibold">Escolher imagem local</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Or paste URL */}
              <div>
                <label className="block font-medium text-neutral-300 mb-1">
                  Ou cole o Link / URL da Foto
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">
                  Título / Legenda da Foto *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Bancada de Navalhas & Lounge de Espera"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1">Categoria</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="ambiente">Ambiente / Salão & Cadeiras</option>
                  <option value="corte">Cortes de Cabelo / Degradê</option>
                  <option value="equipe">Equipe de Barbeiros</option>
                  <option value="outro">Outros / Eventos</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold"
                >
                  Adicionar Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Preview */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="max-w-3xl w-full text-center relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewPhoto.url}
              alt={previewPhoto.title}
              className="max-h-[80vh] w-auto mx-auto rounded-2xl shadow-2xl border border-neutral-800 object-contain"
            />
            <div className="mt-3 flex items-center justify-between text-left text-xs bg-neutral-900/90 px-4 py-2.5 rounded-xl border border-neutral-800">
              <div>
                <span className="font-bold text-white block">{previewPhoto.title}</span>
                <span className="text-[10px] text-amber-400 capitalize">{previewPhoto.category}</span>
              </div>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="text-neutral-400 hover:text-white px-3 py-1 rounded-lg bg-neutral-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
