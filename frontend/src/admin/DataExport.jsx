import React, { useState, useContext } from "react";
import { Download, FileText, Users, ShoppingBag, Ticket, RefreshCw, AlertCircle } from "lucide-react";
import { StoreContext } from "../context/StoreContext";
import { API_URL } from "../utils/api";

const DataExport = () => {
  const { showAlert } = useContext(StoreContext);
  const [exporting, setExporting] = useState(null);

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/export/${type}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export error:", err);
      showAlert("Failed to export data. Please try again.", "error", "Export Failed");
    } finally {
      setExporting(null);
    }
  };

  const exportOptions = [
    {
      id: "orders",
      title: "Export Orders",
      description: "Download all order data including customer details, items, and amounts",
      icon: ShoppingBag,
      color: "bg-amber-50 text-amber-600 border-amber-100"
    },
    {
      id: "users",
      title: "Export Users",
      description: "Download all registered user accounts and their information",
      icon: Users,
      color: "bg-purple-50 text-purple-600 border-purple-100"
    },
    {
      id: "foods",
      title: "Export Foods",
      description: "Download the complete food menu catalog with pricing",
      icon: FileText,
      color: "bg-cyan-50 text-cyan-600 border-cyan-100"
    },
    {
      id: "coupons",
      title: "Export Coupons",
      description: "Download all discount codes and their usage statistics",
      icon: Ticket,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100"
    }
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in select-none text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ebdcae]/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-serif text-brand-charcoal">Data Export</h1>
          <p className="text-xs text-brand-charcoal/55 font-light tracking-wide mt-1">
            Export system data as CSV files for analysis and reporting.
          </p>
        </div>
      </div>

      {/* INFO BANNER */}
      <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-3xl p-6 flex items-start gap-4">
        <div className="p-3 bg-brand-gold/10 rounded-xl text-brand-gold shrink-0">
          <Download size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-brand-charcoal mb-1">Export Information</h3>
          <p className="text-xs text-brand-charcoal/60 leading-relaxed">
            All exports are generated as CSV files compatible with Excel, Google Sheets, and other spreadsheet applications. 
            Data includes all records from the database at the time of export.
          </p>
        </div>
      </div>

      {/* EXPORT OPTIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          return (
            <div
              key={option.id}
              className="bg-white border border-[#ebdcae]/15 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 rounded-bl-full transition-all group-hover:scale-105" />
              
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${option.color}`}>
                  <Icon size={24} />
                </div>
                <button
                  onClick={() => handleExport(option.id)}
                  disabled={exporting === option.id}
                  className="px-4 py-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-98 disabled:opacity-50 flex items-center gap-2"
                >
                  {exporting === option.id ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download size={12} />
                      <span>Export</span>
                    </>
                  )}
                </button>
              </div>

              <h3 className="text-xl font-bold text-brand-charcoal mb-2">{option.title}</h3>
              <p className="text-sm text-brand-charcoal/60 leading-relaxed">{option.description}</p>
            </div>
          );
        })}
      </div>

      {/* EXPORT HISTORY */}
      <div className="bg-white border border-[#ebdcae]/15 rounded-3xl p-8 shadow-sm">
        <h3 className="text-lg font-bold text-brand-charcoal mb-4">Export Guidelines</h3>
        <div className="space-y-3 text-sm text-brand-charcoal/70">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-brand-gold mt-2 shrink-0" />
            <p>Exports include all current data - ensure you have proper permissions before downloading sensitive information.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-brand-gold mt-2 shrink-0" />
            <p>CSV files can be opened in Excel, Google Sheets, or any spreadsheet application for analysis.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-brand-gold mt-2 shrink-0" />
            <p>Large datasets may take a few moments to generate. Please wait for the download to complete.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-brand-gold mt-2 shrink-0" />
            <p>For security reasons, exports are not stored on the server - download immediately after generation.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DataExport;
