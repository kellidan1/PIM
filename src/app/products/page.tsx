import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/Sidebar'
import { StatusBadge } from '@/components/StatusBadge'
import { SyncButton } from '@/components/SyncButton'
import { DeleteButton } from '@/components/DeleteButton'
import { SyncAllButton } from '@/components/SyncAllButton'
import { Plus, Search, Layers, Pencil } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      attributes: {
        include: { attribute: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  return (
    <div className="flex h-screen bg-slate-950 font-sans">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-12">
        <header className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Product Catalog</h2>
            <p className="text-slate-400">Master record of all dynamic products in the PIM.</p>
          </div>
          <div className="flex gap-4">
            <SyncAllButton />
            <Link 
              href="/products/new"
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-500 transition-all font-semibold shadow-lg shadow-blue-900/20 text-sm"
            >
              <Plus className="w-4 h-4" />
              New Product
            </Link>
          </div>
        </header>

        {/* Product Table */}
        <section className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
               <Layers className="w-5 h-5 text-blue-400" />
               Current Inventory
            </h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search SKU or title..." 
                className="bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none w-64"
              />
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">SKU / ID</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Attributes</th>
                <th className="px-6 py-4 text-center">Sync Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="px-6 py-5">
                    <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">{p.title}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[200px] mt-1">{p.description || "No description provided."}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm text-slate-300 font-mono">{p.sku}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{p.id}</p>
                  </td>
                  <td className="px-6 py-5 font-bold text-white">${p.price?.toFixed(2)}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-1.5">
                      {p.attributes.map(av => (
                        <span key={av.id} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 whitespace-nowrap">
                          {av.attribute.name}: {av.value}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-6 py-5 text-center flex items-center justify-center gap-2 mt-1">
                    <Link 
                      href={`/products/${p.id}/edit`}
                      className="p-2 bg-slate-800 text-slate-400 hover:text-blue-400 rounded-lg transition-all"
                      title="Edit Product"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <SyncButton productId={p.id} initialStatus={p.status} />
                    <DeleteButton productId={p.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {products.length === 0 && (
            <div className="py-24 text-center">
              <Layers className="w-12 h-12 text-slate-800 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Your PIM is empty.</p>
              <Link href="/products/new" className="text-blue-500 hover:underline mt-2 inline-block text-sm">
                Create your first product
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
