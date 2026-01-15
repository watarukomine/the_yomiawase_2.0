import type { DuplicateHandlingStrategy } from '../components/ColumnMapper';

export interface PreprocessedData {
    // Map key to one or more rows (for 'FLAG' strategy) or a single aggregated row (for 'SUM' strategy)
    [key: string]: any[];
}

/**
 * Preprocesses data based on the duplicate handling strategy.
 */
export const preprocessData = (
    data: any[],
    keyField: string,
    valueFields: string[],
    strategy: DuplicateHandlingStrategy
): PreprocessedData => {
    const groupedData: { [key: string]: any[] } = {};

    // 1. Group by Key
    data.forEach(row => {
        const key = String(row[keyField] || '').replace(/\s+/g, '');
        if (!key) return; // Skip empty keys

        if (!groupedData[key]) {
            groupedData[key] = [];
        }
        groupedData[key].push(row);
    });

    // 2. Apply Strategy
    if (strategy === 'OVERWRITE') {
        const result: PreprocessedData = {};
        Object.keys(groupedData).forEach(key => {
            // Take the last row (Last Write Wins)
            const rows = groupedData[key];
            result[key] = [rows[rows.length - 1]];
        });
        return result;
    }

    if (strategy === 'SUM') {
        const result: PreprocessedData = {};
        Object.keys(groupedData).forEach(key => {
            const rows = groupedData[key];
            if (rows.length === 1) {
                result[key] = rows;
                return;
            }

            // Create a merged row
            const mergedRow = { ...rows[0] }; // Start with first row properties

            // Sum numeric value fields
            valueFields.forEach(field => {
                let sum = 0;
                let hasNumber = false;

                rows.forEach(row => {
                    const val = row[field];
                    if (val !== undefined && val !== null && val !== '') {
                        const num = Number(val);
                        if (!isNaN(num)) {
                            sum += num;
                            hasNumber = true;
                        }
                    }
                });

                if (hasNumber) {
                    mergedRow[field] = sum;
                }
                // If no numbers found, keep original value from first row? 
                // Or maybe we should try to sum if at least one is number.
                // For now, simple sum logic.
            });

            result[key] = [mergedRow];
        });
        return result;
    }

    if (strategy === 'FLAG') {
        // Just return the grouped data as is.
        // The reconciliation logic will check if array length > 1 to detect duplicates.
        return groupedData;
    }

    return groupedData;
};
