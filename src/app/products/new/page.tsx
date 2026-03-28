'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { ChevronLeft, Plus, Trash2, Save, Tag } from 'lucide-react'
import Link from 'next/link'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [attributes, setAttributes] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    sku: '',
    price: '',
    description: '',
    selectedAttributes: [] as { id: string, name: string, value: string }[]
  })

  useEffect(() => {
    // Fetch available attributes
    fetch('/api/attributes')
      .then(res => res.json())
      .then(setAttributes)
  }, [])

  const handleSlugify = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleAddField = () => {
    if (attributes.length > 0) {
      setFormData({
        ...formData,
        selectedAttributes: [
          ...formData.selectedAttributes,
          { id: attributes[0].id, name: attributes[0].name, value: '' }
        ]
      })
    }
  }

  const handleRemoveField = (index: number) => {
    const newAttrs = [...formData.selectedAttributes]
    newAttrs.splice(index, 1)
    setFormData({ ...formData, selectedAttributes: newAttrs })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          attributes: formData.selectedAttributes.map(a => ({ id: a.id, value: a.value }))
        })
      })
      
      if (response.ok) {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to create product:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-slate-950 font-sans">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-12">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-3xl font-bold text-white">Create New Product</h2>
              <p className="text-slate-400">Add a new entry to the PIM master catalog.</p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4">General Information</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Product Title</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: handleSlugify(e.target.value) })}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. Premium Wireless Mouse"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Slug</label>
                  <input 
                    required
                    type="text" 
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-slate-800/20 border border-slate-800 rounded-xl px-4 py-3 text-slate-500 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="premium-wireless-mouse"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">SKU</label>
                  <input 
                    required
                    type="text" 
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="PWM-001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Description</label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Enter product description..."
                />
              </div>
            </section>

            <section className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">Attributes</h3>
                <button 
                  type="button"
                  onClick={handleAddField}
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Field
                </button>
              </div>

              <div className="space-y-4">
                {formData.selectedAttributes.map((attr, index) => (
                  <div key={index} className="flex gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Attribute</label>
                      <select 
                        value={attr.id}
                        onChange={(e) => {
                          const newAttrs = [...formData.selectedAttributes]
                          const selected = attributes.find(a => a.id === e.target.value)
                          newAttrs[index] = { ...newAttrs[index], id: e.target.value, name: selected?.name || '' }
                          setFormData({ ...formData, selectedAttributes: newAttrs })
                        }}
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                      >
                        {attributes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                    <div className="flex-[2] space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Value</label>
                      <input 
                        type="text"
                        value={attr.value}
                        onChange={(e) => {
                          const newAttrs = [...formData.selectedAttributes]
                          newAttrs[index].value = e.target.value
                          setFormData({ ...formData, selectedAttributes: newAttrs })
                        }}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="e.g. Midnight Black"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleRemoveField(index)}
                      className="p-3 bg-slate-800 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all mb-[1px]"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                
                {formData.selectedAttributes.length === 0 && (
                  <div className="py-8 text-center text-slate-600 border border-dashed border-slate-800 rounded-xl">
                    No attributes defined yet.
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-8 text-white">
            <section className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 space-y-6">
              <h3 className="text-lg font-bold border-b border-slate-800 pb-4">Pricing</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Sale Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </section>

            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/30 transition-all active:scale-[0.98]"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {loading ? 'Creating...' : 'Create Product'}
            </button>
            <Link href="/" className="block text-center text-slate-500 hover:text-white transition-all text-sm font-medium">
              Cancel and return
            </Link>
          </aside>
        </form>
      </main>
    </div>
  )
}

function RefreshCw({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
      <path d="M21 3v5h-5"/>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
      <path d="M8 16H3v5"/>
    </svg>
  )
}
