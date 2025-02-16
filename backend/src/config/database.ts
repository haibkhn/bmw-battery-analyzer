import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

export const db = knex({
  client: "pg",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  pool: { min: 0, max: 7 },
});

export const initializeDatabase = async () => {
  try {
    // Check connection
    await db.raw("SELECT 1");
    console.log("Database connected");

    // Run migrations if needed
    const hasTable = await db.schema.hasTable("battery_data");
    if (!hasTable) {
      await db.schema.createTable("battery_data", (table) => {
        table.increments("id").primary();
        table.integer("cycle_number").notNullable().index();
        table.float("capacity").nullable();
        table.float("time").nullable();
        table.float("current").nullable();
        table.float("voltage").nullable();
        table.timestamp("created_at").defaultTo(db.fn.now());
      });
      console.log("Battery data table created");
    }
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
};
