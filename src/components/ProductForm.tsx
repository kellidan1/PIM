'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plus, Trash2, Save, Tag, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface Attribute {
  id: string
  name: string
}

interface SelectedAttribute {
  attributeId: string
  name: string
  value: string
}

interface ProductFormData {
  id?: string
  title: string
  slug: string
  sku: string
  price: string
  description: string
  attributes: SelectedAttribute[]
}

interface ProductFormProps {
  initialData?: ProductFormData
  mode: 'create' | 'edit'
}

export function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [availableAttributes, setAvailableAttributes] = useState<Attribute[]>([])
  
  const [formData, setFormData] = useState<ProductFormData>(initialData || {
    title: '',
    slug: '',
    sku: '',
    price: '',
    description: '',
    attributes: []
  })

  useEffect(() => {
    fetch('/api/attributes')
      .then(res => res.json())
      .then(setAvailableAttributes)
  }, [])

  const handleSlugify = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleAddField = () => {
    if (availableAttributes.length > 0) {
      setFormData({
        ...formData,
        attributes: [
          ...formData.attributes,
          { attributeId: availableAttributes[0].id, name: availableAttributes[0].name, value: '' }
        ]
      })
    }
  }

  const handleRemoveField = (index: number) => {
    const newAttrs = [...formData.attributes]
    newAttrs.splice(index, 1)
    setFormData({ ...formData, attributes: newAttrs })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const url = mode === 'edit' ? `/api/products/${formData.id}` : '/api/products'
      const method = mode === 'edit' ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          attributes: formData.attributes.map(a => ({ attributeId: a.attributeId, value: a.value }))
        })
      })
      
      if (response.ok) {
        router.push('/products')
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Operation failed')
      }
    } catch (error) {
      console.error('Submission failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
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
              onChange={(e) => setFormData({ 
                ...formData, 
                title: e.target.value, 
                slug: mode === 'create' ? handleSlugify(e.target.value) : formData.slug 
              })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
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
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-600"
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
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
              placeholder="Enter product description..."
            />
          </div>
        </section>

        <section className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
               <Tag className="w-5 h-5 text-purple-400" />
               Attributes
            </h3>
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
            {formData.attributes.map((attr, index) => (
              <div key={index} className="flex gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Attribute</label>
                  <div className="relative">
                    <select 
                      value={attr.attributeId}
                      onChange={(e) => {
                        const newAttrs = [...formData.attributes]
                        const selected = availableAttributes.find(a => a.id === e.target.value)
                        newAttrs[index] = { ...newAttrs[index], attributeId: e.target.value, name: selected?.name || '' }
                        setFormData({ ...formData, attributes: newAttrs })
                      }}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                    >
                      {availableAttributes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex-[2] space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Value</label>
                  <input 
                    type="text"
                    value={attr.value}
                    onChange={(e) => {
                      const newAttrs = [...formData.attributes]
                      newAttrs[index].value = e.target.value
                      setFormData({ ...formData, attributes: newAttrs })
                    }}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="e.g. Matte Black"
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
            
            {formData.attributes.length === 0 && (
              <div className="py-12 text-center text-slate-600 border border-dashed border-slate-800 rounded-2xl">
                <Tag className="w-8 h-8 mx-auto mb-2 opacity-20" />
                No custom attributes added.
              </div>
            )}
          </div>
        </section>
      </div>

      <aside className="space-y-8 text-white">
        <section className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-lg font-bold border-b border-slate-800 pb-4">Financials</h3>
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

        <div className="space-y-4">
          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/40 transition-all active:scale-[0.98]"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {loading ? (mode === 'edit' ? 'Saving...' : 'Building...') : (mode === 'edit' ? 'Update Master Record' : 'Create Product')}
          </button>
          
          <Link 
            href="/products" 
            className="block text-center text-slate-500 hover:text-white transition-all text-sm font-medium py-2"
          >
            Discard changes
          </Link>
        </div>
      </aside>
    </form>
  )
}
