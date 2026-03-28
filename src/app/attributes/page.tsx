import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/Sidebar'
import { Plus, Tag, Hash, Type, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AttributesPage() {
  const attributes = await prisma.attribute.findMany({
    include: {
      _count: {
        select: { values: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="flex h-screen bg-slate-950 font-sans">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-12">
        <header className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Attribute Management</h2>
            <p className="text-slate-400">Define global product attributes for consistent data management.</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-500 transition-all font-semibold shadow-lg shadow-blue-900/20 text-sm">
            <Plus className="w-4 h-4" />
            Add Attribute
          </button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attributes.map((attr) => (
            <div key={attr.id} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all group cursor-pointer">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-800 rounded-xl text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {attr.type === 'number' ? <Hash className="w-5 h-5" /> : 
                   attr.type === 'select' ? <Tag className="w-5 h-5" /> : 
                   <Type className="w-5 h-5" />}
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-all" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1">{attr.name}</h3>
              <p className="text-sm text-slate-500 mb-4 uppercase tracking-wider font-semibold">{attr.type}</p>
              
              <div className="flex items-center justify-between text-slate-400 text-sm pt-4 border-t border-slate-800">
                <span>Products using this</span>
                <span className="font-bold text-white">{attr._count.values}</span>
              </div>
            </div>
          ))}
          
          <div className="bg-slate-900/20 p-6 rounded-2xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600 hover:text-slate-400 hover:border-slate-600 transition-all cursor-pointer py-12">
            <Plus className="w-8 h-8 mb-2" />
            <p className="font-medium">Define New Attribute</p>
          </div>
        </section>
      </main>
    </div>
  )
}
