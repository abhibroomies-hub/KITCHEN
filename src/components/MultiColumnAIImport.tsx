import React, { useState } from 'react';
import { Sparkles, Loader2, Check, X, CheckSquare, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { parseStockRowInput, MultiColumnParseResult } from '../services/geminiService';
import { Product } from '../types';

interface MultiColumnAIImportProps {
  products: Product[];
  onDataParsed: (data: Record<string, any>) => void;
}

export function MultiColumnAIImport({ products, onDataParsed }: MultiColumnAIImportProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingResult, setPendingResult] = useState<MultiColumnParseResult | null>(null);

  const handleAnalyze = async () => {
    if (!inputValue.trim()) return;
    setIsLoading(true);
    try {
      const result = await parseStockRowInput(inputValue, products);
      setPendingResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDataBase = () => {
    if (pendingResult) {
      onDataParsed(pendingResult.matches);
      setPendingResult(null);
      setInputValue('');
    }
  };

  if (pendingResult) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[50vh] overflow-y-auto pr-2">
          <div className="space-y-3">
            <h3 className="flex items-center text-green-600 font-bold uppercase tracking-widest text-xs">
              <CheckSquare className="w-4 h-4 mr-2" />
              Ready to Import ({Object.keys(pendingResult.matches).length})
            </h3>
            <div className="space-y-2">
              {Object.entries(pendingResult.matches).map(([pId, vals]) => {
                const product = products.find(p => p.id === pId);
                const info = vals as { opening?: number; received?: number; sold?: number; returned?: number };
                return (
                  <div key={pId} className="p-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex justify-between items-center border-b border-green-100 pb-2 mb-2">
                      <span className="text-sm font-bold text-bakery-brown">{product?.name || pId}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-[10px] text-center font-bold">
                      <div className="bg-white p-1 rounded border border-green-100">
                        <p className="text-bakery-brown/40 uppercase">Open</p>
                        <p className="text-bakery-brown">{info.opening || 0}</p>
                      </div>
                      <div className="bg-white p-1 rounded border border-green-100">
                        <p className="text-bakery-brown/40 uppercase">Recv</p>
                        <p className="text-bakery-brown">{info.received || 0}</p>
                      </div>
                      <div className="bg-white p-1 rounded border border-green-100">
                        <p className="text-bakery-brown/40 uppercase">Sale</p>
                        <p className="text-bakery-brown">{info.sold || 0}</p>
                      </div>
                      <div className="bg-white p-1 rounded border border-green-100">
                        <p className="text-bakery-brown/40 uppercase">Retn</p>
                        <p className="text-bakery-brown">{info.returned || 0}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="flex items-center text-amber-600 font-bold uppercase tracking-widest text-xs">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Unmatched Rows ({pendingResult.unmatched.length})
            </h3>
            <div className="space-y-2">
              {pendingResult.unmatched.map((item, idx) => (
                <div key={idx} className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-sm font-medium text-bakery-brown mb-1">{item.name}</p>
                  <p className="text-[10px] text-amber-700 italic">Could not find a matching product in the menu.</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex space-x-3 pt-4 border-t border-bakery-warm">
          <button 
            onClick={() => setPendingResult(null)}
            className="flex-1 py-3 rounded-xl border-2 border-bakery-warm text-bakery-brown font-bold hover:bg-bakery-warm transition-all"
          >
            Go Back
          </button>
          <button 
            onClick={confirmDataBase}
            className="flex-[2] py-3 rounded-xl bg-bakery-brown text-white font-bold hover:bg-bakery-orange transition-all"
          >
            Import Data Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={`Paste your list here...\nExample Row:\nClassic Pineapple Pastry 10 5 2 0\n...`}
        rows={10}
        className={cn(
          "w-full p-6 text-sm rounded-[2rem] border-2 border-bakery-orange/10 bg-bakery-cream/20 focus:bg-white",
          "focus:ring-4 focus:ring-bakery-accent outline-none transition-all resize-none font-medium",
          isLoading && "opacity-50"
        )}
      />
      <button
        onClick={handleAnalyze}
        disabled={isLoading || !inputValue.trim()}
        className="w-full py-4 rounded-2xl bg-bakery-brown text-white font-bold flex items-center justify-center space-x-2 hover:bg-bakery-orange transition-all disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Analyze Universal Data</span>
          </>
        )}
      </button>
    </div>
  );
}
