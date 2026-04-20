const { PrismaClient } = require('@prisma/client');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const ws = require('ws');

// Configure Neon to use WebSockets to bypass firewalls blocking port 5432
neonConfig.webSocketConstructor = ws;

// Construct the Prisma Neon adapter
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

// Export singleton instance
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
