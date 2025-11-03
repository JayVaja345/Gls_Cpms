import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config/backend_url';

const StudentExportButton = ({ filters = {}, buttonText = "Export Data", users = [] }) => {
    const [loading, setLoading] = useState(false);
    const [exportType, setExportType] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleExport = async (format) => {
        console.log('Exporting as:', format);
        setLoading(true);
        setExportType(format);
        setIsDropdownOpen(false); // Close dropdown when exporting
        
        try {
            // Convert filters to query parameters
            const queryParams = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== '') {
                    queryParams.append(key, filters[key]);
                }
            });

            const url = `${BASE_URL}/api/export/students/${format}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            console.log('Request URL:', url);

            const response = await axios.get(url, {
                responseType: 'blob',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }
            });
            
            // Create blob link and download
            const urlObject = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = urlObject;
            
            const filename = `students-data.${format}`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(urlObject);
            
        } catch (error) {
            console.error(`${format.toUpperCase()} Export failed:`, error);
            alert(`${format.toUpperCase()} Export failed. Please try again.`);
        } finally {
            setLoading(false);
            setExportType('');
        }
    };

    const toggleDropdown = () => {
        if (!loading) {
            setIsDropdownOpen(!isDropdownOpen);
        }
    };

    return (
        <div className="relative">
            {/* Main Export Button */}
            <button 
                onClick={toggleDropdown}
                className={`
                    inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white transition-all duration-300
                    ${loading 
                        ? 'bg-blue-500 cursor-not-allowed' 
                        : 'bg-green-500 hover:bg-green-600 hover:shadow-lg'
                    }
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                `}
                disabled={loading}
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Exporting {exportType.toUpperCase()}...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>{buttonText}</span>
                        {/* Dropdown arrow */}
                        <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </>
                )}
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && !loading && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <button 
                        onClick={() => handleExport('csv')}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export as CSV
                    </button>
                    <button 
                        onClick={() => handleExport('pdf')}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export as PDF
                    </button>
                </div>
            )}
        </div>
    );
};

export default StudentExportButton;