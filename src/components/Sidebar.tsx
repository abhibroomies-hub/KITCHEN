import React from 'react';
import { 
  LayoutDashboard, 
  Store, 
  ChefHat, 
  Package, 
  Settings, 
  ArrowRightLeft,
  PieChart
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'outlet-detail', label: 'Outlets', icon: Store },
    { id: 'inventory', label: 'Menu', icon: Package },
    { id: 'settings', label: 'Base Kitchen', icon: ChefHat },
  ];

  return (
    <div className="w-64 h-screen bg-bakery-brown text-white flex flex-col fixed left-0 top-0 z-50">
      <div className="p-8">
        <h1 className="text-3xl font-serif font-bold italic text-bakery-accent">Broomies</h1>
        <p className="text-xs text-bakery-cream/60 mt-1 uppercase tracking-widest">Bakery Automation</p>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewType)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                currentView === item.id 
                  ? "bg-bakery-accent text-bakery-brown font-semibold shadow-lg" 
                  : "hover:bg-white/10 text-bakery-warm/80"
              )}
            >
              <Icon className={cn(
                "w-5 h-5",
                currentView === item.id ? "text-bakery-brown" : "text-bakery-accent group-hover:scale-110 transition-transform"
              )} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-8 bg-black/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-bakery-orange flex items-center justify-center font-bold">
            BK
          </div>
          <div>
            <p className="text-sm font-medium">Broomies Kitchen</p>
            <p className="text-xs text-white/50">Admin Panel</p>
          </div>
        </div>
      </div>
    </div>
  );
}
