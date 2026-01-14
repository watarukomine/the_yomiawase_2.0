import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
interface DataIngestionProps {
    title: string;
    data: any[][];
    onConfirm: (headerRowIndex: number, headers: string[]) => void;
    onCancel: () => void;
}

export const DataIngestion: React.FC<DataIngestionProps> = ({ title, data, onConfirm, onCancel }) => {
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

    // Preview first 10 rows
    const previewData = data.slice(0, 10);

    const handleConfirm = () => {
        if (selectedRowIndex !== null) {
            const headers = data[selectedRowIndex].map((cell: any) => String(cell || ''));
            onConfirm(selectedRowIndex, headers);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300 mb-20">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">{title} のヘッダー行を選択</h3>
                    <p className="text-sm text-slate-500 mt-1">表の「項目名」が書かれている行をクリックして選択してください。</p>
                </div>
                <div className="hidden sm:flex gap-3">
                    {/* Buttons for desktop moved here, but actually we probably want them sticky bottom for mobile too. 
                         Let's keep them here for desktop and duplicate or move to a sticky footer. 
                         For simplicity and consistency, let's keep the desktop buttons here but ensures the whole card scrolls. 
                         Wait, if we want "Next" to be always visible, we should probably use a sticky footer pattern for the main action across all screens 
                         OR just rely on page scrolling as requested. 
                         User said "Show scrollbar if it doesn't fit". 
                         Let's use the local buttons but ensure the page scrolls. 
                      */}
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        戻る
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={selectedRowIndex === null}
                        className={clsx(
                            "px-6 py-2 text-sm font-bold text-white rounded-lg transition-all flex items-center gap-2 shadow-sm",
                            selectedRowIndex !== null
                                ? "bg-indigo-600 hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5"
                                : "bg-slate-300 cursor-not-allowed"
                        )}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        ヘッダーとして確定
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="p-6 bg-slate-50/50 min-w-[600px]">
                    <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
                        <table className="w-full text-sm text-left">
                            <tbody>
                                {previewData.map((row: any[], rowIndex: number) => (
                                    <tr
                                        key={rowIndex}
                                        onClick={() => setSelectedRowIndex(rowIndex)}
                                        className={clsx(
                                            "cursor-pointer transition-all border-b last:border-0",
                                            selectedRowIndex === rowIndex
                                                ? "bg-indigo-50 border-indigo-200 ring-2 ring-inset ring-indigo-500 z-10 relative"
                                                : "hover:bg-slate-50 border-slate-100"
                                        )}
                                    >
                                        <td className="p-4 w-16 text-xs text-slate-400 font-mono select-none bg-slate-50 border-r border-slate-200 text-center">
                                            {rowIndex + 1}
                                        </td>
                                        {row.map((cell: any, cellIndex: number) => (
                                            <td key={cellIndex} className="p-4 text-slate-700 whitespace-nowrap max-w-[200px] truncate border-r border-slate-100 last:border-0">
                                                {String(cell ?? '')}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {data.length > 10 && (
                        <p className="text-center text-xs text-slate-400 mt-6">
                            全 {data.length} 行中、最初の 10 行を表示しています
                        </p>
                    )}
                </div>
            </div>

            {/* Mobile-only sticky footer for actions if needed? 
                Actually the user just wants scrollbars. If the list is long, they scroll down. 
                But if the table is wide, we need overflow-x-auto.
            */}
            <div className="sm:hidden p-4 border-t border-slate-200 bg-white sticky bottom-0 flex justify-end gap-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                >
                    戻る
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={selectedRowIndex === null}
                    className={clsx(
                        "flex-1 px-6 py-2 text-sm font-bold text-white rounded-lg transition-all flex justify-center items-center gap-2 shadow-sm",
                        selectedRowIndex !== null
                            ? "bg-indigo-600 hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5"
                            : "bg-slate-300 cursor-not-allowed"
                    )}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    確定
                </button>
            </div>
        </div>
    );
};
