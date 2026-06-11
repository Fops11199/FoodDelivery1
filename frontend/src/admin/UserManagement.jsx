import React, { useEffect, useState, useContext } from "react";
import { Users, Ban, Trash2, Search, Shield, RefreshCw, AlertCircle } from "lucide-react";
import { StoreContext } from "../context/StoreContext";
import { API_URL } from "../utils/api";

const UserManagement = () => {
  const { showAlert, showConfirm } = useContext(StoreContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/user/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
        setError(null);
      } else {
        setError(data.message || "Failed to load users");
      }
    } catch (err) {
      console.error("Users fetch error:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBanUser = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/user/ban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (data.success) {
        fetchUsers(true);
      } else {
        showAlert(data.message || "Failed to update user status", "error", "Update Failed");
      }
    } catch (err) {
      console.error("Ban user error:", err);
      showAlert("Failed to update user status", "error", "Update Error");
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = await showConfirm("Are you sure you want to delete this user? This action cannot be undone.", "Delete User");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/user/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (data.success) {
        fetchUsers(true);
      } else {
        showAlert(data.message || "Failed to delete user", "error", "Delete Failed");
      }
    } catch (err) {
      console.error("Delete user error:", err);
      showAlert("Failed to delete user", "error", "Delete Error");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="py-20 flex flex-col justify-center items-center text-left">
        <div className="w-10 h-10 border-3 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold tracking-widest text-brand-charcoal/50 uppercase mt-4">Loading User Database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 text-center max-w-xl mx-auto my-12 select-none text-left">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-4">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-xl font-bold font-serif text-rose-950">System Error</h3>
        <p className="text-sm text-rose-900/70 mt-2 font-light leading-relaxed">{error}</p>
        <button 
          onClick={() => fetchUsers()}
          className="mt-6 px-5 py-2.5 bg-rose-950 text-white font-semibold text-xs rounded-full uppercase tracking-wider hover:bg-rose-900 transition-all flex items-center gap-2 mx-auto shadow-md"
        >
          <RefreshCw size={12} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in select-none text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ebdcae]/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-serif text-brand-charcoal">User Management</h1>
          <p className="text-xs text-brand-charcoal/55 font-light tracking-wide mt-1">
            View, manage, and moderate registered customer accounts.
          </p>
        </div>
        <button 
          onClick={() => fetchUsers(true)}
          disabled={refreshing}
          className="self-start px-4.5 py-2.5 bg-brand-charcoal hover:bg-brand-gold text-white hover:text-brand-charcoal rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-50"
        >
          <RefreshCw size={11} className={`${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/30" size={18} />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-brand-charcoal/10 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm transition-all shadow-sm"
        />
      </div>

      {/* USERS TABLE */}
      <div className="bg-white border border-[#ebdcae]/15 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-charcoal/5 border-b border-[#ebdcae]/10">
              <tr>
                <th className="text-left px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60">User</th>
                <th className="text-left px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60">Email</th>
                <th className="text-left px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60">Role</th>
                <th className="text-left px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60">Status</th>
                <th className="text-left px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-sm text-brand-charcoal/40 font-light italic">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-[#ebdcae]/5 hover:bg-brand-cream/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-brand-charcoal">{user.name}</p>
                          <p className="text-[10px] text-brand-charcoal/40">ID: {user._id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-brand-charcoal/70">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      {user.isAdmin ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-gold/10 text-brand-gold text-[10px] font-bold uppercase tracking-wider rounded-full border border-brand-gold/20">
                          <Shield size={10} />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-charcoal/5 text-brand-charcoal/60 text-[10px] font-bold uppercase tracking-wider rounded-full">
                          <Users size={10} />
                          Customer
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.isBanned ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-rose-100">
                          <Ban size={10} />
                          Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-100">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {!user.isAdmin && (
                          <>
                            <button
                              onClick={() => handleBanUser(user._id, user.isBanned)}
                              className={`p-2 rounded-lg transition-all ${
                                user.isBanned
                                  ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                  : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                              }`}
                              title={user.isBanned ? "Unban user" : "Ban user"}
                            >
                              <Ban size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all"
                              title="Delete user"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                        {user.isAdmin && (
                          <span className="text-[10px] text-brand-charcoal/30 italic">Protected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STATS FOOTER */}
      <div className="flex items-center justify-between text-xs text-brand-charcoal/50 font-light">
        <p>Total Users: {users.length}</p>
        <p>Active: {users.filter(u => !u.isBanned).length} | Banned: {users.filter(u => u.isBanned).length}</p>
      </div>

    </div>
  );
};

export default UserManagement;
