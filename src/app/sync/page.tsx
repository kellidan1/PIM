import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/Sidebar'
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SyncPage() {
  const logs = await prisma.syncLog.findMany({
    include: {
      product: true
    },
    orderBy: { timestamp: 'desc' },
    take: 50
  })

  return (
    <div className="flex h-screen bg-slate-950 font-sans">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-12">
        <header className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-2">Synchronization History</h2>
          <p className="text-slate-400">Detailed logs of all product synchronization events with WooCommerce.</p>
        </header>

        <section className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Message</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-5">
                    {log.status === 'success' ? (
                      <span className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Success
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-rose-400 text-sm font-medium">
                        <XCircle className="w-4 h-4" />
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-semibold text-white">{log.product.title}</p>
                    <p className="text-xs text-slate-500 font-mono">{log.product.sku}</p>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-300 italic">
                    "{log.message || 'No additional information.'}"
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       <Clock className="w-3.5 h-3.5" />
                       {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {logs.length === 0 && (
            <div className="py-24 text-center">
              <RefreshCw className="w-12 h-12 text-slate-800 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No synchronization events recorded yet.</p>
              <p className="text-slate-600 text-sm mt-1">Start by syncing a product from the dashboard.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
