import fs from "fs";
import csv from "csvtojson";
import readline from "readline";
import { db } from "../config/database";
import { BatteryData, ProcessStatus, CSVType } from "../types";

export class CSVService {
  private processStatusMap = new Map<string, ProcessStatus>();

  private async cleanDatabase(): Promise<void> {
    console.log("Cleaning database before new upload...");
    await db("battery_data").truncate();
    console.log("Database cleaned");
  }

  async processCSV(filePath: string, fileId: string): Promise<void> {
    // Initialize status immediately when process starts
    this.initializeStatus(fileId);

    try {
      // Clean database before processing new file
      await this.cleanDatabase();

      console.log("Starting CSV processing...");
      const firstLine = await this.readFirstLine(filePath);
      const headers = firstLine.split(",").map((h) => h.trim());

      const { isValid, csvType } = this.validateHeaders(headers);
      if (!isValid || !csvType) {
        throw new Error(
          "Invalid CSV format. Expected either 2 columns (cycle_number, capacity) or 4 columns (cycle_number, time, current, voltage)"
        );
      }

      console.log("CSV Type:", csvType);
      console.log("Counting rows...");
      const totalRows = await this.countCSVRows(filePath);
      console.log("Total rows:", totalRows);

      // Update status with total rows
      this.updateStatus(fileId, {
        status: "processing",
        processed: 0,
        total: totalRows,
        csvType,
      });

      const batchSize = 1000;
      let batch: BatteryData[] = [];
      let rowCount = 0;

      await new Promise<void>((resolve, reject) => {
        csv()
          .fromFile(filePath)
          .subscribe(
            async (row: any) => {
              try {
                const normalizedRow = this.normalizeRow(row, csvType);
                if (normalizedRow) {
                  batch.push(normalizedRow);
                  rowCount++;

                  if (batch.length >= batchSize) {
                    await this.insertBatch(batch);
                    // console.log(`Processed ${rowCount} rows`);
                    // Update status after each batch
                    this.updateStatus(fileId, {
                      processed: rowCount,
                    });
                    batch = [];
                  }
                }
              } catch (error) {
                reject(error);
              }
            },
            (error) => {
              console.error("CSV parsing error:", error);
              this.updateStatus(fileId, {
                status: "error",
                error: error.message,
              });
              reject(error);
            },
            async () => {
              try {
                if (batch.length > 0) {
                  await this.insertBatch(batch);
                  this.updateStatus(fileId, {
                    processed: rowCount,
                  });
                }
                console.log("Processing completed");
                this.updateStatus(fileId, {
                  status: "completed",
                  processed: rowCount,
                });
                resolve();
              } catch (error) {
                reject(error);
              }
            }
          );
      });

      fs.unlinkSync(filePath);
      console.log("File cleanup completed");
    } catch (error) {
      console.error("CSV processing error:", error);
      this.updateStatus(fileId, {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  private validateHeaders(headers: string[]): {
    isValid: boolean;
    csvType: CSVType | null;
  } {
    const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());
    console.log("Normalized headers:", normalizedHeaders);

    if (
      normalizedHeaders.includes("cycle_number") &&
      normalizedHeaders.includes("capacity")
    ) {
      return { isValid: true, csvType: "2_column" };
    }

    if (
      normalizedHeaders.includes("cycle_number") &&
      normalizedHeaders.includes("time") &&
      normalizedHeaders.includes("current") &&
      normalizedHeaders.includes("voltage")
    ) {
      return { isValid: true, csvType: "4_column" };
    }

    return { isValid: false, csvType: null };
  }

  private normalizeRow(row: any, csvType: CSVType): BatteryData | null {
    const base = {
      cycle_number: Number(row.cycle_number),
    };

    if (isNaN(base.cycle_number)) {
      console.log("Invalid cycle_number:", row.cycle_number);
      return null;
    }

    if (csvType === "2_column") {
      const capacity = Number(row.capacity);
      if (isNaN(capacity)) {
        console.log("Invalid capacity:", row.capacity);
        return null;
      }
      return { ...base, capacity };
    } else {
      const time = Number(row.time);
      const current = Number(row.current);
      const voltage = Number(row.voltage);

      if (isNaN(time) || isNaN(current) || isNaN(voltage)) {
        console.log("Invalid 4-column values:", { time, current, voltage });
        return null;
      }

      return { ...base, time, current, voltage };
    }
  }

  private initializeStatus(fileId: string): void {
    console.log("Initializing status for fileId:", fileId);
    this.processStatusMap.set(fileId, {
      fileId,
      status: "processing",
      processed: 0,
      total: 0,
    });
  }

  private updateStatus(fileId: string, update: Partial<ProcessStatus>): void {
    const currentStatus = this.processStatusMap.get(fileId);
    if (currentStatus) {
      const newStatus = { ...currentStatus, ...update };
      // console.log("Updating status:", newStatus);
      this.processStatusMap.set(fileId, newStatus);
    }
  }

  private async readFirstLine(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: fs.createReadStream(filePath, { encoding: "utf8" }),
        crlfDelay: Infinity,
      });

      rl.once("line", (line) => {
        rl.close();
        resolve(line);
      });

      rl.on("error", reject);
    });
  }

  private async countCSVRows(filePath: string): Promise<number> {
    return new Promise<number>((resolve) => {
      let count = 0;
      csv()
        .fromFile(filePath)
        .subscribe(
          () => {
            count++;
          },
          (error: Error) => {
            console.error("Error counting rows:", error);
            resolve(0);
          },
          () => {
            resolve(count);
          }
        );
    });
  }

  private async insertBatch(data: BatteryData[]): Promise<void> {
    await db("battery_data").insert(data);
  }

  private async calculateRanges(csvType: CSVType) {
    const columns =
      csvType === "2_column"
        ? ["cycle_number", "capacity"]
        : ["cycle_number", "time", "current", "voltage"];

    const ranges: { [key: string]: { min: number; max: number } } = {};

    for (const column of columns) {
      const result = await db("battery_data")
        .min(`${column} as min`)
        .max(`${column} as max`)
        .first();

      if (result) {
        ranges[column] = {
          min: Number(result.min),
          max: Number(result.max),
        };
      }
    }

    return ranges;
  }

  getProcessStatus(fileId: string): ProcessStatus | null {
    console.log("Getting status for fileId:", fileId);
    const status = this.processStatusMap.get(fileId);
    console.log("Current status:", status);
    return status || null;
  }

  async getData(): Promise<{
    data: BatteryData[];
    stats: {
      totalRows: number;
      type: CSVType;
      ranges: {
        [key: string]: { min: number; max: number };
      };
    };
  }> {
    try {
      console.log("Fetching data from database...");
      // Get first row to determine type
      const firstRow = await db("battery_data").first();
      console.log("First row:", firstRow);

      // Get all data
      const data = await db("battery_data")
        .select("*")
        .orderBy("cycle_number", "asc");

      console.log(`Retrieved ${data.length} rows`);

      // Determine type by checking which columns have values
      const type: CSVType = firstRow.time !== null ? "4_column" : "2_column";
      console.log("Detected CSV type:", type);

      // Calculate ranges based on type
      const columns =
        type === "2_column"
          ? ["cycle_number", "capacity"]
          : ["cycle_number", "time", "current", "voltage"];

      const ranges: { [key: string]: { min: number; max: number } } = {};

      for (const column of columns) {
        const result = await db("battery_data")
          .min(`${column} as min`)
          .max(`${column} as max`)
          .first();

        if (result) {
          ranges[column] = {
            min: Number(result.min),
            max: Number(result.max),
          };
        }
      }

      console.log("Data ranges:", ranges);

      return {
        data,
        stats: {
          totalRows: data.length,
          type,
          ranges,
        },
      };
    } catch (error) {
      console.error("Error in getData:", error);
      throw error;
    }
  }
}

export const csvService = new CSVService();
