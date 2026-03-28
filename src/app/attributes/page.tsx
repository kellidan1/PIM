import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/Sidebar'
import { AttributeManagement } from '@/components/AttributeManagement'

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
        <AttributeManagement initialAttributes={attributes} />
      </main>
    </div>
  )
}
