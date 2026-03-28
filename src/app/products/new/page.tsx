import { Sidebar } from '@/components/Sidebar'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { ProductForm } from '@/components/ProductForm'

export default function NewProductPage() {
  return (
    <div className="flex h-screen bg-slate-950 font-sans">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-12">
        <header className="flex justify-between items-center mb-12 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="flex items-center gap-4">
            <Link href="/products" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all shadow-lg hover:shadow-slate-900/40">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-4xl font-extrabold text-white tracking-tight">Create Product</h2>
              <p className="text-slate-400 font-medium">Add a new entry to the PIM master catalog.</p>
            </div>
          </div>
        </header>

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <ProductForm mode="create" />
        </section>
      </main>
    </div>
  )
}
