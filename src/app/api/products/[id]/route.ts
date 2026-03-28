import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params
    
    // Check if product exists
    const exists = await prisma.product.findUnique({
      where: { id: productId }
    })
    
    if (!exists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    // Delete the product (cascades to AttributeValue and SyncLog in schema)
    await prisma.product.delete({
      where: { id: productId }
    })
    
    return NextResponse.json({ success: true, message: 'Product deleted from PIM' })
  } catch (error: any) {
    console.error('Failed to delete product:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params
    const body = await req.json()
    const { title, slug, sku, price, description, attributes } = body

    // 1. Update core product fields
    // We also reset status to 'pending' if it was 'synced', because data has changed
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        title,
        slug,
        sku,
        price,
        description,
        status: 'pending' // Force re-sync
      }
    })

    // 2. Refresh attributes (Delete existing & Re-create)
    // Using a transaction to ensure atomicity
    await prisma.$transaction([
      prisma.attributeValue.deleteMany({
        where: { productId: productId }
      }),
      prisma.attributeValue.createMany({
        data: attributes.map((attr: any) => ({
          productId: productId,
          attributeId: attr.attributeId,
          value: attr.value
        }))
      }),
      // Log the update
      prisma.syncLog.create({
        data: {
          productId: productId,
          status: 'success',
          message: 'PIM Master Record updated. Ready for WooCommerce sync.'
        }
      })
    ])

    return NextResponse.json(updatedProduct)
  } catch (error: any) {
    console.error('Failed to update product:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
