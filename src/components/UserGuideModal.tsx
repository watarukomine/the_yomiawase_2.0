
import { X, Book, Upload, TableProperties, Settings, CheckCircle2, Download, Table2 } from 'lucide-react';

interface UserGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UserGuideModal({ isOpen, onClose }: UserGuideModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <Book className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">使い方ガイド</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10">

                    {/* Intro */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <p className="text-slate-600 leading-relaxed">
                            このアプリケーションは、2つのデータ（ExcelやCSV）を突き合わせ、差異や欠落を自動でチェックするためのツールです。<br />
                            従来「読み上げ」で行っていた照合確認作業を自動化し、正確かつ高速に完了させることができます。
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="space-y-12">
                        {/* Step 1 */}
                        <div className="flex gap-5">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">1</div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-slate-400" />
                                    ファイルの準備とアップロード
                                </h3>
                                <p className="text-slate-600 leading-relaxed">
                                    まずは照合したい2つのファイルを用意してください。
                                    画面上のアップロードエリアにドラッグ＆ドロップするか、クリックして選択します。<br />
                                    <span className="text-sm text-slate-500 mt-1 block">対応形式: .xlsx (Excel), .csv</span>
                                </p>
                                <ul className="list-disc list-inside text-slate-600 space-y-1 ml-1 bg-white p-3 rounded-lg border border-slate-200 inline-block">
                                    <li><strong>マスターデータ (正)</strong>: 基準となる正しいデータ</li>
                                    <li><strong>照合データ (副)</strong>: チェックしたい対象のデータ</li>
                                </ul>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex gap-5">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">2</div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Table2 className="w-5 h-5 text-slate-400" />
                                    シートの選択 (Excelのみ)
                                </h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Excelファイルをアップロードした場合、どの「シート」を使用するか選択する画面が表示されます。
                                    照合したいデータが含まれているシートを選んで「次へ」をクリックしてください。
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex gap-5">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">3</div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-slate-400" />
                                    列の設定とオプション
                                </h3>
                                <div className="space-y-4 text-slate-600">
                                    <div>
                                        <strong className="text-slate-900 block mb-1">1. キー項目の設定 (必須)</strong>
                                        データを特定するための一意なIDとなる列（品番、社員番号など）をプルダウンから選びます。
                                    </div>
                                    <div>
                                        <strong className="text-slate-900 block mb-1">2. 照合する値の設定 (任意)</strong>
                                        キー以外に、内容が一致しているかチェックしたい列（金額、個数など）があれば追加します。
                                        <div className="mt-2 pl-4 border-l-2 border-indigo-100 space-y-2">
                                            <p className="text-sm">
                                                <span className="font-bold text-slate-700">空白を無視して比較する:</span><br />
                                                「田中 太郎」と「田中太郎」のようなスペースの違いを無視します。
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                                        <strong className="text-indigo-900 block mb-2 flex items-center gap-2">
                                            <TableProperties className="w-4 h-4" />
                                            3. 重複キーの処理方法
                                        </strong>
                                        <ul className="space-y-3 text-sm">
                                            <li className="flex gap-2">
                                                <span className="font-bold text-indigo-700 whitespace-nowrap">重複として出力 (推奨):</span>
                                                <span className="text-slate-600">重複がある行をすべて検出し、「エラー」として結果に表示します。</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="font-bold text-indigo-700 whitespace-nowrap">合算する:</span>
                                                <span className="text-slate-600">同じキーを持つデータの「数値」項目を合計してから照合します。</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="font-bold text-indigo-700 whitespace-nowrap">上書き:</span>
                                                <span className="text-slate-600">後ろにある行のデータを優先し、前のデータを無視します。</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="flex gap-5">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">4</div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-slate-400" />
                                    結果の確認
                                </h3>
                                <p className="text-slate-600 leading-relaxed">
                                    照合結果がダッシュボード形式で表示されます。
                                    画面上部のカードで概要を確認し、下部のリストで詳細をチェックします。
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                                    <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-center font-bold border border-red-100">不一致</div>
                                    <div className="bg-amber-50 text-amber-700 px-3 py-2 rounded-lg text-center font-bold border border-amber-100">欠落</div>
                                    <div className="bg-purple-50 text-purple-700 px-3 py-2 rounded-lg text-center font-bold border border-purple-100">重複</div>
                                    <div className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-center font-bold border border-emerald-100">一致</div>
                                </div>
                            </div>
                        </div>

                        {/* Step 5 */}
                        <div className="flex gap-5">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">5</div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Download className="w-5 h-5 text-slate-400" />
                                    結果の出力
                                </h3>
                                <p className="text-slate-600 leading-relaxed">
                                    確認作業が終わったら、画面右上の「結果を出力」ボタンを押すと、現在の照合結果が Excelファイル (.xlsx) としてダウンロードされます。
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl text-center">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm hover:shadow-md"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
}
