// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categoriesData = [
    {
      categoryName: 'Paintings',
      subCategories: ['Oil Painting', 'Watercolor Painting', 'Acrylic Painting', 'Fresco'],
    },
    {
      categoryName: 'Weaving',
      subCategories: ['Tapestry Weaving', 'Loom Weaving', 'Basket Weaving', 'Navajo Weaving'],
    },
    {
      categoryName: 'Pottery',
      subCategories: ['Earthenware', 'Stoneware', 'Porcelain', 'Raku Pottery'],
    },
    {
      categoryName: 'Glass Art',
      subCategories: ['Stained Glass', 'Blown Glass', 'Fused Glass', 'Etched Glass'],
    },
  ];

  for (const catData of categoriesData) {
    const category = await prisma.category.upsert({
      where: { categoryName: catData.categoryName },
      update: {},
      create: {
        categoryName: catData.categoryName,
      },
    });

    for (const subCatName of catData.subCategories) {
      await prisma.subCategory.upsert({
        where: { subCategoryName: subCatName },
        update: {},
        create: {
          subCategoryName: subCatName,
          categoryId: category.id,
        },
      });
    }
  }

  console.log('Categories and subcategories seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });