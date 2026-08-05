import React, { useState } from 'react';
import {
  FiHome, FiCalendar, FiGift, FiAward, FiMapPin, FiClock, FiUsers,
  FiMonitor, FiShoppingCart, FiBell, FiUser, FiPhone, FiMail,
  FiCheckCircle, FiDollarSign, FiCreditCard, FiSmartphone, FiCoffee,
  FiStar, FiShield, FiZap, FiHeadphones, FiHeart, FiMessageCircle, FiLock,
  FiArrowRight, FiExternalLink
} from 'react-icons/fi';
import { FaWhatsapp, FaGooglePay, FaGamepad, FaTrophy, FaFire } from 'react-icons/fa'; 
import { SiPhonepe } from 'react-icons/si';

import GameZoneLayout from '../../../components/layout/GameZoneLayout';
import '../../GameZone/GamingZone.css'; 

const availableGames = [
  { id: 1, name: 'EA FC 26', genre: 'Football Simulation', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=80&h=80&fit=crop' },
  { id: 2, name: 'Cricket 26', genre: 'Cricket Simulation', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=80&h=80&fit=crop' },
  { id: 3, name: 'GTA V', genre: 'Open World Action', image: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=80&h=80&fit=crop' },
  { id: 4, name: 'WWE 2K26', genre: 'Professional Wrestling', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=80&h=80&fit=crop' },
  { id: 5, name: 'Call of Duty', genre: 'First-Person Shooter', image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=80&h=80&fit=crop' },
  { id: 6, name: 'Valorant', genre: 'Tactical FPS', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=80&h=80&fit=crop' },
  { id: 7, name: 'Counter-Strike 2', genre: 'Competitive FPS', image: 'https://images.unsplash.com/photo-1493711662285-585847dc6ce4?w=80&h=80&fit=crop' },
];

const promotionalBanners = [
  { id: 1, title: 'Night Owl Pass', desc: 'Play from 10 PM to 6 AM for just ₹500', icon: <FiClock />, tag: 'HOT DEAL' },
  { id: 2, title: 'Weekend Tournament', desc: 'Join the EA FC 26 Cup & win ₹10,000', icon: <FaTrophy />, tag: 'ESPORTS' },
  { id: 3, title: 'Squad Offer', desc: 'Book 4 PCs, get 1 hour absolutely free', icon: <FiUsers />, tag: 'CO-OP' }
];

const gameGallery = [
  { id: 1, title: 'Cyberpunk 2077', category: 'RPG', image: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=800&h=800&fit=crop', link: '#cyberpunk', size: 'large' },
  { id: 2, title: 'Elden Ring', category: 'Action RPG', image: 'https://images.unsplash.com/photo-1588824177218-3dd022b7201c?w=400&h=800&fit=crop', link: '#eldenring', size: 'tall' },
  { id: 3, title: 'Apex Legends', category: 'Battle Royale', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop', link: '#apex', size: 'wide' },
  { id: 4, title: 'Forza Horizon 5', category: 'Racing', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=400&fit=crop', link: '#forza', size: 'small' },
  { id: 5, title: 'Red Dead Redemption 2', category: 'Open World', image: 'https://images.unsplash.com/photo-1493711662285-585847dc6ce4?w=400&h=400&fit=crop', link: '#rdr2', size: 'small' },
  { id: 6, title: 'God of War', category: 'Action', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=400&fit=crop', link: '#gow', size: 'wide' },
];

const environmentShowcase = [
  { id: 1, title: 'Pro PC Arena', desc: 'RTX 4090, 240Hz Monitors, Secretlab Chairs', image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=600&h=400&fit=crop' },
  { id: 2, title: 'PS5 VIP Lounge', desc: '75" 4K OLED TVs, Couch Co-op Comfort', image: 'https://images.unsplash.com/photo-1606144042871-29c7458ecb05?w=600&h=400&fit=crop' },
  { id: 3, title: 'Racing Simulator', desc: 'Logitech G923 Setup with VR Support', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&h=400&fit=crop' },
];

const generateTimeSlots = () => {
  return [
    { time: '10:00 AM', status: 'available' }, { time: '10:30 AM', status: 'available' },
    { time: '11:00 AM', status: 'booked' }, { time: '11:30 AM', status: 'available' },
    { time: '12:00 PM', status: 'available' }, { time: '12:30 PM', status: 'available' },
    { time: '01:00 PM', status: 'booked' }, { time: '01:30 PM', status: 'available' },
    { time: '02:00 PM', status: 'available' }, { time: '02:30 PM', status: 'available' },
    { time: '03:00 PM', status: 'booked' }, { time: '03:30 PM', status: 'available' },
    { time: '04:00 PM', status: 'available' }, { time: '04:30 PM', status: 'available' },
    { time: '05:00 PM', status: 'available' },
  ];
};

const packages = {
  ps5: { name: 'PS5 Gaming', icon: '🎮', options: [{ hours: 1, price: 99 }, { hours: 3, price: 250 }, { hours: 5, price: 400 }] },
  pc: { name: 'Gaming PC', icon: '🖥️', options: [{ hours: 1, price: 50 }, { hours: 1, price: 60, label: '1 Hour + Controller' }] },
  group: { name: 'Group Gaming', icon: '👥', options: [{ players: 2, price: 150, label: '2 Players/hr' }, { players: 3, price: 200, label: '3 Players/hr' }, { players: 4, price: 250, label: '4 Players/hr' }] },
};

const GamingZone = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState('ps5');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [playerDetails, setPlayerDetails] = useState({ fullName: '', mobileNumber: '', numberOfPlayers: 1, selectedGame: null });
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableTimeSlots, setAvailableTimeSlots] = useState(generateTimeSlots());
  
  const currentPackages = packages[selectedPlatform === 'ps5' ? 'ps5' : (selectedPlatform === 'pc' ? 'pc' : 'group')];
  
  const calculateTotal = () => {
    if (!selectedPackage) return 0;
    return selectedPackage.price;
  };
  
  const handlePackageSelect = (pkg) => { setSelectedPackage(pkg); if (currentStep === 2) setCurrentStep(3); };
  const handleDateSelect = (date) => { setSelectedDate(date); setAvailableTimeSlots(generateTimeSlots()); if (currentStep === 3) setCurrentStep(4); };
  
  // FIXED: Removed auto-advance to avoid async conflict
  const handleTimeSlotSelect = (slot) => {
    if (slot.status === 'booked') return;
    setSelectedTimeSlot(slot);
    // User will click "Continue" to advance
  };

  const handlePlayerDetailChange = (e) => { const { name, value } = e.target; setPlayerDetails(prev => ({ ...prev, [name]: value })); };
  const handleGameSelect = (game) => { setPlayerDetails(prev => ({ ...prev, selectedGame: game })); };
  const handlePlayersCountChange = (e) => { const count = parseInt(e.target.value); setPlayerDetails(prev => ({ ...prev, numberOfPlayers: count })); };
  const nextStep = () => { if (currentStep < 5) setCurrentStep(currentStep + 1); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };
  
  const confirmBooking = () => {
    if (!playerDetails.fullName || !playerDetails.mobileNumber || !selectedPackage || !selectedTimeSlot || !playerDetails.selectedGame) {
      alert('Please fill all required fields'); return;
    }
    setBookingConfirmed(true);
    setTimeout(() => { alert('Booking confirmed! Check your WhatsApp for details.'); }, 500);
  };
  
  const prevMonth = () => { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)); };
  const nextMonth = () => { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)); };
  
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear(); const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1); const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate(); const startingDayOfWeek = firstDay.getDay(); 
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) { days.push(null); }
    for (let i = 1; i <= daysInMonth; i++) { days.push(new Date(year, month, i)); }
    return days;
  };
  
  const isDateSelected = (date) => { return date && selectedDate && date.toDateString() === selectedDate.toDateString(); };
  const formatDate = (date) => { return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=800&fit=crop';
  };

  return (
    <GameZoneLayout>
      <div className="gaming-zone-page">
        {/* HERO BANNER */}
        <div className="gaming-hero">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="hero-badge"><FaFire className="flame-icon"/> PREMIUM GAMING LOUNGE</div>
            <h1 className="hero-title">ENTER THE GAME<br /><span className="highlight">RULE THE ARENA</span></h1>
            <div className="hero-highlights">
              <div className="highlight-item"><span className="emoji">🎮</span> 5 PS5 Consoles</div>
              <div className="highlight-item"><span className="emoji">🖥️</span> 5 High-End Rigs</div>
              <div className="highlight-item"><span className="emoji">🏆</span> Tournaments</div>
            </div>
            <button className="hero-cta" onClick={() => document.getElementById('booking-steps').scrollIntoView({ behavior: 'smooth' })}>
              BOOK YOUR SEAT <FiArrowRight className="btn-icon" />
            </button>
          </div>
        </div>

        {/* PROMOTIONAL BANNERS */}
        <div className="promo-section container">
          <div className="promo-grid">
            {promotionalBanners.map(promo => (
              <div key={promo.id} className="promo-card-game">
                <div className="promo-tag">{promo.tag}</div>
                <div className="promo-icon">{promo.icon}</div>
                <div className="promo-info">
                  <h3>{promo.title}</h3>
                  <p>{promo.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOOKING STEPS SECTION */}
        <div id="booking-steps" className="booking-steps-container">
          <div className="container">
            <div className="section-header">
              <h2>Quick Booking</h2>
              <p>Reserve your rig in seconds</p>
            </div>

            <div className="step-indicators">
              {[1, 2, 3, 4, 5].map(step => (
                <div key={step} className={`step-indicator ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}>
                  <div className="step-number">{step}</div>
                  <div className="step-label">
                    {step === 1 && 'Platform'} {step === 2 && 'Package'} {step === 3 && 'Date & Time'}
                    {step === 4 && 'Details'} {step === 5 && 'Payment'}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Step 1: Select Platform */}
            {currentStep === 1 && (
              <div className="step-card fade-in">
                <h2>STEP 1 – Select Gaming Platform</h2>
                <p className="step-subtitle">Choose your preferred gaming experience.</p>
                <div className="platform-grid">
                  <div className={`platform-card ${selectedPlatform === 'ps5' ? 'selected' : ''}`} onClick={() => { setSelectedPlatform('ps5'); nextStep(); }}>
                    <div className="platform-glow"></div>
                    <div className="platform-icon">🎮</div><h3>PS5 Gaming</h3><div className="platform-availability">Available Consoles: 5</div>
                    <p>Next-gen gaming on PlayStation 5 with the latest AAA titles and immersive DualSense gameplay.</p>
                  </div>
                  <div className={`platform-card ${selectedPlatform === 'pc' ? 'selected' : ''}`} onClick={() => { setSelectedPlatform('pc'); nextStep(); }}>
                    <div className="platform-glow"></div>
                    <div className="platform-icon">🖥️</div><h3>Pro PC Arena</h3><div className="platform-availability">Available PCs: 5 Rigs</div>
                    <p>Play competitive titles on powerful gaming machines built for high framerates and low latency.</p>
                  </div>
                  <div className={`platform-card ${selectedPlatform === 'tournament' ? 'selected' : ''}`} onClick={() => { setSelectedPlatform('tournament'); nextStep(); }}>
                    <div className="platform-glow"></div>
                    <div className="platform-icon">🏆</div><h3>Tournaments</h3><div className="platform-availability">Live Events</div>
                    <p>Register for upcoming esports events, local LAN tournaments, and community gatherings.</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Select Package */}
            {currentStep === 2 && (
              <div className="step-card fade-in">
                <h2>STEP 2 – Select Package</h2>
                <p className="step-subtitle">Choose the package that best suits your gaming session.</p>
                <div className="package-group">
                  <h3><span className="platform-icon-small">{selectedPlatform === 'ps5' ? '🎮' : selectedPlatform === 'pc' ? '🖥️' : '👥'}</span> {packages[selectedPlatform === 'ps5' ? 'ps5' : (selectedPlatform === 'pc' ? 'pc' : 'group')].name} Packages</h3>
                  <div className="package-grid">
                    {currentPackages.options.map((pkg, idx) => (
                      <div key={idx} className={`package-card ${selectedPackage?.price === pkg.price ? 'selected' : ''}`} onClick={() => handlePackageSelect(pkg)}>
                        <div className="package-hours">{pkg.label || `${pkg.hours} Hour${pkg.hours > 1 ? 's' : ''}`}</div>
                        <div className="package-price">₹{pkg.price}</div>
                        {pkg.hours >= 3 && <div className="value-tag">Best Value</div>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="step-actions"><button className="btn-secondary" onClick={prevStep}>Back</button></div>
              </div>
            )}
            
            {/* Step 3: Select Date & Time - FIXED */}
            {currentStep === 3 && (
              <div className="step-card fade-in">
                <h2>STEP 3 – Select Date & Time</h2>
                <p className="step-subtitle">Choose your preferred date and available time slot.</p>
                <div className="datetime-selector">
                  <div className="calendar-section">
                    <div className="calendar-header">
                      <button onClick={prevMonth}>‹</button>
                      <h3>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                      <button onClick={nextMonth}>›</button>
                    </div>
                    <div className="calendar-weekdays">
                      {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                        <div key={day} className="weekday">{day}</div>
                      ))}
                    </div>
                    <div className="calendar-days">
                      {getCalendarDays().map((date, idx) => (
                        <div
                          key={idx}
                          className={`calendar-day ${date ? '' : 'empty'} ${date && isDateSelected(date) ? 'selected' : ''}`}
                          onClick={() => date && handleDateSelect(date)}
                        >
                          {date ? date.getDate() : ''}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="timeslots-section">
                    <h3>Available Time Slots</h3>
                    <div className="slot-legend">
                      <span className="legend-item"><span className="legend-box available"></span> Available</span>
                      <span className="legend-item"><span className="legend-box booked"></span> Booked</span>
                      <span className="legend-item"><span className="legend-box selected"></span> Selected</span>
                    </div>
                    {['AM', 'PM'].map(period => (
                      <div key={period} className="slot-group">
                        <h4>{period === 'AM' ? 'Morning Slots' : 'Evening Slots'}</h4>
                        <div className="slot-grid">
                          {availableTimeSlots
                            .filter(s => s.time.includes(period))
                            .map((slot, idx) => (
                              <button
                                key={idx}
                                className={`time-slot ${slot.status} ${selectedTimeSlot?.time === slot.time ? 'selected' : ''}`}
                                disabled={slot.status === 'booked'}
                                onClick={() => handleTimeSlotSelect(slot)}
                              >
                                {slot.time}
                              </button>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="step-actions">
                  <button className="btn-secondary" onClick={prevStep}>Back</button>
                  <button
                    className="btn-primary"
                    onClick={nextStep}
                    disabled={!selectedTimeSlot}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 4: Player Details */}
            {currentStep === 4 && (
              <div className="step-card fade-in">
                <h2>STEP 4 – Player Details</h2>
                <p className="step-subtitle">Please provide your information to continue.</p>
                <div className="player-details-form">
                  <div className="form-row">
                    <div className="form-group"><label>Full Name *</label><input type="text" name="fullName" value={playerDetails.fullName} onChange={handlePlayerDetailChange} placeholder="Enter your name" /></div>
                    <div className="form-group"><label>Mobile Number *</label><input type="tel" name="mobileNumber" value={playerDetails.mobileNumber} onChange={handlePlayerDetailChange} placeholder="Enter mobile number" /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Number of Players</label>
                      <select name="numberOfPlayers" value={playerDetails.numberOfPlayers} onChange={handlePlayersCountChange}>
                        {[1,2,3,4,5].map(num => <option key={num} value={num}>{num} Player{num > 1 ? 's' : ''}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Select Primary Game *</label>
                    <div className="games-grid">
                      {availableGames.map(game => (
                        <div key={game.id} className={`game-card ${playerDetails.selectedGame?.id === game.id ? 'selected' : ''}`} onClick={() => handleGameSelect(game)}>
                          <img src={game.image} alt={game.name} onError={handleImageError} />
                          <div className="game-info"><div className="game-name">{game.name}</div><div className="game-genre">{game.genre}</div></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="step-actions"><button className="btn-secondary" onClick={prevStep}>Back</button><button className="btn-primary" onClick={nextStep}>Continue</button></div>
              </div>
            )}
            
            {/* Step 5: Payment Method */}
            {currentStep === 5 && (
              <div className="step-card fade-in">
                <h2>STEP 5 – Checkout</h2>
                <p className="step-subtitle">Choose your preferred payment option to confirm booking.</p>
                
                <div className="checkout-layout">
                  <div className="payment-methods">
                    <div className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`} onClick={() => setPaymentMethod('upi')}><FiSmartphone className="pay-icon" /> <span>UPI</span></div>
                    <div className={`payment-option ${paymentMethod === 'phonepe' ? 'selected' : ''}`} onClick={() => setPaymentMethod('phonepe')}><SiPhonepe className="pay-icon" /> <span>PhonePe</span></div>
                    <div className={`payment-option ${paymentMethod === 'googlepay' ? 'selected' : ''}`} onClick={() => setPaymentMethod('googlepay')}><FaGooglePay className="pay-icon" /> <span>GPay</span></div>
                    <div className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`} onClick={() => setPaymentMethod('cash')}><FiDollarSign className="pay-icon" /> <span>Cash at Counter</span></div>
                  </div>

                  <div className="booking-summary-preview">
                    <h3>Order Summary</h3>
                    <div className="summary-details">
                      <div className="summary-row"><span>Platform:</span> <span>{selectedPlatform.toUpperCase()}</span></div>
                      <div className="summary-row"><span>Package:</span> <span>{selectedPackage?.label || `${selectedPackage?.hours} Hours`}</span></div>
                      <div className="summary-row"><span>Date & Time:</span> <span>{formatDate(selectedDate)} at {selectedTimeSlot?.time}</span></div>
                      <div className="summary-divider"></div>
                      <div className="summary-row total"><span>Total Payable:</span> <strong>₹{calculateTotal()}</strong></div>
                    </div>
                  </div>
                </div>
                <div className="step-actions"><button className="btn-secondary" onClick={prevStep}>Back</button><button className="btn-primary confirm-btn" onClick={confirmBooking}><FiLock /> CONFIRM & PAY</button></div>
              </div>
            )}
          </div>
        </div>

        {/* ENVIRONMENT SHOWCASE */}
        <div className="environment-section">
          <div className="container">
            <div className="section-header center">
              <h2>The Setup</h2>
              <p>Experience gaming in a premium environment</p>
            </div>
            <div className="env-grid">
              {environmentShowcase.map(env => (
                <div key={env.id} className="env-card">
                  <img src={env.image} alt={env.title} className="env-image" onError={handleImageError} />
                  <div className="env-content">
                    <h3>{env.title}</h3>
                    <p>{env.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TOP GAMES GALLERY */}
        <div className="gallery-section">
          <div className="container">
            <div className="section-header center">
              <h2>Trending Now</h2>
              <p>Top played games in our arena</p>
            </div>
            <div className="gallery-grid">
              {gameGallery.map(game => (
                <div key={game.id} className={`gallery-card ${game.size}`}>
                  <img src={game.image} alt={game.title} onError={handleImageError} />
                  <div className="gallery-overlay">
                    <span className="gallery-category">{game.category}</span>
                    <h3>{game.title}</h3>
                    <a href={game.link} className="gallery-link">View Stats <FiExternalLink /></a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sticky Booking Summary */}
        {selectedPackage && currentStep < 5 && (
          <div className="booking-sticky-summary">
            <div className="summary-card">
              <h3>Current Booking</h3>
              <div className="summary-item"><span>Platform</span><strong>{selectedPlatform === 'ps5' ? 'PS5' : selectedPlatform === 'pc' ? 'PC' : 'Tournament'}</strong></div>
              <div className="summary-item"><span>Package</span><strong>{selectedPackage?.hours ? `${selectedPackage.hours}H` : selectedPackage?.label || ''}</strong></div>
              {selectedDate && <div className="summary-item"><span>Date</span><strong>{selectedDate.toLocaleDateString('en-IN', {day:'numeric', month:'short'})}</strong></div>}
              {selectedTimeSlot && <div className="summary-item"><span>Time</span><strong>{selectedTimeSlot.time}</strong></div>}
              <div className="summary-item total"><span>Total</span><strong>₹{calculateTotal()}</strong></div>
            </div>
          </div>
        )}
        
        {/* Footer Benefits */}
        <div className="benefits-section">
          <div className="container">
             <div className="benefits-grid">
                <div className="benefit-card"><FiCheckCircle className="b-icon" /> Live Availability</div>
                <div className="benefit-card"><FaWhatsapp className="b-icon" /> WhatsApp Alerts</div>
                <div className="benefit-card"><FiCoffee className="b-icon" /> Food & Beverages</div>
                <div className="benefit-card"><FiShield className="b-icon" /> Secure Accounts</div>
             </div>
          </div>
        </div>

      </div>
    </GameZoneLayout>
  );
};

export default GamingZone;