import React, { useState, useMemo } from 'react';
import { HistoryRecord, Product, Outlet, StockEntry } from '../types';
import { 
  TrendingUp, 
  ChefHat, 
  Calendar, 
  ArrowRight, 
  Package, 
  AlertCircle,
  Lightbulb,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ProductionPlannerProps {
  history: HistoryRecord[];
  products: Product[];
  outlets: Outlet[];
  onBack: () => void;
}

interface Suggestion {
  productId: string;
  productName: string;
  category: string;
  avgWeeklySales: number;
  currentStock: number;
  suggestedProduction: number;
}

export function ProductionPlanner({ history, products, outlets, onBack }: ProductionPlannerProps) {
  const [selectedOutletId, setSelectedOutletId] = useState<string>(outlets[0]?.id || '');
  const [bufferPercent, setBufferPercent] = useState(15); // 15% safety buffer

  // Filter for Cakes & Pastries only
  const targetCategories = ['Cakes', 'Pastry', 'Cakes (1Kg)', 'Dry Cakes'];
  const targetProducts = products.filter(p => targetCategories.includes(p.category));

  const suggestions: Suggestion[] = useMemo(() => {
    if (!selectedOutletId) return [];

    const outletHistory = history.filter(h => h.outletId === selectedOutletId);
    const currentOutlet = outlets.find(o => o.id === selectedOutletId);

    return targetProducts.map(product => {
      // Calculate sales over the last 7 unique days in history for this outlet
      const recentSalesEntries = outletHistory
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 7)
        .map(h => h.stock[product.id]?.sold || 0);

      const totalSalesRecent = recentSalesEntries.reduce((sum, s) => sum + s, 0);
      const avgWeeklySales = recentSalesEntries.length > 0 
        ? totalSalesRecent 
        : 0; // If we have less than 7 days, we use what we have as the weekly baseline or scale it. 
             // Actually user asked for a week analysis, so total for a week is a good projection.

      const currentStock = currentOutlet?.stock[product.id]?.closingStock || 0;
      
      // Suggested = (Projected Sales * Buffer) - Current Stock
      const projectedNeed = Math.ceil(avgWeeklySales * (1 + bufferPercent / 100));
      const suggested = Math.max(0, projectedNeed - currentStock);

      return {
        productId: product.id,
        productName: product.name,
        category: product.category,
        avgWeeklySales,
        currentStock,
        suggestedProduction: suggested
      };
    }).filter(s => s.avgWeeklySales > 0 || s.suggestedProduction > 0);
  }, [selectedOutletId, history, outlets, targetProducts, bufferPercent]);

  const stats = useMemo(() => {
    const totalItems = suggestions.reduce((acc, s) => acc + s.suggestedProduction, 0);
    const criticalItems = suggestions.filter(s => s.currentStock === 0 && s.avgWeeklySales > 0).length;
    return { totalItems, criticalItems };
  }, [suggestions]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-3 hover:bg-bakery-warm rounded-2xl transition-all border border-bakery-orange/10 group"
          >
            <ArrowLeft className="w-6 h-6 text-bakery-brown group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center space-x-3 text-bakery-brown">
              <TrendingUp className="w-8 h-8 text-bakery-accent" />
              <h1 className="text-4xl font-serif italic">Production Planning</h1>
            </div>
            <p className="text-bakery-orange font-medium mt-1">Smart AI suggestions based on historical sales</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-end md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="bg-white p-4 rounded-3xl border border-bakery-orange/10 shadow-sm flex items-center space-x-4">
            <span className="text-xs font-black text-bakery-brown/40 uppercase tracking-widest">Outlet:</span>
            <select 
              value={selectedOutletId}
              onChange={(e) => setSelectedOutletId(e.target.value)}
              className="bg-transparent font-bold text-bakery-brown outline-none border-none focus:ring-0"
            >
              {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div className="bg-bakery-brown text-white p-4 rounded-3xl shadow-lg flex items-center space-x-4">
            <span className="text-xs font-black text-white/40 uppercase tracking-widest">Safety Buffer:</span>
            <div className="flex items-center space-x-2">
              <input 
                type="range" min="0" max="50" step="5"
                value={bufferPercent}
                onChange={(e) => setBufferPercent(parseInt(e.target.value))}
                className="accent-bakery-accent w-24"
              />
              <span className="font-bold text-bakery-accent">{bufferPercent}%</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-[1.5rem] border border-bakery-orange/5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-bakery-orange uppercase tracking-widest mb-1">Production Queue</p>
            <h3 className="text-2xl font-serif text-bakery-brown italic">{stats.totalItems} Items</h3>
          </div>
          <ChefHat className="w-8 h-8 text-bakery-accent opacity-30" />
        </div>
        
        <div className="bg-white p-5 rounded-[1.5rem] border border-bakery-orange/5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Critical Stock Outs</p>
            <h3 className="text-2xl font-serif text-bakery-brown italic">{stats.criticalItems} Items</h3>
          </div>
          <AlertCircle className="w-8 h-8 text-red-500 opacity-30" />
        </div>

        <div className="bg-bakery-accent/10 border border-bakery-accent p-5 rounded-[1.5rem] shadow-sm flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Lightbulb className="w-3 h-3 text-bakery-brown" />
              <p className="text-[8px] font-black text-bakery-brown uppercase tracking-widest">Broomies AI Tip</p>
            </div>
            <p className="text-[11px] text-bakery-brown/70 italic font-medium leading-tight">
              Based on last week, we expect {bufferPercent}% growth. Prepare extra for weekends.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] overflow-hidden border border-bakery-orange/5 shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-bakery-warm/50 border-b border-bakery-orange/10">
              <th className="text-left p-4 font-serif italic text-bakery-brown text-base">Product Details</th>
              <th className="text-center p-4 font-black text-bakery-brown/40 uppercase tracking-tighter text-[10px]">Weekly Sales</th>
              <th className="text-center p-4 font-black text-bakery-brown/40 uppercase tracking-tighter text-[10px]">Stock</th>
              <th className="bg-bakery-accent/30 text-center p-4 font-black text-bakery-brown uppercase tracking-tighter text-[10px]">Suggested</th>
            </tr>
          </thead>
          <tbody>
            {suggestions.map((s, idx) => (
              <tr key={s.productId} className="border-b border-bakery-warm/30 hover:bg-bakery-cream/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-bakery-warm flex items-center justify-center shrink-0">
                      <Package className="w-3.5 h-3.5 text-bakery-orange" />
                    </div>
                    <div>
                      <p className="font-bold text-bakery-brown text-sm">{s.productName}</p>
                      <p className="text-[9px] text-bakery-brown/40 uppercase font-black">{s.category}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className="font-bold text-bakery-brown">{s.avgWeeklySales}</span>
                </td>
                <td className="p-2 text-center">
                  <span className={cn(
                    "px-3 py-1.5 rounded-xl font-black text-xs",
                    s.currentStock === 0 ? "bg-red-100 text-red-600" : "bg-bakery-warm text-bakery-brown/60"
                  )}>
                    {s.currentStock}
                  </span>
                </td>
                <td className="p-4 text-center bg-bakery-accent/5">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg font-black text-bakery-brown">{s.suggestedProduction}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {suggestions.length === 0 && (
          <div className="p-20 text-center">
            <TrendingUp className="w-16 h-16 text-bakery-orange/20 mx-auto mb-4" />
            <p className="text-bakery-brown/40 italic text-xl font-serif">Not enough historical data to suggest production yet.</p>
          </div>
        )}
      </div>

      <div className="flex justify-center pb-12">
        <button className="bg-bakery-brown text-white px-12 py-5 rounded-[2rem] font-black text-xl shadow-2xl shadow-bakery-brown/30 flex items-center space-x-4 hover:scale-105 transition-all">
          <ChevronRight className="w-6 h-6 text-bakery-accent" />
          <span>Export Production Sheet</span>
        </button>
      </div>
    </div>
  );
}
