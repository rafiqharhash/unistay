import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, MapPin, BedDouble, Users, Wind,
  MessageCircle, CheckCircle, XCircle, Star, Hash, Calendar,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { apartmentAPI } from '../api/axios';
import ImageCarousel from '../components/apartment/ImageCarousel';

const formatDate = (dateStr, lang) =>
  new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const formatPrice = (price) =>
  new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(price);

const InfoChip = ({ icon: Icon, label, value, color = 'text-primary-500' }) => (
  <div className="flex items-center gap-3 p-3 bg-dark-50 dark:bg-dark-700/50 rounded-xl">
    <div className={`${color} shrink-0`}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-xs text-dark-400 dark:text-dark-500">{label}</p>
      <p className="text-sm font-semibold text-dark-800 dark:text-dark-100">{value}</p>
    </div>
  </div>
);

const ApartmentDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { isRTL, language } = useLanguage();
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  useEffect(() => {
    setLoading(true);
    apartmentAPI.getOne(id)
      .then((res) => {
        setApartment(res.data.data);
        document.title = `${res.data.data.title} - UniStay`;
      })
      .catch(() => setError(t('apartment.not_found_title')))
      .finally(() => setLoading(false));
  }, [id, t]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: apartment?.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(t('apartment.link_copied'));
      }
    } catch (_) {}
  };

  if (loading) {
    return (
      <div className="page-container py-10">
        <div className="shimmer h-8 rounded-lg w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="shimmer aspect-video rounded-2xl" />
            <div className="shimmer h-8 rounded-lg w-2/3" />
            <div className="shimmer h-4 rounded-lg w-full" />
            <div className="shimmer h-4 rounded-lg w-5/6" />
          </div>
          <div className="space-y-4">
            <div className="shimmer h-40 rounded-2xl" />
            <div className="shimmer h-32 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !apartment) {
    return (
      <div className="page-container py-20 text-center">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h1 className="section-title mb-2">{t('apartment.not_found_title')}</h1>
        <p className="text-dark-500 mb-6">{error}</p>
        <Link to="/" className="btn-primary">{t('common.go_home')}</Link>
      </div>
    );
  }

  const genderLabel = apartment.gender === 'male'
    ? t('apartment.male_only')
    : apartment.gender === 'female'
    ? t('apartment.female_only')
    : null;

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-dark-800 border-b border-dark-100 dark:border-dark-700">
        <div className="page-container py-4 flex items-center gap-2 text-sm flex-wrap">
          <Link to="/" className="text-dark-500 hover:text-primary-500 transition-colors">
            {t('apartment.home_breadcrumb')}
          </Link>
          <span className="text-dark-300">/</span>
          {apartment.districtId && (
            <>
              <Link
                to={`/districts/${apartment.districtId._id}`}
                className="text-dark-500 hover:text-primary-500 transition-colors"
              >
                {isRTL && apartment.districtId.nameAr ? apartment.districtId.nameAr : apartment.districtId.name}
              </Link>
              <span className="text-dark-300">/</span>
            </>
          )}
          <span className="text-dark-900 dark:text-white font-medium truncate max-w-xs">
            {apartment.title}
          </span>
        </div>
      </div>

      <div className="page-container py-8">
        {/* Back + Share */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to={apartment.districtId ? `/districts/${apartment.districtId._id}` : '/'}
            className="btn-ghost"
            id="back-district"
          >
            <BackIcon size={16} /> {t('apartment.back')}
          </Link>
          <button onClick={handleShare} id="share-apartment" className="btn-secondary">
            <Share2 size={15} /> {t('apartment.share')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <ImageCarousel images={apartment.images} title={apartment.title} />

            {/* Title Block */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex flex-wrap gap-2">
                  <span className={apartment.available ? 'badge-available' : 'badge-unavailable'}>
                    {apartment.available ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {apartment.available ? t('apartment.available') : t('apartment.unavailable')}
                  </span>
                  {apartment.featured && (
                    <span className="badge-featured">
                      <Star size={11} fill="currentColor" /> {t('apartment.featured_label')}
                    </span>
                  )}
                  {genderLabel && (
                    <span className={apartment.gender === 'male' ? 'badge-male' : 'badge-female'}>
                      {genderLabel}
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs text-dark-400 flex items-center gap-1">
                  <Hash size={12} />
                  {apartment.apartmentId}
                </span>
              </div>

              <h1 className="font-display font-bold text-2xl md:text-3xl text-dark-900 dark:text-white mb-2">
                {apartment.title}
              </h1>

              <div className="flex items-center gap-2 text-dark-500 dark:text-dark-400 text-sm">
                <MapPin size={14} className="text-primary-500 shrink-0" />
                <span>
                  {t('apartment.building_apt', {
                    building: apartment.buildingNo,
                    apt: apartment.apartmentNo,
                  })}
                  {apartment.districtId ? `, ${isRTL && apartment.districtId.nameAr ? apartment.districtId.nameAr : apartment.districtId.name}` : ''}
                </span>
              </div>
            </motion.div>

            {/* Info Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InfoChip
                icon={BedDouble}
                label={t('apartment.rooms_label')}
                value={t('apartment.room_one', { count: apartment.rooms })}
              />
              <InfoChip
                icon={Users}
                label={t('apartment.capacity_label')}
                value={t('apartment.student_one', { count: apartment.capacity })}
              />
              <InfoChip
                icon={Wind}
                label={t('apartment.ac_label')}
                value={apartment.airConditioning ? t('apartment.feature_included') : t('apartment.feature_not_included')}
                color={apartment.airConditioning ? 'text-blue-500' : 'text-dark-400'}
              />
            </div>

            {/* Available Beds */}
            {apartment.availableBeds > 0 && (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <BedDouble size={20} className="text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">
                    {t('apartment.beds_available_other', { count: apartment.availableBeds })}
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            {apartment.description && (
              <div>
                <h2 className="font-display font-semibold text-lg text-dark-900 dark:text-white mb-3">
                  {t('apartment.description_title')}
                </h2>
                <p className="text-dark-600 dark:text-dark-300 leading-relaxed whitespace-pre-line">
                  {apartment.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            <div>
              <h2 className="font-display font-semibold text-lg text-dark-900 dark:text-white mb-3">
                {t('apartment.amenities_title')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'wifi', label: t('apartment.wifi_label'), value: apartment.wifi },
                  { key: 'desks', label: t('apartment.desks_label'), value: apartment.desks },
                  { key: 'elevator', label: t('apartment.elevator_label'), value: apartment.elevator },
                  { key: 'garden', label: t('apartment.garden_label'), value: apartment.garden },
                  { key: 'ac', label: t('apartment.ac_label'), value: apartment.airConditioning },
                  { key: 'fans', label: t('apartment.fans_label'), value: apartment.fans },
                ].map((item) => (
                  <span
                    key={item.key}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium ${
                      item.value
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'bg-dark-50 dark:bg-dark-800 text-dark-400'
                    }`}
                  >
                    {item.value ? <CheckCircle size={13} /> : <XCircle size={13} />}
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-2 text-xs text-dark-400 dark:text-dark-500">
              <Calendar size={12} />
              {t('apartment.listed_on', { date: formatDate(apartment.createdAt, language) })}
            </div>
          </div>

          {/* Right: Price + Contact */}
          <div className="space-y-4">
            {/* Price Card */}
            <div className="card p-6 sticky top-20">
              <div className="text-center mb-5">
                <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">
                  {t('apartment.monthly_rent')}
                </p>
                <p className="font-display font-bold text-4xl text-primary-500">
                  {formatPrice(apartment.price)}
                </p>
                <p className="text-dark-400 text-sm">{t('apartment.per_month')}</p>
              </div>

              {/* District */}
              {apartment.districtId && (
                <div className="flex items-center justify-between py-3 border-t border-dark-100 dark:border-dark-700">
                  <span className="text-sm text-dark-500">{t('apartment.district_label')}</span>
                  <Link
                    to={`/districts/${apartment.districtId._id}`}
                    className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
                  >
                    {apartment.districtId.name}
                  </Link>
                </div>
              )}

              <div className="flex items-center justify-between py-3 border-t border-dark-100 dark:border-dark-700">
                <span className="text-sm text-dark-500">{t('apartment.status_label')}</span>
                <span className={apartment.available ? 'badge-available' : 'badge-unavailable'}>
                  {apartment.available ? t('apartment.available') : t('apartment.unavailable')}
                </span>
              </div>

              {/* WhatsApp CTA */}
              <div className="mt-5 pt-5 border-t border-dark-100 dark:border-dark-700">
                <a
                  href={`https://wa.me/201035396964?text=${encodeURIComponent(`Hi, I'm interested in apartment #${apartment.apartmentId}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="contact-whatsapp"
                  className="flex items-center justify-center gap-3 w-full p-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
                >
                  <MessageCircle size={20} />
                  {t('apartment.whatsapp_inquire')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentDetail;
