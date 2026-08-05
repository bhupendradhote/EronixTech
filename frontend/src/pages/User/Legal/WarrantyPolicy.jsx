import React from 'react';
import Layout from '../../../components/layout/Layout';
import { FaChevronRight } from "react-icons/fa";
import './Legal.css';

const WarrantyPolicy = () => {
    return (
        <Layout>
            <div className="policy-page-wrapper">

                <div className="policy-grid-layout">

                    {/* Main Content Column */}
                    <main className="policy-main-content">

                        {/* Blue Hero Banner */}
                        <section className="policy-hero-banner">
                            <div className="hero-text-content">
                                <h1>Warranty Policy</h1>
                                <p>Premium-Quality Refurbished Products – Built to Last</p>
                                <p style={{ fontSize: '0.9rem', opacity: 0.85, marginTop: '0.25rem' }}>
                                    This page outlines the warranty coverage, terms, conditions, and claim process for ERONIX products.
                                </p>
                            </div>
                            <div className="hero-visual-graphics">
                                <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="90" cy="55" r="40" fill="#3A86FF" stroke="#333" strokeWidth="2" />
                                    <path d="M90 30v50M65 55h50" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
                                    <rect x="115" y="75" width="50" height="30" rx="6" fill="#DDB088" stroke="#333" strokeWidth="2" />
                                    <path d="M115 88h40M123 98h20" stroke="#333" strokeWidth="2" />
                                    <path d="M45 90c12-20 28-25 40-8" stroke="#70E000" strokeWidth="3" strokeLinecap="round" />
                                    <circle cx="38" cy="35" r="10" fill="#FFBE0B" stroke="#333" strokeWidth="2" />
                                    <path d="M35 32l6 6M41 32l-6 6" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                        </section>

                        {/* ====== FULL WARRANTY POLICY CONTENT ====== */}

                        {/* Overview Section */}
                        <section className="policy-card-block policy-overview-section">
                            <h2>Overview of the Warranty</h2>
                            <p className="intro-text">
                                At Eronix, we are committed to delivering premium-quality refurbished products that meet your expectations and provide long-lasting value. This warranty policy outlines the terms and conditions for warranty services offered exclusively on Eronix's refurbished laptops and accessories.
                            </p>
                        </section>

                        {/* Important Notes */}
                        <section className="policy-card-block">
                            <h2>Important Notes</h2>
                            <p>
                                This warranty applies only to products purchased directly from:
                            </p>
                            <ul style={{ marginTop: '0.75rem', paddingLeft: '1.5rem', listStyle: 'disc' }}>
                                <li style={{ marginBottom: '0.4rem' }}>
                                    <strong>Eronix Official Website</strong>
                                </li>
                                <li style={{ marginBottom: '0.4rem' }}>
                                    <strong>Eronix Physical Store</strong> — 1, Jijamata Complex, Near India Tea, Opposite Sangameshwar College, Sat Rasta, Solapur – 413003
                                </li>
                            </ul>
                            <p style={{ marginTop: '1rem' }}>
                                Products purchased through <strong>third-party marketplaces</strong> are <strong>not covered</strong> under this warranty. Customers must refer to the warranty and return policies of the respective marketplace.
                            </p>
                            <p style={{ marginTop: '0.75rem' }}>
                                At Eronix, your satisfaction is our top priority. We ensure rigorous quality checks and reliable warranty coverage to give you peace of mind with every purchase.
                            </p>
                        </section>

                        {/* Warranty Period */}
                        <section className="policy-card-block">
                            <h2>Warranty Period</h2>

                            <h3 style={{ fontSize: '1.1rem', marginTop: '0.75rem', color: '#1a1a2e' }}>Standard Warranty Policy</h3>
                            <ol style={{ paddingLeft: '1.5rem', listStyle: 'decimal', marginTop: '0.5rem' }}>
                                <li style={{ marginBottom: '0.4rem' }}>
                                    <strong>For All Products Except Apple:</strong> The standard warranty is valid for <strong>1 year</strong> from the date of the original retail purchase by the end-user.
                                </li>
                                <li>
                                    <strong>For Apple Products:</strong> The standard warranty is valid for <strong>5 months</strong> from the date of the original retail purchase by the end-user.
                                </li>
                            </ol>

                            <h3 style={{ fontSize: '1.1rem', marginTop: '1.25rem', color: '#1a1a2e' }}>Extended Warranty Policy</h3>
                            <p>
                                Customers may purchase an extended warranty, extending the total coverage up to <strong>2 years</strong>.
                            </p>
                            <p style={{ marginTop: '0.5rem' }}>
                                Extended warranty coverage is subject to all terms, exclusions, and limitations of this policy.
                            </p>
                        </section>

                        {/* What Is Covered */}
                        <section className="policy-card-block">
                            <h2>What Is Covered by This Warranty?</h2>

                            <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: '#1a1a2e' }}>Limited Coverage – Manufacturing Defects Only</h3>
                            <p>
                                Eronix warrants that refurbished hardware products are free from manufacturing defects in materials and workmanship, when used under normal operating conditions and in accordance with Eronix's usage guidelines.
                            </p>

                            <h3 style={{ fontSize: '1.1rem', marginTop: '1.25rem', color: '#1a1a2e' }}>Covered Hardware Components (Limited)</h3>
                            <p>Coverage applies only to functional failures, not cosmetic or aging-related issues:</p>

                            <ul style={{ paddingLeft: '1.5rem', listStyle: 'disc', marginTop: '0.5rem' }}>
                                <li style={{ marginBottom: '0.5rem' }}>
                                    <strong>Screen / Display</strong> — Covered only for:
                                    <ul style={{ paddingLeft: '1.5rem', listStyle: 'circle', marginTop: '0.2rem' }}>
                                        <li>No Display / Black Screen</li>
                                        <li>Blue Screen Error</li>
                                    </ul>
                                    <span style={{ fontSize: '0.9rem', color: '#666' }}>(Display lines, dots, flickering, discoloration, dead pixels, or aging issues are excluded)</span>
                                </li>
                                <li style={{ marginBottom: '0.5rem' }}>
                                    <strong>Motherboard (Limited Coverage)</strong> — Covered only for:
                                    <ul style={{ paddingLeft: '1.5rem', listStyle: 'circle', marginTop: '0.2rem' }}>
                                        <li>No power due to internal defect</li>
                                        <li>Boot failure caused by motherboard defect</li>
                                    </ul>
                                </li>
                                <li style={{ marginBottom: '0.5rem' }}><strong>Keyboard</strong></li>
                                <li style={{ marginBottom: '0.5rem' }}><strong>Hard Disk / SSD</strong></li>
                                <li style={{ marginBottom: '0.5rem' }}><strong>Memory (RAM)</strong></li>
                                <li><strong>Branded accessories</strong> supplied in original packaging</li>
                            </ul>

                            <p style={{ marginTop: '0.75rem', fontStyle: 'italic', color: '#555' }}>
                                Repair or replacement will be decided solely by Eronix after inspection.
                            </p>
                        </section>

                        {/* What Is Not Covered */}
                        <section className="policy-card-block">
                            <h2>What Is Not Covered by This Warranty?</h2>

                            <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: '#1a1a2e' }}>Software (Not Covered)</h3>
                            <p>This warranty does not cover:</p>
                            <ul style={{ paddingLeft: '1.5rem', listStyle: 'disc', marginTop: '0.4rem' }}>
                                <li style={{ marginBottom: '0.3rem' }}>Operating systems</li>
                                <li style={{ marginBottom: '0.3rem' }}>Software applications</li>
                                <li style={{ marginBottom: '0.3rem' }}>Drivers, updates, viruses, malware, or data corruption</li>
                            </ul>
                            <p style={{ marginTop: '0.3rem' }}>Customers must refer to the respective software license agreements.</p>

                            <h3 style={{ fontSize: '1.1rem', marginTop: '1.25rem', color: '#1a1a2e' }}>Third-Party Accessories</h3>
                            <p>Any third-party accessories or components not originally supplied by Eronix are not covered.</p>
                        </section>

                        {/* Exclusions */}
                        <section className="policy-card-block">
                            <h2>Exclusions from Warranty</h2>
                            <p>The following are strictly excluded from warranty coverage:</p>

                            <h3 style={{ fontSize: '1.05rem', marginTop: '0.75rem', color: '#1a1a2e' }}>Physical &amp; Cosmetic Damage</h3>
                            <ul style={{ paddingLeft: '1.5rem', listStyle: 'disc', marginTop: '0.3rem' }}>
                                <li style={{ marginBottom: '0.3rem' }}>Scratches, dents, cracks, broken plastic parts</li>
                                <li style={{ marginBottom: '0.3rem' }}>Bent or damaged ports</li>
                                <li style={{ marginBottom: '0.3rem' }}>Screen lines, dots, flickering, discoloration, backlight bleeding</li>
                                <li>Dead pixels or display fading over time</li>
                            </ul>

                            <h3 style={{ fontSize: '1.05rem', marginTop: '1rem', color: '#1a1a2e' }}>Liquid &amp; Electrical Damage</h3>
                            <ul style={{ paddingLeft: '1.5rem', listStyle: 'disc', marginTop: '0.3rem' }}>
                                <li style={{ marginBottom: '0.3rem' }}>Water or moisture exposure</li>
                                <li style={{ marginBottom: '0.3rem' }}>Corrosion, rust, oxidation</li>
                                <li style={{ marginBottom: '0.3rem' }}>Electrical short circuits, power surges, voltage fluctuations</li>
                                <li>Use of incorrect or third-party chargers</li>
                            </ul>

                            <h3 style={{ fontSize: '1.05rem', marginTop: '1rem', color: '#1a1a2e' }}>Misuse &amp; External Causes</h3>
                            <ul style={{ paddingLeft: '1.5rem', listStyle: 'disc', marginTop: '0.3rem' }}>
                                <li style={{ marginBottom: '0.3rem' }}>Drops, impact, pressure damage</li>
                                <li style={{ marginBottom: '0.3rem' }}>Fire, accidents, natural disasters</li>
                                <li>Improper handling or unsuitable operating environments</li>
                            </ul>

                            <h3 style={{ fontSize: '1.05rem', marginTop: '1rem', color: '#1a1a2e' }}>Unauthorized Activity</h3>
                            <ul style={{ paddingLeft: '1.5rem', listStyle: 'disc', marginTop: '0.3rem' }}>
                                <li style={{ marginBottom: '0.3rem' }}>Self-repair attempts or opening the device</li>
                                <li style={{ marginBottom: '0.3rem' }}>Third-party or unauthorized servicing</li>
                                <li>BIOS or firmware tampering</li>
                            </ul>

                            <h3 style={{ fontSize: '1.05rem', marginTop: '1rem', color: '#1a1a2e' }}>Consumables &amp; Wear</h3>
                            <ul style={{ paddingLeft: '1.5rem', listStyle: 'disc', marginTop: '0.3rem' }}>
                                <li style={{ marginBottom: '0.3rem' }}>Battery performance degradation due to normal usage</li>
                                <li>Normal wear and tear of refurbished products</li>
                            </ul>

                            <h3 style={{ fontSize: '1.05rem', marginTop: '1rem', color: '#1a1a2e' }}>Product Integrity Issues</h3>
                            <ul style={{ paddingLeft: '1.5rem', listStyle: 'disc', marginTop: '0.3rem' }}>
                                <li style={{ marginBottom: '0.3rem' }}>Removed, altered, or defaced serial numbers</li>
                                <li style={{ marginBottom: '0.3rem' }}>Broken or tampered warranty seals</li>
                                <li style={{ marginBottom: '0.3rem' }}>Stolen products</li>
                                <li>Devices locked with passwords or security features where ownership cannot be verified</li>
                            </ul>

                            <p style={{ marginTop: '1rem', fontWeight: '600', color: '#cc0000', borderLeft: '4px solid #cc0000', paddingLeft: '1rem' }}>
                                Any sign of liquid damage, electrical damage, physical impact, or unauthorized repair will immediately void the warranty.
                            </p>
                        </section>

                        {/* Your Responsibilities */}
                        <section className="policy-card-block">
                            <h2>Your Responsibilities</h2>

                            <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: '#1a1a2e' }}>Backup of Data</h3>
                            <p>
                                If your refurbished product is capable of storing software programs, data, and other information, it is your responsibility to maintain regular backup copies of all stored information. <strong>Eronix</strong> will not be held liable for any data loss that may occur during repair, replacement, or any other warranty service.
                            </p>
                            <p style={{ marginTop: '0.5rem' }}>
                                We strongly recommend ensuring that all important data is backed up before sending your product for service.
                            </p>

                            <h3 style={{ fontSize: '1.1rem', marginTop: '1.25rem', color: '#1a1a2e' }}>Proof of Purchase</h3>
                            <p>
                                Before receiving warranty service, you may be required to provide proof of purchase, respond to questions aimed at diagnosing potential issues, and follow Eronix's instructions for troubleshooting and seeking warranty service. These steps are designed to ensure a smooth and efficient resolution of your product concerns.
                            </p>
                        </section>

                        {/* How to Obtain Warranty Service */}
                        <section className="policy-card-block">
                            <h2>How to Obtain Warranty Service</h2>

                            <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: '#1a1a2e' }}>Contacting Eronix Support</h3>
                            <p>
                                To initiate a warranty service request, please contact Eronix Customer Support via email at <a href="mailto:support@Eronix.com" style={{ color: '#0052cc', fontWeight: '600' }}>support@Eronix.com</a> or call <strong>8308010177</strong> (Monday to Friday, 10 AM to 6 PM). Make sure to provide a detailed description of the issue along with proof of purchase to start the process.
                            </p>

                            <h3 style={{ fontSize: '1.1rem', marginTop: '1.25rem', color: '#1a1a2e' }}>Initial Complaint Resolution</h3>
                            <p>
                                Once the complaint is raised, Eronix will attempt to resolve the issue remotely within <strong>24 to 48 hours</strong>. Our support team may guide you through troubleshooting steps or perform a remote diagnosis to determine the issue.
                            </p>

                            <h3 style={{ fontSize: '1.1rem', marginTop: '1.25rem', color: '#1a1a2e' }}>Engineer / Technical Expert Visit</h3>
                            <p>
                                If the issue persists, Eronix may arrange for a visit by a technical expert. The expert will attempt to diagnose and resolve the problem on-site.
                            </p>

                            <h3 style={{ fontSize: '1.1rem', marginTop: '1.25rem', color: '#1a1a2e' }}>Facility Inspection</h3>
                            <p>
                                If the engineer's visit does not resolve the issue, you may be required to send the unit to our service facility. At the facility, the product will undergo a thorough inspection, and necessary repairs will be carried out.
                            </p>

                            <h3 style={{ fontSize: '1.1rem', marginTop: '1.25rem', color: '#1a1a2e' }}>Replacement</h3>
                            <p>
                                If the issue remains unresolved after the facility inspection, Eronix may replace the unit with another product of equivalent value and specifications.
                            </p>
                        </section>

                        {/* Replacement and Refunds */}
                        <section className="policy-card-block">
                            <h2>Replacement and Refunds</h2>
                            <p>
                                If a replacement is provided, the replacement product will be covered under the remaining term of the original warranty. Refunds, if applicable, will be processed based on the original payment method.
                            </p>
                        </section>

                        {/* Shipping and Handling */}
                        <section className="policy-card-block">
                            <h2>Shipping and Handling</h2>

                            <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: '#1a1a2e' }}>Shipping Costs</h3>
                            <p>
                                If warranty service is required due to a defect covered under this policy, Eronix will cover the shipping costs to and from the service center. However, if the service request is deemed ineligible, you may be responsible for the shipping costs.
                            </p>

                            <h3 style={{ fontSize: '1.1rem', marginTop: '1.25rem', color: '#1a1a2e' }}>Packaging for Return</h3>
                            <p>
                                When returning a product for warranty service, ensure that it is properly packaged to prevent damage during transit. Eronix is not responsible for any damage that occurs during shipping due to improper packaging.
                            </p>
                        </section>

                        {/* Limitation of Liability */}
                        <section className="policy-card-block">
                            <h2>Limitation of Liability</h2>

                            <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: '#1a1a2e' }}>No Guarantee of Error-Free Operation</h3>
                            <p>
                                Eronix does not guarantee that the operation of the refurbished product will be uninterrupted or error-free. The warranty covers defects in materials and workmanship but does not cover software issues, user errors, or other non-hardware-related problems.
                            </p>

                            <h3 style={{ fontSize: '1.1rem', marginTop: '1.25rem', color: '#1a1a2e' }}>Limitation of Damages</h3>
                            <p>
                                Except as provided in this warranty and to the maximum extent permitted by law, Eronix is not responsible for direct, indirect, special, incidental, or consequential damages resulting from any breach of warranty or condition, or under any other legal theory. This includes, but is not limited to:
                            </p>
                            <ul style={{ paddingLeft: '1.5rem', listStyle: 'disc', marginTop: '0.4rem' }}>
                                <li style={{ marginBottom: '0.3rem' }}>Loss of use</li>
                                <li style={{ marginBottom: '0.3rem' }}>Loss of revenue</li>
                                <li style={{ marginBottom: '0.3rem' }}>Loss of actual or anticipated profits (including profits on contracts)</li>
                                <li style={{ marginBottom: '0.3rem' }}>Loss of the use of money</li>
                                <li style={{ marginBottom: '0.3rem' }}>Loss of anticipated savings</li>
                                <li style={{ marginBottom: '0.3rem' }}>Loss of business or opportunities</li>
                                <li>Loss of goodwill or reputation</li>
                            </ul>
                        </section>

                        {/* Changes to Warranty Policy */}
                        <section className="policy-card-block">
                            <h2>Changes to the Warranty Policy</h2>

                            <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: '#1a1a2e' }}>Right to Modify</h3>
                            <p>
                                Eronix reserves the right to modify or update this warranty policy at any time without prior notice. Any changes will be effective immediately upon posting on our website. It is your responsibility to review this policy periodically for any updates.
                            </p>

                            <h3 style={{ fontSize: '1.1rem', marginTop: '1.25rem', color: '#1a1a2e' }}>Service and Support Availability</h3>
                            <p>
                                Service and support for warranty claims will be provided based on parts availability and Eronix's service center capabilities. Certain models may require additional lead time for repair or replacement due to component sourcing or specific part requirements.
                            </p>
                        </section>

                        {/* Force Majeure */}
                        <section className="policy-card-block">
                            <h2>Force Majeure</h2>
                            <p>
                                Eronix is not liable for delays, interruptions, or inability to fulfill warranty obligations due to events beyond its reasonable control, including but not limited to natural disasters, acts of war, terrorism, government restrictions, pandemics, strikes, supply shortages, or other unforeseen events. In such cases, warranty obligations will be adjusted or deferred until the resolution of the event, as permitted by law.
                            </p>
                        </section>

                        {/* Transferability */}
                        <section className="policy-card-block">
                            <h2>Transferability of Warranty</h2>
                            <p>
                                This warranty is <strong>non-transferable</strong> and applies only to the original purchaser of the refurbished product. Any resale or transfer of the product voids this warranty.
                            </p>
                        </section>

                        {/* Conduct */}
                        <section className="policy-card-block">
                            <h2>Conduct of Customers and Staff</h2>
                            <p>
                                Eronix is committed to providing a respectful and professional environment for both customers and employees. Customers are expected to treat our staff with courtesy and respect. Any abusive behavior—such as verbal or physical threats, harassment, or disruptive conduct—will not be tolerated and may result in the limitation of warranty services or support.
                            </p>
                            <p style={{ marginTop: '0.75rem' }}>
                                Conversely, Eronix expects its employees to uphold the highest standards of professionalism. If a customer feels they have experienced abusive or inappropriate language from our staff, they are encouraged to report the incident to management immediately. Such reports will be taken seriously and investigated thoroughly. Appropriate action will be taken to address any employee behavior that does not align with our commitment to respect and professionalism.
                            </p>
                            <p style={{ marginTop: '0.75rem' }}>
                                For such cases, you may escalate the issue to <a href="mailto:support@Eronix.com" style={{ color: '#0052cc', fontWeight: '600' }}>support@Eronix.com</a>.
                            </p>
                        </section>

                        {/* Governing Law */}
                        <section className="policy-card-block">
                            <h2>Governing Law and Jurisdiction</h2>
                            <p>
                                These Terms of Use shall be governed by and construed in accordance with the laws of India. Any dispute arising out of or in connection with these Terms of Use shall be subject to the exclusive jurisdiction of the courts located in <strong>Solapur, Maharashtra</strong>.
                            </p>
                        </section>

                        {/* Visual Process Workflow */}
                        <section className="policy-card-block">
                            <h2>Our Warranty Service Process</h2>
                            <div className="policy-steps-workflow">
                                <div className="workflow-card">
                                    <div className="card-step-num">1. Raise a Request</div>
                                    <div className="card-icon-container">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0 1 22 16.92z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="workflow-card">
                                    <div className="card-step-num">2. Remote Diagnosis</div>
                                    <div className="card-icon-container">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 8v4l2 2" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="workflow-card">
                                    <div className="card-step-num">3. On-Site / Facility Repair</div>
                                    <div className="card-icon-container">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                            <line x1="12" y1="18" x2="12" y2="12" />
                                            <line x1="9" y1="15" x2="15" y2="15" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="workflow-card">
                                    <div className="card-step-num">4. Resolution / Replacement</div>
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

export default WarrantyPolicy;