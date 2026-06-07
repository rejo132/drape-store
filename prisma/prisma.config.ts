import { defineConfig } from "prisma/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
dotenv.config({ path: path.resolve(process.cwd(), ".env") })

const DATABASE_URL = process.env.DATABASE_URL!

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: DATABASE_URL,
  },
  migrate: {
    adapter: () => {
      const pool = new Pool({ connectionString: DATABASE_URL })
      return new PrismaPg(pool)
    },
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
})
