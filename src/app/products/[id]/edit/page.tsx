import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/Sidebar'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { ProductForm } from '@/components/ProductForm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditPageProps) {
  const { id } = await params
  
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      attributes: {
        include: { attribute: true }
      }
    }
  })

  if (!product) {
    notFound()
  }

  // Map Prisma model to Form Data format
  const initialData = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    sku: product.sku,
    price: product.price?.toString() || '0',
    description: product.description || '',
    attributes: product.attributes.map(av => ({
      attributeId: av.attributeId,
      name: av.attribute.name,
      value: av.value
    }))
  }

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
              <h2 className="text-4xl font-extrabold text-white tracking-tight underline decoration-blue-500 underline-offset-8">Edit Record</h2>
              <p className="text-slate-400 font-medium">Updating Master Record for: <span className="text-blue-400 font-mono font-bold">{product.sku}</span></p>
            </div>
          </div>
        </header>

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <ProductForm initialData={initialData} mode="edit" />
        </section>
      </main>
    </div>
  )
}
