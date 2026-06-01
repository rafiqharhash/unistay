import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit, Trash2, X, Upload, MapPin, Building2,
  ChevronLeft, AlertCircle, Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { districtAPI } from '../../api/axios';

const DistrictModal = ({ district, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: district?.name || '',
    description: district?.description || '',
    googleMapsUrl: district?.googleMapsUrl || '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(district?.coverImage || '');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file.'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('District name is required.'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('description', form.description.trim());
      fd.append('googleMapsUrl', form.googleMapsUrl.trim());
      if (imageFile) fd.append('coverImage', imageFile);

      if (district) {
        await districtAPI.update(district._id, fd);
        toast.success('District updated!');
      } else {
        await districtAPI.create(fd);
        toast.success('District created!');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed.');
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
            {district ? 'Edit District' : 'Add New District'}
          </h2>
          <button onClick={onClose} id="close-district-modal" className="btn-ghost p-2">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="label" htmlFor="district-name">District Name *</label>
            <input
              id="district-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              placeholder="e.g., Downtown"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="label" htmlFor="district-description">Description</label>
            <textarea
              id="district-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input resize-none"
              rows={3}
              placeholder="Brief description of the district..."
            />
          </div>

          {/* Google Maps URL */}
          <div>
            <label className="label" htmlFor="district-maps">Google Maps Embed URL</label>
            <input
              id="district-maps"
              type="url"
              value={form.googleMapsUrl}
              onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
              className="input"
              placeholder="https://www.google.com/maps/embed?..."
            />
            <p className="text-xs text-dark-400 mt-1">Paste the embed URL from Google Maps (Share → Embed a map → Copy HTML, then use the src value)</p>
          </div>

          {/* Cover Image */}
          <div>
            <label className="label">Cover Image</label>
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
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <Upload size={28} className="text-dark-400" />
                  <p className="text-sm text-dark-500 dark:text-dark-400">Click to upload cover image</p>
                  <p className="text-xs text-dark-400">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} id="district-image-upload" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} id="save-district" className="btn-primary flex-1 justify-center">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : district ? 'Save Changes' : 'Create District'}
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
      toast.success('District deleted successfully.');
      setDeleteConfirm(null);
      fetchDistricts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
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
              <Link to="/admin" className="btn-ghost p-2"><ChevronLeft size={18} /></Link>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <MapPin size={20} className="text-indigo-500" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl text-dark-900 dark:text-white">Districts</h1>
                <p className="text-xs text-dark-400">{districts.length} districts total</p>
              </div>
            </div>
            <button onClick={openCreate} id="add-district-btn" className="btn-primary">
              <Plus size={16} /> Add District
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
            <h2 className="font-display font-semibold text-xl text-dark-700 dark:text-dark-300 mb-2">No Districts Yet</h2>
            <p className="text-dark-500 text-sm mb-6">Create your first district to get started.</p>
            <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add District</button>
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
                  <div className="absolute top-2 right-2 glass rounded-lg px-2 py-1 text-white text-xs font-medium">
                    {district.apartmentCount ?? 0} apts
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-display font-semibold text-dark-900 dark:text-white">{district.name}</h3>
                  {district.description && (
                    <p className="text-xs text-dark-400 mt-1 line-clamp-1">{district.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-dark-400 mt-2">
                    <span>{district.apartmentCount ?? 0} apartments</span>
                    {district.availableCount > 0 && (
                      <span className="text-emerald-500">{district.availableCount} available</span>
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
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(district)}
                    id={`delete-district-${district._id}`}
                    className="btn-danger flex-1 justify-center text-xs py-2"
                  >
                    <Trash2 size={14} /> Delete
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
                <h3 className="font-display font-bold text-xl text-dark-900 dark:text-white mb-2">Delete District?</h3>
                <p className="text-dark-500 dark:text-dark-400 text-sm mb-1">
                  Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>?
                </p>
                <p className="text-red-500 text-xs mb-6">
                  This will also delete all {deleteConfirm.apartmentCount ?? 0} apartments in this district.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    disabled={deleting}
                    id="confirm-delete-district"
                    className="btn-danger flex-1 justify-center"
                  >
                    {deleting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Delete'}
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
