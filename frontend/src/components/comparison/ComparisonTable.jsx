import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, CheckCircle2, XCircle, MapPin, BedDouble, Users, 
  Wind, Phone, Mail, ExternalLink, Calendar, Plus, X, Wifi
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { useComparison } from '../../context/ComparisonContext';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(price);

const formatDate = (dateStr, lang) =>
  new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

// --- Table Cells ---

const CellText = ({ text }) => (
  <span className="text-sm text-dark-800 dark:text-dark-200">{text || '—'}</span>
);

const CellPrice = ({ price }) => (
  <span className="font-semibold text-primary-500">{formatPrice(price)}/mo</span>
);

const CellStatus = ({ available, t }) => (
  <span className={available ? 'badge-available' : 'badge-unavailable'}>
    {available ? t('apartment.available') : t('apartment.unavailable')}
  </span>
);

const CellBoolean = ({ value, t }) => (
  <div className="flex items-center gap-1.5">
    {value ? (
      <>
        <CheckCircle2 size={16} className="text-emerald-500" />
        <span className="text-sm text-emerald-700 dark:text-emerald-400">{t('compare.yes')}</span>
      </>
    ) : (
      <>
        <XCircle size={16} className="text-dark-400" />
        <span className="text-sm text-dark-500">{t('compare.no')}</span>
      </>
    )}
  </div>
);



const ComparisonTable = ({ apartments, showDifferencesOnly }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { removeFromCompare } = useComparison();

  // Helper to check if a specific field has differences across all selected apartments
  const hasDifference = (extractor) => {
    if (apartments.length <= 1) return true; // Show everything if only 1 apartment
    const firstValue = JSON.stringify(extractor(apartments[0]));
    return apartments.some(apt => JSON.stringify(extractor(apt)) !== firstValue);
  };

  const fields = [
    {
      id: 'price',
      label: t('compare.field_price'),
      icon: null,
      extractor: apt => apt.price,
      render: (apt) => <CellPrice price={apt.price} />
    },
    {
      id: 'district',
      label: t('compare.field_district'),
      icon: MapPin,
      extractor: apt => apt.districtId?.name || '',
      render: (apt) => <CellText text={apt.districtId?.name} />
    },
    {
      id: 'status',
      label: t('compare.field_status'),
      icon: null,
      extractor: apt => apt.available,
      render: (apt) => <CellStatus available={apt.available} t={t} />
    },
    {
      id: 'gender',
      label: t('compare.field_gender'),
      icon: Users,
      extractor: apt => apt.gender,
      render: (apt) => (
        <span className={apt.gender === 'male' ? 'badge-male' : 'badge-female'}>
          {apt.gender === 'male' ? t('apartment.male_only') : t('apartment.female_only')}
        </span>
      )
    },
    {
      id: 'rooms',
      label: t('compare.field_rooms'),
      icon: BedDouble,
      extractor: apt => apt.rooms,
      render: (apt) => <CellText text={apt.rooms} />
    },
    {
      id: 'capacity',
      label: t('compare.field_capacity'),
      icon: Users,
      extractor: apt => apt.capacity,
      render: (apt) => <CellText text={apt.capacity} />
    },
    {
      id: 'availableBeds',
      label: t('compare.field_available_beds'),
      icon: BedDouble,
      extractor: apt => apt.availableBeds,
      render: (apt) => (
        <span className={apt.availableBeds > 0 ? 'text-emerald-500 font-semibold text-sm' : 'text-dark-500 text-sm'}>
          {apt.availableBeds}
        </span>
      )
    },
    {
      id: 'wifi',
      label: t('compare.field_wifi'),
      icon: Wifi,
      extractor: apt => apt.wifi,
      render: (apt) => <CellBoolean value={apt.wifi} t={t} />
    },
    {
      id: 'desks',
      label: t('compare.field_desks'),
      icon: null,
      extractor: apt => apt.desks,
      render: (apt) => <CellBoolean value={apt.desks} t={t} />
    },
    {
      id: 'elevator',
      label: t('compare.field_elevator'),
      icon: null,
      extractor: apt => apt.elevator,
      render: (apt) => <CellBoolean value={apt.elevator} t={t} />
    },
    {
      id: 'garden',
      label: t('compare.field_garden'),
      icon: null,
      extractor: apt => apt.garden,
      render: (apt) => <CellBoolean value={apt.garden} t={t} />
    },
    {
      id: 'fans',
      label: t('compare.field_fans'),
      icon: null,
      extractor: apt => apt.fans,
      render: (apt) => <CellBoolean value={apt.fans} t={t} />
    },
    {
      id: 'ac',
      label: t('compare.field_ac'),
      icon: Wind,
      extractor: apt => apt.airConditioning,
      render: (apt) => <CellBoolean value={apt.airConditioning} t={t} />
    },
    {
      id: 'featured',
      label: t('compare.field_featured'),
      icon: null,
      extractor: apt => apt.featured,
      render: (apt) => <CellBoolean value={apt.featured} t={t} />
    },

    {
      id: 'date',
      label: t('compare.field_date'),
      icon: Calendar,
      extractor: apt => apt.createdAt,
      render: (apt) => <CellText text={formatDate(apt.createdAt, language)} />
    },
  ];

  // Filter fields based on toggle
  const visibleFields = showDifferencesOnly 
    ? fields.filter(f => hasDifference(f.extractor)) 
    : fields;

  if (visibleFields.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700">
        <CheckCircle2 size={48} className="mx-auto mb-4 text-primary-500" />
        <h3 className="font-display font-semibold text-lg text-dark-900 dark:text-white mb-2">
          {t('compare.all_same')}
        </h3>
        <p className="text-dark-500">
          {t('compare.toggle_all')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 overflow-hidden shadow-sm">
      <div className="overflow-x-auto hide-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          
          {/* Header Row (Apartment Headers) */}
          <thead>
            <tr className="bg-dark-50/50 dark:bg-dark-900/50">
              {/* Sticky First Column for Labels */}
              <th className="p-4 w-48 min-w-[12rem] bg-dark-50/95 dark:bg-dark-900/95 sticky left-0 z-10 border-r border-dark-100 dark:border-dark-700">
                <span className="text-xs font-semibold uppercase tracking-wider text-dark-500">
                  {t('compare.field_name')}
                </span>
              </th>
              
              {/* Apartment Columns */}
              {apartments.map((apt) => (
                <th key={apt._id} className="p-4 w-64 min-w-[16rem] align-top border-r border-dark-100 dark:border-dark-700 last:border-r-0">
                  <div className="relative group">
                    <button
                      onClick={() => removeFromCompare(apt._id)}
                      className="absolute top-2 right-2 w-7 h-7 bg-white dark:bg-dark-800 rounded-full shadow-sm flex items-center justify-center text-dark-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors z-10"
                      aria-label={t('compare.remove')}
                    >
                      <X size={14} />
                    </button>
                    
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-dark-100 dark:bg-dark-700 mb-3 relative">
                      {apt.images?.[0] ? (
                        <img src={apt.images[0]} alt={apt.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 size={24} className="text-dark-300" />
                        </div>
                      )}
                    </div>
                    
                    <h4 className="font-display font-semibold text-dark-900 dark:text-white line-clamp-2 mb-1">
                      {apt.title}
                    </h4>
                    <p className="text-xs text-dark-400 font-mono mb-4">#{apt.apartmentId}</p>
                    
                    <Link to={`/apartments/${apt._id}`} className="btn-secondary w-full justify-center py-2 text-xs">
                      {t('compare.view_details')} <ExternalLink size={12} />
                    </Link>
                  </div>
                </th>
              ))}
              
              {/* Empty Add Slot */}
              {apartments.length < 4 && (
                <th className="p-4 w-64 min-w-[16rem] align-top">
                  <Link to="/" className="w-full h-full min-h-[200px] border-2 border-dashed border-dark-200 dark:border-dark-700 rounded-2xl flex flex-col items-center justify-center text-dark-400 hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all group">
                    <div className="w-12 h-12 rounded-full bg-dark-50 dark:bg-dark-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 flex items-center justify-center mb-3 transition-colors">
                      <Plus size={24} />
                    </div>
                    <span className="text-sm font-medium">{t('compare.add_more')}</span>
                  </Link>
                </th>
              )}
            </tr>
          </thead>
          
          {/* Data Rows */}
          <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
            {visibleFields.map((field) => (
              <tr key={field.id} className="hover:bg-dark-50/30 dark:hover:bg-dark-800/30 transition-colors">
                {/* Field Label (Sticky) */}
                <td className="p-4 bg-white/95 dark:bg-dark-800/95 sticky left-0 z-10 border-r border-dark-100 dark:border-dark-700">
                  <div className="flex items-center gap-2">
                    {field.icon && <field.icon size={16} className="text-dark-400" />}
                    <span className="text-sm font-medium text-dark-700 dark:text-dark-300">
                      {field.label}
                    </span>
                  </div>
                </td>
                
                {/* Values */}
                {apartments.map((apt) => (
                  <td key={apt._id} className="p-4 border-r border-dark-100 dark:border-dark-700 last:border-r-0">
                    {field.render(apt)}
                  </td>
                ))}
                
                {/* Empty Cells */}
                {apartments.length < 4 && (
                  <td className="p-4 bg-dark-50/30 dark:bg-dark-900/30"></td>
                )}
              </tr>
            ))}
          </tbody>
          
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;
