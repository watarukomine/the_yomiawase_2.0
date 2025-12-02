import type { MappingConfig } from '../components/ColumnMapper';

export type ReconciliationStatus = 'MATCH' | 'MISMATCH' | 'MISSING_IN_MASTER' | 'MISSING_IN_COMPARISON';

export interface ReconciliationResult {
    key: string;
    status: ReconciliationStatus;
    masterRow?: any;
    comparisonRow?: any;
    diffs: {
        columnName: string; // The display name (e.g., "Salary")
        masterValue: any;
        comparisonValue: any;
        isMatch: boolean;
    }[];
    isVerified: boolean; // User manually verified
}

export const reconcileData = (
    masterData: any[],
    comparisonData: any[],
    mapping: MappingConfig
): ReconciliationResult[] => {
    const results: ReconciliationResult[] = [];

    // Index data by key for O(1) lookup
    const masterMap = new Map<string, any>();
    masterData.forEach(row => {
        const key = String(row[mapping.masterKey] || '').trim();
        if (key) masterMap.set(key, row);
    });

    const comparisonMap = new Map<string, any>();
    comparisonData.forEach(row => {
        const key = String(row[mapping.comparisonKey] || '').trim();
        if (key) comparisonMap.set(key, row);
    });

    // 1. Iterate through Master keys to find Matches and Missing in Comparison
    masterMap.forEach((masterRow, key) => {
        const comparisonRow = comparisonMap.get(key);

        if (comparisonRow) {
            // Found in both: Compare values
            const diffs = mapping.valueColumns.map(col => {
                const mVal = masterRow[col.master];
                const cVal = comparisonRow[col.comparison];

                // Simple equality check for now. Can be enhanced with fuzzy matching or numeric normalization later.
                // Normalizing to string for comparison to handle number vs string issues
                const isMatch = String(mVal ?? '').trim() === String(cVal ?? '').trim();

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

            // Remove from comparison map so we know what's left
            comparisonMap.delete(key);
        } else {
            // Missing in Comparison
            results.push({
                key,
                status: 'MISSING_IN_COMPARISON',
                masterRow,
                diffs: [],
                isVerified: false
            });
        }
    });

    // 2. Iterate through remaining Comparison keys (Missing in Master)
    comparisonMap.forEach((comparisonRow, key) => {
        results.push({
            key,
            status: 'MISSING_IN_MASTER',
            comparisonRow,
            diffs: [],
            isVerified: false
        });
    });

    return results;
};
