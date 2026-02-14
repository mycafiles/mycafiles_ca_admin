import React, { useState, useEffect } from 'react';
import {
    Text,
    ActionIcon,
    ScrollArea,
    Group,
    Stack,
    UnstyledButton,
    Box,
    Indicator,
    Button,
    SegmentedControl,
    Drawer,
    Badge
} from '@mantine/core';
import {
    IconBell,
    IconFileUpload,
    IconTrash,
    IconBellRinging,
    IconCircleCheck,
    IconX
} from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { notifications as mantineNotifications } from '@mantine/notifications';

dayjs.extend(relativeTime);

export default function NotificationCenter() {
    const navigate = useNavigate();
    const location = useLocation();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [opened, setOpened] = useState(false);
    const [filter, setFilter] = useState('today');

    // Close drawer on route change
    useEffect(() => {
        setOpened(false);
    }, [location]);

    const filteredNotifications = notifications.filter((n) => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'today')
            return dayjs(n.createdAt).isSame(dayjs(), 'day');
        return true;
    });

    const fetchNotifications = async (isBackground = false) => {
        try {
            const result = await notificationService.getNotifications();

            // Toast for new notifications
            if (isBackground && result.unreadCount > unreadCount) {
                const newOnes = result.data.filter(
                    (n) =>
                        !n.isRead &&
                        !notifications.find((existing) => existing._id === n._id)
                );

                newOnes.forEach((n) => {
                    mantineNotifications.show({
                        title: n.title,
                        message: n.message,
                        icon: <IconFileUpload size={16} />,
                        color: 'dark'
                    });
                });
            }

            setNotifications(result.data);
            setUnreadCount(result.unreadCount);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(
            () => fetchNotifications(true),
            30000
        );
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            const notification = notifications.find(n => n._id === id);
            // Only proceed if the notification exists and is unread
            if (notification && !notification.isRead) {
                await notificationService.markAsRead(id);
                setNotifications((prev) =>
                    prev.map((n) =>
                        n._id === id ? { ...n, isRead: true } : n
                    )
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleNotificationClick = async (n) => {
        // Mark as read first if unread
        if (!n.isRead) {
            await handleMarkAsRead(n._id);
        }

        setOpened(false);

        // Smart Navigation based on type and metadata
        switch (n.type) {
            case 'FILE_UPLOAD':
                if (n.metadata?.clientId) {
                    navigate(`/dashboard/clients/${n.metadata.clientId}`);
                } else {
                    navigate('/dashboard/notifications');
                }
                break;
            case 'DEVICE_APPROVAL':
                navigate('/dashboard/home'); // Or activity
                break;
            default:
                navigate('/dashboard/notifications');
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        try {
            await notificationService.deleteNotification(id);
            const deleted = notifications.find((n) => n._id === id);
            setNotifications((prev) =>
                prev.filter((n) => n._id !== id)
            );
            // Only decrement count if it was unread
            if (deleted && !deleted.isRead) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'FILE_UPLOAD':
                return <IconFileUpload size={18} />;
            case 'DEVICE_APPROVAL':
                return <IconCircleCheck size={18} />;
            default:
                return <IconBellRinging size={18} />;
        }
    };

    return (
        <>
            {/* Bell Icon */}
            <Indicator
                label={unreadCount > 9 ? '9+' : unreadCount}
                size={16}
                offset={4}
                color="red"
                disabled={unreadCount === 0}
                withBorder
                styles={{
                    indicator: {
                        fontSize: '9px',
                        fontWeight: 800,
                        padding: '0 4px',
                        minWidth: '16px',
                        height: '16px',
                        lineHeight: '16px'
                    }
                }}
            >
                <ActionIcon
                    variant="light"
                    color="blue"
                    size="42px"
                    radius="14px"
                    onClick={() => setOpened(true)}
                    className="hover:shadow-md transition-all active:scale-95 border border-blue-100"
                >
                    <IconBell size={22} stroke={2.5} />
                </ActionIcon>
            </Indicator>

            {/* Drawer */}
            <Drawer
                opened={opened}
                onClose={() => setOpened(false)}
                position="right"
                size={380}
                padding="0"
                withCloseButton={false}
                overlayProps={{ opacity: 0.2, blur: 3 }}
            >
                {/* Header */}
                <Box p="md" className="border-b border-gray-100">
                    <Group justify="space-between">
                        <Stack gap={0}>
                            <Text fw={700} size="lg">
                                Notifications
                            </Text>
                            <Text size="xs" c="dimmed">
                                {unreadCount} unread messages
                            </Text>
                        </Stack>

                        <Group gap={6}>
                            {unreadCount > 0 && (
                                <ActionIcon
                                    variant="light"
                                    size="sm"
                                    onClick={handleMarkAllRead}
                                    title="Mark all as read"
                                >
                                    <IconCircleCheck size={16} />
                                </ActionIcon>
                            )}
                            <ActionIcon
                                variant="subtle"
                                size="sm"
                                onClick={() => setOpened(false)}
                            >
                                <IconX size={16} />
                            </ActionIcon>
                        </Group>
                    </Group>
                </Box>

                {/* Filter */}
                <Box p="sm" className="border-b border-gray-100">
                    <SegmentedControl
                        fullWidth
                        size="xs"
                        radius="md"
                        value={filter}
                        onChange={setFilter}
                        data={[
                            { label: 'Today', value: 'today' },
                            { label: 'All', value: 'all' },
                            { label: 'Unread', value: 'unread' }
                        ]}
                    />
                </Box>

                {/* List */}
                <ScrollArea.Autosize mah="calc(100vh - 180px)">
                    {filteredNotifications.length > 0 ? (
                        <Stack gap={0} p={0}>
                            {filteredNotifications.map((n) => (
                                <UnstyledButton
                                    key={n._id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`w-full p-4 border-b border-gray-100 transition relative group ${!n.isRead ? 'bg-blue-50/30 border-l-4 border-blue-600' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    {/* Outer Flex Wrapper */}
                                    <div className="flex items-start gap-4 px-3 py-3 border border-gray-100 mb-1">

                                        {/* 1. Icon - Fixed size to prevent shifting */}
                                        <div className={`flex-shrink-0 size-10 rounded-xl flex items-center justify-center transition-colors ${!n.isRead ? 'bg-blue-100/80 text-blue-600' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {getIcon(n.type)}
                                        </div>

                                        {/* 2. Content Wrapper */}
                                        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                            {/* Row 1: Title & Badge/Actions */}
                                            <div className="flex items-center justify-between gap-2">
                                                <Text size="sm" fw={!n.isRead ? 800 : 700} className="truncate" c={!n.isRead ? 'blue.9' : 'slate.7'}>
                                                    {n.title}
                                                </Text>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-500 uppercase tracking-tight">
                                                        {n.type?.split('_')[0] || 'GENERAL'}
                                                    </span>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        size="xs"
                                                        color="red"
                                                        onClick={(e) => handleDelete(e, n._id)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <IconTrash size={14} />
                                                    </ActionIcon>
                                                </div>
                                            </div>

                                            {/* Row 2: Message */}
                                            <Text size="xs" c="dimmed" className="line-clamp-1 pr-2 italic mb-1">
                                                {n.message}
                                            </Text>

                                            {/* Row 3: Meta (Time & Sender) */}
                                            <div className="flex items-center justify-between border-t border-gray-50 pt-1 mt-0.5">
                                                <div className="flex items-center gap-2">
                                                    {n.sender?.name && (
                                                        <>
                                                            <Text size="9px" c="blue" fw={800} tt="uppercase" className="tracking-wider">
                                                                {n.sender.name}
                                                            </Text>
                                                            <div className="size-0.5 rounded-full bg-slate-300" />
                                                        </>
                                                    )}
                                                    <Text size="9px" c="dimmed" fw={700} className="uppercase tracking-wider">
                                                        {dayjs(n.createdAt).fromNow()}
                                                    </Text>
                                                </div>
                                                <Text size="9px" c="dimmed" fw={600} className="tabular-nums">
                                                    {dayjs(n.createdAt).format('hh:mm A')}
                                                </Text>
                                            </div>
                                        </div>
                                    </div>
                                </UnstyledButton>
                            ))}
                        </Stack>
                    ) : (
                        <Stack align="center" py={60} gap="xs">
                            <Box className="p-4 bg-gray-50 rounded-full">
                                <IconBell size={40} stroke={1} c="dimmed" />
                            </Box>
                            <Text size="sm" fw={500} c="dimmed">
                                No notifications yet
                            </Text>
                        </Stack>
                    )}
                </ScrollArea.Autosize>

                {/* Footer */}
                <Box p="sm" className="border-t border-gray-100">
                    <Button
                        variant="subtle"
                        fullWidth
                        size="xs"
                        onClick={() => {
                            setOpened(false);
                            navigate('/dashboard/notifications');
                        }}
                    >
                        View all notification history
                    </Button>
                </Box>
            </Drawer>
        </>
    );
}