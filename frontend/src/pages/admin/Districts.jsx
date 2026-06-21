import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit, Trash2, X, Upload, MapPin, Building2,
  ChevronLeft, ChevronRight, AlertCircle, Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { districtAPI } from '../../api/axios';

const DistrictModal = ({ district, onClose, onSaved }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [form, setForm] = useState({
    name: district?.name || '',
    nameAr: district?.nameAr || '',
    description: district?.description || '',
    descriptionAr: district?.descriptionAr || '',
    googleMapsUrl: district?.googleMapsUrl || '',
    isVacation: district?.isVacation || false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(district?.coverImage || '');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error(t('admin.districts.not_image')); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error(t('admin.districts.name_required')); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('nameAr', form.nameAr.trim());
      fd.append('description', form.description.trim());
      fd.append('descriptionAr', form.descriptionAr.trim());
      fd.append('googleMapsUrl', form.googleMapsUrl.trim());
      fd.append('isVacation', form.isVacation);
      if (imageFile) fd.append('coverImage', imageFile);

      if (district) {
        await districtAPI.update(district._id, fd);
        toast.success(t('admin.districts.updated'));
      } else {
        await districtAPI.create(fd);
        toast.success(t('admin.districts.created'));
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.districts.op_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="modal-content max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-100 dark:border-dark-700">
          <h2 className="font-display font-semibold text-xl text-dark-900 dark:text-white">
            {district ? t('admin.districts.edit_title') : t('admin.districts.create_title')}
          </h2>
          <button onClick={onClose} id="close-district-modal" className="btn-ghost p-2">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="district-name">{t('admin.districts.name_label')} (English) *</label>
              <input
                id="district-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                placeholder={t('admin.districts.name_placeholder')}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="district-name-ar">Name (Arabic) *</label>
              <input
                id="district-name-ar"
                type="text"
                value={form.nameAr}
                onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                className="input"
                placeholder="الاسم بالعربية"
                dir="rtl"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="district-description">{t('admin.districts.description_label')} (English)</label>
              <textarea
                id="district-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input resize-none"
                rows={3}
                placeholder={t('admin.districts.description_placeholder')}
              />
            </div>
            <div>
              <label className="label" htmlFor="district-description-ar">Description (Arabic)</label>
              <textarea
                id="district-description-ar"
                value={form.descriptionAr}
                onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                className="input resize-none"
                rows={3}
                placeholder="وصف الحي بالعربية..."
                dir="rtl"
              />
            </div>
          </div>

          {/* Is Vacation District */}
          <div className="flex items-center gap-3 p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-900/30">
            <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                 style={{ backgroundColor: form.isVacation ? 'var(--color-primary-500)' : '#cbd5e1' }}
                 onClick={() => setForm({ ...form, isVacation: !form.isVacation })}>
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${form.isVacation ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
            <div>
              <p className="font-semibold text-dark-900 dark:text-white text-sm">
                Vacation District (Chalet / Studio only)
              </p>
              <p className="text-xs text-dark-500 dark:text-dark-400">
                If enabled, properties added to this district will be restricted to Chalets and Studios instead of regular apartments.
              </p>
            </div>
          </div>

          {/* Google Maps URL */}
          <div>
            <label className="label" htmlFor="district-maps">{t('admin.districts.maps_label')}</label>
            <input
              id="district-maps"
              type="url"
              value={form.googleMapsUrl}
              onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
              className="input"
              placeholder={t('admin.districts.maps_placeholder')}
            />
            <p className="text-xs text-dark-400 mt-1">{t('admin.districts.maps_hint')}</p>
          </div>

          {/* Cover Image */}
          <div>
            <label className="label">{t('admin.districts.cover_label')}</label>
            <div
              className="border-2 border-dashed border-dark-200 dark:border-dark-600 rounded-xl p-4 cursor-pointer hover:border-primary-400 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(''); }}
                    className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <Upload size={28} className="text-dark-400" />
                  <p className="text-sm text-dark-500 dark:text-dark-400">{t('admin.districts.upload_click')}</p>
                  <p className="text-xs text-dark-400">{t('admin.districts.upload_hint')}</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} id="district-image-upload" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              {t('admin.districts.cancel')}
            </button>
            <button type="submit" disabled={loading} id="save-district" className="btn-primary flex-1 justify-center">
              {loading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : district ? t('admin.districts.save') : t('admin.districts.create')
              }
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const AdminDistricts = () => {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  const fetchDistricts = async () => {
    setLoading(true);
    try {
      const res = await districtAPI.getAll();
      setDistricts(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Manage Districts - UniStay Admin';
    fetchDistricts();
  }, []);

  const handleDelete = async (district) => {
    setDeleting(true);
    try {
      await districtAPI.delete(district._id);
      toast.success(t('admin.districts.deleted'));
      setDeleteConfirm(null);
      fetchDistricts();
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.districts.delete_failed'));
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (district) => { setEditingDistrict(district); setModalOpen(true); };
  const openCreate = () => { setEditingDistrict(null); setModalOpen(true); };
  const handleModalSaved = () => { setModalOpen(false); fetchDistricts(); };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-dark-100 dark:border-dark-700">
        <div className="page-container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/admin" className="btn-ghost p-2"><BackIcon size={18} /></Link>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <MapPin size={20} className="text-indigo-500" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl text-dark-900 dark:text-white">
                  {t('admin.districts.title')}
                </h1>
                <p className="text-xs text-dark-400">
                  {t('admin.districts.count_other', { count: districts.length })}
                </p>
              </div>
            </div>
            <button onClick={openCreate} id="add-district-btn" className="btn-primary">
              <Plus size={16} /> {t('admin.districts.add_btn')}
            </button>
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="shimmer h-40" />
                <div className="p-4 space-y-2">
                  <div className="shimmer h-5 rounded w-3/4" />
                  <div className="shimmer h-4 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : districts.length === 0 ? (
          <div className="text-center py-20">
            <MapPin size={48} className="text-dark-300 dark:text-dark-600 mx-auto mb-4" />
            <h2 className="font-display font-semibold text-xl text-dark-700 dark:text-dark-300 mb-2">
              {t('admin.districts.empty_title')}
            </h2>
            <p className="text-dark-500 text-sm mb-6">{t('admin.districts.empty_subtitle')}</p>
            <button onClick={openCreate} className="btn-primary"><Plus size={16} /> {t('admin.districts.add_btn')}</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {districts.map((district, i) => (
              <motion.div
                key={district._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card overflow-hidden group"
              >
                {/* Image */}
                <div className="relative h-40 bg-dark-100 dark:bg-dark-700">
                  {district.coverImage ? (
                    <img src={district.coverImage} alt={district.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={32} className="text-dark-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} glass rounded-lg px-2 py-1 text-white text-xs font-medium`}>
                    {t('admin.districts.apts_badge', { count: district.apartmentCount ?? 0 })}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-display font-semibold text-dark-900 dark:text-white">{district.name}</h3>
                  {district.description && (
                    <p className="text-xs text-dark-400 mt-1 line-clamp-1">{district.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-dark-400 mt-2">
                    <span>{t('admin.districts.apartments_other', { count: district.apartmentCount ?? 0 })}</span>
                    {district.availableCount > 0 && (
                      <span className="text-emerald-500">
                        {t('admin.districts.available_other', { count: district.availableCount })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    onClick={() => openEdit(district)}
                    id={`edit-district-${district._id}`}
                    className="btn-secondary flex-1 justify-center text-xs py-2"
                  >
                    <Edit size={14} /> {t('admin.districts.edit_btn')}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(district)}
                    id={`delete-district-${district._id}`}
                    className="btn-danger flex-1 justify-center text-xs py-2"
                  >
                    <Trash2 size={14} /> {t('admin.districts.delete_btn')}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* District Modal */}
      <AnimatePresence>
        {modalOpen && (
          <DistrictModal
            district={editingDistrict}
            onClose={() => setModalOpen(false)}
            onSaved={handleModalSaved}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-content max-w-sm w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={28} className="text-red-500" />
                </div>
                <h3 className="font-display font-bold text-xl text-dark-900 dark:text-white mb-2">
                  {t('admin.districts.delete_title')}
                </h3>
                <p className="text-dark-500 dark:text-dark-400 text-sm mb-1">
                  {t('admin.districts.delete_confirm')}{' '}
                  <strong>"{deleteConfirm.name}"</strong>?
                </p>
                <p className="text-red-500 text-xs mb-6">
                  {t('admin.districts.delete_warning_other', { count: deleteConfirm.apartmentCount ?? 0 })}
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 justify-center">
                    {t('admin.districts.cancel')}
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    disabled={deleting}
                    id="confirm-delete-district"
                    className="btn-danger flex-1 justify-center"
                  >
                    {deleting
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : t('common.delete')
                    }
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDistricts;
