import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Building2, CheckCircle } from 'lucide-react';

const DistrictCard = ({ district, index = 0 }) => {
  const fallbackGradient = `linear-gradient(135deg, #1e293b 0%, #0f172a 100%)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link
        to={`/districts/${district._id}`}
        id={`district-card-${district._id}`}
        className="group block relative overflow-hidden rounded-2xl aspect-[4/3] shadow-card-dark hover:shadow-2xl transition-all duration-500"
      >
        {/* Background Image */}
        {district.coverImage ? (
          <img
            src={district.coverImage}
            alt={district.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: fallbackGradient }}
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 group-hover:from-black/90 transition-all duration-500" />

        {/* Apartment Count Badge */}
        <div className="absolute top-4 right-4">
          <div className="glass rounded-xl px-3 py-1.5 flex items-center gap-1.5">
            <Building2 size={13} className="text-primary-400" />
            <span className="text-white text-xs font-semibold">
              {district.apartmentCount ?? 0} apts
            </span>
          </div>
        </div>

        {/* Available Badge */}
        {district.availableCount > 0 && (
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm rounded-full px-2.5 py-1">
              <CheckCircle size={11} className="text-white" />
              <span className="text-white text-xs font-medium">{district.availableCount} available</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="font-display font-bold text-xl text-white mb-1 group-hover:text-primary-300 transition-colors duration-300">
                {district.name}
              </h3>
              {district.description && (
                <p className="text-white/70 text-sm line-clamp-1">{district.description}</p>
              )}
              <div className="flex items-center gap-1.5 mt-2">
                <MapPin size={13} className="text-primary-400" />
                <span className="text-white/60 text-xs">
                  {district.apartmentCount ?? 0} listing{district.apartmentCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="bg-primary-500 group-hover:bg-primary-400 text-white rounded-xl p-2.5 transition-all duration-300 group-hover:shadow-glow-orange translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default DistrictCard;
