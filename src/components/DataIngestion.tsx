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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">{title} のヘッダー行を選択</h3>
                    <p className="text-sm text-slate-500 mt-1">表の「項目名」が書かれている行をクリックして選択してください。</p>
                </div>
                <div className="flex gap-3">
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

            <div className="overflow-auto flex-1 p-6 bg-slate-50/50">
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
    );
};
