import React, { useEffect, useState, useContext } from "react";
import { RefreshCw, AlertCircle, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { StoreContext } from "../context/StoreContext";
import { API_URL } from "../utils/api";

const RefundManagement = () => {
  const { showAlert } = useContext(StoreContext);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRefunds = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/refund/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setRefunds(data.refunds || []);
        setError(null);
      } else {
        setError(data.message || "Failed to load refunds");
      }
    } catch (err) {
      console.error("Refunds fetch error:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleProcessRefund = async (refundId, action) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/refund/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ refundId, status: action })
      });
      const data = await response.json();
      if (data.success) {
        fetchRefunds(true);
      } else {
        showAlert(data.message || "Failed to process refund", "error", "Process Failed");
      }
    } catch (err) {
      console.error("Refund process error:", err);
      showAlert("Failed to process refund", "error", "Process Error");
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col justify-center items-center text-left">
        <div className="w-10 h-10 border-3 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold tracking-widest text-brand-charcoal/50 uppercase mt-4">Loading Refunds...</p>
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
          onClick={() => fetchRefunds()}
          className="mt-6 px-5 py-2.5 bg-rose-950 text-white font-semibold text-xs rounded-full uppercase tracking-wider hover:bg-rose-900 transition-all flex items-center gap-2 mx-auto shadow-md"
        >
          <RefreshCw size={12} />
          Retry
        </button>
      </div>
    );
  }

  const pendingRefunds = refunds.filter(r => r.status === "pending");
  const processedRefunds = refunds.filter(r => r.status !== "pending");

  return (
    <div className="flex flex-col gap-8 animate-fade-in select-none text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ebdcae]/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-serif text-brand-charcoal">Refund Management</h1>
          <p className="text-xs text-brand-charcoal/55 font-light tracking-wide mt-1">
            Process and manage customer refund requests.
          </p>
        </div>
        <button 
          onClick={() => fetchRefunds(true)}
          disabled={refreshing}
          className="self-start px-4.5 py-2.5 bg-white border border-[#ebdcae]/20 text-brand-charcoal rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 transition-all shadow-sm active:scale-98 disabled:opacity-50"
        >
          <RefreshCw size={11} className={`${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-[#ebdcae]/15 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <DollarSign size={16} />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/40">Pending</span>
          </div>
          <p className="text-3xl font-bold text-brand-charcoal">{pendingRefunds.length}</p>
        </div>
        <div className="bg-white border border-[#ebdcae]/15 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle size={16} />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/40">Approved</span>
          </div>
          <p className="text-3xl font-bold text-brand-charcoal">{refunds.filter(r => r.status === "approved").length}</p>
        </div>
        <div className="bg-white border border-[#ebdcae]/15 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <XCircle size={16} />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/40">Rejected</span>
          </div>
          <p className="text-3xl font-bold text-brand-charcoal">{refunds.filter(r => r.status === "rejected").length}</p>
        </div>
      </div>

      {/* PENDING REFUNDS */}
      {pendingRefunds.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-brand-charcoal mb-4">Pending Refund Requests</h2>
          <div className="bg-white border border-[#ebdcae]/15 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-brand-charcoal/5 border-b border-[#ebdcae]/10">
                  <tr>
                    <th className="text-left px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60">Order ID</th>
                    <th className="text-left px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60">User</th>
                    <th className="text-left px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60">Amount</th>
                    <th className="text-left px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60">Reason</th>
                    <th className="text-left px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60">Date</th>
                    <th className="text-left px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRefunds.map((refund) => (
                    <tr key={refund._id} className="border-b border-[#ebdcae]/5 hover:bg-brand-cream/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-brand-charcoal">{refund.orderId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-brand-charcoal/70">{refund.userName || "Unknown"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-brand-gold">{refund.amount} FCFA</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-brand-charcoal/70 line-clamp-2">{refund.reason}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-brand-charcoal/50">{new Date(refund.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleProcessRefund(refund._id, "approved")}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-emerald-100 transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleProcessRefund(refund._id, "rejected")}
                            className="px-3 py-1.5 bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-rose-100 transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PROCESSED REFUNDS */}
      {processedRefunds.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-brand-charcoal mb-4">Processed Refunds</h2>
          <div className="bg-white border border-[#ebdcae]/15 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-brand-charcoal/5 border-b border-[#ebdcae]/10">
                  <tr>
                    <th className="text-left px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60">Order ID</th>
                    <th className="text-left px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60">User</th>
                    <th className="text-left px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60">Amount</th>
                    <th className="text-left px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60">Status</th>
                    <th className="text-left px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-charcoal/60">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {processedRefunds.map((refund) => (
                    <tr key={refund._id} className="border-b border-[#ebdcae]/5 hover:bg-brand-cream/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-brand-charcoal">{refund.orderId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-brand-charcoal/70">{refund.userName || "Unknown"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-brand-gold">{refund.amount} FCFA</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                          refund.status === "approved"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-rose-50 text-rose-600 border border-rose-100"
                        }`}>
                          {refund.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-brand-charcoal/50">{new Date(refund.createdAt).toLocaleDateString()}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {refunds.length === 0 && (
        <div className="bg-white border border-[#ebdcae]/15 rounded-3xl p-12 text-center">
          <DollarSign size={48} className="mx-auto text-brand-charcoal/20 mb-4" />
          <p className="text-sm text-brand-charcoal/40 font-light italic">No refund requests found.</p>
        </div>
      )}

    </div>
  );
};

export default RefundManagement;
