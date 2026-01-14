import React, { useState, useMemo } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Search, Check, Download, RotateCcw, FileSpreadsheet, KeyRound } from 'lucide-react';
import { clsx } from 'clsx';
import type { ReconciliationResult } from '../utils/reconciliation';
import * as XLSX from 'xlsx';

interface VerificationDashboardProps {
    results: ReconciliationResult[];
    onUpdateResults: (newResults: ReconciliationResult[]) => void;
    onReset: () => void;
    onSheetReset: () => void;
    onBack: () => void;
}

export const VerificationDashboard: React.FC<VerificationDashboardProps> = ({
    results,
    onUpdateResults,
    onReset,
    onSheetReset,
    onBack
}) => {
    const [filter, setFilter] = useState<'ALL' | 'MISMATCH' | 'MISSING' | 'DUPLICATE' | 'VERIFIED'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const stats = useMemo(() => {
        return {
            total: results.length,
            matched: results.filter(r => r.status === 'MATCH').length,
            mismatched: results.filter(r => r.status === 'MISMATCH').length,
            missing: results.filter(r => r.status.startsWith('MISSING')).length,
            duplicate: results.filter(r => r.status.startsWith('DUPLICATE')).length,
            verified: results.filter(r => r.isVerified).length,
        };
    }, [results]);

    const filteredResults = useMemo(() => {
        return results.filter(r => {
            const matchesSearch = r.key.toLowerCase().includes(searchTerm.toLowerCase());
            if (!matchesSearch) return false;

            if (filter === 'ALL') return true;
            if (filter === 'VERIFIED') return r.isVerified;
            if (filter === 'MISMATCH') return r.status === 'MISMATCH';
            if (filter === 'MISSING') return r.status.startsWith('MISSING');
            if (filter === 'DUPLICATE') return r.status.startsWith('DUPLICATE');
            return true;
        });
    }, [results, filter, searchTerm]);

    const toggleVerify = (key: string) => {
        const newResults = results.map(r =>
            r.key === key ? { ...r, isVerified: !r.isVerified } : r
        );
        onUpdateResults(newResults);
    };

    const handleExport = () => {
        const exportData = results.map(r => {
            const row: any = {
                Key: r.key,
                Status: r.status,
                Verified: r.isVerified ? 'Yes' : 'No',
            };

            r.diffs.forEach(d => {
                row[`${d.columnName} (Master)`] = d.masterValue;
                row[`${d.columnName} (Comparison)`] = d.comparisonValue;
                row[`${d.columnName} (Match)`] = d.isMatch ? 'Yes' : 'No';
            });

            return row;
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reconciliation Results");
        XLSX.writeFile(wb, "reconciliation_report.xlsx");
    };

    return (
        <div className="space-y-6 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 sm:pb-0">
            {/* Sticky Header Wrapper (Summary Cards + Toolbar) */}
            <div className="sticky top-16 z-20 bg-slate-50 pb-2 -mt-2 pt-2 mb-2 shadow-sm border-b border-slate-100/50">
                {/* Summary Cards Section */}
                <div className="bg-slate-50 space-y-4 pt-1 pb-2 px-1">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-sm text-slate-500 font-medium">全データ件数</p>
                            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 top-0 p-3 opacity-10">
                                <XCircle className="w-16 h-16 text-red-500" />
                            </div>
                            <p className="text-sm text-red-600 font-bold">不一致 (要確認)</p>
                            <p className="text-3xl font-bold text-red-700 mt-1">{stats.mismatched}</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-amber-100 shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 top-0 p-3 opacity-10">
                                <AlertTriangle className="w-16 h-16 text-amber-500" />
                            </div>
                            <p className="text-sm text-amber-600 font-bold">欠落データ</p>
                            <p className="text-3xl font-bold text-amber-700 mt-1">{stats.missing}</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 top-0 p-3 opacity-10">
                                <KeyRound className="w-16 h-16 text-purple-500" />
                            </div>
                            <p className="text-sm text-purple-600 font-bold">重複キー</p>
                            <p className="text-3xl font-bold text-purple-700 mt-1">{stats.duplicate}</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 top-0 p-3 opacity-10">
                                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                            </div>
                            <p className="text-sm text-emerald-600 font-bold">一致 / 確認済</p>
                            <p className="text-3xl font-bold text-emerald-700 mt-1">{stats.verified + stats.matched}</p>
                        </div>
                    </div>
                </div>

                {/* Toolbar Section */}
                <div className="bg-slate-50 pb-1">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                            {[
                                { id: 'ALL', label: 'すべて' },
                                { id: 'MISMATCH', label: '不一致のみ' },
                                { id: 'MISSING', label: '欠落のみ' },
                                { id: 'DUPLICATE', label: '重複のみ' },
                                { id: 'VERIFIED', label: '確認済み' }
                            ].map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilter(f.id as any)}
                                    className={clsx(
                                        "px-4 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap",
                                        filter === f.id
                                            ? "bg-slate-800 text-white shadow-md"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    )}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="キー項目で検索..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-colors"
                                />
                            </div>
                            <button
                                onClick={onBack}
                                className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                            >
                                <RotateCcw className="w-4 h-4 rotate-180" />
                                列設定に戻る
                            </button>
                            <button
                                onClick={onSheetReset}
                                className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                シート選択からやり直す
                            </button>
                            <button
                                onClick={onReset}
                                className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                            >
                                <RotateCcw className="w-4 h-4" />
                                最初から
                            </button>
                            <button
                                onClick={handleExport}
                                className="px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                            >
                                <Download className="w-4 h-4" />
                                結果を出力
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-auto bg-white rounded-xl border border-slate-200 shadow-sm min-h-0">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium z-10 shadow-sm border-b border-slate-200">
                        <tr>
                            <th className="p-4 w-20 text-center">確認</th>
                            <th className="p-4">キー項目</th>
                            <th className="p-4">ステータス</th>
                            <th className="p-4">詳細 (マスター vs 照合データ)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredResults.map((result) => (
                            <tr
                                key={result.key}
                                className={clsx(
                                    "hover:bg-slate-50 transition-colors",
                                    result.isVerified ? "bg-emerald-50/30" : ""
                                )}
                            >
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => toggleVerify(result.key)}
                                        className={clsx(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
                                            result.isVerified
                                                ? "bg-emerald-500 text-white shadow-sm scale-105"
                                                : "bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-400"
                                        )}
                                        title={result.isVerified ? "確認済みを解除" : "確認済みにする"}
                                    >
                                        <Check className="w-6 h-6" />
                                    </button>
                                </td>
                                <td className="p-4 font-bold text-slate-700 text-base">{result.key}</td>
                                <td className="p-4">
                                    <span className={clsx(
                                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm",
                                        result.status === 'MATCH' && "bg-emerald-100 text-emerald-700",
                                        result.status === 'MISMATCH' && "bg-red-100 text-red-700",
                                        result.status.startsWith('MISSING') && "bg-amber-100 text-amber-700",
                                        result.status.startsWith('DUPLICATE') && "bg-purple-100 text-purple-700",
                                    )}>
                                        {result.status === 'MATCH' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                        {result.status === 'MISMATCH' && <XCircle className="w-3.5 h-3.5" />}
                                        {result.status.startsWith('MISSING') && <AlertTriangle className="w-3.5 h-3.5" />}
                                        {result.status.startsWith('DUPLICATE') && <KeyRound className="w-3.5 h-3.5" />}
                                        {result.status === 'MATCH' && '一致'}
                                        {result.status === 'MISMATCH' && '不一致'}
                                        {result.status === 'MISSING_IN_COMPARISON' && '照合データに無し'}
                                        {result.status === 'MISSING_IN_MASTER' && 'マスターに無し'}
                                        {result.status === 'DUPLICATE_IN_MASTER' && 'マスターでキー重複'}
                                        {result.status === 'DUPLICATE_IN_COMPARISON' && '照合データでキー重複'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {result.status === 'MISMATCH' && (
                                        <div className="space-y-2 bg-red-50/50 p-3 rounded-lg border border-red-100">
                                            {result.diffs.filter(d => !d.isMatch).map((diff, idx) => (
                                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                                                    <span className="text-slate-500 font-medium min-w-[100px]" title={diff.columnName}>{diff.columnName}:</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="bg-white text-red-700 px-2 py-1 rounded border border-red-200 line-through decoration-red-300 opacity-70">
                                                            {String(diff.masterValue ?? '(空)')}
                                                        </span>
                                                        <span className="text-slate-400">→</span>
                                                        <span className="bg-white text-emerald-700 px-2 py-1 rounded border border-emerald-200 font-bold shadow-sm">
                                                            {String(diff.comparisonValue ?? '(空)')}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {result.status.startsWith('DUPLICATE') && (
                                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 text-xs text-purple-800">
                                            <p className="font-bold mb-1">重複行 ({result.duplicateRows?.length || 0}件):</p>
                                            <p>データ処理設定で「重複として出力」が選ばれました。 元データを修正するか、合算設定を利用してください。</p>
                                        </div>
                                    )}
                                    {result.status === 'MATCH' && <span className="text-slate-400 text-sm">すべての項目が一致しています</span>}
                                    {result.status === 'MISSING_IN_COMPARISON' && <span className="text-slate-400 text-sm">照合データに行が存在しません</span>}
                                    {result.status === 'MISSING_IN_MASTER' && <span className="text-slate-400 text-sm">マスターデータに行が存在しません</span>}
                                </td>
                            </tr>
                        ))}
                        {filteredResults.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-12 text-center text-slate-400">
                                    <p className="text-lg font-medium">該当するデータがありません</p>
                                    <p className="text-sm mt-1">検索条件やフィルターを変更してみてください</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
