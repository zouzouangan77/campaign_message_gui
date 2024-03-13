import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as csvParser from 'csv-parser';

type ProcessFunctionType = (data: any) => void;

@Injectable()
export class CsvService {
  async readPathCsv(
    filePath: string,
    separator: string,
    process?: ProcessFunctionType,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser({ separator: separator }))
        .on('data', (data: any) => process(data))
        .on('end', () => resolve())
        .on('error', (error: any) => reject(error));
    });
  }

  async readStringCsv(
    csvString: string,
    separator: string,
    process?: ProcessFunctionType,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const stream = csvParser({ separator: separator });
      stream
        .on('data', (data: any) => process(data))
        .on('end', () => resolve(true))
        .on('error', (error: any) => reject(error));
      stream.write(csvString);
      stream.end();
    });
  }
}
