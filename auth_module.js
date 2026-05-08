// ══════════════════════════════════════════════════════════════
//  GEOTOPO AUTH MODULE — MercadoPago Edition
//  Pegar al inicio del <script> en geotopo_web.html
//  Cambiar BACKEND_URL con la URL de Railway
// ══════════════════════════════════════════════════════════════

const BACKEND_URL = 'https://geotopo-backend.onrender.com'; // ← CAMBIAR

var _GT_USER  = null;
var _GT_TOKEN = null;

// Restaurar sesión guardada
(function() {
  try {
    var t = localStorage.getItem('gt_token');
    if (t) { _GT_TOKEN = t; _gtVerify(); }
  } catch(e) {}
})();

async function _gtVerify() {
  if (!BACKEND_URL || BACKEND_URL.includes('tu-proyecto')) return;
  try {
    var r = await fetch(BACKEND_URL + '/auth/me', {
      headers: { 'Authorization': 'Bearer ' + _GT_TOKEN }
    });
    if (r.ok) { _GT_USER = await r.json(); _gtUpdateUI(); }
    else gtLogout();
  } catch(e) {}
}

// ── INYECTAR UI ───────────────────────────────────────────────
function _gtInjectUI() {
  if (document.getElementById('gt-modal')) return;

  // Botón en panel
  var btn = document.createElement('div');
  btn.id = 'gt-btn';
  btn.style.cssText = 'margin:8px 0 4px;padding:10px 12px;background:rgba(255,255,255,0.04);' +
    'border-radius:8px;border:1px solid rgba(255,255,255,0.09);cursor:pointer;' +
    'font-size:12px;color:#8899b4;display:flex;align-items:center;gap:8px;transition:all 0.2s';
  btn.innerHTML = '<span style="font-size:15px">👤</span><span id="gt-btn-txt">Iniciar sesión</span>';
  btn.onclick = function() {
    document.getElementById('gt-modal').style.display = 'flex';
    if (_GT_USER) _gtShowPlan(); else _gtShowLogin();
  };
  btn.onmouseenter = function() { this.style.borderColor='#00e5ff'; this.style.color='#00e5ff'; };
  btn.onmouseleave = function() { this.style.borderColor='rgba(255,255,255,0.09)'; this.style.color='#8899b4'; };

  var imp = document.getElementById('btn-importar');
  if (imp?.parentNode) imp.parentNode.insertBefore(btn, imp.parentNode.firstChild);

  // Modal
  var m = document.createElement('div');
  m.id = 'gt-modal';
  m.style.cssText = 'display:none;position:fixed;inset:0;z-index:9999;' +
    'background:rgba(0,0,0,0.82);backdrop-filter:blur(10px);' +
    'align-items:center;justify-content:center;padding:16px';
  m.innerHTML = `
<div style="background:#0d1420;border:1px solid rgba(255,255,255,0.1);border-radius:20px;
  padding:32px;width:100%;max-width:380px;position:relative;box-shadow:0 40px 100px rgba(0,0,0,0.7)">
  <button onclick="document.getElementById('gt-modal').style.display='none'"
    style="position:absolute;top:14px;right:16px;background:none;border:none;color:#4a5a72;font-size:20px;cursor:pointer;line-height:1">✕</button>

  <!-- Logo -->
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">
    <div style="width:10px;height:10px;border-radius:50%;background:#00e5ff;box-shadow:0 0 10px #00e5ff"></div>
    <span style="font-size:18px;font-weight:800;color:#e8edf5">Geo<span style="color:#00e5ff">Topo</span></span>
  </div>

  <!-- Vista: Login/Register -->
  <div id="gt-view-auth">
    <div style="display:flex;gap:6px;margin-bottom:20px;background:rgba(255,255,255,0.04);
      border-radius:10px;padding:4px">
      <button id="gt-tab-l" onclick="gtTab('l')"
        style="flex:1;padding:8px;border-radius:7px;border:none;font-size:13px;font-weight:600;cursor:pointer;
          background:#00e5ff;color:#000;transition:all 0.2s">Iniciar sesión</button>
      <button id="gt-tab-r" onclick="gtTab('r')"
        style="flex:1;padding:8px;border-radius:7px;border:none;font-size:13px;cursor:pointer;
          background:transparent;color:#8899b4;transition:all 0.2s">Registrarse</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <input id="gt-email" type="email" placeholder="tu@email.com"
        style="background:#111b2a;border:1px solid rgba(255,255,255,0.08);border-radius:10px;
          padding:12px 14px;color:#e8edf5;font-size:14px;outline:none;width:100%;box-sizing:border-box">
      <input id="gt-pass" type="password" placeholder="Contraseña (mín. 6 caracteres)"
        style="background:#111b2a;border:1px solid rgba(255,255,255,0.08);border-radius:10px;
          padding:12px 14px;color:#e8edf5;font-size:14px;outline:none;width:100%;box-sizing:border-box">
      <div id="gt-msg" style="font-size:12px;color:#ef4444;min-height:14px;padding:0 2px"></div>
      <button id="gt-submit" onclick="gtSubmit()"
        style="background:#00e5ff;color:#000;border:none;border-radius:10px;padding:13px;
          font-size:14px;font-weight:700;cursor:pointer;width:100%;transition:all 0.2s">Iniciar sesión</button>
      <button id="gt-forgot" onclick="gtForgot()"
        style="background:none;border:none;color:#4a5a72;font-size:12px;cursor:pointer;margin-top:4px">
        ¿Olvidaste tu contraseña?</button>
    </div>
  </div>

  <!-- Vista: Plan actual (cuando está logueado) -->
  <div id="gt-view-plan" style="display:none">
    <div style="font-size:13px;color:#8899b4;margin-bottom:6px">Sesión iniciada como</div>
    <div id="gt-plan-email" style="font-size:14px;font-weight:700;color:#e8edf5;margin-bottom:20px"></div>

    <div id="gt-plan-card" style="padding:16px;border-radius:12px;margin-bottom:16px"></div>

    <div style="display:flex;flex-direction:column;gap:8px">
      <button id="gt-upgrade-pro" onclick="gtPay('pro')"
        style="display:none;background:linear-gradient(135deg,#7b61ff,#00e5ff);color:#fff;
          border:none;border-radius:10px;padding:13px;font-size:14px;font-weight:700;cursor:pointer">
        ⬆ Subir a Pro — $7.990 CLP/mes
      </button>
      <button id="gt-upgrade-ent" onclick="gtPay('enterprise')"
        style="display:none;background:rgba(123,97,255,0.15);color:#7b61ff;border:1px solid rgba(123,97,255,0.3);
          border-radius:10px;padding:11px;font-size:13px;cursor:pointer">
        Enterprise — $24.990 CLP/mes (hasta 100 km²)
      </button>
      <button onclick="gtLogout()"
        style="background:none;border:1px solid rgba(255,255,255,0.08);color:#4a5a72;
          border-radius:10px;padding:10px;font-size:13px;cursor:pointer">
        Cerrar sesión
      </button>
    </div>
  </div>
</div>`;
  document.body.appendChild(m);
}

var _gtTab = 'l';
function gtTab(t) {
  _gtTab = t;
  var isL = t === 'l';
  var tL = document.getElementById('gt-tab-l');
  var tR = document.getElementById('gt-tab-r');
  tL.style.background = isL ? '#00e5ff' : 'transparent';
  tL.style.color = isL ? '#000' : '#8899b4';
  tR.style.background = isL ? 'transparent' : '#00e5ff';
  tR.style.color = isL ? '#8899b4' : '#000';
  document.getElementById('gt-submit').textContent = isL ? 'Iniciar sesión' : 'Crear cuenta gratis';
  document.getElementById('gt-forgot').style.display = isL ? 'block' : 'none';
  document.getElementById('gt-msg').textContent = '';
}

function _gtShowLogin() {
  document.getElementById('gt-view-auth').style.display = 'block';
  document.getElementById('gt-view-plan').style.display = 'none';
}

function _gtShowPlan() {
  document.getElementById('gt-view-auth').style.display = 'none';
  document.getElementById('gt-view-plan').style.display = 'block';
  if (!_GT_USER) return;
  document.getElementById('gt-plan-email').textContent = _GT_USER.email;

  var plan = _GT_USER.plan || 'free';
  var limites = { free: '1.5 km²', pro: '25 km²', enterprise: '100 km²' };
  var colores = { free: '#374151', pro: '#7b61ff', enterprise: '#00e5ff' };
  var card = document.getElementById('gt-plan-card');
  card.style.background = 'rgba(' + (plan==='free' ? '255,255,255,0.04' : '0,229,255,0.05') + ')';
  card.style.border = '1px solid rgba(' + (plan==='free' ? '255,255,255,0.08' : '0,229,255,0.2') + ')';
  card.innerHTML = '<div style="font-size:11px;color:#8899b4;margin-bottom:6px;letter-spacing:0.08em">PLAN ACTUAL</div>' +
    '<div style="font-size:22px;font-weight:800;color:' + (colores[plan] || '#fff') + ';margin-bottom:4px">' +
    plan.toUpperCase() + '</div>' +
    '<div style="font-size:13px;color:#8899b4">Hasta ' + (limites[plan]||'1.5 km²') + ' por export</div>';

  document.getElementById('gt-upgrade-pro').style.display = plan === 'free' ? 'block' : 'none';
  document.getElementById('gt-upgrade-ent').style.display = plan === 'free' || plan === 'pro' ? 'block' : 'none';
}

async function gtSubmit() {
  var email = (document.getElementById('gt-email').value || '').trim();
  var pass  = document.getElementById('gt-pass').value;
  var msg   = document.getElementById('gt-msg');
  var btn   = document.getElementById('gt-submit');
  if (!email || !pass) { msg.textContent = 'Completa todos los campos'; return; }
  if (!email.includes('@')) { msg.textContent = 'Email inválido'; return; }
  if (pass.length < 6) { msg.textContent = 'Contraseña mínimo 6 caracteres'; return; }
  btn.textContent = 'Cargando...'; btn.disabled = true; msg.textContent = '';
  try {
    var ep = _gtTab === 'l' ? '/auth/login' : '/auth/register';
    var r  = await fetch(BACKEND_URL + ep, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    var d = await r.json();
    if (!r.ok) { msg.textContent = d.error || 'Error al conectar'; }
    else {
      _GT_TOKEN = d.token; _GT_USER = d.user;
      try { localStorage.setItem('gt_token', _GT_TOKEN); } catch(e) {}
      _gtUpdateUI();
      _gtShowPlan();
    }
  } catch(e) {
    msg.textContent = 'Sin conexión con el servidor';
  }
  btn.disabled = false;
  btn.textContent = _gtTab === 'l' ? 'Iniciar sesión' : 'Crear cuenta gratis';
}

async function gtForgot() {
  var email = (document.getElementById('gt-email').value || '').trim();
  if (!email) { document.getElementById('gt-msg').textContent = 'Ingresa tu email primero'; return; }
  await fetch(BACKEND_URL + '/auth/forgot-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  document.getElementById('gt-msg').style.color = '#00e5ff';
  document.getElementById('gt-msg').textContent = '✓ Revisa tu email para recuperar tu contraseña';
}

async function gtPay(plan) {
  if (!_GT_USER) { _gtShowLogin(); return; }
  var btn = document.getElementById('gt-upgrade-' + (plan === 'pro' ? 'pro' : 'ent'));
  var orig = btn.textContent; btn.textContent = 'Redirigiendo a MercadoPago...'; btn.disabled = true;
  try {
    var r = await fetch(BACKEND_URL + '/create-preference', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + _GT_TOKEN },
      body: JSON.stringify({ plan })
    });
    var d = await r.json();
    if (d.url) {
      // sandbox_init_point para pruebas, init_point para producción
      window.open(d.url_sandbox || d.url, '_blank');
    } else {
      alert('Error: ' + (d.error || 'No se pudo crear el link de pago'));
    }
  } catch(e) { alert('Sin conexión con el servidor'); }
  btn.disabled = false; btn.textContent = orig;
}

function gtLogout() {
  _GT_USER = null; _GT_TOKEN = null;
  try { localStorage.removeItem('gt_token'); } catch(e) {}
  _gtUpdateUI();
  document.getElementById('gt-modal').style.display = 'none';
}

function _gtUpdateUI() {
  _gtInjectUI();
  var btnTxt = document.getElementById('gt-btn-txt');
  if (!btnTxt) return;
  if (_GT_USER) {
    var plan = _GT_USER.plan || 'free';
    var color = plan === 'pro' ? '#7b61ff' : plan === 'enterprise' ? '#00e5ff' : '#4a5a72';
    var email = _GT_USER.email.split('@')[0];
    btnTxt.innerHTML = email +
      ' <span style="background:' + color + ';color:#fff;padding:1px 7px;border-radius:100px;font-size:10px;margin-left:4px">' +
      plan.toUpperCase() + '</span>';
  } else {
    btnTxt.textContent = 'Iniciar sesión';
  }
}

// ── VALIDAR ÁREA ANTES DE IMPORTAR ────────────────────────────
async function gtValidarArea(bbox) {
  if (!BACKEND_URL || BACKEND_URL.includes('tu-proyecto')) return true;
  try {
    var r = await fetch(BACKEND_URL + '/validate-export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (_GT_TOKEN || '') },
      body: JSON.stringify({ bbox })
    });
    var d = await r.json();
    if (!r.ok) {
      sb('⚠ ' + d.error, 'err');
      if (d.upgrade) {
        _gtInjectUI();
        document.getElementById('gt-modal').style.display = 'flex';
        if (_GT_USER) _gtShowPlan(); else _gtShowLogin();
      }
      return false;
    }
    return true;
  } catch(e) {
    console.warn('Backend no disponible — modo offline');
    return true;
  }
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', function() {
  _gtInjectUI();
  _gtUpdateUI();

  // Detectar retorno de MercadoPago
  var params = new URLSearchParams(location.search);
  if (params.get('success') === '1') {
    var plan = params.get('plan') || 'pro';
    setTimeout(function() {
      if (typeof sb === 'function') sb('✓ Pago exitoso — plan ' + plan.toUpperCase() + ' activado en minutos', 'ok');
      _gtVerify(); // Refrescar plan
    }, 1000);
  }
});
