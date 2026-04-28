import React, { useState } from 'react';
import { Sparkles, Loader2, Check, X, AlertTriangle, CheckSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { parseStockInput, ParseResult } from '../services/geminiService';
import { Product } from '../types';

interface SmartInputFieldProps {
  products: Product[];
  columnName: string;
  onDataParsed: (data: Record<string, number>) => void;
  placeholder?: string;
  onNavigateToMenu?: () => void;
  isBulk?: boolean;
}

export function SmartInputField({ products, columnName, onDataParsed, placeholder, onNavigateToMenu, isBulk }: SmartInputFieldProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingResult, setPendingResult] = useState<ParseResult | null>(null);

  const handleMagic = async () => {
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await parseStockInput(inputValue, products, columnName);
      setPendingResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmData = () => {
    if (pendingResult) {
      onDataParsed(pendingResult.matches);
      setPendingResult(null);
      setInputValue('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  return (
    <>
      <div className="relative w-full group">
        {isBulk ? (
          <div className="space-y-4">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder || `Example:\nClassic Pineapple Pastry,3\nBlack Forest Pastry,1\n...`}
              rows={8}
              className={cn(
                "w-full p-6 text-sm rounded-[2rem] border-2 border-bakery-orange/10 bg-bakery-cream/20 focus:bg-white",
                "focus:ring-4 focus:ring-bakery-accent border-bakery-orange/10 outline-none transition-all resize-none font-medium",
                isLoading && "opacity-50"
              )}
            />
            <button
              onClick={handleMagic}
              disabled={isLoading || !inputValue.trim()}
              className="w-full py-4 rounded-2xl bg-bakery-brown text-white font-bold flex items-center justify-center space-x-2 hover:bg-bakery-orange transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Analyze with AI</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleMagic()}
              placeholder={placeholder || `AI ${columnName}...`}
              className={cn(
                "w-full pl-3 pr-10 py-1.5 text-xs rounded-lg border border-bakery-orange/20 bg-white/50 backdrop-blur-sm",
                "focus:ring-2 focus:ring-bakery-accent outline-none transition-all",
                isLoading && "opacity-50"
              )}
            />
            <button
              onClick={handleMagic}
              disabled={isLoading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md bg-bakery-accent text-bakery-brown hover:scale-105 transition-transform disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : showSuccess ? (
                <Check className="w-3 h-3" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
            </button>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {pendingResult && (
        <div className="fixed inset-0 bg-bakery-brown/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-bakery-orange/20">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-serif italic text-bakery-brown">Confirm AI Mapping</h2>
                  <p className="text-bakery-orange font-medium">Verify data for "{columnName}" column</p>
                </div>
                <button 
                  onClick={() => setPendingResult(null)}
                  className="p-2 hover:bg-bakery-warm rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-bakery-orange">
                <div className="space-y-4">
                  <h3 className="flex items-center text-green-600 font-bold uppercase tracking-widest text-xs">
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Matched Items ({Object.keys(pendingResult.matches).length})
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(pendingResult.matches).map(([pId, qty]) => {
                      const product = products.find(p => p.id === pId);
                      return (
                        <div key={pId} className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-100">
                          <span className="text-sm font-medium text-bakery-brown">{product?.name || pId}</span>
                          <span className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold">{qty}</span>
                        </div>
                      );
                    })}
                    {Object.keys(pendingResult.matches).length === 0 && (
                      <p className="text-sm text-bakery-brown/40 italic">No matches found.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="flex items-center text-amber-600 font-bold uppercase tracking-widest text-xs">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Unmatched / New Items ({pendingResult.unmatched.length})
                  </h3>
                  <div className="space-y-2">
                    {pendingResult.unmatched.map((item, idx) => (
                      <div key={idx} className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-bakery-brown">{item.name}</span>
                          <span className="bg-amber-600 text-white px-3 py-1 rounded-lg text-xs font-bold">{item.qty}</span>
                        </div>
                        <p className="text-[10px] text-amber-700">This item was not found in the menu. Please add it first.</p>
                      </div>
                    ))}
                    {pendingResult.unmatched.length > 0 && (
                      <button 
                        onClick={() => {
                          setPendingResult(null);
                          onNavigateToMenu?.();
                        }}
                        className="w-full mt-2 text-xs text-bakery-brown font-bold underline hover:text-bakery-orange transition-colors"
                      >
                        Add Items to Menu
                      </button>
                    )}
                    {pendingResult.unmatched.length === 0 && (
                      <p className="text-sm text-bakery-brown/40 italic">All items matched perfectly!</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-10 flex space-x-4">
                <button 
                  onClick={() => setPendingResult(null)}
                  className="flex-1 py-4 rounded-2xl border-2 border-bakery-warm text-bakery-brown font-bold hover:bg-bakery-warm transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmData}
                  className="flex-[2] py-4 rounded-2xl bg-bakery-brown text-white font-bold shadow-xl shadow-bakery-brown/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Load Data to Table
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
