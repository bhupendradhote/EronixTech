import React from 'react';
import Layout from '../../../components/layout/Layout';
import { FaChevronRight } from "react-icons/fa";

import './Legal.css';

const PrivacyPolicy = () => {
    return (
        <Layout>
            <div className="policy-page-wrapper">

                <div className="policy-grid-layout">

                    {/* Main Content Column */}
                    <main className="policy-main-content">

                        {/* Hero Banner */}
                        <section className="policy-hero-banner">
                            <div className="hero-text-content">
                                <h1>Privacy Policy</h1>
                                <p>This page explains how ERONIX collects, uses, stores, and protects your personal information when you visit our website or purchase our products.</p>
                                
                            </div>
                            <div className="hero-visual-graphics">
                                <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="90" cy="60" r="35" fill="#3A86FF" stroke="#333" strokeWidth="2" />
                                    <path d="M75 60l10 10 20-20" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                                    <rect x="60" y="10" width="60" height="15" rx="4" fill="#FFBE0B" stroke="#333" strokeWidth="2" />
                                    <rect x="70" y="30" width="40" height="10" rx="2" fill="#70E000" stroke="#333" strokeWidth="2" />
                                    <path d="M90 50v20M80 60h20" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                        </section>

                        {/* ====== FULL PRIVACY POLICY CONTENT ====== */}

                        {/* Introduction / Terms of Use */}
                        <section className="policy-card-block privacy-intro">
                            <h2>Terms of Use</h2>
                            <p>
                                This privacy policy sets out how <strong>Eronix Technologies</strong> uses and protects
                                any information that you give <strong>Eronix Technologies</strong> when you visit their
                                website and/or agree to purchase from them.
                            </p>
                            <p style={{ marginTop: '0.75rem' }}>
                                <strong>Eronix Technologies</strong> is committed to ensuring that your privacy is
                                protected. Should we ask you to provide certain information by which you can be identified
                                when using this website, then you can be assured that it will only be used in accordance
                                with this privacy statement.
                            </p>
                            <p style={{ marginTop: '0.75rem' }}>
                                <strong>Eronix Technologies</strong> may change this policy from time to time by updating
                                this page. You should check this page from time to time to ensure that you adhere to
                                these changes.
                            </p>
                        </section>

                        {/* Information We Collect */}
                        <section className="policy-card-block privacy-collect">
                            <h2>We may collect the following information:</h2>
                            <ul style={{ paddingLeft: '1.5rem', listStyle: 'disc', marginTop: '0.5rem' }}>
                                <li style={{ marginBottom: '0.5rem' }}>Name</li>
                                <li style={{ marginBottom: '0.5rem' }}>Contact information including email address</li>
                                <li style={{ marginBottom: '0.5rem' }}>Demographic information such as postcode, preferences and interests, if required</li>
                                <li>Other information relevant to customer surveys and/or offers</li>
                            </ul>
                        </section>

                        {/* What We Do With Information */}
                        <section className="policy-card-block privacy-use">
                            <h2>What we do with the information we gather</h2>
                            <p>
                                We require this information to understand your needs and provide you with a better
                                service, and in particular for the following reasons:
                            </p>
                            <ul style={{ paddingLeft: '1.5rem', listStyle: 'disc', marginTop: '0.5rem' }}>
                                <li style={{ marginBottom: '0.5rem' }}>Internal record keeping.</li>
                                <li style={{ marginBottom: '0.5rem' }}>We may use the information to improve our products and services.</li>
                                <li style={{ marginBottom: '0.5rem' }}>
                                    We may periodically send promotional emails about new products, special offers or
                                    other information which we think you may find interesting using the email address
                                    which you have provided.
                                </li>
                                <li style={{ marginBottom: '0.5rem' }}>
                                    From time to time, we may also use your information to contact you for market
                                    research purposes. We may contact you by email, phone, fax or mail. We may use the
                                    information to customise the website according to your interests.
                                </li>
                            </ul>
                            <p style={{ marginTop: '0.75rem' }}>
                                We are committed to ensuring that your information is secure. In order to prevent
                                unauthorised access or disclosure, we have put in place suitable measures.
                            </p>
                        </section>

                        {/* Cookies */}
                        <section className="policy-card-block privacy-cookies">
                            <h2>How we use cookies</h2>
                            <p>
                                A cookie is a small file which asks permission to be placed on your computer's hard
                                drive. Once you agree, the file is added and the cookie helps analyze web traffic or
                                lets you know when you visit a particular site. Cookies allow web applications to
                                respond to you as an individual. The web application can tailor its operations to your
                                needs, likes and dislikes by gathering and remembering information about your preferences.
                            </p>
                            <p style={{ marginTop: '0.75rem' }}>
                                We use traffic log cookies to identify which pages are being used. This helps us analyze
                                data about webpage traffic and improve our website in order to tailor it to customer
                                needs. We only use this information for statistical analysis purposes and then the data
                                is removed from the system.
                            </p>
                            <p style={{ marginTop: '0.75rem' }}>
                                Overall, cookies help us provide you with a better website by enabling us to monitor
                                which pages you find useful and which you do not. A cookie in no way gives us access to
                                your computer or any information about you, other than the data you choose to share with
                                us.
                            </p>
                            <p style={{ marginTop: '0.75rem' }}>
                                You can choose to accept or decline cookies. Most web browsers automatically accept
                                cookies, but you can usually modify your browser settings to decline cookies if you
                                prefer. This may prevent you from taking full advantage of the website.
                            </p>
                        </section>

                        {/* Controlling Personal Information */}
                        <section className="policy-card-block privacy-control">
                            <h2>Controlling your personal information</h2>
                            <p>
                                You may choose to restrict the collection or use of your personal information in the
                                following ways:
                            </p>
                            <ul style={{ paddingLeft: '1.5rem', listStyle: 'disc', marginTop: '0.5rem' }}>
                                <li style={{ marginBottom: '0.5rem' }}>
                                    Whenever you are asked to fill in a form on the website, look for the box that you
                                    can click to indicate that you do not want the information to be used by anybody for
                                    direct marketing purposes.
                                </li>
                                <li style={{ marginBottom: '0.5rem' }}>
                                    If you have previously agreed to us using your personal information for direct
                                    marketing purposes, you may change your mind at any time by writing to or emailing us.
                                </li>
                            </ul>
                            <p style={{ marginTop: '0.75rem' }}>
                                We will not sell, distribute or lease your personal information to third parties unless
                                we have your permission or are required by law to do so. We may use your personal
                                information to send you promotional information about third parties which we think you
                                may find interesting if you tell us that you wish this to happen.
                            </p>
                            <p style={{ marginTop: '0.75rem' }}>
                                If you believe that any information we are holding on you is incorrect or incomplete,
                                please write to <strong>Shop 1, Jijamata Complex, near India Tea, opposite Sangameshwar
                                College, Saat Rasta, Solapur, Maharashtra – 413003</strong>, or contact us as soon as
                                possible. We will promptly correct any information found to be incorrect.
                            </p>
                        </section>

                        {/* Disclaimer */}
                        <section className="policy-card-block privacy-disclaimer">
                            <p style={{ fontSize: '0.95rem', color: '#444', borderLeft: '4px solid #FFBE0B', paddingLeft: '1rem' }}>
                                <strong>Disclaimer:</strong> The above content is created at Eronix Technologies'
                                sole discretion. Razorpay shall not be liable for any content provided here and shall
                                not be responsible for any claims and liability that may arise due to the merchant's
                                non-adherence to it.
                            </p>
                        </section>

                        {/* Visual Commitment Cards */}
                        <section className="policy-card-block">
                            <h2>Our Commitment to Your Privacy</h2>
                            <div className="policy-steps-workflow">
                                <div className="workflow-card">
                                    <div className="card-step-num">Data Security</div>
                                    <div className="card-icon-container">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                            <polyline points="9 12 11 14 15 10" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="workflow-card">
                                    <div className="card-step-num">Your Control</div>
                                    <div className="card-icon-container">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="workflow-card">
                                    <div className="card-step-num">Transparency</div>
                                    <div className="card-icon-container">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 6v6l4 2" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="workflow-card">
                                    <div className="card-step-num">Trust</div>
                                    <div className="card-icon-container">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </main>

                    {/* Right Sidebar Widget Column */}
                    <aside className="policy-sidebar-column">
                        <div className="help-sticky-card">
                            <h3>Need a Help?</h3>
                            <ul className="contact-links-list">
                                <li>
                                    <span className="contact-icon">📞</span>
                                    <a href="tel:+919922202003">+91- 9922202003</a>
                                </li>
                                <li>
                                    <span className="contact-icon">💬</span>
                                    <a href="#whatsapp">Whatsapp</a>
                                </li>
                                <li>
                                    <span className="contact-icon">🔔</span>
                                    <a href="#telegram">Telegram</a>
                                </li>
                                <li>
                                    <span className="contact-icon">✉️</span>
                                    <a href="mailto:sales@eronixtech.com" className="email-link">sales@eronixtech.com</a>
                                </li>
                            </ul>

                            <div className="sidebar-divider"></div>

                            <h4>Subscribe us</h4>
                            <div className="social-action-buttons">
                                <a href="#x" className="social-btn platform-x">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                </a>
                                <a href="#whatsapp" className="social-btn platform-wa">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.855.001-2.633-1.02-5.107-2.875-6.964C16.547 1.928 14.08 .908 11.457 .908c-5.436 0-9.86 4.42-9.864 9.856-.001 1.716.452 3.39 1.308 4.869l-.993 3.628 3.71-.973z" /></svg>
                                </a>
                            </div>
                        </div>
                    </aside>

                </div> {/* End of policy-grid-layout */}

                {/* Full-width sections below the grid */}
                <div className="policy-fullwidth-sections">

                    {/* Online Store Section */}
                    <section className="policy-card-block online-store-section">
                        <h2>Online store of household appliances and electronics</h2>
                        <p>
                            Eronix Technologies is not just a support hub – we are a full-fledged online store offering
                            a wide range of household appliances, consumer electronics, and smart devices. From kitchen
                            essentials like mixers, microwaves, and refrigerators to entertainment systems, laptops,
                            and smartphones, we bring you the latest technology at competitive prices.
                        </p>
                        <p>
                            Our platform is designed to make your shopping experience seamless: easy product discovery,
                            secure payment options, fast delivery, and dedicated after-sales support. Whether you're
                            upgrading your home or looking for the perfect gadget gift, Eronix has you covered.
                        </p>
                        <p>
                            We partner with leading brands and trusted suppliers to ensure quality and reliability.
                            Plus, our return and warranty policies are crafted to give you peace of mind with every
                            purchase. Explore our catalog and discover the future of home electronics today.
                        </p>
                    </section>

                    {/* Store Locations */}
                    <section className="policy-card-block store-locations-section">
                        <div className="store-cards-container">
                            <div className="store-card">
                                <h3>
                                    <FaChevronRight className="store-icon" />
                                    Bengaluru Store
                                </h3>
                                <p>
                                    Golden Green Layout, 76 5th Cross, Thurahalli Rd, opp. Jayanagar Housing Society,
                                    <br />
                                    Subramanyapura, Bengaluru, Karnataka 560061
                                </p>
                            </div>

                            <div className="store-card">
                                <h3>
                                    <FaChevronRight className="store-icon" />
                                    Solapur Store
                                </h3>
                                <p>
                                    01, Jijamata Complex, near India Tea, opp. Sangameshwar College,
                                    <br />
                                    Sat Rasta, Solapur, Maharashtra 413001, India
                                </p>
                            </div>
                        </div>
                    </section>

                </div>

            </div>
        </Layout>
    );
};

export default PrivacyPolicy;