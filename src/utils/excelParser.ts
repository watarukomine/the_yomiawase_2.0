import * as XLSX from 'xlsx';

export type SheetData = {
    name: string;
    data: any[][];
};

export const parseExcelFile = async (file: File): Promise<SheetData[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });

                const sheets: SheetData[] = workbook.SheetNames.map(name => {
                    const sheet = workbook.Sheets[name];
                    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    return {
                        name,
                        data: jsonData as any[][]
                    };
                });

                resolve(sheets);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};
