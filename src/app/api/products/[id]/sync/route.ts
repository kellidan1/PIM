import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncProductToWoo } from '@/lib/woocommerce'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // In Next.js 15+, params is a Promise
) {
  try {
    const { id: productId } = await params
    
    // 1. Get current PIM product with attributes
    const pimProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        attributes: {
          include: { attribute: true }
        }
      }
    })
    
    if (!pimProduct) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // 2. Sync to WooCommerce
    const result = await syncProductToWoo(pimProduct)
    
    // 3. Update PIM status to 'synced' and log the event
    await prisma.product.update({
      where: { id: productId },
      data: {
        status: 'synced',
        syncLogs: {
          create: {
            status: 'success',
            message: `Synced to WooCommerce (${result.action}). Woo Product ID: ${result.wooId}`
          }
        }
      }
    })
    
    return NextResponse.json(result)
  } catch (error: any) {
    const { id: productId } = await params
    console.error('Failed to sync product:', error)
    
    // Log the failure
    await prisma.syncLog.create({
      data: {
        productId: productId,
        status: 'failed',
        message: error.message || 'Unknown sync error'
      }
    })
    
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
