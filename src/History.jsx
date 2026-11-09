import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const History = ({ sentHistory = [] }) => {
    const [history, setHistory] = useState(Array.isArray(sentHistory) ? sentHistory : [])

    useEffect(() => {
        setHistory(Array.isArray(sentHistory) ? sentHistory : [])
    }, [sentHistory])

    const clearHistory = () => {
        if (window.confirm("Are you sure you want to clear all history?")) {
            setHistory([])
            localStorage.removeItem('sentHistory')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Email History</h1>
                        <p className="text-gray-600">Track all sent email campaigns</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/" className="px-6 py-2 bg-blue-950 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors">
                            Back to Home
                        </Link>
                        {history.length > 0 && (
                            <button onClick={clearHistory} className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
                                Clear History
                            </button>
                        )}
                    </div>
                </div>

                {/* Empty State */}
                {history.length === 0 && (
                    <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002-2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No email history yet</h2>
                        <p className="text-gray-500">Send your first email campaign to see it appear here.</p>
                    </div>
                )}

                {/* History Table */}
                {history.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">{history.length} Campaign(s)</span>
                                <span className="text-sm text-gray-500">{history.reduce((acc, item) => acc + item.recipients, 0)} Total Emails Sent</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">Message Preview</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-900 uppercase tracking-wider text-center">Recipients</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-900 uppercase tracking-wider text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {history.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                {item.date}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={item.message}>
                                                "{item.message}"
                                            </td>
                                            <td className="px-6 py-4 text-sm text-center text-gray-900 font-medium">
                                                {item.recipients}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-center">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination hint for large datasets */}
                        {history.length > 10 && (
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-center">
                                <p className="text-sm text-gray-500">Showing {Math.min(history.length, 10)} of {history.length} records</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default History
