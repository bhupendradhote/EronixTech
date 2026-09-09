import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Static Fallback Banners (Used if API fails or returns 0 banners)
import ban1 from '../../../assets/images/banner/ban1.webp';
import ban2 from '../../../assets/images/banner/ban2.webp';
import ban3 from '../../../assets/images/banner/ban3.webp';
import ban4 from '../../../assets/images/banner/ban4.webp';

const fallbackBanners = [
  { id: 'f1', image_url: ban1, mobile_image_url: null, link_url: null, title: 'Banner 1' },
  { id: 'f2', image_url: ban2, mobile_image_url: null, link_url: null, title: 'Banner 2' },
  { id: 'f3', image_url: ban3, mobile_image_url: null, link_url: null, title: 'Banner 3' },
  { id: 'f4', image_url: ban4, mobile_image_url: null, link_url: null, title: 'Banner 4' },
];

function ResponsiveBannerImage({ banner, index }) {
  const alt = banner.title || `Banner ${index + 1}`;

  return (
    <picture className="hero-picture">
      {/* Browser loads mobile image on phones when one is available. */}
      {banner.mobile_image_url && (
        <source media="(max-width: 768px)" srcSet={banner.mobile_image_url} />
      )}

      {/* Desktop image is also the automatic fallback for old banners. */}
      <img
        src={banner.image_url}
        alt={alt}
        className="hero-banner-image"
        loading={index === 0 ? 'eager' : 'lazy'}
        fetchPriority={index === 0 ? 'high' : 'auto'}
      />
    </picture>
  );
}

function HeroBanner({ banners = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSliderHovered, setIsSliderHovered] = useState(false);

  const displayBanners = banners && banners.length > 0 ? banners : fallbackBanners;

  useEffect(() => {
    if (currentSlide >= displayBanners.length) {
      setCurrentSlide(0);
    }
  }, [displayBanners.length, currentSlide]);

  // Auto-play effect
  useEffect(() => {
    if (isSliderHovered || displayBanners.length <= 1) return;

    const autoInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
    }, 4800);

    return () => clearInterval(autoInterval);
  }, [isSliderHovered, displayBanners.length]);

  const goToSlide = (index) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + displayBanners.length) % displayBanners.length);

  const renderImage = (banner, index) => (
    <ResponsiveBannerImage banner={banner} index={index} />
  );

  return (
    <div className="hero-wrap">
      <div
        className="slider"
        id="slider"
        onMouseEnter={() => setIsSliderHovered(true)}
        onMouseLeave={() => setIsSliderHovered(false)}
      >
        <div
          className="slides"
          id="slides"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
            transition: 'transform 0.5s ease-in-out',
            display: 'flex',
          }}
        >
          {displayBanners.map((banner, index) => (
            <div className="slide" key={banner.id || index} style={{ minWidth: '100%' }}>
              {banner.link_url ? (
                banner.link_url.startsWith('http') ? (
                  <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="hero-link">
                    {renderImage(banner, index)}
                  </a>
                ) : (
                  <Link to={banner.link_url} className="hero-link">
                    {renderImage(banner, index)}
                  </Link>
                )
              ) : (
                renderImage(banner, index)
              )}
            </div>
          ))}
        </div>

        {displayBanners.length > 1 && (
          <>
            <button
              type="button"
              className="slider-btn prev"
              onClick={prevSlide}
              aria-label="Previous banner"
            >
              ‹
            </button>
            <button
              type="button"
              className="slider-btn next"
              onClick={nextSlide}
              aria-label="Next banner"
            >
              ›
            </button>

            <div className="dots">
              {displayBanners.map((_, index) => (
                <button
                  type="button"
                  key={index}
                  aria-label={`Go to banner ${index + 1}`}
                  className={`dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default HeroBanner;
