import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit, Trash2, X, Upload, Building2, Star, Check,
  ChevronLeft, ChevronRight, AlertCircle, Search, Hash, Filter,
  CheckCircle, XCircle, ToggleLeft, ToggleRight, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { apartmentAPI, districtAPI } from '../../api/axios';

const isVideo = (url) => {
  if (!url) return false;
  // Check file extensions
  if (url.match(/\.(mp4|webm|mov|mkv)(\?.*)?$/i)) return true;
  // Cloudinary video URLs contain /video/ in the path
  if (url.includes('res.cloudinary.com') && url.includes('/video/')) return true;
  return false;
};

const formatPrice = (p) =>
  new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(p);



// ─── Apartment Modal ──────────────────────────────────────────────────────────

const ApartmentModal = ({ apartment, districts, onClose, onSaved }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const [form, setForm] = useState({
    apartmentId: apartment?.apartmentId || '',
    districtId: apartment?.districtId?._id || apartment?.districtId || '',
    floor: apartment?.floor || 1,
    description: apartment?.description || '',
    buildingNo: apartment?.buildingNo || '',
    apartmentNo: apartment?.apartmentNo || '',
    price: apartment?.price || '',
    rooms: apartment?.rooms || '',
    capacity: apartment?.capacity || 1,
    gender: apartment?.gender || 'mixed',
    wifi: apartment?.wifi || false,
    desks: apartment?.desks || false,
    elevator: apartment?.elevator || false,
    garden: apartment?.garden || false,
    airConditioning: apartment?.airConditioning || false,
    fans: apartment?.fans || false,
    availableBeds: apartment?.availableBeds || 0,
    available: apartment?.available ?? true,
    featured: apartment?.featured || false,
    contactPhone: apartment?.contactInfo?.phone || '',
    contactWhatsapp: apartment?.contactInfo?.whatsapp || '',
    contactEmail: apartment?.contactInfo?.email || '',
  });

  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState(apartment?.images || []);
  const [loading, setLoading] = useState(false);
  const [amenityInput, setAmenityInput] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const fileRef = useRef();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Check total count limit
    if (existingImages.length + newFiles.length + files.length > 25) {
      const msg = t('admin.apartments.max_images', { defaultValue: 'Maximum 25 images allowed.' });
      toast.error(msg === 'admin.apartments.max_images' ? 'Maximum 25 images allowed.' : msg);
      return;
    }

    const validFiles = files.filter((f) => {
      // Check file size (limit to 4MB to avoid HTTP/2 proxy limits on Railway)
      if (f.size > 4 * 1024 * 1024) {
        toast.error(`${f.name} is larger than 4MB and was skipped.`);
        return false;
      }
      return f.type.startsWith('image/') || f.type.startsWith('video/');
    });

    if (validFiles.length !== files.length) toast.error(t('admin.apartments.some_skipped'));
    setNewFiles((prev) => [...prev, ...validFiles]);
    setNewPreviews((prev) => [...prev, ...validFiles.map((f) => URL.createObjectURL(f))]);

    // Reset file input so same files can be selected again if needed
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeNewImage = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.apartmentId || !form.districtId || !form.floor || !form.price || !form.rooms || !form.buildingNo || !form.apartmentNo) {
      toast.error(t('admin.apartments.fill_required'));
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      if (form.apartmentId) fd.append('apartmentId', form.apartmentId);
      fd.append('districtId', form.districtId);
      fd.append('floor', form.floor);
      fd.append('description', form.description);
      fd.append('buildingNo', form.buildingNo);
      fd.append('apartmentNo', form.apartmentNo);
      fd.append('price', form.price);
      fd.append('rooms', form.rooms);
      fd.append('capacity', form.capacity);
      fd.append('gender', form.gender);
      fd.append('wifi', form.wifi);
      fd.append('desks', form.desks);
      fd.append('elevator', form.elevator);
      fd.append('garden', form.garden);
      fd.append('airConditioning', form.airConditioning);
      fd.append('fans', form.fans);
      fd.append('availableBeds', form.availableBeds);
      fd.append('available', form.available);
      fd.append('featured', form.featured);
      fd.append('contactInfo', JSON.stringify({
        phone: form.contactPhone || '',
        whatsapp: form.contactWhatsapp || '',
        email: form.contactEmail || '',
      }));
      if (apartment) {
        fd.append('existingImages', JSON.stringify(existingImages));
      }

      // Upload new files one by one to avoid large payloads that crash the server
      const uploadedImageUrls = [];
      if (newFiles.length > 0) {
        toast.info(t('admin.apartments.uploading_images', { defaultValue: 'Uploading images...' }));
        for (let i = 0; i < newFiles.length; i++) {
          const imageFd = new FormData();
          imageFd.append('image', newFiles[i]);
          const response = await apartmentAPI.uploadImage(imageFd);
          if (response.data?.success && response.data?.data) {
            uploadedImageUrls.push(response.data.data);
          }
        }
      }
      
      // Append the successfully uploaded new image URLs
      if (uploadedImageUrls.length > 0) {
        fd.append('uploadedImages', JSON.stringify(uploadedImageUrls));
      }

      if (apartment) {
        await apartmentAPI.update(apartment._id, fd);
        toast.success(t('admin.apartments.updated'));
      } else {
        await apartmentAPI.create(fd);
        toast.success(t('admin.apartments.created'));
      }
      onSaved();
    } catch (err) {
      console.error('API Error:', err);
      if (err.response) {
        console.error('Response Data:', err.response.data);
      }
      
      // express-validator returns errors array, Mongoose returns message
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        t('admin.apartments.op_failed');
      toast.error(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: t('admin.apartments.tab_basic') },
    { id: 'details', label: t('admin.apartments.tab_details') },
    { id: 'images', label: t('admin.apartments.tab_images') },
  ];

  const toggleFields = [
    { key: 'wifi', label: t('admin.apartments.wifi_toggle') },
    { key: 'desks', label: t('admin.apartments.desks_toggle') },
    { key: 'elevator', label: t('admin.apartments.elevator_toggle') },
    { key: 'garden', label: t('admin.apartments.garden_toggle') },
    { key: 'airConditioning', label: t('admin.apartments.ac_toggle') },
    { key: 'fans', label: t('admin.apartments.fans_toggle') },
    { key: 'available', label: t('admin.apartments.available_toggle') },
    { key: 'featured', label: t('admin.apartments.featured_toggle') },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="modal-content max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-100 dark:border-dark-700 sticky top-0 bg-white dark:bg-dark-800 z-10">
          <h2 className="font-display font-semibold text-xl text-dark-900 dark:text-white">
            {apartment ? t('admin.apartments.edit_title') : t('admin.apartments.create_title')}
          </h2>
          <button onClick={onClose} id="close-apartment-modal" className="btn-ghost p-2"><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-dark-100 dark:border-dark-700 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              id={`tab-${tab.id}`}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-dark-500 hover:text-dark-700 dark:hover:text-dark-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* ── Basic Info Tab ── */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="apt-id">{t('admin.apartments.id_label')}</label>
                    <div className="relative">
                      <Hash
                        size={14}
                        className={`absolute top-1/2 -translate-y-1/2 text-dark-400 ${isRTL ? 'right-3' : 'left-3'}`}
                      />
                      <input
                        id="apt-id"
                        type="text"
                        value={form.apartmentId}
                        onChange={(e) => setForm({ ...form, apartmentId: e.target.value })}
                        className={`input uppercase bg-white dark:bg-dark-900 text-dark-900 dark:text-white ${isRTL ? 'pr-8' : 'pl-8'}`}
                        placeholder={t('admin.apartments.id_placeholder', { defaultValue: 'Enter Apartment ID (e.g. A12)' })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label" htmlFor="apt-district">{t('admin.apartments.district_label')}</label>
                    <div className="relative">
                      <select
                        id="apt-district"
                        value={form.districtId}
                        onChange={(e) => setForm({ ...form, districtId: e.target.value })}
                        className="input appearance-none"
                        required
                      >
                        <option value="">{t('admin.apartments.select_district')}</option>
                        {districts.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                      </select>
                      <ChevronDown
                        size={14}
                        className={`absolute top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none ${isRTL ? 'left-3' : 'right-3'}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label" htmlFor="apt-floor">{t('admin.apartments.floor_label')}</label>
                    <input
                      id="apt-floor"
                      type="number"
                      min={1}
                      max={20}
                      value={form.floor}
                      onChange={(e) => setForm({ ...form, floor: e.target.value })}
                      className="input"
                      placeholder={t('admin.apartments.floor_placeholder')}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="apt-description">{t('admin.apartments.description_label')}</label>
                  <textarea
                    id="apt-description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input resize-none"
                    rows={4}
                    placeholder={t('admin.apartments.description_placeholder')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="apt-building">{t('admin.apartments.building_label')}</label>
                    <input
                      id="apt-building"
                      type="text"
                      value={form.buildingNo}
                      onChange={(e) => setForm({ ...form, buildingNo: e.target.value })}
                      className="input"
                      placeholder={t('admin.apartments.building_placeholder')}
                      required
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="apt-number">{t('admin.apartments.apt_number_label')}</label>
                    <input
                      id="apt-number"
                      type="text"
                      value={form.apartmentNo}
                      onChange={(e) => setForm({ ...form, apartmentNo: e.target.value })}
                      className="input"
                      placeholder={t('admin.apartments.apt_number_placeholder')}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="apt-price">{t('admin.apartments.price_label')}</label>
                    <input
                      id="apt-price"
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="input"
                      placeholder={t('admin.apartments.price_placeholder')}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="apt-rooms">{t('admin.apartments.rooms_label')}</label>
                    <input
                      id="apt-rooms"
                      type="number"
                      value={form.rooms}
                      onChange={(e) => setForm({ ...form, rooms: e.target.value })}
                      className="input"
                      placeholder={t('admin.apartments.rooms_placeholder')}
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Details Tab ── */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="apt-capacity">{t('admin.apartments.capacity_label')}</label>
                    <input id="apt-capacity" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="input" min="1" />
                  </div>
                  <div>
                    <label className="label" htmlFor="apt-available-beds">{t('admin.apartments.available_beds_label')}</label>
                    <input id="apt-available-beds" type="number" value={form.availableBeds} onChange={(e) => setForm({ ...form, availableBeds: e.target.value })} className="input" min="0" />
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="apt-gender">{t('admin.apartments.gender_label')}</label>
                  <div className="relative">
                    <select
                      id="apt-gender"
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="input appearance-none"
                    >
                      <option value="mixed">{t('admin.apartments.mixed')}</option>
                      <option value="male">{t('admin.apartments.male_only')}</option>
                      <option value="female">{t('admin.apartments.female_only')}</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className={`absolute top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none ${isRTL ? 'left-3' : 'right-3'}`}
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-2 gap-3">
                  {toggleFields.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      id={`toggle-${key}`}
                      onClick={() => setForm({ ...form, [key]: !form[key] })}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${form[key]
                          ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'border-dark-200 dark:border-dark-600 text-dark-500 dark:text-dark-400'
                        }`}
                    >
                      <span className="text-sm font-medium">{label}</span>
                      {form[key] ? <ToggleRight size={22} className="text-primary-500" /> : <ToggleLeft size={22} />}
                    </button>
                  ))}
                </div>

              </div>
            )}

            {/* ── Images Tab ── */}
            {activeTab === 'images' && (
              <div className="space-y-4">
                {existingImages.length > 0 && (
                  <div>
                    <label className="label">{t('admin.apartments.current_images', { count: existingImages.length })}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {existingImages.map((url, i) => (
                        <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-dark-100 dark:bg-dark-700">
                          {isVideo(url) ? (
                            <video src={url} className="w-full h-full object-cover" muted />
                          ) : (
                            <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => removeExistingImage(i)}
                            id={`remove-existing-img-${i}`}
                            className={`absolute top-1 ${isRTL ? 'left-1' : 'right-1'} bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600`}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="label">{t('admin.apartments.add_images')}</label>
                  <div
                    className="border-2 border-dashed border-dark-200 dark:border-dark-600 rounded-xl p-6 cursor-pointer hover:border-primary-400 transition-colors text-center"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload size={28} className="text-dark-400 mx-auto mb-2" />
                    <p className="text-sm text-dark-500 dark:text-dark-400">{t('admin.apartments.upload_click')}</p>
                    <p className="text-xs text-dark-400 mt-1">{t('admin.apartments.upload_hint')}</p>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleImageChange} id="apartment-image-upload" />

                  {newPreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {newPreviews.map((src, i) => (
                        <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-dark-100 dark:bg-dark-700">
                          {newFiles[i]?.type.startsWith('video/') ? (
                            <video src={src} className="w-full h-full object-cover" muted />
                          ) : (
                            <img src={src} alt={`New ${i + 1}`} className="w-full h-full object-cover" />
                          )}
                          <div className={`absolute top-1 ${isRTL ? 'right-1' : 'left-1'} bg-primary-500 text-white text-xs rounded px-1.5 py-0.5`}>
                            {t('admin.apartments.new_badge')}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeNewImage(i)}
                            className={`absolute top-1 ${isRTL ? 'left-1' : 'right-1'} bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600`}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Contact Tab ── */}
            {activeTab === 'contact' && (
              <div className="space-y-4">
                <div>
                  <label className="label" htmlFor="contact-phone">{t('admin.apartments.phone_label')}</label>
                  <input id="contact-phone" type="tel" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className="input" placeholder={t('admin.apartments.phone_placeholder')} />
                </div>
                <div>
                  <label className="label" htmlFor="contact-whatsapp">{t('admin.apartments.whatsapp_label')}</label>
                  <input id="contact-whatsapp" type="tel" value={form.contactWhatsapp} onChange={(e) => setForm({ ...form, contactWhatsapp: e.target.value })} className="input" placeholder={t('admin.apartments.whatsapp_placeholder')} />
                  <p className="text-xs text-dark-400 mt-1">{t('admin.apartments.whatsapp_hint')}</p>
                </div>
                <div>
                  <label className="label" htmlFor="contact-email">{t('admin.apartments.email_label')}</label>
                  <input id="contact-email" type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="input" placeholder={t('admin.apartments.email_placeholder')} />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 p-6 border-t border-dark-100 dark:border-dark-700 sticky bottom-0 bg-white dark:bg-dark-800">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              {t('admin.apartments.cancel')}
            </button>
            <button type="submit" disabled={loading} id="save-apartment" className="btn-primary flex-1 justify-center">
              {loading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : apartment ? t('admin.apartments.save') : t('admin.apartments.create')
              }
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AdminApartments = () => {
  const [apartments, setApartments] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApartment, setEditingApartment] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  const fetchAll = async (page = 1, searchStr = search) => {
    setLoading(true);
    try {
      const [aptRes, distRes] = await Promise.all([
        apartmentAPI.getAll({ page, limit: 10, search: searchStr }),
        districtAPI.getAll(),
      ]);
      setApartments(aptRes.data.data || []);
      setPagination(aptRes.data.pagination || {});
      setDistricts(distRes.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Manage Apartments - UniStay Admin';
    fetchAll();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAll(1, search);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchAll(page, search);
  };

  const handleDelete = async (apt) => {
    setDeleting(true);
    try {
      await apartmentAPI.delete(apt._id);
      toast.success(t('admin.apartments.deleted'));
      setDeleteConfirm(null);
      fetchAll(currentPage, search);
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.apartments.delete_failed'));
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleFeatured = async (apt) => {
    try {
      await apartmentAPI.toggleFeatured(apt._id);
      toast.success(apt.featured ? t('admin.apartments.featured_removed') : t('admin.apartments.featured_added'));
      fetchAll(currentPage, search);
    } catch {
      toast.error(t('admin.apartments.update_failed'));
    }
  };

  const handleToggleAvailable = async (apt) => {
    try {
      await apartmentAPI.toggleAvailable(apt._id);
      toast.success(apt.available ? t('admin.apartments.marked_unavailable') : t('admin.apartments.marked_available'));
      fetchAll(currentPage, search);
    } catch {
      toast.error(t('admin.apartments.update_failed'));
    }
  };

  const openEdit = (apt) => { setEditingApartment(apt); setModalOpen(true); };
  const openCreate = () => { setEditingApartment(null); setModalOpen(true); };
  const handleModalSaved = () => { setModalOpen(false); fetchAll(currentPage, search); };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-dark-100 dark:border-dark-700">
        <div className="page-container py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link to="/admin" className="btn-ghost p-2"><BackIcon size={18} /></Link>
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                <Building2 size={20} className="text-primary-500" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl text-dark-900 dark:text-white">
                  {t('admin.apartments.title')}
                </h1>
                <p className="text-xs text-dark-400">
                  {t('admin.apartments.count_other', { count: pagination.total ?? 0 })}
                </p>
              </div>
            </div>
            <button onClick={openCreate} id="add-apartment-btn" className="btn-primary">
              <Plus size={16} /> {t('admin.apartments.add_btn')}
            </button>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="mt-4 flex gap-2 max-w-sm">
            <div className="relative flex-1">
              <Search
                size={15}
                className={`absolute top-1/2 -translate-y-1/2 text-dark-400 ${isRTL ? 'right-3' : 'left-3'}`}
              />
              <input
                id="admin-search-apartments"
                type="text"
                placeholder={t('admin.apartments.search_placeholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`input py-2 text-sm ${isRTL ? 'pr-9' : 'pl-9'}`}
              />
            </div>
            <button type="submit" className="btn-secondary py-2 px-4 text-sm">
              <Filter size={14} /> {t('admin.apartments.filter_btn')}
            </button>
          </form>
        </div>
      </div>

      <div className="page-container py-6">
        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-100 dark:border-dark-700 bg-dark-50 dark:bg-dark-700/50">
                  <th className="text-start px-4 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">
                    {t('admin.apartments.col_apartment')}
                  </th>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider hidden sm:table-cell">
                    {t('admin.apartments.col_district')}
                  </th>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider hidden md:table-cell">
                    {t('admin.apartments.col_price')}
                  </th>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider hidden lg:table-cell">
                    {t('admin.apartments.col_status')}
                  </th>
                  <th className="text-end px-4 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">
                    {t('admin.apartments.col_actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="shimmer w-10 h-10 rounded-lg" /><div className="space-y-1"><div className="shimmer h-4 rounded w-32" /><div className="shimmer h-3 rounded w-20" /></div></div></td>
                      <td className="px-4 py-3 hidden sm:table-cell"><div className="shimmer h-4 rounded w-24" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><div className="shimmer h-4 rounded w-16" /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><div className="shimmer h-6 rounded-full w-20" /></td>
                      <td className="px-4 py-3"><div className="shimmer h-8 rounded-lg w-24 ms-auto" /></td>
                    </tr>
                  ))
                ) : apartments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center text-dark-400">
                      <Building2 size={36} className="mx-auto mb-2 text-dark-300 dark:text-dark-600" />
                      <p>{t('admin.apartments.no_apartments')}</p>
                      <button onClick={openCreate} className="btn-primary mt-4">
                        <Plus size={15} /> {t('admin.apartments.add_first')}
                      </button>
                    </td>
                  </tr>
                ) : (
                  apartments.map((apt) => (
                    <tr key={apt._id} className="hover:bg-dark-50 dark:hover:bg-dark-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-100 dark:bg-dark-700 shrink-0">
                            {apt.images?.[0] ? (
                              isVideo(apt.images[0]) ? (
                                <video src={apt.images[0]} className="w-full h-full object-cover" muted />
                              ) : (
                                <img src={apt.images[0]} alt={`Apartment ${apt.apartmentId}`} className="w-full h-full object-cover" />
                              )
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Building2 size={14} className="text-dark-400" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-dark-800 dark:text-dark-100 truncate max-w-[160px]">Floor {apt.floor}</p>
                            <p className="text-xs text-dark-400 font-mono">#{apt.apartmentId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-dark-600 dark:text-dark-300">{apt.districtId?.name || '—'}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="font-semibold text-primary-500">{formatPrice(apt.price)}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleToggleAvailable(apt)}
                            id={`toggle-available-${apt._id}`}
                            title="Toggle availability"
                            className={apt.available ? 'badge-available cursor-pointer hover:opacity-75 transition-opacity' : 'badge-unavailable cursor-pointer hover:opacity-75 transition-opacity'}
                          >
                            {apt.available ? <CheckCircle size={11} /> : <XCircle size={11} />}
                            {apt.available ? t('admin.apartments.available') : t('admin.apartments.unavailable')}
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(apt)}
                            id={`toggle-featured-${apt._id}`}
                            title="Toggle featured"
                            className={`badge cursor-pointer hover:opacity-75 transition-opacity ${apt.featured ? 'badge-featured' : 'bg-dark-100 dark:bg-dark-700 text-dark-400'}`}
                          >
                            <Star size={11} fill={apt.featured ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(apt)}
                            id={`edit-apt-${apt._id}`}
                            className="p-1.5 rounded-lg text-dark-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(apt)}
                            id={`delete-apt-${apt._id}`}
                            className="p-1.5 rounded-lg text-dark-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-dark-500">
            <span>
              {t('admin.apartments.showing', {
                shown: apartments.length,
                total: pagination.total,
              })}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  id={`admin-page-${page}`}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${page === currentPage ? 'bg-primary-500 text-white' : 'btn-ghost'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Apartment Modal */}
      <AnimatePresence>
        {modalOpen && (
          <ApartmentModal
            apartment={editingApartment}
            districts={districts}
            onClose={() => setModalOpen(false)}
            onSaved={handleModalSaved}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
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
                  {t('admin.apartments.delete_title')}
                </h3>
                <p className="text-dark-500 dark:text-dark-400 text-sm mb-6">
                  {t('admin.apartments.delete_confirm')}{' '}
                  <strong>"Floor {deleteConfirm.floor} #{deleteConfirm.apartmentId}"</strong>?{' '}
                  {t('admin.apartments.delete_warning')}
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 justify-center">
                    {t('admin.apartments.cancel')}
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    disabled={deleting}
                    id="confirm-delete-apartment"
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

export default AdminApartments;
