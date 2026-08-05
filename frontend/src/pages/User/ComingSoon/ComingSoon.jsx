// frontend/src/pages/ComingSoon/ComingSoon.jsx

import React, { useState, useEffect } from "react";
import "./ComingSoon.css";

const ComingSoon = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Set launch date: 30 days from now
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 5);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const difference = launchDate - now;

            if (difference <= 0) {
                clearInterval(timer);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor(
                (difference % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(timer);
    }, [launchDate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setIsLoading(false);
        setIsSubmitted(true);
        setEmail("");
        setTimeout(() => setIsSubmitted(false), 4000);
    };

    return (
        <div className="coming-soon-wrap">
            {/* Hero / Main Section */}
            <section className="cs-hero">
                <div className="cs-hero-overlay">
                    <div className="cs-hero-content">
                        {/* Brand badge */}
                        <div className="cs-badge">
                            <span className="cs-badge-dot" />
                            Launching Soon
                        </div>

                        {/* Main heading */}
                        <h1 className="cs-title">
                            Something <span className="cs-highlight">Amazing</span>{" "}
                            Is Coming
                        </h1>
                        <p className="cs-subtitle">
                            We're building the future of electronics shopping.
                            Get ready for a revolutionary experience.
                        </p>

                        {/* Countdown Timer */}
                        <div className="cs-countdown">
                            <div className="cs-countdown-item">
                                <span className="cs-countdown-number">
                                    {String(timeLeft.days).padStart(2, "0")}
                                </span>
                                <span className="cs-countdown-label">Days</span>
                            </div>
                            <div className="cs-countdown-separator">:</div>
                            <div className="cs-countdown-item">
                                <span className="cs-countdown-number">
                                    {String(timeLeft.hours).padStart(2, "0")}
                                </span>
                                <span className="cs-countdown-label">Hours</span>
                            </div>
                            <div className="cs-countdown-separator">:</div>
                            <div className="cs-countdown-item">
                                <span className="cs-countdown-number">
                                    {String(timeLeft.minutes).padStart(2, "0")}
                                </span>
                                <span className="cs-countdown-label">Mins</span>
                            </div>
                            <div className="cs-countdown-separator">:</div>
                            <div className="cs-countdown-item">
                                <span className="cs-countdown-number">
                                    {String(timeLeft.seconds).padStart(2, "0")}
                                </span>
                                <span className="cs-countdown-label">Secs</span>
                            </div>
                        </div>

                        {/* Notify Form */}
                        <div className="cs-notify-wrap">
                            <p className="cs-notify-text">
                                Be the first to know when we launch
                            </p>
                            <form className="cs-notify-form" onSubmit={handleSubmit}>
                                <input
                                    type="email"
                                    className="cs-notify-input"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    className="cs-notify-btn"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="cs-loader" />
                                    ) : (
                                        "Notify Me"
                                    )}
                                </button>
                            </form>
                            {isSubmitted && (
                                <div className="cs-success-msg">
                                    ✓ You're on the list! We'll notify you at launch.
                                </div>
                            )}
                        </div>

                        {/* Social / Trust indicators */}
                        <div className="cs-social-row">
                            <span className="cs-social-label">Join the waitlist</span>
                            <div className="cs-social-icons">
                                <a href="#" className="cs-social-icon" aria-label="Facebook">
                                    <svg viewBox="0 0 24 24" width="20" height="20">
                                        <path
                                            fill="currentColor"
                                            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                                        />
                                    </svg>
                                </a>
                                <a href="#" className="cs-social-icon" aria-label="Twitter">
                                    <svg viewBox="0 0 24 24" width="20" height="20">
                                        <path
                                            fill="currentColor"
                                            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                                        />
                                    </svg>
                                </a>
                                <a href="#" className="cs-social-icon" aria-label="Instagram">
                                    <svg viewBox="0 0 24 24" width="20" height="20">
                                        <path
                                            fill="currentColor"
                                            d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
                                        />
                                    </svg>
                                </a>
                                <a href="#" className="cs-social-icon" aria-label="YouTube">
                                    <svg viewBox="0 0 24 24" width="20" height="20">
                                        <path
                                            fill="currentColor"
                                            d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                                        />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features / What's Coming Section */}
            <section className="cs-features">
                <div className="cs-features-inner">
                    <div className="cs-features-head">
                        <span className="cs-features-tag">What's Coming</span>
                        <h2 className="cs-features-title">
                            Built for the <span className="cs-highlight">Next Generation</span>
                        </h2>
                        <p className="cs-features-desc">
                            We're crafting an electronics shopping experience like never before.
                        </p>
                    </div>

                    <div className="cs-features-grid">
                        <div className="cs-feature-card">
                            <div className="cs-feature-icon">⚡</div>
                            <h3>Lightning Fast</h3>
                            <p>Blazing-fast browsing and checkout optimized for speed.</p>
                        </div>
                        <div className="cs-feature-card">
                            <div className="cs-feature-icon">🔒</div>
                            <h3>Secure Shopping</h3>
                            <p>Bank-grade encryption and secure payment gateways.</p>
                        </div>
                        <div className="cs-feature-card">
                            <div className="cs-feature-icon">📦</div>
                            <h3>Same-Day Delivery</h3>
                            <p>Get your electronics delivered within hours, not days.</p>
                        </div>
                        <div className="cs-feature-card">
                            <div className="cs-feature-icon">🎯</div>
                            <h3>Curated Selection</h3>
                            <p>Handpicked products from the world's best brands.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom Banner / CTA */}
            <section className="cs-bottom-banner">
                <div className="cs-bottom-banner-inner">
                    <div className="cs-bottom-text">
                        <h2>Ready to <span className="cs-highlight">Elevate</span> Your Tech?</h2>
                        <p>Subscribe now and get <strong>10% off</strong> your first order on launch day.</p>
                    </div>
                    <a href="#cs-notify" className="cs-bottom-btn">
                        Get Early Access
                    </a>
                </div>
            </section>

            {/* Footer note */}
            <footer className="cs-footer">
                <p>&copy; {new Date().getFullYear()} EronixTech. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default ComingSoon;