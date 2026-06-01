import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, BedDouble, Users, Wifi, Wind, Phone, Mail,
  MessageCircle, CheckCircle, XCircle, Star, Hash, Calendar,
  ExternalLink, AlertCircle, Share2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apartmentAPI } from '../api/axios';
import ImageCarousel from '../components/apartment/ImageCarousel';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(price);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const genderLabel = { male: 'Male Only', female: 'Female Only' };
const genderClass = { male: 'badge-male', female: 'badge-female' };

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
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    apartmentAPI.getOne(id)
      .then((res) => {
        setApartment(res.data.data);
        document.title = `${res.data.data.title} - UniStay`;
      })
      .catch(() => setError('Apartment not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: apartment?.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
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
        <h1 className="section-title mb-2">Apartment Not Found</h1>
        <p className="text-dark-500 mb-6">{error}</p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-dark-800 border-b border-dark-100 dark:border-dark-700">
        <div className="page-container py-4 flex items-center gap-2 text-sm">
          <Link to="/" className="text-dark-500 hover:text-primary-500 transition-colors">Home</Link>
          <span className="text-dark-300">/</span>
          {apartment.districtId && (
            <>
              <Link to={`/districts/${apartment.districtId._id}`} className="text-dark-500 hover:text-primary-500 transition-colors">
                {apartment.districtId.name}
              </Link>
              <span className="text-dark-300">/</span>
            </>
          )}
          <span className="text-dark-900 dark:text-white font-medium truncate max-w-xs">{apartment.title}</span>
        </div>
      </div>

      <div className="page-container py-8">
        {/* Back + Share */}
        <div className="flex items-center justify-between mb-6">
          <Link to={apartment.districtId ? `/districts/${apartment.districtId._id}` : '/'} className="btn-ghost" id="back-district">
            <ArrowLeft size={16} /> Back
          </Link>
          <button onClick={handleShare} id="share-apartment" className="btn-secondary">
            <Share2 size={15} /> Share
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
                    {apartment.available ? 'Available' : 'Unavailable'}
                  </span>
                  {apartment.featured && (
                    <span className="badge-featured">
                      <Star size={11} fill="currentColor" /> Featured
                    </span>
                  )}
                  {genderLabel[apartment.gender] && (
                    <span className={genderClass[apartment.gender]}>
                      {genderLabel[apartment.gender]}
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
                <span>{apartment.location}</span>
              </div>
            </motion.div>

            {/* Info Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InfoChip icon={BedDouble} label="Rooms" value={`${apartment.rooms} room${apartment.rooms !== 1 ? 's' : ''}`} />
              <InfoChip icon={Users} label="Capacity" value={`${apartment.capacity} student${apartment.capacity !== 1 ? 's' : ''}`} />
              <InfoChip icon={Wifi} label="WiFi" value={apartment.wifi ? 'Included' : 'Not included'} color={apartment.wifi ? 'text-emerald-500' : 'text-dark-400'} />
              <InfoChip icon={Wind} label="A/C" value={apartment.airConditioning ? 'Available' : 'Not available'} color={apartment.airConditioning ? 'text-blue-500' : 'text-dark-400'} />
            </div>

            {/* Available Beds */}
            {apartment.availableBeds > 0 && (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <BedDouble size={20} className="text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">
                    {apartment.availableBeds} bed{apartment.availableBeds !== 1 ? 's' : ''} currently available
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            {apartment.description && (
              <div>
                <h2 className="font-display font-semibold text-lg text-dark-900 dark:text-white mb-3">Description</h2>
                <p className="text-dark-600 dark:text-dark-300 leading-relaxed whitespace-pre-line">
                  {apartment.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {apartment.amenities?.length > 0 && (
              <div>
                <h2 className="font-display font-semibold text-lg text-dark-900 dark:text-white mb-3">
                  Facilities & Amenities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {apartment.amenities.map((amenity) => (
                    <span key={amenity} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-xl text-sm font-medium">
                      <CheckCircle size={13} />
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Google Maps Embed */}
            {apartment.googleMapsUrl && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display font-semibold text-lg text-dark-900 dark:text-white">Location</h2>
                  <a
                    href={apartment.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    id="open-maps"
                    className="btn-ghost text-xs"
                  >
                    <ExternalLink size={13} /> Open in Maps
                  </a>
                </div>
                <div className="rounded-2xl overflow-hidden border border-dark-100 dark:border-dark-700 h-72">
                  <iframe
                    src={apartment.googleMapsUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Apartment location on Google Maps"
                  />
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center gap-2 text-xs text-dark-400 dark:text-dark-500">
              <Calendar size={12} />
              Listed on {formatDate(apartment.createdAt)}
            </div>
          </div>

          {/* Right: Price + Contact */}
          <div className="space-y-4">
            {/* Price Card */}
            <div className="card p-6 sticky top-20">
              <div className="text-center mb-5">
                <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">Monthly Rent</p>
                <p className="font-display font-bold text-4xl text-primary-500">
                  {formatPrice(apartment.price)}
                </p>
                <p className="text-dark-400 text-sm">per month</p>
              </div>

              {/* District */}
              {apartment.districtId && (
                <div className="flex items-center justify-between py-3 border-t border-dark-100 dark:border-dark-700">
                  <span className="text-sm text-dark-500">District</span>
                  <Link
                    to={`/districts/${apartment.districtId._id}`}
                    className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
                  >
                    {apartment.districtId.name}
                  </Link>
                </div>
              )}

              <div className="flex items-center justify-between py-3 border-t border-dark-100 dark:border-dark-700">
                <span className="text-sm text-dark-500">Status</span>
                <span className={apartment.available ? 'badge-available' : 'badge-unavailable'}>
                  {apartment.available ? 'Available' : 'Unavailable'}
                </span>
              </div>

              {/* Contact Section */}
              {(apartment.contactInfo?.phone || apartment.contactInfo?.email || apartment.contactInfo?.whatsapp) && (
                <div className="mt-5 pt-5 border-t border-dark-100 dark:border-dark-700">
                  <h3 className="font-semibold text-dark-800 dark:text-dark-200 mb-3 text-sm">Contact Landlord</h3>
                  <div className="space-y-2">
                    {apartment.contactInfo.phone && (
                      <a
                        href={`tel:${apartment.contactInfo.phone}`}
                        id="contact-phone"
                        className="flex items-center gap-3 p-3 bg-dark-50 dark:bg-dark-700 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
                      >
                        <Phone size={16} className="text-primary-500" />
                        <div>
                          <p className="text-xs text-dark-400">Phone</p>
                          <p className="text-sm font-medium text-dark-800 dark:text-dark-100 group-hover:text-primary-600">{apartment.contactInfo.phone}</p>
                        </div>
                      </a>
                    )}
                    {apartment.contactInfo.whatsapp && (
                      <a
                        href={`https://wa.me/${apartment.contactInfo.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        id="contact-whatsapp"
                        className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                      >
                        <MessageCircle size={16} className="text-emerald-500" />
                        <div>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">WhatsApp</p>
                          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{apartment.contactInfo.whatsapp}</p>
                        </div>
                      </a>
                    )}
                    {apartment.contactInfo.email && (
                      <a
                        href={`mailto:${apartment.contactInfo.email}`}
                        id="contact-email"
                        className="flex items-center gap-3 p-3 bg-dark-50 dark:bg-dark-700 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
                      >
                        <Mail size={16} className="text-primary-500" />
                        <div>
                          <p className="text-xs text-dark-400">Email</p>
                          <p className="text-sm font-medium text-dark-800 dark:text-dark-100 group-hover:text-primary-600">{apartment.contactInfo.email}</p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentDetail;
