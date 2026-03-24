import React from 'react';
import { Eye } from 'lucide-react';
import { Worklog } from '@/lib/mockData';

interface WorklogListProps {
  worklogs: Worklog[];
  selectedIds: string[];
  onSelect: (id: string, checked: boolean) => void;
  onViewDetails: (id: string) => void;
}

export const WorklogList: React.FC<WorklogListProps> = ({
  worklogs,
  selectedIds,
  onSelect,
  onViewDetails
}) => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 border-b-2 border-gray-300 dark:border-slate-600">
          <tr>
            <th className="px-6 py-4 text-left">
              <input
                type="checkbox"
                checked={selectedIds.length === worklogs.length && worklogs.length > 0}
                onChange={(e) => {
                  worklogs.forEach(w => onSelect(w.id, e.target.checked));
                }}
                className="w-5 h-5 rounded border-2 border-gray-300 dark:border-slate-500 text-indigo-600 dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              />
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Freelancer</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Task</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Hours</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Earnings</th>
            <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
          {worklogs.map((worklog, index) => (
            <tr 
              key={worklog.id} 
              className={`transition duration-150 ${
                index % 2 === 0 
                  ? 'hover:bg-indigo-50 dark:hover:bg-slate-700' 
                  : 'bg-gray-50 dark:bg-slate-750 hover:bg-indigo-50 dark:hover:bg-slate-700'
              }`}
            >
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(worklog.id)}
                  onChange={(e) => onSelect(worklog.id, e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-gray-300 dark:border-slate-500 text-indigo-600 dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  aria-label={`Select worklog for ${worklog.freelancer?.name}`}
                />
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{worklog.freelancer?.name}</td>
              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{worklog.task?.name}</td>
              <td className="px-6 py-4 text-sm text-right font-medium text-gray-900 dark:text-white">{worklog.totalHours.toFixed(1)}h</td>
              <td className="px-6 py-4 text-sm text-right">
                <span className="inline-block bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 text-green-700 dark:text-green-300 font-bold px-3 py-1 rounded-full">
                  ${worklog.totalEarnings.toFixed(2)}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => onViewDetails(worklog.id)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition duration-200 hover:shadow-md"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
