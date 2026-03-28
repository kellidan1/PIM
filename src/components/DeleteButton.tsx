'use client'

import { useState } from 'react'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function DeleteButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm) {
      setConfirm(true)
      setTimeout(() => setConfirm(false), 3000)
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete product')
      }
      
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      setConfirm(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className={`p-2 rounded-lg transition-all ${
        loading ? 'text-slate-600 bg-slate-800' :
        confirm ? 'text-white bg-rose-600 shadow-lg shadow-rose-900/40 animate-pulse' :
        'text-slate-500 hover:text-rose-500 hover:bg-rose-500/10'
      }`}
      title={confirm ? "Click again to confirm" : "Delete product from PIM"}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 
       confirm ? <AlertTriangle className="w-4 h-4" /> : 
       <Trash2 className="w-4 h-4" />}
    </button>
  )
}
