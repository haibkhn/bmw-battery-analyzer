import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("battery_data", (table) => {
    table.increments("id").primary();
    table.integer("cycle_number");
    table.float("capacity").nullable();
    table.float("time").nullable();
    table.float("current").nullable();
    table.float("voltage").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("battery_data");
}
