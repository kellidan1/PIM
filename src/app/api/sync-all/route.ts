import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncProductToWoo } from '@/lib/woocommerce'

export async function POST(req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      where: { status: { not: 'synced' } },
      include: {
        attributes: {
          include: { attribute: true }
        }
      }
    })
    
    const results = []
    
    for (const p of products) {
      try {
        const result = await syncProductToWoo(p)
        await prisma.product.update({
          where: { id: p.id },
          data: {
            status: 'synced',
            syncLogs: {
              create: {
                status: 'success',
                message: `Bulk synced to WooCommerce. Woo Product ID: ${result.wooId}`
              }
            }
          }
        })
        results.push({ id: p.id, status: 'success' })
      } catch (err: any) {
        await prisma.syncLog.create({
          data: {
            productId: p.id,
            status: 'failed',
            message: `Bulk sync failed: ${err.message}`
          }
        })
        results.push({ id: p.id, status: 'failed', error: err.message })
      }
    }
    
    return NextResponse.json({ results })
  } catch (error: any) {
    console.error('Bulk sync failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
