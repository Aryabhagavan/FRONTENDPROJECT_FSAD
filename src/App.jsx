import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Check,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  Handshake,
  Leaf,
  LogIn,
  LogOut,
  Megaphone,
  Package,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sprout,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { AuthProvider, useAuth } from './AuthContext';
import {
  addProduct,
  addScheme,
  approveUser,
  createOffer,
  createReport,
  deleteProduct,
  deleteScheme,
  deleteSuggestion,
  deleteUser,
  getAllUsers,
  getFarmerProducts,
  getOffersByBuyer,
  getOffersByProduct,
  getPendingAdmins,
  getProducts,
  getProductsByCategory,
  getReports,
  getSchemes,
  getSuggestions,
  postSuggestion,
  resolveReport,
  updateOfferStatus,
} from './services/api';

const categories = ['GRAINS', 'FRUITS', 'VEGETABLES', 'SPICES'];

function App() {
  return (
    <AuthProvider>
      <NspireApp />
    </AuthProvider>
  );
}

function NspireApp() {
  const auth = useAuth();
  const role = getRole(auth.user);
  const [view, setView] = useState('home');

  useEffect(() => {
    if (auth.isAuthenticated) {
      setView(defaultView(role));
    }
  }, [auth.isAuthenticated, role]);

  if (auth.loading) {
    return <FullScreenStatus label="Preparing platform" />;
  }

  if (!auth.isAuthenticated) {
    return <PublicPortal view={view} setView={setView} />;
  }

  return <Dashboard role={role} />;
}

function PublicPortal({ view, setView }) {
  const [openAuth, setOpenAuth] = useState(view === 'login' ? 'login' : 'register');
  const [products, setProducts] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOpenAuth(view === 'login' ? 'login' : 'register');
  }, [view]);

  useEffect(() => {
    Promise.all([getProducts(), getSchemes(), getSuggestions()])
      .then(([productRes, schemeRes, suggestionRes]) => {
        setProducts(productRes.data);
        setSchemes(schemeRes.data);
        setSuggestions(suggestionRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="public-shell">
      <section className="hero-band">
        <nav className="topbar">
          <div className="brand-mark">
            <Sprout size={22} />
            <span>Nspire Farming Society</span>
          </div>
          <div className="top-actions">
            <button className="ghost-button" onClick={() => setView('login')}>Sign in</button>
            <button className="solid-button" onClick={() => setView('register')}>Join platform</button>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Farmer awareness and sector support</p>
            <h1>Nspire Farming Society</h1>
            <p className="hero-text">
              A connected platform where farmers access resources, experts share guidance,
              admins verify content, and the public learns why farming matters.
            </p>
            <div className="hero-actions">
              <button className="solid-button large" onClick={() => setView('register')}>
                Start now <ChevronRight size={18} />
              </button>
              <button className="ghost-button large" onClick={() => setView('login')}>
                Existing user <LogIn size={18} />
              </button>
            </div>
          </div>

          <AuthPanel mode={openAuth} setMode={setOpenAuth} />
        </div>
      </section>

      <section className="content-band">
        <SectionHeader
          icon={Activity}
          title="Live Platform Preview"
          subtitle="Public visitors can explore farming resources before joining."
        />
        {loading ? (
          <PanelStatus label="Loading public resources" />
        ) : (
          <div className="preview-grid">
            <PreviewPanel title="Fresh Marketplace" icon={Package} count={products.length}>
              {products.slice(0, 3).map((item) => (
                <CompactRow key={item.id} title={item.name} meta={`${item.category} • Rs ${item.price}/kg`} />
              ))}
            </PreviewPanel>
            <PreviewPanel title="Support Schemes" icon={BookOpen} count={schemes.length}>
              {schemes.slice(0, 3).map((item) => (
                <CompactRow key={item.id} title={item.name} meta={item.category || 'GENERAL'} />
              ))}
            </PreviewPanel>
            <PreviewPanel title="Expert Advice" icon={GraduationCap} count={suggestions.length}>
              {suggestions.slice(0, 3).map((item) => (
                <CompactRow key={item.id} title={item.advice} meta={item.expertName || 'Expert'} />
              ))}
            </PreviewPanel>
          </div>
        )}
      </section>

      <section className="content-band sectors">
        {[
          ['Farmers', 'List produce, review offers, read expert advice, and discover livelihood schemes.', Leaf],
          ['Experts', 'Publish educational guidance and support farmers with timely recommendations.', GraduationCap],
          ['Admins', 'Manage schemes, users, reports, and platform data quality.', ShieldCheck],
          ['Public', 'Explore farming content, schemes, discussions, and responsible marketplace activity.', Handshake],
        ].map(([title, text, Icon]) => (
          <article className="sector-card" key={title}>
            <Icon size={24} />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

function AuthPanel({ mode, setMode }) {
  const auth = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'BUYER' });
  const [captcha, setCaptcha] = useState(() => createCaptcha());
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const refreshCaptcha = () => {
    setCaptcha(createCaptcha());
    setCaptchaAnswer('');
  };

  useEffect(() => {
    if (mode === 'login') {
      refreshCaptcha();
    }
  }, [mode]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    if (mode === 'login' && captchaAnswer.trim() !== captcha.answer) {
      setMessage('Captcha answer is incorrect. Try again.');
      refreshCaptcha();
      setBusy(false);
      return;
    }
    const result = mode === 'login'
      ? await auth.login({ username: form.username, password: form.password })
      : await auth.register(form);

    if (!result.success) {
      setMessage(result.message);
    } else if (mode === 'register') {
      setMessage('Registration complete. Sign in to continue.');
      setMode('login');
    }
    setBusy(false);
  };

  return (
    <section className="auth-card">
      <div className="segmented">
        <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
        <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
      </div>

      <form onSubmit={submit} className="stack-form">
        <label>
          Username
          <input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </label>
        {mode === 'register' && (
          <>
            <label>
              Gmail
              <input required type="email" value={form.email} placeholder="name@gmail.com" onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label>
              Role
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="BUYER">Public</option>
                <option value="FARMER">Farmer</option>
                <option value="EXPERT">Agricultural Expert</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
          </>
        )}
        <label>
          Password
          <input required type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        {mode === 'login' && (
          <label>
            Captcha
            <div className="captcha-row">
              <strong>{captcha.question} =</strong>
              <input required inputMode="numeric" autoComplete="off" value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} />
              <button className="mini" type="button" onClick={refreshCaptcha}>New</button>
            </div>
          </label>
        )}
        {message && <p className="form-message">{message}</p>}
        <button className="solid-button full" disabled={busy}>
          {busy ? 'Please wait...' : mode === 'login' ? 'Access Dashboard' : 'Create Account'}
        </button>
      </form>
    </section>
  );
}

function Dashboard({ role }) {
  const auth = useAuth();
  const [active, setActive] = useState(defaultView(role));
  const menu = menuForRole(role);

  useEffect(() => {
    setActive(defaultView(role));
  }, [role]);

  return (
    <main className="app-shell">
      <aside className="side-panel">
        <div className="brand-block">
          <Sprout size={24} />
          <div>
            <strong>Nspire Farming</strong>
            <span>{roleLabel(role)} Workspace</span>
          </div>
        </div>

        <nav className="nav-list">
          {menu.map((item) => (
            <button key={item.key} className={active === item.key ? 'active' : ''} onClick={() => setActive(item.key)}>
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <button className="logout-button" onClick={auth.logout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <section className="workspace">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">Connected backend at localhost:2026</p>
            <h2>{dashboardTitle(active)}</h2>
          </div>
          <div className="user-pill">
            <Users size={16} />
            {auth.user?.username} · {roleLabel(role)}
          </div>
        </header>

        {active === 'market' && <Marketplace />}
        {active === 'offers' && <MyOffers />}
        {active === 'farmer-home' && <FarmerHome />}
        {active === 'listings' && <FarmerListings />}
        {active === 'farmer-offers' && <FarmerOfferCenter />}
        {active === 'guidance' && (role === 'ADMIN' ? <ExpertDesk /> : <Guidance />)}
        {active === 'schemes' && <Schemes canManage={role === 'ADMIN'} />}
        {active === 'expert' && <ExpertDesk />}
        {active === 'admin' && <AdminOverview />}
        {active === 'users' && <AdminUsers />}
        {active === 'reports' && <ReportsCenter />}
      </section>
    </main>
  );
}

function Marketplace() {
  const auth = useAuth();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('ALL');
  const [query, setQuery] = useState('');
  const [offerProduct, setOfferProduct] = useState(null);
  const [offer, setOffer] = useState({ offeredPrice: '', quantity: '' });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const request = category === 'ALL' ? getProducts() : getProductsByCategory(category);
    request.then((res) => setProducts(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, [category]);

  const filtered = products.filter((product) => product.name?.toLowerCase().includes(query.toLowerCase()));

  const submitOffer = async (event) => {
    event.preventDefault();
    await createOffer({
      productId: offerProduct.id,
      buyerId: auth.user.id,
      offeredPrice: Number(offer.offeredPrice),
      quantity: Number(offer.quantity),
      status: 'PENDING',
    });
    setOfferProduct(null);
    setOffer({ offeredPrice: '', quantity: '' });
  };

  const reportProduct = async (product) => {
    const reason = window.prompt(`Report ${product.name}. Enter reason:`);
    if (reason) {
      await createReport({ productId: product.id, reporterId: auth.user.id, reason, status: 'PENDING' });
      alert('Report sent to admin.');
    }
  };

  return (
    <section>
      <Toolbar>
        <div className="search-box">
          <Search size={17} />
          <input placeholder="Search crops" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="ALL">All categories</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <button className="icon-button" onClick={load} title="Refresh"><RefreshCcw size={18} /></button>
      </Toolbar>

      {loading ? <PanelStatus label="Loading marketplace" /> : (
        <div className="card-grid">
          {filtered.map((product) => (
            <article className="data-card product-card" key={product.id}>
              <div className="card-topline">
                <span className="badge">{product.category}</span>
                <button className="icon-button danger" onClick={() => reportProduct(product)} title="Report product">
                  <AlertTriangle size={16} />
                </button>
              </div>
              <h3>{product.name}</h3>
              <p>Farmer: {product.farmerName}</p>
              <div className="price-row">
                <strong>Rs {product.price}/kg</strong>
                <span>{product.quantity} kg</span>
              </div>
              <button className="solid-button full" onClick={() => setOfferProduct(product)}>
                Negotiate Offer
              </button>
            </article>
          ))}
        </div>
      )}

      {offerProduct && (
        <Modal title={`Offer for ${offerProduct.name}`} onClose={() => setOfferProduct(null)}>
          <form className="stack-form" onSubmit={submitOffer}>
            <label>Offer price per kg<input required type="number" value={offer.offeredPrice} onChange={(e) => setOffer({ ...offer, offeredPrice: e.target.value })} /></label>
            <label>Quantity<input required type="number" max={offerProduct.quantity} value={offer.quantity} onChange={(e) => setOffer({ ...offer, quantity: e.target.value })} /></label>
            <button className="solid-button full">Send Offer</button>
          </form>
        </Modal>
      )}
    </section>
  );
}

function MyOffers() {
  const auth = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getOffersByBuyer(auth.user.id).then((res) => setOffers(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  return loading ? <PanelStatus label="Loading offers" /> : (
    <ListPanel
      empty="No offers yet."
      items={offers}
      render={(offer) => (
        <div className="wide-row" key={offer.id}>
          <div>
            <strong>Product #{offer.productId}</strong>
            <span>Rs {offer.offeredPrice}/kg · {offer.quantity} kg</span>
          </div>
          <StatusBadge status={offer.status} />
        </div>
      )}
    />
  );
}

function FarmerHome() {
  const auth = useAuth();
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    async function load() {
      const [productRes, suggestionRes] = await Promise.all([
        getFarmerProducts(auth.user.username),
        getSuggestions(),
      ]);
      setProducts(productRes.data);
      setSuggestions(suggestionRes.data);
      const offerGroups = await Promise.all(productRes.data.map((product) => getOffersByProduct(product.id)));
      setOffers(offerGroups.flatMap((res) => res.data));
    }
    load();
  }, []);

  return (
    <section className="overview-grid">
      <MetricCard icon={Package} label="Crop listings" value={products.length} />
      <MetricCard icon={Handshake} label="Pending offers" value={offers.filter((o) => o.status === 'PENDING').length} />
      <MetricCard icon={BookOpen} label="Expert resources" value={suggestions.length} />
      <Guidance compact />
    </section>
  );
}

function FarmerListings() {
  const auth = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', price: '', quantity: '', category: 'GRAINS' });

  const load = () => {
    setLoading(true);
    getFarmerProducts(auth.user.username).then((res) => setProducts(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async (event) => {
    event.preventDefault();
    await addProduct({
      ...form,
      price: Number(form.price),
      quantity: Number(form.quantity),
      farmerName: auth.user.username,
    });
    setForm({ name: '', price: '', quantity: '', category: 'GRAINS' });
    load();
  };

  const remove = async (id) => {
    await deleteProduct(id);
    load();
  };

  return (
    <section className="split-layout">
      <form className="action-panel stack-form" onSubmit={submit}>
        <h3>Add harvest listing</h3>
        <label>Crop name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label>Price per kg<input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
        <label>Quantity kg<input required type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></label>
        <label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <button className="solid-button full"><Plus size={17} /> Publish Listing</button>
      </form>

      {loading ? <PanelStatus label="Loading listings" /> : (
        <div className="card-grid">
          {products.map((product) => (
            <article className="data-card" key={product.id}>
              <span className="badge">{product.category}</span>
              <h3>{product.name}</h3>
              <p>Rs {product.price}/kg · {product.quantity} kg</p>
              <button className="danger-button" onClick={() => remove(product.id)}><Trash2 size={16} /> Remove</button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function FarmerOfferCenter() {
  const auth = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const productRes = await getFarmerProducts(auth.user.username);
    const grouped = await Promise.all(productRes.data.map(async (product) => {
      const offerRes = await getOffersByProduct(product.id);
      return offerRes.data.map((offer) => ({ ...offer, productName: product.name }));
    }));
    setOffers(grouped.flat());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    await updateOfferStatus(id, status);
    load();
  };

  return loading ? <PanelStatus label="Loading farmer offers" /> : (
    <ListPanel
      empty="No offers for your listings yet."
      items={offers}
      render={(offer) => (
        <div className="wide-row" key={offer.id}>
          <div>
            <strong>{offer.productName}</strong>
            <span>Buyer #{offer.buyerId} · Rs {offer.offeredPrice}/kg · {offer.quantity} kg</span>
          </div>
          {offer.status === 'PENDING' ? (
            <div className="row-actions">
              <button className="mini success" onClick={() => setStatus(offer.id, 'ACCEPTED')}><Check size={15} /> Accept</button>
              <button className="mini danger" onClick={() => setStatus(offer.id, 'REJECTED')}><X size={15} /> Reject</button>
            </div>
          ) : <StatusBadge status={offer.status} />}
        </div>
      )}
    />
  );
}

function Guidance({ compact = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSuggestions().then((res) => setItems(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PanelStatus label="Loading expert guidance" />;

  return (
    <section className={compact ? 'action-panel span-two' : ''}>
      {!compact && <SectionHeader icon={BookOpen} title="Expert Guidance" subtitle="Educational content created by agricultural experts." />}
      <ListPanel
        empty="No guidance published yet."
        items={items}
        render={(item) => (
          <div className="advice-card" key={item.id}>
            <BookOpen size={18} />
            <div>
              <strong>{item.expertName || 'Agricultural Expert'}</strong>
              <p>{item.advice}</p>
            </div>
          </div>
        )}
      />
    </section>
  );
}

function ExpertDesk() {
  const auth = useAuth();
  const [items, setItems] = useState([]);
  const [advice, setAdvice] = useState('');

  const load = () => getSuggestions().then((res) => setItems(res.data));
  useEffect(load, []);

  const submit = async (event) => {
    event.preventDefault();
    await postSuggestion({ advice, expertName: auth.user.username });
    setAdvice('');
    load();
  };

  const remove = async (id) => {
    await deleteSuggestion(id);
    load();
  };

  return (
    <section className="split-layout">
      <form className="action-panel stack-form" onSubmit={submit}>
        <h3>Publish farmer guidance</h3>
        <label>
          Advice
          <textarea required rows={8} value={advice} onChange={(e) => setAdvice(e.target.value)} />
        </label>
        <button className="solid-button full"><Megaphone size={17} /> Broadcast Guidance</button>
      </form>

      <ListPanel
        empty="No advice created yet."
        items={items}
        render={(item) => (
          <div className="wide-row" key={item.id}>
            <div>
              <strong>{item.expertName || 'Expert'}</strong>
              <span>{item.advice}</span>
            </div>
            <button className="icon-button danger" onClick={() => remove(item.id)}><Trash2 size={16} /></button>
          </div>
        )}
      />
    </section>
  );
}

function Schemes({ canManage = false }) {
  const [schemes, setSchemes] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', category: 'SUBSIDY', eligibility: '', link: '' });

  const load = () => getSchemes().then((res) => setSchemes(res.data));
  useEffect(load, []);

  const submit = async (event) => {
    event.preventDefault();
    await addScheme(form);
    setForm({ name: '', description: '', category: 'SUBSIDY', eligibility: '', link: '' });
    load();
  };

  const remove = async (id) => {
    await deleteScheme(id);
    load();
  };

  return (
    <section className={canManage ? 'split-layout' : ''}>
      {canManage && (
        <form className="action-panel stack-form" onSubmit={submit}>
          <h3>Add sector scheme</h3>
          <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {['SUBSIDY', 'LOAN', 'INSURANCE', 'TRAINING', 'MARKET'].map((item) => <option key={item}>{item}</option>)}
          </select></label>
          <label>Description<textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <label>Eligibility<input value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} /></label>
          <label>Link<input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /></label>
          <button className="solid-button full"><Plus size={17} /> Publish Scheme</button>
        </form>
      )}

      <div className="card-grid">
        {schemes.map((scheme) => (
          <article className="data-card scheme-card" key={scheme.id}>
            <span className="badge">{scheme.category || 'GENERAL'}</span>
            <h3>{scheme.name}</h3>
            <p>{scheme.description}</p>
            {scheme.eligibility && <small>Eligibility: {scheme.eligibility}</small>}
            {scheme.link && <a href={scheme.link} target="_blank" rel="noreferrer">Open official link</a>}
            {canManage && <button className="danger-button" onClick={() => remove(scheme.id)}><Trash2 size={16} /> Delete</button>}
          </article>
        ))}
      </div>
    </section>
  );
}

function AdminOverview() {
  const [data, setData] = useState({ users: [], reports: [], pending: [] });

  useEffect(() => {
    Promise.all([getAllUsers(), getReports(), getPendingAdmins()]).then(([users, reports, pending]) => {
      setData({ users: users.data, reports: reports.data, pending: pending.data });
    });
  }, []);

  return (
    <section className="overview-grid">
      <MetricCard icon={Users} label="Users" value={data.users.length} />
      <MetricCard icon={AlertTriangle} label="Open reports" value={data.reports.filter((r) => r.status === 'PENDING').length} />
      <MetricCard icon={ShieldCheck} label="Admin approvals" value={data.pending.length} />
      <MetricCard icon={Activity} label="Data status" value="Live" />
    </section>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');

  const load = () => getAllUsers().then((res) => setUsers(res.data));
  useEffect(load, []);

  const approve = async (id) => {
    await approveUser(id);
    load();
  };

  const remove = async (id) => {
    await deleteUser(id);
    load();
  };

  const filtered = users.filter((user) => `${user.username} ${user.email} ${user.role}`.toLowerCase().includes(filter.toLowerCase()));

  return (
    <section>
      <Toolbar>
        <div className="search-box">
          <Search size={17} />
          <input placeholder="Search users" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
      </Toolbar>
      <ListPanel
        empty="No users found."
        items={filtered}
        render={(user) => (
          <div className="wide-row" key={user.id}>
            <div>
              <strong>{user.username}</strong>
              <span>{user.email} · {user.role}</span>
            </div>
            <div className="row-actions">
              <StatusBadge status={user.approved ? 'ACTIVE' : 'PENDING'} />
              {!user.approved && <button className="mini success" onClick={() => approve(user.id)}>Approve</button>}
              <button className="icon-button danger" onClick={() => remove(user.id)}><Trash2 size={16} /></button>
            </div>
          </div>
        )}
      />
    </section>
  );
}

function ReportsCenter() {
  const [reports, setReports] = useState([]);
  const load = () => getReports().then((res) => setReports(res.data));
  useEffect(load, []);

  const resolve = async (id) => {
    await resolveReport(id);
    load();
  };

  return (
    <ListPanel
      empty="No reports submitted."
      items={reports}
      render={(report) => (
        <div className="wide-row" key={report.id}>
          <div>
            <strong>Report #{report.id} · Product #{report.productId}</strong>
            <span>{report.reason}</span>
          </div>
          <div className="row-actions">
            <StatusBadge status={report.status} />
            {report.status === 'PENDING' && <button className="mini success" onClick={() => resolve(report.id)}>Resolve</button>}
          </div>
        </div>
      )}
    />
  );
}

function Toolbar({ children }) {
  return <div className="toolbar">{children}</div>;
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="section-header">
      <Icon size={22} />
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function PreviewPanel({ title, icon: Icon, count, children }) {
  return (
    <article className="preview-panel">
      <div className="panel-heading">
        <Icon size={20} />
        <strong>{title}</strong>
        <span>{count}</span>
      </div>
      <div className="compact-list">{children || <p className="muted">No records yet.</p>}</div>
    </article>
  );
}

function CompactRow({ title, meta }) {
  return (
    <div className="compact-row">
      <strong>{title}</strong>
      <span>{meta}</span>
    </div>
  );
}

function ListPanel({ items, render, empty }) {
  if (!items.length) {
    return <div className="empty-panel">{empty}</div>;
  }
  return <div className="list-panel">{items.map(render)}</div>;
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <article className="metric-card">
      <Icon size={22} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function StatusBadge({ status }) {
  return <span className={`status ${String(status).toLowerCase()}`}>{status}</span>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PanelStatus({ label }) {
  return <div className="empty-panel">{label}</div>;
}

function FullScreenStatus({ label }) {
  return <div className="fullscreen-status"><Sprout size={34} /> {label}</div>;
}

function getRole(user) {
  return user?.roles?.[0]?.replace('ROLE_', '') || 'BUYER';
}

function createCaptcha() {
  const left = Math.floor(Math.random() * 8) + 2;
  const right = Math.floor(Math.random() * 8) + 2;
  return {
    question: `${left} + ${right}`,
    answer: String(left + right),
  };
}

function roleLabel(role) {
  return role === 'BUYER' ? 'Public' : role.charAt(0) + role.slice(1).toLowerCase();
}

function defaultView(role) {
  if (role === 'ADMIN') return 'admin';
  if (role === 'FARMER') return 'farmer-home';
  if (role === 'EXPERT') return 'expert';
  return 'market';
}

function menuForRole(role) {
  const common = [
    { key: 'schemes', label: 'Schemes', icon: BookOpen },
    { key: 'guidance', label: 'Guidance', icon: GraduationCap },
  ];
  if (role === 'ADMIN') {
    return [
      { key: 'admin', label: 'Overview', icon: Activity },
      { key: 'users', label: 'Users', icon: Users },
      { key: 'schemes', label: 'Schemes', icon: BookOpen },
      { key: 'reports', label: 'Reports', icon: AlertTriangle },
      { key: 'guidance', label: 'Content', icon: Megaphone },
    ];
  }
  if (role === 'FARMER') {
    return [
      { key: 'farmer-home', label: 'Overview', icon: Activity },
      { key: 'listings', label: 'Listings', icon: ClipboardList },
      { key: 'farmer-offers', label: 'Offers', icon: Handshake },
      ...common,
    ];
  }
  if (role === 'EXPERT') {
    return [
      { key: 'expert', label: 'Publish Advice', icon: Megaphone },
      ...common,
      { key: 'market', label: 'Marketplace', icon: Package },
    ];
  }
  return [
    { key: 'market', label: 'Marketplace', icon: Package },
    { key: 'offers', label: 'My Offers', icon: Handshake },
    ...common,
  ];
}

function dashboardTitle(view) {
  const titles = {
    market: 'Marketplace and Public Engagement',
    offers: 'My Negotiation Offers',
    'farmer-home': 'Farmer Livelihood Dashboard',
    listings: 'Crop Listing Management',
    'farmer-offers': 'Farmer Offer Center',
    guidance: 'Awareness and Expert Guidance',
    schemes: 'Schemes and Sector Opportunities',
    expert: 'Agricultural Expert Desk',
    admin: 'Admin Control Center',
    users: 'User Management',
    reports: 'Reports and Moderation',
  };
  return titles[view] || 'Dashboard';
}

export default App;
