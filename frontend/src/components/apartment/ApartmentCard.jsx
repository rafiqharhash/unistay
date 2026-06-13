import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, BedDouble, Users, Wind, Star,
  CheckCircle, XCircle, ChevronRight, ChevronLeft,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import CompareButton from '../comparison/CompareButton';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(price);

const ApartmentCard = ({ apartment, index = 0 }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const firstImage = apartment.images?.[0];

  const genderLabel = apartment.gender === 'male'
    ? t('apartment.male_only')
    : apartment.gender === 'female'
    ? t('apartment.female_only')
    : null;

  const genderClass = apartment.gender === 'male' ? 'badge-male' : 'badge-female';

  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="card-hover group flex flex-col overflow-hidden"
    >
      {/* Image */}
      <div className="relative overflow-hidden h-52 bg-dark-200 dark:bg-dark-700 shrink-0">
        <CompareButton apartment={apartment} />
        
        {firstImage ? (
          <img
            src={firstImage}
            alt={`Apartment ${apartment.apartmentId}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-200 to-dark-300 dark:from-dark-700 dark:to-dark-800">
            <BedDouble size={40} className="text-dark-400 dark:text-dark-600" />
          </div>
        )}

        {/* Image count badge */}
        {apartment.images?.length > 1 && (
          <div className="absolute bottom-2 end-2 glass rounded-lg px-2 py-1 flex items-center gap-1">
            <span className="text-white text-xs font-medium">
              {t('apartment.photos', { count: apartment.images.length - 1 })}
            </span>
          </div>
        )}

        {/* Featured star */}
        {apartment.featured && (
          <div className="absolute top-3 start-3 bg-amber-400 text-amber-900 rounded-full p-1.5 shadow-md">
            <Star size={12} fill="currentColor" />
          </div>
        )}

        {/* Price badge */}
        <div className="absolute top-3 end-3 bg-primary-500 text-white rounded-xl px-3 py-1.5 font-bold text-sm shadow-glow-orange">
          {formatPrice(apartment.price)}<span className="font-normal text-xs">{isRTL ? '/شهر' : '/mo'}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Floor and ID */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-display font-semibold text-base text-dark-900 dark:text-white line-clamp-1 group-hover:text-primary-500 transition-colors">
              {isRTL
                ? `الطابق ${apartment.floor}`
                : `Floor ${apartment.floor}`}
            </h3>
          </div>
          <span className="text-xs text-dark-400 dark:text-dark-500 font-mono">#{apartment.apartmentId}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-dark-500 dark:text-dark-400">
          <MapPin size={13} className="text-primary-500 shrink-0" />
          <span className="line-clamp-1">
            {apartment.buildingNo && apartment.apartmentNo
              ? t('apartment.building_apt', {
                  building: apartment.buildingNo,
                  apt: apartment.apartmentNo,
                })
              : apartment.buildingNo || apartment.apartmentNo || ''}
            {apartment.districtId?.name ? `, ${isRTL && apartment.districtId.nameAr ? apartment.districtId.nameAr : apartment.districtId.name}` : ''}
          </span>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <span className={apartment.available ? 'badge-available' : 'badge-unavailable'}>
            {apartment.available ? <CheckCircle size={11} /> : <XCircle size={11} />}
            {apartment.available ? t('apartment.available') : t('apartment.unavailable')}
          </span>
          {genderLabel && <span className={genderClass}>{genderLabel}</span>}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-sm text-dark-500 dark:text-dark-400">
          <span className="flex items-center gap-1.5">
            <BedDouble size={14} className="text-dark-400" />
            {t('apartment.room_one', { count: apartment.rooms })}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={14} className="text-dark-400" />
            {t('apartment.student_one', { count: apartment.capacity })}
          </span>
          {apartment.airConditioning && <Wind size={14} className="text-blue-500" />}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <Link
          to={`/apartments/${apartment._id}`}
          id={`apartment-card-${apartment._id}`}
          className="btn-primary w-full justify-center mt-1"
        >
          {t('apartment.view_details')}
          <ArrowIcon size={15} />
        </Link>
      </div>
    </motion.div>
  );
};

export default ApartmentCard;
