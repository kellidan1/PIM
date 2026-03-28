import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/Sidebar'
import { SyncAllButton } from '@/components/SyncAllButton'
import { Plus, RefreshCw, Layers, ShoppingBag, Tag, Activity, Clock } from 'lucide-react'
import Link from 'next/link'
import { StatusBadge } from '@/components/StatusBadge'

export const dynamic = 'force-dynamic'

export default async function DashboardOverview() {
  const [products, syncLogs, attributes] = await Promise.all([
    prisma.product.findMany({ take: 5, orderBy: { updatedAt: 'desc' } }),
    prisma.syncLog.findMany({ take: 5, orderBy: { timestamp: 'desc' }, include: { product: true } }),
    prisma.attribute.findMany()
  ])

  const totalProducts = await prisma.product.count()
  const syncedProducts = await prisma.product.count({ where: { status: 'synced' } })
  const pendingProducts = await prisma.product.count({ where: { status: 'pending' } })

  const stats = [
    { label: 'Total Products', value: totalProducts, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Synced', value: syncedProducts, icon: RefreshCw, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Pending', value: pendingProducts, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Attributes', value: attributes.length, icon: Tag, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ]

  return (
    <div className="flex h-screen bg-slate-950 font-sans">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-12">
        <header className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-4xl font-extrabold text-white mb-2">Master Overview</h2>
            <p className="text-slate-400">Welcome to the PIM Control Center. Your data is your master record.</p>
          </div>
          <div className="flex gap-4">
            <SyncAllButton />
            <Link 
              href="/products/new"
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-500 transition-all font-bold shadow-lg shadow-blue-900/30 text-sm"
            >
              <Plus className="w-4 h-4" />
              Build Product
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/60 shadow-xl flex flex-col items-start gap-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{stat.label}</p>
                <p className="text-4xl font-black text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Recent Products */}
          <div className="lg:col-span-2 space-y-6">
             <div className="flex justify-between items-center px-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <Layers className="w-5 h-5 text-blue-400" />
                   Recent PIM Records
                </h3>
                <Link href="/products" className="text-blue-500 hover:text-blue-400 text-sm font-medium">View All Records →</Link>
             </div>
             
             <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-slate-800">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-5">
                          <p className="font-bold text-white">{p.title}</p>
                          <p className="text-xs text-slate-500 font-mono mt-1">{p.sku}</p>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-6 py-5 text-right">
                          <p className="text-sm font-bold text-white">${p.price?.toFixed(2)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>

          {/* Sync History */}
          <div className="space-y-6">
             <div className="flex justify-between items-center px-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <Activity className="w-5 h-5 text-emerald-400" />
                   Sync Activity
                </h3>
                <Link href="/sync" className="text-slate-500 hover:text-white text-sm font-medium">History</Link>
             </div>

             <div className="space-y-4">
                {syncLogs.length > 0 ? syncLogs.map(log => (
                  <div key={log.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex gap-4 items-start shadow-xl">
                    <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${log.status === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{log.product.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1 truncate italic">"{log.message}"</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-600 mt-2">
                         <Clock className="w-2.5 h-2.5" />
                         {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center text-slate-700 bg-slate-900/20 rounded-2xl border border-slate-800/40 border-dashed">
                     No recent activity.
                  </div>
                )}
             </div>
          </div>
        </div>
      </main>
    </div>
  )
}
