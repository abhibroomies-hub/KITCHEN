import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Trash2, Edit2, Search, Package, Save, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface MenuManagerProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export function MenuManager({ products, onAddProduct, onUpdateProduct, onDeleteProduct }: MenuManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'Cakes',
    unit: 'Pcs'
  });

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingId) {
      onUpdateProduct({ ...formData, id: editingId } as Product);
      setEditingId(null);
    } else {
      const newId = `custom-${Date.now()}`;
      onAddProduct({ ...formData, id: newId } as Product);
      setIsAdding(false);
    }
    setFormData({ name: '', category: 'Cakes', unit: 'Pcs' });
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setFormData(p);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-2.5 rounded-xl shadow-sm border border-bakery-orange/10">
            <Package className="w-6 h-6 text-bakery-orange" />
          </div>
          <div>
            <h1 className="text-2xl font-serif italic text-bakery-brown">Menu Management</h1>
            <p className="text-bakery-orange text-sm font-medium">Manage product catalog</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: '', category: 'Cakes', unit: 'Pcs' }); }}
            className="bg-bakery-orange text-white px-6 py-3 rounded-xl font-black text-sm flex items-center space-x-2 hover:bg-bakery-brown transition-all shadow-lg shadow-bakery-orange/20"
          >
            <Plus className="w-5 h-5" />
            <span>Add Item</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-bakery-orange/10 focus:ring-2 focus:ring-bakery-accent outline-none font-medium"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-bakery-orange/40 w-5 h-5" />
        </div>
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="bg-bakery-brown text-white p-8 rounded-[2.5rem] shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-serif italic">{editingId ? 'Edit Item' : 'Add New Item'}</h3>
            <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="p-2 hover:bg-white/10 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Item Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Vanilla Pastry"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-bakery-accent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-bakery-accent outline-none appearance-none"
              >
                {categories.map(c => <option key={c} value={c} className="text-bakery-brown">{c}</option>)}
                <option value="Other" className="text-bakery-brown">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Unit</label>
              <select 
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-bakery-accent outline-none appearance-none"
              >
                <option value="Pcs" className="text-bakery-brown">Pcs (Pieces)</option>
                <option value="Pkt" className="text-bakery-brown">Pkt (Packets)</option>
                <option value="Kg" className="text-bakery-brown">Kg (Kilograms)</option>
                <option value="Box" className="text-bakery-brown">Box</option>
              </select>
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button type="submit" className="bg-bakery-accent text-bakery-brown px-8 py-3 rounded-xl font-bold flex items-center space-x-2">
              <Save className="w-5 h-5" />
              <span>{editingId ? 'Update Item' : 'Save Item'}</span>
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-3xl border border-bakery-orange/5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-bakery-warm flex items-center justify-center text-bakery-orange">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-bakery-brown">{p.name}</h4>
                  <p className="text-xs text-bakery-orange font-medium">{p.category} • {p.unit}</p>
                </div>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(p)} className="p-2 text-bakery-brown hover:bg-bakery-warm rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => onDeleteProduct(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-bakery-warm/20 rounded-full -z-0"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
