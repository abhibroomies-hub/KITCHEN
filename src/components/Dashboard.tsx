import React from 'react';
import { Outlet, Product } from '../types';
import { Store, ArrowUpRight, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  outlets: Outlet[];
  products: Product[];
  onSelectOutlet: (id: string) => void;
}

export function Dashboard({ outlets, products, onSelectOutlet }: DashboardProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif italic text-bakery-brown">Overview Dashboard</h1>
          <p className="text-bakery-orange font-medium mt-1">Real-time stock status across all outlets</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-bakery-brown opacity-60">Total Outlets</p>
          <p className="text-3xl font-serif">{outlets.length}</p>
        </div>
      </header>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {outlets.map((outlet) => {
          const totalStock = Object.values(outlet.stock).reduce((acc, curr) => acc + curr.closingStock, 0);
          const lowStockCount = Object.values(outlet.stock).filter(s => s.closingStock < 5).length;

          return (
            <motion.button
              variants={item}
              key={outlet.id}
              onClick={() => onSelectOutlet(outlet.id)}
              className="bg-white rounded-3xl p-6 text-left shadow-sm border border-bakery-orange/5 hover:border-bakery-accent hover:shadow-xl transition-all group"
            >
              <div className="w-12 h-12 bg-bakery-warm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Store className="text-bakery-orange" />
              </div>
              <h3 className="text-xl font-serif font-bold text-bakery-brown">{outlet.name}</h3>
              <p className="text-sm text-bakery-brown/60 mb-6">{outlet.location}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-bakery-brown/50">Current Stock</span>
                  <span className="font-bold flex items-center">
                    {totalStock} items
                    <TrendingUp className="w-3 h-3 ml-1 text-green-500" />
                  </span>
                </div>
                {lowStockCount > 0 && (
                  <div className="flex items-center text-xs text-red-500 bg-red-50 p-2 rounded-lg">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {lowStockCount} items low in stock
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-bakery-warm flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-bakery-orange">Manage Outlet</span>
                <ArrowUpRight className="w-4 h-4 text-bakery-orange group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      <section className="bg-bakery-brown text-bakery-cream rounded-[2rem] p-8 mt-12 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-serif italic mb-4">Production Insight</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-sm opacity-60">Top Selling Item</p>
              <p className="text-xl font-medium mt-1">Chocolate Croissant</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-sm opacity-60">Pending From Base Kitchen</p>
              <p className="text-xl font-medium mt-1">12 Orders</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-sm opacity-60">Average Sales/Day</p>
              <p className="text-xl font-medium mt-1">₹42,500</p>
            </div>
          </div>
        </div>
        {/* Abstract shapes for bakery vibe */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-bakery-accent/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -ml-10 -mb-10"></div>
      </section>
    </div>
  );
}
