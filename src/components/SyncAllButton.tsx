'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SyncAllButton() {
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSync = async () => {
    setSyncing(true)
    setError(null)
    setSuccess(false)
    
    try {
      const response = await fetch('/api/sync-all', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Bulk sync failed')
      }
      
      setSuccess(true)
      router.refresh()
      
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
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all font-medium text-sm ${
          syncing ? 'bg-slate-800 text-slate-500 border-slate-700' :
          success ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/20' :
          error ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/20' :
          'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'
        }`}
      >
        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
        {syncing ? 'Syncing...' : success ? 'All Synced!' : error ? 'Sync Failed' : 'Sync All'}
      </button>
      
      {error && (
        <div className="absolute top-12 right-0 z-50 bg-rose-900 text-white text-[10px] p-2 rounded shadow-xl border border-rose-500 w-64 text-right">
          {error}
        </div>
      )}
    </div>
  )
}
