import React from "react";
import { Soup, Flame, GlassWater, Cake, LayoutGrid } from "lucide-react";

const menu_list = [
  { menu_name: "Plats Traditionnels", icon: Soup },
  { menu_name: "Poissons & Grillades", icon: Flame },
  { menu_name: "Boissons", icon: GlassWater },
  { menu_name: "Desserts", icon: Cake },
];

const ExploreMenu = ({ category, setCategory }) => {
  const handleCategorySelect = (name) => {
    setCategory((prev) => (prev === name ? "All" : name));
  };

  const CategoryCircle = ({ name, Icon, isActive, onClick }) => (
    <div onClick={onClick} className="flex flex-col items-center gap-2 sm:gap-3 cursor-pointer shrink-0 select-none group snap-start">
      <div
        className={`w-[72px] h-[72px] sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-200 shadow-card ${
          isActive
            ? "bg-brand-charcoal text-brand-cream ring-2 ring-brand-gold"
            : "bg-brand-cream border border-brand-charcoal/10 text-brand-charcoal/50 group-hover:border-brand-gold/40 group-hover:text-brand-charcoal"
        }`}
      >
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <span
        className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
          isActive ? "text-brand-gold" : "text-brand-charcoal/60 group-hover:text-brand-charcoal"
        }`}
      >
        {name}
      </span>
    </div>
  );

  return (
    <div id="explore-menu" className="page-container section-padding scroll-mt-20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl sm:text-4xl brand-heading">Our Menu</h2>
        <p className="text-sm sm:text-base brand-muted mt-3 leading-relaxed">
          Pick a category to filter, or browse everything. All dishes are prepared fresh daily.
        </p>
        <div className="w-12 h-0.5 bg-brand-gold mx-auto mt-4 rounded-full" />
      </div>

      <div className="flex items-center justify-start md:justify-center gap-4 sm:gap-8 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
        <CategoryCircle
          name="All"
          Icon={LayoutGrid}
          isActive={category === "All"}
          onClick={() => setCategory("All")}
        />

        {menu_list.map((item) => (
          <CategoryCircle
            key={item.menu_name}
            name={item.menu_name}
            Icon={item.icon}
            isActive={category === item.menu_name}
            onClick={() => handleCategorySelect(item.menu_name)}
          />
        ))}
      </div>
    </div>
  );
};

export default ExploreMenu;
