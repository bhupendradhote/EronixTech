import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';

// =============================================================
// PopupBanner
// Small corner-notification style popup for banners where
// banner_type === 'Popup'.
//
// • Positioned top-right, no backdrop/overlay
// • Slides in smoothly from the right
// • Close button + ESC to dismiss
// • Shows on EVERY page reload (no session persistence)
// =============================================================

const isExternalUrl = (url) => /^https?:\/\//i.test((url || '').trim());

const CloseIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PopupBanner = memo(({ banners = [], maxItems = 1, autoHideMs = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const items = Array.isArray(banners)
    ? banners.filter((b) => b && b.image_url).slice(0, maxItems)
    : [];

  // Open on every mount (i.e. every reload/navigation to home)
  useEffect(() => {
    if (items.length === 0) return;
    // Slight delay so the page paints first — smoother perceived load
    const t = setTimeout(() => setIsOpen(true), 400);
    return () => clearTimeout(t);
  }, [items.length]);

  // Smooth exit: play leave animation, then unmount
  const close = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsLeaving(false);
    }, 320);
  }, []);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  // Optional auto-hide
  useEffect(() => {
    if (!isOpen || !autoHideMs) return;
    const t = setTimeout(close, autoHideMs);
    return () => clearTimeout(t);
  }, [isOpen, autoHideMs, close]);

  if (!isOpen || items.length === 0) return null;

  const current = items[currentIndex];
  const title = current.title || 'Promotion';
  const linkUrl = (current.link_url || '').trim();

  const media = (
    <img
      src={current.image_url}
      alt={title}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );

  let mediaWrapper;
  if (linkUrl) {
    if (isExternalUrl(linkUrl)) {
      mediaWrapper = (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="popup-banner-media"
          title={title}
        >
          {media}
        </a>
      );
    } else {
      mediaWrapper = (
        <Link to={linkUrl} className="popup-banner-media" onClick={close} title={title}>
          {media}
        </Link>
      );
    }
  } else {
    mediaWrapper = <div className="popup-banner-media">{media}</div>;
  }

  return (
    <div
      className={`popup-banner-root ${isLeaving ? 'is-leaving' : 'is-entering'}`}
      role="dialog"
      aria-label={title}
    >
      <div className="popup-banner-card">
        <button
          type="button"
          className="popup-banner-close"
          onClick={close}
          aria-label="Close popup"
        >
          <CloseIcon />
        </button>

        {mediaWrapper}

        {items.length > 1 && (
          <div className="popup-banner-dots">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`popup-banner-dot ${i === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default PopupBanner;