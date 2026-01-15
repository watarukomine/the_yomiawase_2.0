import React, { useState } from 'react';
import { ArrowRightLeft, Check, KeyRound, TableProperties, Plus, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

interface ColumnMapperProps {
    masterHeaders: string[];
    comparisonHeaders: string[];
    initialConfig?: MappingConfig;
    onConfirm: (mapping: MappingConfig) => void;
    onBack: () => void;
}

export type DuplicateHandlingStrategy = 'OVERWRITE' | 'SUM' | 'FLAG';

export interface MappingConfig {
    masterKey: string;
    comparisonKey: string;
    valueColumns: { master: string; comparison: string }[];
    treatMissingAsZero?: boolean;
    ignoreWhitespace?: boolean;
    duplicateHandling: DuplicateHandlingStrategy;
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
    masterHeaders,
    comparisonHeaders,
    initialConfig,
    onConfirm,
    onBack
}) => {
    const [masterKey, setMasterKey] = useState<string>(initialConfig?.masterKey || '');
    const [comparisonKey, setComparisonKey] = useState<string>(initialConfig?.comparisonKey || '');
    const [valueMappings, setValueMappings] = useState<{ master: string; comparison: string }[]>(initialConfig?.valueColumns || []);
    const [treatMissingAsZero, setTreatMissingAsZero] = useState<boolean>(initialConfig?.treatMissingAsZero || false);
    const [ignoreWhitespace, setIgnoreWhitespace] = useState<boolean>(initialConfig?.ignoreWhitespace ?? true);
    const [duplicateHandling, setDuplicateHandling] = useState<DuplicateHandlingStrategy>(initialConfig?.duplicateHandling || 'FLAG');

    const handleAddValueMapping = () => {
        setValueMappings([...valueMappings, { master: '', comparison: '' }]);
    };

    const updateValueMapping = (index: number, type: 'master' | 'comparison', value: string) => {
        const newMappings = [...valueMappings];
        newMappings[index] = { ...newMappings[index], [type]: value };
        setValueMappings(newMappings);
    };

    const removeValueMapping = (index: number) => {
        setValueMappings(valueMappings.filter((_, i) => i !== index));
    };

    const isValid = masterKey && comparisonKey && valueMappings.length > 0 && valueMappings.every(m => m.master && m.comparison);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full max-h-[800px] animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900">列のマッピング設定</h3>
                <p className="text-sm text-slate-500 mt-1">データを照合するための「キー項目」と、比較したい「値の項目」を選択してください。</p>
            </div>

            <div className="p-8 overflow-auto flex-1 space-y-10">
                {/* Key Selection Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <KeyRound className="w-5 h-5" />
                        </div>
                        <h4>1. キー項目（一意のID）を選択</h4>
                    </div>
                    <p className="text-sm text-slate-500 ml-10">社員番号や氏名など、行を一意に特定できる項目を選んでください。</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-indigo-50/30 rounded-2xl border border-indigo-100 ml-2">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">マスター側のキー</label>
                            <select
                                value={masterKey}
                                onChange={(e) => setMasterKey(e.target.value)}
                                className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                            >
                                <option value="">選択してください...</option>
                                {masterHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">照合データ側のキー</label>
                            <select
                                value={comparisonKey}
                                onChange={(e) => setComparisonKey(e.target.value)}
                                className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                            >
                                <option value="">選択してください...</option>
                                {comparisonHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Value Mapping Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <TableProperties className="w-5 h-5" />
                            </div>
                            <h4>2. 比較する項目を選択</h4>
                        </div>
                        <button
                            onClick={handleAddValueMapping}
                            className="px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            項目を追加
                        </button>
                    </div>

                    <div className="space-y-3 ml-2">
                        {valueMappings.map((mapping, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm group hover:border-emerald-200 transition-colors">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">マスター側の項目</label>
                                    <select
                                        value={mapping.master}
                                        onChange={(e) => updateValueMapping(index, 'master', e.target.value)}
                                        className="w-full rounded-lg border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    >
                                        <option value="">選択...</option>
                                        {masterHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <ArrowRightLeft className="w-5 h-5 text-slate-300 flex-shrink-0 mt-5" />
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">照合データ側の項目</label>
                                    <select
                                        value={mapping.comparison}
                                        onChange={(e) => updateValueMapping(index, 'comparison', e.target.value)}
                                        className="w-full rounded-lg border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    >
                                        <option value="">選択...</option>
                                        {comparisonHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <button
                                    onClick={() => removeValueMapping(index)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all mt-5"
                                    title="削除"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        {valueMappings.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                <p className="text-slate-500 font-medium">比較する項目がまだありません</p>
                                <p className="text-sm text-slate-400 mt-1">右上の「項目を追加」ボタンを押して設定してください</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Duplicate Handling Section */}
                <div className="pt-6 border-t border-slate-100">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-amber-600 font-bold text-lg">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                <TableProperties className="w-5 h-5" />
                            </div>
                            <h4>3. 重複キーの処理方法</h4>
                        </div>
                        <p className="text-sm text-slate-500 ml-10">
                            同じキー（社員番号など）が複数回登場した場合の処理方法を選択してください。
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-2">
                            <label className={clsx(
                                "flex flex-col p-4 rounded-xl border cursor-pointer transition-all",
                                duplicateHandling === 'FLAG'
                                    ? "bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500"
                                    : "bg-white border-slate-200 hover:bg-slate-50"
                            )}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="duplicateHandling"
                                        value="FLAG"
                                        checked={duplicateHandling === 'FLAG'}
                                        onChange={(e) => setDuplicateHandling(e.target.value as DuplicateHandlingStrategy)}
                                        className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                    />
                                    {/* Default is now FLAG, so maybe remove "(デフォルト)" text from Overwrite if present, or add it here? The user just said "Default to Duplicate Output". I will add "(推奨)" (Recommended) or similar if appropriate, but simply reordering is the main request. Let's just reorder for now and keep the "Default" text removed from Overwrite to avoid confusion since FLAG is now the state default. */}
                                    <span className="font-bold text-slate-700">重複として出力 (推奨)</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2 pl-7">
                                    合算せず、すべての行を「重複エラー」として結果に出力します。
                                </p>
                            </label>

                            <label className={clsx(
                                "flex flex-col p-4 rounded-xl border cursor-pointer transition-all",
                                duplicateHandling === 'SUM'
                                    ? "bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500"
                                    : "bg-white border-slate-200 hover:bg-slate-50"
                            )}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="duplicateHandling"
                                        value="SUM"
                                        checked={duplicateHandling === 'SUM'}
                                        onChange={(e) => setDuplicateHandling(e.target.value as DuplicateHandlingStrategy)}
                                        className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                    />
                                    <span className="font-bold text-slate-700">合算する</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2 pl-7">
                                    キーごとに数値項目を合計し、1行にまとめて照合します。
                                </p>
                            </label>

                            <label className={clsx(
                                "flex flex-col p-4 rounded-xl border cursor-pointer transition-all",
                                duplicateHandling === 'OVERWRITE'
                                    ? "bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500"
                                    : "bg-white border-slate-200 hover:bg-slate-50"
                            )}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="duplicateHandling"
                                        value="OVERWRITE"
                                        checked={duplicateHandling === 'OVERWRITE'}
                                        onChange={(e) => setDuplicateHandling(e.target.value as DuplicateHandlingStrategy)}
                                        className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                    />
                                    <span className="font-bold text-slate-700">上書き</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2 pl-7">
                                    後から出てきた行で上書きします。最後の1行のみが有効になります。
                                </p>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                    <label className="flex items-center gap-3 p-4 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                checked={ignoreWhitespace}
                                onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                                className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-slate-700">空白を無視して比較する</span>
                            <p className="text-xs text-slate-500 mt-0.5">「田中 太郎」と「田中太郎」のように、スペースの有無による違いを無視します。</p>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                checked={treatMissingAsZero}
                                onChange={(e) => setTreatMissingAsZero(e.target.checked)}
                                className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-slate-700">数値の不一致の場合、空白を0として扱う</span>
                            <p className="text-xs text-slate-500 mt-0.5">片方が「0」で、もう片方が「空白」の場合に、一致とみなします。</p>
                        </div>
                    </label>
                </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-4">
                <button
                    onClick={onBack}
                    className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                >
                    戻る
                </button>
                <button
                    onClick={() => onConfirm({ masterKey, comparisonKey, valueColumns: valueMappings, treatMissingAsZero, ignoreWhitespace, duplicateHandling })}
                    disabled={!isValid}
                    className={clsx(
                        "px-8 py-3 text-sm font-bold text-white rounded-xl transition-all flex items-center gap-2 shadow-sm",
                        isValid
                            ? "bg-indigo-600 hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5"
                            : "bg-slate-300 cursor-not-allowed"
                    )}
                >
                    <Check className="w-5 h-5" />
                    照合を開始する
                </button>
            </div>
        </div>
    );
};
