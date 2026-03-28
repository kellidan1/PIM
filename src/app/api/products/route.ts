import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      include: {
        attributes: {
          include: {
            attribute: true
          }
        },
        syncLogs: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    })
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, slug, sku, price, description, attributes } = body
    
    const product = await prisma.product.create({
      data: {
        title,
        slug,
        sku,
        price: parseFloat(price),
        description,
        attributes: {
          create: attributes.map((attr: { id: string, value: string }) => ({
            attributeId: attr.id,
            value: attr.value
          }))
        }
      }
    })
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('Failed to create product:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
