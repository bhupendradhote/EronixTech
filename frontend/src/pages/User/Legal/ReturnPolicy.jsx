import React, { useState } from 'react';
import Layout from '../../../components/layout/Layout';
import { FaChevronRight } from "react-icons/fa";

import './Legal.css';

const RefundPolicy = () => {
  // FAQ data
  const faqs = [
    {
      question: "My order hasn't arrived yet. Where is it?",
      answer:
        "Once your order is shipped, you will receive a tracking ID via SMS/WhatsApp/email. You can track your shipment in real time using the courier partner’s tracking link. If the delivery is delayed beyond the estimated time, please contact <strong>Eronix Support</strong> and we’ll assist you immediately."
    },
    {
      question: "What is the warranty period for electronics?",
      answer:
        "All electronic products come with a minimum 1-year manufacturer warranty, unless otherwise stated on the product page. The warranty covers manufacturing defects and hardware failures under normal usage conditions. Please refer to the product-specific warranty card for exact terms."
    },
    {
      question: "Can I return a product if I don't like it?",
      answer:
        "Yes, under our Buyback Program you can return a non-defective product within 14 days of purchase. The refund will be processed after deducting a restocking fee (15% of the product price) and any applicable shipping charges. The product must be in its original condition with all accessories and packaging."
    },
    {
      question: "How do I request a return or exchange?",
      answer:
        "Simply log in to your account, go to 'My Orders', select the order and click 'Return/Exchange'. Fill in the reason and any supporting images. Our support team will review your request and send you a return shipping label if approved. You can also reach out via WhatsApp or phone for assistance."
    },
    {
      question: "How long does it take to get my refund?",
      answer:
        "Once we receive and inspect the returned item, we will process the refund within 5–7 business days. The refund will be credited to your original payment method or as store credit (as per your preference). You'll receive a confirmation email once the refund is initiated."
    }
  ];

  // State to manage which FAQ is open; -1 means none open
  const [openFaqIndex, setOpenFaqIndex] = useState(0); // open first by default

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? -1 : index);
  };

  return (
    <Layout>
      <div className="policy-page-wrapper">
        <div className="policy-grid-layout">

          {/* Main Content Column */}
          <main className="policy-main-content">

            {/* Blue Hero Banner */}
            <section className="policy-hero-banner">
              <div className="hero-text-content">
                <h1>Cancellation, Returns & Refund Policy</h1>
                <p>Simple, Transparent & Hassle-Free Process.</p>
              </div>
              <div className="hero-visual-graphics">
                <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M45 40h45v35H45z" fill="#DDB088" stroke="#333" strokeWidth="2"/>
                  <path d="M45 40l22.5 15L90 40M45 48h45" stroke="#333" strokeWidth="2"/>
                  <rect x="100" y="50" width="55" height="35" rx="4" fill="#3A86FF" stroke="#333" strokeWidth="2"/>
                  <path d="M100 60h55M106 72h12" stroke="#333" strokeWidth="2"/>
                  <circle cx="142" cy="72" r="6" fill="#FFBE0B"/>
                  <path d="M142 69v6M140 72h4" stroke="#333" strokeWidth="1.5"/>
                  <path d="M70 25c25-15 55-15 70 5" stroke="#70E000" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M120 95C95 105 65 105 50 85" stroke="#70E000" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="42" cy="35" r="9" fill="#FF0054"/>
                  <path d="M38 31l8 8M46 31l-8 8" stroke="#fff" strokeWidth="2"/>
                </svg>
              </div>
            </section>

            {/* Policy Details Overview */}
            <section className="policy-card-block policy-overview-section">
              <h2>Overview</h2>
              <p className="intro-text">
                At Eronix Technologies, we are committed to ensuring your satisfaction with every purchase.
                If for any reason you are not completely satisfied with your order, we invite you to review
                our returns and refunds policy outlined below.
              </p>

              <div className="policy-clause">
                <h3>a) Pre-Shipment Cancellation:</h3>
                <p>
                  You may cancel your order before it is shipped. In such cases, payment gateway and
                  other applicable processing charges (minimum ₹500) will be deducted from the refund amount.
                </p>
              </div>

              <div className="policy-clause">
                <h3>b) Post-Dispatch Cancellation:</h3>
                <p>
                  If an order is cancelled after it has been dispatched, shipping charges (both to and
                  from the delivery address), along with any applicable payment gateway fees, will be
                  deducted before processing the refund.
                </p>
              </div>

              {/* Visual Process Workflow Steps */}
              <div className="policy-steps-workflow">
                <div className="workflow-card">
                  <div className="card-step-num">1. Submit a Return or Exchange Request</div>
                  <div className="card-icon-container">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                      <rect x="10" y="8" width="6" height="4" rx="1" fill="none" stroke="#0052cc" strokeWidth="1.5"/>
                    </svg>
                  </div>
                </div>

                <div className="workflow-card">
                  <div className="card-step-num">2. Pack the product safely in its original box</div>
                  <div className="card-icon-container">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16.5 9.4 7.5 4.21 12 1.69 21 6.88 16.5 9.4"/>
                      <polyline points="7.5 14.6 2.5 11.71 7 9.19 12 12.07 7.5 14.6"/>
                      <polyline points="12 22.12 3 16.93 3 11.71 12 16.9 21 11.71 21 16.93 12 22.12"/>
                      <line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                  </div>
                </div>

                <div className="workflow-card">
                  <div className="card-step-num">3. Ship the securely packed item to our return address.</div>
                  <div className="card-icon-container">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13"/>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                  </div>
                </div>

                <div className="workflow-card">
                  <div className="card-step-num">4. Receive Your Exchange or Refund</div>
                  <div className="card-icon-container">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                    </svg>
                  </div>
                </div>
              </div>
            </section>

            {/* Return and Warranty Policy Table */}
            <section className="policy-card-block warranty-table-section">
              <h2>Return and Warranty Policy</h2>
              <div className="responsive-table-container">
                <table className="policy-matrix-table">
                  <thead>
                    <tr>
                      <th>Asset Condition</th>
                      <th>Days Since Purchase ≤ 14 Days</th>
                      <th>&gt; 14 Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="condition-cell">Defective <span className="sub-text">(As per quality criteria, see Section 3.1 Quality Criteria)</span></td>
                      <td>14 Day Return Policy Applies</td>
                      <td>Eronix Warranty Applies</td>
                    </tr>
                    <tr>
                      <td className="condition-cell">Not Defective <span className="sub-text">(Customer decides to return)</span></td>
                      <td>Buyback Program Applies</td>
                      <td className="empty-cell"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Shipping Returns Information */}
            <section className="policy-card-block shipping-returns-section">
              <h2>Shipping returns</h2>
              <p className="shipping-address-text">
                To return your product, you should mail your product to: <strong>#1, Jijamata Complex, near india tea, opp. Sangameshwar College sat rasta, Solapur 413003</strong>
              </p>
              <p>
                You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
              </p>
              <p>
                Depending on where you live, the time it may take for your exchanged product to reach you may vary.
              </p>
              <p>
                If you are returning more expensive items, you may consider using a trackable shipping service or purchasing shipping insurance. We don't guarantee that we will receive your returned item.
              </p>
            </section>

            {/* FAQ Section with Multiple Items */}
            <section className="policy-card-block faq-section">
              <h2>FAQs</h2>
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className={`faq-accordion-item ${openFaqIndex === index ? 'active' : ''}`}
                >
                  <button
                    className="faq-question-trigger"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={openFaqIndex === index}
                  >
                    <span>{faq.question}</span>
                    <span className="accordion-arrow"></span>
                  </button>
                  <div className="faq-answer-content">
                    <p dangerouslySetInnerHTML={{ __html: faq.answer }} />
                  </div>
                </div>
              ))}
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#whatsapp" className="social-btn platform-wa">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.855.001-2.633-1.02-5.107-2.875-6.964C16.547 1.928 14.08 .908 11.457.908c-5.436 0-9.86 4.42-9.864 9.856-.001 1.716.452 3.39 1.308 4.869l-.993 3.628 3.71-.973z"/></svg>
                </a>
              </div>
            </div>
          </aside>

        </div> {/* End of policy-grid-layout */}

        {/* Full-width sections below the grid */}
        <div className="policy-fullwidth-sections">
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

export default RefundPolicy;