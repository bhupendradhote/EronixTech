// src/services/tvSyncService.js
const CHANNEL_NAME = 'eronix_tv_sync_channel';
const STORAGE_KEY = 'eronix_active_tv_sessions';

class TvSyncService {
    constructor() {
        if (typeof window !== 'undefined') {
            this.channel = new BroadcastChannel(CHANNEL_NAME);
        }
    }

    updateSessions(sessions) {
        try {
            // Merge existing storage or overwrite with latest payload
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
            if (this.channel) {
                this.channel.postMessage({ type: 'SESSIONS_UPDATED', sessions });
            }
        } catch (e) {
            console.error('Error syncing TV sessions:', e);
        }
    }

    getSessions() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }

    openTvDisplay() {
        const popup = window.open(
            '',
            'eronixUnifiedGamingDisplay',
            'width=1200,height=720,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes'
        );
        if (!popup) {
            alert('Please allow popups for this site to open the TV View.');
            return;
        }

        const html = `<!doctype html>
<html>
<head>
  <title>Eronix Unified Live Gaming Display</title>
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
  </style>
</head>
<body>
<div class="wrap">
  <div class="brand">ERONIX GAMING ZONE</div>
  <div class="sub"><span class="pulse"></span>Unified Live Customer Display</div>
  <div class="grid" id="displayGrid"></div>
</div>
<script>
  const STORAGE_KEY = 'eronix_active_tv_sessions';
  const CHANNEL_NAME = 'eronix_tv_sync_channel';
  const channel = new BroadcastChannel(CHANNEL_NAME);

  function safeHtml(str){return String(str||'').replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m];});}
  function readSessions(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')||[]}catch(e){return []}}
  
  function renderSessions(list){
    const grid=document.getElementById('displayGrid');
    if(!list || !list.length){
      grid.innerHTML='<div class="card empty"><h2>No Active Sessions</h2><div class="timer">00:00:00</div><div class="muted">Start a session from POS or Bookings</div></div>';
      return;
    }
    grid.innerHTML=list.slice(0,6).map(function(s){
      const isPaused = s.paused;
      let timerText = '';
      
      // If it has a countdown target (Bookings) vs Stopwatch (POS)
      if (s.type === 'booking') {
        const remaining = Math.max(0, Math.floor((s.endTime - Date.now()) / 1000));
        const hrs = Math.floor(remaining / 3600);
        const mins = Math.floor((remaining % 3600) / 60);
        const secs = remaining % 60;
        timerText = String(hrs).padStart(2,'0')+':'+String(mins).padStart(2,'0')+':'+String(secs).padStart(2,'0');
      } else {
        const now = isPaused && s.pausedAt ? s.pausedAt : Date.now();
        const activeMs = Math.max(0, now - (s.startedAt || Date.now()) - (s.totalPausedMs || 0));
        const t = Math.max(0, Math.floor(activeMs/1000));
        const h = String(Math.floor(t/3600)).padStart(2,'0');
        const m = String(Math.floor((t%3600)/60)).padStart(2,'0');
        const sec = String(t%60).padStart(2,'0');
        timerText = h+':'+m+':'+sec;
      }

      const amtVal = s.amountVal !== undefined ? '₹' + parseFloat(s.amountVal).toFixed(2) : '₹0.00';

      return '<div class="card '+(isPaused?'paused':'')+'"><h2>'+(isPaused?'⏸ ':'🎮 ')+safeHtml(s.device)+'</h2><div class="player">'+safeHtml(s.customer)+' • '+safeHtml(s.game)+'</div><div class="timer">'+timerText+'</div><div class="rate">'+safeHtml(s.label)+'</div><div class="mins">Status: '+safeHtml(s.statusText || 'Playing')+'</div><div class="amt">'+amtVal+'</div></div>';
    }).join('');
  }

  renderSessions(readSessions());

  channel.onmessage = function(e) {
    if(e.data && e.data.type === 'SESSIONS_UPDATED') {
      renderSessions(e.data.sessions);
    }
  };

  window.addEventListener('storage', function() {
    renderSessions(readSessions());
  });

  setInterval(function() {
    renderSessions(readSessions());
  }, 1000);
</script>
</body>
</html>`;

        popup.document.open();
        popup.document.write(html);
        popup.document.close();
    }
}

export default new TvSyncService();