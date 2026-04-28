import React, { useState } from 'react';
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
  X 
} from 'lucide-react';
import { ExcelUploader } from './ExcelUploader';
import { SmartInputField } from './SmartInputField';
import { cn } from '../lib/utils';

interface OutletManagerProps {
  outlet: Outlet;
  products: Product[];
  onUpdateStock: (stock: Record<string, StockEntry>) => void;
  allOutlets: Outlet[];
  onSelectOutlet: (id: string) => void;
  onNavigateToMenu?: () => void;
  onBack: () => void;
}

export function OutletManager({ 
  outlet, 
  products, 
  onUpdateStock, 
  allOutlets, 
  onSelectOutlet,
  onNavigateToMenu,
  onBack
}: OutletManagerProps) {
  const [showUploader, setShowUploader] = useState(false);
  const [showBulkAI, setShowBulkAI] = useState(false);
  const [selectedAIColumn, setSelectedAIColumn] = useState<keyof StockEntry>('received');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSmartEntry = (field: keyof StockEntry, data: Record<string, number>) => {
    const updatedStock = { ...outlet.stock };
    Object.entries(data).forEach(([pId, qty]) => {
      if (updatedStock[pId]) {
        updatedStock[pId] = {
          ...updatedStock[pId],
          [field]: qty,
          lastUpdated: new Date().toISOString()
        };
        // Recalculate closing for this item
        const s = updatedStock[pId];
        s.closingStock = s.openingStock + s.received - s.sold - s.returned;
      }
    });
    onUpdateStock(updatedStock);
  };

  const handleExcelData = (data: Array<{ name: string; sold: number }>) => {
    const updatedStock = { ...outlet.stock };
    let matchedCount = 0;
    let unmatchedItems: string[] = [];
    
    data.forEach(item => {
      // Improved fuzzy search
      const product = products.find(p => {
        const pName = p.name.toLowerCase();
        const iName = item.name.toLowerCase();
        return pName === iName || pName.includes(iName) || iName.includes(pName);
      });

      if (product && updatedStock[product.id]) {
        updatedStock[product.id] = {
          ...updatedStock[product.id],
          sold: item.sold,
          closingStock: updatedStock[product.id].openingStock + updatedStock[product.id].received - item.sold - updatedStock[product.id].returned,
          lastUpdated: new Date().toISOString()
        };
        matchedCount++;
      } else {
        unmatchedItems.push(item.name);
      }
    });

    onUpdateStock(updatedStock);
    setShowUploader(false);
    
    const message = `Broomies AI: Matched ${matchedCount} items from file.${unmatchedItems.length > 0 ? `\n\n⚠️ ${unmatchedItems.length} items missing in Menu: ${unmatchedItems.slice(0, 5).join(', ')}${unmatchedItems.length > 5 ? '...' : ''}` : ''}`;
    alert(message);
  };

  const updateField = (productId: string, field: keyof StockEntry, value: number) => {
    const entry = outlet.stock[productId];
    const newEntry = { ...entry, [field]: value };
    
    // Recalculate closing
    newEntry.closingStock = newEntry.openingStock + newEntry.received - newEntry.sold - newEntry.returned;
    newEntry.lastUpdated = new Date().toISOString();

    onUpdateStock({
      ...outlet.stock,
      [productId]: newEntry
    });
  };

  const startNextDay = () => {
    const nextDayStock = { ...outlet.stock };
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4 mb-2">
        <button 
          onClick={onBack}
          className="p-3 hover:bg-bakery-warm rounded-2xl transition-all border border-bakery-orange/10 group"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-6 h-6 text-bakery-brown group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-2xl font-serif italic text-bakery-brown">Outlet Management</h1>
          <p className="text-sm text-bakery-brown/40">Manage stock and daily sales for your bakery</p>
        </div>
      </div>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 bg-white p-6 rounded-[2.5rem] shadow-sm border border-bakery-orange/10 mb-8">
        <div className="flex items-center space-x-6">
          <div className="bg-bakery-accent/20 p-3 rounded-2xl">
            <PackagePlus className="w-8 h-8 text-bakery-brown" />
          </div>
          <div>
            <p className="text-xs font-bold text-bakery-orange uppercase tracking-widest">Select Managing Outlet</p>
            <div className="relative group mt-1">
              <button className="flex items-center space-x-3 bg-bakery-cream/30 hover:bg-bakery-cream/50 px-5 py-2.5 rounded-2xl border border-bakery-orange/10 font-bold text-bakery-brown text-lg transition-all min-w-[220px]">
                <span>{outlet.name}</span>
                <ChevronDown className="w-5 h-5 text-bakery-orange" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-bakery-warm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                {allOutlets.map(o => (
                  <button
                    key={o.id}
                    onClick={() => onSelectOutlet(o.id)}
                    className={cn(
                      "w-full text-left px-5 py-4 hover:bg-bakery-accent/10 transition-colors font-medium border-b border-bakery-warm last:border-none",
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
                  onDataParsed={(data) => {
                    handleSmartEntry(selectedAIColumn, data);
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
              <div className="flex space-x-2">
                <button
                  onClick={startNextDay}
                  className={cn(
                    "flex-1 py-5 rounded-[2rem] bg-bakery-accent text-bakery-brown font-black text-xl flex items-center justify-center space-x-3 hover:scale-[1.02] shadow-xl shadow-bakery-accent/30 transition-all active:scale-95"
                  )}
                >
                  <RefreshCcw className="w-6 h-6" />
                  <span>Save & Start Next Day</span>
                </button>
              </div>
            </div>
          </div>
        </div>
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

      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-bakery-orange/5">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-bakery-warm/50 border-b border-bakery-orange/10">
              <th className="text-left p-6 font-serif italic text-bakery-brown text-lg">Item Name</th>
              <th className="text-center p-6 font-bold text-bakery-brown/70 min-w-[150px] uppercase tracking-tighter text-sm">
                <div className="flex flex-col items-center space-y-2">
                  <span>Opening Item</span>
                  <SmartInputField 
                    products={products} 
                    columnName="Opening" 
                    onDataParsed={(data) => handleSmartEntry('openingStock', data)} 
                    onNavigateToMenu={onNavigateToMenu}
                  />
                </div>
              </th>
              <th className="text-center p-6 font-bold text-bakery-brown/70 min-w-[150px] uppercase tracking-tighter text-sm">
                <div className="flex flex-col items-center space-y-2">
                  <span>Received Item</span>
                  <SmartInputField 
                    products={products} 
                    columnName="Received" 
                    onDataParsed={(data) => handleSmartEntry('received', data)} 
                    onNavigateToMenu={onNavigateToMenu}
                  />
                </div>
              </th>
              <th className="text-center p-6 font-bold text-bakery-brown/70 min-w-[150px] uppercase tracking-tighter text-sm">
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center space-x-2">
                    <span>Sales</span>
                    <button 
                      onClick={() => setShowUploader(true)}
                      className="p-1 hover:bg-bakery-orange/10 rounded-lg text-bakery-orange transition-colors"
                      title="Upload Excel for Sales"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </button>
                  </div>
                  <SmartInputField 
                    products={products} 
                    columnName="Sales" 
                    onDataParsed={(data) => handleSmartEntry('sold', data)} 
                    onNavigateToMenu={onNavigateToMenu}
                  />
                </div>
              </th>
              <th className="text-center p-6 font-bold text-bakery-brown/70 min-w-[150px] uppercase tracking-tighter text-sm">
                <div className="flex flex-col items-center space-y-2">
                  <span>Returned</span>
                  <SmartInputField 
                    products={products} 
                    columnName="Returned" 
                    onDataParsed={(data) => handleSmartEntry('returned', data)} 
                    onNavigateToMenu={onNavigateToMenu}
                  />
                </div>
              </th>
              <th className="bg-bakery-accent/20 text-center p-6 font-black text-bakery-brown uppercase tracking-tighter text-sm">Closing Item</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => {
              const stock = outlet.stock[product.id];
              if (!stock) return null;

              return (
                <tr key={product.id} className="border-b border-bakery-warm/30 hover:bg-bakery-cream/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-bakery-warm flex items-center justify-center">
                        <PackagePlus className="w-4 h-4 text-bakery-orange" />
                      </div>
                      <div>
                        <p className="font-bold text-bakery-brown">{product.name}</p>
                        <p className="text-xs text-bakery-brown/40">{product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <input 
                      type="number" 
                      value={stock.openingStock}
                      onChange={(e) => updateField(product.id, 'openingStock', parseInt(e.target.value) || 0)}
                      className="w-20 mx-auto text-center p-2 rounded-lg bg-bakery-warm/50 border-none focus:ring-2 focus:ring-bakery-accent font-medium text-bakery-brown"
                    />
                  </td>
                  <td className="p-6">
                    <input 
                      type="number" 
                      value={stock.received}
                      onChange={(e) => updateField(product.id, 'received', parseInt(e.target.value) || 0)}
                      className="w-20 mx-auto text-center p-2 rounded-lg bg-bakery-warm border-none focus:ring-2 focus:ring-bakery-accent"
                    />
                  </td>
                  <td className="p-6 text-center">
                    <input 
                      type="number" 
                      value={stock.sold}
                      onChange={(e) => updateField(product.id, 'sold', parseInt(e.target.value) || 0)}
                      className={cn(
                        "w-20 mx-auto text-center p-2 rounded-lg bg-green-50 border-none focus:ring-2 focus:ring-green-400 font-bold",
                        stock.sold > 0 ? "text-green-700" : "text-gray-400"
                      )}
                    />
                  </td>
                  <td className="p-6">
                    <input 
                      type="number" 
                      value={stock.returned}
                      onChange={(e) => updateField(product.id, 'returned', parseInt(e.target.value) || 0)}
                      className="w-20 mx-auto text-center p-2 rounded-lg bg-white border border-bakery-orange/20 focus:ring-2 focus:ring-bakery-orange"
                    />
                  </td>
                  <td className="p-6 text-center">
                    <input 
                      type="number" 
                      value={stock.closingStock}
                      onChange={(e) => updateField(product.id, 'closingStock', parseInt(e.target.value) || 0)}
                      className={cn(
                        "w-24 mx-auto text-center p-3 rounded-2xl bg-bakery-accent/20 border-2 border-bakery-accent/30 focus:ring-4 focus:ring-bakery-accent font-black text-xl text-bakery-brown transition-all",
                        stock.closingStock !== (stock.openingStock + stock.received - stock.sold - stock.returned) && "border-red-400 bg-red-50"
                      )}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {products.length === 0 && (
          <div className="p-20 text-center">
            <p className="text-bakery-brown/40 italic">No products available in this outlet.</p>
          </div>
        )}
      </div>

      <div className="flex justify-center pt-8 pb-12">
        <button
          onClick={startNextDay}
          className="group flex flex-col items-center space-y-4"
        >
          <div className="bg-bakery-brown text-white px-24 py-6 rounded-[2.5rem] font-black text-3xl shadow-2xl shadow-bakery-brown/30 hover:scale-105 active:scale-95 transition-all flex items-center space-x-4">
            <RefreshCcw className="w-8 h-8 group-hover:rotate-180 transition-transform duration-500" />
            <span>SAVE & START NEXT DAY</span>
          </div>
          <p className="text-bakery-brown/60 font-medium italic">Clicking this will move all Closing items to Tomorrow's Opening stock.</p>
        </button>
      </div>

    </div>
  );
}
