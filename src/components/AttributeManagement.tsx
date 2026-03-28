'use client'

import { useState } from 'react'
import { Plus, Tag, Hash, Type, Pencil, Trash2, X, Save, AlertCircle, Loader2, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Attribute {
  id: string
  name: string
  type: string
  _count: { values: number }
}

type ModalMode = 'create' | 'edit' | null

export function AttributeManagement({ initialAttributes }: { initialAttributes: Attribute[] }) {
  const router = useRouter()

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedAttr, setSelectedAttr] = useState<Attribute | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [type, setType] = useState('text')

  // Action states
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const openCreate = () => {
    setName('')
    setType('text')
    setError(null)
    setSelectedAttr(null)
    setModalMode('create')
  }

  const openEdit = (attr: Attribute) => {
    setName(attr.name)
    setType(attr.type)
    setError(null)
    setSelectedAttr(attr)
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedAttr(null)
    setError(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const isEdit = modalMode === 'edit' && selectedAttr
      const url = isEdit ? `/api/attributes/${selectedAttr.id}` : '/api/attributes'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Operation failed')
      }

      closeModal()
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (attr: Attribute) => {
    if (confirmDeleteId !== attr.id) {
      // First click — arm the delete
      setConfirmDeleteId(attr.id)
      setTimeout(() => setConfirmDeleteId(null), 3000)
      return
    }

    // Second click — execute
    setDeletingId(attr.id)
    setConfirmDeleteId(null)
    try {
      const response = await fetch(`/api/attributes/${attr.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  const typeIcon = (t: string) =>
    t === 'number' ? <Hash className="w-6 h-6" /> :
    t === 'select' ? <Tag className="w-6 h-6" /> :
    <Type className="w-6 h-6" />

  const typeBadgeColor = (t: string) =>
    t === 'number' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
    t === 'select' ? 'text-purple-400 bg-purple-400/10 border-purple-400/20' :
    'text-blue-400 bg-blue-400/10 border-blue-400/20'

  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Attribute Master</h2>
          <p className="text-slate-400 font-medium">Define global schemas for consistent product data.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-500 transition-all font-bold shadow-xl shadow-blue-900/30 text-sm active:scale-95"
        >
          <Plus className="w-5 h-5" />
          New Attribute
        </button>
      </header>

      {/* Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialAttributes.map((attr) => {
          const isDeleting = deletingId === attr.id
          const isArmed = confirmDeleteId === attr.id
          return (
            <div
              key={attr.id}
              className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group relative overflow-hidden"
            >
              {/* Icon + type badge */}
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-800 rounded-xl text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {typeIcon(attr.type)}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${typeBadgeColor(attr.type)}`}>
                  {attr.type}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">{attr.name}</h3>

              <div className="flex items-center justify-between text-slate-500 text-xs pt-4 mt-4 border-t border-slate-800">
                <span>{attr._count.values} product(s) use this</span>
              </div>

              {/* Action buttons — visible on hover */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                {/* Edit */}
                <button
                  onClick={() => openEdit(attr)}
                  className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                  title="Edit Attribute"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                {/* Delete (2-click confirmation) */}
                <button
                  onClick={() => handleDelete(attr)}
                  disabled={isDeleting}
                  className={`p-2 rounded-lg transition-all ${
                    isDeleting ? 'bg-slate-800 text-slate-600' :
                    isArmed ? 'bg-rose-600 text-white animate-pulse' :
                    'bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                  }`}
                  title={isArmed ? 'Click again to confirm deletion' : 'Delete Attribute'}
                >
                  {isDeleting
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : isArmed
                    ? <AlertTriangle className="w-4 h-4" />
                    : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )
        })}

        {/* Add new card */}
        <div
          onClick={openCreate}
          className="bg-slate-900/20 rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600 hover:text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all cursor-pointer py-14 group active:scale-[0.98] min-h-[200px]"
        >
          <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-all">
            <Plus className="w-7 h-7 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-bold text-sm uppercase tracking-widest">Define New Attribute</p>
        </div>
      </section>

      {/* Create / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {modalMode === 'edit' ? 'Edit Attribute' : 'Create Attribute'}
                </h3>
                <p className="text-slate-500 text-sm mt-0.5">
                  {modalMode === 'edit'
                    ? `Editing: ${selectedAttr?.name}`
                    : 'Define a new global product attribute'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex gap-3 items-center text-rose-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Attribute Name</label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Color, Material, Warranty..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Data Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="text" className="bg-slate-900">Text Field</option>
                  <option value="number" className="bg-slate-900">Numerical Value</option>
                  <option value="select" className="bg-slate-900">Select Menu</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 rounded-xl font-semibold transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {saving
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Save className="w-4 h-4" />}
                  {saving
                    ? (modalMode === 'edit' ? 'Saving...' : 'Creating...')
                    : (modalMode === 'edit' ? 'Save Changes' : 'Create Attribute')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
