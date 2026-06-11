import React, { useEffect, useState, useContext } from "react";
import { MapPin, Plus, Edit2, Trash2, RefreshCw, AlertCircle, Calculator } from "lucide-react";
import { StoreContext } from "../context/StoreContext";
import { API_URL } from "../utils/api";

const DeliveryZones = () => {
  const { showAlert, showConfirm } = useContext(StoreContext);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    areas: "",
    baseFee: "",
    distanceKm: "",
    description: ""
  });

  const fetchZones = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/delivery/zones`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setZones(data.zones || []);
        setError(null);
      } else {
        setError(data.message || "Failed to load delivery zones");
      }
    } catch (err) {
      console.error("Zones fetch error:", err);
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
      const url = editingZone ? `${API_URL}/api/delivery/update` : `${API_URL}/api/delivery/create`;
      const method = "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          areas: formData.areas.split(",").map(a => a.trim()),
          baseFee: parseFloat(formData.baseFee),
          distanceKm: parseFloat(formData.distanceKm),
          ...(editingZone && { zoneId: editingZone._id })
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setEditingZone(null);
        setFormData({
          name: "",
          areas: "",
          baseFee: "",
          distanceKm: "",
          description: ""
        });
        fetchZones(true);
      } else {
        showAlert(data.message || "Failed to save delivery zone", "error", "Save Failed");
      }
    } catch (err) {
      console.error("Zone save error:", err);
      showAlert("Failed to save delivery zone", "error", "Save Error");
    }
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      areas: zone.areas.join(", "),
      baseFee: zone.baseFee,
      distanceKm: zone.distanceKm,
      description: zone.description || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (zoneId) => {
    const confirmed = await showConfirm("Are you sure you want to delete this delivery zone?", "Delete Zone");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/delivery/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ zoneId })
      });
      const data = await response.json();
      if (data.success) {
        fetchZones(true);
      } else {
        showAlert(data.message || "Failed to delete delivery zone", "error", "Delete Failed");
      }
    } catch (err) {
      console.error("Zone delete error:", err);
      showAlert("Failed to delete delivery zone", "error", "Delete Error");
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col justify-center items-center text-left">
        <div className="w-10 h-10 border-3 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold tracking-widest text-brand-charcoal/50 uppercase mt-4">Loading Delivery Zones...</p>
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
          onClick={() => fetchZones()}
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
          <h1 className="text-3xl font-bold font-serif text-brand-charcoal">Delivery Zones</h1>
          <p className="text-xs text-brand-charcoal/55 font-light tracking-wide mt-1">
            Manage delivery areas and pricing zones.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchZones(true)}
            disabled={refreshing}
            className="px-4.5 py-2.5 bg-white border border-[#ebdcae]/20 text-brand-charcoal rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 transition-all shadow-sm active:scale-98 disabled:opacity-50"
          >
            <RefreshCw size={11} className={`${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
          <button 
            onClick={() => {
              setEditingZone(null);
              setFormData({
                name: "",
                areas: "",
                baseFee: "",
                distanceKm: "",
                description: ""
              });
              setShowModal(true);
            }}
            className="px-4.5 py-2.5 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 transition-all shadow-md active:scale-98"
          >
            <Plus size={11} />
            <span>New Zone</span>
          </button>
        </div>
      </div>

      {/* ZONES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.length === 0 ? (
          <div className="col-span-full bg-white border border-[#ebdcae]/15 rounded-3xl p-12 text-center">
            <MapPin size={48} className="mx-auto text-brand-charcoal/20 mb-4" />
            <p className="text-sm text-brand-charcoal/40 font-light italic">No delivery zones configured yet.</p>
          </div>
        ) : (
          zones.map((zone) => (
            <div key={zone._id} className="bg-white border border-[#ebdcae]/15 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/5 rounded-bl-full transition-all group-hover:scale-105" />
              
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-brand-gold/10 rounded-xl text-brand-gold">
                  <MapPin size={20} />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(zone)}
                    className="p-2 bg-brand-charcoal/5 text-brand-charcoal/60 rounded-lg hover:bg-brand-charcoal/10 transition-all"
                    title="Edit zone"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(zone._id)}
                    className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all"
                    title="Delete zone"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-brand-charcoal mb-2">{zone.name}</h3>
              <p className="text-2xl font-bold text-brand-gold mb-3">{zone.baseFee} FCFA</p>

              <div className="space-y-2 text-xs mb-4">
                <div className="flex justify-between">
                  <span className="text-brand-charcoal/50">Distance:</span>
                  <span className="font-semibold text-brand-charcoal">{zone.distanceKm} km</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {zone.areas.slice(0, 3).map((area, idx) => (
                  <span key={idx} className="px-2 py-1 bg-brand-charcoal/5 text-brand-charcoal/60 text-[10px] rounded-full">
                    {area}
                  </span>
                ))}
                {zone.areas.length > 3 && (
                  <span className="px-2 py-1 bg-brand-charcoal/5 text-brand-charcoal/60 text-[10px] rounded-full">
                    +{zone.areas.length - 3} more
                  </span>
                )}
              </div>

              {zone.description && (
                <p className="text-xs text-brand-charcoal/50 line-clamp-2">{zone.description}</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* ZONE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-brand-charcoal/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <h2 className="text-2xl font-bold font-serif text-brand-charcoal mb-6">
              {editingZone ? "Edit Delivery Zone" : "Create New Zone"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60 mb-2">Zone Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-brand-charcoal/10 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm transition-all"
                  placeholder="Bamenda Central"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60 mb-2">Areas (comma-separated)</label>
                <input
                  type="text"
                  value={formData.areas}
                  onChange={(e) => setFormData({ ...formData, areas: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-brand-charcoal/10 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm transition-all"
                  placeholder="Nkwen, Mankon, Bamenda Central"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60 mb-2">Base Fee (FCFA)</label>
                <input
                  type="number"
                  value={formData.baseFee}
                  onChange={(e) => setFormData({ ...formData, baseFee: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-brand-charcoal/10 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm transition-all"
                  placeholder="1500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60 mb-2">Distance (km)</label>
                <input
                  type="number"
                  value={formData.distanceKm}
                  onChange={(e) => setFormData({ ...formData, distanceKm: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-brand-charcoal/10 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm transition-all"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-brand-charcoal/10 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm transition-all resize-none"
                  rows="3"
                  placeholder="Central Bamenda and immediate surroundings"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingZone(null);
                  }}
                  className="flex-1 px-4 py-3 bg-brand-charcoal/5 text-brand-charcoal rounded-xl font-semibold text-sm transition-all hover:bg-brand-charcoal/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-brand-gold text-brand-charcoal rounded-xl font-semibold text-sm transition-all hover:bg-brand-gold-dark"
                >
                  {editingZone ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DeliveryZones;
