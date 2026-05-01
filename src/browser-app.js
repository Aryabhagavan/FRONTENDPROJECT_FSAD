(function () {
  const API = '/api';
  const root = document.getElementById('root');
  const state = {
    user: readJson('user'),
    token: localStorage.getItem('token'),
    view: 'home',
    data: {},
    captcha: null,
  };

  const roles = [
    ['BUYER', 'Public'],
    ['FARMER', 'Farmer'],
    ['EXPERT', 'Agricultural Expert'],
    ['ADMIN', 'Admin'],
  ];
  const categories = ['GRAINS', 'FRUITS', 'VEGETABLES', 'SPICES'];

  function readJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  }

  async function api(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (state.token) headers.Authorization = `Bearer ${state.token}`;
    const response = await fetch(`${API}${path}`, { ...options, headers });
    if (!response.ok) {
      let message = 'Request failed';
      try {
        message = (await response.json()).message || message;
      } catch {}
      throw new Error(message);
    }
    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  function setView(view) {
    state.view = view;
    render();
  }

  function role() {
    return (state.user?.roles?.[0] || 'ROLE_BUYER').replace('ROLE_', '');
  }

  function roleName(value) {
    return value === 'BUYER' ? 'Public' : value.charAt(0) + value.slice(1).toLowerCase();
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }[char]));
  }

  function money(value) {
    return `Rs ${escapeHtml(value)}`;
  }

  function formData(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  function resetCaptcha() {
    const left = Math.floor(Math.random() * 8) + 2;
    const right = Math.floor(Math.random() * 8) + 2;
    state.captcha = {
      question: `${left} + ${right}`,
      answer: String(left + right),
    };
  }

  function toast(message) {
    alert(message);
  }

  function publicPage() {
    root.innerHTML = `
      <main class="public-shell">
        <section class="hero-band">
          <nav class="topbar">
            <div class="brand-mark"><span>NS</span><span>Nspire Farming Society</span></div>
            <div class="top-actions">
              <button class="ghost-button" data-auth-mode="login">Sign in</button>
              <button class="solid-button" data-auth-mode="register">Join platform</button>
            </div>
          </nav>
          <div class="hero-grid">
            <div class="hero-copy">
              <p class="eyebrow">Farmer awareness and sector support</p>
              <h1>Nspire Farming Society</h1>
              <p class="hero-text">A connected platform where farmers access schemes, experts publish guidance, admins verify information, and the public supports farming.</p>
              <div class="hero-actions">
                <button class="solid-button large" data-auth-mode="register">Start now</button>
                <button class="ghost-button large" data-auth-mode="login">Existing user</button>
              </div>
            </div>
            <section class="auth-card" id="authCard"></section>
          </div>
        </section>
        <section class="content-band">
          <div class="section-header"><span>LIVE</span><div><h2>Platform Preview</h2><p>Connected to backend public resources when Spring Boot is running.</p></div></div>
          <div class="preview-grid" id="previewGrid"><div class="empty-panel">Loading resources...</div></div>
        </section>
        <section class="content-band sectors">
          ${sectorCard('Farmers', 'List produce, respond to offers, and use expert advice.')}
          ${sectorCard('Experts', 'Create guidance and educational farming content.')}
          ${sectorCard('Admins', 'Manage users, schemes, reports, and data accuracy.')}
          ${sectorCard('Public', 'Explore farming, schemes, marketplace items, and discussions.')}
        </section>
      </main>
    `;
    renderAuth('register');
    loadPublicPreview();
  }

  function sectorCard(title, text) {
    return `<article class="sector-card"><h3>${title}</h3><p>${text}</p></article>`;
  }

  function renderAuth(mode) {
    const card = document.getElementById('authCard');
    if (!card) return;
    if (mode === 'login') resetCaptcha();
    card.innerHTML = `
      <div class="segmented">
        <button class="${mode === 'login' ? 'active' : ''}" data-auth-mode="login">Login</button>
        <button class="${mode === 'register' ? 'active' : ''}" data-auth-mode="register">Register</button>
      </div>
      <form class="stack-form" id="authForm">
        <label>Username<input name="username" required /></label>
        ${mode === 'register' ? `
          <label>Gmail<input name="email" type="email" required placeholder="name@gmail.com" /></label>
          <label>Role<select name="role">${roles.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></label>
        ` : ''}
        <label>Password<input name="password" type="password" required minlength="6" /></label>
        ${mode === 'login' ? `
          <label>Captcha
            <div class="captcha-row">
              <strong>${escapeHtml(state.captcha.question)} =</strong>
              <input name="captchaAnswer" inputmode="numeric" autocomplete="off" required />
              <button class="mini" type="button" id="captchaRefresh">New</button>
            </div>
          </label>
        ` : ''}
        <button class="solid-button full">${mode === 'login' ? 'Access Dashboard' : 'Create Account'}</button>
      </form>
    `;
    const refresh = document.getElementById('captchaRefresh');
    if (refresh) refresh.onclick = () => renderAuth('login');
    document.getElementById('authForm').onsubmit = async (event) => {
      event.preventDefault();
      const data = formData(event.target);
      try {
        if (mode === 'login') {
          if (String(data.captchaAnswer).trim() !== state.captcha.answer) {
            toast('Captcha answer is incorrect. Try again.');
            renderAuth('login');
            return;
          }
          delete data.captchaAnswer;
          const user = await api('/auth/signin', { method: 'POST', body: JSON.stringify(data) });
          state.token = user.token;
          state.user = user;
          localStorage.setItem('token', user.token);
          localStorage.setItem('user', JSON.stringify(user));
          state.view = defaultView();
          render();
        } else {
          await api('/auth/signup', { method: 'POST', body: JSON.stringify(data) });
          toast('Registration successful. Please login.');
          renderAuth('login');
        }
      } catch (error) {
        toast(error.message);
      }
    };
  }

  async function loadPublicPreview() {
    const target = document.getElementById('previewGrid');
    if (!target) return;
    try {
      const [products, schemes, suggestions] = await Promise.all([
        api('/products'),
        api('/schemes'),
        api('/suggestions'),
      ]);
      target.innerHTML = `
        ${previewPanel('Marketplace', products, (p) => `${p.name} · ${p.category} · ${money(p.price)}/kg`)}
        ${previewPanel('Schemes', schemes, (s) => `${s.name} · ${s.category || 'GENERAL'}`)}
        ${previewPanel('Guidance', suggestions, (s) => `${s.advice} · ${s.expertName || 'Expert'}`)}
      `;
    } catch {
      target.innerHTML = '<div class="empty-panel">Start the backend on port 2026 to load live resources.</div>';
    }
  }

  function previewPanel(title, items, mapper) {
    return `
      <article class="preview-panel">
        <div class="panel-heading"><strong>${title}</strong><span>${items.length}</span></div>
        <div class="compact-list">
          ${items.slice(0, 4).map((item) => `<div class="compact-row"><strong>${escapeHtml(mapper(item))}</strong></div>`).join('') || '<p class="muted">No records yet.</p>'}
        </div>
      </article>
    `;
  }

  function dashboard() {
    if (!state.view || state.view === 'home') state.view = defaultView();
    const menu = menuForRole();
    root.innerHTML = `
      <main class="app-shell">
        <aside class="side-panel">
          <div class="brand-block"><span>NS</span><div><strong>Nspire Farming</strong><span>${roleName(role())} Workspace</span></div></div>
          <nav class="nav-list">
            ${menu.map((item) => `<button class="${state.view === item.key ? 'active' : ''}" data-view="${item.key}">${item.label}</button>`).join('')}
          </nav>
          <button class="logout-button" id="logoutBtn">Logout</button>
        </aside>
        <section class="workspace">
          <header class="workspace-header">
            <div><p class="eyebrow">Backend: localhost:2026</p><h2>${titleFor(state.view)}</h2></div>
            <div class="user-pill">${escapeHtml(state.user.username)} · ${roleName(role())}</div>
          </header>
          <div id="screen"><div class="empty-panel">Loading...</div></div>
        </section>
      </main>
    `;
    document.getElementById('logoutBtn').onclick = logout;
    loadScreen();
  }

  function defaultView() {
    if (role() === 'ADMIN') return 'admin';
    if (role() === 'FARMER') return 'farmer';
    if (role() === 'EXPERT') return 'expert';
    return 'market';
  }

  function menuForRole() {
    if (role() === 'ADMIN') return [
      ['admin', 'Overview'], ['users', 'Users'], ['schemes', 'Schemes'], ['reports', 'Reports'], ['guidance-manage', 'Guidance'],
    ].map(toMenu);
    if (role() === 'FARMER') return [
      ['farmer', 'Overview'], ['listings', 'Listings'], ['farmer-offers', 'Offers'], ['schemes', 'Schemes'], ['guidance', 'Guidance'],
    ].map(toMenu);
    if (role() === 'EXPERT') return [
      ['expert', 'Publish Advice'], ['guidance', 'Guidance'], ['schemes', 'Schemes'], ['market', 'Marketplace'],
    ].map(toMenu);
    return [['market', 'Marketplace'], ['my-offers', 'My Offers'], ['schemes', 'Schemes'], ['guidance', 'Guidance']].map(toMenu);
  }

  function toMenu([key, label]) {
    return { key, label };
  }

  function titleFor(view) {
    return ({
      admin: 'Admin Control Center',
      users: 'User Management',
      schemes: 'Schemes and Sector Opportunities',
      reports: 'Reports and Moderation',
      'guidance-manage': 'Guidance Content Management',
      farmer: 'Farmer Livelihood Dashboard',
      listings: 'Crop Listing Management',
      'farmer-offers': 'Farmer Offer Center',
      guidance: 'Expert Guidance',
      expert: 'Agricultural Expert Desk',
      market: 'Marketplace and Public Engagement',
      'my-offers': 'My Offers',
    })[view] || 'Dashboard';
  }

  async function loadScreen() {
    const screen = document.getElementById('screen');
    try {
      if (state.view === 'market') return market(screen);
      if (state.view === 'my-offers') return myOffers(screen);
      if (state.view === 'farmer') return farmerOverview(screen);
      if (state.view === 'listings') return listings(screen);
      if (state.view === 'farmer-offers') return farmerOffers(screen);
      if (state.view === 'guidance') return guidance(screen, false);
      if (state.view === 'guidance-manage' || state.view === 'expert') return guidance(screen, true);
      if (state.view === 'schemes') return schemes(screen, role() === 'ADMIN');
      if (state.view === 'admin') return adminOverview(screen);
      if (state.view === 'users') return users(screen);
      if (state.view === 'reports') return reports(screen);
    } catch (error) {
      screen.innerHTML = `<div class="empty-panel">${escapeHtml(error.message)}</div>`;
    }
  }

  async function market(screen) {
    const products = await api('/products');
    screen.innerHTML = `
      <div class="toolbar"><div class="search-box"><input id="searchInput" placeholder="Search crops" /></div></div>
      <div class="card-grid" id="cards"></div>
    `;
    const renderCards = () => {
      const query = document.getElementById('searchInput').value.toLowerCase();
      document.getElementById('cards').innerHTML = products
        .filter((p) => p.name.toLowerCase().includes(query))
        .map((p) => `
          <article class="data-card">
            <div class="card-topline"><span class="badge">${p.category}</span><button class="icon-button danger" data-report="${p.id}">!</button></div>
            <h3>${escapeHtml(p.name)}</h3>
            <p>Farmer: ${escapeHtml(p.farmerName)}</p>
            <div class="price-row"><strong>${money(p.price)}/kg</strong><span>${p.quantity} kg</span></div>
            <button class="solid-button full" data-offer="${p.id}">Negotiate</button>
          </article>
        `).join('') || '<div class="empty-panel">No products found.</div>';
    };
    renderCards();
    document.getElementById('searchInput').oninput = renderCards;
    screen.onclick = async (event) => {
      const offerId = event.target.dataset.offer;
      const reportId = event.target.dataset.report;
      if (offerId) {
        const product = products.find((p) => String(p.id) === offerId);
        const price = prompt(`Offer price for ${product.name}`);
        const quantity = prompt('Quantity in kg');
        if (price && quantity) {
          await api('/offers', { method: 'POST', body: JSON.stringify({ productId: product.id, buyerId: state.user.id, offeredPrice: Number(price), quantity: Number(quantity), status: 'PENDING' }) });
          toast('Offer submitted.');
        }
      }
      if (reportId) {
        const reason = prompt('Reason for report');
        if (reason) {
          await api('/reports', { method: 'POST', body: JSON.stringify({ productId: Number(reportId), reporterId: state.user.id, reason, status: 'PENDING' }) });
          toast('Report submitted.');
        }
      }
    };
  }

  async function myOffers(screen) {
    const offers = await api(`/offers/buyer/${state.user.id}`);
    screen.innerHTML = listRows(offers, (o) => [`Product #${o.productId}`, `${money(o.offeredPrice)}/kg · ${o.quantity} kg`, o.status]);
  }

  async function farmerOverview(screen) {
    const products = await api(`/products/farmer/${state.user.username}`);
    const guidanceItems = await api('/suggestions');
    screen.innerHTML = `
      <section class="overview-grid">
        ${metric('Crop listings', products.length)}
        ${metric('Expert guidance', guidanceItems.length)}
        ${metric('Role', roleName(role()))}
      </section>
    `;
  }

  function metric(label, value) {
    return `<article class="metric-card"><span>${label}</span><strong>${escapeHtml(value)}</strong></article>`;
  }

  async function listings(screen) {
    const products = await api(`/products/farmer/${state.user.username}`);
    screen.innerHTML = `
      <section class="split-layout">
        <form class="action-panel stack-form" id="listingForm">
          <h3>Add harvest listing</h3>
          <label>Crop name<input name="name" required /></label>
          <label>Price per kg<input name="price" type="number" required /></label>
          <label>Quantity kg<input name="quantity" type="number" required /></label>
          <label>Category<select name="category">${categories.map((c) => `<option>${c}</option>`).join('')}</select></label>
          <button class="solid-button full">Publish Listing</button>
        </form>
        <div class="card-grid">
          ${products.map((p) => `<article class="data-card"><span class="badge">${p.category}</span><h3>${escapeHtml(p.name)}</h3><p>${money(p.price)}/kg · ${p.quantity} kg</p><button class="danger-button" data-delete-product="${p.id}">Delete</button></article>`).join('') || '<div class="empty-panel">No listings yet.</div>'}
        </div>
      </section>
    `;
    document.getElementById('listingForm').onsubmit = async (event) => {
      event.preventDefault();
      const data = formData(event.target);
      await api('/products', { method: 'POST', body: JSON.stringify({ ...data, price: Number(data.price), quantity: Number(data.quantity), farmerName: state.user.username }) });
      loadScreen();
    };
    screen.onclick = async (event) => {
      if (event.target.dataset.deleteProduct) {
        await api(`/products/${event.target.dataset.deleteProduct}`, { method: 'DELETE' });
        loadScreen();
      }
    };
  }

  async function farmerOffers(screen) {
    const products = await api(`/products/farmer/${state.user.username}`);
    const groups = await Promise.all(products.map(async (p) => (await api(`/offers/product/${p.id}`)).map((o) => ({ ...o, productName: p.name }))));
    const offers = groups.flat();
    screen.innerHTML = listRows(offers, (o) => [o.productName, `Buyer #${o.buyerId} · ${money(o.offeredPrice)}/kg · ${o.quantity} kg`, o.status, o.id]);
    screen.onclick = async (event) => {
      const id = event.target.dataset.offerStatus;
      const status = event.target.dataset.status;
      if (id) {
        await api(`/offers/${id}/status?status=${status}`, { method: 'PUT' });
        loadScreen();
      }
    };
  }

  async function guidance(screen, canManage) {
    const items = await api('/suggestions');
    screen.innerHTML = `
      ${canManage ? `<form class="action-panel stack-form" id="guidanceForm"><h3>Publish advice</h3><label>Advice<textarea name="advice" required rows="5"></textarea></label><button class="solid-button full">Publish</button></form><br />` : ''}
      ${listRows(items, (s) => [s.expertName || 'Expert', s.advice, canManage ? 'DELETE' : ''])}
    `;
    if (canManage) {
      document.getElementById('guidanceForm').onsubmit = async (event) => {
        event.preventDefault();
        const data = formData(event.target);
        await api('/suggestions', { method: 'POST', body: JSON.stringify({ advice: data.advice, expertName: state.user.username }) });
        loadScreen();
      };
    }
  }

  async function schemes(screen, canManage) {
    const items = await api('/schemes');
    screen.innerHTML = `
      ${canManage ? `<form class="action-panel stack-form" id="schemeForm"><h3>Add scheme</h3><label>Name<input name="name" required /></label><label>Category<input name="category" value="SUBSIDY" /></label><label>Description<textarea name="description" required></textarea></label><label>Eligibility<input name="eligibility" /></label><label>Link<input name="link" /></label><button class="solid-button full">Publish</button></form><br />` : ''}
      <div class="card-grid">${items.map((s) => `<article class="data-card"><span class="badge">${escapeHtml(s.category || 'GENERAL')}</span><h3>${escapeHtml(s.name)}</h3><p>${escapeHtml(s.description)}</p>${s.eligibility ? `<small>Eligibility: ${escapeHtml(s.eligibility)}</small>` : ''}${canManage ? `<br /><button class="danger-button" data-delete-scheme="${s.id}">Delete</button>` : ''}</article>`).join('') || '<div class="empty-panel">No schemes yet.</div>'}</div>
    `;
    if (canManage) {
      document.getElementById('schemeForm').onsubmit = async (event) => {
        event.preventDefault();
        await api('/schemes', { method: 'POST', body: JSON.stringify(formData(event.target)) });
        loadScreen();
      };
      screen.onclick = async (event) => {
        if (event.target.dataset.deleteScheme) {
          await api(`/schemes/${event.target.dataset.deleteScheme}`, { method: 'DELETE' });
          loadScreen();
        }
      };
    }
  }

  async function adminOverview(screen) {
    const [usersData, reportsData, pendingData] = await Promise.all([api('/admin/users'), api('/reports'), api('/admin/pending')]);
    screen.innerHTML = `<section class="overview-grid">${metric('Users', usersData.length)}${metric('Open reports', reportsData.filter((r) => r.status === 'PENDING').length)}${metric('Admin approvals', pendingData.length)}</section>`;
  }

  async function users(screen) {
    const items = await api('/admin/users');
    screen.innerHTML = listRows(items, (u) => [u.username, `${u.email} · ${u.role}`, u.approved ? 'ACTIVE' : 'PENDING', u.id]);
    screen.onclick = async (event) => {
      if (event.target.dataset.approve) {
        await api(`/admin/approve/${event.target.dataset.approve}`, { method: 'PUT' });
        loadScreen();
      }
      if (event.target.dataset.deleteUser) {
        await api(`/admin/users/${event.target.dataset.deleteUser}`, { method: 'DELETE' });
        loadScreen();
      }
    };
  }

  async function reports(screen) {
    const items = await api('/reports');
    screen.innerHTML = listRows(items, (r) => [`Report #${r.id} · Product #${r.productId}`, r.reason, r.status, r.id]);
    screen.onclick = async (event) => {
      if (event.target.dataset.resolve) {
        await api(`/reports/${event.target.dataset.resolve}/resolve`, { method: 'PUT' });
        loadScreen();
      }
    };
  }

  function listRows(items, mapper) {
    if (!items.length) return '<div class="empty-panel">No records yet.</div>';
    return `<div class="list-panel">${items.map((item) => {
      const [title, meta, status, id] = mapper(item);
      const actions = actionButtons(status, id);
      return `<div class="wide-row"><div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(meta)}</span></div><div class="row-actions"><span class="status ${String(status).toLowerCase()}">${escapeHtml(status)}</span>${actions}</div></div>`;
    }).join('')}</div>`;
  }

  function actionButtons(status, id) {
    if (!id) return '';
    if (state.view === 'farmer-offers' && status === 'PENDING') return `<button class="mini success" data-offer-status="${id}" data-status="ACCEPTED">Accept</button><button class="mini danger" data-offer-status="${id}" data-status="REJECTED">Reject</button>`;
    if (state.view === 'users') return `${status === 'PENDING' ? `<button class="mini success" data-approve="${id}">Approve</button>` : ''}<button class="mini danger" data-delete-user="${id}">Delete</button>`;
    if (state.view === 'reports' && status === 'PENDING') return `<button class="mini success" data-resolve="${id}">Resolve</button>`;
    return '';
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    state.token = null;
    state.user = null;
    state.view = 'home';
    render();
  }

  function render() {
    if (state.user && state.token) dashboard();
    else publicPage();
  }

  document.addEventListener('click', (event) => {
    const authMode = event.target.dataset.authMode;
    if (authMode) renderAuth(authMode);
    const view = event.target.dataset.view;
    if (view) setView(view);
  });

  render();
})();
