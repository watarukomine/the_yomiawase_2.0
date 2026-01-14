import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { clsx } from 'clsx';
import type { SheetData } from '../utils/excelParser';

interface SheetSelectorProps {
    masterFiles: File[];
    masterParsedData: SheetData[][];
    comparisonFiles: File[];
    comparisonParsedData: SheetData[][];
    onConfirm: (
        masterSelection: { fileIndex: number, sheetIndex: number }[],
        comparisonSelection: { fileIndex: number, sheetIndex: number }[]
    ) => void;
    onBack: () => void;
}

export const SheetSelector: React.FC<SheetSelectorProps> = ({
    masterFiles,
    masterParsedData,
    comparisonFiles,
    comparisonParsedData,
    onConfirm,
    onBack
}) => {
    // State to store selected sheet index for each file.
    // Init with defaults (0-th sheet for all)
    const [masterSelections, setMasterSelections] = useState<number[]>([]);
    const [comparisonSelections, setComparisonSelections] = useState<number[]>([]);

    useEffect(() => {
        // Initialize selections with 0 if not set
        if (masterSelections.length === 0 && masterFiles.length > 0) {
            setMasterSelections(new Array(masterFiles.length).fill(0));
        }
        if (comparisonSelections.length === 0 && comparisonFiles.length > 0) {
            setComparisonSelections(new Array(comparisonFiles.length).fill(0));
        }
    }, [masterFiles, comparisonFiles]);

    const handleSelect = (type: 'master' | 'comparison', fileIndex: number, sheetIndex: number) => {
        if (type === 'master') {
            const newSels = [...masterSelections];
            newSels[fileIndex] = sheetIndex;
            setMasterSelections(newSels);
        } else {
            const newSels = [...comparisonSelections];
            newSels[fileIndex] = sheetIndex;
            setComparisonSelections(newSels);
        }
    };

    const handleConfirm = () => {
        const masterResult = masterSelections.map((sheetIndex, fileIndex) => ({
            fileIndex,
            sheetIndex
        }));
        const comparisonResult = comparisonSelections.map((sheetIndex, fileIndex) => ({
            fileIndex,
            sheetIndex
        }));
        onConfirm(masterResult, comparisonResult);
    };

    const renderFileList = (
        type: 'master' | 'comparison',
        files: File[],
        parsedData: SheetData[][],
        selections: number[]
    ) => {
        const title = type === 'master' ? 'マスターデータ (正)' : '照合データ (副)';
        const colorClass = type === 'master' ? 'border-blue-200 bg-blue-50' : 'border-emerald-200 bg-emerald-50';
        const iconColor = type === 'master' ? 'text-blue-600' : 'text-emerald-600';

        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                    <Layers className={clsx("w-5 h-5", iconColor)} />
                    <h3 className="font-bold text-slate-700">{title}</h3>
                </div>

                {files.map((file, fileIdx) => {
                    const sheets = parsedData[fileIdx] || [];
                    const selectedSheetIdx = selections[fileIdx] ?? 0;

                    return (
                        <div key={fileIdx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className={clsx("px-4 py-3 border-b flex items-center gap-2", colorClass)}>
                                <FileSpreadsheet className={clsx("w-4 h-4", iconColor)} />
                                <span className="font-bold text-slate-800 text-sm">{file.name}</span>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {sheets.map((sheet, sheetIdx) => {
                                    const isSelected = selectedSheetIdx === sheetIdx;
                                    // Preview info: row count
                                    const rowCount = sheet.data.length;

                                    return (
                                        <label
                                            key={sheetIdx}
                                            className={clsx(
                                                "flex items-center justify-between px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50",
                                                isSelected && "bg-slate-50"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex items-center justify-center w-5 h-5">
                                                    <input
                                                        type="radio"
                                                        name={`${type}-file-${fileIdx}`}
                                                        checked={isSelected}
                                                        onChange={() => handleSelect(type, fileIdx, sheetIdx)}
                                                        className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-full checked:border-indigo-600 checked:bg-indigo-600 transition-all"
                                                    />
                                                    <div className="absolute w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                </div>
                                                <div>
                                                    <p className={clsx("text-sm font-medium", isSelected ? "text-slate-900" : "text-slate-600")}>
                                                        {sheet.name}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {rowCount} 行のデータ
                                                    </p>
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <div className="text-indigo-600 text-xs font-bold px-2 py-1 bg-indigo-50 rounded">
                                                    選択中
                                                </div>
                                            )}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-bold text-slate-900">使用するシートを選択</h2>
                <p className="text-slate-500 text-sm">
                    アップロードされたファイルに含まれるシート一覧です。<br />
                    照合に使用するシートをそれぞれ選択してください。
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-24">
                {renderFileList('master', masterFiles, masterParsedData, masterSelections)}
                {renderFileList('comparison', comparisonFiles, comparisonParsedData, comparisonSelections)}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-center gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
                <button
                    onClick={onBack}
                    className="px-6 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors"
                >
                    戻る
                </button>
                <button
                    onClick={handleConfirm}
                    className="px-8 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2"
                >
                    <CheckCircle2 className="w-5 h-5" />
                    シートを確定して次へ
                </button>
            </div>
        </div>
    );
};
