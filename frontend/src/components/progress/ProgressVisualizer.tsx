import React from "react";
import { ProgressEntry } from "../../types/progress.ts";
import { BarChart3, TrendingUp, Info } from "lucide-react";
import { formatDateStr } from "../../lib/utils.ts";

export const ProgressVisualizer: React.FC<{ entries: ProgressEntry[] }> = ({
  entries,
}) => {
  if (!entries || entries.length === 0) return null;

  // Category tally
  const categoryCounts: Record<string, number> = {};
  entries.forEach((e) => {
    categoryCounts[e.careType] = (categoryCounts[e.careType] || 0) + 1;
  });

  // Chronological entries for line chart
  const sorted = [...entries].sort(
    (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  );

  return (
    <div className="rounded-3xl bg-white border border-[#E7EBE7] p-6 shadow-2xs mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-[#17211D] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#183C32]" />
            <span>Progress Journey Observations</span>
          </h3>
          <p className="text-xs text-[#75817A]">
            Self-recorded condition ratings and category distribution
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trend visualizer */}
        <div className="bg-[#F8F9F6] p-4 rounded-2xl border border-[#E7EBE7]">
          <span className="text-xs font-semibold text-[#17211D] block mb-3">
            Condition Score Over Time (1-10)
          </span>

          {sorted.length > 1 ? (
            <div className="space-y-2">
              <div className="h-32 flex items-end gap-2 pt-4 px-2">
                {sorted.map((item, idx) => {
                  const score = item.metrics?.scale || 6;
                  const heightPercent = Math.max(15, (score / 10) * 100);

                  return (
                    <div
                      key={item.id || idx}
                      className="flex-1 flex flex-col items-center gap-1 group relative"
                    >
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-black text-white text-[10px] px-2 py-0.5 rounded pointer-events-none whitespace-nowrap z-10 font-mono">
                        {score}/10: {item.condition || item.careType}
                      </div>

                      <div
                        className="w-full bg-[#183C32] rounded-t-lg transition-all group-hover:bg-emerald-600 shadow-2xs"
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-[10px] text-[#75817A] truncate max-w-[50px] font-mono">
                        {formatDateStr(item.entryDate).split(",")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-xs text-[#75817A]">
              Add 2 or more entries to see your trend curve
            </div>
          )}
        </div>

        {/* Category distribution */}
        <div className="bg-[#F8F9F6] p-4 rounded-2xl border border-[#E7EBE7] flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-[#17211D] block mb-3">
              Observations by Category
            </span>
            <div className="space-y-2.5">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const percent = Math.round((count / entries.length) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#17211D]">{cat} Care</span>
                      <span className="text-[#75817A] font-mono">
                        {count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-[#E7EBE7]">
                      <div
                        className="bg-[#183C32] h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E7EBE7] flex items-center gap-1.5 text-[10px] text-[#75817A]">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>These trends reflect your personal logged observations.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
