import React, { useState, useEffect, useRef, useCallback } from 'react';
import posService from '../../../services/posService';
import gameDeviceService from '../../../services/gameDeviceService';
import gameRateService from '../../../services/gameRateService';
import gameService from '../../../services/gameService';
import gameBookingService from '../../../services/gameBookingService';
import tvSyncService from '../../../services/tvSyncService';
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

  // ========== Gaming Sessions (Persistent via localStorage) ==========
  const [gamingSessions, setGamingSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('pos_live_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [gamingTimer, setGamingTimer] = useState(null);

  // Ensure the interval runs on mount if there are active sessions restored from storage
  useEffect(() => {
    if (gamingSessions.length > 0 && !gamingTimer) {
      const timer = setInterval(() => {
        setGamingSessions(prev => [...prev]);
      }, 1000);
      setGamingTimer(timer);
    }
    return () => {
      if (gamingTimer) clearInterval(gamingTimer);
    };
  }, [gamingSessions.length]);

  // Keep localStorage updated whenever sessions change
  useEffect(() => {
    try {
      localStorage.setItem('pos_live_sessions', JSON.stringify(gamingSessions));
    } catch (e) { /* ignore */ }
  }, [gamingSessions]);

  // ========== Booking Modal ==========
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    device: '',
    rate: 0,
    rateLabel: '',
    game: '',
    date: new Date(),
    timeSlot: null,
    duration: 1,
    customer: '',
    bookingMode: 'now',
    startTime: '',
  });
  const [bookingMonth, setBookingMonth] = useState(new Date());
  const [bookingTimeSlots, setBookingTimeSlots] = useState(generateTimeSlots());
  const [liveTimeline, setLiveTimeline] = useState({ devices: [], bookings: [] });
  const [bookingConflict, setBookingConflict] = useState('');

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

  // Sync sessions to unified TV display service
  useEffect(() => {
    const formattedSessions = gamingSessions.map(s => {
      const activeMs = s.paused && s.pausedAt 
        ? Math.max(0, s.pausedAt - s.startedAt - (s.totalPausedMs || 0))
        : Math.max(0, Date.now() - s.startedAt - (s.totalPausedMs || 0));
      const mins = Math.max(1, Math.ceil(activeMs / 60000));
      const amt = Math.ceil((s.rate / 60) * mins);
      return {
        id: s.id,
        device: s.device,
        customer: s.customer,
        game: s.game,
        label: s.label,
        rate: s.rate,
        startedAt: s.startedAt,
        paused: s.paused,
        pausedAt: s.pausedAt,
        totalPausedMs: s.totalPausedMs,
        minutesCount: mins,
        amountVal: amt,
        statusText: 'Active Session'
      };
    });
    tvSyncService.updateSessions(formattedSessions);
  }, [gamingSessions]);

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

  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setPaidAmount(0);
    setPaymentMode('cash');
  };

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

  const openCustomerDisplay = () => {
    tvSyncService.openTvDisplay();
  };

  const openBookingModal = () => {
    setBookingData({
      device: devices.length ? devices[0].name : '',
      rate: rates.length ? rates[0].price : 0,
      rateLabel: rates.length ? rates[0].name : '',
      game: games.length ? games[0].name : '',
      date: new Date(),
      timeSlot: null,
      duration: 1,
      customer: customerName || 'Walk-in Player',
      bookingMode: 'now',
      startTime: new Date().toTimeString().slice(0,5),
    });
    setBookingMonth(new Date());
    setBookingTimeSlots(generateTimeSlots());
    setBookingConflict('');
    setIsBookingModalOpen(true);
    const today = new Date();
    const ds = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    gameBookingService.getTimeline(ds).then(data => setLiveTimeline({ devices: data.devices || [], bookings: data.bookings || [] })).catch(() => {});
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
      alert('Please fill all required fields.');
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
      booking_info: { device, rate, rateLabel, game, date: date.toISOString(), timeSlot: timeSlot.time, duration, customer },
    };

    setCart(prev => [...prev, cartItem]);
    setIsBookingModalOpen(false);
    alert('Booking added to cart!');
  };

  const startWalkInSession = async () => {
    const deviceObj = devices.find(d => d.name === bookingData.device);
    const gameObj = games.find(g => g.name === bookingData.game);
    const rateObj = rates.find(r => r.name === bookingData.rateLabel) || rates.find(r => Number(r.price) === Number(bookingData.rate));
    if (!deviceObj) return alert('Please select a valid device.');
    const d = bookingData.date || new Date();
    const [hh, mm] = (bookingData.startTime || new Date().toTimeString().slice(0,5)).split(':').map(Number);
    const start = new Date(d); start.setHours(hh, mm, 0, 0);
    try {
      setBookingConflict('');
      await gameBookingService.createWalkIn({
        device_id: deviceObj.id, game_id: gameObj?.id || null, rate_id: rateObj?.id || null,
        customer_name: bookingData.customer || 'Walk-in Customer',
        start_time: `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')}T${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:00+05:30`,
        duration_minutes: Math.round(Number(bookingData.duration) * 60), total_price: bookingData.rate * bookingData.duration
      });
      setIsBookingModalOpen(false);
      alert(`Session started successfully.`);
    } catch (e) {
      const conflict = e.response?.data?.conflict;
      const msg = conflict ? `Conflict: this device already has a booking.` : (e.response?.data?.message || 'Unable to start walk-in session.');
      setBookingConflict(msg);
    }
  };

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

  const handleCustomerChange = (e) => setSelectedCustomer(e.target.value);
  const handleSalespersonChange = (e) => setSelectedSalesperson(e.target.value);

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
    if (mode === 'cash') setPaidAmount(total);
    else setPaidAmount(0);
  };

  const holdBill = async () => {
    if (!cart.length && !gamingSessions.length) {
      alert('Cart is empty!');
      return;
    }
    const label = prompt('Label for held bill:', 'Bill ' + new Date().toLocaleTimeString());
    if (!label) return;
    const billData = {
      cart, gamingSessions, discountPercent, terms, customer: selectedCustomer,
      salesperson: selectedSalesperson, paymentMode, customerName, customerMobile, salespersonName,
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
          const timer = setInterval(() => { setGamingSessions(prev => [...prev]); }, 1000);
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
      customer_id: selectedCustomer || null, customer_name: customerName, customer_mobile: customerMobile,
      salesperson_id: selectedSalesperson || null, salesperson_name: salespersonName,
      items: cart.map(item => ({
        product_id: item.product_id, is_virtual: item.is_virtual, name: item.name,
        hsn_code: item.hsn_code || '9985', size: item.size || '', color: item.color || '',
        unit: item.unit || 'pcs', mrp: item.mrp || 0, price: item.price || 0,
        gst: item.gst || 0, discount: item.discount || 0, qty: item.qty || 1,
      })),
      discount_percent: discountPercent, subtotal, tax_amount: taxTotal, round_off: roundOff,
      total_amount: total, paid_amount: paidAmount || 0, due_amount: Math.max(0, total - paidAmount),
      payment_mode: paymentMode, notes: '', terms: terms,
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

  const { subtotal, taxTotal, discAmt, roundOff, total } = calculateTotals();
  const due = Math.max(0, total - paidAmount);
  const change = paidAmount - total;

  return (
    <div className="pos-container">
      <div className="pos-header">
        <div className="pos-header-left">
          <h1><i className="fas fa-gamepad"></i> Premium Gaming POS</h1>
          <p><kbd>F1</kbd> New <kbd>F2</kbd> Hold <kbd>F3</kbd> Pay <kbd>F4</kbd> Print</p>
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
        <div className="pos-left">
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
                    {devices.length === 0 ? <option value="PS5 Station 01">PS5 Station 01</option> : devices.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                  <select id="gRate" className="ginp">
                    {rates.length === 0 ? <option value="100|PS5 Gaming - 1 Player">PS5 1 Player - ₹100/hr</option> : rates.map(rate => <option key={rate.id} value={`${rate.price}|${rate.name}`}>{rate.name} - ₹{rate.price}/hr</option>)}
                  </select>
                  <input id="gCustomer" className="ginp" placeholder="Player name" />
                  <select id="gGame" className="ginp">
                    {games.length === 0 ? <option value="FC 25">FC 25</option> : games.map(game => <option key={game.id} value={game.name}>{game.name}</option>)}
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

          <div className="cart-wrap">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>#</th><th>Item</th><th>Price</th><th>Qty</th><th>Disc%</th><th>Amount</th><th></th>
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
                        </td>
                        <td><input type="number" className="qty-inp" value={item.price} step="0.01" onChange={(e) => updateCartItem(item.id, 'price', parseFloat(e.target.value) || 0)} /></td>
                        <td>
                          <div className="qty-control">
                            <button onClick={() => updateCartItem(item.id, 'qty', Math.max(1, item.qty - 1))}>-</button>
                            <input type="number" className="qty-inp" value={item.qty} min="1" onChange={(e) => updateCartItem(item.id, 'qty', parseInt(e.target.value) || 1)} />
                            <button onClick={() => updateCartItem(item.id, 'qty', item.qty + 1)}>+</button>
                          </div>
                        </td>
                        <td><input type="number" className="disc-inp" value={item.discount} min="0" max="100" step="0.5" onChange={(e) => updateCartItem(item.id, 'discount', parseFloat(e.target.value) || 0)} /></td>
                        <td className="item-total">₹{lineTotal.toFixed(2)}</td>
                        <td><button className="del-btn" onClick={() => removeCartItem(item.id)}><i className="fas fa-times"></i></button></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="customer-row">
            <div>
              <label className="lbl">Customer</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <select className="finp" value={selectedCustomer} onChange={handleCustomerChange} style={{ flex: 1 }}>
                  <option value="">Walk-in Customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.mobile ? `(${c.mobile})` : ''}</option>)}
                </select>
                <button className="btn-icon" onClick={() => setIsCustomerModalOpen(true)} title="Add Customer"><i className="fas fa-user-plus"></i></button>
              </div>
            </div>
            <div>
              <label className="lbl">Salesperson</label>
              <select className="finp" value={selectedSalesperson} onChange={handleSalespersonChange}>
                <option value="">Select Salesperson</option>
                {salespersons.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
              </select>
            </div>
            <div>
              <label className="lbl">T&C Template</label>
              <select className="finp" onChange={(e) => {
                const templates = {
                  gaming: `Gaming charges are non-refundable once session starts.`
                };
                if (templates[e.target.value]) setTerms(templates[e.target.value]);
              }}>
                <option value="">Select Template</option>
                <option value="gaming">Gaming Zone T&C</option>
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

        <div className="pos-right">
          <div className="bill-panel">
            <div className="bill-hdr"><h5><i className="fas fa-receipt"></i> Bill Summary</h5></div>
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
              <div className="b-row total"><span>Total</span><span className="val">₹{total.toFixed(2)}</span></div>

              <div style={{ marginTop: '14px' }}>
                <label className="lbl">Payment Method</label>
                <div className="pm-btns">
                  {['cash', 'card', 'upi', 'credit'].map(mode => (
                    <div key={mode} className={`pm-btn ${paymentMode === mode ? 'active' : ''}`} onClick={() => handlePaymentMode(mode)}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="payment-row">
                <div><label className="lbl">Amount Paid</label><input type="number" className="finp" value={paidAmount} min="0" step="0.01" onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)} /></div>
                <div><label className="lbl">Balance Due</label><div className="finp due">{due > 0 ? `₹${due.toFixed(2)}` : '₹0.00'}</div></div>
              </div>
            </div>
            <div className="bill-foot">
              <button className="btn-hold" onClick={holdBill}><i className="fas fa-pause"></i> Hold Bill (F2)</button>
              <button className="btn-save" onClick={saveInvoice}><i className="fas fa-print"></i> Save & Print (F3)</button>
            </div>
          </div>
        </div>
      </div>

      {isBookingModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <h2 className="modal-title"><i className="fas fa-calendar-plus"></i> Book a Gaming Slot</h2>
            <div className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Device *</label>
                  <select className="finp" value={bookingData.device} onChange={(e) => handleBookingFieldChange('device', e.target.value)}>
                    {devices.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Game *</label>
                  <select className="finp" value={bookingData.game} onChange={(e) => handleBookingFieldChange('game', e.target.value)}>
                    {games.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn-gray" onClick={() => setIsBookingModalOpen(false)}>Cancel</button>
                <button className="btn-primary" onClick={startWalkInSession}><i className="fas fa-play"></i> Start Session</button>
                <button className="btn-primary" onClick={addBookingToCart}><i className="fas fa-cart-plus"></i> Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;