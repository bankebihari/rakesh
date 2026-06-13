import { useState, useEffect, useRef } from "react";
import "./Portfolio.css";

/* ─────────────────────────────────────────
   DEFAULTS  (site / civil engineer)
───────────────────────────────────────── */
const DEFAULT_HERO = {
  badge: "Open to New Projects",
  name: "Rakesh Kumar",
  role: "Site Engineer",
  bio: "Experienced site engineer with expertise in civil construction, project management, and structural supervision. Committed to delivering high-quality projects on time and within budget.",
  imageUrl: "https://cdn-icons-png.flaticon.com/512/1570/1570885.png",
  linkedinUrl: "https://www.linkedin.com/",
  contactEmail: "rakesh@email.com",
  location: "India",
  footerText: "Portfolio of Rakesh Kumar – Site Engineer",
};

const DEFAULT_SKILLS = [
  "AutoCAD", "MS Project", "Primavera P6", "Structural Analysis",
  "Concrete Technology", "Steel Structures", "Site Supervision",
  "Quality Control & QA", "Civil Construction", "Surveying",
  "Tendering & BOQ", "Project Management", "RCC Design",
  "Plumbing & Sanitation", "Waterproofing", "Safety Management",
];

const DEFAULT_EXPERIENCES = [
  { id: 1, role: "Site Engineer", company: "ABC Construction Pvt. Ltd.", duration: "Jan 2022 – Present", description: "Supervise day-to-day construction activities for residential and commercial projects. Coordinate with contractors, ensure quality standards, and maintain project timelines." },
  { id: 2, role: "Junior Site Engineer", company: "XYZ Builders", duration: "Jun 2019 – Dec 2021", description: "Assisted in supervision of G+4 residential buildings. Prepared daily progress reports and managed labor and material procurement." },
];

const DEFAULT_PROJECTS = [
  { id: 1, name: "Greenview Residency", location: "Mumbai", type: "Residential", budget: "₹3.2 Cr", duration: "20 months", description: "G+7 residential complex with 48 units. Supervised RCC work, finishing, and MEP coordination.", tags: ["RCC", "Residential", "G+7"] },
  { id: 2, name: "City Mall Expansion", location: "Pune", type: "Commercial", budget: "₹8.5 Cr", duration: "14 months", description: "Structural extension of existing mall. Managed steel erection, slab casting, and facade work.", tags: ["Commercial", "Steel Structure", "Facade"] },
  { id: 3, name: "Highway Culvert", location: "Nashik", type: "Infrastructure", budget: "₹1.1 Cr", duration: "6 months", description: "Box culvert construction for highway drainage. Managed excavation, formwork, and concrete pouring.", tags: ["Infrastructure", "Culvert", "Highway"] },
];

const DEFAULT_CERTS = [
  { id: 1, name: "Bachelor of Civil Engineering (B.E.)", issuer: "University of Mumbai", year: "2019" },
  { id: 2, name: "AutoCAD Certified Professional", issuer: "Autodesk", year: "2020" },
];

const DEFAULT_ABOUT = [
  { icon: "🏗️", text: "Specialized in <strong>RCC structures</strong> and <strong>commercial construction</strong>" },
  { icon: "📐", text: "Proficient in <strong>AutoCAD</strong> and <strong>MS Project</strong> planning" },
  { icon: "🤝", text: "Open to collaborate on <strong>large-scale civil projects</strong>" },
  { icon: "📍", text: "Based in <strong>India</strong> – available for on-site roles" },
  { icon: "📫", text: 'Reach me at <a href="mailto:rakesh@email.com" class="readme-email">rakesh@email.com</a>' },
  { icon: "⚡", text: "Fun fact: I can read a blueprint faster than most people read a menu 😄" },
];

const SKILL_COLORS = [
  "linear-gradient(135deg,#f97316,#fb923c)",
  "linear-gradient(135deg,#ea580c,#f97316)",
  "linear-gradient(135deg,#92400e,#b45309)",
  "linear-gradient(135deg,#78716c,#a8a29e)",
  "linear-gradient(135deg,#57534e,#78716c)",
  "linear-gradient(135deg,#d97706,#f59e0b)",
  "linear-gradient(135deg,#b45309,#d97706)",
  "linear-gradient(135deg,#7c2d12,#9a3412)",
  "linear-gradient(135deg,#431407,#7c2d12)",
  "linear-gradient(135deg,#c2410c,#ea580c)",
];

const EMPTY_EXP  = { role: "", company: "", duration: "", description: "" };
const EMPTY_PROJ = { name: "", location: "", type: "", budget: "", duration: "", description: "", tags: "" };
const EMPTY_CERT = { name: "", issuer: "", year: "" };

/* ─────────────────────────────────────────
   AUTH MODAL
───────────────────────────────────────── */
function AuthModal({ onConfirm, onCancel }) {
  const [uid, setUid]     = useState("");
  const [pwd, setPwd]     = useState("");
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr("");
    try {
      const res  = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: uid, password: pwd }),
      });
      const data = await res.json();
      if (data.ok) { onConfirm(); }
      else { setErr(data.error || "Invalid ID or password."); setUid(""); setPwd(""); }
    } catch {
      setErr("Connection error. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-overlay" onClick={onCancel}>
      <div className="auth-modal glass" onClick={(e) => e.stopPropagation()}>
        <h3 className="auth-title">🔒 Admin Access</h3>
        <p className="auth-sub">Enter your credentials to continue</p>
        <form onSubmit={submit} className="auth-form">
          <input className="text-input" placeholder="User ID" autoFocus value={uid} onChange={(e) => setUid(e.target.value)} />
          <input className="text-input" type="password" placeholder="Password" value={pwd} onChange={(e) => setPwd(e.target.value)} />
          {err && <p className="form-error">{err}</p>}
          <div className="form-btns">
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>{loading ? "Checking…" : "Confirm"}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
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
  const f = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="auth-overlay" onClick={onCancel}>
      <div className="auth-modal glass" style={{ maxWidth: 580, width: "92%" }} onClick={(e) => e.stopPropagation()}>
        <h3 className="auth-title">✎ Edit Site Content</h3>
        <p className="auth-sub" style={{ marginBottom: "1rem" }}>All changes save to database</p>
        <div className="form-grid">
          <input className="text-input" placeholder="Badge (e.g. Open to New Projects)"  value={form.badge}        onChange={f("badge")} />
          <input className="text-input" placeholder="Full Name"                          value={form.name}         onChange={f("name")} />
          <input className="text-input" placeholder="Title / Role (e.g. Site Engineer)"  value={form.role}         onChange={f("role")} />
          <textarea className="text-input text-area" placeholder="Bio / Intro paragraph" value={form.bio}          onChange={f("bio")} />
          <input className="text-input" placeholder="Profile Image URL"                  value={form.imageUrl}     onChange={f("imageUrl")} />
          <input className="text-input" placeholder="LinkedIn URL"                       value={form.linkedinUrl}  onChange={f("linkedinUrl")} />
          <input className="text-input" placeholder="Contact Email"                      value={form.contactEmail} onChange={f("contactEmail")} />
          <input className="text-input" placeholder="Location (e.g. Mumbai, India)"      value={form.location}     onChange={f("location")} />
          <input className="text-input" placeholder="Footer text"                        value={form.footerText}   onChange={f("footerText")} />
        </div>
        <div className="form-btns" style={{ marginTop: "1rem" }}>
          <button className="btn btn-primary btn-sm" onClick={() => onSave(form)}>💾 Save All</button>
          <button className="btn btn-ghost btn-sm"   onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   CREDENTIALS MODAL
───────────────────────────────────────── */
function CredentialsModal({ onClose }) {
  const [curId,   setCurId]   = useState("");
  const [curPass, setCurPass] = useState("");
  const [newId,   setNewId]   = useState("");
  const [newPass, setNewPass] = useState("");
  const [msg,     setMsg]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg("");
    try {
      const res  = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: curId, password: curPass, action: "update", newId, newPass }),
      });
      const data = await res.json();
      setMsg(data.ok ? "✅ Credentials updated!" : data.error || "Invalid current credentials.");
    } catch { setMsg("Connection error."); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal glass" onClick={(e) => e.stopPropagation()}>
        <h3 className="auth-title">🔐 Change Admin Credentials</h3>
        <p className="auth-sub">Enter current credentials to update</p>
        <form onSubmit={submit} className="auth-form">
          <input className="text-input" placeholder="Current User ID"       value={curId}   onChange={(e) => setCurId(e.target.value)} />
          <input className="text-input" type="password" placeholder="Current Password" value={curPass} onChange={(e) => setCurPass(e.target.value)} />
          <hr style={{ border: "1px solid rgba(255,255,255,0.1)", margin: "0.25rem 0" }} />
          <input className="text-input" placeholder="New User ID"           value={newId}   onChange={(e) => setNewId(e.target.value)} />
          <input className="text-input" type="password" placeholder="New Password"   value={newPass} onChange={(e) => setNewPass(e.target.value)} />
          {msg && <p style={{ fontSize: "0.85rem", color: msg.startsWith("✅") ? "#22c55e" : "#ef4444" }}>{msg}</p>}
          <div className="form-btns">
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>{loading ? "Updating…" : "Update"}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function Portfolio() {

  /* ── Welcome toast ── */
  const [showToast, setShowToast] = useState(true);
  useEffect(() => { const t = setTimeout(() => setShowToast(false), 4000); return () => clearTimeout(t); }, []);

  /* ── Admin session ── */
  const [isAdmin,   setIsAdmin]   = useState(false);
  const [authModal, setAuthModal] = useState(null);
  const requireAuth = (action) => {
    if (isAdmin) { action(); return; }
    setAuthModal({ onConfirm: () => { setAuthModal(null); setIsAdmin(true); action(); } });
  };
  const closeAuth = () => setAuthModal(null);

  /* ── DB sync ── */
  const saveToDb = (patch) => {
    fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).catch(() => {});
  };

  /* ── Hero ── */
  const [hero,        setHero]        = useState(DEFAULT_HERO);
  const [editingHero, setEditingHero] = useState(false);
  const [showCreds,   setShowCreds]   = useState(false);

  const saveHero = (form) => { setHero(form); saveToDb({ hero: form }); setEditingHero(false); };

  /* ── About points ── */
  const [aboutPoints,    setAboutPoints]    = useState(DEFAULT_ABOUT);
  const [showAboutInput, setShowAboutInput] = useState(false);
  const [newPoint,       setNewPoint]       = useState({ icon: "✨", text: "" });

  const deleteAboutPoint = (i) => { const u = aboutPoints.filter((_, idx) => idx !== i); setAboutPoints(u); saveToDb({ aboutPoints: u }); };
  const saveAboutPoint   = () => {
    if (!newPoint.text.trim()) return;
    const u = [...aboutPoints, newPoint];
    setAboutPoints(u); saveToDb({ aboutPoints: u });
    setShowAboutInput(false); setNewPoint({ icon: "✨", text: "" });
  };

  /* ── Skills ── */
  const [skills,         setSkills]         = useState(DEFAULT_SKILLS);
  const [newSkill,       setNewSkill]       = useState("");
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [skillError,     setSkillError]     = useState("");
  const skillInputRef = useRef(null);

  const addSkill = () => {
    const v = newSkill.trim();
    if (!v) { setSkillError("Please enter a skill name."); return; }
    if (skills.some((s) => s.toLowerCase() === v.toLowerCase())) { setSkillError("Skill already exists."); return; }
    const u = [...skills, v];
    setSkills(u); setNewSkill(""); setSkillError(""); setShowSkillInput(false);
    saveToDb({ skills: u });
  };
  const deleteSkill     = (i) => requireAuth(() => { const u = skills.filter((_, idx) => idx !== i); setSkills(u); saveToDb({ skills: u }); });
  const openSkillInput  = ()  => requireAuth(() => { setShowSkillInput(true); setSkillError(""); setTimeout(() => skillInputRef.current?.focus(), 50); });
  const cancelSkillInput = () => { setShowSkillInput(false); setNewSkill(""); setSkillError(""); };

  /* ── Experience ── */
  const [experiences, setExperiences] = useState(DEFAULT_EXPERIENCES);
  const [expForm,     setExpForm]     = useState(null);

  const saveExp   = () => {
    const { role, company, duration } = expForm.data;
    if (!role.trim() || !company.trim() || !duration.trim()) return;
    const u = expForm.mode === "add"
      ? [...experiences, { ...expForm.data, id: Date.now() }]
      : experiences.map((e) => e.id === expForm.id ? { ...expForm.data, id: expForm.id } : e);
    setExperiences(u); setExpForm(null); saveToDb({ experiences: u });
  };
  const deleteExp = (id)  => requireAuth(() => { const u = experiences.filter((e) => e.id !== id); setExperiences(u); saveToDb({ experiences: u }); });
  const editExp   = (exp) => requireAuth(() => setExpForm({ mode: "edit", id: exp.id, data: { ...exp } }));
  const addExp    = ()    => requireAuth(() => setExpForm({ mode: "add",  data: { ...EMPTY_EXP } }));

  /* ── Projects ── */
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [projForm, setProjForm] = useState(null);
  const dragItem = useRef(null);
  const dragOver = useRef(null);

  const saveProj = () => {
    const { name: n, description } = projForm.data;
    if (!n.trim() || !description.trim()) return;
    const tags = typeof projForm.data.tags === "string"
      ? projForm.data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : projForm.data.tags;
    const data = { ...projForm.data, tags };
    const u    = projForm.mode === "add"
      ? [...projects, { ...data, id: Date.now() }]
      : projects.map((p) => p.id === projForm.id ? { ...data, id: projForm.id } : p);
    setProjects(u); setProjForm(null); saveToDb({ projects: u });
  };
  const deleteProj = (id)    => requireAuth(() => { const u = projects.filter((p) => p.id !== id); setProjects(u); saveToDb({ projects: u }); });
  const editProj   = (proj)  => requireAuth(() => setProjForm({ mode: "edit", id: proj.id, data: { ...proj, tags: proj.tags.join(", ") } }));
  const addProj    = ()      => requireAuth(() => setProjForm({ mode: "add",  data: { ...EMPTY_PROJ } }));

  const onDragStart = (i) => { dragItem.current = i; };
  const onDragEnter = (i) => { dragOver.current = i; };
  const onDragEnd   = ()  => {
    const from = dragItem.current, to = dragOver.current;
    if (from === null || to === null || from === to) { dragItem.current = null; dragOver.current = null; return; }
    const reordered = [...projects];
    const [moved]   = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setProjects(reordered); saveToDb({ projects: reordered });
    dragItem.current = null; dragOver.current = null;
  };

  /* ── Certifications ── */
  const [certs,     setCerts]     = useState(DEFAULT_CERTS);
  const [certForm,  setCertForm]  = useState(null);

  const saveCert   = () => {
    const { name: n, issuer } = certForm.data;
    if (!n.trim() || !issuer.trim()) return;
    const u = certForm.mode === "add"
      ? [...certs, { ...certForm.data, id: Date.now() }]
      : certs.map((c) => c.id === certForm.id ? { ...certForm.data, id: certForm.id } : c);
    setCerts(u); setCertForm(null); saveToDb({ certs: u });
  };
  const deleteCert = (id)   => requireAuth(() => { const u = certs.filter((c) => c.id !== id); setCerts(u); saveToDb({ certs: u }); });
  const editCert   = (cert) => requireAuth(() => setCertForm({ mode: "edit", id: cert.id, data: { ...cert } }));
  const addCert    = ()     => requireAuth(() => setCertForm({ mode: "add",  data: { ...EMPTY_CERT } }));

  /* ── Resume ── */
  const [resume,      setResume]      = useState(null);
  const [uploading,   setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch("/api/resume-meta")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.url) setResume(d); })
      .catch(() => {});
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true); setUploadError("");
    try {
      const res = await fetch("/api/upload-resume", {
        method: "PUT",
        headers: { "x-filename": file.name, "content-type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setResume({
        name: file.name, url: data.url,
        size: file.size > 1024 * 1024 ? (file.size / (1024 * 1024)).toFixed(2) + " MB" : (file.size / 1024).toFixed(1) + " KB",
        uploadedAt: new Date().toLocaleDateString(),
      });
    } catch { setUploadError("Upload failed. Please try again."); }
    setUploading(false); e.target.value = "";
  };

  const downloadResume = () => {
    const a = document.createElement("a");
    a.href = "/api/resume-file"; a.download = resume?.name || "resume.pdf";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };
  const deleteResume = () => requireAuth(async () => {
    await fetch("/api/upload-resume", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: resume?.url }) }).catch(() => {});
    setResume(null);
  });

  /* ── Phone ── */
  const [phone,        setPhone]        = useState("+91 00000 00000");
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneInput,   setPhoneInput]   = useState("");
  const phoneRef = useRef(null);

  const savePhone      = () => { const v = phoneInput.trim(); if (v) { setPhone(v); saveToDb({ phone: v }); } setEditingPhone(false); };
  const startEditPhone = () => requireAuth(() => { setPhoneInput(phone); setEditingPhone(true); setTimeout(() => phoneRef.current?.focus(), 50); });

  /* ── Load from MongoDB on mount ── */
  useEffect(() => {
    fetch("/api/portfolio")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d) return;
        if (d.hero)                setHero((prev) => ({ ...prev, ...d.hero }));
        if (d.skills?.length)      setSkills(d.skills);
        if (d.experiences?.length) setExperiences(d.experiences);
        if (d.projects?.length)    setProjects(d.projects);
        if (d.certs?.length)       setCerts(d.certs);
        if (d.aboutPoints?.length) setAboutPoints(d.aboutPoints);
        if (d.phone)               setPhone(d.phone);
      })
      .catch(() => {});
  }, []);

  /* ── Contact form ── */
  const [contactForm,    setContactForm]    = useState({ name: "", email: "", subject: "", message: "" });
  const [contactSent,    setContactSent]    = useState(false);
  const [contactSending, setContactSending] = useState(false);
  const [contactError,   setContactError]   = useState("");

  const handleContact = async (e) => {
    e.preventDefault();
    setContactSending(true); setContactError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      if (!res.ok) throw new Error("Failed");
      setContactForm({ name: "", email: "", subject: "", message: "" });
      setContactSent(true);
      setTimeout(() => setContactSent(false), 4000);
    } catch { setContactError("Message could not be saved. Please try again."); }
    finally { setContactSending(false); }
  };

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <div className="pf">
      {/* Modals */}
      {authModal     && <AuthModal        onConfirm={authModal.onConfirm} onCancel={closeAuth} />}
      {editingHero   && <HeroEditModal    hero={hero} onSave={saveHero}   onCancel={() => setEditingHero(false)} />}
      {showCreds     && <CredentialsModal onClose={() => setShowCreds(false)} />}

      {/* Admin toolbar */}
      {isAdmin && (
        <div className="admin-toolbar">
          <button className="btn btn-primary btn-sm" onClick={() => setEditingHero(true)}>✎ Edit Site</button>
          <button className="btn btn-ghost btn-sm"   onClick={() => setShowCreds(true)}>🔐 Change Login</button>
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

      {/* ── HERO ── */}
      <section id="home" className="hero">
        <div className="hero-bg">
          <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
          <div className="hero-grid" />
        </div>
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-badge"><span className="badge-dot" />{hero.badge}</div>
            <h1 className="hero-name">Hi, I&apos;m <span className="grad-text">{hero.name}</span></h1>
            <h2 className="hero-role">{hero.role}</h2>
            <p className="hero-bio">{hero.bio}</p>
            <div className="hero-location">📍 {hero.location}</div>
            <div className="hero-btns">
              <a href="#projects" className="btn btn-primary">View My Work</a>
              <a href="#contact"  className="btn btn-outline">Contact Me</a>
              {resume && <button className="btn btn-ghost" onClick={downloadResume}>⬇ Resume</button>}
              {!isAdmin && (
                <button className="btn btn-ghost btn-sm" style={{ opacity: 0.4, fontSize: "0.75rem" }}
                  onClick={() => requireAuth(() => {})}>🔒 Admin</button>
              )}
            </div>
            <div className="hero-socials">
              {hero.linkedinUrl && hero.linkedinUrl !== "https://www.linkedin.com/" && (
                <a href={hero.linkedinUrl} target="_blank" rel="noreferrer" className="social-chip">LinkedIn</a>
              )}
              <a href={`mailto:${hero.contactEmail}`} className="social-chip">Email</a>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-img-wrap">
              <img src={hero.imageUrl} alt="Site Engineer" className="hero-img" />
              <div className="hero-img-glow" />
            </div>
          </div>
        </div>
        <div className="scroll-hint"><div className="scroll-line" /></div>
      </section>

      {/* ── EXPERIENCE ── */}
      <section id="experience" className="section exp-sec">
        <div className="container">
          <div className="sec-header">
            <span className="sec-badge">Experience</span>
            <h2 className="sec-title">Where I&apos;ve Worked</h2>
            <p className="sec-sub">My professional journey in civil construction</p>
          </div>
          <div className="exp-list">
            {experiences.map((exp) => (
              <div key={exp.id} className="exp-card glass">
                <div className="exp-top">
                  <div>
                    <h3 className="exp-role">{exp.role}</h3>
                    <div className="exp-company">{exp.company} <span className="exp-duration">· {exp.duration}</span></div>
                  </div>
                  <div className="exp-actions">
                    <button className="icon-btn" title="Edit"   onClick={() => editExp(exp)}>✎</button>
                    <button className="icon-btn icon-btn--danger" title="Delete" onClick={() => deleteExp(exp.id)}>✕</button>
                  </div>
                </div>
                {exp.description && <p className="exp-desc">{exp.description}</p>}
              </div>
            ))}
          </div>
          {expForm ? (
            <div className="form-card glass">
              <h3 className="form-title">{expForm.mode === "add" ? "Add Experience" : "Edit Experience"}</h3>
              <div className="form-grid">
                <input className="text-input" placeholder="Job Title *"                         value={expForm.data.role}        onChange={(e) => setExpForm({ ...expForm, data: { ...expForm.data, role: e.target.value } })} />
                <input className="text-input" placeholder="Company *"                           value={expForm.data.company}     onChange={(e) => setExpForm({ ...expForm, data: { ...expForm.data, company: e.target.value } })} />
                <input className="text-input" placeholder="Duration e.g. Jan 2022 – Present *" value={expForm.data.duration}    onChange={(e) => setExpForm({ ...expForm, data: { ...expForm.data, duration: e.target.value } })} />
                <textarea className="text-input text-area" placeholder="Description (optional)" value={expForm.data.description} onChange={(e) => setExpForm({ ...expForm, data: { ...expForm.data, description: e.target.value } })} />
              </div>
              <div className="form-btns">
                <button className="btn btn-primary btn-sm" onClick={saveExp}>Save</button>
                <button className="btn btn-ghost btn-sm"   onClick={() => setExpForm(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-outline add-btn" onClick={addExp}>+ Add Experience</button>
          )}
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section id="projects" className="section projects-sec">
        <div className="container">
          <div className="sec-header">
            <span className="sec-badge">Projects</span>
            <h2 className="sec-title">Construction Projects</h2>
            <p className="sec-sub">Key projects I have supervised and delivered</p>
          </div>
          <p className="drag-hint">⠿ Drag cards to reorder</p>
          <div className="projects-grid">
            {projects.map((proj, i) => (
              <div key={proj.id} className="proj-card glass" draggable
                onDragStart={() => onDragStart(i)} onDragEnter={() => onDragEnter(i)}
                onDragEnd={onDragEnd} onDragOver={(e) => e.preventDefault()}>
                <div className="proj-body">
                  <div className="proj-top">
                    <div className="proj-drag-handle" title="Drag to reorder">⠿</div>
                    <h3 className="proj-name">{proj.name}</h3>
                    <div className="exp-actions">
                      <button className="icon-btn" title="Edit"   onClick={() => editProj(proj)}>✎</button>
                      <button className="icon-btn icon-btn--danger" title="Delete" onClick={() => deleteProj(proj.id)}>✕</button>
                    </div>
                  </div>
                  <div className="proj-meta">
                    {proj.location && <span className="proj-meta-item">📍 {proj.location}</span>}
                    {proj.type     && <span className="proj-meta-item">🏗️ {proj.type}</span>}
                    {proj.budget   && <span className="proj-meta-item">💰 {proj.budget}</span>}
                    {proj.duration && <span className="proj-meta-item">📅 {proj.duration}</span>}
                  </div>
                  <p className="proj-desc">{proj.description}</p>
                </div>
                <div className="proj-footer">
                  <div className="proj-tags">{(proj.tags || []).map((t) => <span key={t} className="proj-tag">{t}</span>)}</div>
                  <button className="proj-edit-btn" onClick={() => editProj(proj)}>Edit ✎</button>
                </div>
              </div>
            ))}
          </div>
          {projForm ? (
            <div className="form-card glass">
              <h3 className="form-title">{projForm.mode === "add" ? "Add Project" : "Edit Project"}</h3>
              <div className="form-grid">
                <input    className="text-input"            placeholder="Project Name *"                          value={projForm.data.name}        onChange={(e) => setProjForm({ ...projForm, data: { ...projForm.data, name: e.target.value } })} />
                <input    className="text-input"            placeholder="Location (e.g. Mumbai)"                  value={projForm.data.location}    onChange={(e) => setProjForm({ ...projForm, data: { ...projForm.data, location: e.target.value } })} />
                <input    className="text-input"            placeholder="Type (Residential / Commercial / Infra)" value={projForm.data.type}        onChange={(e) => setProjForm({ ...projForm, data: { ...projForm.data, type: e.target.value } })} />
                <input    className="text-input"            placeholder="Budget / Value (e.g. ₹3.2 Cr)"          value={projForm.data.budget}      onChange={(e) => setProjForm({ ...projForm, data: { ...projForm.data, budget: e.target.value } })} />
                <input    className="text-input"            placeholder="Duration (e.g. 18 months)"              value={projForm.data.duration}    onChange={(e) => setProjForm({ ...projForm, data: { ...projForm.data, duration: e.target.value } })} />
                <textarea className="text-input text-area" placeholder="Description *"                           value={projForm.data.description} onChange={(e) => setProjForm({ ...projForm, data: { ...projForm.data, description: e.target.value } })} />
                <input    className="text-input"            placeholder="Tags (comma separated, e.g. RCC, G+5)"  value={projForm.data.tags}        onChange={(e) => setProjForm({ ...projForm, data: { ...projForm.data, tags: e.target.value } })} />
              </div>
              <div className="form-btns">
                <button className="btn btn-primary btn-sm" onClick={saveProj}>Save</button>
                <button className="btn btn-ghost btn-sm"   onClick={() => setProjForm(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-outline add-btn" onClick={addProj}>+ Add Project</button>
          )}
        </div>
      </section>

      {/* ── SKILLS ── */}
      <section id="skills" className="section skills-sec">
        <div className="container">
          <div className="sec-header">
            <span className="sec-badge">Skills</span>
            <h2 className="sec-title">Technical Skills</h2>
            <p className="sec-sub">Tools, software and civil engineering expertise</p>
          </div>
          <div className="skills-box glass">
            {skills.length === 0 && <p className="skills-empty">No skills yet — add your first one below!</p>}
            <div className="skills-grid">
              {skills.map((skill, i) => (
                <div key={skill + i} className="skill-tag" style={{ background: SKILL_COLORS[i % SKILL_COLORS.length] }}>
                  <span>{skill}</span>
                  <button className="skill-del" onClick={() => deleteSkill(i)} title="Remove" aria-label={`Remove ${skill}`}>&times;</button>
                </div>
              ))}
            </div>
            {showSkillInput && (
              <div className="skill-input-row">
                <input ref={skillInputRef} className="text-input" placeholder="e.g. AutoCAD, Surveying, Primavera…"
                  value={newSkill} onChange={(e) => { setNewSkill(e.target.value); setSkillError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") addSkill(); if (e.key === "Escape") cancelSkillInput(); }} />
                <button className="btn btn-primary btn-sm" onClick={addSkill}>Add</button>
                <button className="btn btn-ghost btn-sm"   onClick={cancelSkillInput}>Cancel</button>
              </div>
            )}
            {skillError && <p className="form-error">{skillError}</p>}
            <div className="skills-footer">
              {!showSkillInput && <button className="btn btn-primary" onClick={openSkillInput}>+ Add Skill</button>}
              <span className="skills-count">{skills.length} skill{skills.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CERTIFICATIONS ── */}
      <section id="certifications" className="section cert-sec">
        <div className="container">
          <div className="sec-header">
            <span className="sec-badge">Certifications</span>
            <h2 className="sec-title">Education &amp; Certifications</h2>
            <p className="sec-sub">Degrees, licences and professional certificates</p>
          </div>
          <div className="cert-list">
            {certs.map((cert) => (
              <div key={cert.id} className="cert-card glass">
                <div className="cert-icon">🎓</div>
                <div className="cert-info">
                  <h3 className="cert-name">{cert.name}</h3>
                  <p className="cert-meta">{cert.issuer} {cert.year && <span className="cert-year">· {cert.year}</span>}</p>
                </div>
                <div className="exp-actions">
                  <button className="icon-btn" title="Edit"   onClick={() => editCert(cert)}>✎</button>
                  <button className="icon-btn icon-btn--danger" title="Delete" onClick={() => deleteCert(cert.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
          {certForm ? (
            <div className="form-card glass">
              <h3 className="form-title">{certForm.mode === "add" ? "Add Certification" : "Edit Certification"}</h3>
              <div className="form-grid">
                <input className="text-input" placeholder="Certificate / Degree Name *" value={certForm.data.name}   onChange={(e) => setCertForm({ ...certForm, data: { ...certForm.data, name: e.target.value } })} />
                <input className="text-input" placeholder="Issuing Organization *"      value={certForm.data.issuer} onChange={(e) => setCertForm({ ...certForm, data: { ...certForm.data, issuer: e.target.value } })} />
                <input className="text-input" placeholder="Year (e.g. 2021)"            value={certForm.data.year}   onChange={(e) => setCertForm({ ...certForm, data: { ...certForm.data, year: e.target.value } })} />
              </div>
              <div className="form-btns">
                <button className="btn btn-primary btn-sm" onClick={saveCert}>Save</button>
                <button className="btn btn-ghost btn-sm"   onClick={() => setCertForm(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-outline add-btn" onClick={addCert}>+ Add Certification</button>
          )}
        </div>
      </section>

      {/* ── RESUME ── */}
      <section id="resume" className="section resume-sec">
        <div className="container">
          <div className="sec-header">
            <span className="sec-badge">Resume</span>
            <h2 className="sec-title">My Resume / CV</h2>
            <p className="sec-sub">Upload &amp; share your resume</p>
          </div>
          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} style={{ display: "none" }} />
          <div className="resume-compact glass">
            {resume ? (
              <div className="resume-uploaded-row">
                <span className="resume-ph-icon" style={{ fontSize: "2.2rem" }}>📋</span>
                <div>
                  <p className="resume-ph-name">{resume.name}</p>
                  <p className="resume-ph-sub">{resume.size} · Uploaded {resume.uploadedAt}</p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginLeft: "auto" }}>
                  <button className="btn btn-primary"      onClick={downloadResume}>⬇ Download</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => requireAuth(() => fileInputRef.current?.click())}>🔄 Replace</button>
                  <button className="btn btn-danger btn-sm" onClick={deleteResume}>🗑</button>
                </div>
              </div>
            ) : (
              <div className="resume-upload-row">
                <div className="upload-icon-wrap" style={{ width: 60, height: 60 }}><span style={{ fontSize: "2.2rem" }}>📄</span></div>
                <div>
                  <p className="resume-ph-name">No resume uploaded yet</p>
                  <p className="resume-ph-sub">PDF, DOC, DOCX supported</p>
                  {uploadError && <p className="form-error">{uploadError}</p>}
                </div>
                <button className="btn btn-primary" style={{ marginLeft: "auto" }}
                  onClick={() => requireAuth(() => fileInputRef.current?.click())} disabled={uploading}>
                  {uploading ? "Uploading…" : "📤 Upload Resume"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="section contact-sec">
        <div className="container">
          <div className="sec-header">
            <span className="sec-badge">Contact</span>
            <h2 className="sec-title">Get In Touch</h2>
            <p className="sec-sub">Let&apos;s discuss your next project</p>
          </div>
          <div className="contact-layout">
            <div className="contact-info">
              <a href={`mailto:${hero.contactEmail}`} className="contact-card glass">
                <span className="contact-icon">📧</span>
                <div><strong>Email</strong><p>{hero.contactEmail}</p></div>
              </a>
              {hero.linkedinUrl && hero.linkedinUrl !== "https://www.linkedin.com/" && (
                <a href={hero.linkedinUrl} target="_blank" rel="noreferrer" className="contact-card glass">
                  <span className="contact-icon">💼</span>
                  <div><strong>LinkedIn</strong><p>{hero.linkedinUrl.replace("https://", "")}</p></div>
                </a>
              )}
              <div className="contact-card glass">
                <span className="contact-icon">📍</span>
                <div><strong>Location</strong><p>{hero.location}</p></div>
              </div>
            </div>
            <form className="contact-form glass" onSubmit={handleContact}>
              <div className="contact-form-header">
                <h3 className="form-title" style={{ margin: 0 }}>Send a Message</h3>
                <div className="call-us-block">
                  <span className="call-us-label">📞 Call</span>
                  {editingPhone ? (
                    <input ref={phoneRef} className="phone-input" value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      onBlur={savePhone}
                      onKeyDown={(e) => { if (e.key === "Enter") savePhone(); if (e.key === "Escape") setEditingPhone(false); }} />
                  ) : (
                    <span className="call-us-number" onClick={startEditPhone} title="Click to edit">
                      {phone} <span className="phone-edit-icon">✎</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="form-row-2">
                <input className="text-input" placeholder="Your Name"  required value={contactForm.name}    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} />
                <input className="text-input" type="email" placeholder="Your Email" required value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
              </div>
              <input    className="text-input"            placeholder="Subject"        value={contactForm.subject}  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })} />
              <textarea className="text-input text-area contact-textarea" placeholder="Your message…" required value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} />
              {contactError && <p className="form-error">{contactError}</p>}
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                {contactSending ? "Saving..." : contactSent ? "✅ Message saved!" : "📨 Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-points">
            {aboutPoints.map((pt, i) => (
              <div key={i} className="footer-chip glass">
                <span className="footer-chip-icon">{pt.icon}</span>
                <span className="footer-chip-text" dangerouslySetInnerHTML={{ __html: pt.text }} />
                <button className="readme-del footer-chip-del" onClick={() => requireAuth(() => deleteAboutPoint(i))} title="Remove">✕</button>
              </div>
            ))}
            {showAboutInput ? (
              <div className="footer-chip-input glass">
                <input className="text-input about-icon-input" placeholder="🔥" maxLength={4}
                  value={newPoint.icon} onChange={(e) => setNewPoint({ ...newPoint, icon: e.target.value })} />
                <input className="text-input" placeholder="Point text…" style={{ flex: 1, minWidth: 180 }}
                  value={newPoint.text} onChange={(e) => setNewPoint({ ...newPoint, text: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") saveAboutPoint(); if (e.key === "Escape") setShowAboutInput(false); }} />
                <button className="btn btn-primary btn-sm" onClick={saveAboutPoint}>Add</button>
                <button className="btn btn-ghost btn-sm"   onClick={() => setShowAboutInput(false)}>✕</button>
              </div>
            ) : (
              <button className="footer-add-btn" onClick={() => requireAuth(() => { setShowAboutInput(true); setNewPoint({ icon: "✨", text: "" }); })}>
                + Add
              </button>
            )}
          </div>
          <div className="footer-bar">
            <p dangerouslySetInnerHTML={{ __html: hero.footerText.replace("♥", '<span class="heart">♥</span>') }} />
          </div>
        </div>
      </footer>
    </div>
  );
}
