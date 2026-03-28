import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding products...')

  // Clear existing data
  await prisma.syncLog.deleteMany()
  await prisma.attributeValue.deleteMany()
  await prisma.attribute.deleteMany()
  await prisma.product.deleteMany()

  // Create attributes
  const colorAttr = await prisma.attribute.create({
    data: { name: 'Color', type: 'select' }
  })

  const sizeAttr = await prisma.attribute.create({
    data: { name: 'Size', type: 'select' }
  })

  // Create products
  const products = [
    {
      title: 'Luxury Chronograph Watch',
      slug: 'luxury-chronograph-watch',
      sku: 'W001-CHRONO',
      price: 1200,
      description: 'Elegant stainless steel watch with leather strap and sapphire crystal.',
      status: 'draft',
      attributes: {
        create: [
          { attributeId: colorAttr.id, value: 'Space Gray' },
          { attributeId: sizeAttr.id, value: '42mm' }
        ]
      }
    },
    {
      title: 'Premium Noise Cancelling Headphones',
      slug: 'premium-noise-cancelling-headphones',
      sku: 'H001-NC',
      price: 350,
      description: 'Immersive sound with active noise cancellation and 30-hour battery life.',
      status: 'synced',
      attributes: {
        create: [
          { attributeId: colorAttr.id, value: 'Midnight Black' }
        ]
      }
    },
     {
      title: 'Smart Home Hub Pro',
      slug: 'smart-home-hub-pro',
      sku: 'S001-HUB',
      price: 150,
      description: 'Control all your smart devices from one central hub.',
      status: 'pending',
      attributes: {
        create: [
          { attributeId: colorAttr.id, value: 'White' }
        ]
      }
    }
  ]

  for (const p of products) {
    await prisma.product.create({ data: p })
  }

  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
