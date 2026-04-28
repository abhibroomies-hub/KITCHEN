import React, { useState } from 'react';
import { HistoryRecord, Product, Outlet } from '../types';
import { 
  History, 
  Calendar, 
  Store, 
  ChevronRight, 
  Search,
  Filter,
  ArrowLeft,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '../lib/utils';

interface HistoryViewProps {
  history: HistoryRecord[];
  products: Product[];
  outlets: Outlet[];
  onBack: () => void;
  onEditRecord: (outletId: string, date: string) => void;
}

export function HistoryView({ history, products, outlets, onBack, onEditRecord }: HistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOutletId, setSelectedOutletId] = useState<string>('All');

  const filteredHistory = [...history].sort((a, b) => b.date.localeCompare(a.date)).filter(record => {
    const outlet = outlets.find(o => o.id === record.outletId);
    const matchesOutlet = selectedOutletId === 'All' || record.outletId === selectedOutletId;
    const matchesSearch = outlet?.name.toLowerCase().includes(searchTerm.toLowerCase()) || record.date.includes(searchTerm);
    return matchesOutlet && matchesSearch;
  });

  const getOutletName = (id: string) => outlets.find(o => o.id === id)?.name || 'Unknown Outlet';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
              <History className="w-8 h-8 text-bakery-orange" />
              <h1 className="text-4xl font-serif italic">Sales History</h1>
            </div>
            <p className="text-bakery-orange font-medium mt-1">Review and manage past daily records</p>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 bg-white p-4 rounded-3xl border border-bakery-orange/10 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bakery-brown/30" />
          <input 
            type="text"
            placeholder="Search date or outlet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-bakery-warm/20 rounded-2xl border-none outline-none focus:ring-2 focus:ring-bakery-accent font-medium"
          />
        </div>
        <select 
          value={selectedOutletId}
          onChange={(e) => setSelectedOutletId(e.target.value)}
          className="bg-bakery-warm/20 px-6 py-3 rounded-2xl border-none outline-none focus:ring-2 focus:ring-bakery-accent font-bold text-bakery-brown"
        >
          <option value="All">All Outlets</option>
          {outlets.map(o => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHistory.map((record, idx) => {
          const totalSales = Object.values(record.stock).reduce((acc, curr) => acc + curr.sold, 0);
          const totalReturns = Object.values(record.stock).reduce((acc, curr) => acc + curr.returned, 0);
          
          return (
            <div 
              key={`${record.outletId}-${record.date}`}
              className="bg-white rounded-[2rem] p-8 border border-bakery-orange/5 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="bg-bakery-accent/20 p-3 rounded-2xl group-hover:bg-bakery-accent transition-colors">
                  <Calendar className="w-6 h-6 text-bakery-brown" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-bakery-orange uppercase tracking-widest">{record.date}</p>
                  <p className="text-lg font-bold text-bakery-brown mt-1">{getOutletName(record.outletId)}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-2xl border border-green-100">
                  <span className="text-sm font-bold text-green-700">Total Sales</span>
                  <span className="text-xl font-black text-green-700">{totalSales}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <span className="text-sm font-bold text-orange-700">Returns</span>
                  <span className="text-xl font-black text-orange-700">{totalReturns}</span>
                </div>
              </div>

              <button 
                onClick={() => onEditRecord(record.outletId, record.date)}
                className="w-full flex items-center justify-center space-x-2 bg-bakery-brown text-white py-4 rounded-2xl font-black hover:bg-bakery-orange transition-all active:scale-95"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>View / Edit Details</span>
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            </div>
          );
        })}

        {filteredHistory.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-bakery-orange/20">
            <History className="w-16 h-16 text-bakery-orange/20 mx-auto mb-4" />
            <p className="text-bakery-brown/40 italic text-xl font-serif">No historical records found for this period.</p>
          </div>
        )}
      </div>
    </div>
  );
}
