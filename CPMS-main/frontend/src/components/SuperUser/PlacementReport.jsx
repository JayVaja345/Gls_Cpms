import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Chart from 'chart.js/auto';
import { BASE_URL } from '../../config/backend_url';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function PlacementReport() {
  document.title = 'CPMS | Placement Report';

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallTotal, setOverallTotal] = useState(0);
  const [topCompany, setTopCompany] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  
  // Register Chart.js components we need
  Chart.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

  // table state
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState({ key: 'totalPlaced', dir: 'desc' });

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/admin/placement-report?year=${selectedYear}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        // Use years returned by API if present (distinct years), otherwise infer from returned report
        const years = (res.data.years && Array.isArray(res.data.years) && res.data.years.length > 0)
          ? res.data.years.slice().sort((a, b) => b - a)
          : [...new Set((res.data.placementReport || []).map(r => r.year))].sort((a, b) => b - a);
        setAvailableYears(years);

        // If the selectedYear is not present in available years, set it to the first available and let effect re-run
        if (years.length > 0 && !years.includes(selectedYear)) {
          setSelectedYear(years[0]);
          return; // wait for next fetch with updated year
        }

        setData(res.data.placementReport || []);
        setOverallTotal(res.data.overallTotal || 0);
        setTopCompany(res.data.topCompany || null);
      } catch (err) {
        console.error('PlacementReport.jsx =>', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [selectedYear]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = data.slice();
    if (q) list = list.filter(d => {
      const name = (d.companyName || (d.company && d.company.companyName) || '').toString().toLowerCase();
      return name.includes(q);
    });
    // sort
    list.sort((a, b) => {
      const dir = sortBy.dir === 'asc' ? 1 : -1;
      if (sortBy.key === 'companyName') {
        const an = (a.companyName || (a.company && a.company.companyName) || '');
        const bn = (b.companyName || (b.company && b.company.companyName) || '');
        return dir * an.toString().localeCompare(bn.toString());
      }
      return dir * ((a.totalPlaced || 0) - (b.totalPlaced || 0));
    });
    return list;
  }, [data, query, sortBy]);

  // Prepare chart data based on type
  const getChartData = () => {
    const labels = filtered.map(d => d.companyName || 'Unknown');
    const counts = filtered.map(d => d.totalPlaced || 0);
    const total = counts.reduce((a, b) => a + b, 0);
    const percentages = counts.map(c => ((c / total) * 100).toFixed(1));

    switch (chartType) {
      case 'bar':
        return {
          labels,
          datasets: [{
            label: 'Students Placed',
            data: counts,
            backgroundColor: 'rgba(37,99,235,0.8)'
          }]
        };
      case 'pie':
        return {
          labels,
          datasets: [{
            data: counts,
            backgroundColor: [
              'rgba(37,99,235,0.8)',
              'rgba(59,130,246,0.8)',
              'rgba(147,197,253,0.8)',
              'rgba(191,219,254,0.8)',
              'rgba(219,234,254,0.8)',
            ]
          }]
        };
      case 'percentage':
        return {
          labels,
          datasets: [{
            label: '% of Total Placements',
            data: percentages,
            backgroundColor: 'rgba(37,99,235,0.8)'
          }]
        };
      default:
        return {
          labels,
          datasets: [{
            label: 'Students Placed',
            data: counts,
            backgroundColor: 'rgba(37,99,235,0.8)'
          }]
        };
    }
  };

  // Chart options based on type
  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: false }
      }
    };

    switch (chartType) {
      case 'pie':
        return {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${context.label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        };
      case 'percentage':
        return {
          ...baseOptions,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { callback: value => `${value}%` }
            }
          }
        };
      default:
        return baseOptions;
    }
  };

  const exportCSV = () => {
    const rows = [['Company', 'Placed']];
    filtered.forEach(r => {
      const name = r.companyName || (r.company && r.company.companyName) || 'Unknown';
      rows.push([name, r.totalPlaced || 0]);
    });
    rows.push(['', '']);
    rows.push(['Overall Total', overallTotal]);
    if (topCompany) {
      rows.push(['', '']);
      rows.push(['Top Company', topCompany.companyName || (topCompany.company && topCompany.company.companyName) || '']);
      rows.push(['Top Company Placements', topCompany.totalPlaced]);
    }
    rows.push(['', '']);
    rows.push(['Report Date', new Date().toLocaleString()]);

    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `placement-report-${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102);
    doc.text('Placement Report', doc.internal.pageSize.width/2, 20, { align: 'center' });
    
    // Subtitle with year
    doc.setFontSize(14);
    doc.setTextColor(102, 102, 102);
    doc.text(`Year: ${selectedYear}`, doc.internal.pageSize.width/2, 30, { align: 'center' });
    
    // Summary section
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Report Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 45);
    doc.text(`Total Companies: ${filtered.length}`, 14, 52);
    doc.text(`Total Students Placed: ${overallTotal}`, 14, 59);
    if (topCompany) {
      doc.text(`Top Recruiting Company: ${topCompany.companyName} (${topCompany.totalPlaced} students)`, 14, 66);
    }
    
    // Table
    const body = filtered.map((r, idx) => [
      String(idx + 1), 
      r.companyName || (r.company && r.company.companyName) || 'Unknown', 
      String(r.totalPlaced || 0)
    ]);
    
    doc.autoTable({
      head: [['#', 'Company Name', 'Students Placed']],
      body,
      startY: 75,
      styles: { fontSize: 10 },
      headStyles: { 
        fillColor: [0, 51, 102],
        textColor: 255,
        fontSize: 11,
        halign: 'left'
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 100 },
        2: { cellWidth: 40, halign: 'center' }
      }
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width/2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    doc.save(`placement-report-${selectedYear}.pdf`);
  };

  if (loading) return (
    <div className="flex justify-center h-72 items-center">
      <div className="text-center">
        <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full text-blue-600" />
        <div className="mt-2 text-sm text-gray-600">Loading placement report...</div>
      </div>
    </div>
  );

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-semibold">Placement Report</h2>
          <p className="text-sm text-gray-600 mt-1">Showing placement data for {selectedYear}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
            title="Export data to CSV format"
            aria-label="Export to CSV"
            style={{ boxShadow: '0 6px 18px rgba(16,24,40,0.12)', minWidth: 150, color: '#fff' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium text-white">Export to CSV</span>
          </button>

          <button
            onClick={exportPDF}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
            title="Export data to PDF format"
            aria-label="Export to PDF"
            style={{ boxShadow: '0 6px 18px rgba(16,24,40,0.12)', minWidth: 150, color: '#fff' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium text-white">Export to PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-4 bg-white rounded shadow">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-3xl">📭</div>
              <p className="mt-2 text-gray-600">No placement records found.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <div className="flex space-x-2">
                  <label className="text-sm font-medium my-auto">Year:</label>
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-2">
                  <select 
                    value={chartType} 
                    onChange={(e) => setChartType(e.target.value)}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    <option value="bar">Bar Chart</option>
                    <option value="pie">Pie Chart</option>
                  </select>
                </div>
              </div>
              <div style={{ height: '400px', position: 'relative' }}>
                {chartType === 'pie' ? (
                  <Pie data={getChartData()} options={{ ...getChartOptions(), maintainAspectRatio: false }} />
                ) : (
                  <Bar data={getChartData()} options={{ ...getChartOptions(), maintainAspectRatio: false }} />
                )}
              </div>
            </>
          )}
        </div>

        <div className="p-4 bg-white rounded shadow">
          <div className="mb-4">
            <div className="text-sm text-gray-600">Overall Placed</div>
            <div className="text-2xl font-bold">{overallTotal}</div>
            {topCompany && (
              <div className="mt-2 text-sm text-gray-700">Top Company: <span className="font-medium">{topCompany.companyName}</span> ({topCompany.totalPlaced})</div>
            )}
          </div>

          <div className="mb-3">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search company" className="w-full px-3 py-2 border rounded" />
          </div>

          <div className="overflow-auto max-h-96">
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left cursor-pointer" onClick={() => setSortBy({ key: 'companyName', dir: sortBy.dir === 'asc' ? 'desc' : 'asc' })}>Company</th>
                  <th className="px-4 py-2 text-left cursor-pointer" onClick={() => setSortBy({ key: 'totalPlaced', dir: sortBy.dir === 'asc' ? 'desc' : 'asc' })}>Placed</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <tr key={row.companyId || idx} className="border-t">
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2">{row.companyName || 'Unknown'}</td>
                    <td className="px-4 py-2">{row.totalPlaced}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlacementReport;
