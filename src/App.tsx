import { useState } from 'react';
import { FileSpreadsheet, ArrowRight, Check } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { DataIngestion } from './components/DataIngestion';
import { ColumnMapper, type MappingConfig } from './components/ColumnMapper';
import { VerificationDashboard } from './components/VerificationDashboard';
import { parseExcelFile, type RawSheetData } from './utils/excelParser';
import { reconcileData, type ReconciliationResult } from './utils/reconciliation';
import { clsx } from 'clsx';

type Step = 'UPLOAD' | 'HEADER_MASTER' | 'HEADER_COMPARISON' | 'MAPPING' | 'RESULTS';

const STEPS = [
  { id: 'UPLOAD', label: 'ファイル選択' },
  { id: 'HEADER_MASTER', label: 'ヘッダー指定(正)' },
  { id: 'HEADER_COMPARISON', label: 'ヘッダー指定(副)' },
  { id: 'MAPPING', label: '列設定' },
  { id: 'RESULTS', label: '照合結果' },
];

function App() {
  const [step, setStep] = useState<Step>('UPLOAD');

  // File State
  const [masterFile, setMasterFile] = useState<File | null>(null);
  const [comparisonFile, setComparisonFile] = useState<File | null>(null);

  // Data State
  const [masterRawData, setMasterRawData] = useState<RawSheetData>([]);
  const [comparisonRawData, setComparisonRawData] = useState<RawSheetData>([]);

  // Header State
  const [masterHeaders, setMasterHeaders] = useState<string[]>([]);
  const [comparisonHeaders, setComparisonHeaders] = useState<string[]>([]);

  // Results State
  const [results, setResults] = useState<ReconciliationResult[]>([]);

  const handleFileUpload = async (file: File, type: 'master' | 'comparison') => {
    try {
      const data = await parseExcelFile(file);
      if (type === 'master') {
        setMasterFile(file);
        setMasterRawData(data);
      } else {
        setComparisonFile(file);
        setComparisonRawData(data);
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      alert("ファイルの読み込みに失敗しました。もう一度お試しください。");
    }
  };

  const startProcess = () => {
    if (masterFile && comparisonFile) {
      setStep('HEADER_MASTER');
    }
  };

  const handleHeaderConfirm = (type: 'master' | 'comparison', rowIndex: number, headers: string[]) => {
    if (type === 'master') {
      setMasterHeaders(headers);
      const dataRows = masterRawData.slice(rowIndex + 1).map(row => {
        const obj: any = {};
        headers.forEach((h, i) => {
          obj[h] = row[i];
        });
        return obj;
      });
      setMasterProcessedData(dataRows);
      setStep('HEADER_COMPARISON');
    } else {
      setComparisonHeaders(headers);
      const dataRows = comparisonRawData.slice(rowIndex + 1).map(row => {
        const obj: any = {};
        headers.forEach((h, i) => {
          obj[h] = row[i];
        });
        return obj;
      });
      setComparisonProcessedData(dataRows);
      setStep('MAPPING');
    }
  };

  const [masterProcessedData, setMasterProcessedData] = useState<any[]>([]);
  const [comparisonProcessedData, setComparisonProcessedData] = useState<any[]>([]);

  const handleMappingConfirm = (mapping: MappingConfig) => {
    const res = reconcileData(masterProcessedData, comparisonProcessedData, mapping);
    setResults(res);
    setStep('RESULTS');
  };

  const handleReset = () => {
    if (confirm('最初からやり直しますか？現在の作業内容は失われます。')) {
      setStep('UPLOAD');
      setMasterFile(null);
      setComparisonFile(null);
      setMasterRawData([]);
      setComparisonRawData([]);
      setMasterHeaders([]);
      setComparisonHeaders([]);
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
                file={masterFile}
                onFileSelect={(f) => handleFileUpload(f, 'master')}
                onClear={() => setMasterFile(null)}
                color="blue"
              />
              <FileUpload
                label="照合データ (副)"
                subLabel="銀行振込ファイル等のチェック対象"
                file={comparisonFile}
                onFileSelect={(f) => handleFileUpload(f, 'comparison')}
                onClear={() => setComparisonFile(null)}
                color="emerald"
              />
            </div>

            <div className="flex justify-center pt-8">
              <button
                onClick={startProcess}
                disabled={!masterFile || !comparisonFile}
                className={clsx(
                  "px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-3 text-lg",
                  masterFile && comparisonFile
                    ? "bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1"
                    : "bg-slate-300 cursor-not-allowed"
                )}
              >
                設定へ進む <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {step === 'HEADER_MASTER' && (
          <DataIngestion
            title="マスターデータ (正)"
            data={masterRawData}
            onConfirm={(idx, headers) => handleHeaderConfirm('master', idx, headers)}
            onCancel={() => setStep('UPLOAD')}
          />
        )}

        {step === 'HEADER_COMPARISON' && (
          <DataIngestion
            title="照合データ (副)"
            data={comparisonRawData}
            onConfirm={(idx, headers) => handleHeaderConfirm('comparison', idx, headers)}
            onCancel={() => setStep('HEADER_MASTER')}
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
          />
        )}
      </main>
    </div>
  );
}

export default App;
