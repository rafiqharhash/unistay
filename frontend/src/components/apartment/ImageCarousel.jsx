import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, Zoom } from 'swiper/modules';
import { X, ZoomIn } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';

const ImageCarousel = ({ images = [], title = '' }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    if (lightboxOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-72 bg-dark-100 dark:bg-dark-700 rounded-2xl flex items-center justify-center">
        <p className="text-dark-400 text-sm">No images available</p>
      </div>
    );
  }

  return (
    <>
      {/* Main Carousel */}
      <div className="relative rounded-2xl overflow-hidden">
        <Swiper
          modules={[Navigation, Pagination, Thumbs]}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          navigation
          pagination={{ clickable: true }}
          spaceBetween={0}
          className="w-full aspect-video"
        >
          {images.map((img, i) => (
            <SwiperSlide key={i}>
              <div className="relative w-full h-full">
                <img
                  src={img}
                  alt={`${title} - image ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
                <button
                  onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                  id={`zoom-image-${i}`}
                  className="absolute bottom-3 right-3 glass rounded-xl p-2 text-white hover:bg-white/20 transition-colors"
                  aria-label="View full size"
                >
                  <ZoomIn size={18} />
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <Swiper
          modules={[Thumbs]}
          onSwiper={setThumbsSwiper}
          spaceBetween={8}
          slidesPerView={Math.min(images.length, 5)}
          watchSlidesProgress
          className="mt-3"
        >
          {images.map((img, i) => (
            <SwiperSlide key={i} className="cursor-pointer">
              <img
                src={img}
                alt={`Thumbnail ${i + 1}`}
                className="w-full h-16 object-cover rounded-xl opacity-50 hover:opacity-100 transition-opacity duration-200 [.swiper-slide-thumb-active_&]:opacity-100 [.swiper-slide-thumb-active_&]:ring-2 [.swiper-slide-thumb-active_&]:ring-primary-500"
                loading="lazy"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            id="lightbox-close"
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 rounded-xl p-2 transition-colors"
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>
          <Swiper
            modules={[Navigation, Zoom]}
            navigation
            zoom
            initialSlide={lightboxIndex}
            className="w-full max-w-4xl max-h-screen"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, i) => (
              <SwiperSlide key={i}>
                <div className="swiper-zoom-container flex items-center justify-center h-screen">
                  <img
                    src={img}
                    alt={`${title} - ${i + 1}`}
                    className="max-w-full max-h-[90vh] object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {lightboxIndex + 1} / {images.length} — Click outside to close
          </p>
        </div>
      )}
    </>
  );
};

export default ImageCarousel;
