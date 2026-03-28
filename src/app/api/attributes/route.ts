import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const attributes = await prisma.attribute.findMany({
      orderBy: { name: 'asc' },
      include: {
        values: {
          select: { value: true },
          distinct: ['value']
        }
      }
    })

    // Map to include a flat list of unique existing values
    const result = attributes.map(attr => ({
      id: attr.id,
      name: attr.name,
      type: attr.type,
      existingValues: attr.values.map((v: { value: string }) => v.value)
    }))
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch attributes:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, type } = body
    
    const attribute = await prisma.attribute.create({
      data: { name, type }
    })
    
    return NextResponse.json(attribute)
  } catch (error) {
    console.error('Failed to create attribute:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
