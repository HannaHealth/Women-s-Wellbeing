import React, { useState } from 'react';
import { Download, FileText, FileCog, FilePlus, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useHealthData } from '../../contexts/HealthDataContext';
import toast from 'react-hot-toast';

interface DataExportProps {
  dataType: 'health' | 'nutrition' | 'all';
}

const DataExport: React.FC<DataExportProps> = ({ dataType }) => {
  const { user } = useAuth();
  const { healthMetrics } = useHealthData();
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!user) {
      toast.error('You must be logged in to export data');
      return;
    }

    setExporting(true);
    try {
      let data;
      
      // Determine date range
      let filteredMetrics = [...healthMetrics];
      if (dateRange === 'custom' && startDate && endDate) {
        filteredMetrics = healthMetrics.filter(metric => {
          const metricDate = new Date(metric.date);
          return metricDate >= new Date(startDate) && metricDate <= new Date(endDate);
        });
      } else if (dateRange === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        filteredMetrics = healthMetrics.filter(metric => new Date(metric.date) >= oneMonthAgo);
      } else if (dateRange === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filteredMetrics = healthMetrics.filter(metric => new Date(metric.date) >= oneWeekAgo);
      }
      
      // Format data based on type
      if (dataType === 'health' || dataType === 'all') {
        data = filteredMetrics;
      } else if (dataType === 'nutrition') {
        // Here we would get nutrition data from API or context
        // For now using mock data as placeholder
        data = [
          { date: '2023-01-01', meal_type: 'breakfast', name: 'Oatmeal', calories: 300 },
          { date: '2023-01-01', meal_type: 'lunch', name: 'Salad', calories: 250 },
        ];
      }
      
      // Convert to selected format
      let content;
      let filename;
      let mimeType;
      
      if (exportFormat === 'csv') {
        content = convertToCSV(data);
        filename = `openhanna-${dataType}-data.csv`;
        mimeType = 'text/csv';
      } else if (exportFormat === 'json') {
        content = JSON.stringify(data, null, 2);
        filename = `openhanna-${dataType}-data.json`;
        mimeType = 'application/json';
      } else {
        // PDF export would be more complex and likely require a library
        // Using JSON as fallback
        content = JSON.stringify(data, null, 2);
        filename = `openhanna-${dataType}-data.json`;
        mimeType = 'application/json';
      }
      
      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => {
      return Object.values(row).map(value => {
        // Handle values with commas by wrapping in quotes
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',');
    });
    
    return [headers, ...rows].join('\n');
  };

  return (
    <div>
      <button
        onClick={() => setShowExportModal(true)}
        className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
      >
        <Download className="h-4 w-4 mr-2" />
        Export Data
      </button>
      
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Export Your Data</h2>
                <button 
                  onClick={() => setShowExportModal(false)} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Format
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setExportFormat('csv')}
                      className={`flex flex-col items-center p-3 border rounded-lg ${
                        exportFormat === 'csv' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <FileText className={`h-6 w-6 mb-1 ${exportFormat === 'csv' ? 'text-blue-500' : 'text-gray-500'}`} />
                      <span className={`text-sm font-medium ${exportFormat === 'csv' ? 'text-blue-700' : 'text-gray-700'}`}>CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportFormat('json')}
                      className={`flex flex-col items-center p-3 border rounded-lg ${
                        exportFormat === 'json' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <FileCog className={`h-6 w-6 mb-1 ${exportFormat === 'json' ? 'text-blue-500' : 'text-gray-500'}`} />
                      <span className={`text-sm font-medium ${exportFormat === 'json' ? 'text-blue-700' : 'text-gray-700'}`}>JSON</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportFormat('pdf')}
                      className={`flex flex-col items-center p-3 border rounded-lg ${
                        exportFormat === 'pdf' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <FilePlus className={`h-6 w-6 mb-1 ${exportFormat === 'pdf' ? 'text-blue-500' : 'text-gray-500'}`} />
                      <span className={`text-sm font-medium ${exportFormat === 'pdf' ? 'text-blue-700' : 'text-gray-700'}`}>PDF</span>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="all">All Time</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                
                {dateRange === 'custom' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Privacy note:</span> This data is for your personal use. Consider removing sensitive information before sharing with others.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting || (dateRange === 'custom' && (!startDate || !endDate))}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {exporting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataExport;