import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const attributes = await prisma.attribute.findMany({
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json(attributes)
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
