import { IconUsers, IconFileAnalytics, IconFolder } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { clientService } from '../services/clientService';

export default function CAHome() {
    const [stats, setStats] = useState({
        totalClients: 0,
        pendingApprovals: 0,
        totalFiles: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await clientService.getClients();
                setStats({
                    totalClients: data.results || 0,
                    pendingApprovals: 0, // Placeholder
                    totalFiles: 0 // Placeholder
                });
            } catch (err) {
                console.error('Error fetching stats:', err);
            }
        };
        fetchStats();
    }, []);

    const statData = [
        { title: 'Total Clients', value: stats.totalClients, icon: IconUsers, color: 'text-primary', bg: 'bg-primary/10' },
        { title: 'Pending Approvals', value: stats.pendingApprovals, icon: IconFileAnalytics, color: 'text-orange-500', bg: 'bg-orange-50' },
        { title: 'Total Folders', value: stats.totalFiles, icon: IconFolder, color: 'text-success', bg: 'bg-success-light' },
    ];

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">CA Dashboard</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statData.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.title} className="bg-white p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                    {stat.title}
                                </span>
                                <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>
                                    <Icon size={20} stroke={2.5} />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-gray-900 leading-none">
                                {stat.value}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
