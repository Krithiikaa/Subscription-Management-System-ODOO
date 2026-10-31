import React, { useState, useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useDemoMode } from '../context/DemoModeContext';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardContent, CardFooter } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusPill } from '../components/common/StatusPill';
import { ProductFormModal } from '../components/products/ProductFormModal';
import { ProductDetailsModal } from '../components/products/ProductDetailsModal';
import { formatCurrency, formatDate } from '../lib/utils';
import {
  Package,
  Plus,
  Search,
  Filter,
  Layers,
  Edit3,
  Archive,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  Database,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export function ProductsPage() {
  const { role } = useAuth();
  const isAdmin = role === 'admin' || !role; // In demo mode or admin
  const { isDemoMode, toggleDemoMode, currency } = useDemoMode();

  const {
    products,
    loading,
    error,
    successMsg,
    setSuccessMsg,
    setError,
    addProduct,
    updateProduct,
    toggleArchiveProduct,
    refreshProducts,
  } = useProducts();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Available Categories from data
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        (p.code && p.code.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.variants && p.variants.some((v) => v.name.toLowerCase().includes(query)));

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [products, selectedStatus, selectedCategory, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, formData);
    } else {
      await addProduct(formData);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-200/80 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs">
            <span className="font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow-2xs">
              <Package className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Module 4 &bull; Product Catalog
            </span>
            <span className="text-stone-300 dark:text-stone-700">&bull;</span>
            <span className="text-stone-500 dark:text-stone-400">
              {isDemoMode ? '30 Authentic Demo Products' : 'Live Supabase Products'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white font-serif">
            Product & Variant Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Configure software products, base sales and cost pricing in INR (₹), and multi-tier pricing variants.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={refreshProducts}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenAdd}
            disabled={!isAdmin && !isDemoMode}
            title={!isAdmin && !isDemoMode ? 'Admin privileges required to add products' : undefined}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Mode Banner */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200/80 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-400 text-stone-950 font-bold flex items-center justify-center shrink-0">
            {isDemoMode ? <Sparkles className="w-4 h-4" /> : <Database className="w-4 h-4" />}
          </div>
          <div>
            <span className="font-bold text-stone-900 dark:text-white">
              {isDemoMode
                ? 'Demo Mode Active: Tamil Nadu SaaS Product Catalog (₹ INR)'
                : 'Live Database Mode: Supabase public.products'}
            </span>
            <p className="text-[11px] text-stone-600 dark:text-stone-400">
              {isDemoMode
                ? 'Includes 30 realistic billing modules with multi-variant options (e.g. Odoo Brand – +₹560). Demo additions persist locally.'
                : 'Connected to PostgreSQL. Modifying requires verified admin authorization.'}
            </p>
          </div>
        </div>

        <button
          onClick={toggleDemoMode}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors shrink-0 shadow-2xs"
        >
          {isDemoMode ? 'Switch to Live DB Mode' : 'Switch to Demo Mode (30 Products)'}
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-amber-700 hover:text-amber-900 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <Card className="flex flex-col">
        <div className="p-4 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products, SKUs, or variant names..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="active">Active Only</option>
              <option value="archived">Archived</option>
              <option value="ALL">All Statuses</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-xs text-stone-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
              <span>Loading products catalog...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 px-6 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 mb-3">
                <Package className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-stone-900 dark:text-white">
                No Products Found
              </h4>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 max-w-sm">
                {searchTerm || selectedCategory !== 'ALL' || selectedStatus !== 'active'
                  ? 'No products matched your search or filter settings.'
                  : 'Your live products catalog is currently empty. Click "Add Product" to create your first item.'}
              </p>
              <div className="mt-4">
                <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd}>
                  Add First Product
                </Button>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50/80 dark:bg-stone-900/80 border-b border-stone-200/80 dark:border-stone-800 text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Product & Code</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Sales Price (₹)</th>
                  <th className="py-3 px-4">Cost Price (₹)</th>
                  <th className="py-3 px-4">Configured Variants</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                {paginatedProducts.map((p) => {
                  const variants = p.variants || [];
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-amber-50/20 dark:hover:bg-stone-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedProduct(p)}
                    >
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold flex items-center justify-center text-xs shrink-0 group-hover:bg-amber-400 group-hover:text-stone-950 transition-colors shadow-2xs">
                            <Package className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-stone-900 dark:text-white truncate">
                              {p.name}
                            </p>
                            <p className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
                              {p.code || 'PRD-AUTO'} &bull; Created {formatDate(p.createdAt)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white font-mono">
                        {formatCurrency(p.salesPrice, currency)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-stone-500 dark:text-stone-400">
                        {formatCurrency(p.costPrice, currency)}
                      </td>

                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        {variants.length > 0 ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                              {variants.length} variant(s)
                            </span>
                            <span className="text-[11px] text-stone-500 truncate max-w-[140px]" title={variants.map(v => `${v.name} (+₹${v.additionalPrice})`).join(', ')}>
                              {variants[0].name} (+₹{variants[0].additionalPrice})
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-400">No variants</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusPill status={p.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedProduct(p)}
                            className="p-1.5 rounded-md text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors"
                            title="View Product Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-md text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => toggleArchiveProduct(p.id, p.status)}
                            className="p-1.5 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-stone-800 transition-colors"
                            title={p.status === 'active' ? 'Archive Product' : 'Unarchive Product'}
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>

        {/* Pagination Footer */}
        {filteredProducts.length > pageSize && (
          <CardFooter className="flex items-center justify-between">
            <span className="text-xs text-stone-500 dark:text-stone-400">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length}{' '}
              products
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                icon={ChevronLeft}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs font-semibold px-2 text-stone-700 dark:text-stone-300">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                icon={ChevronRight}
                iconPosition="right"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Form Modal (Add / Edit) */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialProduct={editingProduct}
        currency={currency}
      />

      {/* Details Modal */}
      <ProductDetailsModal
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        onEdit={(p) => {
          setSelectedProduct(null);
          handleOpenEdit(p);
        }}
        onToggleArchive={(id, st) => {
          toggleArchiveProduct(id, st);
          setSelectedProduct(null);
        }}
        currency={currency}
      />
    </div>
  );
}
