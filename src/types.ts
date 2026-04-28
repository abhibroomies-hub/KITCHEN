/**
 * Broomies Bakery Automation Types
 */

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
}

export interface StockEntry {
  productId: string;
  openingStock: number;
  received: number;
  sold: number;
  returned: number;
  closingStock: number;
  lastUpdated: string;
}

export interface Outlet {
  id: string;
  name: string;
  location: string;
  stock: Record<string, StockEntry>; // productId as key
}

export type ViewType = 'dashboard' | 'outlet-detail' | 'inventory' | 'settings' | 'history' | 'production';

export interface HistoryRecord {
  date: string; // YYYY-MM-DD
  outletId: string;
  stock: Record<string, StockEntry>;
}
