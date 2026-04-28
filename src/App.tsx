/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ViewType, Product, Outlet, StockEntry } from './types';
import { Dashboard } from './components/Dashboard';
import { OutletManager } from './components/OutletManager';
import { InventoryManager } from './components/InventoryManager';
import { MenuManager } from './components/MenuManager';
import { motion, AnimatePresence } from 'motion/react';

// Full Menu Integration - Expanded to 181 items as requested
const DATA_VERSION = 'v3';

const INITIAL_PRODUCTS: Product[] = [
  // Pastries
  { id: 'ps-1', name: 'Classic Pineapple Pastry', category: 'Pastry', unit: 'Pcs' },
  { id: 'ps-2', name: 'Black Forest Pastry', category: 'Pastry', unit: 'Pcs' },
  { id: 'ps-3', name: 'Chocolate Truffle Pastry', category: 'Pastry', unit: 'Pcs' },
  { id: 'ps-4', name: 'Red Velvet Pastry', category: 'Pastry', unit: 'Pcs' },
  { id: 'ps-5', name: 'Blueberry Pastry', category: 'Pastry', unit: 'Pcs' },
  { id: 'ps-6', name: 'Rainbow Pastry', category: 'Pastry', unit: 'Pcs' },
  { id: 'ps-7', name: 'Blueberry Cheese pastry', category: 'Pastry', unit: 'Pcs' },
  { id: 'ps-8', name: 'Nutella Cheese pastry', category: 'Pastry', unit: 'Pcs' },
  { id: 'ps-9', name: 'Kunafa Pastry', category: 'Pastry', unit: 'Pcs' },
  { id: 'ps-10', name: 'Biscoff Cheese Pastry', category: 'Pastry', unit: 'Pcs' },
  { id: 'ps-11', name: 'Ferrero Rocher Pastry', category: 'Pastry', unit: 'Pcs' },
  { id: 'ps-12', name: 'Apple Pie', category: 'Pastry', unit: 'Pcs' },
  
  // Jars & Tubs
  { id: 'jr-1', name: 'Banofee Pie Cake Jar', category: 'Dessert Jar', unit: 'Pcs' },
  { id: 'jr-2', name: 'Blueberry Cake Jar', category: 'Dessert Jar', unit: 'Pcs' },
  { id: 'jr-3', name: 'Chocolate Truffle Cake Jar', category: 'Dessert Jar', unit: 'Pcs' },
  { id: 'jr-4', name: 'Lotus Biscoff Dessert Tub', category: 'Dessert Jar', unit: 'Pcs' },
  { id: 'jr-5', name: 'Nutella Cake Jar', category: 'Dessert Jar', unit: 'Pcs' },
  { id: 'jr-6', name: 'Rasmalai Cakr Jar', category: 'Dessert Jar', unit: 'Pcs' },
  { id: 'jr-7', name: 'Red Velvet Cake Jar', category: 'Dessert Jar', unit: 'Pcs' },
  { id: 'jr-8', name: 'Tiramisu Dessert Tub', category: 'Dessert Jar', unit: 'Pcs' },

  // Cakes 1/2 Kg
  { id: 'ck-1', name: 'Vanilla Cake 1/2 Kg', category: 'Cakes', unit: 'Pcs' },
  { id: 'ck-2', name: 'Pineapple Cake 1/2 Kg', category: 'Cakes', unit: 'Pcs' },
  { id: 'ck-3', name: 'White Forest Cake 1/2 Kg', category: 'Cakes', unit: 'Pcs' },
  { id: 'ck-4', name: 'Black Forest Cake 1/2 Kg', category: 'Cakes', unit: 'Pcs' },
  { id: 'ck-5', name: 'Chocolate Truffle Cake 1/2 Kg', category: 'Cakes', unit: 'Pcs' },
  { id: 'ck-6', name: 'Butterscotch Cake 1/2 Kg', category: 'Cakes', unit: 'Pcs' },
  { id: 'ck-7', name: 'Fresh Fruit Cake 1/2 Kg', category: 'Cakes', unit: 'Pcs' },
  { id: 'ck-8', name: 'Blueberry Cake 1/2 Kg', category: 'Cakes', unit: 'Pcs' },
  { id: 'ck-9', name: 'Red Velvet Cake 1/2 Kg', category: 'Cakes', unit: 'Pcs' },
  { id: 'ck-10', name: 'Blueberry Cheese Cake 1/2 Kg', category: 'Cakes', unit: 'Pcs' },
  { id: 'ck-11', name: 'Nutella Cheese Cake 1/2 Kg', category: 'Cakes', unit: 'Pcs' },
  { id: 'ck-12', name: 'Lotus Biscoff Cheese Cake 1/2 Kg', category: 'Cakes', unit: 'Pcs' },
  { id: 'ck-13', name: 'Tiramisu ( Coffe Flaviour ) Cake 1/2 Kg', category: 'Cakes', unit: 'Pcs' },
  { id: 'ck-14', name: 'Rose & Pistacho Cake 1/2 Kg', category: 'Cakes', unit: 'Pcs' },
  { id: 'ck-15', name: 'Rasmalai Cake 1/2 Kg', category: 'Cakes', unit: 'Pcs' },
  { id: 'ck-16', name: 'Kit - Kat Gems Cake 1/2 Kg', category: 'Cakes', unit: 'Pcs' },
  { id: 'ck-17', name: 'Ferraro Rocher Cake 1/2 Kg', category: 'Cakes', unit: 'Pcs' },
  { id: 'ck-18', name: 'Fresh Mango Cake 1/2 Kg', category: 'Cakes', unit: 'Pcs' },
  { id: 'ck-19', name: 'Fresh Strawberry Cake 1/2 Kg', category: 'Cakes', unit: 'Pcs' },

  // Cakes 1 Kg
  { id: 'ck1-1', name: 'Vanilla Cake 1 Kg', category: 'Cakes (1Kg)', unit: 'Pcs' },
  { id: 'ck1-2', name: 'Pineapple Cake 1 Kg', category: 'Cakes (1Kg)', unit: 'Pcs' },
  { id: 'ck1-3', name: 'White Forest Cake 1 Kg', category: 'Cakes (1Kg)', unit: 'Pcs' },
  { id: 'ck1-4', name: 'Black Forest Cake 1 Kg', category: 'Cakes (1Kg)', unit: 'Pcs' },
  { id: 'ck1-5', name: 'Chocolate Truffle Cake 1 Kg', category: 'Cakes (1Kg)', unit: 'Pcs' },
  { id: 'ck1-6', name: 'Butterscotch Cake 1 Kg', category: 'Cakes (1Kg)', unit: 'Pcs' },
  { id: 'ck1-7', name: 'Fresh Fruit Cake 1 Kg', category: 'Cakes (1Kg)', unit: 'Pcs' },
  { id: 'ck1-8', name: 'Blueberry Cake 1 Kg', category: 'Cakes (1Kg)', unit: 'Pcs' },
  { id: 'ck1-9', name: 'Red Velvet Cake 1 Kg', category: 'Cakes (1Kg)', unit: 'Pcs' },
  { id: 'ck1-10', name: 'Blueberry Cheese Cake 1 Kg', category: 'Cakes (1Kg)', unit: 'Pcs' },
  { id: 'ck1-11', name: 'Nutella Cheese Cake 1 Kg', category: 'Cakes (1Kg)', unit: 'Pcs' },
  { id: 'ck1-12', name: 'Lotus Biscoff Cheese Cake 1 Kg', category: 'Cakes (1Kg)', unit: 'Pcs' },
  { id: 'ck1-13', name: 'Tiramisu ( Coffe Flaviour ) Cake 1 Kg', category: 'Cakes (1Kg)', unit: 'Pcs' },
  { id: 'ck1-14', name: 'Rose & Pistacho Cake 1 Kg', category: 'Cakes (1Kg)', unit: 'Pcs' },
  { id: 'ck1-15', name: 'Rasmalai Cake 1 Kg', category: 'Cakes (1Kg)', unit: 'Pcs' },
  { id: 'ck1-16', name: 'Kit - Kat Gems Cake 1 Kg', category: 'Cakes (1Kg)', unit: 'Pcs' },
  { id: 'ck1-17', name: 'Ferraro Rocher Cake 1 Kg', category: 'Cakes (1Kg)', unit: 'Pcs' },
  { id: 'ck1-18', name: 'Fresh Mango Cake 1 Kg', category: 'Cakes (1Kg)', unit: 'Pcs' },
  { id: 'ck1-19', name: 'Fresh Strawberry Cake 1 Kg', category: 'Cakes (1Kg)', unit: 'Pcs' },

  // Dry Cakes
  { id: 'dc-1', name: 'Plum Cake 250 Gm', category: 'Dry Cakes', unit: 'Pkt' },
  { id: 'dc-2', name: 'Mawa Dry Cake 250 Gm', category: 'Dry Cakes', unit: 'Pkt' },
  { id: 'dc-3', name: 'Choco Chip Dry Cake 250 Gm', category: 'Dry Cakes', unit: 'Pkt' },
  { id: 'dc-4', name: 'Date & Walnut Dry Cake 250 Gm', category: 'Dry Cakes', unit: 'Pkt' },
  { id: 'dc-5', name: 'Plum Cake 1/2 Kg', category: 'Dry Cakes', unit: 'Pkt' },
  { id: 'dc-6', name: 'Mawa Dry Cake 1/2 Kg', category: 'Dry Cakes', unit: 'Pkt' },
  { id: 'dc-7', name: 'Choco Chip Dry Cake 1/2 Kg', category: 'Dry Cakes', unit: 'Pkt' },
  { id: 'dc-8', name: 'Date & Walnut Dry Cake 1/2 Kg', category: 'Dry Cakes', unit: 'Pkt' },
  { id: 'dc-9', name: 'Plum Cake 1 Kg', category: 'Dry Cakes', unit: 'Pkt' },
  { id: 'dc-10', name: 'Mawa Dry Cake 1 Kg', category: 'Dry Cakes', unit: 'Pkt' },
  { id: 'dc-11', name: 'Choco Chip Dry Cake 1 Kg', category: 'Dry Cakes', unit: 'Pkt' },
  { id: 'dc-12', name: 'Date & Walnut Dry Cake 1 Kg', category: 'Dry Cakes', unit: 'Pkt' },

  // Cookies & Rusks
  { id: 'co-1', name: 'Jeera Sticks Cookies', category: 'Biscuits', unit: 'Pkt' },
  { id: 'co-2', name: 'Multigrain Cookies', category: 'Biscuits', unit: 'Pkt' },
  { id: 'co-3', name: 'Butter Kaju', category: 'Biscuits', unit: 'Pkt' },
  { id: 'co-4', name: 'American Almond Cookies', category: 'Biscuits', unit: 'Pkt' },
  { id: 'co-5', name: 'Red Velvet Cookies', category: 'Biscuits', unit: 'Pkt' },
  { id: 'co-6', name: 'Oatmeal Cookies', category: 'Biscuits', unit: 'Pkt' },
  { id: 'co-7', name: 'Garlic Bread Toast', category: 'Biscuits', unit: 'Pkt' },
  { id: 'co-8', name: 'Mocha Cookie', category: 'Biscuits', unit: 'Pkt' },
  { id: 'co-9', name: 'Cheese Cracker', category: 'Biscuits', unit: 'Pkt' },
  { id: 'co-10', name: 'Double Choco Chips', category: 'Biscuits', unit: 'Pkt' },
  { id: 'co-11', name: 'Soup Stick', category: 'Biscuits', unit: 'Pkt' },
  { id: 'co-12', name: 'Cake Rusk', category: 'Biscuits', unit: 'Pkt' },
  { id: 'co-13', name: 'Lavash', category: 'Biscuits', unit: 'Pkt' },
  { id: 'co-14', name: 'Kaju Pista', category: 'Biscuits', unit: 'Pkt' },
  { id: 'co-15', name: 'Coconut Macroons', category: 'Biscuits', unit: 'Pkt' },
  { id: 'co-16', name: 'Ragi Gluten Free', category: 'Biscuits', unit: 'Pkt' },
  { id: 'co-17', name: 'Besan Khatai', category: 'Biscuits', unit: 'Pkt' },
  { id: 'co-18', name: 'Almond Biscooti', category: 'Biscuits', unit: 'Pkt' },
  { id: 'co-19', name: 'French Heart', category: 'Biscuits', unit: 'Pkt' },
  { id: 'co-20', name: 'Cheese Straw', category: 'Biscuits', unit: 'Pkt' },

  // Chips & Snacks
  { id: 'sn-1', name: 'Quinoa Finger', category: 'Snacks', unit: 'Pkt' },
  { id: 'sn-2', name: 'Quinoa Chips', category: 'Snacks', unit: 'Pkt' },
  { id: 'sn-3', name: 'Raagi Chips', category: 'Snacks', unit: 'Pkt' },
  { id: 'sn-4', name: 'Raagi Crisps', category: 'Snacks', unit: 'Pkt' },
  { id: 'sn-5', name: 'Cocktail Mixture', category: 'Snacks', unit: 'Pkt' },
  { id: 'sn-6', name: 'Beetroot Chips', category: 'Snacks', unit: 'Pkt' },
  { id: 'sn-7', name: 'Broccoli Chips', category: 'Snacks', unit: 'Pkt' },
  { id: 'sn-8', name: 'Oatmeal Chips', category: 'Snacks', unit: 'Pkt' },

  // Savory & Breads
  { id: 'br-1', name: 'Butter Croissant', category: 'Bakery', unit: 'Pcs' },
  { id: 'br-2', name: 'Chocolate Croissnat', category: 'Bakery', unit: 'Pcs' },
  { id: 'br-3', name: 'Mini Croissant', category: 'Bakery', unit: 'Pcs' },
  { id: 'br-4', name: 'Chocolate Brownie', category: 'Bakery', unit: 'Pcs' },
  { id: 'br-5', name: 'Burger Bun Normal', category: 'Bread', unit: 'Pkt' },
  { id: 'br-6', name: 'Whole Wheat Burger Bun', category: 'Bread', unit: 'Pkt' },
  { id: 'br-7', name: 'White Bread', category: 'Bread', unit: 'Pkt' },
  { id: 'br-8', name: 'Milk Bread', category: 'Bread', unit: 'Pkt' },
  { id: 'br-9', name: 'Brown Bread', category: 'Bread', unit: 'Pkt' },
  { id: 'br-10', name: 'Whole Wheat Bread', category: 'Bread', unit: 'Pkt' },
  { id: 'br-11', name: 'Multigrain Bread', category: 'Bread', unit: 'Pkt' },
  { id: 'br-12', name: 'Jumbo Bread', category: 'Bread', unit: 'Pkt' },
  { id: 'br-13', name: 'Multigrain Jumbo Bread', category: 'Bread', unit: 'Pkt' },
  { id: 'br-14', name: 'Garlic Loaf', category: 'Bread', unit: 'Pcs' },
  { id: 'br-15', name: 'Multigrain Loaf', category: 'Bread', unit: 'Pcs' },
  { id: 'br-16', name: 'Milk Pao', category: 'Bread', unit: 'Pkt' },
  { id: 'br-17', name: 'Foccacia Bread', category: 'Bread', unit: 'Pcs' },
  { id: 'br-18', name: 'Multigrain Garlic Loaf', category: 'Bread', unit: 'Pcs' },
  { id: 'br-19', name: 'Wholewheat Pizza Base (Pack Of 2pcs)', category: 'Bread', unit: 'Pkt' },
  { id: 'br-20', name: 'Micro Burger Bun (Pack Of 6pcs)', category: 'Bread', unit: 'Pkt' },

  // Patties & Puffs
  { id: 'sv-1', name: 'Aloo Patty', category: 'Savory', unit: 'Pcs' },
  { id: 'sv-2', name: 'Paneer Patty', category: 'Savory', unit: 'Pcs' },
  { id: 'sv-3', name: 'Mushroom Patty', category: 'Savory', unit: 'Pcs' },
  { id: 'sv-4', name: 'Korean Chilli Paneer Puff', category: 'Savory', unit: 'Pcs' },
  { id: 'sv-5', name: 'Soya Keema Biryani Puff', category: 'Savory', unit: 'Pcs' },
  { id: 'sv-6', name: 'Onion Kachori', category: 'Savory', unit: 'Pcs' },
  { id: 'sv-7', name: 'Hot Dog', category: 'Savory', unit: 'Pcs' },
  { id: 'sv-8', name: 'Vada Pao', category: 'Savory', unit: 'Pcs' },
  { id: 'sv-9', name: 'Stuff Paneer Kulcha', category: 'Savory', unit: 'Pcs' },
  { id: 'sv-10', name: 'Mushroom Vol Au Vents', category: 'Savory', unit: 'Pcs' },

  // Chocolates
  { id: 'ch-1', name: 'Butterscotch Chocolate Rs 15', category: 'Chocolates', unit: 'Pcs' },
  { id: 'ch-2', name: 'Dark Chocolate Rs 15', category: 'Chocolates', unit: 'Pcs' },
  { id: 'ch-3', name: 'Fruit Chocolate Rs 15', category: 'Chocolates', unit: 'Pcs' },
  { id: 'ch-4', name: 'Lollypop Rs 30', category: 'Chocolates', unit: 'Pcs' },
  { id: 'ch-5', name: 'Chocolate Bar', category: 'Chocolates', unit: 'Pcs' },
  { id: 'ch-6', name: 'Chocolate Box 12 pcs', category: 'Chocolates', unit: 'Pcs' },
  { id: 'ch-7', name: 'Chocolate Box 24 pcs', category: 'Chocolates', unit: 'Pcs' },
  { id: 'ch-8', name: 'Chocolate Crystal Box 25 pcs', category: 'Chocolates', unit: 'Pcs' },
  { id: 'ch-9', name: 'Surprise Chocolate Box 20 pcs', category: 'Chocolates', unit: 'Pcs' },
  { id: 'ch-10', name: 'Chocolate Jar Bottle 9 pcs', category: 'Chocolates', unit: 'Pcs' },
  { id: 'ch-11', name: 'Chocolate Cone Rs 150', category: 'Chocolates', unit: 'Pcs' },
  { id: 'ch-12', name: 'Love Box 6 Cavity Rs 150', category: 'Chocolates', unit: 'Pcs' },

  // Others
  { id: 'ot-1', name: 'Brownie', category: 'Bakery', unit: 'Pcs' },
  { id: 'ot-2', name: 'Chocolate Cream Roll', category: 'Bakery', unit: 'Pcs' },
  { id: 'ot-3', name: 'Choolate Cup Cake', category: 'Bakery', unit: 'Pcs' },
  { id: 'ot-4', name: 'Chocolate Doughnut', category: 'Bakery', unit: 'Pcs' },
  { id: 'ot-5', name: 'Mango Cream Roll', category: 'Bakery', unit: 'Pcs' },
  { id: 'ot-6', name: 'Nutella Filled Doughnut', category: 'Bakery', unit: 'Pcs' },
  { id: 'ot-7', name: 'Rich Choco Lava', category: 'Bakery', unit: 'Pcs' },

  // Candles & Decor
  { id: 'it-1', name: 'Spiral Candle', category: 'Items', unit: 'Pcs' },
  { id: 'it-2', name: 'Sparkle Candle per piece', category: 'Items', unit: 'Pcs' },
  { id: 'it-3', name: 'Golden Number Candle', category: 'Items', unit: 'Pcs' },
  { id: 'it-4', name: 'Magic Candles', category: 'Items', unit: 'Pcs' },
  { id: 'it-5', name: 'Birthday Balloon Big (1pcs)', category: 'Items', unit: 'Pcs' },
  { id: 'it-6', name: 'Mix Balloon Small', category: 'Items', unit: 'Pcs' },
  { id: 'it-7', name: 'Foil Balloon All', category: 'Items', unit: 'Pcs' },
  { id: 'it-8', name: 'Banneer (Birthday/Anniversary)', category: 'Items', unit: 'Pcs' },
  { id: 'it-9', name: 'Cake Topper All', category: 'Items', unit: 'Pcs' },
  { id: 'it-10', name: 'Foil Fring Curtains', category: 'Items', unit: 'Pcs' },
  { id: 'it-11', name: 'Golden Crown', category: 'Items', unit: 'Pcs' },
  { id: 'it-12', name: 'Tiara Golden/Sliver Rs 250', category: 'Items', unit: 'Pcs' },
  { id: 'it-13', name: 'Tiara Flower', category: 'Items', unit: 'Pcs' },
  { id: 'it-14', name: 'Poppers small', category: 'Items', unit: 'Pcs' },
  { id: 'it-15', name: 'Poppers Big', category: 'Items', unit: 'Pcs' },
  { id: 'it-16', name: 'Sashes', category: 'Items', unit: 'Pcs' },
  { id: 'it-17', name: 'Birthday Caps', category: 'Items', unit: 'Pcs' },

  // Beverages
  { id: 'bv-1', name: 'Water 1 Ltr', category: 'Beverages', unit: 'Pcs' },
  { id: 'bv-2', name: 'Water', category: 'Beverages', unit: 'Pcs' },
  { id: 'bv-3', name: 'Thumps up Bottle Rs 20', category: 'Beverages', unit: 'Pcs' },
  { id: 'bv-4', name: 'Sprite Bottle Rs 20', category: 'Beverages', unit: 'Pcs' },
  { id: 'bv-5', name: 'Limca Bottle Rs 20', category: 'Beverages', unit: 'Pcs' },
  { id: 'bv-6', name: 'Coke Bottle Rs 20', category: 'Beverages', unit: 'Pcs' },
  { id: 'bv-7', name: 'Fanta Can Rs 40', category: 'Beverages', unit: 'Pcs' },
  { id: 'bv-8', name: 'Sprite Can Rs 40', category: 'Beverages', unit: 'Pcs' },
  { id: 'bv-9', name: 'Coke Can Rs 40', category: 'Beverages', unit: 'Pcs' },
  { id: 'bv-10', name: 'Diet Coke Can Rs 70', category: 'Beverages', unit: 'Pcs' },

  // Hampers
  { id: 'hm-1', name: 'Gift Hamper 2 pcs Cookies Rs 350', category: 'Gifts', unit: 'Pcs' },
  { id: 'hm-2', name: 'Gift Hamper 4 pcs Cookies Rs 700', category: 'Gifts', unit: 'Pcs' },
  { id: 'hm-3', name: 'Jute Basket (Pack of 2) Rs 550', category: 'Gifts', unit: 'Pcs' },
  { id: 'hm-4', name: 'Wooden Small Square (3cookies & 1 chocolate Jar) Rs 850', category: 'Gifts', unit: 'Pcs' },
  { id: 'hm-5', name: 'Wooden Hexagon Medium (4cookies & 1 chocolate Jar) Rs 1250', category: 'Gifts', unit: 'Pcs' },
  { id: 'hm-6', name: 'Jute round Hamper (5Cookies & 1 Chocolate Jar) Rs 1400', category: 'Gifts', unit: 'Pcs' },
  { id: 'hm-7', name: 'Golden Metal Hamper (5cookies & 1 Chocolate Jar) Rs 1400', category: 'Gifts', unit: 'Pcs' },
];

const INITIAL_OUTLETS: Outlet[] = [
  { id: 'sec31', name: 'Sec 31 Outlet', location: 'Sector 31', stock: {} },
  { id: 'sec35', name: 'Sec 35 Outlet', location: 'Sector 35', stock: {} },
  { id: 'sec42', name: 'Sec 42 Outlet', location: 'Sector 42', stock: {} },
  { id: 'sec88', name: 'Sec 88 Outlet', location: 'Sector 88', stock: {
    'ps-1': { productId: 'ps-1', openingStock: 3, received: 5, sold: 0, returned: 3, closingStock: 5, lastUpdated: new Date().toISOString() },
    'ps-2': { productId: 'ps-2', openingStock: 1, received: 0, sold: 0, returned: 0, closingStock: 1, lastUpdated: new Date().toISOString() },
    'ps-3': { productId: 'ps-3', openingStock: 3, received: 5, sold: 0, returned: 0, closingStock: 8, lastUpdated: new Date().toISOString() },
    'ps-4': { productId: 'ps-4', openingStock: 2, received: 2, sold: 0, returned: 2, closingStock: 2, lastUpdated: new Date().toISOString() },
    'ps-5': { productId: 'ps-5', openingStock: 0, received: 2, sold: 0, returned: 0, closingStock: 2, lastUpdated: new Date().toISOString() },
    'ps-6': { productId: 'ps-6', openingStock: 1, received: 3, sold: 0, returned: 0, closingStock: 4, lastUpdated: new Date().toISOString() },
    'ps-7': { productId: 'ps-7', openingStock: 4, received: 0, sold: 0, returned: 0, closingStock: 4, lastUpdated: new Date().toISOString() },
    'ps-8': { productId: 'ps-8', openingStock: 2, received: 2, sold: 0, returned: 0, closingStock: 4, lastUpdated: new Date().toISOString() },
    'ck-1': { productId: 'ck-1', openingStock: 0, received: 1, sold: 0, returned: 0, closingStock: 1, lastUpdated: new Date().toISOString() },
    'ck-2': { productId: 'ck-2', openingStock: 1, received: 1, sold: 0, returned: 1, closingStock: 1, lastUpdated: new Date().toISOString() },
    'ck-4': { productId: 'ck-4', openingStock: 0, received: 1, sold: 0, returned: 0, closingStock: 1, lastUpdated: new Date().toISOString() },
    'ck-5': { productId: 'ck-5', openingStock: 1, received: 2, sold: 0, returned: 1, closingStock: 2, lastUpdated: new Date().toISOString() },
    'ck-6': { productId: 'ck-6', openingStock: 0, received: 2, sold: 0, returned: 0, closingStock: 2, lastUpdated: new Date().toISOString() },
    'ck-7': { productId: 'ck-7', openingStock: 1, received: 0, sold: 0, returned: 1, closingStock: 0, lastUpdated: new Date().toISOString() },
    'ck-8': { productId: 'ck-8', openingStock: 0, received: 1, sold: 0, returned: 0, closingStock: 1, lastUpdated: new Date().toISOString() },
    'ck-18': { productId: 'ck-18', openingStock: 0, received: 1, sold: 0, returned: 0, closingStock: 1, lastUpdated: new Date().toISOString() },
    'dc-3': { productId: 'dc-3', openingStock: 1, received: 0, sold: 0, returned: 0, closingStock: 1, lastUpdated: new Date().toISOString() },
    'dc-4': { productId: 'dc-4', openingStock: 1, received: 0, sold: 0, returned: 0, closingStock: 1, lastUpdated: new Date().toISOString() },
    'co-1': { productId: 'co-1', openingStock: 3, received: 0, sold: 0, returned: 0, closingStock: 3, lastUpdated: new Date().toISOString() },
    'co-4': { productId: 'co-4', openingStock: 3, received: 0, sold: 0, returned: 0, closingStock: 3, lastUpdated: new Date().toISOString() },
    'co-5': { productId: 'co-5', openingStock: 3, received: 0, sold: 0, returned: 0, closingStock: 3, lastUpdated: new Date().toISOString() },
    'co-6': { productId: 'co-6', openingStock: 4, received: 0, sold: 0, returned: 0, closingStock: 4, lastUpdated: new Date().toISOString() },
    'co-7': { productId: 'co-7', openingStock: 4, received: 0, sold: 0, returned: 0, closingStock: 4, lastUpdated: new Date().toISOString() },
    'co-10': { productId: 'co-10', openingStock: 3, received: 0, sold: 0, returned: 0, closingStock: 3, lastUpdated: new Date().toISOString() },
    'co-11': { productId: 'co-11', openingStock: 3, received: 0, sold: 0, returned: 0, closingStock: 3, lastUpdated: new Date().toISOString() },
    'co-12': { productId: 'co-12', openingStock: 4, received: 0, sold: 0, returned: 0, closingStock: 4, lastUpdated: new Date().toISOString() },
    'co-14': { productId: 'co-14', openingStock: 4, received: 0, sold: 0, returned: 0, closingStock: 4, lastUpdated: new Date().toISOString() },
    'co-15': { productId: 'co-15', openingStock: 3, received: 0, sold: 0, returned: 0, closingStock: 3, lastUpdated: new Date().toISOString() },
    'co-17': { productId: 'co-17', openingStock: 4, received: 0, sold: 0, returned: 0, closingStock: 4, lastUpdated: new Date().toISOString() },
    'co-18': { productId: 'co-18', openingStock: 2, received: 0, sold: 0, returned: 0, closingStock: 2, lastUpdated: new Date().toISOString() },
    'sn-1': { productId: 'sn-1', openingStock: 2, received: 0, sold: 0, returned: 0, closingStock: 2, lastUpdated: new Date().toISOString() },
    'sn-2': { productId: 'sn-2', openingStock: 4, received: 0, sold: 0, returned: 0, closingStock: 4, lastUpdated: new Date().toISOString() },
    'sn-3': { productId: 'sn-3', openingStock: 2, received: 0, sold: 0, returned: 0, closingStock: 2, lastUpdated: new Date().toISOString() },
    'sn-4': { productId: 'sn-4', openingStock: 4, received: 0, sold: 0, returned: 0, closingStock: 4, lastUpdated: new Date().toISOString() },
    'sn-5': { productId: 'sn-5', openingStock: 5, received: 0, sold: 0, returned: 0, closingStock: 5, lastUpdated: new Date().toISOString() },
    'sn-6': { productId: 'sn-6', openingStock: 3, received: 0, sold: 0, returned: 0, closingStock: 3, lastUpdated: new Date().toISOString() },
    'sn-7': { productId: 'sn-7', openingStock: 4, received: 0, sold: 0, returned: 0, closingStock: 4, lastUpdated: new Date().toISOString() },
    'br-1': { productId: 'br-1', openingStock: 2, received: 0, sold: 0, returned: 0, closingStock: 2, lastUpdated: new Date().toISOString() },
    'br-2': { productId: 'br-2', openingStock: 2, received: 0, sold: 0, returned: 0, closingStock: 2, lastUpdated: new Date().toISOString() },
    'br-8': { productId: 'br-8', openingStock: 0, received: 1, sold: 0, returned: 0, closingStock: 1, lastUpdated: new Date().toISOString() },
    'sv-1': { productId: 'sv-1', openingStock: 2, received: 2, sold: 0, returned: 0, closingStock: 4, lastUpdated: new Date().toISOString() },
    'sv-2': { productId: 'sv-2', openingStock: 0, received: 2, sold: 0, returned: 0, closingStock: 2, lastUpdated: new Date().toISOString() },
    'sv-4': { productId: 'sv-4', openingStock: 0, received: 2, sold: 0, returned: 0, closingStock: 2, lastUpdated: new Date().toISOString() },
    'sv-8': { productId: 'sv-8', openingStock: 1, received: 0, sold: 0, returned: 0, closingStock: 1, lastUpdated: new Date().toISOString() },
    'ch-2': { productId: 'ch-2', openingStock: 33, received: 0, sold: 0, returned: 0, closingStock: 33, lastUpdated: new Date().toISOString() },
    'ch-4': { productId: 'ch-4', openingStock: 12, received: 0, sold: 0, returned: 0, closingStock: 12, lastUpdated: new Date().toISOString() },
    'ch-6': { productId: 'ch-6', openingStock: 2, received: 0, sold: 0, returned: 0, closingStock: 2, lastUpdated: new Date().toISOString() },
    'ch-8': { productId: 'ch-8', openingStock: 4, received: 0, sold: 0, returned: 0, closingStock: 4, lastUpdated: new Date().toISOString() },
    'ch-10': { productId: 'ch-10', openingStock: 4, received: 0, sold: 0, returned: 0, closingStock: 4, lastUpdated: new Date().toISOString() },
    'ps-12': { productId: 'ps-12', openingStock: 3, received: 0, sold: 0, returned: 0, closingStock: 3, lastUpdated: new Date().toISOString() },
    'ot-1': { productId: 'ot-1', openingStock: 9, received: 0, sold: 0, returned: 0, closingStock: 9, lastUpdated: new Date().toISOString() },
    'ot-3': { productId: 'ot-3', openingStock: 2, received: 2, sold: 0, returned: 0, closingStock: 4, lastUpdated: new Date().toISOString() },
    'ot-4': { productId: 'ot-4', openingStock: 3, received: 0, sold: 0, returned: 0, closingStock: 3, lastUpdated: new Date().toISOString() },
    'ot-6': { productId: 'ot-6', openingStock: 4, received: 2, sold: 0, returned: 0, closingStock: 6, lastUpdated: new Date().toISOString() },
    'ot-7': { productId: 'ot-7', openingStock: 6, received: 0, sold: 0, returned: 0, closingStock: 6, lastUpdated: new Date().toISOString() },
    'it-1': { productId: 'it-1', openingStock: 3, received: 0, sold: 0, returned: 0, closingStock: 3, lastUpdated: new Date().toISOString() },
    'it-2': { productId: 'it-2', openingStock: 12, received: 0, sold: 0, returned: 0, closingStock: 12, lastUpdated: new Date().toISOString() },
    'it-3': { productId: 'it-3', openingStock: 55, received: 0, sold: 0, returned: 0, closingStock: 55, lastUpdated: new Date().toISOString() },
    'it-4': { productId: 'it-4', openingStock: 6, received: 0, sold: 0, returned: 0, closingStock: 6, lastUpdated: new Date().toISOString() },
    'it-5': { productId: 'it-5', openingStock: 6, received: 0, sold: 0, returned: 0, closingStock: 6, lastUpdated: new Date().toISOString() },
    'it-6': { productId: 'it-6', openingStock: 6, received: 0, sold: 0, returned: 0, closingStock: 6, lastUpdated: new Date().toISOString() },
    'it-7': { productId: 'it-7', openingStock: 20, received: 0, sold: 0, returned: 0, closingStock: 20, lastUpdated: new Date().toISOString() },
    'it-8': { productId: 'it-8', openingStock: 12, received: 0, sold: 0, returned: 0, closingStock: 12, lastUpdated: new Date().toISOString() },
    'it-9': { productId: 'it-9', openingStock: 9, received: 0, sold: 0, returned: 0, closingStock: 9, lastUpdated: new Date().toISOString() },
    'it-10': { productId: 'it-10', openingStock: 3, received: 0, sold: 0, returned: 0, closingStock: 3, lastUpdated: new Date().toISOString() },
    'it-11': { productId: 'it-11', openingStock: 3, received: 0, sold: 0, returned: 0, closingStock: 3, lastUpdated: new Date().toISOString() },
    'it-12': { productId: 'it-12', openingStock: 9, received: 0, sold: 0, returned: 0, closingStock: 9, lastUpdated: new Date().toISOString() },
    'it-13': { productId: 'it-13', openingStock: 8, received: 0, sold: 0, returned: 0, closingStock: 8, lastUpdated: new Date().toISOString() },
    'it-14': { productId: 'it-14', openingStock: 4, received: 0, sold: 0, returned: 0, closingStock: 4, lastUpdated: new Date().toISOString() },
    'it-16': { productId: 'it-16', openingStock: 18, received: 0, sold: 0, returned: 0, closingStock: 18, lastUpdated: new Date().toISOString() },
    'it-17': { productId: 'it-17', openingStock: 18, received: 0, sold: 0, returned: 0, closingStock: 18, lastUpdated: new Date().toISOString() },
    'bv-2': { productId: 'bv-2', openingStock: 1, received: 4, sold: 0, returned: 0, closingStock: 5, lastUpdated: new Date().toISOString() },
    'bv-3': { productId: 'bv-3', openingStock: 1, received: 6, sold: 0, returned: 0, closingStock: 7, lastUpdated: new Date().toISOString() },
    'bv-5': { productId: 'bv-5', openingStock: 5, received: 6, sold: 0, returned: 0, closingStock: 11, lastUpdated: new Date().toISOString() },
    'bv-6': { productId: 'bv-6', openingStock: 6, received: 6, sold: 0, returned: 0, closingStock: 12, lastUpdated: new Date().toISOString() },
    'bv-8': { productId: 'bv-8', openingStock: 5, received: 0, sold: 0, returned: 0, closingStock: 5, lastUpdated: new Date().toISOString() },
    'bv-9': { productId: 'bv-9', openingStock: 2, received: 0, sold: 0, returned: 0, closingStock: 2, lastUpdated: new Date().toISOString() },
    'hm-3': { productId: 'hm-3', openingStock: 2, received: 0, sold: 0, returned: 0, closingStock: 2, lastUpdated: new Date().toISOString() },
    'hm-4': { productId: 'hm-4', openingStock: 3, received: 0, sold: 0, returned: 0, closingStock: 3, lastUpdated: new Date().toISOString() },
    'hm-5': { productId: 'hm-5', openingStock: 1, received: 0, sold: 0, returned: 0, closingStock: 1, lastUpdated: new Date().toISOString() },
    'hm-6': { productId: 'hm-6', openingStock: 1, received: 0, sold: 0, returned: 0, closingStock: 1, lastUpdated: new Date().toISOString() },
    'hm-7': { productId: 'hm-7', openingStock: 1, received: 0, sold: 0, returned: 0, closingStock: 1, lastUpdated: new Date().toISOString() },
  } }
];

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [products, setProducts] = useState<Product[]>([]); // Initialize empty then load
  const [outlets, setOutlets] = useState<Outlet[]>(INITIAL_OUTLETS);
  const [selectedOutletId, setSelectedOutletId] = useState<string>('sec31');

  // Load and Migrations from LocalStorage
  useEffect(() => {
    // 0. Check Version for Mandatory Update
    const savedVersion = localStorage.getItem('broomies_data_version');
    if (savedVersion !== DATA_VERSION) {
      // Version mismatch or fresh install
      localStorage.removeItem('broomies_outlets');
      localStorage.removeItem('broomies_products');
      localStorage.setItem('broomies_data_version', DATA_VERSION);
    }

    // 1. Load Products
    const savedProducts = localStorage.getItem('broomies_products');
    let currentProducts = INITIAL_PRODUCTS;
    if (savedProducts) {
      currentProducts = JSON.parse(savedProducts);
    } else {
      localStorage.setItem('broomies_products', JSON.stringify(INITIAL_PRODUCTS));
    }
    setProducts(currentProducts);

    // 2. Load Outlets
    const savedOutlets = localStorage.getItem('broomies_outlets');
    if (savedOutlets) {
      let parsedOutlets: Outlet[] = JSON.parse(savedOutlets);
      
      // Perform migration/sync against currentProducts and force update names from INITIAL_OUTLETS
      let migrated = parsedOutlets.map(outlet => {
        const updatedStock = { ...outlet.stock };
        let changed = false;

        // Force Sync Names if ID matches INITIAL_OUTLETS
        const initialMatch = INITIAL_OUTLETS.find(io => io.id === outlet.id);
        let updatedName = outlet.name;
        if (initialMatch && initialMatch.name !== outlet.name) {
          updatedName = initialMatch.name;
          changed = true;
        }

        currentProducts.forEach(product => {
          if (!updatedStock[product.id]) {
            updatedStock[product.id] = {
              productId: product.id,
              openingStock: 0,
              received: 0,
              sold: 0,
              returned: 0,
              closingStock: 0,
              lastUpdated: new Date().toISOString()
            };
            changed = true;
          }
        });

        return changed ? { ...outlet, name: updatedName, stock: updatedStock } : outlet;
      });

      // Add missing required outlets from INITIAL_OUTLETS
      INITIAL_OUTLETS.forEach(io => {
        if (!migrated.find(m => m.id === io.id)) {
          migrated.push({
            ...io,
            stock: currentProducts.reduce((acc, p) => {
              acc[p.id] = {
                productId: p.id,
                openingStock: 0,
                received: 0,
                sold: 0,
                returned: 0,
                closingStock: 0,
                lastUpdated: new Date().toISOString()
              };
              return acc;
            }, {} as Record<string, StockEntry>)
          });
        }
      });

      // Remove outlets that are not in the specified list (Optional, but helps keep it clean as requested)
      const allowedIds = INITIAL_OUTLETS.map(io => io.id);
      migrated = migrated.filter(m => allowedIds.includes(m.id));

      setOutlets(migrated);
      localStorage.setItem('broomies_outlets', JSON.stringify(migrated));
    } else {
      // Initialize stock
      const initialized = INITIAL_OUTLETS.map(o => ({
        ...o,
        stock: currentProducts.reduce((acc, p) => {
          acc[p.id] = {
            productId: p.id,
            openingStock: 0,
            received: 0,
            sold: 0,
            returned: 0,
            closingStock: 0,
            lastUpdated: new Date().toISOString()
          };
          return acc;
        }, {} as Record<string, StockEntry>)
      }));
      setOutlets(initialized);
      localStorage.setItem('broomies_outlets', JSON.stringify(initialized));
    }
  }, []);

  const updateOutletStock = (outletId: string, updatedStock: Record<string, StockEntry>) => {
    const newOutlets = outlets.map(o => 
      o.id === outletId ? { ...o, stock: updatedStock } : o
    );
    setOutlets(newOutlets);
    localStorage.setItem('broomies_outlets', JSON.stringify(newOutlets));
  };

  // Product CRUD
  const handleAddProduct = (p: Product) => {
    const newList = [...products, p];
    setProducts(newList);
    localStorage.setItem('broomies_products', JSON.stringify(newList));
    
    // Also sync to all outlets
    const updatedOutlets = outlets.map(o => ({
      ...o,
      stock: {
        ...o.stock,
        [p.id]: {
          productId: p.id,
          openingStock: 0,
          received: 0,
          sold: 0,
          returned: 0,
          closingStock: 0,
          lastUpdated: new Date().toISOString()
        }
      }
    }));
    setOutlets(updatedOutlets);
    localStorage.setItem('broomies_outlets', JSON.stringify(updatedOutlets));
  };

  const handleUpdateProduct = (p: Product) => {
    const newList = products.map(item => item.id === p.id ? p : item);
    setProducts(newList);
    localStorage.setItem('broomies_products', JSON.stringify(newList));
  };

  const handleDeleteProduct = (id: string) => {
    const newList = products.filter(p => p.id !== id);
    setProducts(newList);
    localStorage.setItem('broomies_products', JSON.stringify(newList));
  };

  const currentOutlet = outlets.find(o => o.id === selectedOutletId) || outlets[0];

  return (
    <div className="flex bg-bakery-warm min-h-screen">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="ml-64 flex-1 p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentView === 'dashboard' && (
              <Dashboard 
                outlets={outlets} 
                products={products} 
                onSelectOutlet={(id) => {
                  setSelectedOutletId(id);
                  setCurrentView('outlet-detail');
                }} 
              />
            )}

            {currentView === 'outlet-detail' && (
              <OutletManager 
                outlet={currentOutlet} 
                products={products}
                onUpdateStock={(stock) => updateOutletStock(currentOutlet.id, stock)}
                allOutlets={outlets}
                onSelectOutlet={setSelectedOutletId}
                onNavigateToMenu={() => setCurrentView('inventory')} 
                onBack={() => setCurrentView('dashboard')}
              />
            )}

            {currentView === 'inventory' && (
              <MenuManager 
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {currentView === 'settings' && (
              <InventoryManager 
                products={products} 
                outlets={outlets} 
                onBack={() => setCurrentView('dashboard')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

