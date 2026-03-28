'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SyncButton({ productId, initialStatus }: { productId: string, initialStatus: string }) {
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSync = async () => {
    setSyncing(true)
    setError(null)
    setSuccess(false)
    
    try {
      const response = await fetch(`/api/products/${productId}/sync`, {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Sync failed')
      }
      
      setSuccess(true)
      router.refresh() // Refresh the dashboard data
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
      setTimeout(() => setError(null), 5000)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="relative inline-block">
      <button 
        onClick={handleSync}
        disabled={syncing}
        className={`p-2 rounded-lg transition-all ${
          syncing ? 'bg-slate-800 text-slate-500 animate-spin' :
          success ? 'bg-emerald-500 text-white' :
          error ? 'bg-rose-500 text-white' :
          'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
        title={error || "Sync to WooCommerce"}
      >
        {success ? <CheckCircle className="w-4 h-4" /> : 
         error ? <AlertCircle className="w-4 h-4" /> : 
         <RefreshCw className="w-4 h-4" />}
      </button>
      
      {error && (
        <div className="absolute top-10 right-0 z-50 bg-rose-900 text-white text-[10px] p-2 rounded shadow-xl border border-rose-500 w-48 text-right">
          {error}
        </div>
      )}
    </div>
  )
}
