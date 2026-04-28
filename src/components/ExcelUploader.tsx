import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Upload, X, FileCheck, AlertCircle, RefreshCcw } from 'lucide-react';
import { cn } from '../lib/utils';

interface ExcelUploaderProps {
  onClose: () => void;
  onData: (data: Array<{ name: string; sold: number }>) => void;
}

export function ExcelUploader({ onClose, onData }: ExcelUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const processFile = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      setError('Please upload an Excel or CSV file.');
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const bstr = e.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet) as any[];

        // Expected format: { "Item": "Bread", "Qty Sold": 5 } or { "Name": "Bread", "Sold": 5 }
        const parsedData = data.map(row => {
          // Robust column finding
          const nameKey = Object.keys(row).find(k => 
            ['item', 'name', 'product', 'particular', 'description', 'snack item'].includes(k.toLowerCase())
          );
          const soldKey = Object.keys(row).find(k => 
            ['sold', 'qty sold', 'sales', 'sale', 'quantity', 'qty'].includes(k.toLowerCase())
          );

          let name = nameKey ? String(row[nameKey]) : '';
          let sold = soldKey ? parseInt(String(row[soldKey]) || '0') : 0;
          
          return { name, sold };
        }).filter(item => item.name && !isNaN(item.sold));

        if (parsedData.length === 0) {
          throw new Error("No data found. Check columns: 'Item' and 'Sold'.");
        }

        onData(parsedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error parsing file.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  return (
    <div className="fixed inset-0 bg-bakery-brown/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl relative overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-serif italic text-bakery-brown">Upload Daily Sales</h2>
              <p className="text-sm text-bakery-brown/50">Import excel from your POS system</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-bakery-warm rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer relative",
              isDragging ? "border-bakery-accent bg-bakery-accent/5 scale-[1.02]" : "border-bakery-warm hover:border-bakery-orange/30",
              loading && "opacity-50 pointer-events-none"
            )}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <input 
              id="fileInput"
              type="file" 
              className="hidden" 
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processFile(file);
              }}
            />
            
            <div className="w-20 h-20 bg-bakery-warm rounded-full mx-auto flex items-center justify-center mb-6">
              <Upload className="w-8 h-8 text-bakery-orange" />
            </div>
            
            <p className="text-lg font-medium text-bakery-brown mb-2">
              {isDragging ? "Drop file here" : "Click or drag excel file"}
            </p>
            <p className="text-sm text-bakery-brown/40">支持 XLSX, XLS, CSV 格式</p>

            <div className="mt-8 flex justify-center space-x-4">
              <div className="flex items-center space-x-1 text-xs text-bakery-brown/60">
                <FileCheck className="w-3 h-3" />
                <span>Auto-mapping Items</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 flex items-center space-x-2 text-red-500 bg-red-50 p-4 rounded-xl text-sm border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-10 bg-bakery-warm/50 p-6 rounded-2xl">
            <h4 className="text-sm font-bold text-bakery-brown mb-3">Expected Columns:</h4>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-white p-2 rounded border border-bakery-orange/10">Item</div>
              <div className="bg-white p-2 rounded border border-bakery-orange/10">Qty Sold</div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center">
              <RefreshCcw className="w-10 h-10 text-bakery-orange animate-spin mb-4" />
              <p className="font-serif italic">Processing inventory data...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
