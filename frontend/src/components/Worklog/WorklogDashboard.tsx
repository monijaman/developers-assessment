import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Worklog } from '@/lib/mockData';
import { WorklogList } from './WorklogList';
import { WorklogDetail } from './WorklogDetail';
import { DateRangeFilter } from './DateRangeFilter';
import { PaymentReview } from './PaymentReview';

type ViewType = 'list' | 'detail' | 'review' | 'confirmed';

export const WorklogDashboard: React.FC = () => {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const defaultEndDate = new Date();
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 14);
  const endDateString = defaultEndDate.toISOString().slice(0, 10);
  const startDateString = defaultStartDate.toISOString().slice(0, 10);

  const [view, setView] = useState<ViewType>('list');
  const [worklogs, setWorklogs] = useState<Worklog[]>([]);
  const [filteredWorklogs, setFilteredWorklogs] = useState<Worklog[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedDetailWorklog, setSelectedDetailWorklog] = useState<Worklog | null>(null);
  const [startDate, setStartDate] = useState<string>(startDateString);
  const [endDate, setEndDate] = useState<string>(endDateString);
  const [excludedWorklogIds, setExcludedWorklogIds] = useState<string[]>([]);
  const [excludedFreelancerIds, setExcludedFreelancerIds] = useState<string[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const mapApiWorklog = (item: any): Worklog => {
    const totalHours = Number(item.total_hours ?? 0);
    const totalEarnings = Number(item.total_earnings ?? 0);
    const hourlyRate = Number(item.freelancer_hourly_rate ?? (totalHours > 0 ? totalEarnings / totalHours : 0));

    return {
      id: String(item.id),
      freelancerId: String(item.freelancer_id),
      taskId: String(item.task_id),
      totalHours,
      totalEarnings,
      freelancer: {
        id: String(item.freelancer_id),
        name: String(item.freelancer_name ?? 'Unknown Freelancer'),
        email: '',
        hourlyRate,
      },
      task: {
        id: String(item.task_id),
        name: String(item.task_name ?? 'Unknown Task'),
        description: '',
      },
      timeEntries: (item.time_entries ?? []).map((entry: any) => ({
        id: String(entry.id),
        worklogId: String(entry.worklog_id),
        date: String(entry.date),
        hoursLogged: Number(entry.hours_logged ?? 0),
        description: entry.description ?? '',
      })),
    };
  };

  const fetchWorklogs = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const endpointUrl = `${apiBase}/api/v1/worklogs?start_date=${encodeURIComponent(`${startDate}T00:00:00`)}&end_date=${encodeURIComponent(`${endDate}T23:59:59`)}`;
      const response = await fetch(endpointUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch worklogs (${response.status})`);
      }
      const data: any = await response.json();
      const mapped: Worklog[] = (data as any[]).map((item: any) => mapApiWorklog(item));
      setWorklogs(mapped);
      setFilteredWorklogs(mapped);
      setCurrentPage(1);
      setSelectedIds((prev) => prev.filter((id) => mapped.some((w) => w.id === id)));
    } catch (fetchError) {
      setError('Failed to load worklogs. Please try again.');
      console.error(fetchError);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorklogDetail = async (worklogId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const endpointUrl = `${apiBase}/api/v1/worklogs/${worklogId}`;
      const response = await fetch(endpointUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch worklog detail (${response.status})`);
      }
      const data: any = await response.json();
      const mapped = mapApiWorklog(data);
      setSelectedDetailWorklog(mapped);
      setView('detail');
    } catch (fetchError) {
      setError('Failed to load worklog details. Please try again.');
      console.error(fetchError);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    void fetchWorklogs();
  }, []);

  const handleSelectWorklog = (id: string, checked: boolean) => {
    setSelectedIds(prev => 
      checked ? [...prev, id] : prev.filter(sid => sid !== id)
    );
  };

  const handleViewDetails = (id: string) => {
    void fetchWorklogDetail(id);
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedDetailWorklog(null);
  };

  const handleGoToReview = () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one worklog');
      return;
    }

    const included = worklogs.filter(
      (w) => selectedIds.includes(w.id)
        && !excludedWorklogIds.includes(w.id)
        && !excludedFreelancerIds.includes(w.freelancerId)
    );
    const summary = {
      totalAmount: included.reduce((acc, w) => acc + w.totalEarnings, 0),
      freelancerCount: new Set(included.map((w) => w.freelancerId)).size,
      entryCount: included.reduce((acc, w) => acc + w.timeEntries.length, 0),
    };
    setPaymentSummary(summary);
    setView('review');
  };

  const handleExcludeWorklog = (id: string) => {
    setExcludedWorklogIds(prev => [...prev, id]);
  };

  const handleIncludeWorklog = (id: string) => {
    setExcludedWorklogIds(prev => prev.filter(eid => eid !== id));
  };

  const handleExcludeFreelancer = (freelancerId: string) => {
    setExcludedFreelancerIds(prev => (
      prev.includes(freelancerId) ? prev : [...prev, freelancerId]
    ));
  };

  const handleIncludeFreelancer = (freelancerId: string) => {
    setExcludedFreelancerIds(prev => prev.filter(id => id !== freelancerId));
  };

  const handleConfirmPayment = async () => {
    try {
      const endpointUrl = `${apiBase}/api/v1/worklogs/payment-batch/confirm`;
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_date: `${startDate}T00:00:00`,
          end_date: `${endDate}T23:59:59`,
          excluded_worklog_ids: excludedWorklogIds,
          excluded_freelancer_ids: excludedFreelancerIds,
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to confirm payment (${response.status})`);
      }

      alert(`Payment confirmed! Total amount: $${paymentSummary.totalAmount.toFixed(2)}`);
      setView('confirmed');
      setTimeout(() => {
        setView('list');
        setSelectedIds([]);
        setExcludedWorklogIds([]);
        setExcludedFreelancerIds([]);
      }, 2000);
    } catch (confirmError) {
      setError('Failed to confirm payment. Please try again.');
      console.error(confirmError);
    }
  };

  const handleCancel = () => {
    setView('list');
  };

  const selectedWorklogs = worklogs.filter(w => selectedIds.includes(w.id));
  const totalRows = filteredWorklogs.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const pageStart = (currentPage - 1) * rowsPerPage;
  const pageEnd = pageStart + rowsPerPage;
  const paginatedWorklogs = filteredWorklogs.slice(pageStart, pageEnd);
  const showingFrom = totalRows === 0 ? 0 : pageStart + 1;
  const showingTo = Math.min(totalRows, pageEnd);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mb-4"></div>
          <p className="text-lg text-gray-700 dark:text-gray-200">Loading worklogs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md border border-gray-200 dark:border-slate-700">
          <div className="text-4xl text-red-500 mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400 mb-6 font-medium">{error}</p>
          <button
            onClick={() => void fetchWorklogs()}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent mb-2">Worklog Payment Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Manage freelancer payments and time entries</p>
        </div>

        {view === 'list' && (
          <>
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onApply={() => {
                void fetchWorklogs();
              }}
            />

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Worklogs</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{filteredWorklogs.length}</span>
                    {' '}worklogs • 
                    <span className="font-semibold text-green-600 dark:text-green-400 ml-1">{selectedIds.length}</span>
                    {' '}selected
                  </p>
                </div>
              </div>

              <WorklogList
                worklogs={paginatedWorklogs}
                selectedIds={selectedIds}
                onSelect={handleSelectWorklog}
                onViewDetails={handleViewDetails}
              />

              <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-t border-gray-200 dark:border-slate-700 pt-6">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Showing <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{showingFrom}-{showingTo}</span> of <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{totalRows}</span>
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="rows-per-page">
                    Rows per page:
                  </label>
                  <select
                    id="rows-per-page"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                  </select>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage <= 1}
                    className="rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition bg-white dark:bg-slate-800 inline-flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>
                  <span className="min-w-20 text-center text-sm font-medium text-gray-900 dark:text-white">
                    <span className="text-indigo-600 dark:text-indigo-400">{currentPage}</span>/<span className="text-gray-500 dark:text-gray-400">{totalPages}</span>
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage >= totalPages}
                    className="rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition bg-white dark:bg-slate-800 inline-flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleGoToReview}
                  disabled={selectedIds.length === 0}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none dark:from-green-600 dark:to-emerald-600 dark:hover:from-green-700 dark:hover:to-emerald-700"
                >
                  <CheckCircle className="w-5 h-5" />
                  Review Payment ({selectedIds.length} selected)
                </button>
              </div>
            </div>
          </>
        )}

        {view === 'detail' && selectedDetailWorklog && (
          <WorklogDetail
            worklog={selectedDetailWorklog}
            onBack={handleBackToList}
          />
        )}

        {view === 'review' && paymentSummary && (
          <PaymentReview
            selectedWorklogs={selectedWorklogs}
            totalAmount={paymentSummary.totalAmount}
            freelancerCount={paymentSummary.freelancerCount}
            entryCount={paymentSummary.entryCount}
            excludedWorklogIds={excludedWorklogIds}
            excludedFreelancerIds={excludedFreelancerIds}
            onExcludeWorklog={handleExcludeWorklog}
            onIncludeWorklog={handleIncludeWorklog}
            onExcludeFreelancer={handleExcludeFreelancer}
            onIncludeFreelancer={handleIncludeFreelancer}
            onConfirm={handleConfirmPayment}
            onCancel={handleCancel}
          />
        )}

        {view === 'confirmed' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-12 text-center max-w-lg mx-auto">
            <div className="text-6xl mb-6 animate-bounce">✅</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent mb-3">Payment Confirmed</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorklogDashboard;
