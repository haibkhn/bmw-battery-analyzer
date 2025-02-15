import fs from "fs";
import csv from "csvtojson";
import { db } from "../config/database";
import { BatteryData, ProcessStatus } from "../types";

export class CSVService {
  private processStatusMap: Map<string, ProcessStatus> = new Map();

  async processCSV(filePath: string, fileId: string): Promise<void> {
    try {
      let rowCount = 0;
      const totalRows = await this.countCSVRows(filePath);

      this.processStatusMap.set(fileId, {
        processed: 0,
        total: totalRows,
        status: "processing",
      });

      // Process CSV in chunks
      await new Promise<void>((resolve, reject) => {
        const processChunk: BatteryData[] = [];

        csv()
          .fromFile(filePath)
          .subscribe(
            async (row: BatteryData) => {
              processChunk.push(row);
              rowCount++;

              if (processChunk.length >= 1000) {
                await this.insertDataChunk(processChunk);
                processChunk.length = 0;
                this.updateProcessStatus(fileId, rowCount);
              }
            },
            (error: Error) => {
              reject(error);
            },
            async () => {
              if (processChunk.length > 0) {
                await this.insertDataChunk(processChunk);
                this.updateProcessStatus(fileId, rowCount);
              }
              resolve();
            }
          );
      });

      this.processStatusMap.set(fileId, {
        processed: totalRows,
        total: totalRows,
        status: "completed",
      });

      fs.unlinkSync(filePath);
    } catch (error) {
      this.processStatusMap.set(fileId, {
        processed: 0,
        total: 0,
        status: "error",
      });
      throw error;
    }
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
            console.error(error);
          },
          () => {
            resolve(count);
          }
        );
    });
  }

  private async insertDataChunk(data: BatteryData[]): Promise<void> {
    await db("battery_data").insert(data);
  }

  private updateProcessStatus(fileId: string, processed: number): void {
    const currentStatus = this.processStatusMap.get(fileId);
    if (currentStatus) {
      this.processStatusMap.set(fileId, {
        ...currentStatus,
        processed,
      });
    }
  }

  getProcessStatus(fileId: string): ProcessStatus | null {
    return this.processStatusMap.get(fileId) || null;
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
