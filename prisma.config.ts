import { defineConfig } from "prisma/config";

function databaseUrl() {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) return "postgresql://placeholder:placeholder@localhost:5432/placeholder";

  try {
    const url = new URL(value);
    if (!["localhost", "127.0.0.1"].includes(url.hostname) && !url.searchParams.has("sslmode")) {
      url.searchParams.set("sslmode", "require");
    }
    return url.toString();
  } catch {
    return value;
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl(),
  },
});
