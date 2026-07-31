/* =========================================================
   ALL TOOLS — app.js
   SPA ringan, hash-routing, tanpa dependency framework.
   Catatan: state (favorit/riwayat) disimpan in-memory pada
   preview ini. Saat di-deploy sebagai website sungguhan,
   ganti STORE di bawah dengan localStorage agar persisten
   antar sesi (lihat komentar pada fungsi persist()).
   ========================================================= */
(function(){
"use strict";

/* ---------------- Data: daftar tool ---------------- */
const TOOLS = [
  {id:'tiktok',    cat:'Downloader', name:'TikTok Downloader',    icon:'🎵', route:'downloader/tiktok'},
  {id:'instagram', cat:'Downloader', name:'Instagram Downloader', icon:'📷', route:'downloader/instagram'},
  {id:'youtube',   cat:'Downloader', name:'YouTube Downloader',   icon:'▶️', route:'downloader/youtube'},
  {id:'qr-generate', cat:'QR Code',  name:'QR Code Generator',    icon:'▦', route:'qr-generate'},
  {id:'qr-scan',     cat:'QR Code',  name:'QR Code Scanner',      icon:'⌕', route:'qr-scan'},
  {id:'device-info', cat:'Perangkat',name:'Device Information',   icon:'📱', route:'device-info'},
  {id:'text-tools',  cat:'Teks',     name:'Text Tools',           icon:'✎', route:'text-tools'},
  {id:'password',    cat:'Keamanan', name:'Password Generator',   icon:'🔑', route:'password'},
  {id:'color',       cat:'Desain',   name:'Color Tools',          icon:'🎨', route:'color'},
  {id:'unit-converter', cat:'Konversi', name:'Unit Converter',    icon:'⇄', route:'unit-converter'},
  {id:'calculator',  cat:'Matematika', name:'Calculator',         icon:'＋', route:'calculator'},
  {id:'stopwatch', cat:'Utilities', name:'Stopwatch',        icon:'⏱', route:'utilities/stopwatch'},
  {id:'timer',     cat:'Utilities', name:'Countdown Timer',  icon:'⏲', route:'utilities/timer'},
  {id:'clock',     cat:'Utilities', name:'Digital Clock',    icon:'🕐', route:'utilities/clock'},
  {id:'random',    cat:'Utilities', name:'Random Number',    icon:'🔢', route:'utilities/random'},
  {id:'coin',      cat:'Utilities', name:'Coin Flip',        icon:'🪙', route:'utilities/coin'},
  {id:'dice',      cat:'Utilities', name:'Dice Roller',      icon:'🎲', route:'utilities/dice'},
  {id:'about',     cat:'Info',      name:'About',            icon:'ℹ️', route:'about'},
];
const CATEGORIES = ['Semua','Downloader','QR Code','Perangkat','Teks','Keamanan','Desain','Konversi','Matematika','Utilities'];

/* ---------------- In-memory store ---------------- */
const STORE = { favorites: new Set(), recent: [], theme: 'light' };
function persist(){ /* preview: in-memory only — see file header note */ }
function toggleFavorite(id){
  if(STORE.favorites.has(id)) STORE.favorites.delete(id); else STORE.favorites.add(id);
  persist();
}
function pushRecent(id){
  STORE.recent = [id, ...STORE.recent.filter(x=>x!==id)].slice(0,8);
  persist();
}

/* ---------------- Toast ---------------- */
function toast(msg){
  const c = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(()=>el.remove(), 2800);
}

/* ---------------- Ripple effect (event delegation) ---------------- */
document.addEventListener('pointerdown', function(e){
  const target = e.target.closest('.btn, .tool-card, .icon-btn, .category-pill, .calc-key, .dl-tab, .chip-toggle, .sidebar-link, .bottom-link');
  if(!target) return;
  const rect = target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.4;
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
  ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
  const prevPos = getComputedStyle(target).position;
  if(prevPos === 'static') target.style.position = 'relative';
  target.style.overflow = target.style.overflow || 'hidden';
  target.appendChild(ripple);
  setTimeout(()=>ripple.remove(), 600);
});

/* ---------------- Theme ---------------- */
function applyTheme(t){
  STORE.theme = t;
  document.documentElement.setAttribute('data-theme', t);
  document.getElementById('themeIconSun').style.display = t === 'light' ? '' : 'none';
  document.getElementById('themeIconMoon').style.display = t === 'dark' ? '' : 'none';
  persist();
}
document.getElementById('themeToggle').addEventListener('click', ()=>{
  applyTheme(STORE.theme === 'light' ? 'dark' : 'light');
});
// Hormati preferensi sistem di kunjungan pertama
if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
  applyTheme('dark');
}

/* ---------------- Online / offline badge ---------------- */
window.addEventListener('offline', ()=> toast('Koneksi terputus — beberapa fitur mungkin terbatas'));
window.addEventListener('online', ()=> toast('Kembali online'));

/* ---------------- Sidebar & Bottom nav rendering ---------------- */
const NAV_ITEMS = [
  {route:'home', name:'Home', icon:'⌂'},
  {route:'downloader', name:'Downloader', icon:'⬇'},
  {route:'qr-generate', name:'QR Generator', icon:'▦'},
  {route:'qr-scan', name:'QR Scanner', icon:'⌕'},
  {route:'device-info', name:'Device Info', icon:'📱'},
  {route:'text-tools', name:'Text Tools', icon:'✎'},
  {route:'password', name:'Password', icon:'🔑'},
  {route:'color', name:'Color Tools', icon:'🎨'},
  {route:'unit-converter', name:'Unit Converter', icon:'⇄'},
  {route:'calculator', name:'Calculator', icon:'＋'},
  {route:'utilities', name:'Utilities', icon:'⏱'},
  {route:'about', name:'About', icon:'ℹ'},
];
const BOTTOM_ITEMS = [
  {route:'home', name:'Home', icon:'⌂'},
  {route:'downloader', name:'Unduh', icon:'⬇'},
  {route:'qr-generate', name:'QR', icon:'▦'},
  {route:'calculator', name:'Hitung', icon:'＋'},
  {route:'about', name:'Info', icon:'ℹ'},
];
function renderSidebar(activeRoute){
  const nav = document.getElementById('sidebarNav');
  nav.innerHTML = NAV_ITEMS.map(it => `
    <button class="sidebar-link ${activeRoute===it.route?'active':''}" data-goto="${it.route}">
      <span class="ic">${it.icon}</span><span>${it.name}</span>
    </button>`).join('');
}
function renderBottomNav(activeRoute){
  const nav = document.getElementById('bottomNav');
  nav.innerHTML = BOTTOM_ITEMS.map(it => `
    <button class="bottom-link ${activeRoute===it.route?'active':''}" data-goto="${it.route}">
      <span style="font-size:17px">${it.icon}</span><span>${it.name}</span>
    </button>`).join('');
}
document.addEventListener('click', function(e){
  const btn = e.target.closest('[data-goto]');
  if(btn){ location.hash = '#/' + btn.dataset.goto; }
});
document.getElementById('sidebarToggle').addEventListener('click', ()=>{
  document.body.classList.toggle('sidebar-collapsed');
});
document.querySelector('.brand').addEventListener('click', ()=> location.hash = '#/home');

/* ---------------- Tool card builder ---------------- */
function toolCard(tool){
  const tpl = document.getElementById('tpl-tool-card').content.cloneNode(true);
  const card = tpl.querySelector('.tool-card');
  card.querySelector('.tool-card-icon').textContent = tool.icon;
  card.querySelector('.tool-card-name').textContent = tool.name;
  const fav = card.querySelector('.tool-card-fav');
  const isFav = STORE.favorites.has(tool.id);
  fav.textContent = isFav ? '★' : '☆';
  fav.classList.toggle('active', isFav);
  fav.addEventListener('click', (e)=>{
    e.stopPropagation();
    toggleFavorite(tool.id);
    fav.textContent = STORE.favorites.has(tool.id) ? '★' : '☆';
    fav.classList.toggle('active', STORE.favorites.has(tool.id));
    toast(STORE.favorites.has(tool.id) ? `${tool.name} ditambahkan ke favorit` : `${tool.name} dihapus dari favorit`);
  });
  card.addEventListener('click', ()=>{ location.hash = '#/' + tool.route; });
  return card;
}
function toolGrid(tools){
  const wrap = document.createElement('div');
  wrap.className = 'grid';
  if(tools.length === 0){
    wrap.outerHTML = `<div class="empty-state"><div class="em-icon">🔍</div><p>Tidak ada tool yang cocok.</p></div>`;
    return wrap;
  }
  tools.forEach(t => wrap.appendChild(toolCard(t)));
  return wrap;
}
function findTool(id){ return TOOLS.find(t=>t.id===id); }

/* ---------------- Search ---------------- */
function doSearch(query){
  const q = query.trim().toLowerCase();
  if(!q) return TOOLS;
  return TOOLS.filter(t => t.name.toLowerCase().includes(q) || t.cat.toLowerCase().includes(q));
}

/* ---------------- Page header helper ---------------- */
function pageHeader(title, desc, backRoute){
  const back = backRoute!==false ? `<button class="back-btn" data-goto="${backRoute||'home'}" aria-label="Kembali">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>` : '';
  return `<div class="page-header">${back}<div><h1>${title}</h1>${desc?`<p>${desc}</p>`:''}</div></div>`;
}

/* ---------------- HOME ---------------- */
const GHOST_WORDS = ['QR Code…','Downloader TikTok…','Password acak…','Konversi satuan…','Kalkulator…','Info perangkat…'];
let ghostIdx = 0, ghostTimer = null;

function renderHome(){
  const el = document.createElement('div');
  el.className = 'page';
  el.innerHTML = `
    <section class="hero">
      <h1>Semua Tool, Satu Tempat</h1>
      <p class="tagline">Downloader, QR Code, konverter, kalkulator, dan utilitas harian — cepat, ringan, tanpa ribet.</p>
      <div class="hero-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <input id="heroSearchInput" type="text" autocomplete="off">
        <span class="ghost" id="ghostText"></span>
      </div>
      <div class="hero-stats">
        <div class="hero-stat"><b>${TOOLS.length}</b><span>Total Tools</span></div>
        <div class="hero-stat"><b id="statFav">${STORE.favorites.size}</b><span>Favorit</span></div>
        <div class="hero-stat"><b id="statRecent">${STORE.recent.length}</b><span>Baru Digunakan</span></div>
        <div class="hero-stat"><b>${CATEGORIES.length-1}</b><span>Kategori</span></div>
      </div>
    </section>

    <div class="category-scroll" id="categoryScroll"></div>

    <div id="recentSection" style="display:${STORE.recent.length? '':'none'}">
      <div class="section-head"><h2>Terakhir Digunakan</h2></div>
      <div id="recentGrid"></div>
    </div>

    <div id="favSection" style="display:${STORE.favorites.size? '':'none'}">
      <div class="section-head"><h2>Tool Favorit</h2></div>
      <div id="favGrid"></div>
    </div>

    <div class="section-head"><h2 id="gridTitle">Semua Tools</h2></div>
    <div id="mainGrid"></div>
  `;

  // Category pills
  const catScroll = el.querySelector('#categoryScroll');
  let activeCat = 'Semua';
  function drawCats(){
    catScroll.innerHTML = CATEGORIES.map(c=>`<button class="category-pill ${c===activeCat?'active':''}" data-cat="${c}">${c}</button>`).join('');
  }
  drawCats();
  const mainGrid = el.querySelector('#mainGrid');
  function drawMain(list){
    mainGrid.innerHTML = '';
    mainGrid.appendChild(toolGrid(list));
  }
  drawMain(TOOLS);
  catScroll.addEventListener('click', (e)=>{
    const b = e.target.closest('[data-cat]'); if(!b) return;
    activeCat = b.dataset.cat;
    drawCats();
    drawMain(activeCat==='Semua' ? TOOLS : TOOLS.filter(t=>t.cat===activeCat));
    el.querySelector('#gridTitle').textContent = activeCat==='Semua' ? 'Semua Tools' : activeCat;
  });

  // Recent / favorites
  if(STORE.recent.length){
    const grid = el.querySelector('#recentGrid');
    grid.appendChild(toolGrid(STORE.recent.map(findTool).filter(Boolean)));
  }
  if(STORE.favorites.size){
    const grid = el.querySelector('#favGrid');
    grid.appendChild(toolGrid([...STORE.favorites].map(findTool).filter(Boolean)));
  }

  // Search behavior (hero + navbar share logic)
  function bindSearch(input){
    input.addEventListener('input', ()=>{
      const results = doSearch(input.value);
      el.querySelector('#gridTitle').textContent = input.value.trim() ? `Hasil pencarian "${input.value.trim()}"` : (activeCat==='Semua'?'Semua Tools':activeCat);
      drawMain(input.value.trim() ? results : (activeCat==='Semua' ? TOOLS : TOOLS.filter(t=>t.cat===activeCat)));
    });
  }
  const heroInput = el.querySelector('#heroSearchInput');
  bindSearch(heroInput);
  const ghostEl = el.querySelector('#ghostText');
  function tickGhost(){
    ghostEl.style.display = heroInput.value ? 'none' : '';
    ghostEl.textContent = GHOST_WORDS[ghostIdx % GHOST_WORDS.length];
    ghostIdx++;
  }
  tickGhost();
  clearInterval(ghostTimer);
  ghostTimer = setInterval(tickGhost, 2200);
  heroInput.addEventListener('focus', ()=> ghostEl.style.display='none');
  heroInput.addEventListener('blur', ()=>{ if(!heroInput.value) ghostEl.style.display=''; });

  return el;
}

/* ---------------- DOWNLOADER CENTER ---------------- */
const DL_PLATFORMS = {
  tiktok:    {name:'TikTok Downloader', icon:'🎵', opts:['Video','Audio','Tanpa Watermark','Cover']},
  instagram: {name:'Instagram Downloader', icon:'📷', opts:['Post','Reel','Story','Foto']},
  youtube:   {name:'YouTube Downloader', icon:'▶️', opts:['Video','Audio']},
};
function renderDownloader(sub){
  const platform = sub && DL_PLATFORMS[sub] ? sub : 'tiktok';
  const el = document.createElement('div');
  el.className = 'page';
  el.innerHTML = pageHeader('Downloader Center', 'Tempel tautan, pilih format, lalu unduh.') + `
    <div class="dl-tabs">
      ${Object.keys(DL_PLATFORMS).map(k=>`<button class="dl-tab ${k===platform?'active':''}" data-dl="${k}">${DL_PLATFORMS[k].icon} ${DL_PLATFORMS[k].name.replace(' Downloader','')}</button>`).join('')}
    </div>
    <div class="dl-notice">
      <span>⚠️</span>
      <span>Mengunduh konten dari platform pihak ketiga memerlukan layanan backend/API resmi karena pembatasan CORS &amp; kebijakan platform, dan tidak dapat dijalankan sepenuhnya di browser. Antarmuka di bawah sudah siap pakai — hubungkan ke endpoint backend Anda sendiri di <code>js/app.js</code> (fungsi <code>simulateDownload</code>) untuk mengaktifkan proses unduh sungguhan. Selalu hormati Ketentuan Layanan tiap platform dan hak cipta pembuat konten.</span>
    </div>
    <div class="panel">
      <div class="field">
        <label>Tempel URL ${DL_PLATFORMS[platform].name}</label>
        <div class="input-row">
          <input class="input" id="dlUrl" type="text" placeholder="https://...">
          <button class="btn btn-secondary btn-icon" id="dlPaste" title="Tempel dari clipboard">📋</button>
        </div>
      </div>
      <div class="field">
        <label>Pilih format</label>
        <div class="btn-row" id="dlOpts">
          ${DL_PLATFORMS[platform].opts.map((o,i)=>`<span class="chip-toggle ${i===0?'on':''}" data-opt="${o}"><input type="radio" name="dlopt" ${i===0?'checked':''}>${o}</span>`).join('')}
        </div>
      </div>
      <button class="btn btn-primary btn-block" id="dlGo">Download</button>
      <div class="progress-bar" id="dlProgressWrap" style="display:none"><div class="progress-fill" id="dlProgress"></div></div>
      <p class="muted" id="dlStatus" style="margin-top:10px"></p>
    </div>
    <div class="panel">
      <div class="section-head" style="margin:0 0 8px"><h2 style="font-size:15px">Riwayat Download</h2>
        <button class="see-all" id="dlClearHistory">Hapus</button>
      </div>
      <div id="dlHistory"><p class="muted">Belum ada riwayat pada sesi ini.</p></div>
    </div>
  `;

  const history = [];
  function drawHistory(){
    const box = el.querySelector('#dlHistory');
    if(!history.length){ box.innerHTML = '<p class="muted">Belum ada riwayat pada sesi ini.</p>'; return; }
    box.innerHTML = history.map(h=>`<div class="dl-history-item"><span>${h.icon} ${h.label}</span><span class="muted">${h.time}</span></div>`).join('');
  }

  el.querySelectorAll('[data-dl]').forEach(tab=>{
    tab.addEventListener('click', ()=>{ location.hash = '#/downloader/' + tab.dataset.dl; });
  });
  el.querySelectorAll('[data-opt]').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      el.querySelectorAll('[data-opt]').forEach(c=>{ c.classList.remove('on'); c.querySelector('input').checked=false; });
      chip.classList.add('on'); chip.querySelector('input').checked = true;
    });
  });
  el.querySelector('#dlPaste').addEventListener('click', async ()=>{
    try{
      const text = await navigator.clipboard.readText();
      el.querySelector('#dlUrl').value = text;
      toast('Tautan ditempel');
    }catch(err){ toast('Tidak bisa mengakses clipboard di browser ini'); }
  });

  function isValidUrl(str){ try{ new URL(str); return true; }catch(e){ return false; } }

  el.querySelector('#dlGo').addEventListener('click', ()=>{
    const url = el.querySelector('#dlUrl').value.trim();
    const status = el.querySelector('#dlStatus');
    if(!url || !isValidUrl(url)){ toast('Masukkan URL yang valid'); return; }
    const chosen = el.querySelector('[data-opt].on')?.dataset.opt || DL_PLATFORMS[platform].opts[0];
    simulateDownload(el, chosen, ()=>{
      history.unshift({icon:DL_PLATFORMS[platform].icon, label:`${DL_PLATFORMS[platform].name} — ${chosen}`, time:'baru saja'});
      drawHistory();
      pushRecent(platform);
      status.textContent = 'Selesai diproses (mode demo — hubungkan backend untuk hasil nyata).';
      toast('Proses selesai');
    });
  });
  el.querySelector('#dlClearHistory').addEventListener('click', ()=>{ history.length=0; drawHistory(); });

  return el;
}
// Placeholder proses unduh — ganti dengan pemanggilan API backend sungguhan.
function simulateDownload(el, label, done){
  const wrap = el.querySelector('#dlProgressWrap');
  const fill = el.querySelector('#dlProgress');
  const status = el.querySelector('#dlStatus');
  wrap.style.display = '';
  fill.style.width = '0%';
  status.textContent = `Memvalidasi tautan untuk ${label}…`;
  let p = 0;
  const t = setInterval(()=>{
    p += Math.random()*22;
    if(p >= 100){ p = 100; clearInterval(t); done(); }
    fill.style.width = p + '%';
  }, 220);
}

/* ---------------- QR CODE GENERATOR ---------------- */
const QR_TYPES = {
  text:  {label:'Teks', build:(v)=>v.text||''},
  url:   {label:'URL', build:(v)=>v.url||''},
  phone: {label:'Telepon', build:(v)=>`tel:${v.phone||''}`},
  email: {label:'Email', build:(v)=>`mailto:${v.email||''}${v.subject?`?subject=${encodeURIComponent(v.subject)}`:''}`},
  wifi:  {label:'WiFi', build:(v)=>`WIFI:T:${v.enc||'WPA'};S:${v.ssid||''};P:${v.pass||''};;`},
  geo:   {label:'Lokasi', build:(v)=>`geo:${v.lat||'0'},${v.lng||'0'}`},
  whatsapp: {label:'WhatsApp', build:(v)=>`https://wa.me/${(v.wa||'').replace(/\D/g,'')}${v.msg?`?text=${encodeURIComponent(v.msg)}`:''}`},
  contact: {label:'Kontak', build:(v)=>`BEGIN:VCARD\nVERSION:3.0\nN:${v.cname||''}\nTEL:${v.ctel||''}\nEMAIL:${v.cemail||''}\nEND:VCARD`},
};
function qrFieldsFor(type){
  const f = {
    text:  `<div class="field"><label>Teks</label><textarea class="input" id="qf_text" placeholder="Tulis teks bebas…"></textarea></div>`,
    url:   `<div class="field"><label>URL</label><input class="input" id="qf_url" placeholder="https://contoh.com"></div>`,
    phone: `<div class="field"><label>Nomor Telepon</label><input class="input" id="qf_phone" placeholder="+62…"></div>`,
    email: `<div class="field"><label>Email</label><input class="input" id="qf_email" placeholder="nama@email.com"></div>
            <div class="field"><label>Subjek (opsional)</label><input class="input" id="qf_subject"></div>`,
    wifi:  `<div class="field"><label>Nama WiFi (SSID)</label><input class="input" id="qf_ssid"></div>
            <div class="field"><label>Password</label><input class="input" id="qf_pass"></div>
            <div class="field"><label>Enkripsi</label><select class="input" id="qf_enc"><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">Tanpa Password</option></select></div>`,
    geo:   `<div class="field"><label>Latitude</label><input class="input" id="qf_lat" placeholder="-6.200000"></div>
            <div class="field"><label>Longitude</label><input class="input" id="qf_lng" placeholder="106.816666"></div>`,
    whatsapp: `<div class="field"><label>Nomor WhatsApp</label><input class="input" id="qf_wa" placeholder="628123456789"></div>
               <div class="field"><label>Pesan (opsional)</label><input class="input" id="qf_msg"></div>`,
    contact: `<div class="field"><label>Nama</label><input class="input" id="qf_cname"></div>
              <div class="field"><label>Telepon</label><input class="input" id="qf_ctel"></div>
              <div class="field"><label>Email</label><input class="input" id="qf_cemail"></div>`,
  };
  return f[type] || f.text;
}
function readQrFields(type){
  const v = (id)=> document.getElementById(id)?.value || '';
  switch(type){
    case 'text': return {text:v('qf_text')};
    case 'url': return {url:v('qf_url')};
    case 'phone': return {phone:v('qf_phone')};
    case 'email': return {email:v('qf_email'), subject:v('qf_subject')};
    case 'wifi': return {ssid:v('qf_ssid'), pass:v('qf_pass'), enc:v('qf_enc')};
    case 'geo': return {lat:v('qf_lat'), lng:v('qf_lng')};
    case 'whatsapp': return {wa:v('qf_wa'), msg:v('qf_msg')};
    case 'contact': return {cname:v('qf_cname'), ctel:v('qf_ctel'), cemail:v('qf_cemail')};
  }
}

function renderQrGenerate(){
  pushRecent('qr-generate');
  const el = document.createElement('div');
  el.className = 'page';
  el.innerHTML = pageHeader('QR Code Generator', 'Buat kode QR dari berbagai jenis data.') + `
    <div class="panel">
      <div class="field">
        <label>Jenis Data</label>
        <select class="input" id="qrType">
          ${Object.entries(QR_TYPES).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('')}
        </select>
      </div>
      <div id="qrFields">${qrFieldsFor('text')}</div>
      <hr class="sep">
      <div class="grid" style="grid-template-columns:1fr 1fr">
        <div class="field"><label>Warna QR</label><input class="input" type="color" id="qrColor" value="#14161C" style="height:42px; padding:4px"></div>
        <div class="field"><label>Warna Background</label><input class="input" type="color" id="qrBg" value="#ffffff" style="height:42px; padding:4px"></div>
      </div>
      <div class="grid" style="grid-template-columns:1fr 1fr">
        <div class="field"><label>Ukuran (px)</label><input class="input" type="number" id="qrSize" value="240" min="120" max="600" step="20"></div>
        <div class="field"><label>Margin</label><input class="input" type="number" id="qrMargin" value="4" min="0" max="20"></div>
      </div>
      <button class="btn btn-primary btn-block" id="qrGoBtn">Generate QR</button>
    </div>
    <div class="panel" id="qrResultPanel" style="display:none">
      <div style="display:flex; justify-content:center; margin-bottom:14px"><div id="qrCanvasWrap"></div></div>
      <div class="btn-row" style="justify-content:center">
        <button class="btn btn-secondary" id="qrDownloadPng">Download PNG</button>
        <button class="btn btn-secondary" id="qrDownloadSvg">Download SVG</button>
      </div>
    </div>
  `;
  const typeSel = el.querySelector('#qrType');
  typeSel.addEventListener('change', ()=>{ el.querySelector('#qrFields').innerHTML = qrFieldsFor(typeSel.value); });

  let currentQR = null;
  el.querySelector('#qrGoBtn').addEventListener('click', ()=>{
    const type = typeSel.value;
    const data = QR_TYPES[type].build(readQrFields(type));
    if(!data || !data.trim()){ toast('Isi data terlebih dahulu'); return; }
    const wrap = el.querySelector('#qrCanvasWrap');
    wrap.innerHTML = '';
    const size = parseInt(el.querySelector('#qrSize').value)||240;
    if(typeof QRCode === 'undefined'){
      wrap.innerHTML = `<p class="muted">Library QR belum termuat (perlu koneksi internet untuk CDN). Coba lagi saat online.</p>`;
      return;
    }
    currentQR = new QRCode(wrap, {
      text: data, width: size, height: size,
      colorDark: el.querySelector('#qrColor').value,
      colorLight: el.querySelector('#qrBg').value,
      correctLevel: QRCode.CorrectLevel.M,
    });
    el.querySelector('#qrResultPanel').style.display = '';
    toast('QR berhasil dibuat');
  });
  el.querySelector('#qrDownloadPng').addEventListener('click', ()=>{
    const canvas = el.querySelector('#qrCanvasWrap canvas');
    if(!canvas){ toast('Generate QR dulu'); return; }
    const a = document.createElement('a');
    a.download = 'qrcode.png'; a.href = canvas.toDataURL('image/png'); a.click();
  });
  el.querySelector('#qrDownloadSvg').addEventListener('click', ()=>{
    const canvas = el.querySelector('#qrCanvasWrap canvas');
    if(!canvas){ toast('Generate QR dulu'); return; }
    const size = canvas.width;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><image width="${size}" height="${size}" href="${canvas.toDataURL('image/png')}"/></svg>`;
    const blob = new Blob([svg], {type:'image/svg+xml'});
    const a = document.createElement('a');
    a.download = 'qrcode.svg'; a.href = URL.createObjectURL(blob); a.click();
  });
  return el;
}

/* ---------------- QR CODE SCANNER ---------------- */
function renderQrScan(){
  pushRecent('qr-scan');
  const el = document.createElement('div');
  el.className = 'page';
  el.innerHTML = pageHeader('QR Code Scanner', 'Pindai lewat kamera atau unggah gambar.') + `
    <div class="panel">
      <div class="btn-row" style="margin-bottom:14px">
        <button class="btn btn-primary" id="qrCamStart">Mulai Kamera</button>
        <button class="btn btn-secondary" id="qrCamStop" disabled>Hentikan</button>
        <label class="btn btn-secondary" style="cursor:pointer">Upload Gambar<input type="file" accept="image/*" id="qrFileInput" style="display:none"></label>
      </div>
      <video id="qrVideo" style="width:100%; border-radius:14px; display:none; background:#000" playsinline muted></video>
      <canvas id="qrCanvasHidden" style="display:none"></canvas>
      <div id="qrScanResultWrap" style="display:none">
        <hr class="sep">
        <div class="copy-row">
          <div class="result-box" id="qrScanResult" style="flex:1"></div>
        </div>
        <div class="btn-row" style="margin-top:12px">
          <button class="btn btn-secondary" id="qrCopyResult">Copy Hasil</button>
          <button class="btn btn-primary" id="qrOpenResult">Buka Sebagai URL</button>
        </div>
      </div>
    </div>
  `;
  const video = el.querySelector('#qrVideo');
  const canvas = el.querySelector('#qrCanvasHidden');
  const ctx = canvas.getContext('2d', {willReadFrequently:true});
  let stream = null, rafId = null;

  function showResult(text){
    el.querySelector('#qrScanResultWrap').style.display = '';
    el.querySelector('#qrScanResult').textContent = text;
    toast('QR berhasil dibaca');
  }
  function tick(){
    if(video.readyState === video.HAVE_ENOUGH_DATA && typeof jsQR !== 'undefined'){
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const img = ctx.getImageData(0,0,canvas.width,canvas.height);
      const code = jsQR(img.data, img.width, img.height);
      if(code && code.data){ showResult(code.data); stopCam(); return; }
    }
    rafId = requestAnimationFrame(tick);
  }
  async function startCam(){
    try{
      stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
      video.srcObject = stream; video.style.display=''; await video.play();
      el.querySelector('#qrCamStart').disabled = true;
      el.querySelector('#qrCamStop').disabled = false;
      tick();
    }catch(err){ toast('Tidak bisa mengakses kamera: izin ditolak atau tidak tersedia'); }
  }
  function stopCam(){
    if(rafId) cancelAnimationFrame(rafId);
    if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; }
    video.style.display = 'none';
    el.querySelector('#qrCamStart').disabled = false;
    el.querySelector('#qrCamStop').disabled = true;
  }
  el.querySelector('#qrCamStart').addEventListener('click', startCam);
  el.querySelector('#qrCamStop').addEventListener('click', stopCam);
  el.querySelector('#qrFileInput').addEventListener('change', (e)=>{
    const file = e.target.files[0]; if(!file) return;
    const img = new Image();
    img.onload = ()=>{
      canvas.width = img.width; canvas.height = img.height;
      ctx.drawImage(img,0,0);
      const data = ctx.getImageData(0,0,canvas.width,canvas.height);
      const code = typeof jsQR !== 'undefined' ? jsQR(data.data, data.width, data.height) : null;
      if(code && code.data) showResult(code.data); else toast('QR tidak terdeteksi pada gambar');
    };
    img.src = URL.createObjectURL(file);
  });
  el.querySelector('#qrCopyResult').addEventListener('click', ()=>{
    navigator.clipboard.writeText(el.querySelector('#qrScanResult').textContent).then(()=>toast('Disalin ke clipboard'));
  });
  el.querySelector('#qrOpenResult').addEventListener('click', ()=>{
    const text = el.querySelector('#qrScanResult').textContent;
    if(/^https?:\/\//i.test(text)) window.open(text, '_blank'); else toast('Isi bukan URL yang valid');
  });
  el._cleanup = stopCam;
  return el;
}

/* ---------------- DEVICE INFORMATION ---------------- */
function na(v){ return (v===undefined||v===null||v==='') ? 'Tidak tersedia' : v; }
function detectBrowser(){
  const ua = navigator.userAgent;
  let name='Tidak diketahui', ver='';
  const checks = [
    [/Edg\/([\d.]+)/,'Microsoft Edge'], [/OPR\/([\d.]+)/,'Opera'],
    [/Chrome\/([\d.]+)/,'Chrome'], [/CriOS\/([\d.]+)/,'Chrome (iOS)'],
    [/Firefox\/([\d.]+)/,'Firefox'], [/Version\/([\d.]+).*Safari/,'Safari'],
  ];
  for(const [re,label] of checks){ const m = ua.match(re); if(m){ name = label; ver = m[1]; break; } }
  return {name, ver};
}
function detectOS(){
  const ua = navigator.userAgent;
  if(/Windows NT/.test(ua)) return 'Windows';
  if(/Mac OS X/.test(ua) && !/iPhone|iPad/.test(ua)) return 'macOS';
  if(/Android/.test(ua)) return 'Android';
  if(/iPhone|iPad|iPod/.test(ua)) return 'iOS';
  if(/Linux/.test(ua)) return 'Linux';
  return 'Tidak diketahui';
}
function infoItem(k,v){ return `<div class="info-item"><div class="k">${k}</div><div class="v">${v}</div></div>`; }

async function renderDeviceInfo(){
  pushRecent('device-info');
  const el = document.createElement('div');
  el.className = 'page';
  const browser = detectBrowser();
  const os = detectOS();
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  el.innerHTML = pageHeader('Device Information', 'Informasi perangkat &amp; browser Anda saat ini.') + `
    <div class="panel"><h3 style="font-size:14px; margin-bottom:12px">Perangkat &amp; Browser</h3>
      <div class="info-grid">
        ${infoItem('Browser', na(browser.name))}
        ${infoItem('Versi Browser', na(browser.ver))}
        ${infoItem('Sistem Operasi', na(os))}
        ${infoItem('Jenis Perangkat', isTouch ? 'Mobile / Tablet' : 'Desktop')}
        ${infoItem('Bahasa', na(navigator.language))}
        ${infoItem('Resolusi Layar', `${screen.width} × ${screen.height}`)}
        ${infoItem('Viewport', `${window.innerWidth} × ${window.innerHeight}`)}
        ${infoItem('Device Pixel Ratio', na(window.devicePixelRatio))}
        ${infoItem('Touch Support', isTouch ? 'Ya' : 'Tidak')}
        ${infoItem('Status Jaringan', navigator.onLine ? 'Online' : 'Offline')}
        ${infoItem('Cookies Enabled', navigator.cookieEnabled ? 'Ya' : 'Tidak')}
        ${infoItem('Timezone', na(Intl.DateTimeFormat().resolvedOptions().timeZone))}
        ${infoItem('Waktu Lokal', new Date().toLocaleString('id-ID'))}
        ${infoItem('CPU Threads', na(navigator.hardwareConcurrency))}
        ${infoItem('RAM Perkiraan', navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'Tidak didukung browser ini')}
      </div>
    </div>
    <div class="panel"><h3 style="font-size:14px; margin-bottom:12px">Baterai</h3>
      <div class="info-grid" id="batteryGrid">${infoItem('Status', 'Memeriksa…')}</div>
    </div>
    <div class="panel"><h3 style="font-size:14px; margin-bottom:12px">Jaringan</h3>
      <div class="info-grid">
        ${infoItem('Jenis Jaringan', conn ? na(conn.effectiveType) : 'Tidak didukung browser ini')}
        ${infoItem('Downlink', conn ? na(conn.downlink) + ' Mbps' : 'Tidak didukung browser ini')}
        ${infoItem('RTT', conn ? na(conn.rtt) + ' ms' : 'Tidak didukung browser ini')}
        ${infoItem('Save Data Mode', conn ? (conn.saveData ? 'Aktif' : 'Nonaktif') : 'Tidak didukung browser ini')}
      </div>
    </div>
    <div class="panel"><h3 style="font-size:14px; margin-bottom:12px">User Agent</h3>
      <div class="result-box">${navigator.userAgent}</div>
    </div>
  `;
  if(navigator.getBattery){
    navigator.getBattery().then(b=>{
      const grid = el.querySelector('#batteryGrid');
      const draw = ()=>{
        grid.innerHTML = infoItem('Persentase', Math.round(b.level*100)+'%')
          + infoItem('Status Charging', b.charging ? 'Mengisi Daya' : 'Tidak Mengisi Daya')
          + infoItem('Charging Time', b.chargingTime===Infinity ? '—' : b.chargingTime+' detik')
          + infoItem('Discharging Time', b.dischargingTime===Infinity ? '—' : b.dischargingTime+' detik');
      };
      draw();
      b.addEventListener('levelchange', draw); b.addEventListener('chargingchange', draw);
    }).catch(()=>{ el.querySelector('#batteryGrid').innerHTML = infoItem('Status','Tidak dapat diakses'); });
  } else {
    el.querySelector('#batteryGrid').innerHTML = infoItem('Status','Tidak didukung browser ini');
  }
  return el;
}

/* ---------------- TEXT TOOLS ---------------- */
function renderTextTools(){
  pushRecent('text-tools');
  const el = document.createElement('div');
  el.className = 'page';
  el.innerHTML = pageHeader('Text Tools', 'Olah teks dengan cepat.') + `
    <div class="panel">
      <div class="field"><label>Teks</label><textarea class="input" id="ttInput" rows="6" placeholder="Tulis atau tempel teks di sini…"></textarea></div>
      <div class="btn-row">
        <button class="btn btn-secondary" data-tt="upper">UPPERCASE</button>
        <button class="btn btn-secondary" data-tt="lower">lowercase</button>
        <button class="btn btn-secondary" data-tt="capitalize">Capitalize</button>
        <button class="btn btn-secondary" data-tt="reverse">Reverse</button>
        <button class="btn btn-secondary" data-tt="trim">Remove Extra Spaces</button>
      </div>
      <hr class="sep">
      <div class="info-grid">
        <div class="info-item"><div class="k">Words</div><div class="v" id="ttWords">0</div></div>
        <div class="info-item"><div class="k">Characters</div><div class="v" id="ttChars">0</div></div>
        <div class="info-item"><div class="k">Lines</div><div class="v" id="ttLines">0</div></div>
      </div>
      <button class="btn btn-primary btn-block" id="ttCopy" style="margin-top:14px">Copy Text</button>
    </div>
  `;
  const ta = el.querySelector('#ttInput');
  function updateCounts(){
    const v = ta.value;
    el.querySelector('#ttWords').textContent = (v.trim().match(/\S+/g)||[]).length;
    el.querySelector('#ttChars').textContent = v.length;
    el.querySelector('#ttLines').textContent = v ? v.split(/\n/).length : 0;
  }
  ta.addEventListener('input', updateCounts); updateCounts();
  el.querySelectorAll('[data-tt]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      let v = ta.value;
      switch(btn.dataset.tt){
        case 'upper': v = v.toUpperCase(); break;
        case 'lower': v = v.toLowerCase(); break;
        case 'capitalize': v = v.replace(/\w\S*/g, t=>t[0].toUpperCase()+t.slice(1).toLowerCase()); break;
        case 'reverse': v = v.split('').reverse().join(''); break;
        case 'trim': v = v.replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim(); break;
      }
      ta.value = v; updateCounts();
    });
  });
  el.querySelector('#ttCopy').addEventListener('click', ()=>{
    navigator.clipboard.writeText(ta.value).then(()=>toast('Teks disalin'));
  });
  return el;
}

/* ---------------- PASSWORD GENERATOR ---------------- */
function renderPassword(){
  pushRecent('password');
  const el = document.createElement('div');
  el.className = 'page';
  el.innerHTML = pageHeader('Password Generator', 'Buat password acak yang kuat.') + `
    <div class="panel">
      <div class="result-box copy-row" style="font-size:18px; font-weight:700; margin-bottom:16px">
        <span id="pwOutput">—</span>
        <button class="btn btn-secondary btn-icon" id="pwCopy">📋</button>
      </div>
      <div class="strength-meter"><div class="strength-fill" id="pwStrength"></div></div>
      <p class="muted" id="pwStrengthLabel" style="margin-top:6px"></p>
      <hr class="sep">
      <div class="field">
        <label>Panjang Password: <b id="pwLenLabel">16</b></label>
        <input type="range" id="pwLen" min="4" max="64" value="16" style="width:100%; accent-color:var(--accent)">
      </div>
      <div class="btn-row">
        <label class="chip-toggle on"><input type="checkbox" id="pwUpper" checked>Huruf Besar</label>
        <label class="chip-toggle on"><input type="checkbox" id="pwLower" checked>Huruf Kecil</label>
        <label class="chip-toggle on"><input type="checkbox" id="pwNumber" checked>Angka</label>
        <label class="chip-toggle"><input type="checkbox" id="pwSymbol">Simbol</label>
      </div>
      <button class="btn btn-primary btn-block" id="pwGenBtn" style="margin-top:16px">Generate Password</button>
    </div>
  `;
  const sets = {upper:'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lower:'abcdefghijklmnopqrstuvwxyz', number:'0123456789', symbol:'!@#$%^&*()_+-=[]{}|;:,.<>?'};
  el.querySelectorAll('.chip-toggle').forEach(chip=>{
    chip.addEventListener('click', (e)=>{
      if(e.target.tagName!=='INPUT'){ const cb=chip.querySelector('input'); cb.checked=!cb.checked; }
      setTimeout(()=> chip.classList.toggle('on', chip.querySelector('input').checked), 0);
    });
  });
  const lenInput = el.querySelector('#pwLen');
  lenInput.addEventListener('input', ()=> el.querySelector('#pwLenLabel').textContent = lenInput.value);

  function generate(){
    const len = parseInt(lenInput.value);
    let pool = '';
    if(el.querySelector('#pwUpper').checked) pool += sets.upper;
    if(el.querySelector('#pwLower').checked) pool += sets.lower;
    if(el.querySelector('#pwNumber').checked) pool += sets.number;
    if(el.querySelector('#pwSymbol').checked) pool += sets.symbol;
    if(!pool){ toast('Pilih minimal satu jenis karakter'); return; }
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    let out = '';
    for(let i=0;i<len;i++) out += pool[arr[i] % pool.length];
    el.querySelector('#pwOutput').textContent = out;
    // strength estimate
    let score = 0;
    if(len>=8) score++; if(len>=12) score++; if(len>=16) score++;
    if(el.querySelector('#pwUpper').checked) score++;
    if(el.querySelector('#pwSymbol').checked) score++;
    const pct = Math.min(100, (score/5)*100);
    const fill = el.querySelector('#pwStrength');
    fill.style.width = pct+'%';
    fill.style.background = pct<40?'var(--danger)':pct<75?'#F59E0B':'var(--success)';
    el.querySelector('#pwStrengthLabel').textContent = pct<40?'Lemah':pct<75?'Sedang':'Kuat';
  }
  el.querySelector('#pwGenBtn').addEventListener('click', generate);
  el.querySelector('#pwCopy').addEventListener('click', ()=>{
    const v = el.querySelector('#pwOutput').textContent;
    if(v==='—'){ toast('Generate password dulu'); return; }
    navigator.clipboard.writeText(v).then(()=>toast('Password disalin'));
  });
  generate();
  return el;
}

/* ---------------- COLOR TOOLS ---------------- */
function hexToRgb(hex){
  const m = hex.replace('#','').match(/.{1,2}/g);
  return m ? m.map(x=>parseInt(x,16)) : [0,0,0];
}
function rgbToHsl(r,g,b){
  r/=255; g/=255; b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b);
  let h=0,s=0,l=(max+min)/2;
  if(max!==min){
    const d = max-min;
    s = l>0.5 ? d/(2-max-min) : d/(max+min);
    switch(max){
      case r: h=(g-b)/d+(g<b?6:0); break;
      case g: h=(b-r)/d+2; break;
      case b: h=(r-g)/d+4; break;
    }
    h/=6;
  }
  return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
}
function renderColorTools(){
  pushRecent('color');
  const el = document.createElement('div');
  el.className = 'page';
  el.innerHTML = pageHeader('Color Tools', 'Picker, konversi kode warna, dan gradient generator.') + `
    <div class="panel">
      <div class="color-preview" id="colorPreview"></div>
      <div class="field"><label>Color Picker</label><input class="input" type="color" id="colorPick" value="#2563EB" style="height:46px; padding:4px"></div>
      <div class="info-grid">
        <div class="info-item copy-row"><div><div class="k">HEX</div><div class="v" id="hexOut">#2563EB</div></div><button class="btn btn-secondary btn-icon" data-copy="hexOut">📋</button></div>
        <div class="info-item copy-row"><div><div class="k">RGB</div><div class="v" id="rgbOut">rgb(37,99,235)</div></div><button class="btn btn-secondary btn-icon" data-copy="rgbOut">📋</button></div>
        <div class="info-item copy-row"><div><div class="k">HSL</div><div class="v" id="hslOut">hsl(221,83%,53%)</div></div><button class="btn btn-secondary btn-icon" data-copy="hslOut">📋</button></div>
      </div>
    </div>
    <div class="panel">
      <h3 style="font-size:14px; margin-bottom:12px">Gradient Generator</h3>
      <div class="grid" style="grid-template-columns:1fr 1fr">
        <div class="field"><label>Warna 1</label><input class="input" type="color" id="gradA" value="#2563EB" style="height:42px; padding:4px"></div>
        <div class="field"><label>Warna 2</label><input class="input" type="color" id="gradB" value="#16A34A" style="height:42px; padding:4px"></div>
      </div>
      <div class="field"><label>Sudut: <b id="gradAngleLabel">90</b>°</label><input type="range" id="gradAngle" min="0" max="360" value="90" style="width:100%; accent-color:var(--accent)"></div>
      <div class="gradient-preview" id="gradPreview"></div>
      <div class="copy-row" style="margin-top:12px">
        <div class="result-box" id="gradCss" style="flex:1"></div>
        <button class="btn btn-secondary btn-icon" data-copy="gradCss">📋</button>
      </div>
    </div>
  `;
  function updateColor(hex){
    const [r,g,b] = hexToRgb(hex);
    const [h,s,l] = rgbToHsl(r,g,b);
    el.querySelector('#colorPreview').style.background = hex;
    el.querySelector('#hexOut').textContent = hex.toUpperCase();
    el.querySelector('#rgbOut').textContent = `rgb(${r},${g},${b})`;
    el.querySelector('#hslOut').textContent = `hsl(${h},${s}%,${l}%)`;
  }
  el.querySelector('#colorPick').addEventListener('input', (e)=> updateColor(e.target.value));
  updateColor('#2563EB');
  function updateGrad(){
    const a = el.querySelector('#gradA').value, b = el.querySelector('#gradB').value, ang = el.querySelector('#gradAngle').value;
    el.querySelector('#gradAngleLabel').textContent = ang;
    const css = `linear-gradient(${ang}deg, ${a}, ${b})`;
    el.querySelector('#gradPreview').style.background = css;
    el.querySelector('#gradCss').textContent = `background: ${css};`;
  }
  ['gradA','gradB','gradAngle'].forEach(id=> el.querySelector('#'+id).addEventListener('input', updateGrad));
  updateGrad();
  el.addEventListener('click', (e)=>{
    const b = e.target.closest('[data-copy]'); if(!b) return;
    navigator.clipboard.writeText(el.querySelector('#'+b.dataset.copy).textContent).then(()=>toast('Disalin'));
  });
  return el;
}

/* ---------------- UNIT CONVERTER ---------------- */
const UNIT_GROUPS = {
  Panjang: {m:1, km:1000, cm:0.01, mm:0.001, mile:1609.34, yard:0.9144, foot:0.3048, inch:0.0254},
  Berat: {kg:1, gram:0.001, ton:1000, pound:0.453592, ounce:0.0283495},
  Suhu: null, // khusus
  Luas: {'m²':1, 'km²':1e6, 'ha':10000, 'ft²':0.092903, 'acre':4046.86},
  Volume: {liter:1, ml:0.001, 'm³':1000, gallon:3.78541, cup:0.24},
  Kecepatan: {'m/s':1, 'km/jam':0.277778, 'mph':0.44704, knot:0.514444},
  Waktu: {detik:1, menit:60, jam:3600, hari:86400, minggu:604800},
  'Penyimpanan Data': {byte:1, KB:1024, MB:1048576, GB:1073741824, TB:1099511627776},
};
function convertTemp(v, from, to){
  let c;
  if(from==='Celsius') c=v; else if(from==='Fahrenheit') c=(v-32)*5/9; else c=v-273.15;
  if(to==='Celsius') return c; if(to==='Fahrenheit') return c*9/5+32; return c+273.15;
}
function renderUnitConverter(){
  pushRecent('unit-converter');
  const el = document.createElement('div');
  el.className = 'page';
  el.innerHTML = pageHeader('Unit Converter', 'Konversi berbagai satuan secara instan.') + `
    <div class="panel">
      <div class="field"><label>Kategori</label>
        <select class="input" id="ucGroup">${Object.keys(UNIT_GROUPS).map(g=>`<option>${g}</option>`).join('')}</select>
      </div>
      <div class="input-row">
        <div class="field" style="flex:1"><label>Dari</label><input class="input" type="number" id="ucFromVal" value="1"><select class="input" id="ucFromUnit" style="margin-top:8px"></select></div>
        <div class="field" style="flex:1"><label>Ke</label><input class="input" id="ucToVal" readonly><select class="input" id="ucToUnit" style="margin-top:8px"></select></div>
      </div>
    </div>
  `;
  const group = el.querySelector('#ucGroup');
  const fromU = el.querySelector('#ucFromUnit'), toU = el.querySelector('#ucToUnit');
  function unitsFor(g){ return g==='Suhu' ? ['Celsius','Fahrenheit','Kelvin'] : Object.keys(UNIT_GROUPS[g]); }
  function populate(){
    const g = group.value;
    const units = unitsFor(g);
    fromU.innerHTML = units.map(u=>`<option>${u}</option>`).join('');
    toU.innerHTML = units.map((u,i)=>`<option ${i===1?'selected':''}>${u}</option>`).join('');
    compute();
  }
  function compute(){
    const g = group.value, v = parseFloat(el.querySelector('#ucFromVal').value)||0;
    let result;
    if(g==='Suhu'){ result = convertTemp(v, fromU.value, toU.value); }
    else{ const table = UNIT_GROUPS[g]; result = v * table[fromU.value] / table[toU.value]; }
    el.querySelector('#ucToVal').value = Number(result.toFixed(6)).toString();
  }
  group.addEventListener('change', populate);
  [fromU, toU].forEach(s=>s.addEventListener('change', compute));
  el.querySelector('#ucFromVal').addEventListener('input', compute);
  populate();
  return el;
}

/* ---------------- CALCULATOR ---------------- */
function renderCalculator(){
  pushRecent('calculator');
  const el = document.createElement('div');
  el.className = 'page';
  el.innerHTML = pageHeader('Calculator', 'Kalkulator modern dengan mode scientific.') + `
    <div class="panel">
      <div class="switch-row" style="border:none; padding-top:0">
        <span style="font-weight:600; font-size:13px">Scientific Mode</span>
        <label class="switch"><input type="checkbox" id="calcSciToggle"><span class="slider-toggle"></span></label>
      </div>
      <div class="calc-display">
        <div class="expr" id="calcExpr"></div>
        <div class="val" id="calcVal">0</div>
      </div>
      <div class="calc-grid" id="calcGrid"></div>
      <hr class="sep">
      <div class="section-head" style="margin:0 0 8px"><h2 style="font-size:14px">History</h2><button class="see-all" id="calcClearHist">Hapus</button></div>
      <div id="calcHistory"><p class="muted">Belum ada riwayat.</p></div>
    </div>
  `;
  const KEYS_BASIC = ['C','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','⌫','='];
  const KEYS_SCI = ['sin','cos','tan','√','(',')','^','π'];
  const grid = el.querySelector('#calcGrid');
  const exprEl = el.querySelector('#calcExpr'), valEl = el.querySelector('#calcVal');
  let expr = '';
  const history = [];

  function drawKeys(sci){
    const keys = sci ? [...KEYS_SCI, ...KEYS_BASIC] : KEYS_BASIC;
    grid.innerHTML = keys.map(k=>{
      let cls = 'calc-key';
      if(['÷','×','−','+','^'].includes(k)) cls += ' op';
      if(k==='=') cls += ' eq';
      return `<button class="${cls}" data-k="${k}">${k}</button>`;
    }).join('');
  }
  el.querySelector('#calcSciToggle').addEventListener('change', (e)=> drawKeys(e.target.checked));
  drawKeys(false);

  function safeEval(str){
    let s = str.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/π/g,'Math.PI')
      .replace(/√\(?([0-9.]+)\)?/g, 'Math.sqrt($1)')
      .replace(/sin\(/g,'Math.sin(').replace(/cos\(/g,'Math.cos(').replace(/tan\(/g,'Math.tan(')
      .replace(/\^/g,'**');
    const stripped = s.replace(/Math\.(sqrt|sin|cos|tan|PI)/g,'');
    if(/[^0-9+\-*/%.() ]/.test(stripped)) throw new Error('invalid');
    // eslint-disable-next-line no-new-func
    return Function('"use strict"; return (' + s + ')')();
  }
  function updateDisplay(){ exprEl.textContent = expr; valEl.textContent = expr ? expr : '0'; }
  function drawHistory(){
    const box = el.querySelector('#calcHistory');
    if(!history.length){ box.innerHTML = '<p class="muted">Belum ada riwayat.</p>'; return; }
    box.innerHTML = history.map(h=>`<div class="dl-history-item"><span>${h.expr}</span><span style="font-family:var(--font-mono)">${h.result}</span></div>`).join('');
  }
  grid.addEventListener('click', (e)=>{
    const b = e.target.closest('[data-k]'); if(!b) return;
    const k = b.dataset.k;
    if(k==='C'){ expr=''; }
    else if(k==='⌫'){ expr = expr.slice(0,-1); }
    else if(k==='±'){ expr = expr.startsWith('-') ? expr.slice(1) : '-'+expr; }
    else if(k==='%'){ try{ expr = String(safeEval(expr)/100); }catch(e){} }
    else if(k==='='){
      try{
        const result = safeEval(expr);
        history.unshift({expr, result});
        drawHistory();
        exprEl.textContent = expr; valEl.textContent = result;
        expr = String(result);
        updateDisplay();
        return;
      }catch(err){ valEl.textContent = 'Error'; return; }
    }
    else if(['sin','cos','tan','√'].includes(k)){ expr += k+'('; }
    else{ expr += k; }
    updateDisplay();
  });
  el.querySelector('#calcClearHist').addEventListener('click', ()=>{ history.length=0; drawHistory(); });
  updateDisplay();
  return el;
}

/* ---------------- UTILITIES ---------------- */
const UTIL_MENU = [
  {id:'stopwatch', name:'Stopwatch', icon:'⏱'}, {id:'timer', name:'Countdown Timer', icon:'⏲'},
  {id:'clock', name:'Digital Clock', icon:'🕐'}, {id:'random', name:'Random Number', icon:'🔢'},
  {id:'coin', name:'Coin Flip', icon:'🪙'}, {id:'dice', name:'Dice Roller', icon:'🎲'},
];
function renderUtilities(sub){
  const active = sub && UTIL_MENU.some(u=>u.id===sub) ? sub : 'stopwatch';
  const el = document.createElement('div');
  el.className = 'page';
  el.innerHTML = pageHeader('Utilities', 'Kumpulan alat bantu harian.') + `
    <div class="dl-tabs">${UTIL_MENU.map(u=>`<button class="dl-tab ${u.id===active?'active':''}" data-util="${u.id}">${u.icon} ${u.name}</button>`).join('')}</div>
    <div class="panel" id="utilBody"></div>
  `;
  el.querySelectorAll('[data-util]').forEach(b=> b.addEventListener('click', ()=> location.hash = '#/utilities/'+b.dataset.util));
  const body = el.querySelector('#utilBody');
  const cleanups = [];
  el._cleanup = ()=> cleanups.forEach(fn=>fn());

  if(active==='stopwatch'){
    body.innerHTML = `<div class="clock-display" id="swDisplay">00:00.00</div>
      <div class="btn-row" style="justify-content:center">
        <button class="btn btn-primary" id="swStartStop">Mulai</button>
        <button class="btn btn-secondary" id="swLap">Lap</button>
        <button class="btn btn-secondary" id="swReset">Reset</button>
      </div>
      <div id="swLaps" style="margin-top:14px"></div>`;
    let elapsed=0, running=false, startTs=0, raf;
    const laps=[];
    function fmt(ms){
      const m = String(Math.floor(ms/60000)).padStart(2,'0');
      const s = String(Math.floor((ms%60000)/1000)).padStart(2,'0');
      const cs = String(Math.floor((ms%1000)/10)).padStart(2,'0');
      return `${m}:${s}.${cs}`;
    }
    function loop(){ body.querySelector('#swDisplay').textContent = fmt(elapsed + (Date.now()-startTs)); raf = requestAnimationFrame(loop); }
    body.querySelector('#swStartStop').addEventListener('click', (e)=>{
      running = !running;
      e.target.textContent = running ? 'Jeda' : 'Mulai';
      if(running){ startTs = Date.now(); loop(); } else { elapsed += Date.now()-startTs; cancelAnimationFrame(raf); }
    });
    body.querySelector('#swLap').addEventListener('click', ()=>{
      laps.unshift(fmt(elapsed + (running?Date.now()-startTs:0)));
      body.querySelector('#swLaps').innerHTML = laps.map((l,i)=>`<div class="dl-history-item"><span>Lap ${laps.length-i}</span><span style="font-family:var(--font-mono)">${l}</span></div>`).join('');
    });
    body.querySelector('#swReset').addEventListener('click', ()=>{
      running=false; elapsed=0; cancelAnimationFrame(raf); laps.length=0;
      body.querySelector('#swDisplay').textContent='00:00.00'; body.querySelector('#swLaps').innerHTML='';
      body.querySelector('#swStartStop').textContent='Mulai';
    });
    cleanups.push(()=>cancelAnimationFrame(raf));
  }

  else if(active==='timer'){
    body.innerHTML = `<div class="grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="field"><label>Jam</label><input class="input" type="number" id="tmH" value="0" min="0"></div>
        <div class="field"><label>Menit</label><input class="input" type="number" id="tmM" value="5" min="0" max="59"></div>
        <div class="field"><label>Detik</label><input class="input" type="number" id="tmS" value="0" min="0" max="59"></div>
      </div>
      <div class="clock-display" id="tmDisplay">05:00</div>
      <div class="btn-row" style="justify-content:center">
        <button class="btn btn-primary" id="tmStart">Mulai</button>
        <button class="btn btn-secondary" id="tmReset">Reset</button>
      </div>`;
    let remain=300, iv=null;
    function fmt(sec){ sec=Math.max(0,sec); const h=Math.floor(sec/3600), m=Math.floor((sec%3600)/60), s=sec%60;
      return h>0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
    function readInputs(){ return (parseInt(body.querySelector('#tmH').value)||0)*3600 + (parseInt(body.querySelector('#tmM').value)||0)*60 + (parseInt(body.querySelector('#tmS').value)||0); }
    body.querySelector('#tmStart').addEventListener('click', (e)=>{
      if(iv){ clearInterval(iv); iv=null; e.target.textContent='Mulai'; return; }
      remain = remain>0 && e.target.textContent==='Lanjut' ? remain : readInputs();
      if(remain<=0){ toast('Atur durasi terlebih dahulu'); return; }
      e.target.textContent='Jeda';
      iv = setInterval(()=>{
        remain--; body.querySelector('#tmDisplay').textContent = fmt(remain);
        if(remain<=0){ clearInterval(iv); iv=null; toast('Waktu habis!'); e.target.textContent='Mulai'; }
      },1000);
    });
    body.querySelector('#tmReset').addEventListener('click', ()=>{
      clearInterval(iv); iv=null; remain = readInputs(); body.querySelector('#tmDisplay').textContent = fmt(remain);
      body.querySelector('#tmStart').textContent='Mulai';
    });
    ['tmH','tmM','tmS'].forEach(id=> body.querySelector('#'+id).addEventListener('input', ()=>{ remain=readInputs(); body.querySelector('#tmDisplay').textContent=fmt(remain); }));
    cleanups.push(()=>clearInterval(iv));
  }

  else if(active==='clock'){
    body.innerHTML = `<div class="clock-display" id="clkDisplay"></div><p class="muted" style="text-align:center" id="clkDate"></p>`;
    function draw(){
      const now = new Date();
      body.querySelector('#clkDisplay').textContent = now.toLocaleTimeString('id-ID');
      body.querySelector('#clkDate').textContent = now.toLocaleDateString('id-ID', {weekday:'long', year:'numeric', month:'long', day:'numeric'});
    }
    draw(); const iv = setInterval(draw, 1000);
    cleanups.push(()=>clearInterval(iv));
  }

  else if(active==='random'){
    body.innerHTML = `<div class="grid" style="grid-template-columns:1fr 1fr">
        <div class="field"><label>Min</label><input class="input" type="number" id="rnMin" value="1"></div>
        <div class="field"><label>Max</label><input class="input" type="number" id="rnMax" value="100"></div>
      </div>
      <div class="clock-display" id="rnResult">?</div>
      <button class="btn btn-primary btn-block" id="rnGo">Generate</button>`;
    body.querySelector('#rnGo').addEventListener('click', ()=>{
      const min = parseInt(body.querySelector('#rnMin').value)||0, max = parseInt(body.querySelector('#rnMax').value)||0;
      if(min>max){ toast('Min harus lebih kecil dari Max'); return; }
      body.querySelector('#rnResult').textContent = Math.floor(Math.random()*(max-min+1))+min;
    });
  }

  else if(active==='coin'){
    body.innerHTML = `<div class="coin-face" id="coinFace">?</div><button class="btn btn-primary btn-block" id="coinGo">Lempar Koin</button>`;
    body.querySelector('#coinGo').addEventListener('click', ()=>{
      const face = body.querySelector('#coinFace');
      face.style.transition='none'; face.style.transform='rotateY(0deg)';
      requestAnimationFrame(()=>{
        face.style.transition='transform .5s ease';
        face.style.transform='rotateY(720deg)';
      });
      setTimeout(()=>{ face.textContent = Math.random()<0.5 ? 'H' : 'T'; }, 250);
    });
  }

  else if(active==='dice'){
    body.innerHTML = `<div class="dice-face" id="diceFace">🎲</div>
      <div class="field"><label>Jumlah Dadu</label><input class="input" type="number" id="diceCount" value="1" min="1" max="6"></div>
      <button class="btn btn-primary btn-block" id="diceGo">Lempar Dadu</button>
      <div class="muted" id="diceResult" style="text-align:center; margin-top:10px"></div>`;
    body.querySelector('#diceGo').addEventListener('click', ()=>{
      const n = parseInt(body.querySelector('#diceCount').value)||1;
      const rolls = Array.from({length:n}, ()=>Math.floor(Math.random()*6)+1);
      const faces = ['','⚀','⚁','⚂','⚃','⚄','⚅'];
      body.querySelector('#diceFace').textContent = n===1 ? faces[rolls[0]] : '🎲';
      body.querySelector('#diceResult').textContent = `Hasil: ${rolls.join(', ')} ${n>1?`(total ${rolls.reduce((a,b)=>a+b,0)})`:''}`;
    });
  }

  return el;
}

/* ---------------- ABOUT ---------------- */
function renderAbout(){
  const el = document.createElement('div');
  el.className = 'page';
  el.innerHTML = pageHeader('About', 'Informasi seputar website ini.') + `
    <div class="panel">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px">
        <span class="brand-mark" style="width:44px; height:44px; font-size:16px">AT</span>
        <div><h3 style="font-size:17px">All Tools</h3><span class="badge">v1.0.0</span></div>
      </div>
      <p class="muted">All Tools adalah kumpulan utilitas ringan — downloader, QR code, konverter, kalkulator, dan lainnya — dalam satu website cepat, responsif, dan bisa dipasang sebagai aplikasi (PWA).</p>
      <hr class="sep">
      <div class="info-grid">
        <div class="info-item"><div class="k">Pengembang</div><div class="v">All Tools Team</div></div>
        <div class="info-item"><div class="k">Lisensi</div><div class="v">Hak Cipta Dilindungi</div></div>
      </div>
    </div>
    <div class="panel">
      <h3 style="font-size:14px; margin-bottom:10px">Changelog</h3>
      <div class="dl-history-item"><span>v1.0.0</span><span class="muted">Rilis awal — semua tool inti tersedia</span></div>
    </div>
    <div class="panel">
      <h3 style="font-size:14px; margin-bottom:10px">Kebijakan Privasi</h3>
      <p class="muted">Semua pemrosesan tool (teks, password, kalkulator, QR, dsb.) berjalan langsung di perangkat Anda. Fitur downloader memerlukan koneksi ke layanan backend terpisah sesuai implementasi Anda.</p>
    </div>
    <div class="panel">
      <h3 style="font-size:14px; margin-bottom:10px">Syarat Penggunaan</h3>
      <p class="muted">Gunakan All Tools secara bertanggung jawab dan patuhi hukum serta hak cipta yang berlaku, khususnya saat mengunduh konten pihak ketiga.</p>
    </div>
  `;
  return el;
}

/* ---------------- 404 ---------------- */
function render404(){
  const el = document.createElement('div');
  el.className = 'page';
  el.innerHTML = `<div class="empty-state">
    <div class="em-icon">🧭</div>
    <h2 style="margin-bottom:8px">404 — Halaman Tidak Ditemukan</h2>
    <p class="muted">Tool yang Anda cari tidak tersedia.</p>
    <button class="btn btn-primary" style="margin-top:16px" data-goto="home">Kembali ke Home</button>
  </div>`;
  return el;
}

/* ---------------- Skeleton (saat memuat) ---------------- */
function renderSkeleton(){
  const el = document.createElement('div');
  el.className = 'page';
  el.innerHTML = `<div class="skeleton" style="height:160px; border-radius:20px; margin-bottom:20px"></div>
    <div class="grid">${Array.from({length:8}).map(()=>'<div class="skeleton" style="height:96px"></div>').join('')}</div>`;
  return el;
}

/* ---------------- Router ---------------- */
const ROUTES = {
  home: ()=> renderHome(),
  downloader: (sub)=> renderDownloader(sub),
  'qr-generate': ()=> renderQrGenerate(),
  'qr-scan': ()=> renderQrScan(),
  'device-info': ()=> renderDeviceInfo(),
  'text-tools': ()=> renderTextTools(),
  password: ()=> renderPassword(),
  color: ()=> renderColorTools(),
  'unit-converter': ()=> renderUnitConverter(),
  calculator: ()=> renderCalculator(),
  utilities: (sub)=> renderUtilities(sub),
  about: ()=> renderAbout(),
};
let currentPageCleanup = null;
function parseHash(){
  const raw = (location.hash || '#/home').replace(/^#\//,'');
  const [route, sub] = raw.split('/');
  return {route: route || 'home', sub};
}
async function router(){
  const {route, sub} = parseHash();
  const app = document.getElementById('app');
  if(currentPageCleanup){ try{ currentPageCleanup(); }catch(e){} currentPageCleanup = null; }
  app.innerHTML = '';
  app.appendChild(renderSkeleton());
  const handler = ROUTES[route];
  await new Promise(r=>setTimeout(r, 120)); // beri jeda halus untuk efek skeleton
  let pageEl;
  try{
    pageEl = handler ? await handler(sub) : render404();
  }catch(err){
    console.error(err);
    pageEl = render404();
  }
  app.innerHTML = '';
  app.appendChild(pageEl);
  currentPageCleanup = pageEl._cleanup || null;
  renderSidebar(route);
  renderBottomNav(route);
  window.scrollTo({top:0, behavior:'instant'});
}
window.addEventListener('hashchange', router);

/* ---------------- Navbar search → redirect ke home ---------------- */
document.getElementById('navSearchInput').addEventListener('input', (e)=>{
  const q = e.target.value;
  if(parseHash().route !== 'home'){ location.hash = '#/home'; }
  setTimeout(()=>{
    const heroInput = document.getElementById('heroSearchInput');
    if(heroInput){ heroInput.value = q; heroInput.dispatchEvent(new Event('input')); }
  }, 160);
});

/* ---------------- Offline / online toast wiring already above ---------------- */

/* ---------------- PWA: manifest + service worker ---------------- */
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js').catch(()=>{ /* offline-first: gagal daftar SW tidak menghentikan app */ });
  });
}

/* ---------------- Init ---------------- */
router();

})();
