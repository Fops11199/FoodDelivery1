import React, { useEffect, useState, useContext } from "react";
import { Percent, RefreshCw, AlertCircle, Save } from "lucide-react";
import { StoreContext } from "../context/StoreContext";
import { API_URL } from "../utils/api";

const TaxConfiguration = () => {
  const { showAlert } = useContext(StoreContext);
  const [taxConfig, setTaxConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    taxRate: "",
    taxName: "",
    appliesToFood: false,
    appliesToDelivery: false,
    isActive: true
  });

  const fetchTaxConfig = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/tax/config`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success && data.config) {
        setTaxConfig(data.config);
        setFormData({
          taxRate: data.config.taxRate || "",
          taxName: data.config.taxName || "",
          appliesToFood: data.config.appliesToFood || false,
          appliesToDelivery: data.config.appliesToDelivery || false,
          isActive: data.config.isActive !== undefined ? data.config.isActive : true
        });
        setError(null);
      } else if (data.success && !data.config) {
        // Config doesn't exist yet, initialize with defaults
        setTaxConfig(null);
        setFormData({
          taxRate: "",
          taxName: "",
          appliesToFood: false,
          appliesToDelivery: false,
          isActive: true
        });
        setError(null);
      } else {
        setError(data.message || "Failed to load tax configuration");
      }
    } catch (err) {
      console.error("Tax config fetch error:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/tax/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          taxRate: parseFloat(formData.taxRate),
          taxName: formData.taxName,
          appliesToFood: formData.appliesToFood,
          appliesToDelivery: formData.appliesToDelivery,
          isActive: formData.isActive
        })
      });
      const data = await response.json();
      if (data.success) {
        showAlert("Tax configuration updated successfully", "success", "Success");
        fetchTaxConfig();
      } else {
        showAlert(data.message || "Failed to update tax configuration", "error", "Update Failed");
      }
    } catch (err) {
      console.error("Tax config save error:", err);
      showAlert("Failed to update tax configuration", "error", "Update Error");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchTaxConfig();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col justify-center items-center text-left">
        <div className="w-10 h-10 border-3 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold tracking-widest text-brand-charcoal/50 uppercase mt-4">Loading Tax Configuration...</p>
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
          onClick={() => fetchTaxConfig()}
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
          <h1 className="text-3xl font-bold font-serif text-brand-charcoal">Tax Configuration</h1>
          <p className="text-xs text-brand-charcoal/55 font-light tracking-wide mt-1">
            Configure tax rates and application rules for orders.
          </p>
        </div>
        <button 
          onClick={() => fetchTaxConfig()}
          className="self-start px-4.5 py-2.5 bg-white border border-[#ebdcae]/20 text-brand-charcoal rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 transition-all shadow-sm active:scale-98"
        >
          <RefreshCw size={11} />
          <span>Refresh</span>
        </button>
      </div>

      {/* TAX CONFIGURATION FORM */}
      <div className="bg-white border border-[#ebdcae]/15 rounded-3xl p-8 shadow-sm max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="flex items-start gap-4 p-6 bg-brand-gold/5 rounded-2xl border border-brand-gold/10">
            <div className="p-3 bg-brand-gold/10 rounded-xl text-brand-gold shrink-0">
              <Percent size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-charcoal mb-1">Tax Rate</h3>
              <p className="text-xs text-brand-charcoal/60">Set the percentage tax rate applied to orders.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60 mb-2">Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-brand-charcoal/10 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm transition-all"
                placeholder="19"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60 mb-2">Tax Name</label>
              <input
                type="text"
                value={formData.taxName}
                onChange={(e) => setFormData({ ...formData, taxName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-brand-charcoal/10 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm transition-all"
                placeholder="VAT"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60">Tax Application</label>
            
            <div className="flex items-center gap-3 p-4 bg-brand-charcoal/5 rounded-xl border border-brand-charcoal/10">
              <input
                type="checkbox"
                id="appliesToFood"
                checked={formData.appliesToFood}
                onChange={(e) => setFormData({ ...formData, appliesToFood: e.target.checked })}
                className="w-5 h-5 rounded border-brand-charcoal/20 text-brand-gold focus:ring-brand-gold"
              />
              <label htmlFor="appliesToFood" className="text-sm text-brand-charcoal cursor-pointer">
                Apply tax to food items
              </label>
            </div>

            <div className="flex items-center gap-3 p-4 bg-brand-charcoal/5 rounded-xl border border-brand-charcoal/10">
              <input
                type="checkbox"
                id="appliesToDelivery"
                checked={formData.appliesToDelivery}
                onChange={(e) => setFormData({ ...formData, appliesToDelivery: e.target.checked })}
                className="w-5 h-5 rounded border-brand-charcoal/20 text-brand-gold focus:ring-brand-gold"
              />
              <label htmlFor="appliesToDelivery" className="text-sm text-brand-charcoal cursor-pointer">
                Apply tax to delivery fees
              </label>
            </div>

            <div className="flex items-center gap-3 p-4 bg-brand-charcoal/5 rounded-xl border border-brand-charcoal/10">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded border-brand-charcoal/20 text-brand-gold focus:ring-brand-gold"
              />
              <label htmlFor="isActive" className="text-sm text-brand-charcoal cursor-pointer">
                Enable tax calculation
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-[#ebdcae]/10">
            <button
              type="submit"
              disabled={saving}
              className="w-full px-6 py-3 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-md active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={16} />
              <span>{saving ? "Saving..." : "Save Configuration"}</span>
            </button>
          </div>

        </form>
      </div>

      {/* PREVIEW SECTION */}
      <div className="bg-white border border-[#ebdcae]/15 rounded-3xl p-8 shadow-sm max-w-2xl">
        <h3 className="text-lg font-bold font-serif text-brand-charcoal mb-4">Tax Calculation Preview</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-[#ebdcae]/10">
            <span className="text-brand-charcoal/60">Food Subtotal:</span>
            <span className="font-semibold text-brand-charcoal">10,000 FCFA</span>
          </div>
          {formData.appliesToFood && (
            <div className="flex justify-between py-2 border-b border-[#ebdcae]/10">
              <span className="text-brand-charcoal/60">Tax ({formData.taxName}):</span>
              <span className="font-semibold text-brand-gold">{(10000 * (formData.taxRate / 100)).toFixed(0)} FCFA</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-[#ebdcae]/10">
            <span className="text-brand-charcoal/60">Delivery Fee:</span>
            <span className="font-semibold text-brand-charcoal">3,000 FCFA</span>
          </div>
          {formData.appliesToDelivery && (
            <div className="flex justify-between py-2 border-b border-[#ebdcae]/10">
              <span className="text-brand-charcoal/60">Tax on Delivery:</span>
              <span className="font-semibold text-brand-gold">{(3000 * (formData.taxRate / 100)).toFixed(0)} FCFA</span>
            </div>
          )}
          <div className="flex justify-between py-3 bg-brand-charcoal/5 rounded-xl px-4">
            <span className="font-bold text-brand-charcoal">Total:</span>
            <span className="font-bold text-brand-gold">
              {(
                10000 + 
                3000 + 
                (formData.appliesToFood ? 10000 * (formData.taxRate / 100) : 0) +
                (formData.appliesToDelivery ? 3000 * (formData.taxRate / 100) : 0)
              ).toFixed(0)} FCFA
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default TaxConfiguration;
