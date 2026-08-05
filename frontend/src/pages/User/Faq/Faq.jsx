import React, { useState } from 'react';
import Layout from '../../../components/layout/Layout'; 
import './Faq.css';

const faqData = {
  "Order Tracking": [
    {
      question: "How can I track the status of my order?",
      answer: "You can easily track your order by logging into your EronixTech account, going to the 'My Orders' section, and clicking on the 'Track Order' button next to your specific purchase. You will also receive SMS and email updates regarding your shipment."
    },
    {
      question: "What is the estimated delivery time for my order?",
      answer: "Delivery timelines depend on your PIN code and the product type. Generally, standard deliveries take 3-7 business days. Products labeled with '24 hrs Delivery' will be dispatched and delivered within 24 hours in eligible cities."
    },
    {
      question: "Can I change my delivery address after placing an order?",
      answer: "You can change your delivery address only if your order has not been dispatched yet. Please contact our customer support team immediately at +91 8448233444 to request an address change."
    }
  ],
  "Cancellation and Return": [
    {
      question: "How do I cancel my order?",
      answer: "To cancel an order, navigate to 'My Orders' in your dashboard. If the order has not been shipped, you will see a 'Cancel Order' button. Click it and select your reason for cancellation."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 7-day return policy for most items if they are damaged, defective, or incorrect. The items must be returned in their original packaging with all accessories, manuals, and tags intact."
    },
    {
      question: "Can I return industrial equipment if I ordered the wrong specifications?",
      answer: "Yes, you can initiate a return within the 7-day window. However, the product must be completely unused. We highly recommend double-checking voltage, dimensions, and specifications before placing heavy machinery orders."
    }
  ],
  "Refund": [
    {
      question: "When will I receive my refund after a cancellation or return?",
      answer: "Once your returned item is received and inspected at our warehouse, your refund will be processed. It typically takes 5-7 business days for the amount to reflect in your original payment source."
    },
    {
      question: "How is the refund credited?",
      answer: "Refunds are always credited back to the original method of payment (e.g., Credit Card, UPI, Net Banking). For Cash on Delivery (COD) orders, we will send you a secure link to enter your bank details for a direct NEFT transfer."
    },
    {
      question: "Will shipping charges be refunded?",
      answer: "Shipping charges are fully refunded if the cancellation happens before dispatch, or if the return is due to a defective/wrong product sent by us. If the return is due to a change of mind, shipping charges may be deducted."
    }
  ],
  "Payment Option": [
    {
      question: "What payment methods are accepted on EronixTech?",
      answer: "We accept all major Credit/Debit Cards, Net Banking, UPI (GPay, PhonePe, Paytm), and popular mobile wallets. For B2B clients, we also support NEFT/RTGS and Corporate Credit Lines (subject to approval)."
    },
    {
      question: "Is Cash on Delivery (COD) available?",
      answer: "Yes, Cash on Delivery is available for select PIN codes and for orders below a certain value threshold (typically ₹50,000). You can check COD availability on the product checkout page."
    },
    {
      question: "Do you provide GST Input Tax Credit invoices?",
      answer: "Absolutely! We are a B2B platform. To claim GST input credit, ensure you check the 'Use GST Invoice' box during checkout and enter your company's GSTIN and Billing Address. The tax invoice will be sent to your registered email."
    }
  ]
};

const Faq = () => {
  const [activeTab, setActiveTab] = useState("Order Tracking");
  const [activeAccordion, setActiveAccordion] = useState(null);

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  return (
    <Layout>
      <div className="faq-page-wrapper">
        <div className="container">
          
          {/* Hero Section */}
          <section className="faq-hero">
            <div className="faq-hero-text">
              <h1>Frequently Asked Questions</h1>
              <p>Find answers to common questions about buying, shipping, returns, and more on EronixTech.</p>
            </div>
          </section>

          <div className="faq-content-layout">
            
            {/* Tabs Sidebar */}
            <aside className="faq-tabs">
              {Object.keys(faqData).map((tabName) => (
                <button
                  key={tabName}
                  className={`faq-tab-btn ${activeTab === tabName ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tabName);
                    setActiveAccordion(null); // Reset accordion when switching tabs
                  }}
                >
                  {tabName}
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chevron-right">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              ))}
            </aside>

            {/* Accordion Content Area */}
            <main className="faq-accordion-container">
              <h2 className="faq-section-title">{activeTab}</h2>
              
              <div className="accordion-wrapper">
                {faqData[activeTab].map((faq, index) => {
                  const isOpen = activeAccordion === index;
                  return (
                    <div className={`accordion-item ${isOpen ? 'open' : ''}`} key={index}>
                      <button 
                        className="accordion-header" 
                        onClick={() => toggleAccordion(index)}
                      >
                        <h3>{faq.question}</h3>
                        <div className="icon-wrapper">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" className="vertical-line"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </div>
                      </button>
                      <div className="accordion-body" style={{ maxHeight: isOpen ? '500px' : '0' }}>
                        <div className="accordion-body-content">
                          <p>{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Still Need Help CTA */}
              <div className="still-need-help">
                <div className="help-text">
                  <h4>Still need help?</h4>
                  <p>Our customer support team is just a click away.</p>
                </div>
                <button className="btn-contact-support">Contact Support</button>
              </div>

            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Faq;