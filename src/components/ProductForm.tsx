'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save, Tag, Hash, Type, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Attribute {
  id: string
  name: string
  type: 'text' | 'number' | 'select'
  existingValues: string[]
}

interface SelectedAttribute {
  attributeId: string
  name: string
  type: 'text' | 'number' | 'select'
  value: string
  existingValues: string[]
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

// Renders the correct value input based on attribute type
function AttributeValueInput({
  attr,
  onChange,
}: {
  attr: SelectedAttribute
  onChange: (val: string) => void
}) {
  const base = 'w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 outline-none transition-all placeholder:text-slate-600'

  if (attr.type === 'number') {
    return (
      <div className="relative">
        <input
          type="number"
          step="any"
          required
          value={attr.value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. 24"
          className={`${base} focus:ring-amber-500 border-slate-700`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-amber-500 font-bold uppercase">NUM</span>
      </div>
    )
  }

  if (attr.type === 'select') {
    const listId = `datalist-${attr.attributeId}`
    return (
      <div className="relative">
        <input
          type="text"
          list={listId}
          required
          value={attr.value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={attr.existingValues.length ? 'Choose or type...' : 'Type a value...'}
          className={`${base} focus:ring-purple-500`}
        />
        <datalist id={listId}>
          {attr.existingValues.map((v) => (
            <option key={v} value={v} />
          ))}
        </datalist>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-purple-500 font-bold uppercase">SEL</span>
      </div>
    )
  }

  // Default: text
  return (
    <input
      type="text"
      required
      value={attr.value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="e.g. Matte Black"
      className={`${base} focus:ring-blue-500`}
    />
  )
}

function typeIcon(type: string) {
  if (type === 'number') return <Hash className="w-3.5 h-3.5 text-amber-500" />
  if (type === 'select') return <Tag className="w-3.5 h-3.5 text-purple-500" />
  return <Type className="w-3.5 h-3.5 text-blue-500" />
}

export function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
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

  const handleSlugify = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleAddField = () => {
    if (availableAttributes.length > 0) {
      const first = availableAttributes[0]
      setFormData({
        ...formData,
        attributes: [
          ...formData.attributes,
          { attributeId: first.id, name: first.name, type: first.type, value: '', existingValues: first.existingValues }
        ]
      })
    }
  }

  const handleRemoveField = (index: number) => {
    const newAttrs = [...formData.attributes]
    newAttrs.splice(index, 1)
    setFormData({ ...formData, attributes: newAttrs })
  }

  const handleAttributeChange = (index: number, newAttributeId: string) => {
    const selected = availableAttributes.find(a => a.id === newAttributeId)
    if (!selected) return
    const newAttrs = [...formData.attributes]
    newAttrs[index] = {
      attributeId: selected.id,
      name: selected.name,
      type: selected.type,
      value: '',
      existingValues: selected.existingValues
    }
    setFormData({ ...formData, attributes: newAttrs })
  }

  const handleValueChange = (index: number, value: string) => {
    const newAttrs = [...formData.attributes]
    newAttrs[index] = { ...newAttrs[index], value }
    setFormData({ ...formData, attributes: newAttrs })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSubmitError(null)

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
        setSubmitError(data.error || 'Operation failed')
      }
    } catch (error) {
      setSubmitError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-8">
        {/* General Info */}
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

        {/* Attributes */}
        <section className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-400" />
              Attributes
            </h3>
            <button
              type="button"
              onClick={handleAddField}
              disabled={availableAttributes.length === 0}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 disabled:opacity-30 text-sm font-medium transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Field
            </button>
          </div>

          {/* Legend */}
          {availableAttributes.length > 0 && (
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-600">
              <span className="flex items-center gap-1"><Type className="w-3 h-3 text-blue-500" /> Text</span>
              <span className="flex items-center gap-1"><Hash className="w-3 h-3 text-amber-500" /> Number</span>
              <span className="flex items-center gap-1"><Tag className="w-3 h-3 text-purple-500" /> Select (type or pick)</span>
            </div>
          )}

          <div className="space-y-4">
            {formData.attributes.map((attr, index) => (
              <div key={index} className="flex gap-3 items-start border border-slate-800 rounded-2xl p-4 bg-slate-900/30">
                {/* Attribute selector */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    {typeIcon(attr.type)}
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Attribute</label>
                  </div>
                  <select
                    value={attr.attributeId}
                    onChange={(e) => handleAttributeChange(index, e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                  >
                    {availableAttributes.map(a => (
                      <option key={a.id} value={a.id} className="bg-slate-900">
                        {a.name} ({a.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Value input — type-aware */}
                <div className="flex-[2] space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Value</label>
                  <AttributeValueInput
                    attr={attr}
                    onChange={(val) => handleValueChange(index, val)}
                  />
                  {attr.type === 'number' && attr.value && isNaN(Number(attr.value)) && (
                    <p className="text-[10px] text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Must be a valid number
                    </p>
                  )}
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => handleRemoveField(index)}
                  className="mt-7 p-2.5 bg-slate-800 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {formData.attributes.length === 0 && (
              <div className="py-12 text-center text-slate-600 border border-dashed border-slate-800 rounded-2xl">
                <Tag className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>No attributes added yet.</p>
                <p className="text-[11px] mt-1 text-slate-700">Click "Add Field" to attach attributes to this product.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Sidebar */}
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
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="0.00"
              />
            </div>
          </div>
        </section>

        <div className="space-y-4">
          {submitError && (
            <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex gap-3 items-center text-rose-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{submitError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/40 transition-all active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {loading
              ? (mode === 'edit' ? 'Saving...' : 'Building...')
              : (mode === 'edit' ? 'Update Master Record' : 'Create Product')}
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
