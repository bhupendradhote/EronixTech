import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

// Import the logo
import logo from '../../assets/images/logo/eronix.png';

const Footer = () => {
  return (
    <>
      <footer className="desktop-footer-container">
        <div className="desktop-footer-inner">
          <div className="desktop-footer-section">
            <div className="benifit-container-row">
              {/* Great Value */}
              <div className="benifit-conatiner">
                <div className="benifit-icon">
                  {/* Gold Star Icon */}
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="#F59E0B" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
                <div className="benifit-heading"><span>Great Value</span></div>
                <div className="benifit-subText"><span>Most <b>popular brands</b> with widest range of selection <b>at best prices.</b></span></div>
              </div>
              {/* Nationwide Delivery */}
              <div className="benifit-conatiner">
                <div className="benifit-icon">
                  {/* Blue Delivery Truck Icon */}
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="#3B82F6" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 8H17V4H3C2.44772 4 2 4.44772 2 5V17H4C4 18.6569 5.34315 20 7 20C8.65685 20 10 18.6569 10 17H14C14 18.6569 15.3431 20 17 20C18.6569 20 20 18.6569 20 17H22V12L20 8ZM7 18C6.44772 18 6 17.5523 6 17C6 16.4477 6.44772 16 7 16C7.5523 16 8 16.4477 8 17C8 17.5523 7.5523 18 7 18ZM17 18C16.4477 18 16 17.5523 16 17C16 16.4477 16.4477 16 17 16C17.5523 16 18 16.4477 18 17C18 17.5523 17.5523 18 17 18ZM17 10V12H20.5L19 10H17Z" />
                  </svg>
                </div>
                <div className="benifit-heading"><span>Nationwide Delivery</span></div>
                <div className="benifit-subText"><span>Over 20,000 pincodes<b> serviceable across India.</b></span></div>
              </div>
              {/* Secure Payment */}
              <div className="benifit-conatiner">
                <div className="benifit-icon">
                  {/* Green Lock/Shield Icon */}
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="#10B981" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C9.243 2 7 4.243 7 7V10H6C4.897 10 4 10.897 4 12V20C4 21.103 4.897 22 6 22H18C19.103 22 20 21.103 20 20V12C20 10.897 19.103 10 18 10H17V7C17 4.243 14.757 2 12 2ZM9 7C9 5.346 10.346 4 12 4C13.654 4 15 5.346 15 7V10H9V7ZM12 18C10.897 18 10 17.103 10 16C10 14.897 10.897 14 12 14C13.103 14 14 14.897 14 16C14 17.103 13.103 18 12 18Z" />
                  </svg>
                </div>
                <div className="benifit-heading"><span>Secure Payment</span></div>
                <div className="benifit-subText"><span>Partnered with <span>India's</span><b> most popular and secure</b> payment solutions.</span></div>
              </div>
              {/* Buyer Protection */}
              <div className="benifit-conatiner">
                <div className="benifit-icon">
                  {/* Purple Shield Check Icon */}
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="#8B5CF6" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3 6V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V6L12 2ZM11 17L6 12L7.41 10.59L11 14.17L16.59 8.58L18 10L11 17Z" />
                  </svg>
                </div>
                <div className="benifit-heading"><span>Buyer Protection</span></div>
                <div className="benifit-subText"><span>Committed to buyer interests to provide a smooth shopping experience.</span></div>
              </div>
              {/* 365 Days Help Desk */}
              <div className="benifit-conatiner">
                <div className="benifit-icon">
                  {/* Pink Headset Icon */}
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="#EC4899" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3C7.03 3 3 7.03 3 12V19C3 20.1 3.9 21 5 21H8V14H5V12C5 8.14 8.14 5 12 5C15.86 5 19 8.14 19 12V14H16V21H19C20.1 21 21 20.1 21 19V12C21 7.03 16.97 3 12 3ZM19 16V19H18V16H19ZM6 16V19H5V16H6Z" />
                  </svg>
                </div>
                <div className="benifit-heading"><span>365 Days Help Desk</span></div>
                <div className="benifit-subText">
                  <a href="https://api.whatsapp.com/send?phone=+919999049135&amp;text=Hi" className="whatsapp-call-sec" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: 'inherit' }}>
                    {/* Official WhatsApp Green Icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382C17.202 14.248 15.868 13.593 15.626 13.504C15.385 13.415 15.205 13.37 15.026 13.639C14.846 13.908 14.321 14.536 14.161 14.731C14.002 14.926 13.843 14.956 13.573 14.821C13.304 14.686 12.43 14.398 11.396 13.472C10.591 12.753 10.049 11.867 9.889 11.597C9.729 11.328 9.873 11.186 10.008 11.052C10.13 10.93 10.28 10.735 10.415 10.585C10.549 10.435 10.594 10.33 10.684 10.151C10.774 9.972 10.729 9.814 10.662 9.68C10.594 9.545 10.054 8.213 9.829 7.674C9.61 7.148 9.393 7.221 9.231 7.21C9.083 7.201 8.903 7.2 8.724 7.2C8.544 7.2 8.252 7.267 7.982 7.567C7.712 7.866 6.948 8.584 6.948 10.052C6.948 11.52 8.004 12.928 8.154 13.123C8.304 13.318 10.218 16.368 13.236 17.618C13.954 17.915 14.512 18.093 14.945 18.228C15.666 18.455 16.321 18.423 16.842 18.337C17.424 18.241 18.632 17.585 18.887 16.866C19.141 16.147 19.141 15.534 19.066 15.4C18.991 15.265 18.812 15.175 18.542 15.04L17.472 14.382ZM12.004 22C10.316 22 8.736 21.547 7.4 20.767L7.155 20.62L3.6 21.552L4.548 18.066L4.385 17.808C3.518 16.425 3.036 14.778 3.036 13.002C3.036 8.037 7.067 4 12.004 4C14.417 4 16.657 4.942 18.362 6.647C20.068 8.353 21 10.59 21 13.002C21 17.967 16.968 22 12.004 22ZM12.004 2C5.932 2 1 6.932 1 13.002C1 14.943 1.503 16.764 2.378 18.338L1 23L5.753 21.654C7.269 22.457 9.002 22.909 12.004 22.909C18.077 22.909 23 17.977 23 11.907C23 8.966 21.856 6.222 19.778 4.145C17.7 2.067 14.954 2 12.004 2Z" />
                    </svg>
                    +91 9999049135
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="about-section">
            <div className="moglix-about-info">
              <div className="about-heading">
                {/* Logo image instead of text */}
                <span>
                  <img src={logo} alt="EronixTech" className="footer-logo" />
                </span>
              </div>
              <ul className="about-list">
                <li><Link to="/about">About Us</Link></li>
                <li><a href="#" title="Careers">Careers</a></li>
                <li><Link to="/orders">Track My Order</Link></li>
                <li><a href="#" title="_blank">Press</a></li>
                <li><a href="#">Testimonials</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Articles</a></li>
              </ul>
            </div>
            <div className="moglix-about-info">
              <div className="about-heading"><span>Help</span></div>
              <ul className="about-list">
                <li><Link title="Our Contact" to="/contact"> Our Contact </Link></li>
                <li><a href="/terms-of-use">Terms of service</a></li>
                <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                <li><Link to="/shipping-policy">Shipping Policy</Link></li>
                <li><Link to="/copyright">Copyright Policy</Link></li>
                <li><Link to="/return-policy">Return Policy</Link></li>
                <li><Link to="/warranty-policy">Warranty Policy</Link></li>
              </ul>
            </div>
            <div className="moglix-about-info">
              <div className="about-heading"><span>FAQs</span></div>
              <ul className="about-list">
                <li><Link to="/faq">Order Tracking</Link></li>
                <li><Link to="/faq">Cancellation and Return</Link></li>
                <li><Link to="/faq">Refund</Link></li>
                <li><Link to="/faq">Payment Option</Link></li>
              </ul>
            </div>
            <div className="moglix-about-info">
              <div className="about-heading"><span>EronixTech's Own</span></div>
              <ul className="about-list">
                <li><a href="#">Popular Searches</a></li>
                <li><a href="#">Best Deals</a></li>
                <li><a href="#">Online Assist</a></li>
                <li><a href="#">Industry Store</a></li>
                <li><a href="#">Top Buying Requirement</a></li>
              </ul>
            </div>
            <div className="moglix-about-info">
              <div className="about-heading"><span>Miscellaneous</span></div>
              <ul className="about-list">
                <li><a href="#">Bulk Enquiry</a></li>
                <li><a href="#">EronixTech Business</a></li>
                <li><a href="#">Supplier Central</a></li>
                <li><a href="#" target="_blank">Credlix</a></li>
                <li><a href="#" target="_blank">DigiMRO</a></li>
                <li><a href="#" target="_blank">Zoglix</a></li>
                <li><a href="#" target="_blank">TenderShark</a></li>
                <li><a href="#">Ad Sales Solution</a></li>
                <li><a href="#" target="_blank">Cognilix</a></li>
              </ul>
            </div>
          </div>
          <div className="social-media-conatiner">
            <div className="app-promotion" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
              <a href="#" style={{ display: 'flex', background: '#000', color: '#fff', borderRadius: '8px', padding: '6px 12px', textDecoration: 'none', alignItems: 'center', gap: '8px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.365 14.733c-.021-2.909 2.378-4.316 2.487-4.385-1.353-1.979-3.447-2.247-4.185-2.278-1.78-.182-3.475 1.045-4.385 1.045-.911 0-2.316-1.018-3.791-.989-1.91.028-3.673 1.11-4.654 2.82-1.996 3.456-.51 8.563 1.433 11.37 .952 1.373 2.08 2.913 3.568 2.855 1.434-.057 1.98-.925 3.708-.925 1.726 0 2.242.925 3.737.897 1.547-.028 2.525-1.401 3.471-2.774 1.096-1.597 1.549-3.144 1.569-3.226-.034-.015-3.018-1.157-3.037-4.526M15.42 5.097c.801-.968 1.341-2.316 1.194-3.664-1.163.047-2.556.772-3.385 1.737-.66.764-1.258 2.137-1.085 3.461 1.295.1 2.585-.609 3.276-1.534" />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '10px', lineHeight: '1' }}>Download on the</span>
                  <span style={{ fontSize: '16px', fontWeight: 600, lineHeight: '1.2' }}>App Store</span>
                </div>
              </a>
              <a href="#" style={{ display: 'flex', background: '#000', color: '#fff', borderRadius: '8px', padding: '6px 12px', textDecoration: 'none', alignItems: 'center', gap: '8px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.565 21.05C3.398 20.932 3.3 20.72 3.3 20.446V3.554C3.3 3.28 3.398 3.068 3.565 2.95L13.626 12L3.565 21.05Z" fill="#00D2FF" />
                  <path d="M17.478 15.46L13.626 12L3.565 21.05C3.896 21.284 4.354 21.312 4.872 21.018L17.478 15.46Z" fill="#FF3366" />
                  <path d="M17.478 8.539L4.872 2.981C4.354 2.687 3.896 2.715 3.565 2.95L13.626 12L17.478 8.539Z" fill="#00E676" />
                  <path d="M20.957 11.233L17.478 8.539L13.626 12L17.478 15.46L20.957 12.766C21.465 12.42 21.465 11.58 20.957 11.233Z" fill="#FFC107" />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '10px', lineHeight: '1' }}>GET IT ON</span>
                  <span style={{ fontSize: '16px', fontWeight: 600, lineHeight: '1.2' }}>Google Play</span>
                </div>
              </a>
            </div>
            <div className="email-section" style={{ marginBottom: '20px' }}>
              <a href="mailto:care@eronixtech.com" className="email-sec" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit', fontWeight: 600 }}>
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                </span>
                care@eronixtech.com
              </a>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>In case of any concern, mail us</p>
            </div>
            <div className="social-icons">
              <ul>
                <li>
                  <a target="_blank" href="#" aria-label="Facebook">
                    <svg viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V7.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                    </svg>
                  </a>
                </li>
                <li>
                  <a target="_blank" href="#" aria-label="YouTube">
                    <svg viewBox="0 0 24 24" fill="#FF0000" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
                    </svg>
                  </a>
                </li>
                <li>
                  <a target="_blank" href="#" aria-label="LinkedIn">
                    <svg viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                    </svg>
                  </a>
                </li>
                <li>
                  <a target="_blank" href="#" aria-label="X (Twitter)">
                    <svg viewBox="0 0 24 24" fill="#000000" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                    </svg>
                  </a>
                </li>
                <li>
                  <a target="_blank" href="#" aria-label="Behance">
                    <svg viewBox="0 0 24 24" fill="#1769FF" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.5 7H2v10h6.5c3 0 4.5-1.5 4.5-3.5 0-1.2-.8-2.2-2-2.5 1-.4 1.5-1.4 1.5-2.5C12.5 7.5 11.5 7 8.5 7zm-3.5 3.5v-2h3c1 0 1.5.5 1.5 1 0 .8-.5 1-1.5 1H5zm3.5 4.5H5v-2.5h3.5c1 0 1.5.5 1.5 1.2 0 1-.5 1.3-1.5 1.3zM22 13h-5.5c0 1.5 1 2 2.5 2 1 0 1.5-.5 2-1h3c-.5 2.5-2.5 3.5-5 3.5-3.5 0-5.5-2.5-5.5-5.5S15.5 6.5 19 6.5c3.5 0 5 2.5 5 5.5v1zm-3-1.5c0-1.5-1-2-2-2s-2 .5-2 2h4zM16 4h6v2h-6z"></path>
                    </svg>
                  </a>
                </li>
                <li>
                  <a target="_blank" href="#" aria-label="Instagram">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#F58529"></stop>
                          <stop offset="50%" stopColor="#DD2A7B"></stop>
                          <stop offset="100%" stopColor="#8134AF"></stop>
                        </linearGradient>
                      </defs>
                      <path fill="url(#ig-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
      <div className="copy-right">
        <div className="copy-right-conatiner">
          <div className="copy-right-txt">
            <span>
              <Link to="/terms-of-use">Terms of Use</Link> | 
              <Link to="/copyright">Copyright</Link> | 
              <Link to="/privacy-policy">Privacy Policy</Link> | 
              <a href="#">Compliance</a>
            </span>
          </div>
          <div className="reserved-txt">
            <span>ERONIXTECH (INDIA) PRIVATE LIMITED © 2026 EronixTech.com. All Rights Reserved.</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;