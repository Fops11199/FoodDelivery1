import React, { useEffect, useState, useContext } from "react";
import { Clock, Plus, Edit2, Trash2, RefreshCw, AlertCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { StoreContext } from "../context/StoreContext";
import { API_URL } from "../utils/api";

const DeliveryTimeSlots = () => {
  const { showAlert, showConfirm } = useContext(StoreContext);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    description: ""
  });

  const fetchSlots = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/delivery-time/slots`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSlots(data.slots || []);
        setError(null);
      } else {
        setError(data.message || "Failed to load delivery time slots");
      }
    } catch (err) {
      console.error("Slots fetch error:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const url = editingSlot ? `${API_URL}/api/delivery-time/update` : `${API_URL}/api/delivery-time/create`;
      const method = "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          ...(editingSlot && { slotId: editingSlot._id })
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setEditingSlot(null);
        setFormData({
          name: "",
          startTime: "",
          endTime: "",
          description: ""
        });
        fetchSlots(true);
      } else {
        showAlert(data.message || "Failed to save delivery time slot", "error", "Save Failed");
      }
    } catch (err) {
      console.error("Slot save error:", err);
      showAlert("Failed to save delivery time slot", "error", "Save Error");
    }
  };

  const handleToggle = async (slotId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/delivery-time/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ slotId, isActive: !slots.find(s => s._id === slotId)?.isActive })
      });
      const data = await response.json();
      if (data.success) {
        fetchSlots(true);
      } else {
        showAlert(data.message || "Failed to update time slot", "error", "Update Failed");
      }
    } catch (err) {
      console.error("Slot toggle error:", err);
      showAlert("Failed to update time slot", "error", "Update Error");
    }
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      name: slot.name,
      startTime: slot.startTime,
      endTime: slot.endTime,
      description: slot.description || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (slotId) => {
    const confirmed = await showConfirm("Are you sure you want to delete this delivery time slot?", "Delete Time Slot");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/delivery-time/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ slotId })
      });
      const data = await response.json();
      if (data.success) {
        fetchSlots(true);
      } else {
        showAlert(data.message || "Failed to delete delivery time slot", "error", "Delete Failed");
      }
    } catch (err) {
      console.error("Slot delete error:", err);
      showAlert("Failed to delete delivery time slot", "error", "Delete Error");
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col justify-center items-center text-left">
        <div className="w-10 h-10 border-3 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold tracking-widest text-brand-charcoal/50 uppercase mt-4">Loading Time Slots...</p>
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
          onClick={() => fetchSlots()}
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
          <h1 className="text-3xl font-bold font-serif text-brand-charcoal">Delivery Time Slots</h1>
          <p className="text-xs text-brand-charcoal/55 font-light tracking-wide mt-1">
            Manage available delivery time windows for customers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchSlots(true)}
            disabled={refreshing}
            className="px-4.5 py-2.5 bg-white border border-[#ebdcae]/20 text-brand-charcoal rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 transition-all shadow-sm active:scale-98 disabled:opacity-50"
          >
            <RefreshCw size={11} className={`${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
          <button 
            onClick={() => {
              setEditingSlot(null);
              setFormData({
                name: "",
                startTime: "",
                endTime: "",
                description: ""
              });
              setShowModal(true);
            }}
            className="px-4.5 py-2.5 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 transition-all shadow-md active:scale-98"
          >
            <Plus size={11} />
            <span>New Slot</span>
          </button>
        </div>
      </div>

      {/* SLOTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slots.length === 0 ? (
          <div className="col-span-full bg-white border border-[#ebdcae]/15 rounded-3xl p-12 text-center">
            <Clock size={48} className="mx-auto text-brand-charcoal/20 mb-4" />
            <p className="text-sm text-brand-charcoal/40 font-light italic">No delivery time slots configured yet.</p>
          </div>
        ) : (
          slots.map((slot) => (
            <div key={slot._id} className="bg-white border border-[#ebdcae]/15 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/5 rounded-bl-full transition-all group-hover:scale-105" />
              
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${slot.isActive ? "bg-brand-gold/10 text-brand-gold" : "bg-gray-100 text-gray-400"}`}>
                  <Clock size={20} />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(slot._id)}
                    className={`p-2 rounded-lg transition-all ${slot.isActive ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
                    title={slot.isActive ? "Deactivate" : "Activate"}
                  >
                    {slot.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  </button>
                  <button
                    onClick={() => handleEdit(slot)}
                    className="p-2 bg-brand-charcoal/5 text-brand-charcoal/60 rounded-lg hover:bg-brand-charcoal/10 transition-all"
                    title="Edit slot"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(slot._id)}
                    className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all"
                    title="Delete slot"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-brand-charcoal mb-2">{slot.name}</h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl font-bold text-brand-gold">{slot.startTime}</span>
                <span className="text-brand-charcoal/30">-</span>
                <span className="text-2xl font-bold text-brand-gold">{slot.endTime}</span>
              </div>

              <div className="mt-4 pt-4 border-t border-[#ebdcae]/10">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                  slot.isActive
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}>
                  {slot.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {slot.description && (
                <p className="text-xs text-brand-charcoal/50 mt-3 line-clamp-2">{slot.description}</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* SLOT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-brand-charcoal/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <h2 className="text-2xl font-bold font-serif text-brand-charcoal mb-6">
              {editingSlot ? "Edit Time Slot" : "Create New Time Slot"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60 mb-2">Slot Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-brand-charcoal/10 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm transition-all"
                  placeholder="Lunch Rush"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-brand-charcoal/10 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60 mb-2">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-brand-charcoal/10 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-brand-charcoal/10 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm transition-all resize-none"
                  rows="3"
                  placeholder="Peak lunch hours"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSlot(null);
                  }}
                  className="flex-1 px-4 py-3 bg-brand-charcoal/5 text-brand-charcoal rounded-xl font-semibold text-sm transition-all hover:bg-brand-charcoal/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-brand-gold text-brand-charcoal rounded-xl font-semibold text-sm transition-all hover:bg-brand-gold-dark"
                >
                  {editingSlot ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DeliveryTimeSlots;
