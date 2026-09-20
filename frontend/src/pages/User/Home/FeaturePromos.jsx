import React, { memo } from 'react';
import { Link } from 'react-router-dom';

// =============================================================
// FeaturePromos
// Renders the "home-feature-promos" strip from dynamic banners
// where banner_type === 'Promotional'.
// Mirrors the API of HeroBanner so it can be dropped in the same
// way — receives an already-normalised `banners` array.
// =============================================================

const isExternalUrl = (url) => /^https?:\/\//i.test((url || '').trim());

const FeaturePromos = memo(({
  banners = [],
  maxItems = 3,
  ariaLabel = 'Featured offers',
}) => {
  const promos = Array.isArray(banners) ? banners.slice(0, maxItems) : [];

  // Nothing to render — collapse the section entirely so the layout
  // doesn't leave an empty gap.
  if (promos.length === 0) return null;

  return (
    <section className="home-feature-promos" aria-label={ariaLabel}>
      {promos.map((banner) => {
        if (!banner || !banner.image_url) return null;

        const title = banner.title || 'Promotion';
        const linkUrl = (banner.link_url || '').trim() || '#';

        const inner = (
          <picture>
            {banner.mobile_image_url && (
              <source
                media="(max-width: 640px)"
                srcSet={banner.mobile_image_url}
              />
            )}
            <img
              src={banner.image_url}
              alt={title}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                // Hide the broken image rather than showing the alt text
                e.currentTarget.style.display = 'none';
              }}
            />
          </picture>
        );

        // External URLs (like the admin panel link in the sample data)
        // open in a new tab; internal paths use React Router's <Link>.
        if (isExternalUrl(linkUrl)) {
          return (
            <a
              key={banner.id ?? title}
              href={linkUrl}
              className="home-feature-promo-card"
              target="_blank"
              rel="noopener noreferrer"
              title={title}
            >
              {inner}
            </a>
          );
        }

        return (
          <Link
            key={banner.id ?? title}
            to={linkUrl}
            className="home-feature-promo-card"
            title={title}
          >
            {inner}
          </Link>
        );
      })}
    </section>
  );
});

export default FeaturePromos;