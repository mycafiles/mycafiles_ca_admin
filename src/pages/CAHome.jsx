import { IconUsers, IconFileAnalytics, IconFolder, IconPlus, IconUpload, IconPhoto, IconTrendingUp, IconClock, IconFileUpload, IconTrash, IconHistory, IconPlus as IconPlusCircle, IconBell, IconBellRinging, IconX } from '@tabler/icons-react';
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { notifications } from '@mantine/notifications';
import { Stack } from '@mantine/core';
import { fetchClients, addClient, bulkUploadClients } from '../store/slices/clientSlice';
import ClientModals from '../components/clients/ClientModals';
import BulkUploadResultModal from '../components/clients/BulkUploadResultModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { clientService } from '../services/clientService';
import api from '../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function CAHome() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { items: clients } = useSelector((state) => state.clients);

    const [stats, setStats] = useState({
        totalClients: 0,
        pendingApprovals: 0,
        totalFiles: 0,
        clientGrowth: 15 // Percentage growth
    });
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState([]);
    const [recentNotifications, setRecentNotifications] = useState([]);

    // Modal states
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [bulkFile, setBulkFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [resultModalOpen, setResultModalOpen] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        mobileNumber: '',
        panNumber: '',
        gstNumber: '',
        tanNumber: '',
        tradeNumber: '',
        gstId: '',
        gstPassword: '',
        address: '',
        dob: null,
        type: 'INDIVIDUAL'
    });
    const [errors, setErrors] = useState({});

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
        const fetchDashboardData = async () => {
            try {
                // Fetch Stats (Clients)
                const clientData = await clientService.getClients();

                // Fetch Recent Activity
                const activityResponse = await api.get('/activity');
                const activities = activityResponse.data.data || [];

                setStats({
                    totalClients: clientData.results || 0,
                    pendingApprovals: 0,
                    totalFiles: 0,
                    clientGrowth: 15
                });

                // Get recent 5 activities
                const formattedRecent = activities
                    .slice(0, 5)
                    .map(activity => ({
                        name: activity.clientId?.name || activity.clientName || 'System',
                        time: getRelativeTime(activity.timestamp),
                        type: actionLabels[activity.action] || activity.action,
                        action: activity.action,
                        details: activity.details // Use the real detailed description
                    }));

                setRecentActivity(formattedRecent);

                // Fetch Recent Notifications
                const notificationResponse = await api.get('/notifications');
                const notifications = notificationResponse.data.data || [];
                setRecentNotifications(notifications.slice(0, 5));

                setLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setLoading(false);
            }
        };

        fetchDashboardData();
        // Refresh every 60 seconds
        const interval = setInterval(fetchDashboardData, 60000);
        return () => clearInterval(interval);
    }, []);

    const validateField = (name, value) => {
        let error = '';
        if (name === 'name' && value.length < 2) error = 'Name too short';

        if (name === 'mobileNumber' && !/^\d{10}$/.test(value)) error = 'Invalid mobile number (10 digits required)';

        if (name === 'panNumber' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
            error = 'Invalid PAN Number (Ex: ABCDE1234F)';
        }

        if (name === 'gstNumber' && value) {
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!gstRegex.test(value)) {
                error = 'Invalid GST Number (Ex: 22ABCDE1234F1Z5)';
            } else if (formData.panNumber && value.substring(2, 12) !== formData.panNumber) {
                error = 'GST Number does not match the entered PAN';
            }
        }

        if (name === 'tanNumber' && value) {
            if (value.length !== 10) {
                error = 'TDS Number must be 10 characters long';
            }
        }

        return error;
    };

    const handleInputChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));

        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const validate = () => {
        const newErrors = {};
        if (formData.name.length < 2) newErrors.name = 'Name too short';

        if (!/^\d{10}$/.test(formData.mobileNumber)) newErrors.mobileNumber = 'Invalid mobile number (10 digits required)';

        // PAN: 5 uppercase letters, 4 digits, 1 uppercase letter
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
            newErrors.panNumber = 'Invalid PAN Number (Ex: ABCDE1234F)';
        }

        // GST: 2 digits + PAN + 1 char + Z + 1 char
        if (formData.gstNumber) {
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!gstRegex.test(formData.gstNumber)) {
                newErrors.gstNumber = 'Invalid GST Number (Ex: 22ABCDE1234F1Z5)';
            } else if (formData.panNumber && formData.gstNumber.substring(2, 12) !== formData.panNumber) {
                newErrors.gstNumber = 'GST Number does not match the entered PAN';
            }
        }

        // TDS: Length 10
        if (formData.tanNumber) {
            if (formData.tanNumber.length !== 10) {
                newErrors.tanNumber = 'TDS Number must be 10 characters long';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddClient = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            const result = await dispatch(addClient(formData));
            if (!result.error) {
                setAddModalOpen(false);
                setFormData({ name: '', mobileNumber: '', panNumber: '', gstNumber: '', tanNumber: '', tradeNumber: '', gstId: '', gstPassword: '', address: '', dob: null, type: 'INDIVIDUAL' });
                notifications.show({
                    title: 'Success',
                    message: 'Client registered successfully!',
                    color: 'green'
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleBulkUpload = async () => {
        if (!bulkFile) return;
        setIsUploading(true);
        setUploadProgress(0);

        const result = await dispatch(bulkUploadClients({
            file: bulkFile,
            onProgress: (progress) => {
                // Upload part: 0-90%
                setUploadProgress(Math.round(progress * 0.9));
            }
        }));

        if (!result.error) {
            setUploadProgress(100);

            setTimeout(() => {
                setBulkModalOpen(false);
                setBulkFile(null);
                setIsUploading(false);
                setUploadProgress(0);

                // Show result modal instead of notification
                setUploadResult(result.payload);
                setResultModalOpen(true);
            }, 500);
        } else {
            setIsUploading(false);
            setUploadProgress(0);
            notifications.show({
                title: 'Upload Failed',
                message: result.payload || 'An error occurred during bulk upload',
                color: 'red',
                icon: <IconX size={16} />
            });
        }
    };

    const actionLabels = {
        'CREATE_CLIENT': 'Client Created',
        'UPDATE_CLIENT': 'Client Updated',
        'DELETE_CLIENT': 'Client Deleted',
        'GENERATE_FOLDERS': 'Folders Generated',
        'UPLOAD_FILE': 'File Uploaded',
        'DELETE_FILE': 'File Deleted',
        'RESTORE_FILE': 'File Restored',
        'PERMANENT_DELETE_FILE': 'File Permanently Deleted',
        'CREATE_FOLDER': 'Folder Created',
        'DELETE_FOLDER': 'Folder Deleted',
        'RESTORE_FOLDER': 'Folder Restored',
        'PERMANENT_DELETE_FOLDER': 'Folder Permanently Deleted',
        'LOGIN': 'Login',
        'CA_REGISTER': 'Registration',
        'UPDATE_PROFILE': 'Profile Updated',
        'APPROVE_DEVICE': 'Device Approved',
        'REJECT_DEVICE': 'Device Rejected'
    };

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
            onClick: () => {
                setFormData({
                    name: '',
                    mobileNumber: '',
                    panNumber: '',
                    gstNumber: '',
                    tanNumber: '',
                    tradeNumber: '',
                    gstId: '',
                    gstPassword: '',
                    address: '',
                    dob: null,
                    type: 'INDIVIDUAL'
                });
                setAddModalOpen(true);
            }
        },
        {
            title: 'Bulk Upload',
            description: 'Import CSV/Excel',
            icon: IconUpload,
            color: 'bg-indigo-600',
            hoverColor: 'hover:bg-indigo-700',
            onClick: () => setBulkModalOpen(true)
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
                            onClick={() => navigate('/dashboard/activity')}
                            className="text-sm text-primary hover:text-primary/80 font-medium"
                        >
                            View All →
                        </button>
                    </div>
                    {recentActivity.length > 0 ? (
                        <div className="space-y-3">
                            {recentActivity.map((activity, index) => {
                                const isUpload = activity.action === 'UPLOAD_FILE';
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 ${isUpload ? 'bg-blue-50/10' : ''}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 shadow-sm ${isUpload ? 'bg-blue-100 text-blue-600' : 'bg-primary/10 text-primary'}`}>
                                            {isUpload ? <IconUpload size={20} stroke={2.5} /> : activity.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 leading-tight">
                                                {activity.details || activity.type}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                <span className="font-semibold text-gray-700">{activity.name}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><IconClock size={12} /> {activity.time}</span>
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-sm">No recent activity</p>
                            <p className="text-xs mt-1">Start by adding your first client!</p>
                        </div>
                    )}
                </motion.div>

                {/* Recent Notifications */}
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">🔔 Recent Notifications</h3>
                        <button
                            onClick={() => navigate('/dashboard/notifications')}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            View All →
                        </button>
                    </div>
                    {recentNotifications.length > 0 ? (
                        <div className="space-y-3">
                            {recentNotifications.map((notif, index) => (
                                <motion.div
                                    key={notif._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex items-start gap-3 p-3 rounded-xl transition-all ${!notif.isRead ? 'bg-blue-50/40 border border-blue-100' : 'hover:bg-slate-50'}`}
                                >
                                    <div className={`p-2 rounded-lg ${!notif.isRead ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {notif.type === 'FILE_UPLOAD' ? <IconFileUpload size={18} /> : <IconBellRinging size={18} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className={`text-sm tracking-tight truncate ${!notif.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                                                {notif.title}
                                            </p>
                                            {!notif.isRead && (
                                                <div className="size-1.5 rounded-full bg-blue-500 shadow-sm mt-1.5 flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">
                                            {notif.message}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5 tracking-wider">
                                            {dayjs(notif.createdAt).fromNow()}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 flex flex-col items-center gap-3">
                            <div className="p-3 bg-slate-50 rounded-2xl text-slate-200">
                                <IconBell size={32} stroke={1.5} />
                            </div>
                            <p className="text-sm text-slate-500 font-bold">No notifications yet</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Feature Modals */}
            <ClientModals
                addModalOpen={addModalOpen}
                setAddModalOpen={setAddModalOpen}
                editModalOpen={false} // Edit not needed on home dashboard
                setEditModalOpen={() => { }}
                bulkModalOpen={bulkModalOpen}
                setBulkModalOpen={setBulkModalOpen}
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                handleAddClient={handleAddClient}
                handleEditClient={() => { }}
                handleDeleteClient={() => { }}
                handleBulkUpload={handleBulkUpload}
                bulkFile={bulkFile}
                setBulkFile={setBulkFile}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                selectedClient={null}
                handleInputChange={handleInputChange}
                submitting={submitting}
            />

            {/* Bulk Upload Result Modal */}
            <BulkUploadResultModal
                opened={resultModalOpen}
                onClose={() => {
                    setResultModalOpen(false);
                    setUploadResult(null);
                    // Refresh stats after closing result modal
                    dispatch(fetchClients());
                }}
                result={uploadResult}
            />
        </motion.div>
    );
}
