import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const fmt = (n) => "KES " + Number(n || 0).toLocaleString("en-KE");
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const monthName = (ym) =>
  new Date(`${ym}-01T00:00:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

const STATUS_LABEL = { confirmed: "Confirmed", pending: "Pending", failed: "Failed" };

function TenantDashboard() {
  const navigate = useNavigate();

  /* ───────── header menu (unchanged) ───────── */
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  /* ───────── data ───────── */
  const [data, setData] = useState(null);        // { user, rental }
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  /* ───────── payment modal ───────── */
  const [payOpen, setPayOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [paying, setPaying] = useState(false);
  const alive = useRef(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }, [navigate]);

  /* every request carries the login token; an expired token sends the user back to login */
  const authFetch = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); throw new Error("no-token"); }
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) },
    });
    const body = await res.json().catch(() => ({}));
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.error(body.message || "Please log in again");
      navigate("/login");
      throw new Error("unauthorised");
    }
    return { res, body };
  }, [navigate]);

  const load = useCallback(async () => {
    try {
      const { res, body } = await authFetch("/tenant/me");
      if (!res.ok) throw new Error(body.message || "Could not load your details");
      if (body.user.role === "admin") { navigate("/AdminDashboard"); return; }
      if (!alive.current) return;
      setData(body);
      setLoadError("");
    } catch (err) {
      if (["no-token", "unauthorised"].includes(err.message)) return;
      if (alive.current) setLoadError(err.message || "Cannot reach the server");
    } finally {
      if (alive.current) setLoading(false);
    }
  }, [authFetch, navigate]);

  useEffect(() => {
    alive.current = true;
    load();
    return () => { alive.current = false; };
  }, [load]);

  const user = data?.user;
  const rental = data?.rental;                 // null until an admin approves
  const approved = user?.status === "approved" && rental;

  /* ───────── M-Pesa STK push ───────── */
  const openPay = () => {
    setAmount(String(rental.balance));
    setPhone(user.phoneno || "");
    setPayOpen(true);
  };

  const waitForPayment = async (paymentId, toastId) => {
    for (let i = 0; i < 20; i++) {                         // ~60 seconds
      await new Promise((r) => setTimeout(r, 3000));
      if (!alive.current) return;
      try {
        const { body } = await authFetch(`/tenant/payments/${paymentId}`);
        if (body.status === "confirmed") {
          toast.success(`Payment received${body.receipt ? ` · ${body.receipt}` : ""}`, { id: toastId, duration: 5000 });
          load();
          return;
        }
        if (body.status === "failed") {
          toast.error(body.message || "Payment was not completed", { id: toastId });
          load();
          return;
        }
      } catch { return; }
    }
    toast("Still waiting for M-Pesa. Your balance updates automatically once it is confirmed.", { id: toastId, icon: "⏳", duration: 6000 });
    load();
  };

  const submitPay = async (e) => {
    e.preventDefault();
    if (paying) return;
    const value = Number(amount);
    if (!(value >= 1)) return toast.error("Enter a valid amount");
    if (value > rental.balance) return toast.error(`You owe ${fmt(rental.balance)} this month`);

    setPaying(true);
    try {
      const { res, body } = await authFetch("/tenant/pay", {
        method: "POST",
        body: JSON.stringify({ amount: value, phone }),
      });
      if (!res.ok) { toast.error(body.message || "Could not start the payment"); return; }

      setPayOpen(false);
      const toastId = toast.loading("Check your phone and enter your M-Pesa PIN…");
      waitForPayment(body.paymentId, toastId);
    } catch (err) {
      if (!["no-token", "unauthorised"].includes(err.message)) toast.error("Cannot reach the server. Check your connection.");
    } finally {
      setPaying(false);
    }
  };

  /* ───────── render ───────── */
  return (
    <>
      <div className="headers">
        <div className={`head2 ${isOpen ? "open" : " "}`}>
          <div className="weru2">
            <button className="w-button2">W</button>
            <div className="werus2">
              <h3>WERU HOSTELS</h3>
              <p>A LITTLE MORE CLASS HOME</p>
            </div>
          </div>
          <div className="close-icon" onClick={closeMenu}>✖</div>
          <nav className="navs2">
            <Link to="/" onClick={closeMenu}>Home</Link>
            <a href="#about" onClick={closeMenu}>About</a>
            <a href="#contact" onClick={closeMenu}>Contact Us</a>
            <a href="#logout" onClick={(e) => { e.preventDefault(); closeMenu(); logout(); }}>Log out</a>
          </nav>
        </div>
        <div className="menu-icon" onClick={toggleMenu}>☰</div>
      </div>

      <div className="dashboard">
        <main className="main">
          <div className="breadcrumb">
            <span className="breadcrumb-line"></span>
            <span>RESIDENT SPACE</span>
          </div>

          {loading && <p className="welcome-sub">Loading your details…</p>}

          {!loading && loadError && (
            <div className="status-card status-error">
              <h3>We couldn't load your page</h3>
              <p>{loadError}</p>
              <button className="btn-payment" onClick={() => { setLoading(true); load(); }}>Try again</button>
            </div>
          )}

          {!loading && user && (
            <>
              <h1 className="welcome-title">Welcome home, {user.firstName}.</h1>
              <p className="welcome-sub">
                {approved
                  ? "A simple overview of your room, rent and recent payment history."
                  : "Here is where your application stands."}
              </p>

              {/* ── not approved yet: NO rental data is shown ── */}
              {user.status !== "approved" && user.status !== "rejected" && (
                <div className="status-card status-pending">
                  <span className="status-badge">Pending approval</span>
                  <h3>Your application is being reviewed</h3>
                  <p>
                    The administrator will approve your application and assign your room. Your room,
                    rent and payment options appear here as soon as that is done.
                  </p>
                </div>
              )}
              {user.status === "rejected" && (
                <div className="status-card status-error">
                  <span className="status-badge">Not approved</span>
                  <h3>We couldn't approve your application</h3>
                  <p>{user.rejectReason || "Please contact the administrator for more information."}</p>
                </div>
              )}

              {/* ── resident card (profile is always visible; room only after approval) ── */}
              <div className="resident-card">
                <div className="resident-top">
                  <div>
                    <div className="resident-label">YOUR RESIDENCE</div>
                    <h2 className="resident-name">{user.firstName} {user.lastName}</h2>
                    <p className="resident-reg">Course registration · {user.regno}</p>
                  </div>

                  {approved && (
                    <div className="room-badge">
                      <div className="room-badge-label">ROOM</div>
                      <div className="room-badge-number">{rental.roomNumber}</div>
                      <div className="room-badge-type">{rental.roomType}</div>
                    </div>
                  )}
                </div>

                {approved && (
                  <div className="room-line">
                    <span className="chip chip-room">Room {rental.roomNumber}</span>
                    <span className="chip">{rental.roomType} room</span>
                    <span className="chip">{fmt(rental.rent)} per month</span>
                  </div>
                )}

                <div className="info-row">
                  <div className="info-item">
                    <div className="info-label">Phone</div>
                    <div className="info-value">{user.phoneno}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Email</div>
                    <div className="info-value">{user.email}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Course</div>
                    <div className="info-value">{user.course}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">{approved ? "Room type" : "Room requested"}</div>
                    <div className="info-value">{(approved && rental.roomType) || user.roomType || "—"}</div>
                  </div>
                </div>
              </div>

              {/* ── rental data: approved tenants only ── */}
              {approved && (
                <>
                  <div className="two-col">
                    <div className="rent-card">
                      <div className="rent-label">{monthName(rental.month).toUpperCase()} RENT</div>
                      <div className="rent-amount">{fmt(rental.rent)}</div>

                      <div className="rent-details">
                        <div className="rent-row">
                          <span>Amount paid</span>
                          <span>{fmt(rental.paid)}</span>
                        </div>
                        <div className="rent-row">
                          <span>Balance due</span>
                          <span>{fmt(rental.balance)}</span>
                        </div>
                        <div className="rent-due">Due {fmtDate(rental.dueDate)}</div>
                      </div>

                      <button className="btn-payment btn-mpesa" onClick={openPay} disabled={rental.balance <= 0}>
                        {rental.balance <= 0 ? "Rent cleared ✓" : "Pay with M-Pesa"}
                        {rental.balance > 0 && <span>→</span>}
                      </button>
                    </div>

                    <div className="know-card">
                      <div className="know-label">YOUR RENT, CLEARLY</div>
                      <h3 className="know-title">Know where you stand.</h3>
                      <p className="know-text">
                        Your current balance is shown separately from payments already recorded. Room
                        placement and rent are assigned by the residence administrator.
                      </p>
                      <div className="know-note">
                        <span>✓</span>
                        <span>Pay safely: you get an M-Pesa prompt on your phone and confirm with your PIN.</span>
                      </div>
                    </div>
                  </div>

                  <div className="history-card">
                    <div className="history-header">
                      <div>
                        <div className="history-label">PAYMENT HISTORY</div>
                        <h3 className="history-title">Recent entries</h3>
                      </div>
                    </div>

                    {rental.payments.length === 0 ? (
                      <p className="history-empty">No payments yet. Your M-Pesa payments will appear here.</p>
                    ) : (
                      <div className="history-scroll">
                        <table className="history-table">
                          <thead>
                            <tr><th>DATE</th><th>REFERENCE</th><th>AMOUNT</th><th>STATUS</th></tr>
                          </thead>
                          <tbody>
                            {rental.payments.map((p) => (
                              <tr key={p.id}>
                                <td>{fmtDate(p.date)}</td>
                                <td className="ref">{p.reference || "—"}</td>
                                <td>{fmt(p.amount)}</td>
                                <td><span className={`status status-${p.status}`}>{STATUS_LABEL[p.status]}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="footer-links">
                <a href="#logout" onClick={(e) => { e.preventDefault(); logout(); }}>
                  <span>→</span> Log out
                </a>
              </div>
            </>
          )}
        </main>

        <footer className="site-footer">
          <div className="site-footer-inner">
            <span>Weru Hostels</span>
            <span>A welcoming place to call home.</span>
          </div>
        </footer>
      </div>

      {/* ── M-Pesa payment pop-up ── */}
      {payOpen && approved && (
        <div className="pay-overlay" onMouseDown={(e) => e.target === e.currentTarget && !paying && setPayOpen(false)}>
          <form className="pay-modal" onSubmit={submitPay} role="dialog" aria-modal="true" aria-label="Pay rent with M-Pesa">
            <div className="pay-head">
              <span className="mpesa-mark">M-PESA</span>
              <h3>Pay rent</h3>
            </div>
            <p className="pay-sub">
              Room {rental.roomNumber} · {rental.roomType} · {monthName(rental.month)}
              <br />
              Balance: <b>{fmt(rental.balance)}</b>
            </p>

            <label htmlFor="pay-amount">Amount (KES)</label>
            <input id="pay-amount" type="number" min="1" max={rental.balance} value={amount}
                   onChange={(e) => setAmount(e.target.value)} required />
            <div className="quick-amounts">
              <button type="button" onClick={() => setAmount(String(rental.balance))}>Full balance</button>
              {rental.balance >= 2 && (
                <button type="button" onClick={() => setAmount(String(Math.ceil(rental.balance / 2)))}>Half</button>
              )}
            </div>

            <label htmlFor="pay-phone">M-Pesa phone number</label>
            <input id="pay-phone" type="tel" placeholder="0712 345 678" value={phone}
                   onChange={(e) => setPhone(e.target.value)} required />

            <p className="pay-hint">You'll get a prompt on this number. Enter your M-Pesa PIN to finish.</p>

            <div className="pay-actions">
              <button type="button" className="pay-cancel" onClick={() => setPayOpen(false)} disabled={paying}>Cancel</button>
              <button type="submit" className="pay-go" disabled={paying}>
                {paying ? "Sending…" : `Pay ${fmt(amount)}`}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default TenantDashboard;