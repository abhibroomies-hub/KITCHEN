import React from 'react';
import { 
  LayoutDashboard, 
  Store, 
  ChefHat, 
  Package, 
  Menu,
  X,
  History,
  TrendingUp
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ currentView, onViewChange, isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'outlet-detail', label: 'Outlet Stock', icon: Store },
    { id: 'history', label: 'Sales History', icon: History },
    { id: 'production', label: 'Production Plan', icon: TrendingUp },
    { id: 'inventory', label: 'Manage Menu', icon: Package },
    { id: 'settings', label: 'Base Kitchen', icon: ChefHat },
  ];

  const handleNav = (id: ViewType) => {
    onViewChange(id);
    onClose();
  };

  return (
    <>
      {/* Overlay - Mobile Only */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <div className={cn(
        "w-64 h-screen bg-bakery-brown text-white flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 lg:translate-x-0 border-r border-white/5",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold italic text-bakery-accent">Broomies</h1>
            <p className="text-[10px] text-bakery-cream/60 mt-1 uppercase tracking-widest font-black">Bakery Automation</p>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id as ViewType)}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left",
                  currentView === item.id 
                    ? "bg-bakery-accent text-bakery-brown font-black shadow-lg" 
                    : "hover:bg-white/10 text-bakery-warm/80 font-medium"
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
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">Broomies Kitchen</p>
              <p className="text-[10px] text-white/50 uppercase font-black">Admin Panel</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
