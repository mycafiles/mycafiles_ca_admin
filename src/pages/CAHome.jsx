import { IconUsers, IconFileAnalytics, IconFolder, IconPlus, IconUpload, IconPhoto, IconTrendingUp, IconClock } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { clientService } from '../services/clientService';

export default function CAHome() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalClients: 0,
        pendingApprovals: 0,
        totalFiles: 0,
        clientGrowth: 15 // Percentage growth
    });
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState([]);

    // Mock data for client growth chart
    const chartData = [
        { month: 'Aug', clients: 1 },
        { month: 'Sep', clients: 1 },
        { month: 'Oct', clients: 2 },
        { month: 'Nov', clients: 2 },
        { month: 'Dec', clients: 3 },
        { month: 'Jan', clients: 3 },
    ];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await clientService.getClients();
                const clients = data.clients || [];

                setStats({
                    totalClients: data.results || 0,
                    pendingApprovals: 0,
                    totalFiles: 0,
                    clientGrowth: 15
                });

                // Get recent 3 clients
                const recent = clients
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 3)
                    .map(client => ({
                        name: client.name,
                        time: getRelativeTime(client.createdAt),
                        type: client.entityType
                    }));

                setRecentActivity(recent);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching stats:', err);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const getRelativeTime = (date) => {
        const now = new Date();
        const past = new Date(date);
        const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        return new Date(date).toLocaleDateString();
    };

    const statData = [
        {
            title: 'Total Clients',
            value: stats.totalClients,
            icon: IconUsers,
            color: 'text-primary',
            bg: 'bg-primary/10',
            trend: `+${stats.clientGrowth}%`,
            trendColor: 'text-green-600'
        },
        {
            title: 'Pending Approvals',
            value: stats.pendingApprovals,
            icon: IconFileAnalytics,
            color: 'text-orange-500',
            bg: 'bg-orange-50',
            trend: '0',
            trendColor: 'text-gray-500'
        },
        {
            title: 'Total Folders',
            value: stats.totalFiles,
            icon: IconFolder,
            color: 'text-success',
            bg: 'bg-success-light',
            trend: '0',
            trendColor: 'text-gray-500'
        },
    ];

    const quickActions = [
        {
            title: 'Add Client',
            description: 'Register new client',
            icon: IconPlus,
            color: 'bg-primary',
            hoverColor: 'hover:bg-primary/90',
            onClick: () => navigate('/dashboard/clients')
        },
        {
            title: 'Bulk Upload',
            description: 'Import CSV/Excel',
            icon: IconUpload,
            color: 'bg-indigo-600',
            hoverColor: 'hover:bg-indigo-700',
            onClick: () => navigate('/dashboard/clients')
        },
        {
            title: 'Manage Banners',
            description: 'Update app banners',
            icon: IconPhoto,
            color: 'bg-purple-600',
            hoverColor: 'hover:bg-purple-700',
            onClick: () => navigate('/dashboard/banners')
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100
            }
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-border animate-pulse">
                            <div className="h-20"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Welcome Header */}
            <motion.div variants={itemVariants} className="bg-gradient-to-r from-primary/5 to-indigo-50 p-6 rounded-xl border border-primary/20">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Welcome back, {localStorage.getItem('caName') || 'CA Admin'}! 👋
                </h1>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                    <IconClock size={16} />
                    Last login: {new Date().toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </p>
            </motion.div>

            {/* Stats Cards with Trends */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statData.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.title}
                            whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="bg-white p-6 rounded-xl border border-border shadow-sm cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        {stat.title}
                                    </span>
                                    <div className="flex items-baseline gap-2 mt-2">
                                        <div className="text-3xl font-black text-gray-900">
                                            {stat.value}
                                        </div>
                                        {stat.trend !== '0' && (
                                            <span className={`text-sm font-semibold flex items-center gap-1 ${stat.trendColor}`}>
                                                <IconTrendingUp size={14} />
                                                {stat.trend}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <Icon size={24} stroke={2.5} />
                                </div>
                            </div>
                            {stat.trend !== '0' && (
                                <div className="text-xs text-gray-500">vs last month</div>
                            )}
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Client Growth Chart */}
            <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Client Growth</h3>
                        <p className="text-sm text-gray-500">Last 6 months</p>
                    </div>
                    <div className="text-sm text-gray-500">
                        Total: {stats.totalClients} clients
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="month"
                            stroke="#9ca3af"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="clients"
                            stroke="#2563eb"
                            strokeWidth={3}
                            dot={{ fill: '#2563eb', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">⚡ Quick Actions</h3>
                    <div className="space-y-3">
                        {quickActions.map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <motion.button
                                    key={action.title}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={action.onClick}
                                    className={`w-full flex items-center gap-4 p-4 rounded-lg ${action.color} ${action.hoverColor} text-white transition-all group`}
                                >
                                    <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                                        <Icon size={24} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold">{action.title}</div>
                                        <div className="text-sm opacity-90">{action.description}</div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">🕐 Recent Activity</h3>
                        <button
                            onClick={() => navigate('/dashboard/clients')}
                            className="text-sm text-primary hover:text-primary/80 font-medium"
                        >
                            View All →
                        </button>
                    </div>
                    {recentActivity.length > 0 ? (
                        <div className="space-y-3">
                            {recentActivity.map((activity, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm flex-shrink-0">
                                        {activity.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {activity.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {activity.type} • {activity.time}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-sm">No recent activity</p>
                            <p className="text-xs mt-1">Start by adding your first client!</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
