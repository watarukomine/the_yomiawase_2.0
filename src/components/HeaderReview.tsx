import React from 'react';
import { FileSpreadsheet, Edit2, Check, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface HeaderReviewProps {
    title: string;
    files: File[];
    rowIndices: number[];
    onEdit: (fileIndex: number) => void;
    onConfirm: () => void;
    onBack: () => void;
}

export const HeaderReview: React.FC<HeaderReviewProps> = ({
    title,
    files,
    rowIndices,
    onEdit,
    onConfirm,
    onBack
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900">{title} - ヘッダー位置の確認</h3>
                <p className="text-sm text-slate-500 mt-1">
                    各ファイルで検出されたヘッダー行を確認してください。
                    <br />
                    位置が正しくない場合は「修正」ボタンから変更できます。
                </p>
            </div>

            <div className="p-4 sm:p-6 overflow-auto flex-1 min-h-0">
                <div className="space-y-4">
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FileSpreadsheet className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{file.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={clsx(
                                            "text-xs px-2 py-0.5 rounded-full font-medium",
                                            index === 0
                                                ? "bg-slate-100 text-slate-600" // Manual (First file)
                                                : "bg-emerald-100 text-emerald-700" // Auto-detected
                                        )}>
                                            {index === 0 ? "手動指定" : "自動検出"}
                                        </span>
                                        <span className="text-sm text-slate-500">
                                            ヘッダー行: <span className="font-mono font-bold text-slate-700">{rowIndices[index] + 1}</span>行目
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => onEdit(index)}
                                className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1.5"
                            >
                                <Edit2 className="w-4 h-4" />
                                修正
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>
                        注意: データを取り込む開始位置は、指定されたヘッダー行の<strong>次の行</strong>からになります。
                        すべてのファイルのヘッダー行が正しく指定されていることを確認してください。
                    </p>
                </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-4">
                <button
                    onClick={onBack}
                    className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                >
                    戻る
                </button>
                <button
                    onClick={onConfirm}
                    className="px-8 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center gap-2 shadow-sm"
                >
                    <Check className="w-5 h-5" />
                    確定して次へ
                </button>
            </div>
        </div>
    );
};
