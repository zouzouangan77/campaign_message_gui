import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';

// Type pour la fonction de traitement avec numéro de ligne
type ProcessFunctionType = (data: any, lineNumber: number) => void | Promise<void>;

// Interface pour les résultats de traitement
export interface CsvProcessingResult {
    success: boolean;
    totalLines: number;
    processedLines: number;
    errors: Array<{
        lineNumber: number;
        error: string;
        data?: any;
    }>;
    processingTime: number;
}

@Injectable()
export class CsvService {

    /**
     * Lit un fichier CSV depuis un chemin de fichier
     */
    async readPathCsv(
        filePath: string,
        separator: string,
        process?: ProcessFunctionType,
    ): Promise<CsvProcessingResult> {
        const startTime = Date.now();

        return new Promise((resolve, reject) => {
            if (!fs.existsSync(filePath)) {
                return reject(new Error(`Le fichier ${filePath} n'existe pas`));
            }

            let lineNumber = 0;
            let processedLines = 0;
            const errors: Array<{ lineNumber: number; error: string; data?: any }> = [];

            fs.createReadStream(filePath)
                .pipe(csvParser({ separator: separator }))
                .on('data', async (data: any) => {
                    lineNumber++;

                    if (process) {
                        try {
                            await process(data, lineNumber);
                            processedLines++;
                        } catch (error) {
                            errors.push({
                                lineNumber,
                                error: error.message || 'Erreur inconnue',
                                data: data
                            });
                            console.error(`Erreur ligne ${lineNumber}:`, error.message);
                        }
                    } else {
                        processedLines++;
                    }
                })
                .on('end', () => {
                    const result: CsvProcessingResult = {
                        success: errors.length === 0,
                        totalLines: lineNumber,
                        processedLines,
                        errors,
                        processingTime: Date.now() - startTime
                    };

                    console.log(`✅ Lecture CSV terminée: ${processedLines}/${lineNumber} lignes traitées en ${result.processingTime}ms`);
                    resolve(result);
                })
                .on('error', (error: any) => {
                    console.error('❌ Erreur lors de la lecture du fichier CSV:', error.message);
                    reject(new Error(`Erreur de lecture CSV: ${error.message}`));
                });
        });
    }

    /**
     * Lit un CSV depuis une chaîne de caractères
     */
    async readStringCsv(
        csvString: string,
        separator: string,
        process?: ProcessFunctionType,
    ): Promise<CsvProcessingResult> {
        const startTime = Date.now();

        return new Promise((resolve, reject) => {
            // Validation initiale
            if (!csvString || csvString.trim().length === 0) {
                return reject(new Error('La chaîne CSV est vide ou invalide'));
            }

            let lineNumber = 0;
            let processedLines = 0;
            const errors: Array<{ lineNumber: number; error: string; data?: any }> = [];

            try {
                // Collecter toutes les lignes d'abord, puis les traiter séquentiellement.
                // Un callback async dans .on('data', ...) n'est pas attendu par le stream :
                // 'end' se déclenche avant que les Promises ne résolvent, vidant createContactDtos.
                const rows: any[] = [];
                const stream = Readable.from(csvString);

                stream
                    .pipe(csvParser({ separator: separator }))
                    .on('data', (data: any) => {
                        rows.push(data);
                    })
                    .on('end', async () => {
                        for (const data of rows) {
                            lineNumber++;
                            if (process) {
                                try {
                                    await process(data, lineNumber);
                                    processedLines++;
                                } catch (error) {
                                    errors.push({
                                        lineNumber,
                                        error: error.message || 'Erreur inconnue',
                                        data: data
                                    });
                                    console.error(`Erreur ligne ${lineNumber}:`, error.message);
                                }
                            } else {
                                processedLines++;
                            }
                        }

                        const result: CsvProcessingResult = {
                            success: errors.length === 0,
                            totalLines: lineNumber,
                            processedLines,
                            errors,
                            processingTime: Date.now() - startTime
                        };

                        console.log(`✅ Traitement CSV terminé: ${processedLines}/${lineNumber} lignes traitées en ${result.processingTime}ms`);
                        resolve(result);
                    })
                    .on('error', (error: any) => {
                        console.error('❌ Erreur lors du traitement CSV:', error.message);
                        reject(new Error(`Erreur de traitement CSV: ${error.message}`));
                    });

            } catch (error) {
                console.error('❌ Erreur lors de la création du stream CSV:', error.message);
                reject(new Error(`Erreur de création stream: ${error.message}`));
            }
        });
    }

    /**
     * Version simplifiée pour la rétrocompatibilité
     * @deprecated Utilisez readStringCsvWithResult à la place
     */
    async readStringCsvSimple(
        csvString: string,
        separator: string,
        process?: ProcessFunctionType,
    ): Promise<boolean> {
        try {
            const result = await this.readStringCsv(csvString, separator, process);
            return result.success && result.errors.length === 0;
        } catch (error) {
            console.error('Erreur dans readStringCsvSimple:', error.message);
            return false;
        }
    }

    /**
     * Valide le format d'un fichier CSV
     */
    async validateCsvFormat(
        csvString: string,
        separator: string,
        expectedColumns: string[]
    ): Promise<{
        isValid: boolean;
        foundColumns: string[];
        missingColumns: string[];
        extraColumns: string[];
    }> {
        return new Promise((resolve, reject) => {
            try {
                const lines = csvString.trim().split('\n');

                if (lines.length === 0) {
                    return resolve({
                        isValid: false,
                        foundColumns: [],
                        missingColumns: expectedColumns,
                        extraColumns: []
                    });
                }

                // Analyser l'en-tête
                const headerLine = lines[0];
                const foundColumns = headerLine.split(separator).map(col => col.trim());

                const missingColumns = expectedColumns.filter(col => !foundColumns.includes(col));
                const extraColumns = foundColumns.filter(col => !expectedColumns.includes(col));

                resolve({
                    isValid: missingColumns.length === 0,
                    foundColumns,
                    missingColumns,
                    extraColumns
                });

            } catch (error) {
                reject(new Error(`Erreur de validation CSV: ${error.message}`));
            }
        });
    }

    /**
     * Compte le nombre de lignes dans un CSV
     */
    countCsvLines(csvString: string): number {
        if (!csvString || csvString.trim().length === 0) {
            return 0;
        }

        const lines = csvString.trim().split('\n');
        // Soustraire 1 pour l'en-tête
        return Math.max(0, lines.length - 1);
    }

    /**
     * Divise un gros CSV en plus petits chunks
     */
    splitCsvIntoChunks(csvString: string, chunkSize: number): string[] {
        const lines = csvString.trim().split('\n');

        if (lines.length <= 1) {
            return [csvString];
        }

        const header = lines[0];
        const dataLines = lines.slice(1);
        const chunks: string[] = [];

        for (let i = 0; i < dataLines.length; i += chunkSize) {
            const chunkLines = dataLines.slice(i, i + chunkSize);
            const chunk = [header, ...chunkLines].join('\n');
            chunks.push(chunk);
        }

        return chunks;
    }

    /**
     * Nettoie un CSV (supprime les lignes vides, normalise les séparateurs)
     */
    cleanCsvString(csvString: string, separator: string = ';'): string {
        if (!csvString) {
            return '';
        }

        const lines = csvString
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        return lines.join('\n');
    }
}
