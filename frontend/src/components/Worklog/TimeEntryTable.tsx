import React from 'react';
import { TimeEntry } from '@/lib/mockData';

interface TimeEntryTableProps {
  entries: TimeEntry[];
  freelancerHourlyRate: number;
}

export const TimeEntryTable: React.FC<TimeEntryTableProps> = ({
  entries,
  freelancerHourlyRate
}) => {
  const totalAmount = entries.reduce((sum, e) => sum + (e.hoursLogged * freelancerHourlyRate), 0);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
            <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Hours</th>
            <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Rate/hr</th>
            <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Amount</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {entries.map(entry => (
            <tr key={entry.id}>
              <td className="px-6 py-4 text-sm text-gray-900">
                {new Date(entry.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-sm text-right text-gray-900">{entry.hoursLogged.toFixed(1)}h</td>
              <td className="px-6 py-4 text-sm text-right text-gray-600">${freelancerHourlyRate.toFixed(2)}</td>
              <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                ${(entry.hoursLogged * freelancerHourlyRate).toFixed(2)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{entry.description}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 border-t border-gray-200">
          <tr>
            <td colSpan={2} className="px-6 py-4 text-sm font-medium text-gray-900">
              Total:
            </td>
            <td className="px-6 py-4 text-sm text-right text-gray-900">
              {entries.reduce((sum, e) => sum + e.hoursLogged, 0).toFixed(1)}h
            </td>
            <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">
              ${totalAmount.toFixed(2)}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
