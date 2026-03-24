import React from 'react';
import { Plus, Trash2, RefreshCw, Check, X } from 'lucide-react';
import { Worklog } from '@/lib/mockData';

interface PaymentReviewProps {
  selectedWorklogs: Worklog[];
  totalAmount: number;
  freelancerCount: number;
  entryCount: number;
  excludedWorklogIds: string[];
  excludedFreelancerIds: string[];
  onExcludeWorklog: (id: string) => void;
  onIncludeWorklog: (id: string) => void;
  onExcludeFreelancer: (id: string) => void;
  onIncludeFreelancer: (id: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PaymentReview: React.FC<PaymentReviewProps> = ({
  selectedWorklogs,
  totalAmount,
  freelancerCount,
  entryCount,
  excludedWorklogIds,
  excludedFreelancerIds,
  onExcludeWorklog,
  onIncludeWorklog,
  onExcludeFreelancer,
  onIncludeFreelancer,
  onConfirm,
  onCancel
}) => {
  const includeCount = selectedWorklogs.length - excludedWorklogIds.length;
  const includedWorklogs = selectedWorklogs.filter(
    w => !excludedWorklogIds.includes(w.id) && !excludedFreelancerIds.includes(w.freelancerId)
  );
  const excludedWorklogs = selectedWorklogs.filter(
    w => excludedWorklogIds.includes(w.id) || excludedFreelancerIds.includes(w.freelancerId)
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">Payment Review</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Review and confirm payment details before processing</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-xl p-5 border border-blue-100 dark:border-blue-800">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Amount</p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">${totalAmount.toFixed(2)}</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-xl p-5 border border-green-100 dark:border-green-800">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Freelancers</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{freelancerCount}</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 rounded-xl p-5 border border-purple-100 dark:border-purple-800">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Time Entries</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{entryCount}</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900 dark:to-yellow-900 rounded-xl p-5 border border-orange-100 dark:border-orange-800">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Worklogs</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">{includeCount}</p>
          </div>
        </div>
        
        <div className="border-t-2 border-gray-200 dark:border-slate-700 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded"></div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Included Worklogs</h3>
                <span className="ml-auto bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-sm font-semibold px-3 py-1 rounded-full">{includedWorklogs.length}</span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {includedWorklogs.map(w => (
                  <div key={w.id} className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 p-4 rounded-lg border border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{w.freelancer?.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{w.task?.name}</p>
                      </div>
                      <span className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 font-bold text-sm px-3 py-1 rounded-full">
                        ${w.totalEarnings.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                      <button
                        onClick={() => onExcludeWorklog(w.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 py-1 px-2 rounded transition"
                        aria-label={`Exclude worklog for ${w.freelancer?.name}`}
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                      <button
                        onClick={() => onExcludeFreelancer(w.freelancerId)}
                        className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900 py-1 px-2 rounded transition"
                        aria-label={`Exclude freelancer ${w.freelancer?.name}`}
                      >
                        🚫 Exclude
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-pink-500 rounded"></div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Excluded Worklogs</h3>
                <span className="ml-auto bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 text-sm font-semibold px-3 py-1 rounded-full">{excludedWorklogs.length}</span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {excludedWorklogs.map(w => (
                  <div key={w.id} className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900 dark:to-pink-900 p-4 rounded-lg border border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{w.freelancer?.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{w.task?.name}</p>
                      </div>
                      <span className="bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 font-bold text-sm px-3 py-1 rounded-full">
                        ${w.totalEarnings.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-red-200 dark:border-red-700">
                      <button
                        onClick={() => onIncludeWorklog(w.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 py-1 px-2 rounded transition"
                        aria-label={`Include worklog for ${w.freelancer?.name}`}
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </button>
                      {excludedFreelancerIds.includes(w.freelancerId) && (
                        <button
                          onClick={() => onIncludeFreelancer(w.freelancerId)}
                          className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 py-1 px-2 rounded transition"
                          aria-label={`Include freelancer ${w.freelancer?.name}`}
                        >
                          <RefreshCw className="w-3 h-3" />
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onConfirm}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 dark:from-green-600 dark:to-emerald-600 dark:hover:from-green-700 dark:hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Check className="w-5 h-5" />
            Confirm Payment
          </button>
          
          <button
            onClick={onCancel}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 dark:from-gray-600 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-800 text-gray-900 dark:text-white font-bold py-4 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
