import React, { useState } from 'react';
import {
  FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiFacebook,
  FiTwitter, FiInstagram, FiYoutube, FiCheckCircle, FiMessageCircle,
  FiHeadphones, FiAward, FiGlobe
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import GameZoneLayout from '../../../components/layout/GameZoneLayout';
import '../../GameZone/GamingZone.css'; 


// Fallback image handler
const handleImageError = (e) => {
  e.target.onerror = null;
  e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=800&fit=crop';
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      setFormStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setIsSubmitting(false);
      setTimeout(() => setFormStatus(null), 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <FiMapPin />,
      title: 'Visit Us',
      details: ['Eronix Gaming Zone, 3rd Floor, Gameplex Mall, Andheri East, Mumbai - 400069']
    },
    {
      icon: <FiPhone />,
      title: 'Call Us',
      details: ['+91 98765 43210', '+91 22 4123 4567']
    },
    {
      icon: <FiMail />,
      title: 'Email Us',
      details: ['support@eronixgaming.com', 'bookings@eronixgaming.com']
    },
    {
      icon: <FiClock />,
      title: 'Opening Hours',
      details: ['Monday - Friday: 10 AM – 12 AM', 'Saturday - Sunday: 9 AM – 2 AM']
    }
  ];

  const faqs = [
    { q: 'Do I need to book in advance?', a: 'Walk-ins are welcome, but we recommend booking online to secure your preferred time slot.' },
    { q: 'Can I bring my own peripherals?', a: 'Yes! You can use your own mouse, keyboard, or headset. Our systems are plug-and-play.' },
    { q: 'Do you host birthday parties?', a: 'Absolutely! Contact us for custom group packages and party bookings.' },
    { q: 'What payment methods are accepted?', a: 'We accept UPI, cards, cash, and Eronix Wallet.' }
  ];

  return (
    <GameZoneLayout>
      <div className="contact-page">

        {/* Hero Section */}
        <div className="contact-hero">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="hero-badge"><FiMessageCircle /> GET IN TOUCH</div>
            <h1 className="hero-title">WE'RE HERE TO<br /><span className="highlight">HELP YOU GAME</span></h1>
            <p className="hero-desc">Have questions about bookings, tournaments, or our gaming lounge? Reach out to us anytime.</p>
            <div className="hero-highlights">
              <div className="highlight-item"><FiHeadphones /> 24/7 Support</div>
              <div className="highlight-item"><FaWhatsapp /> WhatsApp Chat</div>
              <div className="highlight-item"><FiClock /> Instant Response</div>
            </div>
          </div>
        </div>

        {/* Contact Info Cards */}
        <div className="contact-info-section container">
          <div className="info-grid">
            {contactInfo.map((info, idx) => (
              <div key={idx} className="info-card-contact">
                <div className="info-icon">{info.icon}</div>
                <h3>{info.title}</h3>
                {info.details.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form & Map */}
        <div className="contact-form-section container">
          <div className="form-container">
            <div className="form-header">
              <h2>Send us a message</h2>
              <p>Fill out the form below and our team will get back to you within 24 hours.</p>
            </div>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Booking inquiry / Support / Feedback"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'} <FiSend />
              </button>
              {formStatus === 'success' && (
                <div className="form-success">
                  <FiCheckCircle /> Thank you! Your message has been sent. We'll get back to you soon.
                </div>
              )}
            </form>
          </div>

          <div className="map-container">
            <h3>Find us on map</h3>
            <div className="map-wrapper">
              <iframe
                title="Eronix Gaming Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.638218227763!2d72.8696143149019!3d19.11361498707204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c8f2a8b8b8b9%3A0x8b8b8b8b8b8b8b8b!2sAndheri%20East%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <div className="map-address">
              <FiMapPin /> Eronix Gaming Zone, Gameplex Mall, Andheri East, Mumbai - 400069
            </div>
          </div>
        </div>

        {/* Social & WhatsApp */}
        <div className="social-section container">
          <h3>Connect with us</h3>
          <div className="social-links">
            <a href="#" className="social-icon"><FiFacebook /></a>
            <a href="#" className="social-icon"><FiTwitter /></a>
            <a href="#" className="social-icon"><FiInstagram /></a>
            <a href="#" className="social-icon"><FiYoutube /></a>
            <a href="#" className="social-icon whatsapp"><FaWhatsapp /></a>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section container">
          <div className="section-header center">
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers to common queries</p>
          </div>
          <div className="faq-grid">
            {faqs.map((faq, idx) => (
              <div key={idx} className="faq-card">
                <h4>{faq.q}</h4>
                <p>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Footer */}
        <div className="benefits-footer">
          <div className="container">
            <div className="benefits-grid">
              <div className="benefit"><FiHeadphones /> 24/7 Support</div>
              <div className="benefit"><FiCheckCircle /> Instant Booking Confirmation</div>
              <div className="benefit"><FiAward /> Best Price Guarantee</div>
              <div className="benefit"><FiGlobe /> 10+ Tournaments Yearly</div>
            </div>
          </div>
        </div>
      </div>
    </GameZoneLayout>
  );
};

export default Contact;