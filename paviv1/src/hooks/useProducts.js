import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import { DEMO_PRODUCTS } from '../lib/demoData';

const DEMO_PRODUCTS_STORAGE_KEY = 'brightloop_demo_products_custom';

// Initial default variants for demonstration
const INITIAL_DEMO_VARIANTS = {
  'prod-bl-01': [
    { id: 'var-bl-01-1', name: 'Odoo Brand Connector', additionalPrice: 560, sku: 'VAR-ODOO-560', status: 'active' },
    { id: 'var-bl-01-2', name: 'High-Concurrency Queue', additionalPrice: 2400, sku: 'VAR-HIGH-Q', status: 'active' },
  ],
  'prod-bl-02': [
    { id: 'var-bl-02-1', name: 'Bulk IRN Batch Upload', additionalPrice: 850, sku: 'VAR-IRN-BULK', status: 'active' },
    { id: 'var-bl-02-2', name: 'Custom QR Letterhead', additionalPrice: 350, sku: 'VAR-QR-HEAD', status: 'active' },
  ],
  'prod-bl-03': [
    { id: 'var-bl-03-1', name: 'Multi-Bank NPCI Redundancy', additionalPrice: 1200, sku: 'VAR-NPCI-RED', status: 'active' },
  ],
};

export function useProducts() {
  const { user, role } = useAuth();
  const { isDemoMode } = useDemoMode();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Load products based on active mode
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (isDemoMode) {
      try {
        // Overlay any user custom/edited demo products stored in localStorage
        const stored = localStorage.getItem(DEMO_PRODUCTS_STORAGE_KEY);
        let customList = stored ? JSON.parse(stored) : null;

        if (!customList) {
          // Initialize from DEMO_PRODUCTS with attached variants
          customList = DEMO_PRODUCTS.map((p) => ({
            id: p.id,
            name: p.name,
            code: p.code,
            category: p.category,
            salesPrice: p.price,
            costPrice: Math.round(p.price * 0.4), // 40% cost basis
            description: p.description,
            status: 'active',
            createdAt: '2026-01-15T10:00:00Z',
            variants: INITIAL_DEMO_VARIANTS[p.id] || [],
          }));
        }

        setProducts(customList);
      } catch (err) {
        console.error('Error loading demo products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Live Database Mode
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured.');
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchErr } = await supabase
        .from('products')
        .select(`
          *,
          product_variants (*)
        `)
        .order('created_at', { ascending: false });

      if (fetchErr) {
        if (fetchErr.code === 'PGRST205' || fetchErr.message?.includes('not find')) {
          // Table pending migration in live database
          setError('Live "products" table pending migration (05_create_products_and_plans.sql).');
          setProducts([]);
        } else {
          setError(fetchErr.message);
        }
      } else {
        // Normalize live format to camelCase
        const normalized = (data || []).map((p) => ({
          id: p.id,
          name: p.name,
          code: p.code,
          category: p.category,
          salesPrice: Number(p.sales_price),
          costPrice: Number(p.cost_price),
          description: p.description,
          status: p.status,
          createdAt: p.created_at,
          variants: (p.product_variants || []).map((v) => ({
            id: v.id,
            name: v.name,
            additionalPrice: Number(v.additional_price),
            sku: v.sku,
            status: v.status,
          })),
        }));
        setProducts(normalized);
      }
    } catch (err) {
      setError(err.message || 'Failed to query live products.');
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Helper to persist demo products in localStorage
  const saveDemoProducts = (newProducts) => {
    setProducts(newProducts);
    try {
      localStorage.setItem(DEMO_PRODUCTS_STORAGE_KEY, JSON.stringify(newProducts));
    } catch (e) {
      console.warn('Could not persist demo products to localStorage:', e);
    }
  };

  // Add Product
  const addProduct = async (productData) => {
    setError(null);
    setSuccessMsg(null);

    // Permission check
    if (!isDemoMode && role !== 'admin') {
      throw new Error('Unauthorized: Only administrators can create products.');
    }

    const {
      name,
      code,
      category = 'SaaS Core',
      salesPrice = 0,
      costPrice = 0,
      description = '',
      status = 'active',
      variants = [],
    } = productData;

    if (!name?.trim()) {
      throw new Error('Product name is required.');
    }
    if (salesPrice < 0 || costPrice < 0) {
      throw new Error('Prices cannot be negative.');
    }

    if (isDemoMode) {
      const newProduct = {
        id: `prod-custom-${Date.now()}`,
        name: name.trim(),
        code: code?.trim() || `PRD-${Date.now().toString().slice(-4)}`,
        category,
        salesPrice: Number(salesPrice),
        costPrice: Number(costPrice),
        description: description?.trim() || '',
        status,
        createdAt: new Date().toISOString(),
        variants: variants.map((v, idx) => ({
          id: `var-custom-${Date.now()}-${idx}`,
          name: v.name?.trim() || 'Standard Variant',
          additionalPrice: Number(v.additionalPrice) || 0,
          sku: v.sku?.trim() || '',
          status: 'active',
        })),
      };

      const updated = [newProduct, ...products];
      saveDemoProducts(updated);
      setSuccessMsg(`Product "${newProduct.name}" created successfully.`);
      return newProduct;
    }

    // Live Mode
    try {
      const { data: prodData, error: prodErr } = await supabase
        .from('products')
        .insert({
          name: name.trim(),
          code: code?.trim() || null,
          category,
          sales_price: Number(salesPrice),
          cost_price: Number(costPrice),
          description: description?.trim() || null,
          status,
          created_by: user?.id,
        })
        .select()
        .single();

      if (prodErr) throw prodErr;

      // Insert variants if any
      let createdVariants = [];
      if (variants && variants.length > 0) {
        const variantsToInsert = variants.map((v) => ({
          product_id: prodData.id,
          name: v.name.trim(),
          additional_price: Number(v.additionalPrice) || 0,
          sku: v.sku?.trim() || null,
          status: 'active',
        }));

        const { data: vData, error: vErr } = await supabase
          .from('product_variants')
          .insert(variantsToInsert)
          .select();

        if (vErr) throw vErr;
        createdVariants = vData || [];
      }

      await fetchProducts();
      setSuccessMsg(`Product "${name}" created successfully in database.`);
      return prodData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Edit / Update Product
  const updateProduct = async (id, updatedFields) => {
    setError(null);
    setSuccessMsg(null);

    if (!isDemoMode && role !== 'admin') {
      throw new Error('Unauthorized: Only administrators can modify products.');
    }

    if (isDemoMode) {
      const updated = products.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            ...updatedFields,
            salesPrice: updatedFields.salesPrice !== undefined ? Number(updatedFields.salesPrice) : p.salesPrice,
            costPrice: updatedFields.costPrice !== undefined ? Number(updatedFields.costPrice) : p.costPrice,
            variants: updatedFields.variants !== undefined ? updatedFields.variants : p.variants,
          };
        }
        return p;
      });

      saveDemoProducts(updated);
      setSuccessMsg('Product updated successfully.');
      return;
    }

    // Live Mode
    try {
      const { error: updErr } = await supabase
        .from('products')
        .update({
          name: updatedFields.name?.trim(),
          code: updatedFields.code?.trim() || null,
          category: updatedFields.category,
          sales_price: Number(updatedFields.salesPrice),
          cost_price: Number(updatedFields.costPrice),
          description: updatedFields.description,
          status: updatedFields.status,
        })
        .eq('id', id);

      if (updErr) throw updErr;

      // Handle variants update if provided
      if (updatedFields.variants) {
        // Delete old variants and re-insert
        await supabase.from('product_variants').delete().eq('product_id', id);

        if (updatedFields.variants.length > 0) {
          const toInsert = updatedFields.variants.map((v) => ({
            product_id: id,
            name: v.name.trim(),
            additional_price: Number(v.additionalPrice) || 0,
            sku: v.sku?.trim() || null,
            status: 'active',
          }));
          await supabase.from('product_variants').insert(toInsert);
        }
      }

      await fetchProducts();
      setSuccessMsg('Product updated successfully.');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Archive / Toggle Status
  const toggleArchiveProduct = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'archived' : 'active';
    return updateProduct(id, { status: newStatus });
  };

  return {
    products,
    loading,
    error,
    successMsg,
    setSuccessMsg,
    setError,
    addProduct,
    updateProduct,
    toggleArchiveProduct,
    refreshProducts: fetchProducts,
    getVariantFinalPrice: (basePrice, additionalPrice) => Number(basePrice || 0) + Number(additionalPrice || 0),
  };
}
