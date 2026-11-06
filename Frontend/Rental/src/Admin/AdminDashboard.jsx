import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const fmt = (n) => "KES " + Number(n || 0).toLocaleString("en-KE");
let _id = 1000;
const uid = (p) => `${p}${++_id}`;

const ICONS = {
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "M6 6l12 12M18 6L6 18",
  plus: "M12 5v14M5 12h14",
  check: "M5 12.5l4.5 4.5L19 7.5",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
  search: "M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.3-4.3",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  bed: "M3 19V8M3 15h18v4M21 15v-3a3 3 0 00-3-3h-7v6M7 12.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  users: "M16 20v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1M10 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM20 20v-1a4 4 0 00-3-3.9M15.5 4.2a3.5 3.5 0 010 6.6",
  inbox: "M4 13l2-8h12l2 8M4 13v6h16v-6M4 13h5l1 2h4l1-2h5",
  card: "M3 6h18v12H3zM3 10h18M7 15h3",
  wrench: "M14.5 6.5a4 4 0 005 5L10 21l-3-3 9.5-9.5zM14.5 6.5l3-3",
  bell: "M6 9a6 6 0 0112 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 004 0",
  sliders: "M4 7h10M18 7h2M4 17h2M10 17h10M14 7a2 2 0 104 0 2 2 0 00-4 0zM6 17a2 2 0 104 0 2 2 0 00-4 0z",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  arrow: "M5 12h14M13 6l6 6-6 6",
  swap: "M7 8h12l-3-3M17 16H5l3 3",
  edit: "M4 20h4L19 9l-4-4L4 16zM13 7l4 4",
  home: "M4 11l8-7 8 7M6 10v10h12V10",
  info: "M12 8h.01M11 12h1v5h1M12 21a9 9 0 100-18 9 9 0 000 18z",
};
function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

const ROOM_STATUS = {
  available: { label: "Available", cls: "available" },
  partial: { label: "Partly full", cls: "partial" },
  full: { label: "Occupied", cls: "occupied" },
  maintenance: { label: "Maintenance", cls: "maintenance" },
};

/* ───────────── preview data (fictional) ───────────── */
const INITIAL_ROOMS = [
  { id: "r1", number: "A-01", type: "single", capacity: 1, rent: 18000, block: "Block A", maintenance: false },
  { id: "r2", number: "A-02", type: "single", capacity: 1, rent: 18000, block: "Block A", maintenance: false },
  { id: "r3", number: "A-04", type: "single", capacity: 1, rent: 18000, block: "Block A", maintenance: false },
  { id: "r4", number: "A-07", type: "shared", capacity: 2, rent: 12000, block: "Block A", maintenance: false },
  { id: "r5", number: "A-08", type: "shared", capacity: 2, rent: 12000, block: "Block A", maintenance: true },
  { id: "r6", number: "B-02", type: "single", capacity: 1, rent: 18000, block: "Block B", maintenance: false },
  { id: "r7", number: "B-04", type: "single", capacity: 1, rent: 18000, block: "Block B", maintenance: false },
  { id: "r8", number: "B-06", type: "shared", capacity: 2, rent: 12000, block: "Block B", maintenance: false },
  { id: "r9", number: "B-07", type: "shared", capacity: 2, rent: 12000, block: "Block B", maintenance: false },
  { id: "r10", number: "C-01", type: "single", capacity: 1, rent: 18000, block: "Block C", maintenance: false },
  { id: "r11", number: "C-03", type: "single", capacity: 1, rent: 18000, block: "Block C", maintenance: false },
  { id: "r12", number: "C-05", type: "shared", capacity: 2, rent: 12000, block: "Block C", maintenance: false },
];
const INITIAL_TENANTS = [
  { id: "t1", name: "Amara Njeri", phone: "0712 000 111", roomId: "r3", rent: 18000, since: "Jan 2025" },
  { id: "t2", name: "Kito Mwangi", phone: "0722 000 222", roomId: "r4", rent: 12000, since: "Feb 2025" },
  { id: "t3", name: "Leah Otieno", phone: "0733 000 333", roomId: "r6", rent: 18000, since: "Jan 2025" },
  { id: "t4", name: "Brian Kiptoo", phone: "0701 000 444", roomId: "r1", rent: 18000, since: "Mar 2025" },
  { id: "t5", name: "Wanjiru Kamau", phone: "0745 000 555", roomId: "r2", rent: 18000, since: "Apr 2025" },
  { id: "t6", name: "Faith Achieng", phone: "0756 000 666", roomId: "r4", rent: 12000, since: "Feb 2025" },
  { id: "t7", name: "Daniel Mutua", phone: "0767 000 777", roomId: "r7", rent: 18000, since: "May 2025" },
  { id: "t8", name: "Zawadi Said", phone: "0778 000 888", roomId: "r10", rent: 18000, since: "Jun 2025" },
];
const INITIAL_APPS = [
  { id: "a1", name: "Mercy Wambui", phone: "0711 234 567", email: "mercy@example.com", roomType: "single", moveIn: "1 Oct 2025", status: "pending", note: "Final-year student, prefers a quiet block." },
  { id: "a2", name: "Collins Ouma", phone: "0722 345 678", email: "collins@example.com", roomType: "shared", moveIn: "1 Oct 2025", status: "pending", note: "Will share with a classmate." },
  { id: "a3", name: "Nasra Hassan", phone: "0733 456 789", email: "nasra@example.com", roomType: "single", moveIn: "15 Oct 2025", status: "pending", note: "" },
  { id: "a4", name: "Peter Kariuki", phone: "0744 567 890", email: "peter@example.com", roomType: "shared", moveIn: "1 Nov 2025", status: "pending", note: "Needs ground floor access." },
];
const INITIAL_PAYMENTS = [
  { id: "p1", ref: "QH7•••4PK", tenantId: "t1", amount: 18000, received: "Today, 10:42", status: "confirmed" },
  { id: "p2", ref: "QH6•••91D", tenantId: "t2", amount: 12000, received: "Today, 09:18", status: "review" },
  { id: "p3", ref: "QH5•••2LA", tenantId: "t3", amount: 18000, received: "Yesterday", status: "confirmed" },
  { id: "p4", ref: "QH4•••7MB", tenantId: "t4", amount: 18000, received: "Yesterday", status: "confirmed" },
  { id: "p5", ref: "QH3•••8RW", tenantId: "t5", amount: 9000, received: "2 days ago", status: "confirmed" },
  { id: "p6", ref: "QH2•••5ZT", tenantId: "t7", amount: 18000, received: "2 days ago", status: "review" },
];
const INITIAL_TICKETS = [
  { id: "m1", roomId: "r5", issue: "Leaking tap in shared bathroom", priority: "high", status: "in-progress" },
  { id: "m2", roomId: "r3", issue: "Window latch is loose", priority: "low", status: "open" },
  { id: "m3", roomId: "r7", issue: "Wi-Fi drops in the evening", priority: "medium", status: "open" },
];
const INITIAL_NOTICES = [
  { id: "n1", title: "Water maintenance on Saturday", body: "Water will be off from 9am to 12pm for tank cleaning.", date: "Today" },
  { id: "n2", title: "Rent due reminder", body: "September rent is due by the 5th. Pay by M-Pesa and keep your receipt.", date: "2 days ago" },
];
const INITIAL_STAFF = [
  { id: "s1", name: "You (Admin)", email: "admin@weruhostels.example", role: "Owner", me: true },
  { id: "s2", name: "Grace Muthoni", email: "grace@weruhostels.example", role: "Manager", me: false },
];

const VIEWS = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "rooms", label: "Rooms", icon: "bed" },
  { id: "approvals", label: "Approvals", icon: "inbox" },
  { id: "tenants", label: "Tenants", icon: "users" },
  { id: "payments", label: "Payments", icon: "card" },
  { id: "maintenance", label: "Maintenance", icon: "wrench" },
  { id: "notices", label: "Notices", icon: "bell" },
  { id: "settings", label: "Settings", icon: "sliders" },
];

/* ───────────── small UI pieces ───────────── */
function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="hh-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="hh-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="hh-modal-head">
          <h3>{title}</h3>
          <button className="hh-icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>
        <div className="hh-modal-body">{children}</div>
        {footer && <div className="hh-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
const Pill = ({ tone, children }) => <span className={`hh-pill hh-pill-${tone}`}>{children}</span>;
const Empty = ({ icon = "inbox", children }) => (
  <div className="hh-empty"><Icon name={icon} size={28} /><p>{children}</p></div>
);
const SectionHead = ({ label, title, note, children }) => (
  <div className="hh-section-head">
    <div>
      <div className="hh-label">{label}</div>
      <h2 className="hh-h2">{title}</h2>
    </div>
    {note && <span className="hh-note">{note}</span>}
    {children}
  </div>
);

/* ───────────── add-room form ───────────── */
function AddRoomForm({ settings, rooms, onAdd }) {
  const blank = { number: "", type: "single", capacity: 1, rent: settings.singleRent, block: "" };
  const [f, setF] = useState(blank);
  const [rentTouched, setRentTouched] = useState(false);
  const [error, setError] = useState("");

  const setType = (type) =>
    setF((p) => ({
      ...p,
      type,
      capacity: type === "single" ? 1 : 2,
      rent: rentTouched ? p.rent : type === "single" ? settings.singleRent : settings.sharedRent,
    }));

  const submit = (e) => {
    e.preventDefault();
    const number = f.number.trim().toUpperCase();
    if (!number) return setError("Enter a room number, e.g. D-01.");
    if (rooms.some((r) => r.number.toUpperCase() === number)) return setError(`Room ${number} already exists.`);
    if (!(Number(f.rent) > 0)) return setError("Enter a monthly rent greater than zero.");
    setError("");
    onAdd({ number, type: f.type, capacity: Number(f.capacity), rent: Number(f.rent), block: f.block.trim() });
    setF({ ...blank, rent: settings.singleRent });
    setRentTouched(false);
  };

  return (
    <form className="hh-card hh-form" onSubmit={submit} noValidate>
      <SectionHead label="ADD A ROOM" title="New room" note="Appears in the directory straight away" />
      <div className="hh-form-grid">
        <label className="hh-field">
          <span>Room number</span>
          <input value={f.number} onChange={(e) => setF({ ...f, number: e.target.value })} placeholder="e.g. D-01" />
        </label>
        <label className="hh-field">
          <span>Block / floor <em>(optional)</em></span>
          <input value={f.block} onChange={(e) => setF({ ...f, block: e.target.value })} placeholder="e.g. Block D" />
        </label>
        <label className="hh-field">
          <span>Room type</span>
          <select value={f.type} onChange={(e) => setType(e.target.value)}>
            <option value="single">Single — private space</option>
            <option value="shared">Shared — shared occupancy</option>
          </select>
        </label>
        <label className="hh-field">
          <span>Beds / capacity</span>
          <input type="number" min="1" max="6" value={f.capacity} onChange={(e) => setF({ ...f, capacity: e.target.value })} />
        </label>
        <label className="hh-field hh-span2">
          <span>Monthly rent per resident (KES)</span>
          <input type="number" min="0" value={f.rent} onChange={(e) => { setRentTouched(true); setF({ ...f, rent: e.target.value }); }} />
        </label>
      </div>
      {error && <p className="hh-error" role="alert">{error}</p>}
      <div className="hh-form-foot">
        <button type="submit" className="hh-btn hh-btn-primary"><Icon name="plus" size={16} /> Add room</button>
      </div>
    </form>
  );
}

/* ═════════════════════════ MAIN COMPONENT ═════════════════════════ */
function AdminDashboard() {
  const [view, setView] = useState("overview");
  const [drawer, setDrawer] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(true);

  const [settings, setSettings] = useState({ name: "Weru Hostels", singleRent: 18000, sharedRent: 12000, paybill: "522522" });
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [tenants, setTenants] = useState(INITIAL_TENANTS);
  const [apps, setApps] = useState(INITIAL_APPS);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [notices, setNotices] = useState(INITIAL_NOTICES);
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [log, setLog] = useState([
    { id: "l1", text: "Payment QH7•••4PK confirmed for Amara Njeri", time: "Today, 10:45" },
    { id: "l2", text: "Room A-08 marked under maintenance", time: "Yesterday" },
  ]);

  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [roomFilter, setRoomFilter] = useState("all");
  const [roomQuery, setRoomQuery] = useState("");
  const [tenantQuery, setTenantQuery] = useState("");
  const [noticeDraft, setNoticeDraft] = useState({ title: "", body: "" });
  const [staffDraft, setStaffDraft] = useState({ name: "", email: "" });
  const [settingsDraft, setSettingsDraft] = useState(settings);

  /* drawer: Esc to close + lock page scroll */
  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [drawer]);
  useEffect(() => {
    const onResize = () => window.innerWidth >= 900 && setDrawer(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const notify = (msg, tone = "ok") => setToast({ msg, tone });
  const addLog = (text) => setLog((l) => [{ id: uid("l"), text, time: "Just now" }, ...l].slice(0, 12));
  const go = (id) => { setView(id); setDrawer(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  /* ───────── derived data ───────── */
  const roomsView = useMemo(
    () =>
      rooms.map((r) => {
        const occ = tenants.filter((t) => t.roomId === r.id);
        const status = r.maintenance ? "maintenance" : occ.length === 0 ? "available" : occ.length < r.capacity ? "partial" : "full";
        return { ...r, occ, status, free: r.maintenance ? 0 : Math.max(0, r.capacity - occ.length) };
      }),
    [rooms, tenants]
  );
  const paidBy = useMemo(() => {
    const m = {};
    payments.forEach((p) => { if (p.status === "confirmed") m[p.tenantId] = (m[p.tenantId] || 0) + p.amount; });
    return m;
  }, [payments]);
  const tenantsView = useMemo(
    () =>
      tenants.map((t) => {
        const paid = paidBy[t.id] || 0;
        return { ...t, room: rooms.find((r) => r.id === t.roomId), paid, balance: Math.max(0, t.rent - paid) };
      }),
    [tenants, rooms, paidBy]
  );
  const stats = useMemo(() => {
    const expected = tenants.reduce((s, t) => s + t.rent, 0);
    const confirmed = tenantsView.reduce((s, t) => s + Math.min(t.paid, t.rent), 0);
    const open = tenantsView.reduce((s, t) => s + t.balance, 0);
    const occupiedRooms = roomsView.filter((r) => r.occ.length > 0).length;
    return {
      totalRooms: rooms.length,
      occupiedRooms,
      availableRooms: roomsView.filter((r) => r.free > 0).length,
      pct: rooms.length ? Math.round((occupiedRooms / rooms.length) * 100) : 0,
      expected, confirmed, open,
      received: expected ? Math.round((confirmed / expected) * 100) : 0,
      owing: tenantsView.filter((t) => t.balance > 0).length,
    };
  }, [rooms, roomsView, tenants, tenantsView]);
  const pendingApps = apps.filter((a) => a.status === "pending");
  const reviewPayments = payments.filter((p) => p.status === "review");
  const openTickets = tickets.filter((t) => t.status !== "resolved");
  const badges = { approvals: pendingApps.length, payments: reviewPayments.length, maintenance: openTickets.length };

  const tenantName = (id) => tenants.find((t) => t.id === id)?.name || "Former resident";
  const roomLabel = (id) => rooms.find((r) => r.id === id)?.number || "—";

  /* ───────── actions (replace the bodies with API calls when you go live) ───────── */
  const addRoom = (data) => { // API
    setRooms((rs) => [...rs, { id: uid("r"), maintenance: false, ...data }]);
    addLog(`Room ${data.number} added (${data.type})`);
    notify(`Room ${data.number} added`);
  };
  const updateRoom = (id, patch) => { // API
    const r = rooms.find((x) => x.id === id);
    setRooms((rs) => rs.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    addLog(`Room ${r.number} updated`);
    notify(`Room ${r.number} updated`);
  };
  const deleteRoom = (id) => { // API
    const r = rooms.find((x) => x.id === id);
    setRooms((rs) => rs.filter((x) => x.id !== id));
    setTickets((ts) => ts.filter((t) => t.roomId !== id));
    addLog(`Room ${r.number} deleted`);
    notify(`Room ${r.number} deleted`);
  };
  const toggleMaintenance = (id) => { // API
    const r = rooms.find((x) => x.id === id);
    setRooms((rs) => rs.map((x) => (x.id === id ? { ...x, maintenance: !x.maintenance } : x)));
    addLog(`Room ${r.number} ${r.maintenance ? "back in service" : "marked under maintenance"}`);
    notify(`Room ${r.number} ${r.maintenance ? "is back in service" : "marked under maintenance"}`);
  };
  const approveApp = (app, roomId) => { // API
    const room = rooms.find((r) => r.id === roomId);
    setTenants((ts) => [...ts, { id: uid("t"), name: app.name, phone: app.phone, roomId, rent: room.rent, since: "Sep 2025" }]);
    setApps((as) => as.map((a) => (a.id === app.id ? { ...a, status: "approved", roomNumber: room.number } : a)));
    addLog(`${app.name} approved and placed in ${room.number}`);
    notify(`${app.name} approved — assigned to ${room.number}`);
  };
  const rejectApp = (app) => { // API
    setApps((as) => as.map((a) => (a.id === app.id ? { ...a, status: "rejected" } : a)));
    addLog(`Application from ${app.name} declined`);
    notify(`Application from ${app.name} declined`, "warn");
  };
  const removeTenant = (t) => { // API
    setTenants((ts) => ts.filter((x) => x.id !== t.id));
    addLog(`${t.name} removed from room ${roomLabel(t.roomId)}`);
    notify(`${t.name} removed — room ${roomLabel(t.roomId)} updated`, "warn");
  };
  const transferTenant = (t, roomId) => { // API
    setTenants((ts) => ts.map((x) => (x.id === t.id ? { ...x, roomId, rent: rooms.find((r) => r.id === roomId).rent } : x)));
    addLog(`${t.name} moved from ${roomLabel(t.roomId)} to ${roomLabel(roomId)}`);
    notify(`${t.name} moved to ${roomLabel(roomId)}`);
  };
  const setPayment = (id, status) => { // API
    const p = payments.find((x) => x.id === id);
    setPayments((ps) => ps.map((x) => (x.id === id ? { ...x, status } : x)));
    addLog(`Payment ${p.ref} ${status === "confirmed" ? "confirmed" : "rejected"} (${tenantName(p.tenantId)})`);
    notify(`Payment ${p.ref} ${status === "confirmed" ? "confirmed" : "rejected"}`, status === "confirmed" ? "ok" : "warn");
  };
  const recordPayment = ({ tenantId, amount, ref }) => { // API
    setPayments((ps) => [{ id: uid("p"), ref: ref || "MANUAL", tenantId, amount: Number(amount), received: "Just now", status: "confirmed" }, ...ps]);
    addLog(`Payment of ${fmt(amount)} recorded for ${tenantName(tenantId)}`);
    notify("Payment recorded");
  };
  const advanceTicket = (id) => { // API
    const order = ["open", "in-progress", "resolved"];
    setTickets((ts) => ts.map((t) => (t.id === id ? { ...t, status: order[Math.min(order.indexOf(t.status) + 1, 2)] } : t)));
    notify("Request updated");
  };
  const addTicket = ({ roomId, issue, priority }) => { // API
    setTickets((ts) => [{ id: uid("m"), roomId, issue, priority, status: "open" }, ...ts]);
    addLog(`Maintenance request logged for ${roomLabel(roomId)}`);
    notify("Maintenance request logged");
  };
  const postNotice = (e) => { // API
    e.preventDefault();
    if (!noticeDraft.title.trim()) return notify("Give the notice a title", "warn");
    setNotices((ns) => [{ id: uid("n"), title: noticeDraft.title.trim(), body: noticeDraft.body.trim(), date: "Just now" }, ...ns]);
    addLog(`Notice posted: ${noticeDraft.title.trim()}`);
    setNoticeDraft({ title: "", body: "" });
    notify("Notice posted to all residents");
  };
  const saveSettings = (e) => { // API
    e.preventDefault();
    setSettings({ ...settingsDraft, singleRent: Number(settingsDraft.singleRent), sharedRent: Number(settingsDraft.sharedRent) });
    addLog("Residence settings updated");
    notify("Settings saved");
  };
  const inviteStaff = (e) => { // API
    e.preventDefault();
    if (!staffDraft.name.trim() || !/^\S+@\S+\.\S+$/.test(staffDraft.email)) return notify("Enter a name and a valid email", "warn");
    setStaff((s) => [...s, { id: uid("s"), name: staffDraft.name.trim(), email: staffDraft.email.trim(), role: "Manager", me: false }]);
    addLog(`Admin access given to ${staffDraft.name.trim()}`);
    setStaffDraft({ name: "", email: "" });
    notify("Admin added");
  };

  /* ───────── filtered lists ───────── */
  const shownRooms = roomsView.filter(
    (r) =>
      (roomFilter === "all" || (roomFilter === "available" ? r.free > 0 : r.status === roomFilter)) &&
      (!roomQuery.trim() ||
        `${r.number} ${r.block} ${r.type} ${r.occ.map((o) => o.name).join(" ")}`.toLowerCase().includes(roomQuery.trim().toLowerCase()))
  );
  const shownTenants = tenantsView.filter(
    (t) => !tenantQuery.trim() || `${t.name} ${t.phone} ${t.room?.number}`.toLowerCase().includes(tenantQuery.trim().toLowerCase())
  );

  /* ═════════════════════════ VIEWS ═════════════════════════ */
  const OverviewView = () => (
    <>
      <div className="hh-snapshot-header">
        <div>
          <div className="hh-label">PROPERTY SNAPSHOT</div>
          <div className="hh-meta">Live from the data below · September 2025</div>
        </div>
        <div className="hh-staff-badge"><Icon name="shield" size={15} /> Staff view</div>
      </div>

      <div className="hh-snapshot-grid">
        <div className="hh-snapshot-card hh-dark">
          <div className="hh-card-label">ROOMS</div>
          <div className="hh-big">{stats.totalRooms}</div>
          <div className="hh-sub">{stats.occupiedRooms} occupied &nbsp;·&nbsp; {stats.availableRooms} with space</div>
          <div className="hh-progress"><div style={{ width: `${stats.pct}%` }} /></div>
        </div>
        <div className="hh-snapshot-card">
          <div className="hh-card-label">EXPECTED RENT</div>
          <div className="hh-big">{fmt(stats.expected)}</div>
          <div className="hh-sub">For September</div>
        </div>
        <div className="hh-snapshot-card">
          <div className="hh-card-label">CONFIRMED</div>
          <div className="hh-big">{fmt(stats.confirmed)}</div>
          <div className="hh-sub">{stats.received}% received</div>
        </div>
        <div className="hh-snapshot-card">
          <div className="hh-card-label">OPEN BALANCES</div>
          <div className="hh-big hh-warn-text">{fmt(stats.open)}</div>
          <div className="hh-sub">Across {stats.owing} resident{stats.owing === 1 ? "" : "s"}</div>
        </div>
      </div>

      <div className="hh-two-col">
        <div className="hh-card">
          <SectionHead label="NEEDS ATTENTION" title="Today's tasks" />
          <ul className="hh-tasks">
            <li>
              <span><b>{pendingApps.length}</b> room application{pendingApps.length === 1 ? "" : "s"} waiting for approval</span>
              <button className="hh-btn hh-btn-ghost hh-btn-sm" onClick={() => go("approvals")}>Review <Icon name="arrow" size={14} /></button>
            </li>
            <li>
              <span><b>{reviewPayments.length}</b> M-Pesa payment{reviewPayments.length === 1 ? "" : "s"} to review</span>
              <button className="hh-btn hh-btn-ghost hh-btn-sm" onClick={() => go("payments")}>Open <Icon name="arrow" size={14} /></button>
            </li>
            <li>
              <span><b>{openTickets.length}</b> maintenance request{openTickets.length === 1 ? "" : "s"} open</span>
              <button className="hh-btn hh-btn-ghost hh-btn-sm" onClick={() => go("maintenance")}>Open <Icon name="arrow" size={14} /></button>
            </li>
            <li>
              <span><b>{stats.availableRooms}</b> room{stats.availableRooms === 1 ? "" : "s"} ready for new residents</span>
              <button className="hh-btn hh-btn-ghost hh-btn-sm" onClick={() => go("rooms")}>Rooms <Icon name="arrow" size={14} /></button>
            </li>
          </ul>
          <div className="hh-quick">
            <button className="hh-btn hh-btn-primary" onClick={() => go("rooms")}><Icon name="plus" size={16} /> Add a room</button>
            <button className="hh-btn hh-btn-ghost" onClick={() => setModal({ type: "recordPayment" })}><Icon name="card" size={16} /> Record payment</button>
          </div>
        </div>

        <div className="hh-card">
          <SectionHead label="RECENT ACTIVITY" title="What changed" />
          <ul className="hh-log">
            {log.map((l) => (
              <li key={l.id}><span className="hh-dot" /><div><p>{l.text}</p><small>{l.time}</small></div></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="hh-card">
        <SectionHead label="ROOM DIRECTORY" title="Rooms & residents" note="Default monthly rent" />
        <div className="hh-pricing">
          <div className="hh-pricing-item"><div className="hh-pricing-icon">S</div><div><b>Single room</b><small>Private space</small></div><span>{fmt(settings.singleRent)} / month</span></div>
          <div className="hh-pricing-item"><div className="hh-pricing-icon">T</div><div><b>Shared room</b><small>Shared occupancy</small></div><span>{fmt(settings.sharedRent)} / month</span></div>
        </div>
        <RoomsTable list={roomsView.slice(0, 6)} compact />
        {roomsView.length > 6 && <button className="hh-link-btn" onClick={() => go("rooms")}>View all {roomsView.length} rooms <Icon name="arrow" size={14} /></button>}
      </div>
    </>
  );

  const RoomsTable = ({ list, compact }) =>
    list.length === 0 ? (
      <Empty icon="bed">No rooms match your filters.</Empty>
    ) : (
      <div className="hh-table-wrap">
        <table className="hh-table">
          <thead>
            <tr><th>Room</th><th>Type</th><th>Occupant</th><th>Status</th>{!compact && <><th>Rent</th><th className="hh-actions-col">Actions</th></>}</tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id}>
                <td data-label="Room"><b>{r.number}</b>{r.block && !compact ? <small className="hh-muted"> · {r.block}</small> : null}</td>
                <td data-label="Type" className="hh-cap">{r.type}</td>
                <td data-label="Occupant">
                  {r.occ.length ? r.occ.map((o) => o.name).join(", ") : <span className="hh-muted">{r.status === "maintenance" ? "Out of service" : "Available"}</span>}
                  {r.capacity > 1 && <small className="hh-muted"> · {r.occ.length}/{r.capacity} beds</small>}
                </td>
                <td data-label="Status"><Pill tone={ROOM_STATUS[r.status].cls}>{ROOM_STATUS[r.status].label}</Pill></td>
                {!compact && (
                  <>
                    <td data-label="Rent">{fmt(r.rent)}</td>
                    <td data-label="Actions" className="hh-actions-col">
                      <div className="hh-row-actions">
                        <button className="hh-btn hh-btn-ghost hh-btn-sm" onClick={() => setModal({ type: "editRoom", room: r })}><Icon name="edit" size={14} /> Edit</button>
                        <button className="hh-btn hh-btn-ghost hh-btn-sm" disabled={r.occ.length > 0 && !r.maintenance} title={r.occ.length > 0 && !r.maintenance ? "Only vacant rooms can go under maintenance" : ""} onClick={() => toggleMaintenance(r.id)}>
                          <Icon name="wrench" size={14} /> {r.maintenance ? "Reopen" : "Maintenance"}
                        </button>
                        <button className="hh-btn hh-btn-danger hh-btn-sm" disabled={r.occ.length > 0} title={r.occ.length > 0 ? "Remove the residents first" : ""} onClick={() => setModal({ type: "deleteRoom", room: r })}><Icon name="trash" size={14} /> Delete</button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

  const RoomsView = () => (
    <>
      <AddRoomForm settings={settings} rooms={rooms} onAdd={addRoom} />
      <div className="hh-card">
        <SectionHead label="ROOM DIRECTORY" title="Manage rooms" note={`${shownRooms.length} of ${rooms.length} shown`} />
        <div className="hh-toolbar">
          <div className="hh-search"><Icon name="search" size={16} /><input value={roomQuery} onChange={(e) => setRoomQuery(e.target.value)} placeholder="Search room, block or resident" aria-label="Search rooms" /></div>
          <div className="hh-chips" role="group" aria-label="Filter rooms">
            {[["all", "All"], ["available", "Has space"], ["full", "Occupied"], ["maintenance", "Maintenance"]].map(([k, l]) => (
              <button key={k} className={roomFilter === k ? "on" : ""} onClick={() => setRoomFilter(k)}>{l}</button>
            ))}
          </div>
        </div>
        <RoomsTable list={shownRooms} />
      </div>
    </>
  );

  const ApprovalsView = () => (
    <div className="hh-card">
      <SectionHead label="ROOM APPROVALS" title="Applications to approve" note={`${pendingApps.length} pending`} />
      {pendingApps.length === 0 ? (
        <Empty icon="check">All caught up — no applications waiting.</Empty>
      ) : (
        <div className="hh-app-grid">
          {pendingApps.map((a) => (
            <article key={a.id} className="hh-app">
              <div className="hh-app-top">
                <div className="hh-avatar">{a.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
                <div><b>{a.name}</b><small>{a.phone} · {a.email}</small></div>
                <Pill tone="review">Pending</Pill>
              </div>
              <dl className="hh-dl">
                <div><dt>Wants</dt><dd className="hh-cap">{a.roomType} room</dd></div>
                <div><dt>Move-in</dt><dd>{a.moveIn}</dd></div>
              </dl>
              {a.note && <p className="hh-quote">“{a.note}”</p>}
              <div className="hh-row-actions">
                <button className="hh-btn hh-btn-primary hh-btn-sm" onClick={() => setModal({ type: "approve", app: a })}><Icon name="check" size={14} /> Approve & assign room</button>
                <button className="hh-btn hh-btn-danger hh-btn-sm" onClick={() => setModal({ type: "reject", app: a })}><Icon name="close" size={14} /> Decline</button>
              </div>
            </article>
          ))}
        </div>
      )}
      {apps.some((a) => a.status !== "pending") && (
        <>
          <h3 className="hh-h3">Decided</h3>
          <ul className="hh-decided">
            {apps.filter((a) => a.status !== "pending").map((a) => (
              <li key={a.id}><span>{a.name}</span><Pill tone={a.status === "approved" ? "confirmed" : "rejected"}>{a.status === "approved" ? `Approved · ${a.roomNumber}` : "Declined"}</Pill></li>
            ))}
          </ul>
        </>
      )}
    </div>
  );

  const TenantsView = () => (
    <div className="hh-card">
      <SectionHead label="RESIDENTS" title="Manage tenants" note={`${tenants.length} residents`} />
      <div className="hh-toolbar">
        <div className="hh-search"><Icon name="search" size={16} /><input value={tenantQuery} onChange={(e) => setTenantQuery(e.target.value)} placeholder="Search name, phone or room" aria-label="Search tenants" /></div>
      </div>
      {shownTenants.length === 0 ? (
        <Empty icon="users">No residents match your search.</Empty>
      ) : (
        <div className="hh-table-wrap">
          <table className="hh-table">
            <thead><tr><th>Resident</th><th>Room</th><th>Rent</th><th>Paid</th><th>Balance</th><th>Since</th><th className="hh-actions-col">Actions</th></tr></thead>
            <tbody>
              {shownTenants.map((t) => (
                <tr key={t.id}>
                  <td data-label="Resident"><b>{t.name}</b><small className="hh-muted"> · {t.phone}</small></td>
                  <td data-label="Room">{t.room?.number}</td>
                  <td data-label="Rent">{fmt(t.rent)}</td>
                  <td data-label="Paid">{fmt(t.paid)}</td>
                  <td data-label="Balance">{t.balance > 0 ? <Pill tone="review">{fmt(t.balance)} due</Pill> : <Pill tone="confirmed">Cleared</Pill>}</td>
                  <td data-label="Since">{t.since}</td>
                  <td data-label="Actions" className="hh-actions-col">
                    <div className="hh-row-actions">
                      <button className="hh-btn hh-btn-ghost hh-btn-sm" onClick={() => setModal({ type: "transfer", tenant: t })}><Icon name="swap" size={14} /> Move</button>
                      <button className="hh-btn hh-btn-danger hh-btn-sm" onClick={() => setModal({ type: "remove", tenant: t })}><Icon name="trash" size={14} /> Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const PaymentsView = () => (
    <div className="hh-card">
      <SectionHead label="RECEIPT ACTIVITY" title="M-Pesa payments" note={`Paybill ${settings.paybill}`}>
        <button className="hh-btn hh-btn-primary hh-btn-sm" onClick={() => setModal({ type: "recordPayment" })}><Icon name="plus" size={14} /> Record payment</button>
      </SectionHead>
      <div className="hh-table-wrap">
        <table className="hh-table">
          <thead><tr><th>Reference</th><th>Resident</th><th>Amount</th><th>Received</th><th>Status</th><th className="hh-actions-col">Actions</th></tr></thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td data-label="Reference" className="hh-ref">{p.ref}</td>
                <td data-label="Resident">{tenantName(p.tenantId)}</td>
                <td data-label="Amount">{fmt(p.amount)}</td>
                <td data-label="Received">{p.received}</td>
                <td data-label="Status"><Pill tone={p.status}>{p.status === "confirmed" ? "Confirmed" : p.status === "review" ? "Review" : "Rejected"}</Pill></td>
                <td data-label="Actions" className="hh-actions-col">
                  {p.status === "review" ? (
                    <div className="hh-row-actions">
                      <button className="hh-btn hh-btn-primary hh-btn-sm" onClick={() => setPayment(p.id, "confirmed")}><Icon name="check" size={14} /> Confirm</button>
                      <button className="hh-btn hh-btn-danger hh-btn-sm" onClick={() => setPayment(p.id, "rejected")}><Icon name="close" size={14} /> Reject</button>
                    </div>
                  ) : <span className="hh-muted">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const MaintenanceView = () => (
    <div className="hh-card">
      <SectionHead label="MAINTENANCE" title="Repair requests" note={`${openTickets.length} open`}>
        <button className="hh-btn hh-btn-primary hh-btn-sm" onClick={() => setModal({ type: "ticket" })}><Icon name="plus" size={14} /> New request</button>
      </SectionHead>
      {tickets.length === 0 ? <Empty icon="wrench">No requests logged.</Empty> : (
        <ul className="hh-tickets">
          {tickets.map((t) => (
            <li key={t.id} className={t.status === "resolved" ? "done" : ""}>
              <div>
                <b>{t.issue}</b>
                <small>Room {roomLabel(t.roomId)} · <span className="hh-cap">{t.priority}</span> priority</small>
              </div>
              <Pill tone={t.status === "resolved" ? "confirmed" : t.status === "in-progress" ? "partial" : "review"}>{t.status === "in-progress" ? "In progress" : t.status[0].toUpperCase() + t.status.slice(1)}</Pill>
              {t.status !== "resolved" && (
                <button className="hh-btn hh-btn-ghost hh-btn-sm" onClick={() => advanceTicket(t.id)}>{t.status === "open" ? "Start work" : "Mark resolved"}</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const NoticesView = () => (
    <>
      <form className="hh-card hh-form" onSubmit={postNotice} noValidate>
        <SectionHead label="ANNOUNCEMENTS" title="Post a notice" note="Visible to all residents" />
        <div className="hh-form-grid">
          <label className="hh-field hh-span2"><span>Title</span><input value={noticeDraft.title} onChange={(e) => setNoticeDraft({ ...noticeDraft, title: e.target.value })} placeholder="e.g. Water maintenance on Saturday" /></label>
          <label className="hh-field hh-span2"><span>Message</span><textarea rows="3" value={noticeDraft.body} onChange={(e) => setNoticeDraft({ ...noticeDraft, body: e.target.value })} placeholder="Add the details residents need to know" /></label>
        </div>
        <div className="hh-form-foot"><button className="hh-btn hh-btn-primary" type="submit"><Icon name="bell" size={16} /> Post notice</button></div>
      </form>
      <div className="hh-card">
        <SectionHead label="NOTICE BOARD" title="Posted notices" />
        {notices.length === 0 ? <Empty icon="bell">No notices posted.</Empty> : (
          <ul className="hh-notices">
            {notices.map((n) => (
              <li key={n.id}>
                <div><b>{n.title}</b><p>{n.body}</p><small>{n.date}</small></div>
                <button className="hh-icon-btn hh-danger" aria-label={`Delete notice ${n.title}`} onClick={() => { setNotices((ns) => ns.filter((x) => x.id !== n.id)); notify("Notice deleted", "warn"); }}><Icon name="trash" size={16} /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );

  const SettingsView = () => (
    <>
      <form className="hh-card hh-form" onSubmit={saveSettings} noValidate>
        <SectionHead label="RESIDENCE SETTINGS" title="Rates & payments" />
        <div className="hh-form-grid">
          <label className="hh-field hh-span2"><span>Residence name</span><input value={settingsDraft.name} onChange={(e) => setSettingsDraft({ ...settingsDraft, name: e.target.value })} /></label>
          <label className="hh-field"><span>Default single-room rent (KES)</span><input type="number" min="0" value={settingsDraft.singleRent} onChange={(e) => setSettingsDraft({ ...settingsDraft, singleRent: e.target.value })} /></label>
          <label className="hh-field"><span>Default shared-room rent (KES)</span><input type="number" min="0" value={settingsDraft.sharedRent} onChange={(e) => setSettingsDraft({ ...settingsDraft, sharedRent: e.target.value })} /></label>
          <label className="hh-field hh-span2"><span>M-Pesa paybill / till</span><input value={settingsDraft.paybill} onChange={(e) => setSettingsDraft({ ...settingsDraft, paybill: e.target.value })} /></label>
        </div>
        <div className="hh-form-foot"><button className="hh-btn hh-btn-primary" type="submit"><Icon name="check" size={16} /> Save settings</button></div>
      </form>

      <div className="hh-card">
        <SectionHead label="ADMIN ACCESS" title="Staff accounts" note={`${staff.length} admins`} />
        <ul className="hh-staff">
          {staff.map((s) => (
            <li key={s.id}>
              <div className="hh-avatar">{s.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
              <div><b>{s.name}</b><small>{s.email}</small></div>
              <Pill tone={s.me ? "confirmed" : "partial"}>{s.role}</Pill>
              {!s.me && <button className="hh-icon-btn hh-danger" aria-label={`Remove ${s.name}`} onClick={() => { setStaff((x) => x.filter((y) => y.id !== s.id)); addLog(`Admin access removed for ${s.name}`); notify(`${s.name} no longer has admin access`, "warn"); }}><Icon name="trash" size={16} /></button>}
            </li>
          ))}
        </ul>
        <form className="hh-inline-form" onSubmit={inviteStaff} noValidate>
          <input placeholder="Full name" value={staffDraft.name} onChange={(e) => setStaffDraft({ ...staffDraft, name: e.target.value })} aria-label="Full name" />
          <input placeholder="Email address" value={staffDraft.email} onChange={(e) => setStaffDraft({ ...staffDraft, email: e.target.value })} aria-label="Email address" />
          <button className="hh-btn hh-btn-primary" type="submit"><Icon name="plus" size={16} /> Add admin</button>
        </form>
      </div>
    </>
  );

  /* ═════════════════════════ MODALS ═════════════════════════ */
  const renderModal = () => {
    if (!modal) return null;
    const close = () => setModal(null);

    if (modal.type === "approve") return <ApproveModal app={modal.app} rooms={roomsView} onClose={close} onApprove={(roomId) => { approveApp(modal.app, roomId); close(); }} />;
    if (modal.type === "reject")
      return (
        <Modal title="Decline application?" onClose={close} footer={<><button className="hh-btn hh-btn-ghost" onClick={close}>Keep pending</button><button className="hh-btn hh-btn-danger" onClick={() => { rejectApp(modal.app); close(); }}>Decline</button></>}>
          <p>Decline the application from <b>{modal.app.name}</b>? They will not be given a room.</p>
        </Modal>
      );
    if (modal.type === "remove") {
      const t = tenantsView.find((x) => x.id === modal.tenant.id) || modal.tenant;
      return (
        <Modal title="Remove this tenant?" onClose={close} footer={<><button className="hh-btn hh-btn-ghost" onClick={close}>Cancel</button><button className="hh-btn hh-btn-danger" onClick={() => { removeTenant(modal.tenant); close(); }}><Icon name="trash" size={16} /> Remove tenant</button></>}>
          <p><b>{t.name}</b> will be removed from room <b>{roomLabel(t.roomId)}</b> and the space becomes available for a new resident.</p>
          {t.balance > 0 && <p className="hh-callout">Heads up: {t.name} still has an open balance of <b>{fmt(t.balance)}</b>.</p>}
          <p className="hh-muted">Their past payment records are kept for your accounts.</p>
        </Modal>
      );
    }
    if (modal.type === "transfer") return <TransferModal tenant={modal.tenant} rooms={roomsView} onClose={close} onMove={(roomId) => { transferTenant(modal.tenant, roomId); close(); }} />;
    if (modal.type === "deleteRoom")
      return (
        <Modal title="Delete this room?" onClose={close} footer={<><button className="hh-btn hh-btn-ghost" onClick={close}>Cancel</button><button className="hh-btn hh-btn-danger" onClick={() => { deleteRoom(modal.room.id); close(); }}><Icon name="trash" size={16} /> Delete room</button></>}>
          <p>Delete room <b>{modal.room.number}</b>? Any maintenance requests for it will be removed too. This cannot be undone.</p>
        </Modal>
      );
    if (modal.type === "editRoom") return <EditRoomModal room={modal.room} onClose={close} onSave={(patch) => { updateRoom(modal.room.id, patch); close(); }} />;
    if (modal.type === "recordPayment") return <PaymentModal tenants={tenants} onClose={close} onSave={(d) => { recordPayment(d); close(); }} />;
    if (modal.type === "ticket") return <TicketModal rooms={rooms} onClose={close} onSave={(d) => { addTicket(d); close(); }} />;
    return null;
  };

  const views = { overview: OverviewView, rooms: RoomsView, approvals: ApprovalsView, tenants: TenantsView, payments: PaymentsView, maintenance: MaintenanceView, notices: NoticesView, settings: SettingsView };
  const ActiveView = views[view];
  const current = VIEWS.find((v) => v.id === view);

  /* ═════════════════════════ RENDER ═════════════════════════ */
  return (
    <div className="hh-dashboard">
      {/* ── Header (hamburger + right-hand drawer on small screens) ── */}
      <header className="hh-header">
        <div className="hh-header-inner">
          <button className="hh-burger" onClick={() => setDrawer(true)} aria-label="Open menu" aria-expanded={drawer} aria-controls="hh-drawer">
            <Icon name="menu" size={30} />
          </button>

          <Link to="/" className="hh-logo" aria-label="Weru Hostels home">
            <span className="hh-logo-mark">W</span>
            <span className="hh-logo-text">
              <span className="hh-logo-name">WERU HOSTELS</span>
              <span className="hh-logo-sub">A LITTLE MORE CLASS HOME</span>
            </span>
          </Link>

          <nav className="hh-nav" aria-label="Site">
            <Link to="/">Home</Link>
            <Link to="/login">Log out</Link>
            <Link to="/" className="hh-btn hh-btn-cream">Tenant preview <Icon name="arrow" size={16} /></Link>
          </nav>
        </div>
      </header>

      {/* Drawer (mobile) */}
      <div className={`hh-scrim ${drawer ? "open" : ""}`} onClick={() => setDrawer(false)} aria-hidden="true" />
      <aside id="hh-drawer" className={`hh-drawer ${drawer ? "open" : ""}`} aria-hidden={!drawer} aria-label="Menu">
        <button className="hh-drawer-close" onClick={() => setDrawer(false)} aria-label="Close menu"><Icon name="close" size={30} /></button>
        <div className="hh-drawer-brand">
          <span className="hh-logo-mark hh-logo-box">W</span>
          <span className="hh-logo-text">
            <span className="hh-logo-name">WERU HOSTELS</span>
            <span className="hh-logo-sub">A LITTLE MORE CLASS HOME</span>
          </span>
        </div>
        <nav className="hh-drawer-nav">
          {VIEWS.map((v) => (
            <button key={v.id} className={view === v.id ? "on" : ""} onClick={() => go(v.id)}>
              <span>{v.label}</span>
              {badges[v.id] > 0 && <em>{badges[v.id]}</em>}
            </button>
          ))}
        </nav>
        <hr />
        <div className="hh-drawer-foot">
          <Link to="/" onClick={() => setDrawer(false)}>Home</Link>
          <Link to="/login" onClick={() => setDrawer(false)}>Log out</Link>
          <Link to="/" className="hh-btn hh-btn-cream hh-btn-block" onClick={() => setDrawer(false)}>Tenant preview</Link>
        </div>
      </aside>

      {/* ── Section tabs (desktop) ── */}
      <div className="hh-tabs-bar">
        <div className="hh-tabs" role="tablist" aria-label="Admin sections">
          {VIEWS.map((v) => (
            <button key={v.id} role="tab" aria-selected={view === v.id} className={view === v.id ? "on" : ""} onClick={() => go(v.id)}>
              <Icon name={v.icon} size={16} /> {v.label}
              {badges[v.id] > 0 && <em>{badges[v.id]}</em>}
            </button>
          ))}
        </div>
      </div>

      <main className="hh-main">
        <div className="hh-breadcrumb"><span className="hh-breadcrumb-line" /><span>RESIDENCE ADMIN · {current.label.toUpperCase()}</span></div>
        <h1 className="hh-title">{view === "overview" ? "A clear view of home." : current.label}</h1>
        <p className="hh-subtitle">
          {{
            overview: "Room availability, rent due and the latest receipt activity — all in one place.",
            rooms: "Add new rooms, edit rent, and take rooms in and out of service.",
            approvals: "Review room applications, then approve and assign a room or decline.",
            tenants: "See who lives where, move residents between rooms, or remove a tenant.",
            payments: "Confirm or reject M-Pesa receipts and record cash payments.",
            maintenance: "Log repair requests and track them through to resolved.",
            notices: "Post announcements for every resident.",
            settings: "Default rents, payment details and who can access this dashboard.",
          }[view]}
        </p>

        {bannerOpen && (
          <div className="hh-preview-banner" role="note">
            <span className="hh-banner-icon"><Icon name="info" size={18} /></span>
            <p><strong>Preview data — not live.</strong> Changes you make here are kept in this browser session only and no real rent or payment information is connected.</p>
            <button className="hh-icon-btn" onClick={() => setBannerOpen(false)} aria-label="Dismiss"><Icon name="close" size={16} /></button>
          </div>
        )}

        <div className="hh-view" key={view}><ActiveView /></div>
      </main>

      <footer className="hh-site-footer">
        <div className="hh-site-footer-inner">
          <span>{settings.name}</span>
          <span>A welcoming place to call home.</span>
        </div>
      </footer>

      {renderModal()}
      {toast && <div className={`hh-toast ${toast.tone}`} role="status">{toast.tone === "warn" ? "•" : "✓"} {toast.msg}</div>}
    </div>
  );
}

/* ───────────── modal bodies with their own form state ───────────── */
function ApproveModal({ app, rooms, onClose, onApprove }) {
  const options = rooms
    .filter((r) => r.free > 0)
    .sort((a, b) => (b.type === app.roomType) - (a.type === app.roomType) || a.number.localeCompare(b.number));
  const [roomId, setRoomId] = useState(options[0]?.id || "");
  return (
    <Modal
      title="Approve & assign a room"
      onClose={onClose}
      footer={<><button className="hh-btn hh-btn-ghost" onClick={onClose}>Cancel</button><button className="hh-btn hh-btn-primary" disabled={!roomId} onClick={() => onApprove(roomId)}><Icon name="check" size={16} /> Approve</button></>}
    >
      <p><b>{app.name}</b> asked for a <b>{app.roomType}</b> room from {app.moveIn}.</p>
      {options.length === 0 ? (
        <p className="hh-callout">No rooms have space right now. Add a room or free one up first.</p>
      ) : (
        <label className="hh-field">
          <span>Assign to room</span>
          <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            {options.map((r) => (
              <option key={r.id} value={r.id}>
                {r.number} · {r.type} · {fmt(r.rent)} · {r.free} bed{r.free === 1 ? "" : "s"} free{r.type === app.roomType ? " ✓ matches request" : ""}
              </option>
            ))}
          </select>
        </label>
      )}
    </Modal>
  );
}
function TransferModal({ tenant, rooms, onClose, onMove }) {
  const options = rooms.filter((r) => r.free > 0 && r.id !== tenant.roomId);
  const [roomId, setRoomId] = useState(options[0]?.id || "");
  return (
    <Modal
      title={`Move ${tenant.name}`}
      onClose={onClose}
      footer={<><button className="hh-btn hh-btn-ghost" onClick={onClose}>Cancel</button><button className="hh-btn hh-btn-primary" disabled={!roomId} onClick={() => onMove(roomId)}><Icon name="swap" size={16} /> Move resident</button></>}
    >
      {options.length === 0 ? (
        <p className="hh-callout">There are no other rooms with space.</p>
      ) : (
        <label className="hh-field">
          <span>Move to room</span>
          <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            {options.map((r) => <option key={r.id} value={r.id}>{r.number} · {r.type} · {fmt(r.rent)} · {r.free} bed{r.free === 1 ? "" : "s"} free</option>)}
          </select>
        </label>
      )}
      <p className="hh-muted">Their rent will change to the new room's rate.</p>
    </Modal>
  );
}
function EditRoomModal({ room, onClose, onSave }) {
  const [rent, setRent] = useState(room.rent);
  const [block, setBlock] = useState(room.block || "");
  const [capacity, setCapacity] = useState(room.capacity);
  const minCap = Math.max(1, room.occ?.length || 1);
  const bad = !(Number(rent) > 0) || Number(capacity) < minCap;
  return (
    <Modal
      title={`Edit room ${room.number}`}
      onClose={onClose}
      footer={<><button className="hh-btn hh-btn-ghost" onClick={onClose}>Cancel</button><button className="hh-btn hh-btn-primary" disabled={bad} onClick={() => onSave({ rent: Number(rent), block: block.trim(), capacity: Number(capacity) })}>Save changes</button></>}
    >
      <div className="hh-form-grid">
        <label className="hh-field"><span>Monthly rent (KES)</span><input type="number" min="0" value={rent} onChange={(e) => setRent(e.target.value)} /></label>
        <label className="hh-field"><span>Beds / capacity</span><input type="number" min={minCap} max="6" value={capacity} onChange={(e) => setCapacity(e.target.value)} /></label>
        <label className="hh-field hh-span2"><span>Block / floor</span><input value={block} onChange={(e) => setBlock(e.target.value)} /></label>
      </div>
      {Number(capacity) < minCap && <p className="hh-error">Capacity can't be lower than the {minCap} current resident{minCap === 1 ? "" : "s"}.</p>}
      <p className="hh-muted">New rent applies to future residents; current residents keep their agreed rent.</p>
    </Modal>
  );
}
function PaymentModal({ tenants, onClose, onSave }) {
  const [tenantId, setTenantId] = useState(tenants[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState("");
  const bad = !tenantId || !(Number(amount) > 0);
  return (
    <Modal
      title="Record a payment"
      onClose={onClose}
      footer={<><button className="hh-btn hh-btn-ghost" onClick={onClose}>Cancel</button><button className="hh-btn hh-btn-primary" disabled={bad} onClick={() => onSave({ tenantId, amount, ref: ref.trim() })}>Save payment</button></>}
    >
      <div className="hh-form-grid">
        <label className="hh-field hh-span2"><span>Resident</span>
          <select value={tenantId} onChange={(e) => setTenantId(e.target.value)}>{tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
        </label>
        <label className="hh-field"><span>Amount (KES)</span><input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} /></label>
        <label className="hh-field"><span>M-Pesa code <em>(optional)</em></span><input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. QH9•••2XA" /></label>
      </div>
    </Modal>
  );
}
function TicketModal({ rooms, onClose, onSave }) {
  const [roomId, setRoomId] = useState(rooms[0]?.id || "");
  const [issue, setIssue] = useState("");
  const [priority, setPriority] = useState("medium");
  return (
    <Modal
      title="New maintenance request"
      onClose={onClose}
      footer={<><button className="hh-btn hh-btn-ghost" onClick={onClose}>Cancel</button><button className="hh-btn hh-btn-primary" disabled={!issue.trim() || !roomId} onClick={() => onSave({ roomId, issue: issue.trim(), priority })}>Log request</button></>}
    >
      <div className="hh-form-grid">
        <label className="hh-field"><span>Room</span><select value={roomId} onChange={(e) => setRoomId(e.target.value)}>{rooms.map((r) => <option key={r.id} value={r.id}>{r.number}</option>)}</select></label>
        <label className="hh-field"><span>Priority</span><select value={priority} onChange={(e) => setPriority(e.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
        <label className="hh-field hh-span2"><span>What needs fixing?</span><input value={issue} onChange={(e) => setIssue(e.target.value)} placeholder="e.g. Broken socket near the desk" /></label>
      </div>
    </Modal>
  );
}

export default AdminDashboard;