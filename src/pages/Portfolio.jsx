import { useState, useEffect, useRef } from "react";
import "./Portfolio.css";

/* ─────────────────────────────────────────
   DEFAULTS
───────────────────────────────────────── */
const DEFAULT_HERO = {
  badge: "Open to New Opportunities",
  name: "Rakesh",
  role: "Civil Engineer",
  bio: "Civil Engineer with hands-on experience in AutoCAD designing, Advanced BIM Modeling (Revit Architecture & Structure), and Site Supervision. Seeking a challenging platform to contribute skills and drive company growth.",
  imageUrl: "/rakesh.jpg",
  linkedinUrl: "https://www.linkedin.com/in/rakesh-kumar-0b4467322/",
  contactEmail: "rakeshkumardangi@gmail.com",
  location: "Sector 66, Gurugram, Haryana – 122201",
  footerText: "Portfolio of Rakesh – Civil Engineer",
};

const DEFAULT_SERVICES = [
  { id: 1, icon: "🏗️", title: "Site Supervision", desc: "End-to-end on-site management, quality control, contractor coordination and timeline tracking." },
  { id: 2, icon: "📐", title: "AutoCAD Design", desc: "2D Drafting and 3D Modeling for civil and architectural projects with precision detailing." },
  { id: 3, icon: "🏢", title: "BIM Modeling", desc: "Advanced BIM in Revit Architecture & Structure — Parametric Families, Sections, Plans." },
  { id: 4, icon: "📊", title: "Structural Analysis", desc: "Etabs-based structural analysis and design for buildings and civil infrastructure." },
  { id: 5, icon: "🗺️", title: "GIS & Mapping", desc: "Site mapping and spatial analysis using QGIS and Google Earth Pro." },
  { id: 6, icon: "📏", title: "Total Station", desc: "Land surveying and setting out using Total Station instruments with high accuracy." },
];

const DEFAULT_SKILLS = {
  tech: ["Auto CAD", "Revit Architecture", "Advance Excel", "Etabs", "QGIS", "Google Earth Pro", "Total Station"],
  soft: ["Site Supervision", "Project Management", "Team Leadership", "Time Management", "Effective Communication", "Critical Thinking", "Construction Knowledge"],
  lang: ["Hindi", "English"],
};

const DEFAULT_EXPERIENCES = [
  { id: 1, role: "Site Incharge", company: "Construction Site (On-Site)", duration: "1 Year", description: "Overseeing day-to-day construction activities, coordinating with contractors, managing labour, and ensuring quality and safety standards on site." },
  { id: 2, role: "AutoCAD Designer", company: "Motihari College of Engineering", duration: "2 Years (2021 – 2023)", description: "On-campus work experience in AutoCAD designing – 2D Drafting and 3D Modeling for civil engineering projects." },
  { id: 3, role: "BIM Modeler", company: "Motihari College of Engineering", duration: "2021 – 2025", description: "Advanced BIM Modeling in Revit Architecture and Revit Structure – 3D Drafting, Parametric Families, Sections, and Plans." },
];

const DEFAULT_PROJECTS = [
  { id: 1, name: "On-Site Internship Project", location: "India", type: "On-Site", budget: "", duration: "2 Months", description: "Successfully completed a 2-month on-site internship program involving hands-on construction supervision, site management, and field execution tasks.", tags: ["Site Work", "Internship", "Construction"] },
];

const DEFAULT_CERTS = [
  { id: 1, name: "B.Tech – Civil Engineering", issuer: "Motihari College of Engineering (Govt.) | Bihar Engineering University, Patna", year: "2021–2025" },
  { id: 2, name: "Intermediate (12th)", issuer: "Bihar National Collegiate School, Patna", year: "2018–2020" },
  { id: 3, name: "Matriculation (10th)", issuer: "Anugrah Narayan High School Madanpur, Aurangabad", year: "2017–2018" },
  { id: 4, name: "Revit Architecture Training", issuer: "Training Institute", year: "Jan – Feb 2023" },
  { id: 5, name: "Etabs Internship Program", issuer: "Training Institute", year: "Mar – Jun 2024" },
  { id: 6, name: "Advance Excel with Data Visualization", issuer: "Training Institute", year: "Dec 2024 – Feb 2025" },
  { id: 7, name: "C Programming", issuer: "IIT Bombay", year: "" },
  { id: 8, name: "Total Station Operation", issuer: "Induction Program (8 weeks)", year: "" },
];

const STATS = [
  { value: "1+", label: "Year Site Incharge" },
  { value: "2+", label: "Years AutoCAD" },
  { value: "B.Tech", label: "Civil Engineering" },
  { value: "8+", label: "Certifications" },
];

const EMPTY_EXP  = { role: "", company: "", duration: "", description: "" };
const EMPTY_PROJ = { name: "", location: "", type: "", budget: "", duration: "", description: "", tags: "" };
const EMPTY_CERT = { name: "", issuer: "", year: "" };
const EMPTY_SVC  = { icon: "🔧", title: "", desc: "" };

/* ─────────────────────────────────────────
   AUTH MODAL
───────────────────────────────────────── */
function AuthModal({ onConfirm, onCancel }) {
  const [uid, setUid]         = useState("");
  const [pwd, setPwd]         = useState("");
  const [err, setErr]         = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setErr("");
    try {
      const res  = await fetch("/api/se-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: uid, password: pwd }) });
      const data = await res.json();
      if (data.ok) onConfirm();
      else { setErr(data.error || "Invalid credentials."); setUid(""); setPwd(""); }
    } catch { setErr("Connection error."); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-accent" />
        <h3 className="modal-title">Admin Access</h3>
        <p className="modal-sub">Enter credentials to edit portfolio</p>
        <form onSubmit={submit} className="modal-form">
          <input className="field" placeholder="User ID" autoFocus value={uid} onChange={(e) => setUid(e.target.value)} />
          <input className="field" type="password" placeholder="Password" value={pwd} onChange={(e) => setPwd(e.target.value)} />
          {err && <p className="field-error">{err}</p>}
          <div className="modal-btns">
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Checking…" : "Login"}</button>
            <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   HERO EDIT MODAL
───────────────────────────────────────── */
function HeroEditModal({ hero, onSave, onCancel }) {
  const [form, setForm] = useState({ ...hero });
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-accent" />
        <h3 className="modal-title">Edit Profile</h3>
        <div className="modal-grid">
          <input className="field" placeholder="Badge text"       value={form.badge}        onChange={f("badge")} />
          <input className="field" placeholder="Name"             value={form.name}         onChange={f("name")} />
          <input className="field" placeholder="Role / Title"     value={form.role}         onChange={f("role")} />
          <textarea className="field field-area" placeholder="Bio" value={form.bio}         onChange={f("bio")} />
          <input className="field" placeholder="Profile Image URL" value={form.imageUrl}    onChange={f("imageUrl")} />
          <input className="field" placeholder="LinkedIn URL"     value={form.linkedinUrl}  onChange={f("linkedinUrl")} />
          <input className="field" placeholder="Email"            value={form.contactEmail} onChange={f("contactEmail")} />
          <input className="field" placeholder="Location"         value={form.location}     onChange={f("location")} />
          <input className="field" placeholder="Footer text"      value={form.footerText}   onChange={f("footerText")} />
        </div>
        <div className="modal-btns" style={{ marginTop: "1rem" }}>
          <button className="btn-primary" onClick={() => onSave(form)}>Save Changes</button>
          <button className="btn-ghost"   onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   CREDENTIALS MODAL
───────────────────────────────────────── */
function CredsModal({ onClose }) {
  const [f, setF] = useState({ curId: "", curPass: "", newId: "", newPass: "" });
  const [msg, setMsg]         = useState("");
  const [loading, setLoading] = useState(false);
  const ch = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setMsg("");
    try {
      const res  = await fetch("/api/se-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: f.curId, password: f.curPass, action: "update", newId: f.newId, newPass: f.newPass }) });
      const data = await res.json();
      setMsg(data.ok ? "✅ Credentials updated!" : data.error || "Invalid current credentials.");
    } catch { setMsg("Connection error."); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-accent" />
        <h3 className="modal-title">Change Login</h3>
        <form onSubmit={submit} className="modal-form">
          <input className="field" placeholder="Current ID"       value={f.curId}   onChange={ch("curId")} />
          <input className="field" type="password" placeholder="Current Password" value={f.curPass} onChange={ch("curPass")} />
          <div className="divider" />
          <input className="field" placeholder="New ID"           value={f.newId}   onChange={ch("newId")} />
          <input className="field" type="password" placeholder="New Password"     value={f.newPass} onChange={ch("newPass")} />
          {msg && <p className="field-error" style={{ color: msg.startsWith("✅") ? "#22c55e" : undefined }}>{msg}</p>}
          <div className="modal-btns">
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Updating…" : "Update"}</button>
            <button type="button" className="btn-ghost" onClick={onClose}>Close</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN
───────────────────────────────────────── */
export default function Portfolio() {

  /* ── Welcome toast ── */
  const [showToast, setShowToast] = useState(true);
  useEffect(() => { const t = setTimeout(() => setShowToast(false), 4000); return () => clearTimeout(t); }, []);

  /* ── Admin ── */
  const [isAdmin,   setIsAdmin]   = useState(false);
  const [authModal, setAuthModal] = useState(null);
  const [showCreds, setShowCreds] = useState(false);
  const requireAuth = (fn) => {
    if (isAdmin) { fn(); return; }
    setAuthModal({ onConfirm: () => { setAuthModal(null); setIsAdmin(true); fn(); } });
  };

  /* ── DB ── */
  const save = (patch) => fetch("/api/se-portfolio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) }).catch(() => {});

  /* ── Hero ── */
  const [hero,        setHero]        = useState(DEFAULT_HERO);
  const [editingHero, setEditingHero] = useState(false);
  const saveHero = (form) => { setHero(form); save({ hero: form }); setEditingHero(false); };

  /* ── Services ── */
  const [services,    setServices]    = useState(DEFAULT_SERVICES);
  const [svcForm,     setSvcForm]     = useState(null);
  const saveSvc = () => {
    if (!svcForm.data.title.trim()) return;
    const u = svcForm.mode === "add"
      ? [...services, { ...svcForm.data, id: Date.now() }]
      : services.map((s) => s.id === svcForm.id ? { ...svcForm.data, id: svcForm.id } : s);
    setServices(u); setSvcForm(null); save({ services: u });
  };
  const deleteSvc = (id)  => requireAuth(() => { const u = services.filter((s) => s.id !== id); setServices(u); save({ services: u }); });
  const editSvc   = (svc) => requireAuth(() => setSvcForm({ mode: "edit", id: svc.id, data: { ...svc } }));
  const addSvc    = ()    => requireAuth(() => setSvcForm({ mode: "add", data: { ...EMPTY_SVC } }));

  /* ── Skills ── */
  const [skills,    setSkills]    = useState(DEFAULT_SKILLS);
  const [skillInput, setSkillInput] = useState({ cat: "", val: "" });

  const addSkill = (cat) => {
    const v = skillInput.val.trim();
    if (!v || skills[cat].some((s) => s.toLowerCase() === v.toLowerCase())) return;
    const u = { ...skills, [cat]: [...skills[cat], v] };
    setSkills(u); save({ skills: u }); setSkillInput({ cat: "", val: "" });
  };
  const delSkill = (cat, i) => requireAuth(() => {
    const u = { ...skills, [cat]: skills[cat].filter((_, idx) => idx !== i) };
    setSkills(u); save({ skills: u });
  });

  /* ── Experience ── */
  const [experiences, setExperiences] = useState(DEFAULT_EXPERIENCES);
  const [expForm,     setExpForm]     = useState(null);
  const saveExp = () => {
    const { role, company, duration } = expForm.data;
    if (!role.trim() || !company.trim() || !duration.trim()) return;
    const u = expForm.mode === "add"
      ? [...experiences, { ...expForm.data, id: Date.now() }]
      : experiences.map((e) => e.id === expForm.id ? { ...expForm.data, id: expForm.id } : e);
    setExperiences(u); setExpForm(null); save({ experiences: u });
  };
  const delExp  = (id)  => requireAuth(() => { const u = experiences.filter((e) => e.id !== id); setExperiences(u); save({ experiences: u }); });
  const editExp = (exp) => requireAuth(() => setExpForm({ mode: "edit", id: exp.id, data: { ...exp } }));
  const addExp  = ()    => requireAuth(() => setExpForm({ mode: "add", data: { ...EMPTY_EXP } }));

  /* ── Projects ── */
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [projForm, setProjForm] = useState(null);
  const saveProj = () => {
    if (!projForm.data.name.trim() || !projForm.data.description.trim()) return;
    const tags = typeof projForm.data.tags === "string"
      ? projForm.data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : projForm.data.tags;
    const u = projForm.mode === "add"
      ? [...projects, { ...projForm.data, tags, id: Date.now() }]
      : projects.map((p) => p.id === projForm.id ? { ...projForm.data, tags, id: projForm.id } : p);
    setProjects(u); setProjForm(null); save({ projects: u });
  };
  const delProj  = (id)   => requireAuth(() => { const u = projects.filter((p) => p.id !== id); setProjects(u); save({ projects: u }); });
  const editProj = (proj) => requireAuth(() => setProjForm({ mode: "edit", id: proj.id, data: { ...proj, tags: proj.tags.join(", ") } }));
  const addProj  = ()     => requireAuth(() => setProjForm({ mode: "add", data: { ...EMPTY_PROJ } }));

  /* ── Certifications ── */
  const [certs,    setCerts]    = useState(DEFAULT_CERTS);
  const [certForm, setCertForm] = useState(null);
  const saveCert = () => {
    if (!certForm.data.name.trim()) return;
    const u = certForm.mode === "add"
      ? [...certs, { ...certForm.data, id: Date.now() }]
      : certs.map((c) => c.id === certForm.id ? { ...certForm.data, id: certForm.id } : c);
    setCerts(u); setCertForm(null); save({ certs: u });
  };
  const delCert  = (id)   => requireAuth(() => { const u = certs.filter((c) => c.id !== id); setCerts(u); save({ certs: u }); });
  const editCert = (cert) => requireAuth(() => setCertForm({ mode: "edit", id: cert.id, data: { ...cert } }));
  const addCert  = ()     => requireAuth(() => setCertForm({ mode: "add", data: { ...EMPTY_CERT } }));

  /* ── Resume ── */
  const [resume,      setResume]      = useState(null);
  const [uploading,   setUploading]   = useState(false);
  const [uploadErr,   setUploadErr]   = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    fetch("/api/se-resume-meta").then((r) => r.ok ? r.json() : null).then((d) => { if (d?.url) setResume(d); }).catch(() => {});
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true); setUploadErr("");
    try {
      const res = await fetch("/api/se-upload-resume", { method: "PUT", headers: { "x-filename": file.name, "content-type": file.type }, body: file });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResume({ name: file.name, url: data.url, size: file.size > 1048576 ? (file.size / 1048576).toFixed(2) + " MB" : (file.size / 1024).toFixed(1) + " KB", uploadedAt: new Date().toLocaleDateString() });
    } catch { setUploadErr("Upload failed. Try again."); }
    setUploading(false); e.target.value = "";
  };
  const downloadResume = () => { const a = document.createElement("a"); a.href = "/api/se-resume-file"; a.download = resume?.name || "resume.pdf"; document.body.appendChild(a); a.click(); document.body.removeChild(a); };
  const deleteResume   = () => requireAuth(async () => { await fetch("/api/se-upload-resume", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: resume?.url }) }).catch(() => {}); setResume(null); });

  /* ── Phone ── */
  const [phone,     setPhone]     = useState("+91 8797188875");
  const [editPhone, setEditPhone] = useState(false);
  const [phoneVal,  setPhoneVal]  = useState("");
  const phoneRef = useRef(null);
  const savePhone = () => { const v = phoneVal.trim(); if (v) { setPhone(v); save({ phone: v }); } setEditPhone(false); };

  /* ── Contact ── */
  const [cf, setCf]           = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent]       = useState(false);
  const [sending, setSending] = useState(false);
  const [cfErr, setCfErr]     = useState("");
  const sendMsg = async (e) => {
    e.preventDefault(); setSending(true); setCfErr("");
    try {
      const res = await fetch("/api/se-contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cf) });
      if (!res.ok) throw new Error();
      setCf({ name: "", email: "", subject: "", message: "" }); setSent(true); setTimeout(() => setSent(false), 4000);
    } catch { setCfErr("Failed to send. Please try again."); }
    setSending(false);
  };

  /* ── Load DB ── */
  useEffect(() => {
    fetch("/api/se-portfolio").then((r) => r.ok ? r.json() : null).then((d) => {
      if (!d) return;
      if (d.hero)                setHero((p) => ({ ...p, ...d.hero }));
      if (d.skills)              setSkills((p) => ({ ...p, ...d.skills }));
      if (d.services?.length)    setServices(d.services);
      if (d.experiences?.length) setExperiences(d.experiences);
      if (d.projects?.length)    setProjects(d.projects);
      if (d.certs?.length)       setCerts(d.certs);
      if (d.phone)               setPhone(d.phone);
    }).catch(() => {});
  }, []);

  /* ── Navbar scroll active ── */
  const [activeSection, setActiveSection] = useState("home");
  useEffect(() => {
    const handler = () => {
      const sections = ["home","services","experience","projects","skills","education","contact"];
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) { setActiveSection(id); break; }
      }
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { id: "home",       label: "Home" },
    { id: "services",   label: "Services" },
    { id: "experience", label: "Experience" },
    { id: "projects",   label: "Projects" },
    { id: "skills",     label: "Skills" },
    { id: "education",  label: "Education" },
    { id: "contact",    label: "Contact" },
  ];

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <div className="pf">

      {/* Modals */}
      {authModal    && <AuthModal     onConfirm={authModal.onConfirm} onCancel={() => setAuthModal(null)} />}
      {editingHero  && <HeroEditModal hero={hero} onSave={saveHero}   onCancel={() => setEditingHero(false)} />}
      {showCreds    && <CredsModal    onClose={() => setShowCreds(false)} />}

      {/* Admin Fab */}
      {isAdmin && (
        <div className="admin-fab">
          <button className="btn-primary" onClick={() => setEditingHero(true)}>✎ Edit</button>
          <button className="btn-ghost"   onClick={() => setShowCreds(true)}>🔐 Login</button>
        </div>
      )}

      {/* Welcome toast */}
      {showToast && (
        <div className="welcome-toast">
          <span className="toast-emoji">👋</span>
          <div>
            <p className="toast-title">Welcome!</p>
            <p className="toast-sub">Thanks for visiting {hero.name}&apos;s portfolio</p>
          </div>
          <button className="toast-close" onClick={() => setShowToast(false)}>✕</button>
        </div>
      )}

      {/* ══ NAVBAR ══ */}
      <nav className="navbar">
        <div className="nav-inner">
          <a href="#home" className="nav-logo">
            <span className="nav-logo-box">RK</span>
            <span className="nav-logo-name">{hero.name}</span>
          </a>
          <ul className="nav-links">
            {navLinks.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} className={`nav-link ${activeSection === l.id ? "active" : ""}`}>{l.label}</a>
              </li>
            ))}
          </ul>
          <div className="nav-right">
            {resume && <button className="btn-outline-sm" onClick={downloadResume}>⬇ CV</button>}
            {!isAdmin && <button className="btn-ghost-sm" onClick={() => requireAuth(() => {})}>🔒</button>}
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section id="home" className="hero">
        <div className="hero-bg-pattern" />
        <div className="hero-overlay" />
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-tag">{hero.badge}</div>
            <h1 className="hero-heading">
              {hero.name}<br />
              <span className="hero-heading-role">{hero.role}</span>
            </h1>
            <p className="hero-bio">{hero.bio}</p>
            <div className="hero-loc">📍 {hero.location}</div>
            <div className="hero-actions">
              <a href="#projects" className="btn-primary">View My Work</a>
              <a href="#contact"  className="btn-outline">Get In Touch</a>
              {resume && <button className="btn-ghost-line" onClick={downloadResume}>⬇ Download CV</button>}
            </div>
            <div className="hero-socials">
              {hero.linkedinUrl && hero.linkedinUrl.length > 25 && (
                <a href={hero.linkedinUrl} target="_blank" rel="noreferrer" className="social-pill">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                  LinkedIn
                </a>
              )}
              <a href={`mailto:${hero.contactEmail}`} className="social-pill">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Email
              </a>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-img-frame">
              <div className="hero-img-border" />
              <img src={hero.imageUrl} alt={hero.name} className="hero-img" />
              <div className="hero-img-tag">Civil Engineer</div>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="stats-strip">
          {STATS.map((s, i) => (
            <div key={i} className="stat-item">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ SERVICES ══ */}
      <section id="services" className="section dark-section">
        <div className="container">
          <div className="sec-head">
            <span className="sec-tag">What I Do</span>
            <h2 className="sec-title">My <span className="accent">Services</span></h2>
            <p className="sec-sub">Core competencies I bring to every project</p>
          </div>
          <div className="services-grid">
            {services.map((svc) => (
              <div key={svc.id} className="svc-card">
                <div className="svc-icon">{svc.icon}</div>
                <h3 className="svc-title">{svc.title}</h3>
                <p className="svc-desc">{svc.desc}</p>
                {isAdmin && (
                  <div className="card-actions">
                    <button className="icon-btn" onClick={() => editSvc(svc)}>✎</button>
                    <button className="icon-btn danger" onClick={() => deleteSvc(svc.id)}>✕</button>
                  </div>
                )}
              </div>
            ))}
            {isAdmin && !svcForm && (
              <button className="svc-add-card" onClick={addSvc}>
                <span>+</span>Add Service
              </button>
            )}
          </div>
          {svcForm && (
            <div className="inline-form">
              <h3 className="form-head">{svcForm.mode === "add" ? "Add Service" : "Edit Service"}</h3>
              <div className="form-row">
                <input className="field" placeholder="Icon emoji" value={svcForm.data.icon}  onChange={(e) => setSvcForm({ ...svcForm, data: { ...svcForm.data, icon: e.target.value } })} style={{ width: 80 }} />
                <input className="field" placeholder="Service title *" value={svcForm.data.title} onChange={(e) => setSvcForm({ ...svcForm, data: { ...svcForm.data, title: e.target.value } })} />
              </div>
              <textarea className="field field-area" placeholder="Description" value={svcForm.data.desc} onChange={(e) => setSvcForm({ ...svcForm, data: { ...svcForm.data, desc: e.target.value } })} />
              <div className="form-btns">
                <button className="btn-primary" onClick={saveSvc}>Save</button>
                <button className="btn-ghost"   onClick={() => setSvcForm(null)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══ EXPERIENCE ══ */}
      <section id="experience" className="section light-section">
        <div className="container">
          <div className="sec-head">
            <span className="sec-tag">Work History</span>
            <h2 className="sec-title">My <span className="accent">Experience</span></h2>
            <p className="sec-sub">Professional journey in civil engineering</p>
          </div>
          <div className="timeline">
            {experiences.map((exp, i) => (
              <div key={exp.id} className="timeline-item">
                <div className="timeline-line">
                  <div className="timeline-dot" />
                  {i < experiences.length - 1 && <div className="timeline-connector" />}
                </div>
                <div className="timeline-card">
                  <div className="timeline-head">
                    <div>
                      <h3 className="tl-role">{exp.role}</h3>
                      <p className="tl-company">{exp.company}</p>
                    </div>
                    <div className="tl-right">
                      <span className="tl-duration">{exp.duration}</span>
                      <div className="card-actions">
                        <button className="icon-btn" onClick={() => editExp(exp)}>✎</button>
                        <button className="icon-btn danger" onClick={() => delExp(exp.id)}>✕</button>
                      </div>
                    </div>
                  </div>
                  {exp.description && <p className="tl-desc">{exp.description}</p>}
                </div>
              </div>
            ))}
          </div>
          {expForm ? (
            <div className="inline-form">
              <h3 className="form-head">{expForm.mode === "add" ? "Add Experience" : "Edit Experience"}</h3>
              <div className="form-2col">
                <input className="field" placeholder="Job Title *"   value={expForm.data.role}        onChange={(e) => setExpForm({ ...expForm, data: { ...expForm.data, role: e.target.value } })} />
                <input className="field" placeholder="Company *"      value={expForm.data.company}     onChange={(e) => setExpForm({ ...expForm, data: { ...expForm.data, company: e.target.value } })} />
                <input className="field" placeholder="Duration *"     value={expForm.data.duration}    onChange={(e) => setExpForm({ ...expForm, data: { ...expForm.data, duration: e.target.value } })} />
                <textarea className="field field-area" placeholder="Description" value={expForm.data.description} onChange={(e) => setExpForm({ ...expForm, data: { ...expForm.data, description: e.target.value } })} />
              </div>
              <div className="form-btns">
                <button className="btn-primary" onClick={saveExp}>Save</button>
                <button className="btn-ghost"   onClick={() => setExpForm(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="add-btn" onClick={addExp}>+ Add Experience</button>
          )}
        </div>
      </section>

      {/* ══ PROJECTS ══ */}
      <section id="projects" className="section dark-section">
        <div className="container">
          <div className="sec-head">
            <span className="sec-tag">Portfolio</span>
            <h2 className="sec-title">Construction <span className="accent">Projects</span></h2>
            <p className="sec-sub">Key projects I have supervised and delivered</p>
          </div>
          <div className="projects-grid">
            {projects.map((proj) => (
              <div key={proj.id} className="proj-card">
                <div className="proj-type-bar">{proj.type || "Project"}</div>
                <div className="proj-body">
                  <h3 className="proj-name">{proj.name}</h3>
                  <div className="proj-meta-row">
                    {proj.location && <span className="proj-meta">📍 {proj.location}</span>}
                    {proj.budget   && <span className="proj-meta">💰 {proj.budget}</span>}
                    {proj.duration && <span className="proj-meta">🗓 {proj.duration}</span>}
                  </div>
                  <p className="proj-desc">{proj.description}</p>
                  <div className="proj-tags">
                    {(proj.tags || []).map((t) => <span key={t} className="proj-tag">{t}</span>)}
                  </div>
                </div>
                <div className="proj-footer">
                  <button className="icon-btn"        onClick={() => editProj(proj)}>✎ Edit</button>
                  <button className="icon-btn danger" onClick={() => delProj(proj.id)}>✕ Remove</button>
                </div>
              </div>
            ))}
          </div>
          {projForm ? (
            <div className="inline-form">
              <h3 className="form-head">{projForm.mode === "add" ? "Add Project" : "Edit Project"}</h3>
              <div className="form-2col">
                <input className="field" placeholder="Project Name *"         value={projForm.data.name}        onChange={(e) => setProjForm({ ...projForm, data: { ...projForm.data, name: e.target.value } })} />
                <input className="field" placeholder="Location"               value={projForm.data.location}    onChange={(e) => setProjForm({ ...projForm, data: { ...projForm.data, location: e.target.value } })} />
                <input className="field" placeholder="Type (Residential…)"    value={projForm.data.type}        onChange={(e) => setProjForm({ ...projForm, data: { ...projForm.data, type: e.target.value } })} />
                <input className="field" placeholder="Budget (₹ value)"       value={projForm.data.budget}      onChange={(e) => setProjForm({ ...projForm, data: { ...projForm.data, budget: e.target.value } })} />
                <input className="field" placeholder="Duration"               value={projForm.data.duration}    onChange={(e) => setProjForm({ ...projForm, data: { ...projForm.data, duration: e.target.value } })} />
                <textarea className="field field-area" placeholder="Description *" value={projForm.data.description} onChange={(e) => setProjForm({ ...projForm, data: { ...projForm.data, description: e.target.value } })} />
                <input className="field" placeholder="Tags (comma separated)" value={projForm.data.tags}        onChange={(e) => setProjForm({ ...projForm, data: { ...projForm.data, tags: e.target.value } })} />
              </div>
              <div className="form-btns">
                <button className="btn-primary" onClick={saveProj}>Save</button>
                <button className="btn-ghost"   onClick={() => setProjForm(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="add-btn" onClick={addProj}>+ Add Project</button>
          )}
        </div>
      </section>

      {/* ══ SKILLS ══ */}
      <section id="skills" className="section light-section">
        <div className="container">
          <div className="sec-head">
            <span className="sec-tag">Competencies</span>
            <h2 className="sec-title">Technical <span className="accent">Skills</span></h2>
            <p className="sec-sub">Tools, software and civil engineering expertise</p>
          </div>
          <div className="skills-layout">
            {[
              { key: "tech", label: "Technical Skills", icon: "💻" },
              { key: "soft", label: "Professional Skills", icon: "🤝" },
              { key: "lang", label: "Languages", icon: "🌐" },
            ].map(({ key, label, icon }) => (
              <div key={key} className="skill-group">
                <div className="skill-group-head">
                  <span>{icon}</span> {label}
                </div>
                <div className="skill-tags">
                  {skills[key].map((s, i) => (
                    <span key={s + i} className="skill-pill">
                      {s}
                      <button className="skill-del" onClick={() => delSkill(key, i)}>×</button>
                    </span>
                  ))}
                </div>
                {skillInput.cat === key ? (
                  <div className="skill-input-row">
                    <input className="field" placeholder="Add skill…" autoFocus
                      value={skillInput.val}
                      onChange={(e) => setSkillInput({ cat: key, val: e.target.value })}
                      onKeyDown={(e) => { if (e.key === "Enter") addSkill(key); if (e.key === "Escape") setSkillInput({ cat: "", val: "" }); }} />
                    <button className="btn-primary" onClick={() => addSkill(key)}>Add</button>
                    <button className="btn-ghost"   onClick={() => setSkillInput({ cat: "", val: "" })}>✕</button>
                  </div>
                ) : (
                  <button className="skill-add-btn" onClick={() => requireAuth(() => setSkillInput({ cat: key, val: "" }))}>+ Add</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ EDUCATION & CERTIFICATIONS ══ */}
      <section id="education" className="section dark-section">
        <div className="container">
          <div className="sec-head">
            <span className="sec-tag">Credentials</span>
            <h2 className="sec-title">Education &amp; <span className="accent">Certifications</span></h2>
            <p className="sec-sub">Academic background and professional training</p>
          </div>
          <div className="certs-grid">
            {certs.map((cert) => (
              <div key={cert.id} className="cert-card">
                <div className="cert-left">
                  <div className="cert-icon">🎓</div>
                </div>
                <div className="cert-body">
                  <h3 className="cert-name">{cert.name}</h3>
                  <p className="cert-issuer">{cert.issuer}</p>
                  {cert.year && <span className="cert-year">{cert.year}</span>}
                </div>
                <div className="cert-actions">
                  <button className="icon-btn" onClick={() => editCert(cert)}>✎</button>
                  <button className="icon-btn danger" onClick={() => delCert(cert.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
          {certForm ? (
            <div className="inline-form">
              <h3 className="form-head">{certForm.mode === "add" ? "Add Certification" : "Edit Certification"}</h3>
              <div className="form-2col">
                <input className="field" placeholder="Certificate / Degree *" value={certForm.data.name}   onChange={(e) => setCertForm({ ...certForm, data: { ...certForm.data, name: e.target.value } })} />
                <input className="field" placeholder="Institution / Issuer *" value={certForm.data.issuer} onChange={(e) => setCertForm({ ...certForm, data: { ...certForm.data, issuer: e.target.value } })} />
                <input className="field" placeholder="Year"                   value={certForm.data.year}   onChange={(e) => setCertForm({ ...certForm, data: { ...certForm.data, year: e.target.value } })} />
              </div>
              <div className="form-btns">
                <button className="btn-primary" onClick={saveCert}>Save</button>
                <button className="btn-ghost"   onClick={() => setCertForm(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="add-btn" onClick={addCert}>+ Add Certification</button>
          )}
        </div>
      </section>

      {/* ══ RESUME ══ */}
      <section className="section resume-band">
        <div className="container">
          <div className="resume-inner">
            <div>
              <h2 className="resume-title">Download My <span className="accent">Resume</span></h2>
              <p className="resume-sub">Get a complete overview of my qualifications and experience</p>
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} style={{ display: "none" }} />
            {resume ? (
              <div className="resume-actions">
                <button className="btn-primary" onClick={downloadResume}>⬇ Download CV</button>
                <button className="btn-outline" onClick={() => requireAuth(() => fileRef.current?.click())}>🔄 Replace</button>
                <button className="btn-danger"  onClick={deleteResume}>🗑</button>
              </div>
            ) : (
              <div className="resume-actions">
                <button className="btn-primary" onClick={() => requireAuth(() => fileRef.current?.click())} disabled={uploading}>
                  {uploading ? "Uploading…" : "📤 Upload Resume"}
                </button>
                {uploadErr && <p className="field-error">{uploadErr}</p>}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══ CONTACT ══ */}
      <section id="contact" className="section dark-section">
        <div className="container">
          <div className="sec-head">
            <span className="sec-tag">Reach Out</span>
            <h2 className="sec-title">Get In <span className="accent">Touch</span></h2>
            <p className="sec-sub">Let&apos;s discuss your next construction project</p>
          </div>
          <div className="contact-layout">
            <div className="contact-info">
              <h3 className="contact-info-title">Contact Information</h3>
              <div className="contact-cards">
                <a href={`mailto:${hero.contactEmail}`} className="contact-item">
                  <div className="contact-item-icon">📧</div>
                  <div>
                    <p className="contact-item-label">Email</p>
                    <p className="contact-item-val">{hero.contactEmail}</p>
                  </div>
                </a>
                <div className="contact-item" onClick={() => requireAuth(() => { setPhoneVal(phone); setEditPhone(true); setTimeout(() => phoneRef.current?.focus(), 50); })}>
                  <div className="contact-item-icon">📞</div>
                  <div>
                    <p className="contact-item-label">Phone</p>
                    {editPhone ? (
                      <input ref={phoneRef} className="field inline-phone" value={phoneVal}
                        onChange={(e) => setPhoneVal(e.target.value)}
                        onBlur={savePhone}
                        onKeyDown={(e) => { if (e.key === "Enter") savePhone(); if (e.key === "Escape") setEditPhone(false); }} />
                    ) : (
                      <p className="contact-item-val">{phone} <span className="edit-hint">✎</span></p>
                    )}
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-item-icon">📍</div>
                  <div>
                    <p className="contact-item-label">Location</p>
                    <p className="contact-item-val">{hero.location}</p>
                  </div>
                </div>
                {hero.linkedinUrl && hero.linkedinUrl.length > 25 && (
                  <a href={hero.linkedinUrl} target="_blank" rel="noreferrer" className="contact-item">
                    <div className="contact-item-icon">💼</div>
                    <div>
                      <p className="contact-item-label">LinkedIn</p>
                      <p className="contact-item-val">View Profile</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
            <form className="contact-form" onSubmit={sendMsg}>
              <h3 className="contact-info-title">Send a Message</h3>
              <div className="form-2col">
                <input className="field" placeholder="Your Name *"  required value={cf.name}    onChange={(e) => setCf({ ...cf, name: e.target.value })} />
                <input className="field" type="email" placeholder="Your Email *" required value={cf.email} onChange={(e) => setCf({ ...cf, email: e.target.value })} />
              </div>
              <input    className="field" placeholder="Subject"     value={cf.subject}  onChange={(e) => setCf({ ...cf, subject: e.target.value })} />
              <textarea className="field field-area contact-area"   placeholder="Your message…" required value={cf.message} onChange={(e) => setCf({ ...cf, message: e.target.value })} />
              {cfErr && <p className="field-error">{cfErr}</p>}
              <button type="submit" className="btn-primary full">
                {sending ? "Sending…" : sent ? "✅ Message Sent!" : "Send Message →"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="nav-logo-box">RK</div>
              <div>
                <p className="footer-name">{hero.name}</p>
                <p className="footer-role">{hero.role}</p>
              </div>
            </div>
            <div className="footer-links">
              {navLinks.map((l) => <a key={l.id} href={`#${l.id}`} className="footer-link">{l.label}</a>)}
            </div>
          </div>
          <div className="footer-bottom">
            <p dangerouslySetInnerHTML={{ __html: hero.footerText.replace("♥", '<span class="heart">♥</span>') }} />
            <div className="footer-dev">
              <span className="footer-dev-title">© Built by Banke Bihari · Want a portfolio like this? Contact us</span>
              <div className="footer-dev-contacts">
                <a href="mailto:bankebihari1206@gmail.com">📧 bankebihari1206@gmail.com</a>
                <a href="tel:+916200957173">📞 6200957173</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
