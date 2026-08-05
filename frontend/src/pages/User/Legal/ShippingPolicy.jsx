import React from 'react';
import Layout from '../../../components/layout/Layout';
import './Legal.css';
import { FaChevronRight } from "react-icons/fa";

const ShippingPolicy = () => {
    return (
        <Layout>
            <div className="policy-page-wrapper">

                <div className="policy-grid-layout">

                    {/* Main Content Column */}
                    <main className="policy-main-content">

                        {/* Blue Hero Banner */}
                        <section className="policy-hero-banner">
                            <div className="hero-text-content">
                                <h1>Shipping Policy</h1>
                                <p>Fast, Reliable &amp; Transparent Delivery</p>
                                <p style={{ fontSize: '0.9rem', opacity: 0.85, marginTop: '0.25rem' }}>
                                    This page explains the shipping methods, delivery timelines, charges, and conditions for orders placed on the ERONIX website.
                                </p>
                            </div>
                            <div className="hero-visual-graphics">
                                <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="20" y="40" width="100" height="50" rx="6" fill="#3A86FF" stroke="#333" strokeWidth="2" />
                                    <rect x="30" y="50" width="80" height="25" rx="3" fill="#DDB088" stroke="#333" strokeWidth="2" />
                                    <circle cx="48" cy="83" r="12" fill="#FFBE0B" stroke="#333" strokeWidth="2" />
                                    <circle cx="95" cy="83" r="12" fill="#FFBE0B" stroke="#333" strokeWidth="2" />
                                    <path d="M120 55l25 15v20H120V55z" fill="#70E000" stroke="#333" strokeWidth="2" />
                                    <path d="M130 65v10M125 70h10" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M15 70l15-15v30l-15-15z" fill="#FF0054" opacity="0.7" />
                                </svg>
                            </div>
                        </section>

                        {/* ====== COMPLETE SHIPPING POLICY CONTENT ====== */}

                        {/* Order Processing - 4 Steps */}
                        <section className="policy-card-block policy-overview-section">
                            <h2>Order Processing</h2>
                            <p className="intro-text" style={{ marginBottom: '1.5rem' }}>
                                Follow these simple steps to receive your order smoothly. We ensure a hassle-free process from checkout to delivery.
                            </p>

                            <div className="policy-steps-workflow" style={{ marginBottom: '1.5rem' }}>
                                <div className="workflow-card">
                                    <div className="card-step-num">1. Order the Product</div>
                                    <div className="card-icon-container">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                            <line x1="3" y1="6" x2="21" y2="6" />
                                            <path d="M16 10a4 4 0 0 1-8 0" />
                                        </svg>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#555', marginTop: '0.5rem' }}>Select your product &amp; specify delivery method</p>
                                </div>
                                <div className="workflow-card">
                                    <div className="card-step-num">2. Order Confirmation</div>
                                    <div className="card-icon-container">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#555', marginTop: '0.5rem' }}>You will receive an order confirmation message</p>
                                </div>
                                <div className="workflow-card">
                                    <div className="card-step-num">3. Wait for Arrival</div>
                                    <div className="card-icon-container">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#555', marginTop: '0.5rem' }}>Your order is on its way to you</p>
                                </div>
                                <div className="workflow-card">
                                    <div className="card-step-num">4. Pick Up Your Order</div>
                                    <div className="card-icon-container">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#555', marginTop: '0.5rem' }}>Pick up your order at the checkout area</p>
                                </div>
                            </div>

                            <p style={{ marginTop: '0.5rem' }}>
                                All orders are processed within <strong>2 to 4 business days</strong> (excluding weekends and public holidays) after receiving your order confirmation email. You will receive a separate notification once your order has been shipped.
                            </p>
                        </section>

                        {/* Shipping Charges */}
                        <section className="policy-card-block">
                            <h2>Shipping Charges</h2>
                            <p>
                                Shipping charges for your order are calculated automatically and displayed at checkout before payment is completed.
                            </p>
                            <p style={{ marginTop: '0.75rem' }}>
                                We offer <strong>free standard shipping</strong> on all orders above ₹499 (within India). For orders below that, a nominal fee of ₹50 applies.
                            </p>
                        </section>

                        {/* Delivery Timeline */}
                        <section className="policy-card-block">
                            <h2>Delivery Timeline</h2>
                            <p>
                                Delivery timelines may vary based on the customer's geographic location. Orders are typically delivered within <strong>3 to 12 working days</strong> from the date of dispatch.
                            </p>
                            <p style={{ marginTop: '0.75rem' }}>
                                For metro cities, delivery is usually faster (3–5 working days), while remote areas may take longer. You will receive tracking updates to monitor your shipment in real time.
                            </p>
                        </section>

                        {/* Delivery Issues */}
                        <section className="policy-card-block">
                            <h2>Delivery Issues</h2>
                            <p>
                                If you have not received your order within <strong>15 days</strong> of receiving your shipping confirmation email, please contact the Eronix support team with your name and order number, and we will look into the matter promptly.
                            </p>
                            <ul style={{ paddingLeft: '1.5rem', listStyle: 'disc', marginTop: '0.75rem' }}>
                                <li style={{ marginBottom: '0.5rem' }}>
                                    <strong>Email ID:</strong> <a href="mailto:sales@eronixtech.com" style={{ color: '#0052cc' }}>sales@eronixtech.com</a>
                                </li>
                                <li>
                                    <strong>Contact No.:</strong> <a href="tel:+918308010177" style={{ color: '#0052cc' }}>8308010177</a>
                                </li>
                            </ul>
                        </section>

                        {/* Refunds & Returns */}
                        <section className="policy-card-block">
                            <h2>Refunds &amp; Returns</h2>
                            <p>
                                If, for any reason, you are not completely satisfied with your purchase, we invite you to review our <strong>Refund and Return Policy</strong> for detailed information.
                            </p>
                            <p style={{ marginTop: '0.75rem' }}>
                                We strive to ensure every customer has a positive experience. If you have any concerns about your order, please don't hesitate to reach out to our support team.
                            </p>
                        </section>

                        {/* FAQs */}
                        <section className="policy-card-block">
                            <h2>Frequently Asked Questions</h2>
                            <div style={{ marginTop: '0.75rem' }}>
                                <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>How can I track my order?</p>
                                <p>
                                    Once your order is shipped, you will receive a <strong>tracking ID</strong> via SMS/WhatsApp/email. You can track your shipment in real time using the courier partner's tracking link.
                                </p>
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>What if my delivery is delayed?</p>
                                <p>
                                    If the delivery is delayed beyond the estimated time, please contact Eronix Support and we'll assist you immediately.
                                </p>
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Do you ship internationally?</p>
                                <p>
                                    Yes, we offer international shipping to select countries. Shipping costs and delivery times will be displayed at checkout. Please note that customs duties and taxes may apply.
                                </p>
                            </div>
                        </section>

                        {/* Contact Us */}
                        <section className="policy-card-block">
                            <h2>Contact Us</h2>
                            <p>
                                If you have any questions regarding our shipping policy, please reach out to us:
                            </p>
                            <ul style={{ paddingLeft: '1.5rem', listStyle: 'disc', marginTop: '0.5rem' }}>
                                <li style={{ marginBottom: '0.5rem' }}>
                                    <strong>Email:</strong> <a href="mailto:sales@eronixtech.com" style={{ color: '#0052cc' }}>sales@eronixtech.com</a>
                                </li>
                                <li style={{ marginBottom: '0.5rem' }}>
                                    <strong>Phone:</strong> <a href="tel:+918308010177" style={{ color: '#0052cc' }}>8308010177</a>
                                </li>
                                <li>
                                    <strong>WhatsApp:</strong> <a href="#whatsapp" style={{ color: '#0052cc' }}>Chat with us</a>
                                </li>
                            </ul>
                        </section>

                        {/* Visual Order Journey - Process Summary */}
                        <section className="policy-card-block">
                            <h2>Your Order Journey at a Glance</h2>
                            <div className="policy-steps-workflow">
                                <div className="workflow-card">
                                    <div className="card-step-num">Order Placed</div>
                                    <div className="card-icon-container">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                            <line x1="3" y1="6" x2="21" y2="6" />
                                            <path d="M16 10a4 4 0 0 1-8 0" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="workflow-card">
                                    <div className="card-step-num">Processed</div>
                                    <div className="card-icon-container">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="workflow-card">
                                    <div className="card-step-num">Dispatched</div>
                                    <div className="card-icon-container">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="workflow-card">
                                    <div className="card-step-num">Delivered</div>
                                    <div className="card-icon-container">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
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
                                    <a href="tel:+918308010177">8308010177</a>
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

export default ShippingPolicy;