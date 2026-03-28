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

    // 1. Update core product fields, reset sync status
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { title, slug, sku, price, description, status: 'pending' }
    })

    // 2. Deduplicate incoming attributes (keep last occurrence per attributeId)
    const deduped = Object.values(
      (attributes as { attributeId: string; value: string }[]).reduce(
        (acc, attr) => ({ ...acc, [attr.attributeId]: attr }),
        {} as Record<string, { attributeId: string; value: string }>
      )
    )

    // 3. Delete ALL existing attribute values for this product first
    await prisma.attributeValue.deleteMany({ where: { productId } })

    // 4. Re-create using upsert (safe against constraint violations)
    for (const attr of deduped) {
      await prisma.attributeValue.upsert({
        where: { productId_attributeId: { productId, attributeId: attr.attributeId } },
        update: { value: attr.value },
        create: { productId, attributeId: attr.attributeId, value: attr.value }
      })
    }

    // 5. Log the update
    await prisma.syncLog.create({
      data: {
        productId,
        status: 'success',
        message: 'PIM Master Record updated. Ready for WooCommerce sync.'
      }
    })

    return NextResponse.json(updatedProduct)
  } catch (error: any) {
    console.error('Failed to update product:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
