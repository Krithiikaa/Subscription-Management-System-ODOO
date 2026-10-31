"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoneyText } from "@/components/shared/money-text";
import { Package, Plus, Sparkles } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-slate-100">
            Products & Variants
          </h1>
          <p className="text-sm text-slate-500">
            Manage your subscription products, add-ons, and brand variants.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">No products configured yet.</div>
        ) : (
          products.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                    Product
                  </span>
                  <Package className="h-4 w-4 text-slate-400" />
                </div>
                <CardTitle className="text-lg mt-2">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-slate-500 min-h-[36px]">
                  {product.description || "No description provided."}
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Sales Price</span>
                    <MoneyText amount={product.salesPrice} className="text-lg font-bold text-slate-900 dark:text-slate-100" />
                  </div>
                  {product.costPrice !== undefined && (
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Cost Price</span>
                      <MoneyText amount={product.costPrice} className="text-sm text-slate-500" />
                    </div>
                  )}
                </div>

                {product.variants && product.variants.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Variants
                    </span>
                    <div className="space-y-1.5">
                      {product.variants.map((v: any) => (
                        <div key={v.id} className="flex justify-between text-xs bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                          <span className="text-slate-700 dark:text-slate-300">
                            {v.attribute}: {v.value}
                          </span>
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                            +₹{v.extraPrice}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

