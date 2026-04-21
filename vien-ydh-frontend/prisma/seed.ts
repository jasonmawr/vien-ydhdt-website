import { PrismaClient } from "@prisma/client";
import {
  DEPARTMENTS_DATA,
  DOCTORS_DATA,
  HERBS_DATA,
  ARTICLES_DATA,
} from "../src/services/mockData";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // 1. Seed Departments
  console.log("Seeding Departments...");
  for (const dept of DEPARTMENTS_DATA) {
    await prisma.department.upsert({
      where: { id: dept.id },
      update: {},
      create: {
        id: dept.id,
        name: dept.name,
        slug: dept.slug,
        description: dept.description,
        icon: dept.icon,
        doctorCount: dept.doctorCount,
      },
    });
  }

  // 2. Seed Doctors
  console.log("Seeding Doctors...");
  for (const doc of DOCTORS_DATA) {
    await prisma.doctor.upsert({
      where: { id: doc.id },
      update: {},
      create: {
        id: doc.id,
        slug: doc.slug,
        fullName: doc.fullName,
        degree: doc.degree,
        specialty: doc.specialty,
        departmentId: doc.departmentId,
        bio: doc.bio,
        experience: doc.experience,
        imageUrl: doc.imageUrl,
        consultFee: doc.consultFee,
        rating: doc.rating,
        reviewCount: doc.reviewCount,
        isFeatured: doc.isFeatured,
        schedule: JSON.stringify(doc.schedule),
      },
    });
  }

  // 3. Seed Herbs
  console.log("Seeding Herbs...");
  for (const herb of HERBS_DATA) {
    await prisma.herb.upsert({
      where: { id: herb.id },
      update: {},
      create: {
        id: herb.id,
        slug: herb.slug,
        name: herb.name,
        latinName: herb.latinName,
        category: herb.category,
        description: herb.description,
        benefits: JSON.stringify(herb.benefits),
        usage: herb.usage,
        caution: herb.caution,
        imageUrl: herb.imageUrl,
        isFeatured: herb.isFeatured,
      },
    });
  }

  // 4. Seed Articles
  console.log("Seeding Articles...");
  for (const article of ARTICLES_DATA) {
    await prisma.article.upsert({
      where: { id: article.id },
      update: {},
      create: {
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        author: article.author,
        authorTitle: article.authorTitle,
        imageUrl: article.imageUrl,
        readingTime: article.readingTime,
        tags: JSON.stringify(article.tags),
        isFeatured: article.isFeatured,
        viewCount: article.viewCount,
        publishedAt: new Date(article.publishedAt),
      },
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
