import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Worklog } from '@/lib/mockData';
import { TimeEntryTable } from './TimeEntryTable';

interface WorklogDetailProps {
  worklog: Worklog;
  onBack: () => void;
}

export const WorklogDetail: React.FC<WorklogDetailProps> = ({
  worklog,
  onBack
}) => {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to List
      </button>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent mb-8">Worklog Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Freelancer</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{worklog.freelancer?.name}</p>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-3">{worklog.freelancer?.email || 'No email'}</p>
            <div className="mt-4 bg-white dark:bg-slate-700 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400">Hourly Rate</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">${worklog.freelancer?.hourlyRate.toFixed(2)}/h</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-xl p-6 border border-green-100 dark:border-green-800">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Task</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{worklog.task?.name}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-3">{worklog.task?.description || 'No description'}</p>
            <div className="mt-4 bg-white dark:bg-slate-700 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400">Status</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">✓ Active</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 rounded-xl p-6 border border-purple-100 dark:border-purple-800">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Total Hours</p>
            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{worklog.totalHours.toFixed(1)}h</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">across {worklog.timeEntries.length} entries</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900 dark:to-yellow-900 rounded-xl p-6 border border-orange-100 dark:border-orange-800">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Total Earnings</p>
            <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">${worklog.totalEarnings.toFixed(2)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">calculated amount</p>
          </div>
        </div>
        
        <div className="border-t-2 border-gray-200 dark:border-slate-700 pt-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded"></span>
              Time Entries
              <span className="ml-auto text-lg font-semibold text-gray-500 dark:text-gray-400">({worklog.timeEntries.length})</span>
            </h3>
          </div>
          <TimeEntryTable 
            entries={worklog.timeEntries}
            freelancerHourlyRate={worklog.freelancer?.hourlyRate || 0}
          />
        </div>
      </div>
    </div>
  );
};
