import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { Search, X, Check, AlertCircle } from 'lucide-react';
import Fuse from 'fuse.js';
import { cn } from '../lib/utils';

interface ConflictItem {
  name: string;
  qty: number;
}

interface ConflictResolverProps {
  unmatched: ConflictItem[];
  products: Product[];
  onResolve: (matches: Record<string, number>) => void;
  onCancel: () => void;
  title?: string;
}

export function ConflictResolver({ unmatched, products, onResolve, onCancel, title = "Help Broomies AI Match Items" }: ConflictResolverProps) {
  const [resolutions, setResolutions] = useState<Record<number, string | null>>({});
  const [searchTerms, setSearchTerms] = useState<Record<number, string>>({});

  const fuse = useMemo(() => new Fuse(products, {
    keys: ['name', 'category'],
    threshold: 0.4
  }), [products]);

  const handleResolve = () => {
    const finalMatches: Record<string, number> = {};
    Object.keys(resolutions).forEach((key) => {
      const idx = parseInt(key);
      const productId = resolutions[idx];
      if (productId && !isNaN(idx)) {
        finalMatches[productId] = (finalMatches[productId] || 0) + unmatched[idx].qty;
      }
    });
    onResolve(finalMatches);
  };

  const getSuggestions = (index: number) => {
    const term = searchTerms[index] || unmatched[index].name;
    return fuse.search(term).map(r => r.item).slice(0, 5);
  };

  const allResolved = Object.keys(resolutions).length === unmatched.length && 
                      Object.values(resolutions).every(v => v !== null);

  return (
    <div className="fixed inset-0 bg-bakery-brown/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-bakery-orange/20 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-bakery-warm flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-serif italic text-bakery-brown">{title}</h2>
            <p className="text-sm text-bakery-orange font-medium mt-1">
              AI couldn't find {unmatched.length} items. Please select the correct match.
            </p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-bakery-warm rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {unmatched.map((item, idx) => {
            const suggestions = getSuggestions(idx);
            const selectedProduct = products.find(p => p.id === resolutions[idx]);

            return (
              <div key={idx} className="bg-bakery-warm/20 rounded-3xl p-6 border border-bakery-orange/5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-bakery-orange" />
                    <div>
                      <span className="text-bakery-brown font-black text-lg">"{item.name}"</span>
                      <span className="mx-2 text-bakery-brown/20">•</span>
                      <span className="bg-white px-3 py-1 rounded-full text-sm font-bold text-bakery-orange shadow-sm">Qty: {item.qty}</span>
                    </div>
                  </div>
                  {selectedProduct && (
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-2xl flex items-center space-x-2 animate-in zoom-in">
                      <Check className="w-4 h-4" />
                      <span className="text-xs font-black uppercase">Matched!</span>
                    </div>
                  )}
                </div>

                {!resolutions[idx] ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-bakery-brown/40" />
                      <input 
                        type="text"
                        placeholder="Search correct item..."
                        value={searchTerms[idx] || ''}
                        onChange={(e) => setSearchTerms(prev => ({ ...prev, [idx]: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border-2 border-bakery-warm focus:border-bakery-accent outline-none text-sm transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {suggestions.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setResolutions(prev => ({ ...prev, [idx]: p.id }))}
                          className="flex items-center justify-between p-4 bg-white hover:bg-bakery-accent/10 rounded-2xl border border-bakery-warm transition-all group"
                        >
                          <div>
                            <p className="font-bold text-bakery-brown group-hover:text-bakery-brown">{p.name}</p>
                            <p className="text-[10px] text-bakery-brown/40 uppercase tracking-widest">{p.category}</p>
                          </div>
                          <Check className="w-5 h-5 text-transparent group-hover:text-bakery-accent transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-bakery-accent shadow-lg shadow-bakery-accent/5">
                    <div>
                      <p className="font-black text-bakery-brown">{selectedProduct?.name}</p>
                      <p className="text-[10px] text-bakery-brown/40 uppercase tracking-widest">{selectedProduct?.category}</p>
                    </div>
                    <button 
                      onClick={() => setResolutions(prev => ({ ...prev, [idx]: null }))}
                      className="p-2 hover:bg-bakery-warm rounded-xl text-bakery-orange hover:text-bakery-brown transition-colors"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-8 bg-bakery-warm/50 border-t border-bakery-warm flex flex-col space-y-4">
          <button
            disabled={!allResolved}
            onClick={handleResolve}
            className={cn(
              "w-full py-6 rounded-3xl font-black text-xl transition-all shadow-2xl",
              allResolved 
                ? "bg-bakery-brown text-white shadow-bakery-brown/40 hover:scale-[1.02] active:scale-95" 
                : "bg-bakery-brown/20 text-bakery-brown/40 cursor-not-allowed"
            )}
          >
            CONFIRM ALL MATCHES
          </button>
          <p className="text-center text-xs text-bakery-brown/40 italic">
            All items must be matched before saving.
          </p>
        </div>
      </div>
    </div>
  );
}
