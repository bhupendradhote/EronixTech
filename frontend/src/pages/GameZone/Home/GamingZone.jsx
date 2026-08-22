// src/pages/GameZone/Home/GamingZone.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  FiHome, FiCalendar, FiGift, FiAward, FiMapPin, FiClock, FiUsers,
  FiMonitor, FiShoppingCart, FiBell, FiUser, FiPhone, FiMail,
  FiCheckCircle, FiDollarSign, FiCreditCard, FiSmartphone, FiCoffee,
  FiStar, FiShield, FiZap, FiHeadphones, FiHeart, FiMessageCircle, FiLock,
  FiArrowRight, FiExternalLink, FiPlus, FiMinus
} from 'react-icons/fi';
import { FaWhatsapp, FaGooglePay, FaGamepad, FaTrophy, FaFire } from 'react-icons/fa';

import GameZoneLayout from '../../../components/layout/GameZoneLayout';
import '../../GameZone/GamingZone.css';
import gameBookingService from '../../../services/gameBookingService';
import gameRateService from '../../../services/gameRateService';
import gameService from '../../../services/gameService';
import gameDeviceService from '../../../services/gameDeviceService';
import posService from '../../../services/posService';
import paymentService from '../../../services/paymentService';

// Promotional banners
const promotionalBanners = [
  { id: 1, title: 'Night Owl Pass', desc: 'Play from 10 PM to 6 AM for just ₹500', icon: <FiClock />, tag: 'HOT DEAL' },
  { id: 2, title: 'Weekend Tournament', desc: 'Join the EA FC Cup & win ₹10,000', icon: <FaTrophy />, tag: 'ESPORTS' },
  { id: 3, title: 'Squad Offer', desc: 'Book 4 PCs, get 1 hour absolutely free', icon: <FiUsers />, tag: 'CO-OP' }
];

const generateTimeSlots = () => [
  { time: '10:00 AM', status: 'available' }, { time: '10:30 AM', status: 'available' },
  { time: '11:00 AM', status: 'available' }, { time: '11:30 AM', status: 'available' },
  { time: '12:00 PM', status: 'available' }, { time: '12:30 PM', status: 'available' },
  { time: '01:00 PM', status: 'available' }, { time: '01:30 PM', status: 'available' },
  { time: '02:00 PM', status: 'available' }, { time: '02:30 PM', status: 'available' },
  { time: '03:00 PM', status: 'available' }, { time: '03:30 PM', status: 'available' },
  { time: '04:00 PM', status: 'available' }, { time: '04:30 PM', status: 'available' },
  { time: '05:00 PM', status: 'available' },
];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const BookingSummary = ({ selectedPlatform, selectedDuration, selectedDate, selectedTimeSlot, selectedDevice, cartAddons, calculateTotal, calculateGamingTotal, calculateAddonsTotal, selectedRate }) => {
  if (!selectedRate) return null;

  return (
    <div className="booking-summary-panel">
      <div className="summary-header">
        <FiClock className="summary-icon" />
        <span>Current Booking</span>
      </div>
      <div className="summary-body">
        <div className="summary-item">
          <span>Platform</span>
          <strong>{selectedPlatform.toUpperCase()}</strong>
        </div>
        <div className="summary-item">
          <span>Duration</span>
          <strong>{selectedDuration} Hr{selectedDuration > 1 ? 's' : ''}</strong>
        </div>
        {selectedDate && (
          <div className="summary-item">
            <span>Date</span>
            <strong>{selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
          </div>
        )}
        {selectedTimeSlot && (
          <div className="summary-item">
            <span>Time</span>
            <strong>{selectedTimeSlot.time}</strong>
          </div>
        )}
        {selectedDevice && (
          <div className="summary-item">
            <span>Station</span>
            <strong>{selectedDevice.name}</strong>
          </div>
        )}
        {cartAddons.length > 0 && (
          <div className="summary-item">
            <span>Add-ons</span>
            <strong>{cartAddons.reduce((acc, a) => acc + a.qty, 0)} Items</strong>
          </div>
        )}
        <div className="summary-divider"></div>
        <div className="summary-item">
          <span>Gaming</span>
          <strong>₹{calculateGamingTotal().toFixed(2)}</strong>
        </div>
        {cartAddons.length > 0 && (
          <div className="summary-item">
            <span>F&B</span>
            <strong>₹{calculateAddonsTotal().toFixed(2)}</strong>
          </div>
        )}
        <div className="summary-divider"></div>
        <div className="summary-item total">
          <span>Total</span>
          <strong>₹{calculateTotal().toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
};

const GamingZone = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState('ps5');
  const [dataLoading, setDataLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const [rates, setRates] = useState([]);
  const [games, setGames] = useState([]);
  const [devices, setDevices] = useState([]);
  const [quickButtons, setQuickButtons] = useState([]);
  const [salespersons, setSalespersons] = useState([]);

  const [selectedRate, setSelectedRate] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const [playerDetails, setPlayerDetails] = useState({
    fullName: '',
    mobileNumber: '',
    numberOfPlayers: 1,
    selectedGame: null,
    preferredDevice: '',
    salespersonId: ''
  });

  const [cartAddons, setCartAddons] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableTimeSlots, setAvailableTimeSlots] = useState(generateTimeSlots());
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotError, setSlotError] = useState('');

  const fetchDynamicData = useCallback(async () => {
    try {
      const [ratesRes, gamesRes, devicesRes, buttonsRes, salespersonsRes] = await Promise.all([
        gameRateService.getActiveRates().catch(() => ({ rates: [] })),
        gameService.getActiveGames().catch(() => ({ games: [] })),
        gameDeviceService.getActiveDevices().catch(() => []),
        posService.getQuickButtons().catch(() => ({ buttons: [] })),
        posService.getSalespersons().catch(() => ({ salespersons: [] }))
      ]);

      setRates(ratesRes.rates || ratesRes || []);
      setGames(gamesRes.games || gamesRes || []);
      setDevices(devicesRes.devices || devicesRes || []);
      setQuickButtons(buttonsRes.buttons || buttonsRes || []);
      setSalespersons(salespersonsRes.salespersons || salespersonsRes || []);
    } catch (error) {
      console.error('Error fetching dynamic data:', error);
      if (error.response?.status === 401) {
        setAuthError('Please log in for complete features, but you can still browse.');
      }
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDynamicData();

    const handleLoginSuccess = () => {
      setAuthError(null);
      fetchDynamicData();
    };

    window.addEventListener('game-login-success', handleLoginSuccess);
    return () => {
      window.removeEventListener('game-login-success', handleLoginSuccess);
    };
  }, [fetchDynamicData]);

  useEffect(() => {
    if (!selectedDate || !selectedRate) return;
    let cancelled = false;

    const loadAvailability = async () => {
      setSlotsLoading(true);
      setSlotError('');

      try {
        const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        const platform = 'all';
        const durationMinutes = Math.round(selectedDuration * 60);

        const data = await gameBookingService.getAvailability({ date: dateStr, platform, durationMinutes });
        if (cancelled) return;

        setAvailableTimeSlots((data.slots || []).map(slot => ({
          ...slot,
          time: new Date(slot.start_time.replace(' ', 'T')).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          status: slot.available ? 'available' : 'booked',
          availableCount: slot.available_count,
          available_device_ids: slot.available_device_ids || []
        })));
      } catch (e) {
        if (!cancelled) {
          setSlotError('Live availability could not be loaded.');
          setAvailableTimeSlots([]);
        }
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    };

    loadAvailability();
    return () => { cancelled = true; };
  }, [selectedDate, selectedRate, selectedDuration]);

  const calculateGamingTotal = () => selectedRate ? (selectedRate.price * selectedDuration) : 0;
  const calculateAddonsTotal = () => cartAddons.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const calculateTotal = () => calculateGamingTotal() + calculateAddonsTotal();

  // ---- Platform options from devices ----
  const platformOptions = useMemo(() => {
    const platformMap = new Map();
    devices.forEach(device => {
      const plat = (device.platform || device.name || 'unknown').toLowerCase();
      let key = null;
      if (plat.includes('ps5') || plat.includes('playstation')) key = 'ps5';
      else if (plat.includes('pc') || plat.includes('computer') || plat.includes('desktop')) key = 'pc';
      if (key) {
        if (!platformMap.has(key)) {
          platformMap.set(key, { key, label: key.toUpperCase(), count: 0 });
        }
        platformMap.get(key).count += 1;
      }
    });
    // Ensure both exist even if no devices found
    if (!platformMap.has('ps5')) platformMap.set('ps5', { key: 'ps5', label: 'PS5', count: 0 });
    if (!platformMap.has('pc')) platformMap.set('pc', { key: 'pc', label: 'PC', count: 0 });
    return Array.from(platformMap.values());
  }, [devices]);

  // ---- Filter rates based on selected platform ----
  const filteredRates = useMemo(() => {
    if (selectedPlatform === 'tournament') {
      return rates; // show all rates for tournaments? Adjust as needed.
    }
    return rates.filter(rate => {
      // If rate has a direct platform property, use it
      if (rate.platform) {
        const plat = rate.platform.toLowerCase();
        if (selectedPlatform === 'ps5') {
          return plat.includes('ps5') || plat.includes('playstation');
        } else if (selectedPlatform === 'pc') {
          return plat.includes('pc') || plat.includes('computer') || plat.includes('desktop');
        }
        return true;
      }
      // Fallback: match by name
      const name = (rate.name || '').toLowerCase();
      if (selectedPlatform === 'ps5') {
        return name.includes('ps5') || name.includes('playstation');
      } else if (selectedPlatform === 'pc') {
        return name.includes('pc') || name.includes('computer') || name.includes('desktop');
      }
      return true;
    });
  }, [rates, selectedPlatform]);

  // ---- Filter games based on selected platform and device ----
  const getFilteredGames = useCallback(() => {
    if (selectedPlatform === 'tournament') {
      return games;
    }

    // If a specific device is selected, filter games that match that device's platform
    if (selectedDevice) {
      const devicePlatform = (selectedDevice.platform || selectedDevice.name || '').toLowerCase();
      return games.filter(game => {
        const gamePlatform = (game.platform || '').toLowerCase();
        // If game has no platform or 'all', include it
        if (!gamePlatform || gamePlatform === 'all') return true;
        return gamePlatform === devicePlatform;
      });
    }

    // Otherwise, filter by the selected platform key
    const platformKey = selectedPlatform;
    // Collect all device platform strings that match the key
    const matchingPlatforms = [];
    devices.forEach(d => {
      const p = (d.platform || d.name || '').toLowerCase();
      if (platformKey === 'ps5' && (p.includes('ps5') || p.includes('playstation'))) {
        matchingPlatforms.push(p);
      } else if (platformKey === 'pc' && (p.includes('pc') || p.includes('computer') || p.includes('desktop'))) {
        matchingPlatforms.push(p);
      }
    });

    if (matchingPlatforms.length === 0) {
      // No devices match, show games that are 'all' or no platform
      return games.filter(g => !g.platform || g.platform.toLowerCase() === 'all');
    }

    return games.filter(game => {
      const gamePlatform = (game.platform || '').toLowerCase();
      if (!gamePlatform || gamePlatform === 'all') return true;
      return matchingPlatforms.some(p => p === gamePlatform);
    });
  }, [games, devices, selectedPlatform, selectedDevice]);

  const filteredGames = useMemo(() => getFilteredGames(), [getFilteredGames]);

  // ---- Devices available for the selected time slot ----
  const availableDevicesForSlot = useMemo(() => {
    if (selectedTimeSlot && selectedTimeSlot.available_device_ids) {
      return devices.filter(d => selectedTimeSlot.available_device_ids.includes(d.id));
    }
    return devices;
  }, [selectedTimeSlot, devices]);

  // ---- Time slots filtered by selected device (if any) ----
  const filteredTimeSlots = useMemo(() => {
    if (!selectedDevice) {
      return availableTimeSlots;
    }
    return availableTimeSlots.map(slot => {
      const isDeviceFree = slot.available_device_ids?.includes(selectedDevice.id) || false;
      return {
        ...slot,
        status: isDeviceFree ? 'available' : 'booked',
        availableCount: isDeviceFree ? 1 : 0,
      };
    });
  }, [availableTimeSlots, selectedDevice]);

  // ---- Handlers ----
  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
    setSelectedRate(null);
    setSelectedDevice(null);
    setSelectedTimeSlot(null);
    setPlayerDetails(prev => ({ ...prev, preferredDevice: '', selectedGame: null }));
    nextStep();
  };

  const handleRateSelect = (rate) => setSelectedRate(rate);
  const handleDateSelect = (date) => { setSelectedDate(date); setSelectedTimeSlot(null); };

  const handleTimeSlotSelect = (slot) => {
    if (slot.status === 'booked') return;
    setSelectedTimeSlot(slot);
    if (selectedDevice && !slot.available_device_ids.includes(selectedDevice.id)) {
      setSelectedDevice(null);
    }
  };

  const handleDeviceSelect = (deviceId) => {
    const device = devices.find(d => d.id === Number(deviceId));
    setSelectedDevice(device || null);
    setSelectedTimeSlot(null);
    setPlayerDetails(prev => ({ ...prev, selectedGame: null }));
  };

  const handlePlayerDetailChange = (e) => {
    const { name, value } = e.target;
    setPlayerDetails(prev => ({ ...prev, [name]: value }));
  };

  const handlePlayersCountChange = (e) => {
    const count = parseInt(e.target.value) || 1;
    setPlayerDetails(prev => ({ ...prev, numberOfPlayers: count }));
  };

  const handleGameSelect = (game) => setPlayerDetails(prev => ({ ...prev, selectedGame: game }));

  const handleAddAddon = (button) => {
    setCartAddons(prev => {
      const existing = prev.find(item => item.id === button.id);
      if (existing) {
        return prev.map(item => item.id === button.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id: button.id, name: button.name, price: parseFloat(button.price), qty: 1 }];
    });
  };

  const handleRemoveAddon = (id) => {
    setCartAddons(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing && existing.qty > 1) {
        return prev.map(item => item.id === id ? { ...item, qty: item.qty - 1 } : item);
      }
      return prev.filter(item => item.id !== id);
    });
  };

  const nextStep = () => { if (currentStep < 6) setCurrentStep(currentStep + 1); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  // ---- Confirm booking (unchanged) ----
  const confirmBooking = async () => {
    if (!playerDetails.fullName || !playerDetails.mobileNumber || !selectedRate || !selectedTimeSlot || !playerDetails.selectedGame) {
      alert('Please fill all required fields');
      return;
    }

    const token = localStorage.getItem('gameToken');
    if (!token) {
      window.dispatchEvent(new Event('open-game-login'));
      return;
    }

    try {
      setIsProcessing(true);
      
      let startTime = null;
      if (selectedTimeSlot && selectedDate) {
        const timeMatch = selectedTimeSlot.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);
          const ampm = timeMatch[3].toUpperCase();
          
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
          
          const yyyy = selectedDate.getFullYear();
          const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const dd = String(selectedDate.getDate()).padStart(2, '0');
          const hh = String(hours).padStart(2, '0');
          const min = String(minutes).padStart(2, '0');
          
          startTime = `${yyyy}-${mm}-${dd} ${hh}:${min}:00`;
        } else {
          startTime = selectedTimeSlot.start_time || null;
        }
      }

      const salesperson = salespersons.find(sp => sp.id.toString() === playerDetails.salespersonId.toString());
      const totalAmount = calculateTotal();
      const finalDeviceId = selectedDevice ? selectedDevice.id : (playerDetails.preferredDevice || null);
      const platformForBooking = 'all';

      if (paymentMethod === 'cash') {
        const payload = {
          platform: platformForBooking,
          game_id: playerDetails.selectedGame.id,
          rate_id: selectedRate.id,
          preferred_device_id: finalDeviceId,
          salesperson_id: playerDetails.salespersonId || null,
          salesperson_name: salesperson ? salesperson.name : null,
          customer_name: playerDetails.fullName,
          customer_phone: playerDetails.mobileNumber,
          start_time: startTime,
          duration_minutes: Math.round(selectedDuration * 60),
          addons_data: cartAddons,
          subtotal: totalAmount,
          total_price: totalAmount,
          payment_mode: 'cash',
          payment_status: 'pending'
        };

        await gameBookingService.createOnlineBooking(payload);
        setBookingConfirmed(true);
        alert('Booking confirmed! Please pay at the counter upon arrival.');
        window.location.reload();

      } else if (paymentMethod === 'online') {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          alert('Razorpay SDK failed to load. Please check your internet connection.');
          setIsProcessing(false);
          return;
        }

        const order = await paymentService.createRazorpayOrder(totalAmount);
        if (!order || !order.id) {
          throw new Error('Failed to create Razorpay payment order.');
        }

        const payload = {
          platform: platformForBooking,
          game_id: playerDetails.selectedGame.id,
          rate_id: selectedRate.id,
          preferred_device_id: finalDeviceId,
          salesperson_id: playerDetails.salespersonId || null,
          salesperson_name: salesperson ? salesperson.name : null,
          customer_name: playerDetails.fullName,
          customer_phone: playerDetails.mobileNumber,
          start_time: startTime,
          duration_minutes: Math.round(selectedDuration * 60),
          addons_data: cartAddons,
          subtotal: totalAmount,
          total_price: totalAmount,
          payment_mode: 'online',
          payment_status: 'pending'
        };

        const bookingRes = await gameBookingService.createOnlineBooking(payload);
        const internalBookingId = bookingRes.booking.id;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.REACT_APP_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'EronixTech Gaming Zone',
          description: 'Gaming Session Reservation',
          order_id: order.id,
          handler: async function (response) {
            try {
              await paymentService.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                internal_order_id: internalBookingId
              });

              setBookingConfirmed(true);
              alert('Payment verified! Your gaming station is successfully reserved.');
              window.location.reload();
            } catch (err) {
              alert('Payment verification failed. If funds were debited, please contact support.');
              setIsProcessing(false);
            }
          },
          prefill: {
            name: playerDetails.fullName,
            contact: playerDetails.mobileNumber
          },
          theme: { color: '#3b82f6' },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              alert('Payment window was closed. Your booking is recorded as pending payment.');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          alert(`Payment Failed: ${response.error.description}`);
          setIsProcessing(false);
        });
        rzp.open();
      }
    } catch (e) {
      setIsProcessing(false);
      console.error('Booking Error:', e.response?.data || e.message);
      if (e.response?.status === 401) {
        window.dispatchEvent(new Event('open-game-login'));
      } else if (e.response?.status === 409) {
        alert('This slot was just taken. Please choose another time.');
      } else {
        alert(e.response?.data?.message || e.message || 'Unable to confirm booking.');
      }
    }
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) { days.push(null); }
    for (let i = 1; i <= daysInMonth; i++) { days.push(new Date(year, month, i)); }
    return days;
  };

  const isDateSelected = (date) => date && selectedDate && date.toDateString() === selectedDate.toDateString();
  const formatDate = (date) => date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const handleImageError = (e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=800&fit=crop'; };

  const environmentShowcase = useMemo(() => devices.slice(0, 3).map((device, index) => ({
    id: index + 1,
    title: device.name,
    desc: device.description || `${device.platform || 'Gaming'} station ready for you`,
    image: device.image_url || 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=600&h=400&fit=crop'
  })), [devices]);

  const gameGallery = useMemo(() => games.slice(0, 6).map((game, index) => ({
    id: game.id,
    title: game.name,
    category: game.genre || 'Game',
    image: game.image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=800&fit=crop',
    link: `#${game.name.toLowerCase().replace(/\s/g, '')}`,
    size: ['large', 'tall', 'wide', 'small', 'small', 'wide'][index % 6]
  })), [games]);

  const addonButtons = useMemo(() => quickButtons.filter(b => b.type !== 'gaming'), [quickButtons]);

  if (dataLoading && rates.length === 0 && games.length === 0) {
    return (
      <GameZoneLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div className="loader" style={{ color: '#fff', fontSize: '1.2rem' }}>Loading Gaming Arena...</div>
        </div>
      </GameZoneLayout>
    );
  }

  return (
    <GameZoneLayout>
      <div className="gaming-zone-page">
        {authError && (
          <div style={{ background: '#1e293b', color: '#facc15', padding: '10px 20px', textAlign: 'center', borderRadius: '5px', margin: '10px auto', maxWidth: '700px' }}>
            ⚠️ {authError}
          </div>
        )}

        {/* HERO BANNER */}
        <div className="gaming-hero">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="hero-badge"><FaFire className="flame-icon" /> PREMIUM GAMING LOUNGE</div>
            <h1 className="hero-title">ENTER THE GAME<br /><span className="highlight">RULE THE ARENA</span></h1>
            <div className="hero-highlights">
              {platformOptions.map(p => (
                <div key={p.key} className="highlight-item">
                  <span className="emoji">{p.key === 'ps5' ? '🎮' : '🖥️'}</span> {p.count} {p.label} {p.count > 1 ? 'Consoles' : 'Console'}
                </div>
              ))}
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
              {[1, 2, 3, 4, 5, 6].map(step => (
                <div key={step} className={`step-indicator ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}>
                  <div className="step-number">{step}</div>
                  <div className="step-label" style={{ fontSize: '11px' }}>
                    {step === 1 && 'Platform'} {step === 2 && 'Package'} {step === 3 && 'Time'}
                    {step === 4 && 'Details'} {step === 5 && 'Add-ons'} {step === 6 && 'Pay'}
                  </div>
                </div>
              ))}
            </div>

            {/* ─── Step 1: Select Platform ─── */}
            {currentStep === 1 && (
              <div className="step-card fade-in">
                <div className="step-card-inner">
                  <div className="step-main">
                    <h2>STEP 1 – Select Gaming Platform</h2>
                    <p className="step-subtitle">Choose your preferred gaming experience.</p>
                    <div className="platform-grid">
                      {platformOptions.map(p => (
                        <div
                          key={p.key}
                          className={`platform-card ${selectedPlatform === p.key ? 'selected' : ''}`}
                          onClick={() => handlePlatformSelect(p.key)}
                        >
                          <div className="platform-glow"></div>
                          <div className="platform-icon">{p.key === 'ps5' ? '🎮' : '🖥️'}</div>
                          <h3>{p.label} Gaming</h3>
                          <div className="platform-availability">Available Consoles: {p.count}</div>
                          <p>{p.key === 'ps5' ? 'Next-gen gaming on PlayStation 5 with the latest AAA titles.' : 'Play competitive titles on powerful gaming machines built for high framerates.'}</p>
                        </div>
                      ))}
                      <div className={`platform-card ${selectedPlatform === 'tournament' ? 'selected' : ''}`} onClick={() => handlePlatformSelect('tournament')}>
                        <div className="platform-glow"></div>
                        <div className="platform-icon">🏆</div>
                        <h3>Tournaments</h3>
                        <div className="platform-availability">Live Events</div>
                        <p>Register for upcoming esports events, local LAN tournaments, and community gatherings.</p>
                      </div>
                    </div>
                    <div className="step-actions">
                      <button className="btn-secondary" onClick={prevStep} disabled>Back</button>
                      <button className="btn-primary" onClick={nextStep}>Continue</button>
                    </div>
                  </div>
                  {selectedRate && (
                    <BookingSummary
                      selectedPlatform={selectedPlatform}
                      selectedDuration={selectedDuration}
                      selectedDate={selectedDate}
                      selectedTimeSlot={selectedTimeSlot}
                      selectedDevice={selectedDevice}
                      cartAddons={cartAddons}
                      calculateTotal={calculateTotal}
                      calculateGamingTotal={calculateGamingTotal}
                      calculateAddonsTotal={calculateAddonsTotal}
                      selectedRate={selectedRate}
                    />
                  )}
                </div>
              </div>
            )}

            {/* ─── Step 2: Select Rate & Duration ─── */}
            {currentStep === 2 && (
              <div className="step-card fade-in">
                <div className="step-card-inner">
                  <div className="step-main">
                    <h2>STEP 2 – Select Rate & Duration</h2>
                    <p className="step-subtitle">Choose the pricing plan and duration that best suits your gaming session.</p>
                    <div className="package-group">
                      <h3><span className="platform-icon-small">{selectedPlatform === 'ps5' ? '🎮' : '🖥️'}</span> Available Rates</h3>
                      {filteredRates.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                          No rates specifically for {selectedPlatform.toUpperCase()} at the moment. Showing all rates.
                          {rates.length > 0 && (
                            <div style={{ marginTop: '10px' }}>
                              {rates.map(rate => (
                                <div key={rate.id} className={`package-card ${selectedRate?.id === rate.id ? 'selected' : ''}`} onClick={() => handleRateSelect(rate)} style={{ margin: '5px', display: 'inline-block' }}>
                                  <div className="package-hours" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{rate.name}</div>
                                  <div className="package-price">₹{rate.price} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>/hr</span></div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="package-grid">
                          {filteredRates.map((rate) => (
                            <div key={rate.id} className={`package-card ${selectedRate?.id === rate.id ? 'selected' : ''}`} onClick={() => handleRateSelect(rate)}>
                              <div className="package-hours" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{rate.name}</div>
                              <div className="package-price">₹{rate.price} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>/hr</span></div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ marginTop: '30px' }}>
                        <h3><FiClock style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Session Duration</h3>
                        <div className="duration-pills" style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                          {[1, 2, 3, 4, 5, 8].map(h => (
                            <button
                              type="button"
                              key={h}
                              className={`btn-outline ${selectedDuration === h ? 'active' : ''}`}
                              onClick={() => setSelectedDuration(h)}
                              style={selectedDuration === h ? { background: '#2563eb', color: '#fff', borderColor: '#2563eb' } : {}}
                            >
                              {h} Hour{h > 1 ? 's' : ''}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="step-actions">
                      <button className="btn-secondary" onClick={prevStep}>Back</button>
                      <button className="btn-primary" onClick={nextStep} disabled={!selectedRate}>Continue</button>
                    </div>
                  </div>
                  {selectedRate && (
                    <BookingSummary
                      selectedPlatform={selectedPlatform}
                      selectedDuration={selectedDuration}
                      selectedDate={selectedDate}
                      selectedTimeSlot={selectedTimeSlot}
                      selectedDevice={selectedDevice}
                      cartAddons={cartAddons}
                      calculateTotal={calculateTotal}
                      calculateGamingTotal={calculateGamingTotal}
                      calculateAddonsTotal={calculateAddonsTotal}
                      selectedRate={selectedRate}
                    />
                  )}
                </div>
              </div>
            )}

            {/* ─── Step 3: Select Date, Time & Device ─── */}
            {currentStep === 3 && (
              <div className="step-card fade-in">
                <div className="step-card-inner">
                  <div className="step-main">
                    <h2>STEP 3 – Select Date, Time & Device</h2>
                    <p className="step-subtitle">Choose your preferred date, time slot, and optionally a specific station.</p>
                    <div className="datetime-selector">
                      <div className="calendar-section">
                        <div className="calendar-header">
                          <button onClick={prevMonth}>‹</button>
                          <h3>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                          <button onClick={nextMonth}>›</button>
                        </div>
                        <div className="calendar-weekdays">
                          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => <div key={day} className="weekday">{day}</div>)}
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
                        {slotsLoading && <div className="slot-live-message">Checking live availability…</div>}
                        {slotError && <div className="slot-live-message error">{slotError}</div>}

                        <div style={{ marginBottom: '20px' }}>
                          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                            Select Specific Station (Optional)
                          </label>
                          <select
                            className="finp"
                            value={selectedDevice?.id || ''}
                            onChange={(e) => handleDeviceSelect(e.target.value)}
                            style={{ width: '100%' }}
                          >
                            <option value="">Any Available Station</option>
                            {availableDevicesForSlot.map(device => (
                              <option key={device.id} value={device.id}>
                                {device.name}
                              </option>
                            ))}
                          </select>
                          {selectedTimeSlot && availableDevicesForSlot.length === 0 && (
                            <div style={{ marginTop: '6px', color: '#ff6b6b', fontSize: '0.9rem' }}>
                              ⚠️ No devices are available for this time slot. Please choose another slot.
                            </div>
                          )}
                          {selectedDevice && (
                            <div style={{ marginTop: '6px', fontSize: '0.9rem', color: '#8ec2ff' }}>
                              You will be reserving <strong>{selectedDevice.name}</strong>.
                            </div>
                          )}
                        </div>

                        <div className="slot-legend">
                          <span className="legend-item"><span className="legend-box available"></span> Available</span>
                          <span className="legend-item"><span className="legend-box booked"></span> Booked</span>
                          <span className="legend-item"><span className="legend-box selected"></span> Selected</span>
                        </div>
                        {['AM', 'PM'].map(period => (
                          <div key={period} className="slot-group">
                            <h4>{period === 'AM' ? 'Morning Slots' : 'Evening Slots'}</h4>
                            <div className="slot-grid">
                              {filteredTimeSlots
                                .filter(s => s.time.includes(period))
                                .map((slot, idx) => (
                                  <button
                                    key={idx}
                                    className={`time-slot ${slot.status} ${selectedTimeSlot?.time === slot.time ? 'selected' : ''}`}
                                    disabled={slot.status === 'booked'}
                                    onClick={() => handleTimeSlotSelect(slot)}
                                  >
                                    <span>{slot.time}</span>
                                    <small>
                                      {slot.status === 'booked'
                                        ? 'Sold Out'
                                        : `${slot.availableCount} available`}
                                    </small>
                                  </button>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="step-actions">
                      <button className="btn-secondary" onClick={prevStep}>Back</button>
                      <button className="btn-primary" onClick={nextStep} disabled={!selectedTimeSlot}>Continue</button>
                    </div>
                  </div>
                  {selectedRate && (
                    <BookingSummary
                      selectedPlatform={selectedPlatform}
                      selectedDuration={selectedDuration}
                      selectedDate={selectedDate}
                      selectedTimeSlot={selectedTimeSlot}
                      selectedDevice={selectedDevice}
                      cartAddons={cartAddons}
                      calculateTotal={calculateTotal}
                      calculateGamingTotal={calculateGamingTotal}
                      calculateAddonsTotal={calculateAddonsTotal}
                      selectedRate={selectedRate}
                    />
                  )}
                </div>
              </div>
            )}

            {/* ─── Step 4: Player Details ─── */}
            {currentStep === 4 && (
              <div className="step-card fade-in">
                <div className="step-card-inner">
                  <div className="step-main">
                    <h2>STEP 4 – Player Details</h2>
                    <p className="step-subtitle">Please provide your information to continue.</p>
                    <div className="player-details-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Full Name *</label>
                          <input type="text" name="fullName" className="finp" value={playerDetails.fullName} onChange={handlePlayerDetailChange} placeholder="Enter your name" />
                        </div>
                        <div className="form-group">
                          <label>Mobile Number *</label>
                          <input type="tel" name="mobileNumber" className="finp" value={playerDetails.mobileNumber} onChange={handlePlayerDetailChange} placeholder="Enter mobile number" />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Number of Players</label>
                          <select name="numberOfPlayers" className="finp" value={playerDetails.numberOfPlayers} onChange={handlePlayersCountChange}>
                            {[1, 2, 3, 4, 5].map(num => <option key={num} value={num}>{num} Player{num > 1 ? 's' : ''}</option>)}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Assisted By (Optional)</label>
                          <select name="salespersonId" className="finp" value={playerDetails.salespersonId} onChange={handlePlayerDetailChange}>
                            <option value="">Select Staff Member</option>
                            {salespersons.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
                          </select>
                        </div>
                      </div>

                      <div style={{ marginBottom: '15px', padding: '10px', background: '#1e293b', borderRadius: '8px' }}>
                        <span style={{ color: '#94a3b8' }}>Playing on: </span>
                        <strong style={{ color: '#8ec2ff' }}>
                          {selectedDevice ? selectedDevice.name : `${selectedPlatform.toUpperCase()} (Any Station)`}
                        </strong>
                      </div>

                      <div className="form-group">
                        <label>Select Primary Game *</label>
                        <div className="games-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
                          {filteredGames.length === 0 ? (
                            <div style={{ color: '#94a3b8', padding: '20px', gridColumn: '1/-1', textAlign: 'center' }}>
                              No games available for this selection. Please try a different device or platform.
                            </div>
                          ) : (
                            filteredGames.map(game => (
                              <div
                                key={game.id}
                                className={`game-card ${playerDetails.selectedGame?.id === game.id ? 'selected' : ''}`}
                                onClick={() => handleGameSelect(game)}
                                style={{
                                  background: '#1e293b', border: playerDetails.selectedGame?.id === game.id ? '2px solid #3b82f6' : '2px solid transparent',
                                  borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', transition: '0.2s'
                                }}
                              >
                                <img src={game.image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=800&fit=crop'} alt={game.name} style={{ width: '100%', height: '100px', objectFit: 'cover' }} onError={handleImageError} />
                                <div className="game-info" style={{ padding: '12px' }}>
                                  <div className="game-name" style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{game.name}</div>
                                  {game.genre && <div className="game-genre" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{game.genre}</div>}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="step-actions">
                      <button className="btn-secondary" onClick={prevStep}>Back</button>
                      <button className="btn-primary" onClick={nextStep} disabled={!playerDetails.fullName || !playerDetails.mobileNumber || !playerDetails.selectedGame}>Continue</button>
                    </div>
                  </div>
                  {selectedRate && (
                    <BookingSummary
                      selectedPlatform={selectedPlatform}
                      selectedDuration={selectedDuration}
                      selectedDate={selectedDate}
                      selectedTimeSlot={selectedTimeSlot}
                      selectedDevice={selectedDevice}
                      cartAddons={cartAddons}
                      calculateTotal={calculateTotal}
                      calculateGamingTotal={calculateGamingTotal}
                      calculateAddonsTotal={calculateAddonsTotal}
                      selectedRate={selectedRate}
                    />
                  )}
                </div>
              </div>
            )}

            {/* ─── Step 5: Add-ons ─── */}
            {currentStep === 5 && (
              <div className="step-card fade-in">
                <div className="step-card-inner">
                  <div className="step-main">
                    <h2>STEP 5 – Grab a Snack? (Optional)</h2>
                    <p className="step-subtitle">Add drinks or snacks to your booking so they are ready when you arrive.</p>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 60%' }}>
                        {addonButtons.length === 0 ? (
                          <div style={{ color: '#94a3b8', padding: '20px' }}>No add-ons currently available.</div>
                        ) : (
                          <div className="games-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
                            {addonButtons.map(button => (
                              <div
                                key={button.id}
                                style={{
                                  background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '15px',
                                  textAlign: 'center', cursor: 'pointer', transition: '0.2s'
                                }}
                                onClick={() => handleAddAddon(button)}
                              >
                                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>
                                  {button.type === 'drink' ? '🥤' : button.type === 'snack' ? '🍿' : '🍔'}
                                </div>
                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '5px' }}>{button.name}</div>
                                <div style={{ color: '#8ec2ff', fontWeight: 'bold' }}>₹{parseFloat(button.price).toFixed(2)}</div>
                                <button style={{ marginTop: '10px', width: '100%', padding: '6px', background: '#3b82f6', border: 'none', borderRadius: '5px', color: '#fff', cursor: 'pointer' }}>Add</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ flex: '1 1 35%', background: '#0f172a', padding: '20px', borderRadius: '10px', border: '1px solid #1e293b', alignSelf: 'flex-start' }}>
                        <h3 style={{ borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '15px' }}>Your Add-ons</h3>
                        {cartAddons.length === 0 ? (
                          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No add-ons selected yet.</p>
                        ) : (
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {cartAddons.map(item => (
                              <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{item.name}</div>
                                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>₹{item.price.toFixed(2)}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', background: '#1e293b', borderRadius: '6px' }}>
                                  <button onClick={() => handleRemoveAddon(item.id)} style={{ background: 'none', border: 'none', color: '#fff', padding: '6px 10px', cursor: 'pointer' }}><FiMinus size={12} /></button>
                                  <span style={{ padding: '0 8px', fontWeight: 'bold' }}>{item.qty}</span>
                                  <button onClick={() => handleAddAddon(item)} style={{ background: 'none', border: 'none', color: '#fff', padding: '6px 10px', cursor: 'pointer' }}><FiPlus size={12} /></button>
                                </div>
                              </li>
                            ))}
                            <li style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #334155', fontWeight: 'bold' }}>
                              <span>Add-ons Total:</span>
                              <span style={{ color: '#8ec2ff' }}>₹{calculateAddonsTotal().toFixed(2)}</span>
                            </li>
                          </ul>
                        )}
                      </div>
                    </div>
                    <div className="step-actions">
                      <button className="btn-secondary" onClick={prevStep}>Back</button>
                      <button className="btn-primary" onClick={nextStep}>Continue to Checkout</button>
                    </div>
                  </div>
                  {selectedRate && (
                    <BookingSummary
                      selectedPlatform={selectedPlatform}
                      selectedDuration={selectedDuration}
                      selectedDate={selectedDate}
                      selectedTimeSlot={selectedTimeSlot}
                      selectedDevice={selectedDevice}
                      cartAddons={cartAddons}
                      calculateTotal={calculateTotal}
                      calculateGamingTotal={calculateGamingTotal}
                      calculateAddonsTotal={calculateAddonsTotal}
                      selectedRate={selectedRate}
                    />
                  )}
                </div>
              </div>
            )}

            {/* ─── Step 6: Checkout ─── */}
            {currentStep === 6 && (
              <div className="step-card fade-in">
                <div className="step-card-inner">
                  <div className="step-main">
                    <h2>STEP 6 – Checkout</h2>
                    <p className="step-subtitle">Review your booking and choose your payment option.</p>
                    <div className="checkout-layout">
                      <div className="payment-methods">
                        <div className={`payment-option ${paymentMethod === 'online' ? 'selected' : ''}`} onClick={() => setPaymentMethod('online')}>
                          <FiCreditCard className="pay-icon" /> <span>Pay Now</span>
                        </div>
                        <div className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`} onClick={() => setPaymentMethod('cash')}>
                          <FiDollarSign className="pay-icon" /> <span>Cash at Counter</span>
                        </div>
                      </div>

                      <div className="booking-summary-preview">
                        <h3>Order Summary</h3>
                        <div className="summary-details">
                          <div className="summary-row"><span>Platform:</span> <span>{selectedPlatform.toUpperCase()}</span></div>
                          <div className="summary-row"><span>Rate Plan:</span> <span>{selectedRate?.name}</span></div>
                          <div className="summary-row"><span>Date & Time:</span> <span>{formatDate(selectedDate)} at {selectedTimeSlot?.time}</span></div>
                          {selectedDevice && <div className="summary-row"><span>Station:</span> <span>{selectedDevice.name}</span></div>}
                          <div className="summary-divider"></div>
                          <div className="summary-row"><span>Gaming Total:</span> <span>₹{calculateGamingTotal().toFixed(2)}</span></div>
                          {cartAddons.length > 0 && <div className="summary-row"><span>F&B Add-ons ({cartAddons.length}):</span> <span>₹{calculateAddonsTotal().toFixed(2)}</span></div>}
                          <div className="summary-divider"></div>
                          <div className="summary-row total"><span>Total Payable:</span> <strong>₹{calculateTotal().toFixed(2)}</strong></div>
                        </div>
                      </div>
                    </div>
                    <div className="step-actions">
                      <button className="btn-secondary" onClick={prevStep} disabled={isProcessing}>Back</button>
                      <button className="btn-primary confirm-btn" onClick={confirmBooking} disabled={isProcessing}>
                        {isProcessing ? 'PROCESSING...' : <><FiLock style={{ marginRight: '8px' }} /> CONFIRM & PAY</>}
                      </button>
                    </div>
                  </div>
                  {selectedRate && (
                    <BookingSummary
                      selectedPlatform={selectedPlatform}
                      selectedDuration={selectedDuration}
                      selectedDate={selectedDate}
                      selectedTimeSlot={selectedTimeSlot}
                      selectedDevice={selectedDevice}
                      cartAddons={cartAddons}
                      calculateTotal={calculateTotal}
                      calculateGamingTotal={calculateGamingTotal}
                      calculateAddonsTotal={calculateAddonsTotal}
                      selectedRate={selectedRate}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ENVIRONMENT SHOWCASE */}
        <div className="environment-section">
          <div className="container">
            <div className="section-header center"><h2>The Setup</h2><p>Experience gaming in a premium environment</p></div>
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
            <div className="section-header center"><h2>Trending Now</h2><p>Top played games in our arena</p></div>
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