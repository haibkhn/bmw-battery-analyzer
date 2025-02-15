import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

export const db = knex({
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  pool: { min: 0, max: 7 },
});

// Create tables if they don't exist
export const initializeDatabase = async () => {
  const hasTable = await db.schema.hasTable("battery_data");

  if (!hasTable) {
    await db.schema.createTable("battery_data", (table) => {
      table.increments("id").primary();
      table.integer("cycle_number");
      table.float("capacity").nullable();
      table.float("time").nullable();
      table.float("current").nullable();
      table.float("voltage").nullable();
      table.timestamp("created_at").defaultTo(db.fn.now());
    });
  }
};
