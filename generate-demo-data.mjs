import * as XLSX from 'xlsx';
import { writeFileSync } from 'fs';

// Master Data
const masterData = [
    ['社員番号', '氏名', '部署', '基本給', '残業代', '交通費'],
    [1001, '山田 太郎', '営業部', 300000, 45000, 15000],
    [1002, '鈴木 花子', '人事部', 280000, 10000, 12000],
    [1003, '佐藤 次郎', '開発部', 450000, 80000, 20000],
    [1004, '田中 美咲', '営業部', 320000, 35000, 15000],
    [1005, '高橋 健一', '経理部', 290000, 5000, 10000],
];

// Comparison Data (with intentional discrepancies)
const comparisonData = [
    ['社員番号', '氏名', '部署', '基本給', '残業代', '交通費'],
    [1001, '山田 太郎', '営業部', 300000, 45000, 15000],
    [1002, '鈴木 花子', '人事部', 280000, 12000, 12000], // Overtime different: 10000 -> 12000
    [1003, '佐藤 次郎', '開発部', 450000, 80000, 20000],
    [1005, '高橋 健一', '経理部', 290000, 5000, 8000],   // Transport different: 10000 -> 8000
    [1006, '伊藤 勇樹', '開発部', 380000, 40000, 18000],  // New employee (not in master)
];

// Create workbooks
const masterWB = XLSX.utils.book_new();
const masterWS = XLSX.utils.aoa_to_sheet(masterData);
XLSX.utils.book_append_sheet(masterWB, masterWS, 'マスターデータ');

const comparisonWB = XLSX.utils.book_new();
const comparisonWS = XLSX.utils.aoa_to_sheet(comparisonData);
XLSX.utils.book_append_sheet(comparisonWB, comparisonWS, '照合データ');

// Write Excel files
XLSX.writeFile(masterWB, 'demo_data/master_data.xlsx');
XLSX.writeFile(comparisonWB, 'demo_data/comparison_data.xlsx');

console.log('✅ Excel demo files created successfully!');
console.log('📁 Files:');
console.log('   - demo_data/master_data.xlsx');
console.log('   - demo_data/comparison_data.xlsx');
