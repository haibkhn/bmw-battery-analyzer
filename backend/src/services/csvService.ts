import fs from "fs";
import csv from "csvtojson";
import { db } from "../config/database";
import { BatteryData, ProcessStatus } from "../types";

export class CSVService {
  private processStatusMap = new Map<string, ProcessStatus>();

  async processCSV(filePath: string, fileId: string): Promise<void> {
    try {
      console.log("Starting CSV processing for fileId:", fileId);

      // Initialize status immediately
      const totalRows = await this.countCSVRows(filePath);
      console.log("Total rows:", totalRows);

      // Set initial status
      this.processStatusMap.set(fileId, {
        fileId,
        status: "processing",
        processed: 0,
        total: totalRows,
      });

      const batchSize = 1000;
      let batch: BatteryData[] = [];
      let rowCount = 0;

      await new Promise<void>((resolve, reject) => {
        csv()
          .fromFile(filePath)
          .subscribe(
            async (row: BatteryData) => {
              try {
                if (this.validateRow(row)) {
                  batch.push(row);
                  rowCount++;

                  if (batch.length >= batchSize) {
                    await this.insertBatch(batch);
                    console.log(`Processed ${rowCount} rows`);
                    // Update status after each batch
                    this.processStatusMap.set(fileId, {
                      fileId,
                      status: "processing",
                      processed: rowCount,
                      total: totalRows,
                    });
                    batch = [];
                  }
                }
              } catch (error) {
                console.error("Error processing row:", error);
                reject(error);
              }
            },
            (error: Error) => {
              console.error("CSV parsing error:", error);
              this.processStatusMap.set(fileId, {
                fileId,
                status: "error",
                processed: rowCount,
                total: totalRows,
                error: error.message,
              });
              reject(error);
            },
            async () => {
              try {
                if (batch.length > 0) {
                  await this.insertBatch(batch);
                }
                // Set final status
                this.processStatusMap.set(fileId, {
                  fileId,
                  status: "completed",
                  processed: rowCount,
                  total: totalRows,
                });
                console.log("CSV processing completed");
                resolve();
              } catch (error) {
                console.error("Error in final batch:", error);
                this.processStatusMap.set(fileId, {
                  fileId,
                  status: "error",
                  processed: rowCount,
                  total: totalRows,
                  error:
                    error instanceof Error ? error.message : "Unknown error",
                });
                reject(error);
              }
            }
          );
      });

      // Clean up file
      fs.unlinkSync(filePath);
      console.log("File cleanup completed");
    } catch (error) {
      console.error("CSV processing error:", error);
      this.processStatusMap.set(fileId, {
        fileId,
        status: "error",
        processed: 0,
        total: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  getProcessStatus(fileId: string): ProcessStatus | null {
    const status = this.processStatusMap.get(fileId);
    console.log("Status request for fileId:", fileId);
    console.log("Current status:", status);
    return status || null;
  }

  private validateRow(row: any): boolean {
    // Type for normalized row
    type NormalizedRow = {
      cycle_number: number;
      capacity?: number;
      time?: number;
      current?: number;
      voltage?: number;
    };

    // Convert string values to numbers
    const normalizedRow: NormalizedRow = {
      cycle_number: Number(row.cycle_number),
      capacity: row.capacity ? Number(row.capacity) : undefined,
      time: row.time ? Number(row.time) : undefined,
      current: row.current ? Number(row.current) : undefined,
      voltage: row.voltage ? Number(row.voltage) : undefined,
    };

    // Validate cycle_number
    if (isNaN(normalizedRow.cycle_number)) return false;

    // Validate optional fields if they exist
    const optionalFields = ["capacity", "time", "current", "voltage"] as const;
    const isValid = optionalFields.every(
      (field) =>
        normalizedRow[field] === undefined || !isNaN(normalizedRow[field])
    );

    if (isValid) {
      // Replace the original row with normalized values
      Object.assign(row, normalizedRow);
      return true;
    }
    return false;
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

  private updateStatus(fileId: string, processed: number): void {
    const status = this.processStatusMap.get(fileId);
    if (status) {
      this.processStatusMap.set(fileId, {
        ...status,
        processed,
      });
    }
  }

  async getData(params: {
    startCycle?: number;
    endCycle?: number;
    limit?: number;
    offset?: number;
  }): Promise<BatteryData[]> {
    const query = db("battery_data").select("*").orderBy("cycle_number", "asc");

    if (params.startCycle) {
      query.where("cycle_number", ">=", params.startCycle);
    }
    if (params.endCycle) {
      query.where("cycle_number", "<=", params.endCycle);
    }
    if (params.limit) {
      query.limit(params.limit);
    }
    if (params.offset) {
      query.offset(params.offset);
    }

    return query;
  }
}

export const csvService = new CSVService();
