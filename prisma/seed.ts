import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { prisma } from "../lib/db";

const products = [
  {
    name: "Classic Oxford Shirt",
    description:
      "A crisp cotton oxford shirt with a relaxed fit. Perfect for the office or weekend brunch.",
    price: 8900,
    images: ["https://picsum.photos/seed/oxford-shirt/800/1000"],
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 120,
  },
  {
    name: "Slim Fit Dark Denim Jeans",
    description:
      "Japanese selvedge denim with a slim taper. Deep indigo wash that fades beautifully over time.",
    price: 12000,
    images: ["https://picsum.photos/seed/denim-jeans/800/1000"],
    sizes: ["28", "30", "32", "34", "36"],
    stock: 85,
  },
  {
    name: "Wool Blend Overcoat",
    description:
      "A timeless double-breasted overcoat in a luxurious wool-cashmere blend. Fully lined for warmth.",
    price: 29900,
    images: ["https://picsum.photos/seed/wool-overcoat/800/1000"],
    sizes: ["S", "M", "L", "XL"],
    stock: 40,
  },
  {
    name: "Organic Cotton Crew Tee",
    description:
      "Soft, breathable organic cotton t-shirt with a classic crew neck. An everyday essential.",
    price: 3500,
    images: ["https://picsum.photos/seed/cotton-tee/800/1000"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    stock: 200,
  },
  {
    name: "Linen Summer Blazer",
    description:
      "Unstructured linen blazer in a natural beige tone. Lightweight and effortlessly refined.",
    price: 18900,
    images: ["https://picsum.photos/seed/linen-blazer/800/1000"],
    sizes: ["S", "M", "L", "XL"],
    stock: 55,
  },
  {
    name: "Cashmere V-Neck Sweater",
    description:
      "Pure Mongolian cashmere sweater with a deep V-neck. Incredibly soft with a relaxed drape.",
    price: 15900,
    images: ["https://picsum.photos/seed/cashmere-sweater/800/1000"],
    sizes: ["S", "M", "L", "XL"],
    stock: 60,
  },
  {
    name: "Pleated Midi Skirt",
    description:
      "Elegant pleated midi skirt in a flowing satin finish. High waist with a hidden side zip.",
    price: 7900,
    images: ["https://picsum.photos/seed/pleated-skirt/800/1000"],
    sizes: ["XS", "S", "M", "L"],
    stock: 70,
  },
  {
    name: "Leather Chelsea Boots",
    description:
      "Handcrafted full-grain leather Chelsea boots with a Goodyear welted sole. Ages with character.",
    price: 24900,
    images: ["https://picsum.photos/seed/chelsea-boots/800/1000"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    stock: 35,
  },
];

async function main() {
  console.log("Seeding database...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
