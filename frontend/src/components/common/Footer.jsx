import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

import logo from "../../assets/images/logo/eronix.png";

/* Benefit icons */
import genuineIcon from "../../assets/images/footer/genuine-products.svg";
import deliveryIcon from "../../assets/images/footer/delivery.svg";
import securePaymentIcon from "../../assets/images/footer/secure-payment.svg";
import buyerProtectionIcon from "../../assets/images/footer/buyer-protection.svg";
import supportIcon from "../../assets/images/footer/support.svg";
import bestPriceIcon from "../../assets/images/footer/best-price.svg";

/* Trust-strip icons */
import secureShoppingIcon from "../../assets/images/footer/secure-shopping.svg";
import authenticIcon from "../../assets/images/footer/authentic-products.svg";
import panIndiaIcon from "../../assets/images/footer/pan-india-delivery.svg";
import returnIcon from "../../assets/images/footer/easy-returns.svg";
import safePaymentIcon from "../../assets/images/footer/safe-payments.svg";

/* Social icons */
import facebookIcon from "../../assets/images/footer/facebook.svg";
import instagramIcon from "../../assets/images/footer/instagram.svg";
import youtubeIcon from "../../assets/images/footer/youtube.svg";
import linkedinIcon from "../../assets/images/footer/linkedin.svg";
import whatsappIcon from "../../assets/images/footer/whatsapp.svg";

/* Payment icons */
import visaIcon from "../../assets/images/footer/visa.svg";
import mastercardIcon from "../../assets/images/footer/mastercard.svg";
import rupayIcon from "../../assets/images/footer/rupay.svg";
import upiIcon from "../../assets/images/footer/upi.svg";
import netBankingIcon from "../../assets/images/footer/net-banking.svg";
import emiIcon from "../../assets/images/footer/emi.svg";

/* App badges */
import googlePlayBadge from "../../assets/images/footer/google-play.png";
import appStoreBadge from "../../assets/images/footer/app-store.png";

const benefitItems = [
  {
    icon: genuineIcon,
    title: "100% Original Products",
    text: "Genuine products from trusted brands.",
  },
  {
    icon: deliveryIcon,
    title: "Fast & Free Delivery",
    text: "Free shipping on eligible orders.",
  },
  {
    icon: securePaymentIcon,
    title: "Secure Payments",
    text: "100% secure payment options.",
  },
  {
    icon: buyerProtectionIcon,
    title: "Buyer Protection",
    text: "Safe shopping with easy protection.",
  },
  {
    icon: supportIcon,
    title: "365 Days Help Desk",
    text: "We are here to support you.",
  },
  {
    icon: bestPriceIcon,
    title: "Best Prices",
    text: "Competitive prices across products.",
  },
];

const trustItems = [
  {
    icon: secureShoppingIcon,
    title: "Secure Shopping",
    text: "Your data is safe with us.",
  },
  {
    icon: authenticIcon,
    title: "Genuine Products",
    text: "100% authentic products.",
  },
  {
    icon: panIndiaIcon,
    title: "Pan India Delivery",
    text: "Delivering across India.",
  },
  {
    icon: returnIcon,
    title: "Easy Returns",
    text: "Simple return support.",
  },
  {
    icon: safePaymentIcon,
    title: "Safe Payments",
    text: "Multiple secure payment options.",
  },
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscribe = (event) => {
    event.preventDefault();

    const cleanedEmail = email.trim();

    if (!cleanedEmail) {
      setMessage("Please enter your email address.");
      return;
    }

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail);

    if (!validEmail) {
      setMessage("Please enter a valid email address.");
      return;
    }

    setMessage("Thank you for subscribing.");
    setEmail("");
  };

  return (
    <footer className="eronix-footer">
      <section className="footer-benefits" aria-label="Eronix shopping benefits">
        <div className="footer-shell footer-benefits-grid">
          {benefitItems.map((item) => (
            <article className="footer-benefit-item" key={item.title}>
              <div className="footer-benefit-icon">
                <img src={item.icon} alt="" aria-hidden="true" />
              </div>

              <div className="footer-benefit-copy">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="footer-main">
        <div className="footer-shell footer-main-grid">
          <div className="footer-brand-column">
            <Link to="/" className="footer-logo-link" aria-label="Go to Eronix home">
              <img src={logo} alt="Eronix Technologies" className="footer-logo" />
            </Link>

            <h2>India&apos;s Trusted Electronics & Gaming Destination</h2>

            <p className="footer-description">
              Your destination for laptops, gaming PCs, PC components,
              accessories, gaming experiences and business IT solutions.
            </p>

            <address className="footer-contact-list">
              <div>
                <span className="footer-contact-symbol">⌖</span>
                <span>Eronix Store, Solapur, Maharashtra, India</span>
              </div>

              <div>
                <span className="footer-contact-symbol">☎</span>
                <a href="tel:+919922202003">+91 9922202003</a>
              </div>

              <div>
                <span className="footer-contact-symbol">✉</span>
                <a href="mailto:care@eronixtech.com">care@eronixtech.com</a>
              </div>

              <div>
                <span className="footer-contact-symbol">◷</span>
                <span>Mon–Sat: 10:00 AM–8:00 PM</span>
              </div>
            </address>

            <nav className="footer-socials" aria-label="Social media links">
              <a href="#" aria-label="Facebook">
                <img src={facebookIcon} alt="" />
              </a>

              <a href="#" aria-label="Instagram">
                <img src={instagramIcon} alt="" />
              </a>

              <a href="#" aria-label="YouTube">
                <img src={youtubeIcon} alt="" />
              </a>

              <a href="#" aria-label="LinkedIn">
                <img src={linkedinIcon} alt="" />
              </a>

              <a
                href="https://api.whatsapp.com/send?phone=919922202003"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
              >
                <img src={whatsappIcon} alt="" />
              </a>
            </nav>
          </div>

          <div className="footer-link-column">
            <h3>Shop</h3>
            <ul>
              <li><Link to="/search">All Products</Link></li>
              <li><Link to="/gaming-zone">Gaming Zone</Link></li>
              <li><Link to="/search?category=pc-components">PC Components</Link></li>
              <li><Link to="/search?category=accessories">Accessories</Link></li>
              <li><Link to="/search?sort=deals">Top Deals</Link></li>
              <li><Link to="/search?sort=new">New Arrivals</Link></li>
              <li><Link to="/search?view=brands">Brands</Link></li>
              <li><Link to="/search?view=categories">Categories</Link></li>
              <li><Link to="/pc-build">Build Your PC</Link></li>
            </ul>
          </div>

          <div className="footer-link-column">
            <h3>Customer Service</h3>
            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/orders">Track My Order</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/return-policy">Returns & Refunds</Link></li>
              <li><Link to="/shipping-policy">Shipping Policy</Link></li>
              <li><Link to="/warranty-policy">Warranty Policy</Link></li>
              <li><Link to="/payment-options">Payment Options</Link></li>
              <li><Link to="/terms-of-use">Terms of Use</Link></li>
            </ul>
          </div>

          <div className="footer-link-column">
            <h3>Company</h3>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Press & News</a></li>
              <li><a href="#">Eronix Wallet</a></li>
              <li><a href="#">Become a Seller</a></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/copyright">Copyright Policy</Link></li>
            </ul>
          </div>

          <div className="footer-link-column">
            <h3>Business</h3>
            <ul>
              <li><Link to="/contact">Bulk Enquiry</Link></li>
              <li><a href="#">Supplier Central</a></li>
              <li><a href="#">Business Solutions</a></li>
              <li><a href="#">Credit & Payment</a></li>
              <li><a href="#">Industry Store</a></li>
              <li><a href="#">Corporate Orders</a></li>
              <li><a href="#">IT Support</a></li>
            </ul>
          </div>

          <div className="footer-newsletter-column">
            <h3>Newsletter</h3>
            <p>Subscribe to receive updates about exclusive deals and offers.</p>

            <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
              <label htmlFor="footer-email">Email address</label>

              <input
                id="footer-email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setMessage("");
                }}
              />

              <button type="submit">Subscribe</button>

              <p className="footer-form-message" aria-live="polite">
                {message}
              </p>
            </form>

            <div className="footer-payment-section">
              <h4>Payment Methods</h4>

              <div className="footer-payment-icons">
                <img src={visaIcon} alt="Visa" />
                <img src={mastercardIcon} alt="Mastercard" />
                <img src={rupayIcon} alt="RuPay" />
                <img src={upiIcon} alt="UPI" />
                <img src={netBankingIcon} alt="Net Banking" />
                <img src={emiIcon} alt="EMI Available" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="footer-trust-strip" aria-label="Eronix trust assurances">
        <div className="footer-shell footer-trust-grid">
          {trustItems.map((item) => (
            <article className="footer-trust-item" key={item.title}>
              <img src={item.icon} alt="" aria-hidden="true" />

              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="footer-bottom">
        <div className="footer-shell footer-bottom-grid">
          <div className="footer-app-download">
            <div>
              <strong>Download Our App</strong>
              <span>Shop anytime, anywhere</span>
            </div>

            <div className="footer-app-badges">
              <a href="#" aria-label="Download Eronix from Google Play">
                <img src={googlePlayBadge} alt="Get it on Google Play" />
              </a>

              <a href="#" aria-label="Download Eronix from the App Store">
                <img src={appStoreBadge} alt="Download on the App Store" />
              </a>
            </div>
          </div>

          <nav className="footer-bottom-links" aria-label="Footer policy links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-use">Terms of Use</Link>
            <Link to="/return-policy">Refund Policy</Link>
            <Link to="/search">Sitemap</Link>
          </nav>

          <p className="footer-copyright">
            © 2026 Eronix Technologies. All Rights Reserved.
          </p>
        </div>
      </section>
    </footer>
  );
};

export default Footer;
