import React from 'react';
import Layout from '../../../components/layout/Layout';
import './About.css';

const IMAGES = {
  store: 'https://picsum.photos/seed/eronix-store-premium/1100/760',
  gaming: 'https://picsum.photos/seed/eronix-gaming-zone/700/500',
  service: 'https://picsum.photos/seed/eronix-service-team/700/500',
  team: 'https://picsum.photos/seed/eronix-team/1200/650',
};

const Icon = ({ type, size = 24 }) => {
  const paths = {
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    laptop: <><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20M8 16v4M16 16v4"/></>,
    game: <><path d="M6 12h4M8 10v4M15 13h.01M18 11h.01"/><path d="M17.5 6H6.5A4.5 4.5 0 0 0 2 10.5v2A5.5 5.5 0 0 0 7.5 18l2.2-2h4.6l2.2 2a5.5 5.5 0 0 0 5.5-5.5v-2A4.5 4.5 0 0 0 17.5 6Z"/></>,
    star: <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2l-5-4.9 6.9-1L12 2Z"/>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>,
    check: <><path d="M20 6 9 17l-5-5"/><circle cx="12" cy="12" r="10"/></>,
    support: <><path d="M4 13a8 8 0 0 1 16 0"/><path d="M4 13v5a2 2 0 0 0 2 2h2v-7H4ZM20 13v5a2 2 0 0 1-2 2h-2v-7h4Z"/></>,
    truck: <><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    award: <><circle cx="12" cy="8" r="5"/><path d="m8.5 12.5-1 8L12 18l4.5 2.5-1-8"/></>,
    bulb: <><path d="M9 18h6M10 22h4"/><path d="M8.4 14.5A7 7 0 1 1 15.6 14.5C14.6 15.3 14 16.5 14 18h-4c0-1.5-.6-2.7-1.6-3.5Z"/></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>,
    building: <><path d="M3 21h18M6 21V3h12v18M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  };
  return (
    <svg className="about-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[type] || paths.check}
    </svg>
  );
};

const Stat = ({ icon, value, label }) => (
  <div className="about-stat"><Icon type={icon} size={25}/><div><strong>{value}</strong><span>{label}</span></div></div>
);

const About = () => {
  const services = [
    ['laptop', 'LAPTOPS & DESKTOPS', 'Wide range of new and premium refurbished laptops and desktops for work, study and gaming.'],
    ['game', 'GAMING ZONE', 'High-performance gaming PCs and PS5 consoles for an immersive next-level experience.'],
    ['award', 'ACCESSORIES', 'Original accessories and peripherals that enhance productivity and gameplay.'],
    ['support', 'AFTER-SALES SUPPORT', 'Reliable service, warranty and technical support to keep you worry-free.'],
  ];

  const milestones = [
    ['AUG–OCT 2025', 'Started & Planned', 'calendar'],
    ['01 DEC 2025', 'Eronix Technologies Founded', 'building'],
    ['19 MAR 2026', 'Showroom Grand Opening', 'award'],
    ['MAY 2026', 'Gaming Zone Launched', 'game'],
    ['TODAY', 'Growing with 1000+ Customers', 'users'],
  ];

  const values = [
    ['shield', 'TRUST', 'We build long-term relationships with honesty and transparency.'],
    ['award', 'QUALITY', 'We deliver dependable products and memorable customer experiences.'],
    ['users', 'CUSTOMER FOCUS', 'Your satisfaction guides every decision we make.'],
    ['bulb', 'INNOVATION', 'We stay updated with the latest technology to serve you better.'],
    ['heart', 'COMMITMENT', 'We are committed to growth, support and our community.'],
  ];

  const testimonials = [
    ['Best place in Solapur for laptops and gaming. Great service and genuine products!', 'Pratik K.'],
    ['Loved the Gaming Zone! High-end PCs and consoles at the best prices.', 'Rohit S.'],
    ['Excellent after-sales support and a very friendly team.', 'Ayesha M.'],
  ];

  return (
    <Layout>
      <main className="about-page">
        <section className="about-hero about-container">
          <div className="about-hero-copy">
            <div className="about-wordmark"><strong>ERONIX</strong><span>TECHNOLOGIES</span></div>
            <h1>ABOUT <em>US</em></h1>
            <h2>Technology. Trust. Together.</h2>
            <p>Eronix Technologies is more than just a store—we are a complete technology destination. From powerful laptops and desktops to next-generation gaming experiences, we bring performance, reliability and excitement together under one roof.</p>
            <div className="about-hero-stats">
              <Stat icon="users" value="1000+" label="Happy Customers" />
              <Stat icon="laptop" value="500+" label="Laptops Sold" />
              <Stat icon="game" value="10+" label="Gaming Systems" />
              <Stat icon="star" value="4.8/5" label="Customer Rating" />
            </div>
            <div className="about-actions">
              <a href="/shop" className="about-btn primary">Explore Our Store</a>
              <a href="/game-zone" className="about-btn secondary">Visit Gaming Zone</a>
            </div>
          </div>

          <div className="about-hero-gallery">
            <div className="about-photo main"><img src={IMAGES.store} alt="Eronix technology showroom" /></div>
            <div className="about-photo gaming"><img src={IMAGES.gaming} alt="Eronix gaming zone" /></div>
            <div className="about-photo service"><img src={IMAGES.service} alt="Eronix technical service team" /></div>
          </div>
        </section>

        <section className="about-story about-container">
          <div className="about-story-copy">
            <span className="about-kicker">OUR STORY</span>
            <h2>BUILT ON PASSION,<br/>DRIVEN BY <em>PURPOSE</em></h2>
            <p>Eronix Technologies was founded with a simple vision—to deliver the best technology products and experiences with honesty, quality and reliable service.</p>
            <p>What started as a small step has grown into a trusted name in Solapur for laptops, desktops, accessories and gaming. Our journey continues with one goal: to keep our customers ahead, always.</p>
            <div className="about-story-points">
              <span><Icon type="shield"/>Quality Products</span>
              <span><Icon type="users"/>Trusted Service</span>
              <span><Icon type="check"/>Customer First</span>
            </div>
          </div>
          <div className="about-team-image"><img src={IMAGES.team} alt="Eronix Technologies team" /></div>
        </section>

        <section className="about-work-journey about-container">
          <div className="about-services">
            <span className="about-kicker">WHAT WE DO</span>
            {services.map(([icon, title, text]) => (
              <article className="about-service" key={title}>
                <i><Icon type={icon}/></i><div><h3>{title}</h3><p>{text}</p></div>
              </article>
            ))}
          </div>
          <div className="about-journey">
            <span className="about-kicker">OUR JOURNEY</span>
            <div className="about-timeline">
              {milestones.map(([date, title, icon]) => (
                <article key={date}><i><Icon type={icon}/></i><strong>{date}</strong><span>{title}</span></article>
              ))}
            </div>
            <p className="about-script">From planning to passion —</p>
            <p className="about-journey-note">every step of our journey is built with dedication and your trust.</p>
          </div>
        </section>

        <section className="about-trust-strip about-container">
          <div><Icon type="building"/><strong>GST Registered</strong><span>Legitimate & Trusted</span></div>
          <div><Icon type="lock"/><strong>Secure Payments</strong><span>100% Safe & Secure</span></div>
          <div><Icon type="shield"/><strong>Warranty Support</strong><span>Hassle-free Service</span></div>
          <div><Icon type="award"/><strong>Bajaj Finance</strong><span>EMI Options Available</span></div>
          <div><Icon type="truck"/><strong>Pan India Delivery</strong><span>Fast & Reliable</span></div>
          <div><Icon type="check"/><strong>Genuine Products</strong><span>100% Original</span></div>
        </section>

        <section className="about-values about-container">
          <div className="about-section-title"><span>OUR VALUES</span></div>
          <div className="about-values-grid">
            {values.map(([icon, title, text]) => (
              <article key={title}><Icon type={icon} size={34}/><h3>{title}</h3><p>{text}</p></article>
            ))}
          </div>
        </section>

        <section className="about-testimonials about-container">
          <div className="about-reviews">
            <span className="about-kicker light">WHAT OUR CUSTOMERS SAY</span>
            <div className="about-review-grid">
              {testimonials.map(([quote, name]) => (
                <article key={name}><div className="about-stars">★★★★★</div><p>“{quote}”</p><span>— {name}</span></article>
              ))}
            </div>
          </div>
          <div className="about-cta">
            <h2>READY TO UPGRADE<br/>YOUR TECHNOLOGY?</h2>
            <p>Shop the best laptops, accessories and gaming gear today.</p>
            <div><a href="/shop">Shop Now</a><a href="/game-zone">Visit Gaming Zone</a><a href="/contact">Contact Us</a></div>
          </div>
        </section>

        <section className="about-bottom-benefits about-container">
          <div><Icon type="check"/><span><strong>Genuine Products</strong>100% Original</span></div>
          <div><Icon type="users"/><span><strong>Trusted by 1000+</strong>Happy Customers</span></div>
          <div><Icon type="support"/><span><strong>Expert Support</strong>Always Here to Help</span></div>
          <div><Icon type="award"/><span><strong>Best Prices</strong>Unbeatable Deals</span></div>
          <div><Icon type="bulb"/><span><strong>Latest Technology</strong>Always Up-to-date</span></div>
          <div><Icon type="shield"/><span><strong>After-Sales Service</strong>We’ve Got You Covered</span></div>
        </section>
      </main>
    </Layout>
  );
};

export default About;