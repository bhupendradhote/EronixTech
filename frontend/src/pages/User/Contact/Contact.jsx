import React from 'react';
import Layout from '../../../components/layout/Layout'; 
import './Contact.css';

const Contact = () => {
  return (
    <Layout>
      <div className="contact-page-wrapper">
        <div className="container">
          
          {/* Hero Section */}
          <section className="contact-hero">
            <div className="hero-text-content">
              <h1 className="contact-title">Contact Us</h1>
              <h3 className="contact-subtitle">Support team ready to help</h3>
              <p className="contact-desc">
                We are a highly agile and nimble footed organization which believes in a collaborative approach to solve
                problems of the world. And that is why the culture of customer feedback and satisfaction ranks high on our
                agenda. We are happy to help you round the clock to the best of our ability.
              </p>
            </div>
            <div className="hero-illustration">
              <img 
                src="https://cdni.iconscout.com/illustration/premium/thumb/customer-support-agent-4487950-3722744.png" 
                alt="Customer Support Illustration" 
              />
            </div>
          </section>

          {/* Action Cards Section */}
          <section className="contact-actions">
            {/* Assistance Card */}
            <div className="action-card">
              <div className="action-card-content">
                <div className="action-header">
                  <div className="icon-circle red-icon">
                    {/* Modern Chat Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                  </div>
                  <h4>Need Any Assistance?</h4>
                </div>
                <p>EronixTech is here to help you</p>
                <button className="btn-chat">
                  CHAT NOW
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '6px'}}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
              </div>
              <div className="action-card-illustration">
                <img 
                  src="https://cdni.iconscout.com/illustration/premium/thumb/live-chat-support-4487948-3722742.png" 
                  alt="Chat Assistance" 
                />
              </div>
            </div>

            {/* FAQ Card */}
            <div className="action-card">
              <div className="action-card-content">
                <div className="action-header">
                  <div className="icon-circle dark-icon">
                    {/* Modern FAQ Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>
                  <h4>FAQ's</h4>
                </div>
                <p>You can manage your orders in Orders section</p>
                <button className="btn-view-all">
                  VIEW ALL
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '6px'}}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
              </div>
            </div>
          </section>

          {/* Addresses Section */}
          <section className="office-addresses">
            <h2 className="section-title">Our Office Addresses</h2>
            <div className="address-grid">
              
              {/* Singapore */}
              <div className="address-card">
                <span className="badge">Headquarter</span>
                <h3 className="location-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="location-icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  Singapore
                </h3>
                <p>7 Temasek Boulevard #12-02A Suntec Tower One, 038987, Singapore</p>
              </div>

              {/* India */}
              <div className="address-card">
                <span className="badge">India Office</span>
                <h3 className="location-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="location-icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  India
                </h3>
                <p>Smartworks Corporate Park (Tower B), 1st Floor, Sector 125, Noida 201303, Uttar Pradesh</p>
              </div>

              {/* UAE */}
              <div className="address-card">
                <span className="badge">UAE Office</span>
                <h3 className="location-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="location-icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  UAE
                </h3>
                <p>Khalifa Industrial Zone (Kizad), Abu Dhabi, UAE</p>
              </div>

            </div>
          </section>

          {/* Footer Contact Info */}
          <section className="contact-footer-info">
            <div className="support-phone-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d9232d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="headset-icon">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
              </svg>
              <p>To get in touch with our customer support, call us at <strong>+91 8448233444</strong></p>
            </div>
            <p className="call-timings">Call Timings: 11:00 AM to 4:00 PM (Mon to Sat)</p>
          </section>

        </div>
      </div>
    </Layout>
  );
};

export default Contact;