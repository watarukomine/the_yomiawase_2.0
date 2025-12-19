import React, { useCallback } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { clsx } from 'clsx';

interface FileUploadProps {
    label: string;
    subLabel?: string;
    files: File[];
    onFilesSelect: (files: File[]) => void;
    onClear: () => void;
    color?: 'blue' | 'emerald';
}

export const FileUpload: React.FC<FileUploadProps> = ({
    label,
    subLabel,
    files,
    onFilesSelect,
    onClear,
    color = 'blue'
}) => {
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        const validFiles = droppedFiles.filter(f =>
            f.name.endsWith('.xlsx') || f.name.endsWith('.csv') || f.name.endsWith('.xls')
        );

        if (validFiles.length > 0) {
            onFilesSelect(validFiles);
        }
    }, [onFilesSelect]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesSelect(Array.from(e.target.files));
        }
    };

    const themeColor = color === 'blue' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700';
    const iconColor = color === 'blue' ? 'text-blue-500' : 'text-emerald-500';
    const hoverColor = color === 'blue' ? 'hover:border-blue-400 hover:bg-blue-50/50' : 'hover:border-emerald-400 hover:bg-emerald-50/50';

    return (
        <div className="w-full h-full">
            {files.length === 0 ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className={clsx(
                        "h-full min-h-[200px] border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 group",
                        "border-slate-300 bg-white",
                        hoverColor
                    )}
                >
                    <input
                        type="file"
                        className="hidden"
                        accept=".xlsx,.xls,.csv"
                        multiple
                        onChange={handleChange}
                        id={`file-upload-${label}`}
                    />
                    <label htmlFor={`file-upload-${label}`} className="cursor-pointer flex flex-col items-center justify-center h-full">
                        <div className={clsx(
                            "p-4 rounded-full mb-4 transition-transform group-hover:scale-110 duration-300",
                            color === 'blue' ? "bg-blue-100" : "bg-emerald-100"
                        )}>
                            <Upload className={clsx("w-8 h-8", iconColor)} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{label}</h3>
                        {subLabel && <p className="text-sm text-slate-500 mb-4">{subLabel}</p>}
                        <div className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 group-hover:bg-slate-200 transition-colors">
                            クリックして選択 または ドラッグ＆ドロップ（複数可）
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">対応形式: .xlsx, .xls, .csv</p>
                    </label>
                </div>
            ) : (
                <div className={clsx(
                    "h-full min-h-[200px] flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all relative",
                    themeColor
                )}>
                    <button
                        onClick={onClear}
                        className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-colors"
                        title="ファイルを削除"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="relative mb-4">
                        <FileSpreadsheet className={clsx("w-16 h-16", iconColor)} />
                        <div className="absolute -right-2 -top-2 bg-white rounded-full p-1 shadow-sm">
                            <CheckCircleIcon className={clsx("w-6 h-6", iconColor)} />
                        </div>
                    </div>

                    <div className="text-center w-full">
                        <h3 className="text-lg font-bold mb-1">
                            {files.length}個のファイルを選択中
                        </h3>
                        <div className="max-h-[100px] overflow-y-auto mb-4 text-sm opacity-80 w-full px-4 scrollbar-thin">
                            {files.map((f, i) => (
                                <div key={i} className="truncate" title={f.name}>
                                    {f.name} ({(f.size / 1024).toFixed(1)} KB)
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CheckCircleIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
);
