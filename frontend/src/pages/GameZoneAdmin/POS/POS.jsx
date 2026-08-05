import React, { useState, useEffect, useRef, useCallback } from 'react';
import posService from '../../../services/posService';
import gameDeviceService from '../../../services/gameDeviceService';
import gameRateService from '../../../services/gameRateService';
import gameService from '../../../services/gameService';
import './POS.css';

const POS = () => {
  // ========== Quick Button Products ==========
  const [quickButtons, setQuickButtons] = useState([]);
  const [filteredButtons, setFilteredButtons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState('all');

  // ========== Cart ==========
  const [cart, setCart] = useState([]);

  // ========== Customers & Salespersons ==========
  const [customers, setCustomers] = useState([]);
  const [salespersons, setSalespersons] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedSalesperson, setSelectedSalesperson] = useState('');

  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerMobile, setCustomerMobile] = useState('');
  const [salespersonName, setSalespersonName] = useState('');

  // ========== Devices, Rates, Games ==========
  const [devices, setDevices] = useState([]);
  const [rates, setRates] = useState([]);
  const [games, setGames] = useState([]);

  // ========== Bill Summary ==========
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [paidAmount, setPaidAmount] = useState(0);
  const [terms, setTerms] = useState(`1. Goods once sold cannot be returned or exchanged.\n\n2. Warranty on Products: 1 Year Warranty.\n\n3. Warranty T&C - Warranty does not cover physical damage like liquid spill, water spill, burn, high voltage damage, display broken or crack, display line, display patch, speaker damage, keys broken or any other physical damage. Loss of data, software or any other information.\n\n4. Exclusions from Warranty - Consumable parts such as batteries are not covered.\n\n5. Service Warranty - Covers the cost of service/labour. Any parts replaced will be charged at actuals.\n\n6. Delivery charges may be additional.`);

  // ========== Gaming Sessions ==========
  const [gamingSessions, setGamingSessions] = useState([]);
  const [gamingTimer, setGamingTimer] = useState(null);

  // ========== Booking Modal ==========
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    device: '',
    rate: 0,
    rateLabel: '',
    game: '',
    date: new Date(),
    timeSlot: null,
    duration: 1, // hours
    customer: '',
  });
  const [bookingMonth, setBookingMonth] = useState(new Date());
  const [bookingTimeSlots, setBookingTimeSlots] = useState(generateTimeSlots());

  // ========== Customer Modal ==========
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ full_name: '', phone_number: '', email: '', username: '' });

  // ========== Terms Modal ==========
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [termsContent, setTermsContent] = useState('');

  // ========== Held Bills ==========
  const [heldBills, setHeldBills] = useState([]);
  const [showHeldDropdown, setShowHeldDropdown] = useState(false);

  // ========== Refs ==========
  const searchInputRef = useRef(null);

  // ========== LocalStorage for TV View ==========
  const SESSIONS_STORAGE_KEY = 'pos_live_sessions';

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(gamingSessions));
    } catch (e) { /* ignore */ }
  }, [gamingSessions]);

  // ========== Generate Time Slots ==========
  function generateTimeSlots() {
    return [
      { time: '10:00 AM', status: 'available' },
      { time: '10:30 AM', status: 'available' },
      { time: '11:00 AM', status: 'booked' },
      { time: '11:30 AM', status: 'available' },
      { time: '12:00 PM', status: 'available' },
      { time: '12:30 PM', status: 'available' },
      { time: '01:00 PM', status: 'booked' },
      { time: '01:30 PM', status: 'available' },
      { time: '02:00 PM', status: 'available' },
      { time: '02:30 PM', status: 'available' },
      { time: '03:00 PM', status: 'booked' },
      { time: '03:30 PM', status: 'available' },
      { time: '04:00 PM', status: 'available' },
      { time: '04:30 PM', status: 'available' },
      { time: '05:00 PM', status: 'available' },
    ];
  }

  // ========== Fetch Data ==========
  const fetchQuickButtons = async () => {
    try {
      const data = await posService.getQuickButtons();
      setQuickButtons(data.buttons || []);
      setFilteredButtons(data.buttons || []);
    } catch (err) {
      console.error('Error fetching quick buttons:', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await posService.getCustomers();
      setCustomers(data.customers || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const fetchSalespersons = async () => {
    try {
      const data = await posService.getSalespersons();
      setSalespersons(data.salespersons || []);
    } catch (err) {
      console.error('Error fetching salespersons:', err);
    }
  };

  const fetchDevices = async () => {
    try {
      const data = await gameDeviceService.getActiveDevices();
      setDevices(data.devices || []);
    } catch (err) {
      console.error('Error fetching devices:', err);
    }
  };

  const fetchRates = async () => {
    try {
      const data = await gameRateService.getActiveRates();
      setRates(data.rates || []);
    } catch (err) {
      console.error('Error fetching rates:', err);
    }
  };

  const fetchGames = async () => {
    try {
      const data = await gameService.getActiveGames();
      setGames(data.games || []);
    } catch (err) {
      console.error('Error fetching games:', err);
    }
  };

  const fetchHeldBills = async () => {
    try {
      const data = await posService.getHeldBills();
      setHeldBills(data.bills || []);
    } catch (err) {
      console.error('Error fetching held bills:', err);
    }
  };

  useEffect(() => {
    fetchQuickButtons();
    fetchCustomers();
    fetchSalespersons();
    fetchDevices();
    fetchRates();
    fetchGames();
    fetchHeldBills();
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  // ========== SYNC CUSTOMER NAME ==========
  useEffect(() => {
    if (selectedCustomer && customers.length > 0) {
      const cust = customers.find(c => String(c.id) === String(selectedCustomer));
      if (cust) {
        setCustomerName(cust.name);
        setCustomerMobile(cust.mobile || '');
      } else {
        setCustomerName('Walk-in Customer');
        setCustomerMobile('');
      }
    } else {
      setCustomerName('Walk-in Customer');
      setCustomerMobile('');
    }
  }, [selectedCustomer, customers]);

  // ========== SYNC SALESPERSON NAME ==========
  useEffect(() => {
    if (selectedSalesperson && salespersons.length > 0) {
      const sp = salespersons.find(s => String(s.id) === String(selectedSalesperson));
      if (sp) {
        setSalespersonName(sp.name);
      } else {
        setSalespersonName('');
      }
    } else {
      setSalespersonName('');
    }
  }, [selectedSalesperson, salespersons]);

  // ========== Filter Quick Buttons ==========
  useEffect(() => {
    let filtered = quickButtons;
    if (activeType !== 'all') {
      filtered = filtered.filter(b => b.type === activeType);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(term) ||
        (b.description && b.description.toLowerCase().includes(term))
      );
    }
    setFilteredButtons(filtered);
  }, [searchTerm, activeType, quickButtons]);

  // ========== Cart Calculations ==========
  const calculateTotals = useCallback(() => {
    let subtotal = 0, taxTotal = 0;
    cart.forEach(item => {
      const line = item.qty * item.price * (1 - item.discount / 100);
      subtotal += line;
      taxTotal += line * (item.gst || 0) / (100 + (item.gst || 0));
    });
    const discAmt = subtotal * discountPercent / 100;
    const afterDisc = subtotal - discAmt;
    const roundOff = Math.round(afterDisc) - afterDisc;
    const total = Math.round(afterDisc);
    return { subtotal, taxTotal, discAmt, roundOff, total };
  }, [cart, discountPercent]);

  // ========== Add to Cart ==========
  const addToCart = (button) => {
    const existing = cart.find(item => item.product_id === button.id && item.size === button.type);
    if (existing) {
      setCart(cart.map(item =>
        item.id === existing.id ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setCart([...cart, {
        id: Date.now() + Math.random(),
        product_id: button.id,
        is_virtual: true,
        name: button.name,
        hsn_code: '9985',
        size: button.type,
        color: button.description || '',
        unit: 'pcs',
        mrp: button.price,
        price: button.price,
        gst: 0,
        discount: 0,
        qty: 1,
      }]);
    }
  };

  // ========== Update Cart Item ==========
  const updateCartItem = (id, field, value) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const removeCartItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // ========== Clear Cart ==========
  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setPaidAmount(0);
    setPaymentMode('cash');
  };

  // ========== Gaming Sessions ==========
  const formatDuration = (ms) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = String(Math.floor(total / 3600)).padStart(2, '0');
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const sessionActiveMs = (session) => {
    if (session.paused && session.pausedAt) {
      return Math.max(0, session.pausedAt - session.startedAt - (session.totalPausedMs || 0));
    }
    return Math.max(0, Date.now() - session.startedAt - (session.totalPausedMs || 0));
  };

  const sessionMinutes = (session) => Math.max(1, Math.ceil(sessionActiveMs(session) / 60000));
  const sessionAmount = (session) => Math.ceil((session.rate / 60) * sessionMinutes(session));

  const startGamingSession = () => {
    const deviceEl = document.getElementById('gDevice');
    const rateEl = document.getElementById('gRate');
    const gameEl = document.getElementById('gGame');
    const customerEl = document.getElementById('gCustomer');

    const device = deviceEl?.value || 'PS5 Station 01';
    const rateRaw = rateEl?.value?.split('|') || ['100', 'PS5 Gaming - 1 Player'];
    const rate = parseFloat(rateRaw[0] || 100);
    const label = rateRaw[1] || 'Gaming Session';
    const customer = customerEl?.value?.trim() || 'Walk-in Player';
    const game = gameEl?.value?.trim() || 'Gaming';

    const session = {
      id: Date.now(),
      device,
      label,
      customer,
      game,
      rate,
      startedAt: Date.now(),
      paused: false,
      pausedAt: null,
      totalPausedMs: 0,
    };

    setGamingSessions(prev => [...prev, session]);
    if (!gamingTimer) {
      const timer = setInterval(() => {
        setGamingSessions(prev => [...prev]);
      }, 1000);
      setGamingTimer(timer);
    }
  };

  const togglePauseSession = (id) => {
    setGamingSessions(prev => prev.map(s => {
      if (s.id === id) {
        if (s.paused) {
          const addedPausedMs = Date.now() - s.pausedAt;
          return {
            ...s,
            paused: false,
            pausedAt: null,
            totalPausedMs: (s.totalPausedMs || 0) + addedPausedMs,
          };
        } else {
          return {
            ...s,
            paused: true,
            pausedAt: Date.now(),
          };
        }
      }
      return s;
    }));
  };

  const billGamingSession = (id, removeAfter) => {
    const session = gamingSessions.find(s => s.id === id);
    if (!session) return;
    const amt = sessionAmount(session);
    const mins = sessionMinutes(session);
    const cartItem = {
      id: Date.now() + Math.random(),
      product_id: null,
      is_virtual: true,
      name: `${session.label} - ${session.device}`,
      hsn_code: '9985',
      size: `${mins} min`,
      color: session.game,
      unit: 'session',
      mrp: amt,
      price: amt,
      gst: 0,
      discount: 0,
      qty: 1,
    };
    setCart(prev => [...prev, cartItem]);
    if (removeAfter) {
      setGamingSessions(prev => prev.filter(s => s.id !== id));
      if (gamingSessions.length - 1 === 0 && gamingTimer) {
        clearInterval(gamingTimer);
        setGamingTimer(null);
      }
    }
  };

  const removeGamingSession = (id) => {
    if (!window.confirm('Remove this live session without billing?')) return;
    setGamingSessions(prev => prev.filter(s => s.id !== id));
  };

  // ========== Customer TV View ==========
  const openCustomerDisplay = () => {
    const popup = window.open(
      '',
      'eronixGamingDisplay',
      'width=1200,height=720,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes'
    );
    if (!popup) {
      alert('Please allow popups for this site');
      return;
    }

    const html = `<!doctype html>
<html>
<head>
  <title>Eronix Gaming Display</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    *{box-sizing:border-box}
    html,body{width:100%;height:100%;overflow:hidden}
    body{margin:0;background:radial-gradient(circle at top left,#123b72 0,#07111f 40%,#050b14 100%);color:#fff;font-family:Segoe UI,Arial,sans-serif}
    .wrap{height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:14px 24px 18px}
    .brand{font-size:38px;font-weight:1000;letter-spacing:-1px;margin:0 0 3px;text-align:center;line-height:1.18;text-shadow:0 10px 30px rgba(0,0,0,.35)}
    .sub{color:#b7cdf0;margin-bottom:12px;font-size:17px;display:flex;align-items:center;gap:8px;line-height:1.2}
    .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:18px;width:100%;max-width:1580px;height:calc(100vh - 92px)}
    .card{background:linear-gradient(145deg,rgba(45,74,116,.90),rgba(17,29,45,.96));border:1px solid rgba(255,255,255,.18);border-radius:26px;padding:20px 22px 18px;box-shadow:0 22px 48px rgba(0,0,0,.38);position:relative;overflow:hidden;min-width:0;display:flex;flex-direction:column;justify-content:space-between;gap:5px}
    .card:before{content:"";position:absolute;right:-54px;top:-76px;width:170px;height:170px;border-radius:999px;background:rgba(0,212,255,.16)}
    h2{margin:0;font-size:31px;position:relative;line-height:1.22;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:1000;letter-spacing:-.5px;padding-top:2px}
    .player{color:#c1d8ff;font-size:17px;position:relative;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;line-height:1.25}
    .timer{font-size:66px;font-weight:1000;color:#83ffc0;margin:4px 0 2px;letter-spacing:.5px;position:relative;line-height:1.02;white-space:nowrap;text-shadow:0 0 20px rgba(131,255,192,.18)}
    .rate{color:#c1d8ff;font-size:17px;position:relative;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.25}
    .mins{font-size:19px;color:#fff;font-weight:1000;position:relative;white-space:nowrap;line-height:1.2}
    .amt{font-size:40px;font-weight:1000;color:#8ec2ff;position:relative;line-height:1.06;white-space:nowrap}
    .empty{text-align:center;grid-column:1/4;grid-row:1/3;align-self:center;justify-self:center;width:min(720px,90%)}.empty .timer{font-size:66px}
    .pulse{display:inline-block;width:14px;height:14px;background:#22c55e;border-radius:999px;margin-right:2px;box-shadow:0 0 0 9px rgba(34,197,94,.13)}
    .paused .timer{color:#ffdf7b;text-shadow:0 0 20px rgba(255,223,123,.2)}
    @media(max-width:1500px){.wrap{padding:12px 18px 14px}.brand{font-size:32px}.sub{font-size:14px;margin-bottom:10px}.grid{gap:14px;height:calc(100vh - 78px);max-width:1360px}.card{border-radius:22px;padding:16px 18px 14px;gap:3px}.card:before{width:145px;height:145px;right:-48px;top:-68px}.timer{font-size:52px;margin:2px 0 0}h2{font-size:25px;line-height:1.25}.amt{font-size:34px}.player,.rate{font-size:15px}.mins{font-size:17px}}
    @media(max-width:1100px){.grid{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(3,minmax(0,1fr))}.timer{font-size:42px}h2{font-size:22px}.amt{font-size:28px}.wrap{padding:10px}}
    @media(max-width:720px){.grid{grid-template-columns:1fr;grid-template-rows:none;height:calc(100vh - 70px);overflow:hidden}.card{padding:12px}.timer{font-size:34px}.brand{font-size:22px}.sub{font-size:12px;margin-bottom:6px}}
  </style>
</head>
<body>
<div class="wrap">
  <div class="brand">ERONIX GAMING ZONE</div>
  <div class="sub"><span class="pulse"></span>Live Customer Display</div>
  <div class="grid" id="displayGrid"></div>
</div>
<script>
  const KEY = 'pos_live_sessions';
  function safeHtml(str){return String(str||'').replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m];});}
  function readSessions(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')||[]}catch(e){return []}}
  function activeMs(s){const now=s.paused&&s.pausedAt?s.pausedAt:Date.now();return Math.max(0,now-(s.startedAt||Date.now())-(s.totalPausedMs||0));}
  function duration(ms){const t=Math.max(0,Math.floor(ms/1000));const h=String(Math.floor(t/3600)).padStart(2,'0');const m=String(Math.floor((t%3600)/60)).padStart(2,'0');const sec=String(t%60).padStart(2,'0');return h+':'+m+':'+sec;}
  function minutes(s){return Math.max(1,Math.ceil(activeMs(s)/60000));}
  function amount(s){return Math.ceil(((s.rate||0)/60)*minutes(s));}
  function money(n){return '₹'+(parseFloat(n||0)).toFixed(2)}
  function render(){
    let list = readSessions().slice(0,6);
    const grid=document.getElementById('displayGrid');
    if(!list.length){
      grid.innerHTML='<div class="card empty"><h2>No Active Session</h2><div class="timer">00:00:00</div><div class="muted">Start a session from POS</div></div>';
      return;
    }
    grid.innerHTML=list.map(function(s){
      return '<div class="card '+(s.paused?'paused':'')+'"><h2>'+(s.paused?'⏸ ':'🎮 ')+safeHtml(s.device)+'</h2><div class="player">'+safeHtml(s.customer)+' • '+safeHtml(s.game)+'</div><div class="timer">'+duration(activeMs(s))+'</div><div class="rate">'+safeHtml(s.label)+' @ ₹'+safeHtml(s.rate)+'/hr</div><div class="mins">Minutes: '+minutes(s)+'</div><div class="amt">'+money(amount(s))+'</div></div>';
    }).join('');
  }
  render();
  setInterval(render,1000);
  window.addEventListener('storage',render);
<\/script>
</body>
</html>`;

    popup.document.open();
    popup.document.write(html);
    popup.document.close();
  };

  // ========== Booking Modal Handlers ==========
  const openBookingModal = () => {
    // Reset booking data with defaults
    setBookingData({
      device: devices.length ? devices[0].name : '',
      rate: rates.length ? rates[0].price : 0,
      rateLabel: rates.length ? rates[0].name : '',
      game: games.length ? games[0].name : '',
      date: new Date(),
      timeSlot: null,
      duration: 1,
      customer: customerName || 'Walk-in Player',
    });
    setBookingMonth(new Date());
    setBookingTimeSlots(generateTimeSlots());
    setIsBookingModalOpen(true);
  };

  const handleBookingFieldChange = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const handleBookingDateSelect = (date) => {
    setBookingData(prev => ({ ...prev, date, timeSlot: null }));
    setBookingTimeSlots(generateTimeSlots());
  };

  const handleBookingTimeSlotSelect = (slot) => {
    if (slot.status === 'booked') return;
    setBookingData(prev => ({ ...prev, timeSlot: slot }));
  };

  const addBookingToCart = () => {
    const { device, rate, rateLabel, game, date, timeSlot, duration, customer } = bookingData;
    if (!device || !rate || !game || !timeSlot || !duration) {
      alert('Please fill all required fields (Device, Rate, Game, Time Slot, Duration).');
      return;
    }

    const totalPrice = rate * duration;
    const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const itemName = `Gaming Slot: ${device} - ${game} (${dateStr} ${timeSlot.time})`;

    const cartItem = {
      id: Date.now() + Math.random(),
      product_id: null,
      is_virtual: true,
      name: itemName,
      hsn_code: '9985',
      size: `${duration} hr${duration > 1 ? 's' : ''}`,
      color: `Slot: ${timeSlot.time}`,
      unit: 'session',
      mrp: totalPrice,
      price: totalPrice,
      gst: 0,
      discount: 0,
      qty: 1,
      booking_info: {
        device,
        rate,
        rateLabel,
        game,
        date: date.toISOString(),
        timeSlot: timeSlot.time,
        duration,
        customer,
      },
    };

    setCart(prev => [...prev, cartItem]);
    setIsBookingModalOpen(false);
    alert('Booking added to cart!');
  };

  // ========== Calendar Helpers for Booking Modal ==========
  const getCalendarDays = (month) => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const firstDay = new Date(year, m, 1);
    const lastDay = new Date(year, m + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) { days.push(null); }
    for (let i = 1; i <= daysInMonth; i++) { days.push(new Date(year, m, i)); }
    return days;
  };

  const isDateSelected = (date) => {
    return date && bookingData.date && date.toDateString() === bookingData.date.toDateString();
  };

  const prevBookingMonth = () => {
    setBookingMonth(new Date(bookingMonth.getFullYear(), bookingMonth.getMonth() - 1, 1));
  };

  const nextBookingMonth = () => {
    setBookingMonth(new Date(bookingMonth.getFullYear(), bookingMonth.getMonth() + 1, 1));
  };

  // ========== Customer & Salesperson Handlers ==========
  const handleCustomerChange = (e) => {
    const val = e.target.value;
    setSelectedCustomer(val);
  };

  const handleSalespersonChange = (e) => {
    const val = e.target.value;
    setSelectedSalesperson(val);
  };

  const saveNewCustomer = async () => {
    try {
      const data = await posService.addCustomer(newCustomer);
      if (data.success) {
        setCustomers([...customers, data.customer]);
        setSelectedCustomer(data.customer.id);
        setIsCustomerModalOpen(false);
        setNewCustomer({ full_name: '', phone_number: '', email: '', username: '' });
      }
    } catch (err) {
      alert('Error adding customer: ' + err.message);
    }
  };

  const handlePaymentMode = (mode) => {
    setPaymentMode(mode);
    const { total } = calculateTotals();
    if (mode === 'cash') {
      setPaidAmount(total);
    } else {
      setPaidAmount(0);
    }
  };

  const holdBill = async () => {
    if (!cart.length && !gamingSessions.length) {
      alert('Cart is empty!');
      return;
    }
    const label = prompt('Label for held bill:', 'Bill ' + new Date().toLocaleTimeString());
    if (!label) return;
    const billData = {
      cart,
      gamingSessions,
      discountPercent,
      terms,
      customer: selectedCustomer,
      salesperson: selectedSalesperson,
      paymentMode,
      customerName,
      customerMobile,
      salespersonName,
    };
    try {
      await posService.holdBill(label, billData);
      alert('Bill held successfully');
      clearCart();
      setGamingSessions([]);
      if (gamingTimer) { clearInterval(gamingTimer); setGamingTimer(null); }
      fetchHeldBills();
    } catch (err) {
      alert('Error holding bill: ' + err.message);
    }
  };

  const recallBill = async (id) => {
    try {
      const data = await posService.recallBill(id);
      if (data.success) {
        const bill = JSON.parse(data.data);
        setCart(bill.cart || []);
        setGamingSessions(bill.gamingSessions || []);
        setDiscountPercent(bill.discountPercent || 0);
        setTerms(bill.terms || '');
        setSelectedCustomer(bill.customer || '');
        setSelectedSalesperson(bill.salesperson || '');
        setPaymentMode(bill.paymentMode || 'cash');
        setShowHeldDropdown(false);
        if (bill.gamingSessions && bill.gamingSessions.length && !gamingTimer) {
          const timer = setInterval(() => {
            setGamingSessions(prev => [...prev]);
          }, 1000);
          setGamingTimer(timer);
        }
        fetchHeldBills();
      }
    } catch (err) {
      alert('Error recalling bill: ' + err.message);
    }
  };

  const saveInvoice = async () => {
    if (!cart.length) {
      alert('Cart is empty!');
      return;
    }
    const { subtotal, taxTotal, discAmt, roundOff, total } = calculateTotals();

    const invoiceData = {
      customer_id: selectedCustomer || null,
      customer_name: customerName,
      customer_mobile: customerMobile,
      salesperson_id: selectedSalesperson || null,
      salesperson_name: salespersonName,
      items: cart.map(item => ({
        product_id: item.product_id,
        is_virtual: item.is_virtual,
        name: item.name,
        hsn_code: item.hsn_code || '9985',
        size: item.size || '',
        color: item.color || '',
        unit: item.unit || 'pcs',
        mrp: item.mrp || 0,
        price: item.price || 0,
        gst: item.gst || 0,
        discount: item.discount || 0,
        qty: item.qty || 1,
      })),
      discount_percent: discountPercent,
      subtotal,
      tax_amount: taxTotal,
      round_off: roundOff,
      total_amount: total,
      paid_amount: paidAmount || 0,
      due_amount: Math.max(0, total - paidAmount),
      payment_mode: paymentMode,
      notes: '',
      terms: terms,
    };

    try {
      const result = await posService.saveInvoice(invoiceData);
      if (result.success) {
        alert(`Invoice #${result.invoiceNo} saved successfully!`);
        clearCart();
        setGamingSessions([]);
        if (gamingTimer) { clearInterval(gamingTimer); setGamingTimer(null); }
      }
    } catch (err) {
      alert('Error saving invoice: ' + err.message);
    }
  };

  // ========== Render ==========
  const { subtotal, taxTotal, discAmt, roundOff, total } = calculateTotals();
  const due = Math.max(0, total - paidAmount);
  const change = paidAmount - total;

  return (
    <div className="pos-container">
      {/* Header */}
      <div className="pos-header">
        <div className="pos-header-left">
          <h1><i className="fas fa-gamepad"></i> Premium Gaming POS</h1>
          <p>
            <kbd>F1</kbd> New <kbd>F2</kbd> Hold <kbd>F3</kbd> Pay <kbd>F4</kbd> Print
          </p>
        </div>
        <div className="pos-header-actions">
          <button className="btn-outline" onClick={openCustomerDisplay} title="Customer TV View">
            <i className="fas fa-tv"></i> TV View
          </button>
          <button className="btn-outline" onClick={openBookingModal} title="Book a Session">
            <i className="fas fa-calendar-plus"></i> Book Slot
          </button>
          {heldBills.length > 0 && (
            <div className="dropdown" style={{ position: 'relative' }}>
              <button className="btn-outline" onClick={() => setShowHeldDropdown(!showHeldDropdown)}>
                <i className="fas fa-pause-circle"></i> Held Bills <span className="badge">{heldBills.length}</span>
              </button>
              {showHeldDropdown && (
                <div className="held-dropdown">
                  {heldBills.map(bill => (
                    <div key={bill.id} className="held-item" onClick={() => recallBill(bill.id)}>
                      <div className="held-label">{bill.label}</div>
                      <div className="held-time">{new Date(bill.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <button className="btn-outline" onClick={clearCart}><i className="fas fa-trash"></i> Clear</button>
          <button className="btn-primary" onClick={() => window.location.href = '/admin/game-zone/sales-history'}>
            <i className="fas fa-history"></i> History
          </button>
        </div>
      </div>

      <div className="pos-layout">
        {/* Left Panel */}
        <div className="pos-left">
          {/* Search & Filter */}
          <div className="pos-search-row">
            <div className="pos-search-wrap">
              <i className="fas fa-barcode search-icon"></i>
              <input
                ref={searchInputRef}
                type="text"
                className="pos-search"
                placeholder="Search quick buttons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="finp" value={activeType} onChange={(e) => setActiveType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="gaming">Gaming</option>
              <option value="drink">Drinks</option>
              <option value="snack">Snacks</option>
              <option value="combo">Combos</option>
            </select>
          </div>

          {/* Quick Buttons Grid */}
          <div className="product-grid">
            {filteredButtons.length === 0 ? (
              <div className="empty-grid">No quick buttons found</div>
            ) : (
              filteredButtons.map(btn => (
                <div key={btn.id} className="product-card" onClick={() => addToCart(btn)}>
                  <div className="product-img"><i className="fas fa-cube"></i></div>
                  <h4>{btn.name}</h4>
                  <p className="product-price">₹{parseFloat(btn.price).toFixed(2)}</p>
                  <div className="product-type">{btn.type}</div>
                </div>
              ))
            )}
          </div>

          {/* Gaming Sessions */}
          <div className="gaming-hero">
            <div className="gaming-top">
              <div className="gaming-title">
                <h2><i className="fas fa-clock"></i> Live Sessions</h2>
                <p>Start a custom session to track time and bill per minute</p>
              </div>
              <div className="gaming-live-pill"><i className="fas fa-circle"></i> {gamingSessions.length} active</div>
            </div>

            <div className="gaming-layout">
              <div className="gaming-card">
                <div className="gaming-card-title"><b>Start Custom Session</b></div>
                <div className="session-form">
                  <select id="gDevice" className="ginp">
                    {devices.length === 0 ? (
                      <option value="PS5 Station 01">PS5 Station 01</option>
                    ) : (
                      devices.map(device => (
                        <option key={device.id} value={device.name}>{device.name}</option>
                      ))
                    )}
                  </select>
                  <select id="gRate" className="ginp">
                    {rates.length === 0 ? (
                      <>
                        <option value="100|PS5 Gaming - 1 Player">PS5 1 Player - ₹100/hr</option>
                        <option value="150|PS5 Gaming - 2 Players">PS5 2 Players - ₹150/hr</option>
                        <option value="200|PS5 Gaming - 3 Players">PS5 3 Players - ₹200/hr</option>
                        <option value="250|PS5 Gaming - 4 Players">PS5 4 Players - ₹250/hr</option>
                        <option value="50|Gaming PC">Gaming PC - ₹50/hr</option>
                        <option value="60|Gaming PC + Gamepad">PC + Gamepad - ₹60/hr</option>
                      </>
                    ) : (
                      rates.map(rate => (
                        <option key={rate.id} value={`${rate.price}|${rate.name}`}>
                          {rate.name} - ₹{rate.price}/hr
                        </option>
                      ))
                    )}
                  </select>
                  <input id="gCustomer" className="ginp" placeholder="Player name" />
                  <select id="gGame" className="ginp">
                    {games.length === 0 ? (
                      <>
                        <option value="FC 25">FC 25</option>
                        <option value="GTA V">GTA V</option>
                        <option value="Fortnite">Fortnite</option>
                        <option value="Call of Duty">Call of Duty</option>
                        <option value="FIFA">FIFA</option>
                      </>
                    ) : (
                      games.map(game => (
                        <option key={game.id} value={game.name}>{game.name}</option>
                      ))
                    )}
                  </select>
                  <button type="button" className="gaming-start" onClick={startGamingSession}>
                    <i className="fas fa-play"></i> Start Session
                  </button>
                </div>
              </div>
              <div className="gaming-card">
                <div className="gaming-card-title"><b>Live Sessions</b></div>
                <div className="live-session-list">
                  {gamingSessions.length === 0 ? (
                    <div className="live-session"><b>No active session</b><span>Start a custom session</span><strong>00:00:00</strong></div>
                  ) : (
                    gamingSessions.map(s => (
                      <div key={s.id} className={`live-session ${s.paused ? 'paused' : ''}`}>
                        <b>{s.device} {s.paused && '• PAUSED'}</b>
                        <span>{s.customer} • {s.game}</span>
                        <span>{s.label} @ ₹{s.rate}/hr</span>
                        <strong>{formatDuration(sessionActiveMs(s))}</strong>
                        <span>Minutes: {sessionMinutes(s)} • ₹{sessionAmount(s)}</span>
                        <div className="live-actions">
                          <button className="live-bill" onClick={() => billGamingSession(s.id, false)}>Add Bill</button>
                          <button className="live-pause" onClick={() => togglePauseSession(s.id)}>{s.paused ? 'Resume' : 'Pause'}</button>
                          <button className="live-stop" onClick={() => billGamingSession(s.id, true)}>Stop</button>
                        </div>
                        <div className="live-actions">
                          <button className="live-remove" onClick={() => removeGamingSession(s.id)}>Remove</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cart Table */}
          <div className="cart-wrap">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Disc%</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.length === 0 ? (
                  <tr><td colSpan="7"><div className="empty-cart"><i className="fas fa-shopping-cart"></i><div>Cart is Empty</div></div></td></tr>
                ) : (
                  cart.map((item, idx) => {
                    const lineTotal = item.qty * item.price * (1 - item.discount / 100);
                    return (
                      <tr key={item.id}>
                        <td>{idx + 1}</td>
                        <td>
                          <div className="item-name">{item.name}</div>
                          <div className="item-meta">{item.size} {item.color}</div>
                          {item.booking_info && (
                            <div className="item-meta" style={{ color: '#a855f7', fontSize: '11px' }}>
                              <i className="fas fa-calendar-check"></i> {new Date(item.booking_info.date).toLocaleDateString()} {item.booking_info.timeSlot}
                            </div>
                          )}
                        </td>
                        <td>
                          <input type="number" className="qty-inp" value={item.price} step="0.01" onChange={(e) => updateCartItem(item.id, 'price', parseFloat(e.target.value) || 0)} />
                        </td>
                        <td>
                          <div className="qty-control">
                            <button onClick={() => updateCartItem(item.id, 'qty', Math.max(1, item.qty - 1))}>-</button>
                            <input type="number" className="qty-inp" value={item.qty} min="1" onChange={(e) => updateCartItem(item.id, 'qty', parseInt(e.target.value) || 1)} />
                            <button onClick={() => updateCartItem(item.id, 'qty', item.qty + 1)}>+</button>
                          </div>
                        </td>
                        <td>
                          <input type="number" className="disc-inp" value={item.discount} min="0" max="100" step="0.5" onChange={(e) => updateCartItem(item.id, 'discount', parseFloat(e.target.value) || 0)} />
                        </td>
                        <td className="item-total">₹{lineTotal.toFixed(2)}</td>
                        <td><button className="del-btn" onClick={() => removeCartItem(item.id)}><i className="fas fa-times"></i></button></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Customer, Salesperson, Terms Row */}
          <div className="customer-row">
            <div>
              <label className="lbl">Customer</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <select className="finp" value={selectedCustomer} onChange={handleCustomerChange} style={{ flex: 1 }}>
                  <option value="">Walk-in Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.mobile ? `(${c.mobile})` : ''}</option>
                  ))}
                </select>
                <button className="btn-icon" onClick={() => setIsCustomerModalOpen(true)} title="Add Customer"><i className="fas fa-user-plus"></i></button>
              </div>
            </div>
            <div>
              <label className="lbl">Salesperson</label>
              <select className="finp" value={selectedSalesperson} onChange={handleSalespersonChange}>
                <option value="">Select Salesperson</option>
                {salespersons.map(sp => (
                  <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="lbl">T&C Template</label>
              <select className="finp" onChange={(e) => {
                const templates = {
                  laptop: `Goods once sold cannot be returned or exchanged.\n\nWarranty on Products: 1 Year Warranty.\n\nWarranty T&C - Warranty does not cover physical damage like liquid spill, water spill, burn, high voltage damage, display broken or crack, display line, display patch, speaker damage, keys broken or any other physical damage. Loss of data, software or any other information.\n\nExclusions from Warranty - Consumable parts such as batteries are not covered.\n\nService Warranty - Covers the cost of service/labour. Any parts replaced will be charged at actuals.\n\nDelivery charges may be additional.`,
                  gaming: `Gaming charges are non-refundable once session starts.\n\nCustomer is responsible for any physical damage to controller, headset, keyboard, mouse, monitor, console or gaming accessories.\n\nFood, drinks and rough handling are not allowed near gaming setup.\n\nSession time will be counted from start time. Extra time will be charged as per store pricing.\n\nEronix Technologies is not responsible for saved game progress or online account issues.`,
                  accessories: `Goods once sold cannot be returned or exchanged.\n\nWarranty is applicable only if provided by brand/manufacturer.\n\nWarranty does not cover physical damage, burnt, liquid damage, broken cable, broken connector or misuse.\n\nReplacement or service will be as per company warranty policy.\n\nDelivery charges may be additional.`
                };
                const val = e.target.value;
                if (templates[val]) setTerms(templates[val]);
              }}>
                <option value="">Select Template</option>
                <option value="laptop">Laptop T&C</option>
                <option value="gaming">Gaming Zone T&C</option>
                <option value="accessories">Accessories T&C</option>
              </select>
            </div>
            <div>
              <label className="lbl">Terms</label>
              <button className="terms-open-btn" onClick={() => { setTermsContent(terms); setIsTermsModalOpen(true); }}>
                <i className="fas fa-file-contract"></i> View/Edit Terms
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Bill Summary */}
        <div className="pos-right">
          <div className="bill-panel">
            <div className="bill-hdr">
              <h5><i className="fas fa-receipt"></i> Bill Summary</h5>
            </div>
            <div className="bill-body">
              <div className="b-row"><span>Items</span><span>{cart.length}</span></div>
              <div className="b-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="b-row">
                <span>Discount</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input type="number" className="disc-inp" value={discountPercent} min="0" max="100" step="0.5" onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)} />
                  <span style={{ fontSize: '12px' }}>%</span>
                  <span style={{ fontWeight: '600', color: '#ef4444' }}>-₹{discAmt.toFixed(2)}</span>
                </div>
              </div>
              <div className="b-row"><span>GST</span><span>₹{taxTotal.toFixed(2)}</span></div>
              <div className="b-row"><span>Round Off</span><span>{roundOff >= 0 ? '+' : ''}₹{roundOff.toFixed(2)}</span></div>
              <div className="b-row total">
                <span>Total</span>
                <span className="val">₹{total.toFixed(2)}</span>
              </div>

              <div style={{ marginTop: '14px' }}>
                <label className="lbl">Payment Method</label>
                <div className="pm-btns">
                  {['cash', 'card', 'upi', 'credit'].map(mode => (
                    <div
                      key={mode}
                      className={`pm-btn ${paymentMode === mode ? 'active' : ''}`}
                      onClick={() => handlePaymentMode(mode)}
                    >
                      {mode === 'cash' && <i className="fas fa-money-bill-wave"></i>}
                      {mode === 'card' && <i className="fas fa-credit-card"></i>}
                      {mode === 'upi' && <i className="fas fa-mobile-alt"></i>}
                      {mode === 'credit' && <i className="fas fa-file-invoice-dollar"></i>}
                      <br />
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="payment-row">
                <div>
                  <label className="lbl">Amount Paid</label>
                  <input type="number" className="finp" value={paidAmount} min="0" step="0.01" onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="lbl">Balance Due</label>
                  <div className="finp due">{due > 0 ? `₹${due.toFixed(2)}` : '₹0.00'}</div>
                </div>
              </div>

              {change > 0 && paymentMode === 'cash' && (
                <div className="change-box">
                  <i className="fas fa-hand-holding-usd"></i> Change: <strong>₹{change.toFixed(2)}</strong>
                </div>
              )}
            </div>
            <div className="bill-foot">
              <button className="btn-hold" onClick={holdBill}><i className="fas fa-pause"></i> Hold Bill (F2)</button>
              <button className="btn-save" onClick={saveInvoice}><i className="fas fa-print"></i> Save & Print (F3)</button>
            </div>
          </div>
        </div>
      </div>

      {/* ======== BOOKING MODAL ======== */}
      {isBookingModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <h2 className="modal-title"><i className="fas fa-calendar-plus"></i> Book a Gaming Slot</h2>
            <div className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Device *</label>
                  <select className="finp" value={bookingData.device} onChange={(e) => handleBookingFieldChange('device', e.target.value)}>
                    {devices.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                    {devices.length === 0 && <option>PS5 Station 01</option>}
                  </select>
                </div>
                <div className="form-group">
                  <label>Game *</label>
                  <select className="finp" value={bookingData.game} onChange={(e) => handleBookingFieldChange('game', e.target.value)}>
                    {games.map(g => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                    {games.length === 0 && <option>Gaming</option>}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rate *</label>
                  <select className="finp" value={`${bookingData.rate}|${bookingData.rateLabel}`} onChange={(e) => {
                    const [rate, label] = e.target.value.split('|');
                    handleBookingFieldChange('rate', parseFloat(rate));
                    handleBookingFieldChange('rateLabel', label);
                  }}>
                    {rates.map(r => (
                      <option key={r.id} value={`${r.price}|${r.name}`}>{r.name} - ₹{r.price}/hr</option>
                    ))}
                    {rates.length === 0 && (
                      <>
                        <option value="100|PS5 1 Player">PS5 1 Player - ₹100/hr</option>
                        <option value="150|PS5 2 Players">PS5 2 Players - ₹150/hr</option>
                        <option value="50|PC Gaming">PC Gaming - ₹50/hr</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label>Duration (hours) *</label>
                  <input type="number" className="finp" min="1" max="12" value={bookingData.duration} onChange={(e) => handleBookingFieldChange('duration', parseInt(e.target.value) || 1)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input type="text" className="finp" value={bookingData.customer} onChange={(e) => handleBookingFieldChange('customer', e.target.value)} />
                </div>
                <div style={{ flex: 1 }}></div>
              </div>

              <div className="form-row" style={{ marginTop: '12px' }}>
                <div className="calendar-section" style={{ flex: 1 }}>
                  <div className="calendar-header">
                    <button onClick={prevBookingMonth}>‹</button>
                    <h3>{bookingMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={nextBookingMonth}>›</button>
                  </div>
                  <div className="calendar-weekdays">
                    {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                      <div key={day} className="weekday">{day}</div>
                    ))}
                  </div>
                  <div className="calendar-days">
                    {getCalendarDays(bookingMonth).map((date, idx) => (
                      <div
                        key={idx}
                        className={`calendar-day ${date ? '' : 'empty'} ${date && isDateSelected(date) ? 'selected' : ''}`}
                        onClick={() => date && handleBookingDateSelect(date)}
                      >
                        {date ? date.getDate() : ''}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="timeslots-section" style={{ flex: 1, marginLeft: '16px' }}>
                  <h4>Available Time Slots</h4>
                  <div className="slot-legend">
                    <span className="legend-item"><span className="legend-box available"></span> Available</span>
                    <span className="legend-item"><span className="legend-box booked"></span> Booked</span>
                    <span className="legend-item"><span className="legend-box selected"></span> Selected</span>
                  </div>
                  <div className="slot-grid" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {bookingTimeSlots.map((slot, idx) => (
                      <button
                        key={idx}
                        className={`time-slot ${slot.status} ${bookingData.timeSlot?.time === slot.time ? 'selected' : ''}`}
                        disabled={slot.status === 'booked'}
                        onClick={() => handleBookingTimeSlotSelect(slot)}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px', background: '#1e293b', padding: '12px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Selected Slot:</span>
                  <span style={{ color: '#f8fafc', fontWeight: '600' }}>
                    {bookingData.timeSlot ? `${bookingData.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} ${bookingData.timeSlot.time}` : 'None'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginTop: '4px' }}>
                  <span>Total Price:</span>
                  <span style={{ color: '#f8fafc', fontWeight: '600' }}>₹{(bookingData.rate * bookingData.duration).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-gray" onClick={() => setIsBookingModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={addBookingToCart}><i className="fas fa-cart-plus"></i> Add to Cart</button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {isCustomerModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h2 className="modal-title"><i className="fas fa-user-plus"></i> Add New Customer</h2>
            <div className="modal-form">
              <div className="form-row">
                <label>Full Name *</label>
                <input type="text" className="finp" value={newCustomer.full_name} onChange={(e) => setNewCustomer({ ...newCustomer, full_name: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Phone Number</label>
                <input type="text" className="finp" value={newCustomer.phone_number} onChange={(e) => setNewCustomer({ ...newCustomer, phone_number: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Email</label>
                <input type="email" className="finp" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Username</label>
                <input type="text" className="finp" value={newCustomer.username} onChange={(e) => setNewCustomer({ ...newCustomer, username: e.target.value })} placeholder="Optional auto-generate" />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-gray" onClick={() => setIsCustomerModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveNewCustomer}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {isTermsModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <h2 className="modal-title"><i className="fas fa-file-contract"></i> Terms & Conditions</h2>
            <div className="modal-form">
              <textarea className="finp terms-modal-area" rows="14" value={termsContent} onChange={(e) => setTermsContent(e.target.value)}></textarea>
            </div>
            <div className="modal-actions">
              <button className="btn-gray" onClick={() => setIsTermsModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => { setTerms(termsContent); setIsTermsModalOpen(false); }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;