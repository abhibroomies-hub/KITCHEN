import React from 'react';
import { Product, Outlet } from '../types';
import { ChefHat, Truck, ArrowRight, PackageCheck } from 'lucide-react';

interface InventoryManagerProps {
  products: Product[];
  outlets: Outlet[];
  onBack?: () => void;
}

export function InventoryManager({ products, outlets, onBack }: InventoryManagerProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <header className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-3 hover:bg-bakery-warm rounded-2xl transition-all border border-bakery-orange/10 group"
          >
            <ArrowRight className="w-6 h-6 text-bakery-brown group-hover:-translate-x-1 transition-transform rotate-180" />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <ChefHat className="text-bakery-orange w-8 h-8" />
              <h1 className="text-4xl font-serif italic text-bakery-brown">Base Kitchen Production</h1>
            </div>
            <p className="text-bakery-brown/60">Global supply and distribution overview</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-bakery-orange/5">
            <h2 className="text-xl font-serif italic mb-6">Distribution Summary</h2>
            <div className="space-y-4">
              {outlets.map(outlet => {
                const totalSent = Object.values(outlet.stock).reduce((acc, curr) => acc + curr.received, 0);
                const totalReturned = Object.values(outlet.stock).reduce((acc, curr) => acc + curr.returned, 0);
                
                return (
                  <div key={outlet.id} className="flex items-center justify-between p-4 bg-bakery-warm/30 rounded-2xl border border-bakery-warm">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-bakery-orange text-white flex items-center justify-center font-bold">
                        {outlet.name.substring(0, 1)}
                      </div>
                      <div>
                        <p className="font-bold">{outlet.name}</p>
                        <p className="text-xs text-bakery-brown/50">{outlet.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-8">
                      <div className="text-right">
                        <p className="text-xs uppercase font-bold text-bakery-brown/40">Supplied</p>
                        <p className="text-lg font-bold text-green-600">+{totalSent}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase font-bold text-bakery-brown/40">Returns</p>
                        <p className="text-lg font-bold text-red-500">-{totalReturned}</p>
                      </div>
                      <ArrowRight className="text-bakery-brown/20" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-bakery-brown text-white p-8 rounded-3xl relative overflow-hidden">
            <h3 className="text-xl font-serif mb-4 italic">Next Production Batch</h3>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="opacity-60 uppercase text-xs font-bold tracking-widest">Target Stock</span>
                <span className="font-serif">500 Units</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="opacity-60 uppercase text-xs font-bold tracking-widest">Ready items</span>
                <span className="font-serif">320 Units</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="opacity-60 uppercase text-xs font-bold tracking-widest">Out of Stock</span>
                <span className="text-bakery-accent font-bold">2 Categories</span>
              </div>
            </div>
            <button className="w-full mt-6 bg-bakery-accent text-bakery-brown font-bold py-3 rounded-xl hover:bg-white transition-colors">
              Dispatch to Outlets
            </button>
            <Truck className="absolute -bottom-4 -right-4 w-32 h-32 opacity-5 rotate-12" />
          </div>

          <div className="bg-white p-8 rounded-3xl border border-bakery-orange/10">
            <h3 className="text-lg font-serif italic mb-4">Stock Alerts</h3>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 rounded-xl flex items-center space-x-3 text-red-700">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <p className="text-xs font-medium">Buns low in Sec-88</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl flex items-center space-x-3 text-orange-700">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <p className="text-xs font-medium">Cookies delivery pending</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
