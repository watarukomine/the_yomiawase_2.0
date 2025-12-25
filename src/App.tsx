import { useState } from 'react';
import { FileSpreadsheet, ArrowRight, Check } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { DataIngestion } from './components/DataIngestion';
import { ColumnMapper, type MappingConfig } from './components/ColumnMapper';
import { HeaderReview } from './components/HeaderReview';
import { SheetSelector } from './components/SheetSelector';
import { VerificationDashboard } from './components/VerificationDashboard';
import { parseExcelFile, type SheetData } from './utils/excelParser';
import { reconcileData, type ReconciliationResult } from './utils/reconciliation';
import { clsx } from 'clsx';

type Step = 'UPLOAD' | 'SHEET_SELECT' | 'HEADER_MASTER' | 'REVIEW_MASTER' | 'HEADER_COMPARISON' | 'REVIEW_COMPARISON' | 'MAPPING' | 'RESULTS';

const STEPS = [
  { id: 'UPLOAD', label: 'ファイル' },
  { id: 'SHEET_SELECT', label: 'シート' },
  { id: 'HEADER_MASTER', label: 'ヘッダー(正)' },
  { id: 'HEADER_COMPARISON', label: 'ヘッダー(副)' },
  { id: 'MAPPING', label: '列設定' },
  { id: 'RESULTS', label: '結果' },
];

function App() {
  const [step, setStep] = useState<Step>('UPLOAD');

  // File State
  const [masterFiles, setMasterFiles] = useState<File[]>([]);
  const [comparisonFiles, setComparisonFiles] = useState<File[]>([]);

  // Data State
  // parsed...Data stores ALL sheets from uploaded files
  const [parsedMasterData, setParsedMasterData] = useState<SheetData[][]>([]);
  const [parsedComparisonData, setParsedComparisonData] = useState<SheetData[][]>([]);

  // ...RawData stores ONLY the selected sheet's data (array of rows) for each file
  const [masterRawData, setMasterRawData] = useState<any[][][]>([]);
  const [comparisonRawData, setComparisonRawData] = useState<any[][][]>([]);

  // Header State
  const [masterHeaders, setMasterHeaders] = useState<string[]>([]);
  const [comparisonHeaders, setComparisonHeaders] = useState<string[]>([]);
  const [masterRowIndices, setMasterRowIndices] = useState<number[]>([]);
  const [comparisonRowIndices, setComparisonRowIndices] = useState<number[]>([]);

  // Preview State (for editing individual file headers)
  const [activePreviewFileIndex, setActivePreviewFileIndex] = useState<number | null>(null);

  // Results State
  const [results, setResults] = useState<ReconciliationResult[]>([]);

  const handleFileUpload = async (files: File[], type: 'master' | 'comparison') => {
    try {
      const dataPromises = files.map(file => parseExcelFile(file));
      const allData = await Promise.all(dataPromises);

      if (type === 'master') {
        setMasterFiles(files);
        setParsedMasterData(allData);
      } else {
        setComparisonFiles(files);
        setParsedComparisonData(allData);
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      alert("ファイルの読み込みに失敗しました。もう一度お試しください。");
    }
  };

  const startProcess = () => {
    if (masterFiles.length > 0 && comparisonFiles.length > 0) {
      setStep('SHEET_SELECT');
    }
  };


  // Helper to find the best matching header row index
  const findHeaderRow = (dataset: any[][], targetHeaders: string[]): number => {
    // Scan first 50 rows
    for (let i = 0; i < Math.min(dataset.length, 50); i++) {
      const row = dataset[i];
      if (!row) continue;

      const rowStrings = row.map(cell => String(cell || '').trim());
      // Check if this row contains a meaningful number of our target headers
      const matchCount = targetHeaders.filter(h => rowStrings.includes(h)).length;

      // If > 70% of headers match, assume this is the header row
      if (matchCount > 0 && matchCount / targetHeaders.length > 0.7) {
        return i;
      }
    }
    return -1; // Not found
  };

  const handleHeaderConfirm = (type: 'master' | 'comparison', rowIndex: number, headers: string[]) => {
    // If we are editing a specific file in Review mode
    if (activePreviewFileIndex !== null) {
      if (type === 'master') {
        const newIndices = [...masterRowIndices];
        newIndices[activePreviewFileIndex] = rowIndex;
        setMasterRowIndices(newIndices);
        setActivePreviewFileIndex(null); // Return to review
      } else {
        const newIndices = [...comparisonRowIndices];
        newIndices[activePreviewFileIndex] = rowIndex;
        setComparisonRowIndices(newIndices);
        setActivePreviewFileIndex(null); // Return to review
      }
      return;
    }

    // Normal flow (First file selection)
    if (type === 'master') {
      setMasterHeaders(headers);

      const newIndices = masterRawData.map((dataset, idx) => {
        if (idx === 0) return rowIndex;
        const detected = findHeaderRow(dataset, headers);
        return detected !== -1 ? detected : rowIndex;
      });
      setMasterRowIndices(newIndices);

      if (masterFiles.length > 1) {
        setStep('REVIEW_MASTER');
      } else {
        processMasterData(newIndices, headers); // Proceed directly
      }

    } else {
      setComparisonHeaders(headers);

      const newIndices = comparisonRawData.map((dataset, idx) => {
        if (idx === 0) return rowIndex;
        const detected = findHeaderRow(dataset, headers);
        return detected !== -1 ? detected : rowIndex;
      });
      setComparisonRowIndices(newIndices);

      if (comparisonFiles.length > 1) {
        setStep('REVIEW_COMPARISON');
      } else {
        processComparisonData(newIndices, headers); // Proceed directly
      }
    }
  };

  const processMasterData = (indices: number[], headers: string[]) => {
    // Process all master files
    const dataRows = masterRawData.flatMap((dataset, idx) => {
      const startIndex = indices[idx];
      return dataset.slice(startIndex + 1).map(row => {
        const obj: any = {};

        if (idx > 0) {
          // Re-map by column name if we are treating this as a separate file structure
          const fileHeaders = dataset[startIndex].map(c => String(c || '').trim());
          headers.forEach(h => {
            const colIdx = fileHeaders.indexOf(h);
            if (colIdx !== -1) {
              obj[h] = row[colIdx];
            }
          });
        } else {
          // First file: use the index from the selection
          headers.forEach((h, i) => {
            obj[h] = row[i];
          });
        }
        return obj;
      });
    });

    setMasterProcessedData(dataRows);
    setStep('HEADER_COMPARISON');
  };

  const processComparisonData = (indices: number[], headers: string[]) => {
    // Process all comparison files
    const dataRows = comparisonRawData.flatMap((dataset, idx) => {
      const startIndex = indices[idx];
      return dataset.slice(startIndex + 1).map(row => {
        const obj: any = {};

        if (idx > 0) {
          const fileHeaders = dataset[startIndex].map(c => String(c || '').trim());
          headers.forEach(h => {
            const colIdx = fileHeaders.indexOf(h);
            if (colIdx !== -1) {
              obj[h] = row[colIdx];
            }
          });
        } else {
          headers.forEach((h, i) => {
            obj[h] = row[i];
          });
        }
        return obj;
      });
    });

    setComparisonProcessedData(dataRows);
    setStep('MAPPING');
  };

  const [masterProcessedData, setMasterProcessedData] = useState<any[]>([]);
  const [comparisonProcessedData, setComparisonProcessedData] = useState<any[]>([]);

  const handleMappingConfirm = (mapping: MappingConfig) => {
    const res = reconcileData(masterProcessedData, comparisonProcessedData, mapping);
    setResults(res);
    setStep('RESULTS');
  };

  const handleSheetConfirm = (
    masterSelection: { fileIndex: number, sheetIndex: number }[],
    comparisonSelection: { fileIndex: number, sheetIndex: number }[]
  ) => {
    // Extract the selected sheet data for each file
    const newMasterRawData = masterSelection.map(sel => {
      return parsedMasterData[sel.fileIndex][sel.sheetIndex].data;
    });
    setMasterRawData(newMasterRawData);

    const newComparisonRawData = comparisonSelection.map(sel => {
      return parsedComparisonData[sel.fileIndex][sel.sheetIndex].data;
    });
    setComparisonRawData(newComparisonRawData);

    setStep('HEADER_MASTER');
  };

  const handleReset = () => {
    if (confirm('最初からやり直しますか？現在の作業内容は失われます。')) {
      setStep('UPLOAD');
      setMasterFiles([]);
      setComparisonFiles([]);
      setParsedMasterData([]);
      setParsedComparisonData([]);
      setMasterRawData([]);
      setComparisonRawData([]);
      setMasterHeaders([]);
      setComparisonHeaders([]);
      setMasterRowIndices([]);
      setComparisonRowIndices([]);
      setActivePreviewFileIndex(null);
      setResults([]);
    }
  };

  const currentStepIndex = STEPS.findIndex(s => s.id === step);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 flex-shrink-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">データ照合ツール</h1>
          </div>
          {step !== 'UPLOAD' && (
            <button
              onClick={handleReset}
              className="text-sm text-slate-500 hover:text-red-600 transition-colors font-medium"
            >
              最初からやり直す
            </button>
          )}
        </div>
      </header>

      {/* Stepper */}
      <div className="bg-white border-b border-slate-200 py-4 hidden md:block">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between relative">
            {/* Connector Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-10" />

            {STEPS.map((s, idx) => {
              const isActive = idx === currentStepIndex;
              const isCompleted = idx < currentStepIndex;

              return (
                <div key={s.id} className="flex flex-col items-center gap-2 bg-white px-2">
                  <div className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2",
                    isActive ? "border-indigo-600 bg-indigo-600 text-white scale-110 shadow-md" :
                      isCompleted ? "border-indigo-600 bg-white text-indigo-600" :
                        "border-slate-200 bg-white text-slate-400"
                  )}>
                    {isCompleted ? <Check className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span className={clsx(
                    "text-xs font-medium transition-colors",
                    isActive ? "text-indigo-600" :
                      isCompleted ? "text-indigo-600" : "text-slate-400"
                  )}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden flex flex-col">
        {step === 'UPLOAD' && (
          <div className="max-w-3xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3 mb-8">
              <h2 className="text-3xl font-bold text-slate-900">ファイルをアップロード</h2>
              <p className="text-slate-500 text-lg">照合したい2つのExcelまたはCSVファイルを選択してください。</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FileUpload
                label="マスターデータ (正)"
                subLabel="人事システム等の信頼できるデータ"
                files={masterFiles}
                onFilesSelect={(f) => handleFileUpload(f, 'master')}
                onClear={() => {
                  setMasterFiles([]);
                  setParsedMasterData([]);
                }}
                color="blue"
              />
              <FileUpload
                label="照合データ (副)"
                subLabel="銀行振込ファイル等のチェック対象"
                files={comparisonFiles}
                onFilesSelect={(f) => handleFileUpload(f, 'comparison')}
                onClear={() => {
                  setComparisonFiles([]);
                  setParsedComparisonData([]);
                }}
                color="emerald"
              />
            </div>

            <div className="flex justify-center pt-8">
              <button
                onClick={startProcess}
                disabled={masterFiles.length === 0 || comparisonFiles.length === 0}
                className={clsx(
                  "px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-3 text-lg",
                  masterFiles.length > 0 && comparisonFiles.length > 0
                    ? "bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1"
                    : "bg-slate-300 cursor-not-allowed"
                )}
              >
                設定へ進む <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {step === 'SHEET_SELECT' && (
          <SheetSelector
            masterFiles={masterFiles}
            masterParsedData={parsedMasterData}
            comparisonFiles={comparisonFiles}
            comparisonParsedData={parsedComparisonData}
            onConfirm={handleSheetConfirm}
            onBack={() => setStep('UPLOAD')}
          />
        )}

        {step === 'HEADER_MASTER' && (
          <DataIngestion
            title={`マスターデータ (正) - ${masterFiles.length}ファイル`}
            data={masterRawData[0] || []}
            onConfirm={(idx, headers) => handleHeaderConfirm('master', idx, headers)}
            onCancel={() => setStep('SHEET_SELECT')}
          />
        )}

        {step === 'REVIEW_MASTER' && activePreviewFileIndex === null && (
          <HeaderReview
            title="マスターデータ (正)"
            files={masterFiles}
            rowIndices={masterRowIndices}
            onEdit={setActivePreviewFileIndex}
            onConfirm={() => processMasterData(masterRowIndices, masterHeaders)}
            onBack={() => setStep('HEADER_MASTER')}
          />
        )}

        {step === 'REVIEW_MASTER' && activePreviewFileIndex !== null && (
          <DataIngestion
            title={`マスターデータ (正) - ${masterFiles[activePreviewFileIndex].name}`}
            data={masterRawData[activePreviewFileIndex] || []}
            // Use existing header/index or default?
            // Ideally should highlight current selection. DataIngestion doesn't support forcing selection yet easily,
            // but we can just let user pick.
            onConfirm={(idx) => handleHeaderConfirm('master', idx, masterHeaders)} // Headers shouldn't change, but we pass them back
            onCancel={() => setActivePreviewFileIndex(null)}
          />
        )}

        {step === 'HEADER_COMPARISON' && (
          <DataIngestion
            title={`照合データ (副) - ${comparisonFiles.length}ファイル`}
            data={comparisonRawData[0] || []}
            onConfirm={(idx, headers) => handleHeaderConfirm('comparison', idx, headers)}
            onCancel={() => setStep('HEADER_MASTER')}
          />
        )}

        {step === 'REVIEW_COMPARISON' && activePreviewFileIndex === null && (
          <HeaderReview
            title="照合データ (副)"
            files={comparisonFiles}
            rowIndices={comparisonRowIndices}
            onEdit={setActivePreviewFileIndex}
            onConfirm={() => processComparisonData(comparisonRowIndices, comparisonHeaders)}
            onBack={() => setStep('HEADER_COMPARISON')}
          />
        )}

        {step === 'REVIEW_COMPARISON' && activePreviewFileIndex !== null && (
          <DataIngestion
            title={`照合データ (副) - ${comparisonFiles[activePreviewFileIndex].name}`}
            data={comparisonRawData[activePreviewFileIndex] || []}
            onConfirm={(idx) => handleHeaderConfirm('comparison', idx, comparisonHeaders)}
            onCancel={() => setActivePreviewFileIndex(null)}
          />
        )}

        {step === 'MAPPING' && (
          <ColumnMapper
            masterHeaders={masterHeaders}
            comparisonHeaders={comparisonHeaders}
            onConfirm={handleMappingConfirm}
            onBack={() => setStep('HEADER_COMPARISON')}
          />
        )}

        {step === 'RESULTS' && (
          <VerificationDashboard
            results={results}
            onUpdateResults={setResults}
            onReset={handleReset}
            onBack={() => setStep('MAPPING')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
