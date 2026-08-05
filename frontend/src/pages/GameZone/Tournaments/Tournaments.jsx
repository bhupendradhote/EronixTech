import React, { useState, useEffect } from 'react';
import {
  FiCalendar, FiClock, FiUsers, FiMapPin, FiDollarSign,
  FiChevronRight, FiX, FiCheckCircle, FiZap, FiShield, FiStar,
  FiAlertCircle, FiLock, FiSmartphone, FiAward, FiTrendingUp,
  FiHelpCircle, FiChevronDown, FiChevronUp, FiTwitter, FiYoutube
} from 'react-icons/fi';
import { FaWhatsapp, FaTrophy, FaGamepad, FaGooglePay, FaDiscord, FaTwitch, FaTwitter, FaYoutube } from 'react-icons/fa';import { SiPhonepe } from 'react-icons/si';
import GameZoneLayout from '../../../components/layout/GameZoneLayout';
import '../../GameZone/GamingZone.css'; 

// Mock tournament data
const tournamentsData = [
  {
    id: 1, title: "EA FC 26 Champions Cup", game: "EA FC 26", gameIcon: "⚽", date: "April 15-17, 2026",
    time: "10:00 AM IST", venue: "Online & Arena", prizePool: "₹1,50,000", entryFee: 499, slots: 64, registered: 60,
    status: "upcoming", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=400&fit=crop"
  },
  {
    id: 2, title: "BGMI Battle Royale", game: "BGMI", gameIcon: "🔫", date: "April 20-22, 2026",
    time: "4:00 PM IST", venue: "Online", prizePool: "₹2,00,000", entryFee: 999, slots: 128, registered: 98,
    status: "upcoming", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop"
  },
  {
    id: 3, title: "Valorant India Open", game: "Valorant", gameIcon: "🎯", date: "April 5-7, 2026",
    time: "2:00 PM IST", venue: "Eronix Arena & Online", prizePool: "₹3,00,000", entryFee: 1499, slots: 32, registered: 32,
    status: "live", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop"
  },
  {
    id: 4, title: "CS2 Weekend Showdown", game: "Counter-Strike 2", gameIcon: "💣", date: "March 28-30, 2026",
    time: "12:00 PM IST", venue: "Eronix Arena", prizePool: "₹80,000", entryFee: 299, slots: 48, registered: 48,
    status: "completed", image: "https://images.unsplash.com/photo-1493711662285-585847dc6ce4?w=600&h=400&fit=crop"
  }
];

// Extended prize pool breakdown (example for featured tournament)
const prizeBreakdown = [
  { rank: "Champion", amount: "₹1,50,000", percentage: 50 },
  { rank: "Runner Up", amount: "₹75,000", percentage: 25 },
  { rank: "3rd Place", amount: "₹40,000", percentage: 13 },
  { rank: "4th Place", amount: "₹20,000", percentage: 7 },
  { rank: "MVP Award", amount: "₹15,000", percentage: 5 }
];

const activeGamesList = [...new Map(tournamentsData.map(item => [item.game, item])).values()].map(t => ({ name: t.game, icon: t.gameIcon }));

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

// Mock leaderboard / past winners
const pastWinners = [
  { tournament: "BGMI Champions Cup", winner: "Team XSpark", prize: "₹2,00,000", date: "Feb 2026" },
  { tournament: "Valorant Elite Series", winner: "Global Esports", prize: "₹3,00,000", date: "Jan 2026" },
  { tournament: "EA FC 25 Showdown", winner: "FC Bangalore", prize: "₹1,00,000", date: "Dec 2025" }
];

// Testimonials
const testimonials = [
  { name: "Rohan Sharma", team: "Team Vortex", text: "Amazing experience! The tournament was well-organized and the competition was top-notch. Can't wait for the next one.", rating: 5 },
  { name: "Priya Mehta", team: "GamerGirls", text: "First time participating and we had a blast. The staff was super helpful and the live streaming was professional.", rating: 5 },
  { name: "Aarav Singh", team: "Elite Warriors", text: "Won the runner-up prize! Great atmosphere and fair play. Highly recommended for serious gamers.", rating: 4 }
];

// FAQs
const faqs = [
  { q: "How do I register for a tournament?", a: "Click on 'Book Slot' on any tournament card, fill your team details, select a time slot, and complete payment. You'll receive a confirmation WhatsApp message." },
  { q: "What is the refund policy?", a: "Registrations are non-refundable, but you can transfer your slot to another team up to 48 hours before the event by contacting support." },
  { q: "Are the tournaments online or offline?", a: "We host both! Check the 'Venue' tag on each tournament – it will say 'Online' or 'Eronix Arena' (offline)." },
  { q: "Can I participate solo?", a: "Yes! For team games you can register as a 'free agent' and we'll help you find teammates. Contact our Discord community." }
];

const Tournaments = () => {
  const [filter, setFilter] = useState('upcoming');
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  
  // Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [currentModalStep, setCurrentModalStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Registration Data
  const [registrationData, setRegistrationData] = useState({
    teamName: '', captainName: '', email: '', phone: '', playerCount: 1, playerNames: ['']
  });

  // Calendar & Slot State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState(generateTimeSlots());

  const filteredTournaments = tournamentsData.filter(t => t.status === filter);
  const featuredTournament = tournamentsData.find(t => t.status === 'upcoming');

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop';
  };

  useEffect(() => {
    if (!featuredTournament) return;
    const targetDate = new Date(`${featuredTournament.date.split('-')[0].trim()}, 2026 ${featuredTournament.time.replace(' IST', '')}`);
    if (isNaN(targetDate.getTime())) return;

    const interval = setInterval(() => {
      const diff = targetDate - new Date();
      if (diff <= 0) {
        clearInterval(interval);
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [featuredTournament]);

  // Form Handlers
  const handleRegChange = (e) => setRegistrationData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handlePlayerNameChange = (index, value) => {
    const newNames = [...registrationData.playerNames];
    newNames[index] = value;
    setRegistrationData(prev => ({ ...prev, playerNames: newNames }));
  };
  const handlePlayerCountChange = (e) => {
    const count = parseInt(e.target.value);
    setRegistrationData(prev => ({ ...prev, playerCount: count, playerNames: Array(count).fill('') }));
  };

  // Step Navigation
  const proceedToSlotSelection = (e) => {
    e.preventDefault();
    if (!registrationData.teamName || !registrationData.captainName || !registrationData.email || !registrationData.phone) {
      alert('Please fill all required fields'); return;
    }
    setCurrentModalStep(2);
  };
  
  const proceedToPayment = () => {
    if(!selectedDate || !selectedTimeSlot) {
        alert('Please select a date and time slot.'); return;
    }
    setCurrentModalStep(3);
  };

  const handleConfirmPayment = () => {
    setCurrentModalStep(4);
    setTimeout(() => {
      setShowRegisterModal(false);
      setCurrentModalStep(1);
      setRegistrationData({ teamName: '', captainName: '', email: '', phone: '', playerCount: 1, playerNames: [''] });
      setSelectedTimeSlot(null);
    }, 3000);
  };

  const openRegisterModal = (tournament) => {
    setSelectedTournament(tournament);
    setCurrentModalStep(1);
    setShowRegisterModal(true);
  };

  // Calendar Helpers
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear(); const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1); const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 0; i < firstDay.getDay() - 1; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  const isDateSelected = (date) => date && selectedDate && date.toDateString() === selectedDate.toDateString();
  const handleDateSelect = (date) => { setSelectedDate(date); setAvailableTimeSlots(generateTimeSlots()); };
  const handleTimeSlotSelect = (slot) => { if (slot.status !== 'booked') setSelectedTimeSlot(slot); };

  const getSlotDetails = (registered, total) => ({
    percentage: (registered / total) * 100,
    isAlmostFull: (registered / total) * 100 >= 85,
    isFull: registered >= total
  });

  return (
    <GameZoneLayout>
      <div className="tournaments-page">
        {/* HERO SECTION */}
        <div className="tournament-hero">
          <div className="hero-overlay"></div>
          <div className="container">
            <div className="hero-content">
              <div className="hero-badge"><FaTrophy /> ESPORTS TOURNAMENTS</div>
              <h1 className="hero-title">BATTLE FOR<br /><span className="highlight">GLORY & PRIZES</span></h1>
              <p className="hero-desc">Compete against the best, secure your slot, and earn your place on the leaderboard.</p>
              <div className="hero-stats">
                <div className="stat"><span>₹8L+</span> Total Prizes</div>
                <div className="stat"><span>500+</span> Gamers</div>
                <div className="stat"><span>12+</span> Active Events</div>
              </div>
              <button className="hero-cta" onClick={() => document.getElementById('tournament-list').scrollIntoView({ behavior: 'smooth' })}>
                Book Your Slot <FiChevronRight />
              </button>
            </div>
          </div>
        </div>

        {/* LIVE UPDATES TICKER (NEW) */}
        <div className="active-games-section" style={{ background: '#0a0a0f', borderTop: '1px solid var(--border-light)' }}>
          <div className="container">
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div style={{ display: 'inline-block', animation: 'ticker 20s linear infinite' }}>
                <span style={{ marginRight: '40px' }}>⚡ LIVE: Valorant India Open – Quarterfinals underway!</span>
                <span style={{ marginRight: '40px' }}>🏆 BGMI Battle Royale – Only 30 slots left! Register now.</span>
                <span style={{ marginRight: '40px' }}>🎮 EA FC 26 Champions Cup – Early bird discount ends tomorrow!</span>
                <span style={{ marginRight: '40px' }}>🔥 New tournament added: Call of Duty Mobile – ₹50k prize pool.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIVE GAMES SCROLLER */}
        <div className="active-games-section">
          <div className="container">
            <div className="active-games-header"><h3><FaGamepad /> Active Games Hosting Tournaments</h3></div>
            <div className="games-scroller">
              {activeGamesList.map((game, idx) => (
                <div key={idx} className="game-pill"><span className="game-pill-icon">{game.icon}</span><span className="game-pill-name">{game.name}</span></div>
              ))}
            </div>
          </div>
        </div>

        {/* FEATURED TOURNAMENT (ENHANCED) */}
        {featuredTournament && (
          <div className="container featured-section">
            <div className="featured-card">
              <div className="featured-image">
                <img src={featuredTournament.image} alt={featuredTournament.title} onError={handleImageError} />
                <div className="featured-status">🔥 FEATURED EVENT</div>
              </div>
              <div className="featured-info">
                <h2>{featuredTournament.title}</h2>
                <div className="featured-meta">
                  <span><FiCalendar /> {featuredTournament.date}</span>
                  <span><FiClock /> {featuredTournament.time}</span>
                  <span><FiMapPin /> {featuredTournament.venue}</span>
                  <span><FaTrophy /> {featuredTournament.prizePool}</span>
                </div>
                <div className="countdown-timer">
                  <div className="countdown-item"><span>{countdown.days}</span> Days</div>
                  <div className="countdown-item"><span>{countdown.hours}</span> Hours</div>
                  <div className="countdown-item"><span>{countdown.minutes}</span> Mins</div>
                  <div className="countdown-item"><span>{countdown.seconds}</span> Secs</div>
                </div>
                <button className="btn-register-featured" onClick={() => openRegisterModal(featuredTournament)}>
                  Register Now <FiChevronRight />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PRIZE POOL BREAKDOWN (NEW) */}
        <div className="container" style={{ marginTop: '40px', marginBottom: '40px' }}>
          <div className="section-header">
            <h2>Prize Pool Distribution</h2>
            <p>Check how the rewards are split among top performers</p>
          </div>
          <div className="prize-breakdown" style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-light)' }}>
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><FiAward /> Top 5 Prizes</h3>
                {prizeBreakdown.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>{item.rank}</span>
                      <strong>{item.amount}</strong>
                    </div>
                    <div style={{ height: '6px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${item.percentage}%`, height: '100%', background: 'var(--accent-main)' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '250px', background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-light)' }}>
              <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><FiTrendingUp /> Why Participate?</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '12px', display: 'flex', gap: '10px' }}><FiCheckCircle color="#10b981" /> Guaranteed prize pool distribution</li>
                <li style={{ marginBottom: '12px', display: 'flex', gap: '10px' }}><FiCheckCircle color="#10b981" /> Professional live streaming on Twitch</li>
                <li style={{ marginBottom: '12px', display: 'flex', gap: '10px' }}><FiCheckCircle color="#10b981" /> Ranking points for national leaderboard</li>
                <li style={{ marginBottom: '12px', display: 'flex', gap: '10px' }}><FiCheckCircle color="#10b981" /> Free practice sessions before event</li>
              </ul>
            </div>
          </div>
        </div>

        {/* TOURNAMENT LIST GRID */}
        <div id="tournament-list" className="tournament-list-section">
          <div className="container">
            <div className="section-header">
              <h2>Active & Upcoming Tournaments</h2>
              <p>Check slot availability and register before they fill up</p>
            </div>

            <div className="filter-tabs">
              <button className={filter === 'upcoming' ? 'active' : ''} onClick={() => setFilter('upcoming')}>Registration Open</button>
              <button className={filter === 'live' ? 'active' : ''} onClick={() => setFilter('live')}>Live Matches</button>
              <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>Past Results</button>
            </div>

            <div className="tournament-grid">
              {filteredTournaments.map(tournament => {
                const { percentage, isAlmostFull, isFull } = getSlotDetails(tournament.registered, tournament.slots);
                return (
                  <div key={tournament.id} className={`tournament-card ${tournament.status}`}>
                    <div className="card-image">
                      <img src={tournament.image} alt={tournament.title} onError={handleImageError} />
                      <div className={`status-badge ${tournament.status}`}>{tournament.status === 'live' ? 'LIVE NOW' : tournament.status === 'upcoming' ? 'BOOKING OPEN' : 'COMPLETED'}</div>
                    </div>
                    <div className="card-content">
                      <div className="game-icon">{tournament.gameIcon}</div>
                      <h3>{tournament.title}</h3>
                      <div className="card-meta"><span><FiCalendar /> {tournament.date}</span><span><FiClock /> {tournament.time}</span></div>
                      
                      <div className="slot-booking-container">
                        <div className="slot-booking-header">
                          <span className="slot-title"><FiUsers /> Slot Availability</span>
                          <span className={`slot-count ${isAlmostFull ? 'urgent' : ''}`}>{tournament.registered} / {tournament.slots}</span>
                        </div>
                        <div className="slot-progress-bg"><div className={`slot-progress-fill ${isAlmostFull ? 'danger' : ''} ${isFull ? 'full' : ''}`} style={{ width: `${percentage}%` }}></div></div>
                        {isAlmostFull && !isFull && tournament.status === 'upcoming' && <div className="slot-warning">Selling out fast!</div>}
                      </div>

                      <div className="card-footer">
                        <span className="entry-fee">Fee: ₹{tournament.entryFee}</span>
                        {tournament.status === 'completed' || isFull ? (
                          <button className="btn-view" disabled>{isFull ? 'Fully Booked' : 'View Details'}</button>
                        ) : (
                          <button className="btn-register" onClick={() => openRegisterModal(tournament)}>Book Slot</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* HOW IT WORKS (NEW) */}
        <div className="howto-section">
          <div className="container">
            <div className="section-header">
              <h2>How to Participate</h2>
              <p>Four simple steps to join the battle</p>
            </div>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">01</div>
                <h3>Choose Tournament</h3>
                <p>Browse through our list and pick the game you want to compete in. Check slot availability and prize pool.</p>
              </div>
              <div className="step-card">
                <div className="step-number">02</div>
                <h3>Register Team</h3>
                <p>Fill in your team details, captain info, and player names. Select your preferred match date & time slot.</p>
              </div>
              <div className="step-card">
                <div className="step-number">03</div>
                <h3>Secure Payment</h3>
                <p>Pay the entry fee via UPI, card, or cash at our arena. Receive instant confirmation on WhatsApp.</p>
              </div>
              <div className="step-card">
                <div className="step-number">04</div>
                <h3>Compete & Win</h3>
                <p>Join the lobby on match day, play fair, and climb the leaderboard to win exciting prizes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* LEADERBOARD / PAST WINNERS (NEW) */}
        <div className="container" style={{ marginBottom: '60px' }}>
          <div className="section-header">
            <h2>Past Champions</h2>
            <p>Meet the winners from our recent tournaments</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {pastWinners.map((winner, idx) => (
              <div key={idx} style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                <FaTrophy style={{ fontSize: '32px', color: 'var(--accent-main)', marginBottom: '12px' }} />
                <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>{winner.tournament}</h3>
                <p style={{ color: 'var(--accent-main)', fontWeight: 'bold' }}>{winner.winner}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{winner.prize} • {winner.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TESTIMONIALS (NEW) */}
        <div className="benefits-section" style={{ background: 'var(--bg-primary)' }}>
          <div className="container">
            <div className="section-header">
              <h2>What Gamers Say</h2>
              <p>Trusted by hundreds of esports enthusiasts</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {testimonials.map((t, idx) => (
                <div key={idx} style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', color: '#fbbf24' }}>
                    {[...Array(t.rating)].map((_, i) => <FiStar key={i} fill="currentColor" />)}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>"{t.text}"</p>
                  <div>
                    <strong>{t.name}</strong>
                    <span style={{ color: 'var(--accent-main)', fontSize: '13px', display: 'block' }}>{t.team}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SPONSORS & PARTNERS (NEW) */}
        <div className="container" style={{ margin: '60px auto', textAlign: 'center' }}>
          <div className="section-header">
            <h2>Our Partners & Sponsors</h2>
            <p>Powered by industry leaders</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '40px', alignItems: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px 24px', borderRadius: '12px' }}>🎮 Logitech G</div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px 24px', borderRadius: '12px' }}>💻 AMD Gaming</div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px 24px', borderRadius: '12px' }}>🔊 HyperX</div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px 24px', borderRadius: '12px' }}>🥤 Mountain Dew</div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px 24px', borderRadius: '12px' }}>📺 Loco</div>
          </div>
        </div>

        {/* FAQ SECTION (NEW) */}
        <div className="container" style={{ marginBottom: '80px' }}>
          <div className="section-header">
            <h2>Frequently Asked Questions</h2>
            <p>Got questions? We have answers.</p>
          </div>
          <div style={{ margin: '0 auto' }}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ marginBottom: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  style={{ width: '100%', padding: '18px 24px', background: 'transparent', border: 'none', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: 'var(--text-main)', fontWeight: '600' }}
                >
                  {faq.q}
                  {openFaqIndex === idx ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {openFaqIndex === idx && (
                  <div style={{ padding: '0 24px 24px 24px', color: 'var(--text-muted)', lineHeight: '1.6', borderTop: '1px solid var(--border-light)' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SOCIAL & COMMUNITY BAR (NEW) */}
        <div className="benefits-footer">
          <div className="container">
            <div className="benefits-grid">
              <div className="benefit"><FaDiscord /> Join Discord</div>
              <div className="benefit"><FaTwitch /> Watch Live</div>
              <div className="benefit"><FaTwitter /> Follow Updates</div>
              <div className="benefit"><FaYoutube /> Match Highlights</div>
            </div>
          </div>
        </div>

        {/* 4-STEP REGISTRATION MODAL (unchanged) */}
        {showRegisterModal && selectedTournament && (
          <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
            <div className={`modal-container ${currentModalStep === 2 ? 'modal-large' : ''}`} onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowRegisterModal(false)}><FiX /></button>
              
              <h2>{selectedTournament.title}</h2>
              <div className="modal-slot-info">
                <FiAlertCircle /> Only <strong>{selectedTournament.slots - selectedTournament.registered} slots</strong> remaining!
              </div>
              
              {/* Step Indicators */}
              <div className="modal-step-indicators step-4-grid">
                <div className={`modal-step ${currentModalStep >= 1 ? 'active' : ''}`}>1. Details</div>
                <div className={`modal-step ${currentModalStep >= 2 ? 'active' : ''}`}>2. Slot</div>
                <div className={`modal-step ${currentModalStep >= 3 ? 'active' : ''}`}>3. Payment</div>
                <div className={`modal-step ${currentModalStep >= 4 ? 'active' : ''}`}>4. Confirm</div>
              </div>

              {/* Step 1: Team Details */}
              {currentModalStep === 1 && (
                <form className="modal-fade-in" onSubmit={proceedToSlotSelection}>
                  <div className="form-group"><label>Team Name *</label><input type="text" name="teamName" value={registrationData.teamName} onChange={handleRegChange} placeholder="Enter your team name" required /></div>
                  <div className="form-group"><label>Captain Name *</label><input type="text" name="captainName" value={registrationData.captainName} onChange={handleRegChange} placeholder="Full name of captain" required /></div>
                  <div className="form-row">
                    <div className="form-group"><label>Email *</label><input type="email" name="email" value={registrationData.email} onChange={handleRegChange} placeholder="Email address" required /></div>
                    <div className="form-group"><label>Phone (WhatsApp) *</label><input type="tel" name="phone" value={registrationData.phone} onChange={handleRegChange} placeholder="WhatsApp number" required /></div>
                  </div>
                  <div className="form-group"><label>Number of Players</label><select name="playerCount" value={registrationData.playerCount} onChange={handlePlayerCountChange}>
                    {[1,2,3,4,5].map(num => <option key={num} value={num}>{num} Player{num > 1 ? 's' : ''}</option>)}
                  </select></div>
                  {registrationData.playerNames.map((_, idx) => (
                    <div key={idx} className="form-group"><label>Player {idx+1} Name {idx === 0 ? '(Captain)' : ''}</label><input type="text" value={registrationData.playerNames[idx]} onChange={(e) => handlePlayerNameChange(idx, e.target.value)} placeholder={`Player ${idx+1} full name`} /></div>
                  ))}
                  <button type="submit" className="btn-submit">Next: Select Slot <FiChevronRight /></button>
                </form>
              )}

              {/* Step 2: Date & Time Selection */}
              {currentModalStep === 2 && (
                <div className="modal-fade-in step-card-embedded">
                  <h3 className="checkout-title">STEP 2 – Select Match Slot</h3>
                  <p className="step-subtitle">Choose your preferred date and available time slot.</p>
                  
                  <div className="datetime-selector">
                    <div className="calendar-section">
                      <div className="calendar-header">
                        <button type="button" onClick={prevMonth}>‹</button>
                        <h3>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                        <button type="button" onClick={nextMonth}>›</button>
                      </div>
                      <div className="calendar-weekdays">
                        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => <div key={day} className="weekday">{day}</div>)}
                      </div>
                      <div className="calendar-days">
                        {getCalendarDays().map((date, idx) => (
                          <div key={idx} className={`calendar-day ${!date ? 'empty' : ''} ${isDateSelected(date) ? 'selected' : ''}`} onClick={() => date && handleDateSelect(date)}>
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
                            {availableTimeSlots.filter(s => s.time.includes(period)).map((slot, idx) => (
                              <button key={idx} type="button" className={`time-slot ${slot.status} ${selectedTimeSlot?.time === slot.time ? 'selected' : ''}`} disabled={slot.status === 'booked'} onClick={() => handleTimeSlotSelect(slot)}>
                                {slot.time}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="modal-actions" style={{marginTop: '30px'}}>
                    <button className="btn-secondary-modal" onClick={() => setCurrentModalStep(1)}>Back</button>
                    <button className="btn-submit" disabled={!selectedTimeSlot} onClick={proceedToPayment}>Proceed to Payment <FiChevronRight /></button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Checkout */}
              {currentModalStep === 3 && (
                <div className="modal-fade-in">
                  <h3 className="checkout-title">Select Payment Method</h3>
                  <div className="payment-grid">
                    <div className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`} onClick={() => setPaymentMethod('upi')}><FiSmartphone className="pay-icon" /> <span>UPI</span></div>
                    <div className={`payment-option ${paymentMethod === 'phonepe' ? 'selected' : ''}`} onClick={() => setPaymentMethod('phonepe')}><SiPhonepe className="pay-icon" /> <span>PhonePe</span></div>
                    <div className={`payment-option ${paymentMethod === 'googlepay' ? 'selected' : ''}`} onClick={() => setPaymentMethod('googlepay')}><FaGooglePay className="pay-icon" /> <span>GPay</span></div>
                    <div className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`} onClick={() => setPaymentMethod('cash')}><FiDollarSign className="pay-icon" /> <span>Counter</span></div>
                  </div>

                  <div className="modal-summary">
                    <div className="summary-row"><span>Tournament:</span><span>{selectedTournament.title}</span></div>
                    <div className="summary-row"><span>Slot:</span><span>{selectedDate.toLocaleDateString()} at {selectedTimeSlot?.time}</span></div>
                    <div className="summary-row"><span>Entry Fee:</span><span>₹{selectedTournament.entryFee}</span></div>
                    <div className="summary-row total"><span>Total Payable:</span><span>₹{selectedTournament.entryFee}</span></div>
                  </div>

                  <div className="modal-actions">
                    <button className="btn-secondary-modal" onClick={() => setCurrentModalStep(2)}>Back</button>
                    <button className="btn-submit confirm" onClick={handleConfirmPayment}><FiLock /> Confirm & Pay</button>
                  </div>
                </div>
              )}

              {/* Step 4: Success */}
              {currentModalStep === 4 && (
                <div className="modal-fade-in success-state">
                  <div className="success-icon-wrapper"><FiCheckCircle className="success-icon-large" /></div>
                  <h3>Slot Secured Successfully!</h3>
                  <p>Your team <strong>{registrationData.teamName}</strong> is registered for {selectedTournament.title}.</p>
                  <p>Match Time: <strong>{selectedDate.toLocaleDateString()} at {selectedTimeSlot?.time}</strong></p>
                  <p className="success-note">Lobby details have been sent to {registrationData.phone} via WhatsApp.</p>
                </div>
              )}

            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes ticker {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
      </div>
    </GameZoneLayout>
  );
};

export default Tournaments;