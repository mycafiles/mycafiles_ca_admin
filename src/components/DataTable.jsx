import React from 'react';

const DataTable = ({ columns, data, loading, onRowClick, emptyMessage = 'No data found' }) => {
    if (loading) {
        return (
            <div className="w-full flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-xl border border-[#E5E7EB] shadow-sm">
            <div className="p-2">
                {/* THE FIX: 
                   1. Wrap table in a div.
                   2. Apply rounded-lg and overflow-hidden here.
                   3. This acts as a 'mask', creating perfect round corners for the header.
                */}
                <div className="w-full overflow-hidden rounded-lg border border-gray-200">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                {columns.map((column, idx) => (
                                    <th
                                        key={idx}
                                        className={`px-4 py-4 text-[13px] font-bold text-black capitalize tracking-wider bg-[#F3F4F8] ${column.headerClassName || ''}`}
                                    >
                                        {column.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#F3F4F8] bg-white">
                            {data.length > 0 ? (
                                data.map((row, rowIdx) => (
                                    <tr
                                        key={rowIdx}
                                        className="transition-colors group cursor-pointer hover:bg-gray-50"
                                        onClick={() => onRowClick?.(row)}
                                    >
                                        {columns.map((column, colIdx) => (
                                            <td
                                                key={colIdx}
                                                className={`px-4 py-3.5 text-[13px] text-[#111827] font-medium ${column.className || ''}`}
                                                onClick={(e) => {
                                                    if (column.preventRowClick) e.stopPropagation();
                                                }}
                                            >
                                                {column.render ? column.render(row) : row[column.accessor]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-400 text-sm font-medium">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DataTable;   