
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";


const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ROOM_TYPES = ["Single", "Double", "Bedsitter"];
const kes = (n) => `KES ${Number(n || 0).toLocaleString()}`;

function AdminDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const [tab, setTab] = useState("approvals");
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [priceDrafts, setPriceDrafts] = useState({});
  const [bulk, setBulk] = useState({ type: "Single", price: "" });
  const [newRoom, setNewRoom] = useState({ number: "", type: "Single", price: "" });
  const [live, setLive] = useState(false);
  const [toast, setToast] = useState("");
  const [busyId, setBusyId] = useState(null);

  const token = localStorage.getItem("token");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // One helper for every API call
  const api = useCallback(
    async (path, options = {}) => {
      const res = await fetch(`${API}/api/admin${path}`, {
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
      const [s, r, b] = await Promise.all([
        api("/stats"),
        api("/rooms"),
        api("/bookings"),
      ]);
      setStats(s);
      setRooms(r);
      setBookings(b);
    } catch (err) {
      showToast(err.message);
    }
  }, [api]);

  // Initial load
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Realtime: refetch whenever the server says something changed
  useEffect(() => {
    const socket = io(API, { auth: { token } });
    socket.on("connect", () => setLive(true));
    socket.on("disconnect", () => setLive(false));
    socket.on("connect_error", () => setLive(false));
    socket.on("bookings:changed", loadAll);
    socket.on("rooms:changed", loadAll);
    return () => socket.disconnect();
  }, [token, loadAll]);

  const pending = bookings.filter((b) => b.status === "pending");
  const handled = bookings.filter((b) => b.status !== "pending");

  const decide = async (id, action) => {
    setBusyId(id);
    try {
      await api(`/bookings/${id}/${action}`, { method: "PATCH", body: JSON.stringify({}) });
      showToast(action === "approve" ? "Request approved." : "Request rejected.");
      await loadAll();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const savePrice = async (room) => {
    const price = Number(priceDrafts[room._id]);
    if (isNaN(price) || price < 0) return showToast("Enter a valid price.");
    try {
      await api(`/rooms/${room._id}`, { method: "PATCH", body: JSON.stringify({ price }) });
      setPriceDrafts((d) => {
        const { [room._id]: _gone, ...rest } = d;
        return rest;
      });
      showToast(`Room ${room.number} price saved.`);
      await loadAll();
    } catch (err) {
      showToast(err.message);
    }
  };

  const changeStatus = async (room, status) => {
    try {
      await api(`/rooms/${room._id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      await loadAll();
    } catch (err) {
      showToast(err.message);
    }
  };

  const applyBulkPrice = async () => {
    try {
      const out = await api("/rooms-price/by-type", {
        method: "PATCH",
        body: JSON.stringify({ type: bulk.type, price: Number(bulk.price) }),
      });
      showToast(`${out.updated} ${bulk.type} rooms updated.`);
      setBulk({ ...bulk, price: "" });
      await loadAll();
    } catch (err) {
      showToast(err.message);
    }
  };

  const addRoom = async (e) => {
    e.preventDefault();
    try {
      await api("/rooms", {
        method: "POST",
        body: JSON.stringify({ ...newRoom, price: Number(newRoom.price) }),
      });
      setNewRoom({ number: "", type: "Single", price: "" });
      showToast("Room added.");
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
              <p className="welcome-sub">Approve room requests, set rent and watch occupancy.</p>
            </div>
            <span className={`ad-live ${live ? "on" : ""}`}>
              {live ? "Live" : "Reconnecting…"}
            </span>
          </div>

          {/* Overview */}
          <div className="ad-stats">
            <div className="ad-stat">
              <span>Rooms</span>
              <strong>{stats?.totalRooms ?? "–"}</strong>
            </div>
            <div className="ad-stat">
              <span>Available</span>
              <strong>{stats?.available ?? "–"}</strong>
            </div>
            <div className="ad-stat">
              <span>Occupied</span>
              <strong>{stats?.occupied ?? "–"}</strong>
            </div>
            <div className="ad-stat">
              <span>Waiting for approval</span>
              <strong>{stats?.pending ?? "–"}</strong>
            </div>
            <div className="ad-stat">
              <span>Monthly rent roll</span>
              <strong>{stats ? kes(stats.monthlyRentRoll) : "–"}</strong>
            </div>
          </div>

          {/* Tabs */}
          <div className="ad-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={tab === "approvals"}
              className={tab === "approvals" ? "active" : ""}
              onClick={() => setTab("approvals")}
            >
              Approvals {pending.length > 0 && <em>{pending.length}</em>}
            </button>
            <button
              role="tab"
              aria-selected={tab === "rooms"}
              className={tab === "rooms" ? "active" : ""}
              onClick={() => setTab("rooms")}
            >
              Rooms and prices
            </button>
          </div>

          {/* Approvals */}
          {tab === "approvals" && (
            <div className="history-card">
              <div className="history-header">
                <div>
                  <h3 className="history-title">Room requests</h3>
                </div>
              </div>

              {pending.length === 0 ? (
                <p className="ad-empty">No requests waiting. New ones appear here instantly.</p>
              ) : (
                <div className="ad-table-wrap">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Tenant</th>
                        <th>Course</th>
                        <th>Room</th>
                        <th>Rent</th>
                        <th>Requested</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pending.map((b) => (
                        <tr key={b._id}>
                          <td>
                            {b.tenantName}
                            <div className="ad-sub">{b.email}</div>
                          </td>
                          <td>{b.course || "–"}</td>
                          <td>{b.room ? `${b.room.number} · ${b.room.type}` : "–"}</td>
                          <td>{b.room ? kes(b.room.price) : "–"}</td>
                          <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                          <td className="ad-actions">
                            <button
                              className="ad-btn ok"
                              disabled={busyId === b._id}
                              onClick={() => decide(b._id, "approve")}
                            >
                              Approve
                            </button>
                            <button
                              className="ad-btn no"
                              disabled={busyId === b._id}
                              onClick={() => decide(b._id, "reject")}
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {handled.length > 0 && (
                <>
                  <h4 className="ad-subhead">Recently handled</h4>
                  <div className="ad-table-wrap">
                    <table className="history-table">
                      <tbody>
                        {handled.slice(0, 8).map((b) => (
                          <tr key={b._id}>
                            <td>{b.tenantName}</td>
                            <td>{b.room?.number || "–"}</td>
                            <td>
                              <span className={`status ad-${b.status}`}>
                                {b.status === "approved" ? "Approved" : "Rejected"}
                              </span>
                            </td>
                            <td>{b.decidedAt ? new Date(b.decidedAt).toLocaleDateString() : ""}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Rooms and prices */}
          {tab === "rooms" && (
            <>
              <div className="two-col">
                <div className="know-card">
                  <h3 className="know-title">Set one price for a room type</h3>
                  <div className="ad-form-row">
                    <select
                      value={bulk.type}
                      onChange={(e) => setBulk({ ...bulk, type: e.target.value })}
                    >
                      {ROOM_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0"
                      placeholder="Monthly rent (KES)"
                      value={bulk.price}
                      onChange={(e) => setBulk({ ...bulk, price: e.target.value })}
                    />
                    <button className="ad-btn ok" onClick={applyBulkPrice} disabled={!bulk.price}>
                      Apply to all
                    </button>
                  </div>
                </div>

                <form className="know-card" onSubmit={addRoom}>
                  <h3 className="know-title">Add a room</h3>
                  <div className="ad-form-row">
                    <input
                      required
                      placeholder="Room number, e.g. A-05"
                      value={newRoom.number}
                      onChange={(e) => setNewRoom({ ...newRoom, number: e.target.value })}
                    />
                    <select
                      value={newRoom.type}
                      onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                    >
                      {ROOM_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                    <input
                      required
                      type="number"
                      min="0"
                      placeholder="Rent (KES)"
                      value={newRoom.price}
                      onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
                    />
                    <button className="ad-btn ok" type="submit">Add room</button>
                  </div>
                </form>
              </div>

              <div className="history-card">
                <div className="history-header">
                  <h3 className="history-title">All rooms</h3>
                </div>
                <div className="ad-table-wrap">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Room</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Rent (KES)</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map((r) => {
                        const draft = priceDrafts[r._id];
                        const changed = draft !== undefined && Number(draft) !== r.price;
                        return (
                          <tr key={r._id}>
                            <td>{r.number}</td>
                            <td>{r.type}</td>
                            <td>
                              <select
                                value={r.status}
                                onChange={(e) => changeStatus(r, e.target.value)}
                              >
                                <option value="available">Available</option>
                                <option value="occupied">Occupied</option>
                                <option value="maintenance">Maintenance</option>
                              </select>
                            </td>
                            <td>
                              <input
                                className="ad-price"
                                type="number"
                                min="0"
                                value={draft ?? r.price}
                                onChange={(e) =>
                                  setPriceDrafts({ ...priceDrafts, [r._id]: e.target.value })
                                }
                              />
                            </td>
                            <td>
                              {changed && (
                                <button className="ad-btn ok" onClick={() => savePrice(r)}>
                                  Save price
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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