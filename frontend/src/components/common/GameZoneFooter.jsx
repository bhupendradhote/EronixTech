import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { FaInstagram, FaFacebookF, FaTwitter, FaDiscord } from 'react-icons/fa';
import './GameZoneFooter.css';

const GameZoneFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="game-zone-footer">
      <div className="footer-container">
        {/* Company Info */}
        <div className="footer-section company-info">
          <h3>ERONIX <span>GAMING</span></h3>
          <p>The ultimate destination for premium gaming experiences. High-end PCs, next-gen consoles, and competitive tournaments.</p>
          <div className="social-links">
            <a href="#" aria-label="Discord"><FaDiscord /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/gaming-zone">Book a Console</Link></li>
            <li><Link to="/tournaments">Tournaments</Link></li>
            <li><Link to="/membership">Membership</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer-section">
          <h4>Support</h4>
          <ul className="footer-links">
            <li><Link to="/faq">FAQs</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/refund">Refund Policy</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section contact-info">
          <h4>Contact Us</h4>
          <div className="contact-item">
            <FiMapPin className="contact-icon" />
            <p>123 Gaming Street, Tech Park Area, Bhopal, MP 462001</p>
          </div>
          <div className="contact-item">
            <FiPhone className="contact-icon" />
            <p>+91 7218 9293 54</p>
          </div>
          <div className="contact-item">
            <FiMail className="contact-icon" />
            <p>support@eronixgaming.in</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Eronix Gaming Zone. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default GameZoneFooter;