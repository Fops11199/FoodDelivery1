import React, { useEffect, useState, useContext } from "react";
import { Ticket, Plus, Edit2, Trash2, RefreshCw, AlertCircle, Percent, DollarSign } from "lucide-react";
import { StoreContext } from "../context/StoreContext";
import { API_URL } from "../utils/api";

const CouponManagement = () => {
  const { showAlert, showConfirm } = useContext(StoreContext);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    usageLimit: "",
    isActive: true
  });

  const fetchCoupons = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/coupon/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCoupons(data.coupons || []);
        setError(null);
      } else {
        setError(data.message || "Failed to load coupons");
      }
    } catch (err) {
      console.error("Coupons fetch error:", err);
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
      const url = editingCoupon ? `${API_URL}/api/coupon/update` : `${API_URL}/api/coupon/create`;
      const method = editingCoupon ? "POST" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingCoupon ? { ...formData, couponId: editingCoupon._id } : formData)
      });
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setEditingCoupon(null);
        setFormData({
          code: "",
          discountType: "percentage",
          discountValue: "",
          minOrderAmount: "",
          usageLimit: "",
          isActive: true
        });
        fetchCoupons(true);
      } else {
        showAlert(data.message || "Failed to save coupon", "error", "Save Failed");
      }
    } catch (err) {
      console.error("Coupon save error:", err);
      showAlert("Failed to save coupon", "error", "Save Error");
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      usageLimit: coupon.usageLimit,
      isActive: coupon.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (couponId) => {
    const confirmed = await showConfirm("Are you sure you want to delete this coupon?", "Delete Coupon");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/coupon/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ couponId })
      });
      const data = await response.json();
      if (data.success) {
        fetchCoupons(true);
      } else {
        showAlert(data.message || "Failed to delete coupon", "error", "Delete Failed");
      }
    } catch (err) {
      console.error("Coupon delete error:", err);
      showAlert("Failed to delete coupon", "error", "Delete Error");
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col justify-center items-center text-left">
        <div className="w-10 h-10 border-3 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold tracking-widest text-brand-charcoal/50 uppercase mt-4">Loading Coupons...</p>
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
          onClick={() => fetchCoupons()}
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
          <h1 className="text-3xl font-bold font-serif text-brand-charcoal">Coupon Management</h1>
          <p className="text-xs text-brand-charcoal/55 font-light tracking-wide mt-1">
            Create and manage discount codes for promotions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchCoupons(true)}
            disabled={refreshing}
            className="px-4.5 py-2.5 bg-white border border-[#ebdcae]/20 text-brand-charcoal rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 transition-all shadow-sm active:scale-98 disabled:opacity-50"
          >
            <RefreshCw size={11} className={`${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
          <button 
            onClick={() => {
              setEditingCoupon(null);
              setFormData({
                code: "",
                discountType: "percentage",
                discountValue: "",
                minOrderAmount: "",
                usageLimit: "",
                isActive: true
              });
              setShowModal(true);
            }}
            className="px-4.5 py-2.5 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 transition-all shadow-md active:scale-98"
          >
            <Plus size={11} />
            <span>New Coupon</span>
          </button>
        </div>
      </div>

      {/* COUPONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.length === 0 ? (
          <div className="col-span-full bg-white border border-[#ebdcae]/15 rounded-3xl p-12 text-center">
            <Ticket size={48} className="mx-auto text-brand-charcoal/20 mb-4" />
            <p className="text-sm text-brand-charcoal/40 font-light italic">No coupons created yet.</p>
          </div>
        ) : (
          coupons.map((coupon) => (
            <div key={coupon._id} className="bg-white border border-[#ebdcae]/15 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/5 rounded-bl-full transition-all group-hover:scale-105" />
              
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-brand-gold/10 rounded-xl text-brand-gold">
                  {coupon.discountType === "percentage" ? <Percent size={20} /> : <DollarSign size={20} />}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="p-2 bg-brand-charcoal/5 text-brand-charcoal/60 rounded-lg hover:bg-brand-charcoal/10 transition-all"
                    title="Edit coupon"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(coupon._id)}
                    className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all"
                    title="Delete coupon"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-brand-charcoal mb-1">{coupon.code}</h3>
              <p className="text-2xl font-bold text-brand-gold mb-3">
                {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `${coupon.discountValue} FCFA`}
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-brand-charcoal/50">Min Order:</span>
                  <span className="font-semibold text-brand-charcoal">{coupon.minOrderAmount} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-charcoal/50">Usage:</span>
                  <span className="font-semibold text-brand-charcoal">{coupon.usageCount}/{coupon.usageLimit}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#ebdcae]/10">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                  coupon.isActive
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-rose-50 text-rose-600 border border-rose-100"
                }`}>
                  {coupon.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* COUPON MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-brand-charcoal/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <h2 className="text-2xl font-bold font-serif text-brand-charcoal mb-6">
              {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60 mb-2">Coupon Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 rounded-xl border border-brand-charcoal/10 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm transition-all"
                  placeholder="SUMMER2024"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60 mb-2">Discount Type</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-brand-charcoal/10 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm transition-all"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (FCFA)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60 mb-2">Discount Value</label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-brand-charcoal/10 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm transition-all"
                  placeholder={formData.discountType === "percentage" ? "10" : "5000"}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60 mb-2">Minimum Order Amount (FCFA)</label>
                <input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-brand-charcoal/10 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm transition-all"
                  placeholder="10000"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60 mb-2">Usage Limit</label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-brand-charcoal/10 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm transition-all"
                  placeholder="100"
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-brand-charcoal/20 text-brand-gold focus:ring-brand-gold"
                />
                <label htmlFor="isActive" className="text-sm text-brand-charcoal">Active</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCoupon(null);
                  }}
                  className="flex-1 px-4 py-3 bg-brand-charcoal/5 text-brand-charcoal rounded-xl font-semibold text-sm transition-all hover:bg-brand-charcoal/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-brand-gold text-brand-charcoal rounded-xl font-semibold text-sm transition-all hover:bg-brand-gold-dark"
                >
                  {editingCoupon ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CouponManagement;
