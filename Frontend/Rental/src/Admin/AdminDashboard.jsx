// src/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";


const API_URL = import.meta.env.VITE_API_URL || "https://rental-web-application-2.onrender.com/api";
const SOCKET_URL = API_URL.replace(/\/api\/?$/, ""); // sockets live at the server root
const ROOM_TYPES = ["Single", "Double", "Bedsitter"];
const kes = (n) => `KES ${Number(n || 0).toLocaleString()}`;
const emptyDraft = { roomNumber: "", roomType: "Single", rent: "" };

function AdminDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const [tab, setTab] = useState("applications");
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [drafts, setDrafts] = useState({}); // approval details per applicant
  const [rentDrafts, setRentDrafts] = useState({}); // edited rent per tenant
  const [bulk, setBulk] = useState({ roomType: "Single", rent: "" });
  const [live, setLive] = useState(false);
  const [toast, setToast] = useState("");
  const [busyId, setBusyId] = useState(null);

  const token = localStorage.getItem("token");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const api = useCallback(
    async (path, options = {}) => {
      const res = await fetch(`${API_URL}/admin${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Something went wrong.");
      return data;
    },
    [token]
  );

  const loadAll = useCallback(async () => {
    try {
      const [s, a, r, t] = await Promise.all([
        api("/stats"),
        api("/applications"),
        api("/rejected"),
        api("/tenants"),
      ]);
      setStats(s);
      setApplications(a);
      setRejected(r);
      setTenants(t);
    } catch (err) {
      showToast(err.message);
    }
  }, [api]);

  useEffect(() => {
    loadAll();
    // Backup refresh in case the live connection drops
    const timer = setInterval(loadAll, 30000);
    return () => clearInterval(timer);
  }, [loadAll]);

  // Realtime: refetch whenever the server says something changed
  useEffect(() => {
    const socket = io(SOCKET_URL, { auth: { token } });
    socket.on("connect", () => setLive(true));
    socket.on("disconnect", () => setLive(false));
    socket.on("connect_error", () => setLive(false));
    socket.on("applications:changed", loadAll);
    return () => socket.disconnect();
  }, [token, loadAll]);

  const draftOf = (id) => drafts[id] || emptyDraft;
  const setDraft = (id, field, value) =>
    setDrafts((d) => ({ ...d, [id]: { ...draftOf(id), [field]: value } }));

  const approve = async (app) => {
    const d = draftOf(app._id);
    setBusyId(app._id);
    try {
      await api(`/applications/${app._id}/approve`, {
        method: "PATCH",
        body: JSON.stringify({ roomNumber: d.roomNumber, roomType: d.roomType, rent: Number(d.rent) }),
      });
      showToast(`${app.firstName} approved for room ${d.roomNumber}.`);
      await loadAll();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (app) => {
    setBusyId(app._id);
    try {
      await api(`/applications/${app._id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({}),
      });
      showToast(`${app.firstName} rejected.`);
      await loadAll();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const run = async (id, action, doneMessage) => {
    setBusyId(id);
    try {
      await action();
      showToast(doneMessage);
      await loadAll();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const removeApplication = (a) => {
    if (!window.confirm(`Delete ${a.firstName} ${a.lastName}'s application permanently? They would have to register again.`)) return;
    run(a._id, () => api(`/applications/${a._id}`, { method: "DELETE" }), "Application deleted.");
  };

  const freeRoom = (t) => {
    if (!window.confirm(`Take ${t.firstName} out of room ${t.roomNumber}? They go back to the applications list.`)) return;
    run(t._id, () => api(`/tenants/${t._id}/free`, { method: "PATCH", body: JSON.stringify({}) }), `Room ${t.roomNumber} freed.`);
  };

  const removeTenant = (t) => {
    if (!window.confirm(`Delete ${t.firstName} ${t.lastName}'s account permanently? Their payment records are kept.`)) return;
    run(t._id, () => api(`/tenants/${t._id}`, { method: "DELETE" }), "Tenant deleted.");
  };

  const saveRent = async (tenant) => {
    try {
      await api(`/tenants/${tenant._id}`, {
        method: "PATCH",
        body: JSON.stringify({ rent: Number(rentDrafts[tenant._id]) }),
      });
      setRentDrafts((d) => {
        const { [tenant._id]: _gone, ...rest } = d;
        return rest;
      });
      showToast(`${tenant.firstName}'s rent saved.`);
      await loadAll();
    } catch (err) {
      showToast(err.message);
    }
  };

  const applyBulk = async () => {
    try {
      const out = await api("/rent-by-type", {
        method: "PATCH",
        body: JSON.stringify({ roomType: bulk.roomType, rent: Number(bulk.rent) }),
      });
      showToast(`${out.updated} ${bulk.roomType} tenants updated.`);
      setBulk({ ...bulk, rent: "" });
      await loadAll();
    } catch (err) {
      showToast(err.message);
    }
  };

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
          <div className="close-icon" onClick={closeMenu}>
            ✖
          </div>
          <nav className="navs2">
            <Link to="/" onClick={closeMenu}>Home</Link>
            <a href="#about" onClick={closeMenu}>About</a>
            <a href="#contact" onClick={closeMenu}>Contact Us</a>
          </nav>
        </div>
        <div className="menu-icon" onClick={toggleMenu}>
          ☰
        </div>
      </div>

      <div className="dashboard">
        <main className="main">
          <div className="ad-titlebar">
            <div>
              <h1 className="welcome-title">Administration</h1>
              <p className="welcome-sub">Approve applications, assign rooms and set rent.</p>
            </div>
            <span className={`ad-live ${live ? "on" : ""}`}>
              {live ? "Live" : "Reconnecting…"}
            </span>
          </div>

          <div className="ad-stats">
            <div className="ad-stat">
              <span>Waiting for approval</span>
              <strong>{stats?.pending ?? "–"}</strong>
            </div>
            <div className="ad-stat">
              <span>Approved tenants</span>
              <strong>{stats?.tenants ?? "–"}</strong>
            </div>
            <div className="ad-stat">
              <span>Rooms occupied</span>
              <strong>{stats?.roomsOccupied ?? "–"}</strong>
            </div>
            <div className="ad-stat">
              <span>Rent expected monthly</span>
              <strong>{stats ? kes(stats.expectedRent) : "–"}</strong>
            </div>
            <div className="ad-stat">
              <span>Collected this month</span>
              <strong>{stats ? kes(stats.collected) : "–"}</strong>
            </div>
          </div>

          <div className="ad-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={tab === "applications"}
              className={tab === "applications" ? "active" : ""}
              onClick={() => setTab("applications")}
            >
              Applications {applications.length > 0 && <em>{applications.length}</em>}
            </button>
            <button
              role="tab"
              aria-selected={tab === "tenants"}
              className={tab === "tenants" ? "active" : ""}
              onClick={() => setTab("tenants")}
            >
              Tenants and rent
            </button>
          </div>

          {tab === "applications" && (
            <>
            <div className="history-card">
              <div className="history-header">
                <h3 className="history-title">New applications</h3>
              </div>

              {applications.length === 0 ? (
                <p className="ad-empty">No applications waiting. New registrations appear here instantly.</p>
              ) : (
                <div className="ad-table-wrap">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Applicant</th>
                        <th>Course</th>
                        <th>Room</th>
                        <th>Type</th>
                        <th>Rent (KES)</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((a) => {
                        const d = draftOf(a._id);
                        const ready = d.roomNumber.trim() && Number(d.rent) > 0;
                        return (
                          <tr key={a._id}>
                            <td>
                              {a.firstName} {a.lastName}
                              <div className="ad-sub">{a.regno} · {a.phoneno}</div>
                              <div className="ad-sub">{a.email}</div>
                            </td>
                            <td>{a.course}</td>
                            <td>
                              <input
                                className="ad-price"
                                placeholder="e.g. A-04"
                                value={d.roomNumber}
                                onChange={(e) => setDraft(a._id, "roomNumber", e.target.value)}
                              />
                            </td>
                            <td>
                              <select
                                value={d.roomType}
                                onChange={(e) => setDraft(a._id, "roomType", e.target.value)}
                              >
                                {ROOM_TYPES.map((t) => (
                                  <option key={t}>{t}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                className="ad-price"
                                type="number"
                                min="0"
                                placeholder="Monthly rent"
                                value={d.rent}
                                onChange={(e) => setDraft(a._id, "rent", e.target.value)}
                              />
                            </td>
                            <td className="ad-actions">
                              <button
                                className="ad-btn ok"
                                disabled={!ready || busyId === a._id}
                                onClick={() => approve(a)}
                              >
                                Approve
                              </button>
                              <button
                                className="ad-btn no"
                                disabled={busyId === a._id}
                                onClick={() => reject(a)}
                              >
                                Reject
                              </button>
                              <button
                                className="ad-btn plain"
                                disabled={busyId === a._id}
                                onClick={() => removeApplication(a)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {rejected.length > 0 && (
              <div className="history-card">
                <div className="history-header">
                  <h3 className="history-title">Rejected</h3>
                </div>
                <div className="ad-table-wrap">
                  <table className="history-table">
                    <tbody>
                      {rejected.map((a) => (
                        <tr key={a._id}>
                          <td>
                            {a.firstName} {a.lastName}
                            <div className="ad-sub">{a.regno} · {a.email}</div>
                          </td>
                          <td>{a.course}</td>
                          <td className="ad-actions">
                            <button
                              className="ad-btn plain"
                              disabled={busyId === a._id}
                              onClick={() => removeApplication(a)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            </>
          )}

          {tab === "tenants" && (
            <>
              <div className="know-card">
                <h3 className="know-title">Set one rent for a room type</h3>
                <div className="ad-form-row">
                  <select
                    value={bulk.roomType}
                    onChange={(e) => setBulk({ ...bulk, roomType: e.target.value })}
                  >
                    {ROOM_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    placeholder="Monthly rent (KES)"
                    value={bulk.rent}
                    onChange={(e) => setBulk({ ...bulk, rent: e.target.value })}
                  />
                  <button className="ad-btn ok" onClick={applyBulk} disabled={!bulk.rent}>
                    Apply to all
                  </button>
                </div>
              </div>

              <div className="history-card">
                <div className="history-header">
                  <h3 className="history-title">Approved tenants</h3>
                </div>
                {tenants.length === 0 ? (
                  <p className="ad-empty">No approved tenants yet.</p>
                ) : (
                  <div className="ad-table-wrap">
                    <table className="history-table">
                      <thead>
                        <tr>
                          <th>Tenant</th>
                          <th>Room</th>
                          <th>Type</th>
                          <th>Rent (KES)</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {tenants.map((t) => {
                          const draft = rentDrafts[t._id];
                          const changed = draft !== undefined && Number(draft) !== t.rent;
                          return (
                            <tr key={t._id}>
                              <td>
                                {t.firstName} {t.lastName}
                                <div className="ad-sub">{t.regno}</div>
                              </td>
                              <td>{t.roomNumber || "–"}</td>
                              <td>{t.roomType || "–"}</td>
                              <td>
                                <input
                                  className="ad-price"
                                  type="number"
                                  min="0"
                                  value={draft ?? t.rent ?? 0}
                                  onChange={(e) =>
                                    setRentDrafts({ ...rentDrafts, [t._id]: e.target.value })
                                  }
                                />
                              </td>
                              <td className="ad-actions">
                                {changed && (
                                  <button className="ad-btn ok" onClick={() => saveRent(t)}>
                                    Save rent
                                  </button>
                                )}
                                <button
                                  className="ad-btn plain"
                                  disabled={busyId === t._id}
                                  onClick={() => freeRoom(t)}
                                >
                                  Free room
                                </button>
                                <button
                                  className="ad-btn no"
                                  disabled={busyId === t._id}
                                  onClick={() => removeTenant(t)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
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

      {toast && <div className="ad-toast" role="status">{toast}</div>}
    </>
  );
}

export default AdminDashboard;