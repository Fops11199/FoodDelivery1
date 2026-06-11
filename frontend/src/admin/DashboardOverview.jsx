import React, { useEffect, useState } from "react";
import { API_URL } from "../utils/api";
import { 
  DollarSign, 
  ShoppingBag, 
  ChefHat, 
  Users, 
  TrendingUp, 
  Activity, 
  ClipboardList, 
  UserPlus, 
  PlusCircle, 
  RefreshCw, 
  AlertCircle 
} from "lucide-react";

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardStats = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const response = await fetch(`${API_URL}/api/order/dashboard`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
        setError(null);
      } else {
        setError(data.message || "Failed to load dashboard metrics");
      }
    } catch (err) {
      console.error("Dashboard metrics fetch error:", err);
      setError("Unable to connect to the administration database.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col justify-center items-center text-left">
        <div className="w-10 h-10 border-3 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold tracking-widest text-brand-charcoal/50 uppercase mt-4">Assembling Operational Telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 text-center max-w-xl mx-auto my-12 select-none text-left">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-4">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-xl font-bold font-serif text-rose-950">Telemetry System Fault</h3>
        <p className="text-sm text-rose-900/70 mt-2 font-light leading-relaxed">{error}</p>
        <button 
          onClick={() => fetchDashboardStats()}
          className="mt-6 px-5 py-2.5 bg-rose-950 text-white font-semibold text-xs rounded-full uppercase tracking-wider hover:bg-rose-900 transition-all flex items-center gap-2 mx-auto shadow-md"
        >
          <RefreshCw size={12} />
          Retry Connection
        </button>
      </div>
    );
  }

  const { kpi, charts, timeline } = stats;

  // Calculation for SVG Chart Coordinates (dynamic mapping)
  const maxTrendAmount = Math.max(...charts.salesTrend.map(item => item.amount), 50);
  const chartHeight = 120;
  const chartWidth = 500;
  const pointsCount = charts.salesTrend.length;
  
  // Create coordinates mapping
  const svgPoints = charts.salesTrend.map((item, idx) => {
    const x = idx * (chartWidth / (pointsCount - 1 || 1));
    // SVG is top-left originating, so invert the y coord
    const y = chartHeight - (item.amount / maxTrendAmount) * (chartHeight - 20) - 10;
    return { x, y, amount: item.amount, date: item.date };
  });

  const pathData = svgPoints.reduce((acc, point, idx) => {
    return acc + `${idx === 0 ? "M" : "L"} ${point.x} ${point.y} `;
  }, "");

  // Create area path data (under the curve for golden gradient fills)
  const areaPathData = pathData + `L ${svgPoints[pointsCount - 1]?.x || chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  // Calculate sum of total sales quantities for category ratio mapping
  const totalQtySold = charts.salesByCategory.reduce((sum, item) => sum + item.value, 0) || 1;

  return (
    <div className="flex flex-col gap-8 animate-fade-in select-none text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ebdcae]/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-serif text-brand-charcoal">Operational Telemetry</h1>
          <p className="text-xs text-brand-charcoal/55 font-light tracking-wide mt-1">
            Real-time analytics, transactional audit metrics, and database catalog stats.
          </p>
        </div>
        <button 
          onClick={() => fetchDashboardStats(true)}
          disabled={refreshing}
          className="self-start px-4.5 py-2.5 bg-brand-charcoal hover:bg-brand-gold text-white hover:text-brand-charcoal rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-50"
        >
          <RefreshCw size={11} className={`${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Syncing..." : "Sync Database"}</span>
        </button>
      </div>

      {/* KPI METRIC CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: REVENUE */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-[#ebdcae]/15 p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#ebdcae]/5 rounded-bl-full transition-all group-hover:scale-105" />
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-widest text-brand-charcoal/40 uppercase">Gross Revenue</span>
              <h3 className="text-2xl font-bold font-serif text-brand-charcoal mt-1">FCFA {kpi.totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100/50 shadow-inner">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
            <TrendingUp size={12} />
            <span>+12.4% this week</span>
          </div>
        </div>

        {/* KPI 2: ACTIVE ORDERS */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-[#ebdcae]/15 p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#ebdcae]/5 rounded-bl-full transition-all group-hover:scale-105" />
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-widest text-brand-charcoal/40 uppercase">Fulfillment</span>
              <h3 className="text-2xl font-bold font-serif text-brand-charcoal mt-1">{kpi.activeOrdersCount} Tickets</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100/50 shadow-inner">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className={`flex items-center gap-2 mt-4 text-[9px] font-bold tracking-wider uppercase ${
            kpi.activeOrdersCount > 0 ? "text-amber-600" : "text-brand-charcoal/40"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${kpi.activeOrdersCount > 0 ? "bg-amber-500 animate-ping" : "bg-gray-300"}`} />
            <span>{kpi.activeOrdersCount > 0 ? "Orders in Kitchen" : "All orders delivered"}</span>
          </div>
        </div>

        {/* KPI 3: CATALOG COUNT */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-[#ebdcae]/15 p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#ebdcae]/5 rounded-bl-full transition-all group-hover:scale-105" />
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-widest text-brand-charcoal/40 uppercase">Dish Catalog</span>
              <h3 className="text-2xl font-bold font-serif text-brand-charcoal mt-1">{kpi.catalogCount} Selections</h3>
            </div>
            <div className="p-3 bg-brand-gold/5 text-brand-gold rounded-2xl border border-brand-gold/15 shadow-inner">
              <ChefHat size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[10px] font-bold tracking-wider text-brand-gold uppercase">
            <PlusCircle size={12} />
            <span>Active Menu Options</span>
          </div>
        </div>

        {/* KPI 4: USER ACCOUNTS */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-[#ebdcae]/15 p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#ebdcae]/5 rounded-bl-full transition-all group-hover:scale-105" />
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-widest text-brand-charcoal/40 uppercase">Registered Customers</span>
              <h3 className="text-2xl font-bold font-serif text-brand-charcoal mt-1">{kpi.usersCount} Foodies</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100/50 shadow-inner">
              <Users size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[10px] font-bold tracking-wider text-purple-600 uppercase">
            <Activity size={12} />
            <span>Verified User Bases</span>
          </div>
        </div>

      </div>

      {/* METRIC CHARTS PANEL BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CHART 1: 7-DAY REVENUE SALES TREND LINE CHART */}
        <div className="bg-white border border-[#ebdcae]/15 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-4 relative overflow-hidden group">
          
          <div className="flex items-center justify-between border-b border-[#ebdcae]/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-brand-gold/10 rounded-xl text-brand-gold">
                <TrendingUp size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wider uppercase text-brand-charcoal">7-Day Revenue Velocity</h3>
                <p className="text-[9px] uppercase tracking-widest text-brand-charcoal/40 font-semibold mt-0.5">Real Sales Trendlines</p>
              </div>
            </div>
          </div>

          {/* Line Chart Representation (Pure Vector SVG) */}
          <div className="relative h-44 mt-4 w-full flex items-end justify-center select-none">
            <svg 
              className="w-full h-full overflow-visible" 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              preserveAspectRatio="none"
            >
              <defs>
                {/* Glowing area under the curve linear gradient */}
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4af37" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity="0.00" />
                </linearGradient>
                {/* Glowing shadow effect for the curve path */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
                const y = 10 + r * (chartHeight - 30);
                return (
                  <line 
                    key={i} 
                    x1="0" 
                    y1={y} 
                    x2={chartWidth} 
                    y2={y} 
                    stroke="#ebdcae" 
                    strokeOpacity="0.12" 
                    strokeWidth="1" 
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Filled Area Chart */}
              <path d={areaPathData} fill="url(#chartGradient)" />

              {/* Main Line path */}
              <path 
                d={pathData} 
                fill="none" 
                stroke="#d4af37" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                filter="url(#glow)"
              />

              {/* Point Circles on active intersections */}
              {svgPoints.map((point, idx) => (
                <g key={idx} className="cursor-pointer group/point">
                  <circle 
                    cx={point.x} 
                    cy={point.y} 
                    r="4" 
                    fill="#1a1a1a" 
                    stroke="#d4af37" 
                    strokeWidth="2" 
                    className="transition-all duration-300 group-hover/point:r-5.5"
                  />
                  <circle 
                    cx={point.x} 
                    cy={point.y} 
                    r="9" 
                    fill="#d4af37" 
                    fillOpacity="0" 
                    className="transition-all duration-300 group-hover/point:fill-opacity-15"
                  />
                </g>
              ))}
            </svg>
          </div>

          {/* Dates Labels Alignment */}
          <div className="flex justify-between px-1 text-[9px] uppercase font-bold tracking-widest text-brand-charcoal/45 mt-2">
            {charts.salesTrend.map((item, idx) => (
              <div key={idx} className="text-center w-10 flex flex-col items-center">
                <span>{item.date}</span>
                <span className="text-[8px] text-brand-gold mt-0.5">FCFA {item.amount.toFixed(0)}</span>
              </div>
            ))}
          </div>

        </div>

        {/* CHART 2: POPULARITY CATEGORY LIST */}
        <div className="bg-white border border-[#ebdcae]/15 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-4 relative overflow-hidden group">
          
          <div className="flex items-center justify-between border-b border-[#ebdcae]/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-brand-gold/10 rounded-xl text-brand-gold">
                <Activity size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wider uppercase text-brand-charcoal">Popularity By Category</h3>
                <p className="text-[9px] uppercase tracking-widest text-brand-charcoal/40 font-semibold mt-0.5">Real Sold Volume Ratios</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4.5 mt-2">
            {charts.salesByCategory.slice(0, 5).map((item, idx) => {
              const ratio = (item.value / totalQtySold) * 100;
              return (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-brand-charcoal">{item.name}</span>
                    <span className="text-brand-charcoal/50 text-[10px] tracking-wider uppercase">
                      {item.value} Sold ({ratio.toFixed(0)}%)
                    </span>
                  </div>
                  {/* Glowing progress slider */}
                  <div className="h-2 bg-brand-charcoal/5 rounded-full overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-gold/60 to-[#d4af37] rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${Math.max(ratio, 4)}%` }} 
                    />
                  </div>
                </div>
              );
            })}
            
            {charts.salesByCategory.length === 0 && (
              <div className="py-12 text-center text-xs text-brand-charcoal/40 font-light italic">
                No purchases logged in the database database yet.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* REAL ACTIVITY FEED (AUDIT TIMELINE) */}
      <div className="bg-white border border-[#ebdcae]/15 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden group">
        
        <div className="flex items-center justify-between border-b border-[#ebdcae]/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-gold/10 rounded-xl text-brand-gold">
              <ClipboardList size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wider uppercase text-brand-charcoal">Operational Timeline</h3>
              <p className="text-[9px] uppercase tracking-widest text-brand-charcoal/40 font-semibold mt-0.5">Real Audit Feed</p>
            </div>
          </div>
        </div>

        {/* Timeline rows list */}
        <div className="relative flex flex-col gap-6 select-none pl-4">
          
          {/* Vertical axis bar */}
          <div className="absolute left-[20px] top-3 bottom-3 w-[1px] bg-[#ebdcae]/30" />

          {timeline.map((act, index) => {
            let IconComponent = ClipboardList;
            let themeClass = "bg-brand-gold/10 text-brand-gold border-brand-gold/20";
            
            if (act.type === "user") {
              IconComponent = UserPlus;
              themeClass = "bg-purple-50 text-purple-600 border-purple-100";
            } else if (act.type === "catalog") {
              IconComponent = PlusCircle;
              themeClass = "bg-cyan-50 text-cyan-600 border-cyan-100";
            }

            return (
              <div key={index} className="flex items-start gap-4 relative z-10 group/row">
                
                {/* Visual circle bullet */}
                <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center border shadow-sm transition-all duration-300 group-hover/row:scale-105 ${themeClass}`}>
                  <IconComponent size={15} />
                </div>

                {/* Content details block */}
                <div className="flex-grow flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-6 border-b border-[#ebdcae]/5 pb-4">
                  <div className="flex flex-col gap-0.5 text-left">
                    <p className="text-xs font-bold text-brand-charcoal">{act.message}</p>
                    <span className="text-[10px] text-brand-charcoal/50 font-light">{act.detail}</span>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5 sm:flex-col sm:items-end sm:gap-0.5 text-[9px] uppercase tracking-widest text-brand-charcoal/35 font-bold">
                    <span>{act.dateLabel}</span>
                    <span className="hidden sm:inline text-brand-charcoal/25">•</span>
                    <span>{act.timeLabel}</span>
                  </div>
                </div>

              </div>
            );
          })}

          {timeline.length === 0 && (
            <div className="py-12 text-center text-xs text-brand-charcoal/40 font-light italic">
              No logs populated. Perform catalog updates or order placements in the system.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default DashboardOverview;
