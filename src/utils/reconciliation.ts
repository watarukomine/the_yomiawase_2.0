import type { MappingConfig } from '../components/ColumnMapper';
import { preprocessData } from './data-processor';

export type ReconciliationStatus =
    | 'MATCH'
    | 'MISMATCH'
    | 'MISSING_IN_MASTER'
    | 'MISSING_IN_COMPARISON'
    | 'DUPLICATE_IN_MASTER'
    | 'DUPLICATE_IN_COMPARISON';

export interface ReconciliationResult {
    key: string;
    status: ReconciliationStatus;
    masterRow?: any; // If aggregated or single, this is the row. If duplicates, this might be the first row or handled differently.
    comparisonRow?: any;
    diffs: {
        columnName: string;
        masterValue: any;
        comparisonValue: any;
        isMatch: boolean;
    }[];
    isVerified: boolean;
    duplicateRows?: any[]; // For FLAG strategy: all rows sharing the key
}

export const reconcileData = (
    masterData: any[],
    comparisonData: any[],
    mapping: MappingConfig
): ReconciliationResult[] => {
    const results: ReconciliationResult[] = [];

    // Preprocess data based on strategy
    const masterGrouped = preprocessData(masterData, mapping.masterKey, mapping.valueColumns.map(c => c.master), mapping.duplicateHandling);
    const comparisonGrouped = preprocessData(comparisonData, mapping.comparisonKey, mapping.valueColumns.map(c => c.comparison), mapping.duplicateHandling);

    // Get unique keys from preprocessed data
    const masterKeys = new Set(Object.keys(masterGrouped));
    const comparisonKeys = new Set(Object.keys(comparisonGrouped));

    // Helper to process a key present in both
    const processMatch = (key: string) => {
        const masterRows = masterGrouped[key];
        const comparisonRows = comparisonGrouped[key];

        // Check for duplicates (FLAG strategy) -> if > 1 row, it's a duplicate error
        // Note: For SUM/OVERWRITE, preprocessData guarantees max 1 row.
        const isMasterDuplicate = masterRows.length > 1;
        const isComparisonDuplicate = comparisonRows.length > 1;

        if (isMasterDuplicate || isComparisonDuplicate) {
            // Priority to report duplicates
            // We report separate errors if both are duplicate, or one combined?
            // Let's create separate results if possible, or one result with specific status.
            // Since the UI expects one result per key, we probably need a status that says "Duplicate Error".

            if (isMasterDuplicate) {
                results.push({
                    key,
                    status: 'DUPLICATE_IN_MASTER',
                    masterRow: masterRows[0], // Show representative
                    comparisonRow: comparisonRows[0],
                    diffs: [],
                    isVerified: false,
                    duplicateRows: masterRows
                });
            }
            if (isComparisonDuplicate) {
                // If both were duplicate, we might have pushed one already. 
                // If we push another for the same key, it might be confusing in the list.
                // But typically we want to see all errors. 
                // Let's assume if Master is duplicate, we fix that first. 
                // Or we can simple use a generic 'DUPLICATE_KEY' status? 
                // The requirement asked for "Duplicate in Master" and "Duplicate in Comparison".
                // Let's only push if we haven't pushed for Master Duplicate to avoid double key issues in React keys if we use 'key' as ID.
                if (!isMasterDuplicate) {
                    results.push({
                        key,
                        status: 'DUPLICATE_IN_COMPARISON',
                        masterRow: masterRows[0],
                        comparisonRow: comparisonRows[0],
                        diffs: [],
                        isVerified: false,
                        duplicateRows: comparisonRows
                    });
                }
            }
            return;
        }

        // Normal 1-to-1 comparison
        const masterRow = masterRows[0];
        const comparisonRow = comparisonRows[0];

        const diffs = mapping.valueColumns.map(col => {
            const mVal = masterRow[col.master];
            const cVal = comparisonRow[col.comparison];

            let isMatch = false;

            if (mapping.treatMissingAsZero) {
                const toNum = (val: any) => {
                    if (val === null || val === undefined || val === '') return 0;
                    const num = Number(val);
                    return isNaN(num) ? val : num;
                };

                const mNum = toNum(mVal);
                const cNum = toNum(cVal);

                if (typeof mNum === 'number' && typeof cNum === 'number') {
                    isMatch = mNum === cNum;
                } else {
                    isMatch = String(mNum).replace(/\s+/g, '') === String(cNum).replace(/\s+/g, '');
                }
            } else {
                isMatch = String(mVal ?? '').replace(/\s+/g, '') === String(cVal ?? '').replace(/\s+/g, '');
            }

            return {
                columnName: `${col.master} / ${col.comparison}`,
                masterValue: mVal,
                comparisonValue: cVal,
                isMatch
            };
        });

        const isAllMatch = diffs.every(d => d.isMatch);

        results.push({
            key,
            status: isAllMatch ? 'MATCH' : 'MISMATCH',
            masterRow,
            comparisonRow,
            diffs,
            isVerified: false
        });
    };

    // 1. Iterate through Master Keys
    masterKeys.forEach(key => {
        if (comparisonKeys.has(key)) {
            processMatch(key);
            comparisonKeys.delete(key); // Remove processed
        } else {
            // Missing in Comparison
            // Also check for duplicates in Master even if missing in Comparison (for FLAG strategy)
            const rows = masterGrouped[key];
            if (rows.length > 1) {
                results.push({
                    key,
                    status: 'DUPLICATE_IN_MASTER',
                    masterRow: rows[0],
                    diffs: [],
                    isVerified: false,
                    duplicateRows: rows
                });
            } else {
                results.push({
                    key,
                    status: 'MISSING_IN_COMPARISON',
                    masterRow: rows[0],
                    diffs: [],
                    isVerified: false
                });
            }
        }
    });

    // 2. Iterate through remaining Comparison Keys
    comparisonKeys.forEach(key => {
        const rows = comparisonGrouped[key];
        if (rows.length > 1) {
            results.push({
                key,
                status: 'DUPLICATE_IN_COMPARISON',
                comparisonRow: rows[0],
                diffs: [],
                isVerified: false,
                duplicateRows: rows
            });
        } else {
            results.push({
                key,
                status: 'MISSING_IN_MASTER',
                comparisonRow: rows[0],
                diffs: [],
                isVerified: false
            });
        }
    });

    return results;
};
