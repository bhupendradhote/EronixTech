import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Static Fallback Banners (Used if API fails or returns 0 banners)
import ban1 from '../../../assets/images/banner/ban1.webp';
import ban2 from '../../../assets/images/banner/ban2.webp';
import ban3 from '../../../assets/images/banner/ban3.webp';
import ban4 from '../../../assets/images/banner/ban4.webp';

const fallbackBanners = [
  { id: 'f1', image_url: ban1, link_url: null, title: 'Banner 1' },
  { id: 'f2', image_url: ban2, link_url: null, title: 'Banner 2' },
  { id: 'f3', image_url: ban3, link_url: null, title: 'Banner 3' },
  { id: 'f4', image_url: ban4, link_url: null, title: 'Banner 4' },
];

function HeroBanner({ banners = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSliderHovered, setIsSliderHovered] = useState(false);

  const displayBanners = banners && banners.length > 0 ? banners : fallbackBanners;

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
                  <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={banner.image_url}
                      alt={banner.title || `Banner ${index + 1}`}
                      style={{ width: '100%', display: 'block' }}
                    />
                  </a>
                ) : (
                  <Link to={banner.link_url}>
                    <img
                      src={banner.image_url}
                      alt={banner.title || `Banner ${index + 1}`}
                      style={{ width: '100%', display: 'block' }}
                    />
                  </Link>
                )
              ) : (
                <img
                  src={banner.image_url}
                  alt={banner.title || `Banner ${index + 1}`}
                  style={{ width: '100%', display: 'block' }}
                />
              )}
            </div>
          ))}
        </div>

        {displayBanners.length > 1 && (
          <>
            {/* Use the same slider-btn classes as your other sliders for consistency */}
            <button className="slider-btn prev" onClick={prevSlide}>‹</button>
            <button className="slider-btn next" onClick={nextSlide}>›</button>

            <div className="dots">
              {displayBanners.map((_, index) => (
                <button
                  key={index}
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