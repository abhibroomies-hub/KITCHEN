import React, { useState, useMemo } from 'react';
import { Outlet, Product, StockEntry } from '../types';
import { 
  FileSpreadsheet, 
  RefreshCcw, 
  ArrowLeft, 
  CheckCircle2, 
  PackagePlus, 
  ArrowDownCircle, 
  ChevronDown,
  Sparkles,
  X,
  Search,
  Check,
  Calendar as CalendarIcon
} from 'lucide-react';
import { ExcelUploader } from './ExcelUploader';
import { SmartInputField } from './SmartInputField';
import { ConflictResolver } from './ConflictResolver';
import { cn } from '../lib/utils';
import Fuse from 'fuse.js';
import { HistoryRecord } from '../types';

interface OutletManagerProps {
  outlet: Outlet;
  products: Product[];
  onUpdateStock: (stock: Record<string, StockEntry>, date?: string) => void;
  allOutlets: Outlet[];
  onSelectOutlet: (id: string) => void;
  onNavigateToMenu?: () => void;
  onBack: () => void;
  history: HistoryRecord[];
}

export function OutletManager({ 
  outlet, 
  products, 
  onUpdateStock, 
  allOutlets, 
  onSelectOutlet,
  onNavigateToMenu,
  onBack,
  history
}: OutletManagerProps) {
  const [showUploader, setShowUploader] = useState(false);
  const [showBulkAI, setShowBulkAI] = useState(false);
  const [selectedAIColumn, setSelectedAIColumn] = useState<keyof StockEntry>('received');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [conflictItems, setConflictItems] = useState<{ name: string; qty: number }[]>([]);
  const [pendingField, setPendingField] = useState<keyof StockEntry>('sold');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const activeStock = useMemo(() => {
    const historical = history.find(h => h.date === selectedDate && h.outletId === outlet.id);
    return historical ? historical.stock : outlet.stock;
  }, [selectedDate, history, outlet.id, outlet.stock]);

  const fuse = useMemo(() => new Fuse(products, {
    keys: ['name'],
    threshold: 0.3
  }), [products]);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const pName = p.name.toLowerCase();
    const sTerm = searchTerm.toLowerCase();
    const matchesSearch = pName.includes(sTerm);
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSmartEntry = (field: keyof StockEntry, data: Record<string, number>, unmatched: {name: string, qty: number}[] = []) => {
    const updatedStock = { ...activeStock };
    Object.entries(data).forEach(([pId, qty]) => {
      if (updatedStock[pId]) {
        updatedStock[pId] = {
          ...updatedStock[pId],
          [field]: (updatedStock[pId][field] || 0) + qty,
          lastUpdated: new Date().toISOString()
        };
        const s = updatedStock[pId];
        s.closingStock = s.openingStock + s.received - s.sold - s.returned;
      }
    });

    onUpdateStock(updatedStock, selectedDate);

    if (unmatched.length > 0) {
      setPendingField(field);
      setConflictItems(unmatched);
    }
  };

  const handleConflictResolve = (resolutions: Record<string, number>) => {
    const updatedStock = { ...activeStock };
    Object.entries(resolutions).forEach(([pId, qty]) => {
      if (updatedStock[pId]) {
        updatedStock[pId] = {
          ...updatedStock[pId],
          [pendingField]: (updatedStock[pId][pendingField] || 0) + qty,
          lastUpdated: new Date().toISOString()
        };
        const s = updatedStock[pId];
        s.closingStock = s.openingStock + s.received - s.sold - s.returned;
      }
    });
    onUpdateStock(updatedStock, selectedDate);
    setConflictItems([]);
  };

  const handleExcelData = (data: Array<{ name: string; sold: number }>) => {
    const updatedStock = { ...activeStock };
    let unmatched: { name: string; qty: number }[] = [];
    
    data.forEach(item => {
      const results = fuse.search(item.name);
      const product = results.length > 0 ? results[0].item : null;

      if (product && updatedStock[product.id]) {
        updatedStock[product.id] = {
          ...updatedStock[product.id],
          sold: (updatedStock[product.id].sold || 0) + item.sold,
          closingStock: updatedStock[product.id].openingStock + updatedStock[product.id].received - (updatedStock[product.id].sold + item.sold) - updatedStock[product.id].returned,
          lastUpdated: new Date().toISOString()
        };
      } else {
        unmatched.push({ name: item.name, qty: item.sold });
      }
    });

    onUpdateStock(updatedStock, selectedDate);
    setShowUploader(false);

    if (unmatched.length > 0) {
      setPendingField('sold');
      setConflictItems(unmatched);
    } else {
      alert("Excel Imported Successfully!");
    }
  };

  const updateField = (productId: string, field: keyof StockEntry, value: number) => {
    const entry = activeStock[productId];
    const newEntry = { ...entry, [field]: value };
    
    // Recalculate closing
    newEntry.closingStock = newEntry.openingStock + newEntry.received - newEntry.sold - newEntry.returned;
    newEntry.lastUpdated = new Date().toISOString();

    onUpdateStock({
      ...activeStock,
      [productId]: newEntry
    }, selectedDate);
  };

  const startNextDay = () => {
    const nextDayStock = { ...activeStock };
    Object.keys(nextDayStock).forEach(pId => {
      const current = nextDayStock[pId];
      nextDayStock[pId] = {
        productId: pId,
        openingStock: current.closingStock,
        received: 0,
        sold: 0,
        returned: 0,
        closingStock: current.closingStock,
        lastUpdated: new Date().toISOString()
      };
    });
    onUpdateStock(nextDayStock);
    alert('Today\'s closing is now Tomorrow\'s opening. Ready for fresh entries!');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center space-x-3 mb-1">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-bakery-warm rounded-xl transition-all border border-bakery-orange/10 group"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5 text-bakery-brown group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-xl font-serif italic text-bakery-brown">Outlet Management</h1>
          <p className="text-[10px] text-bakery-brown/40">Manage stock and daily sales</p>
        </div>
      </div>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 bg-white p-4 rounded-[1.5rem] shadow-sm border border-bakery-orange/10 mb-4">
        <div className="flex items-center space-x-4">
          <div className="bg-bakery-accent/20 p-2 rounded-xl">
            <PackagePlus className="w-6 h-6 text-bakery-brown" />
          </div>
          <div>
            <p className="text-[9px] font-black text-bakery-orange uppercase tracking-widest leading-none">Outlet</p>
            <div className="relative group">
              <button className="flex items-center space-x-2 bg-bakery-cream/30 hover:bg-bakery-cream/50 px-3 py-1.5 rounded-xl border border-bakery-orange/10 font-bold text-bakery-brown text-base transition-all min-w-[180px]">
                <span>{outlet.name}</span>
                <ChevronDown className="w-4 h-4 text-bakery-orange" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-xl shadow-xl border border-bakery-warm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                {allOutlets.map(o => (
                  <button
                    key={o.id}
                    onClick={() => onSelectOutlet(o.id)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 hover:bg-bakery-accent/10 transition-colors font-medium border-b border-bakery-warm last:border-none text-sm",
                      outlet.id === o.id ? "bg-bakery-accent/20 text-bakery-brown" : "text-bakery-brown/60"
                    )}
                  >
                    {o.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-bakery-accent/10 p-3 rounded-[1.2rem] border border-bakery-accent/20 flex flex-col items-center">
          <p className="text-[8px] font-black text-bakery-brown/40 uppercase tracking-widest mb-1">Editing For Date</p>
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-bakery-orange/10">
            <CalendarIcon className="w-4 h-4 text-bakery-orange" />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-bold text-bakery-brown outline-none border-none focus:ring-0 text-sm cursor-pointer"
            />
          </div>
          {selectedDate !== new Date().toISOString().split('T')[0] && (
            <p className="text-[8px] font-bold text-bakery-orange mt-1 uppercase animate-pulse">⚠️ Historical</p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setShowBulkAI(true)}
            className="flex items-center space-x-2 bg-bakery-accent text-bakery-brown px-6 py-3 rounded-2xl font-black hover:scale-105 transition-all shadow-xl shadow-bakery-accent/20"
          >
            <Sparkles className="w-5 h-5" />
            <span>✨ Bulk AI Magic</span>
          </button>
          <button 
            onClick={() => setShowUploader(true)}
            className="flex items-center space-x-2 bg-bakery-brown text-white px-6 py-3 rounded-2xl font-bold hover:bg-bakery-orange transition-all shadow-xl shadow-bakery-brown/20"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span>📄 Upload Excel</span>
          </button>
        </div>
      </header>

      {showBulkAI && (
        <div className="fixed inset-0 bg-bakery-brown/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden border border-bakery-orange/20">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-serif italic text-bakery-brown flex items-center">
                    <Sparkles className="w-8 h-8 mr-3 text-bakery-accent" />
                    Broomies AI Bulk Entry
                  </h2>
                  <p className="text-bakery-orange font-medium mt-1">Paste your list below. Use any language (Hindi/English/Hinglish).</p>
                </div>
                <button onClick={() => setShowBulkAI(false)} className="p-2 hover:bg-bakery-warm rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {(['openingStock', 'received', 'sold', 'returned'] as const).map((col) => (
                  <button
                    key={col}
                    onClick={() => setSelectedAIColumn(col)}
                    className={cn(
                      "py-3 rounded-xl text-xs font-bold uppercase tracking-wider border-2 transition-all",
                      selectedAIColumn === col 
                        ? "bg-bakery-brown text-white border-bakery-brown shadow-lg scale-105" 
                        : "bg-white text-bakery-brown/40 border-bakery-warm hover:border-bakery-orange/20"
                    )}
                  >
                    Set {col === 'sold' ? 'Sales' : col.replace('Stock', '')}
                  </button>
                ))}
              </div>

              <div className="relative">
                <SmartInputField 
                  products={products}
                  columnName={selectedAIColumn.replace('Stock', '').toUpperCase()}
                  onDataParsed={(data, unmatched) => {
                    handleSmartEntry(selectedAIColumn, data, unmatched);
                    setShowBulkAI(false);
                  }}
                  onNavigateToMenu={onNavigateToMenu}
                  isBulk
                />
              </div>

              <div className="mt-8 bg-bakery-warm/30 p-6 rounded-2xl border border-bakery-orange/10">
                <h4 className="text-sm font-bold text-bakery-brown mb-2 uppercase tracking-widest">Example format you can paste:</h4>
                <div className="text-xs text-bakery-brown/60 font-mono space-y-1">
                  <p>Item Name, Quantity</p>
                  <p>Classic Pineapple Pastry, 5</p>
                  <p>Black Forest Pastry, 2</p>
                  <p>... or just write: "dus chocochip cake aur 5 brown bread"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {conflictItems.length > 0 && (
        <ConflictResolver 
          unmatched={conflictItems}
          products={products}
          onResolve={handleConflictResolve}
          onCancel={() => setConflictItems([])}
          title={`Broomies AI Logic Check - Match Unmatched ${pendingField.replace('Stock', '').toUpperCase()}`}
        />
      )}

      {showUploader && (
        <ExcelUploader 
          onClose={() => setShowUploader(false)} 
          onData={handleExcelData} 
        />
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-bakery-orange/10 focus:ring-2 focus:ring-bakery-accent outline-none font-medium"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-bakery-orange/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
        </div>
        <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                selectedCategory === cat 
                  ? "bg-bakery-brown text-white" 
                  : "bg-white text-bakery-brown/60 hover:bg-bakery-warm"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] shadow-sm border border-bakery-orange/5 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-bakery-orange/20">
          <table className="w-full border-collapse min-w-[800px] table-fixed">
            <thead>
              <tr className="bg-bakery-warm/50 border-b border-bakery-orange/10">
                <th className="text-left p-3 md:p-4 font-serif italic text-bakery-brown text-base w-auto md:w-[40%]">Item Name</th>
                <th className="text-center p-2 md:p-3 font-bold text-bakery-brown/70 w-[100px] md:w-[120px] uppercase tracking-tighter text-[10px]">
                  <div className="flex flex-col items-center space-y-1">
                    <span className="whitespace-nowrap">Opening</span>
                    <SmartInputField 
                      products={products} 
                      columnName="Opening" 
                      onDataParsed={(data, unmatched) => handleSmartEntry('openingStock', data, unmatched)} 
                      onNavigateToMenu={onNavigateToMenu}
                    />
                  </div>
                </th>
                <th className="text-center p-2 md:p-3 font-bold text-bakery-brown/70 w-[100px] md:w-[120px] uppercase tracking-tighter text-[10px]">
                  <div className="flex flex-col items-center space-y-1">
                    <span className="whitespace-nowrap">Received</span>
                    <SmartInputField 
                      products={products} 
                      columnName="Received" 
                      onDataParsed={(data, unmatched) => handleSmartEntry('received', data, unmatched)} 
                      onNavigateToMenu={onNavigateToMenu}
                    />
                  </div>
                </th>
                <th className="text-center p-2 md:p-3 font-bold text-bakery-brown/70 w-[100px] md:w-[120px] uppercase tracking-tighter text-[10px]">
                  <div className="flex flex-col items-center space-y-1">
                    <div className="flex items-center space-x-1">
                      <span>Sales</span>
                      <button 
                        onClick={() => setShowUploader(true)}
                        className="p-1 hover:bg-bakery-orange/10 rounded-lg text-bakery-orange transition-colors"
                        title="Upload Excel for Sales"
                      >
                        <FileSpreadsheet className="w-3 h-3" />
                      </button>
                    </div>
                    <SmartInputField 
                      products={products} 
                      columnName="Sales" 
                      onDataParsed={(data, unmatched) => handleSmartEntry('sold', data, unmatched)} 
                      onNavigateToMenu={onNavigateToMenu}
                    />
                  </div>
                </th>
                <th className="text-center p-2 md:p-3 font-bold text-bakery-brown/70 w-[100px] md:w-[120px] uppercase tracking-tighter text-[10px]">
                  <div className="flex flex-col items-center space-y-1">
                    <span className="whitespace-nowrap">Returned</span>
                    <SmartInputField 
                      products={products} 
                      columnName="Returned" 
                      onDataParsed={(data, unmatched) => handleSmartEntry('returned', data, unmatched)} 
                      onNavigateToMenu={onNavigateToMenu}
                    />
                  </div>
                </th>
                <th className="bg-bakery-accent/20 text-center p-2 md:p-3 font-black text-bakery-brown uppercase tracking-tighter text-[10px] w-[100px] md:w-[130px]">Closing</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const stock = activeStock[product.id];
                if (!stock) return null;
  
                return (
                  <tr key={product.id} className="border-b border-bakery-warm/30 hover:bg-bakery-cream/50 transition-colors">
                    <td className="p-3 md:p-4 md:w-[40%]">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-bakery-warm flex items-center justify-center shrink-0">
                          <PackagePlus className="w-3.5 h-3.5 text-bakery-orange" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-bakery-brown text-sm truncate">{product.name}</p>
                          <p className="text-[9px] text-bakery-brown/40 uppercase font-black">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <input 
                        type="number" 
                        value={stock.openingStock}
                        onChange={(e) => updateField(product.id, 'openingStock', parseInt(e.target.value) || 0)}
                        className="w-14 md:w-16 mx-auto text-center p-1.5 rounded-lg bg-bakery-warm/50 border-none focus:ring-1 focus:ring-bakery-accent font-medium text-bakery-brown text-sm"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input 
                        type="number" 
                        value={stock.received}
                        onChange={(e) => updateField(product.id, 'received', parseInt(e.target.value) || 0)}
                        className="w-14 md:w-16 mx-auto text-center p-1.5 rounded-lg bg-bakery-warm border-none focus:ring-1 focus:ring-bakery-accent text-sm"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input 
                        type="number" 
                        value={stock.sold}
                        onChange={(e) => updateField(product.id, 'sold', parseInt(e.target.value) || 0)}
                        className={cn(
                          "w-14 md:w-16 mx-auto text-center p-1.5 rounded-lg bg-green-50 border-none focus:ring-1 focus:ring-green-400 font-bold text-sm",
                          stock.sold > 0 ? "text-green-700" : "text-gray-400"
                        )}
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input 
                        type="number" 
                        value={stock.returned}
                        onChange={(e) => updateField(product.id, 'returned', parseInt(e.target.value) || 0)}
                        className="w-14 md:w-16 mx-auto text-center p-1.5 rounded-lg bg-white border border-bakery-orange/20 focus:ring-1 focus:ring-bakery-orange text-sm"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input 
                        type="number" 
                        value={stock.closingStock}
                        onChange={(e) => updateField(product.id, 'closingStock', parseInt(e.target.value) || 0)}
                        className={cn(
                          "w-16 md:w-20 mx-auto text-center p-2 rounded-xl bg-bakery-accent/20 border border-bakery-accent/30 focus:ring-2 focus:ring-bakery-accent font-black text-base text-bakery-brown transition-all",
                          stock.closingStock !== (stock.openingStock + stock.received - stock.sold - stock.returned) && "border-red-400 bg-red-50"
                        )}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {products.length === 0 && (
          <div className="p-20 text-center">
            <p className="text-bakery-brown/40 italic">No products available in this outlet.</p>
          </div>
        )}
      </div>

      <div className="flex justify-center pt-4 pb-8">
        {selectedDate === new Date().toISOString().split('T')[0] ? (
          <button
            onClick={startNextDay}
            className="group flex flex-col items-center space-y-2"
          >
            <div className="bg-bakery-brown text-white px-12 py-4 rounded-[1.5rem] font-black text-xl shadow-xl shadow-bakery-brown/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-3">
              <RefreshCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
              <span>SAVE & START NEXT DAY</span>
            </div>
            <p className="text-[10px] text-bakery-brown/60 font-medium italic">Closes today and shifts stock to tomorrow.</p>
          </button>
        ) : (
          <div className="bg-bakery-orange text-white px-12 py-4 rounded-[1.5rem] font-black text-xl shadow-xl shadow-bakery-orange/20 flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6" />
            <span>HISTORY AUTO-SAVED</span>
          </div>
        )}
      </div>

    </div>
  );
}
