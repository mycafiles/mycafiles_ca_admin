import React, { useState, useEffect } from 'react';
import {
    Menu,
    Text,
    Badge,
    ActionIcon,
    ScrollArea,
    Group,
    Stack,
    UnstyledButton,
    Box,
    Transition,
    Indicator,
    Button,
    SegmentedControl
} from '@mantine/core';
import {
    IconBell,
    IconCheck,
    IconFileUpload,
    IconTrash,
    IconBellRinging,
    IconCircleCheck
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { notifications as mantineNotifications } from '@mantine/notifications';

dayjs.extend(relativeTime);

export default function NotificationCenter() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [opened, setOpened] = useState(false);
    const [filter, setFilter] = useState('all');

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'today') return dayjs(n.createdAt).isSame(dayjs(), 'day');
        return true;
    });

    const fetchNotifications = async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        try {
            const result = await notificationService.getNotifications();

            // Check for new notifications to show toast
            if (isBackground && result.unreadCount > unreadCount) {
                const newOnes = result.data.filter(n => !n.isRead && !notifications.find(existing => existing._id === n._id));
                newOnes.forEach(n => {
                    mantineNotifications.show({
                        title: n.title,
                        message: n.message,
                        icon: <IconFileUpload size={16} />,
                        color: 'blue'
                    });
                });
            }

            setNotifications(result.data);
            setUnreadCount(result.unreadCount);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Polling every 30 seconds
        const interval = setInterval(() => fetchNotifications(true), 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        try {
            await notificationService.deleteNotification(id);
            const deleted = notifications.find(n => n._id === id);
            setNotifications(prev => prev.filter(n => n._id !== id));
            if (deleted && !deleted.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'FILE_UPLOAD': return <IconFileUpload size={18} color="var(--mantine-color-blue-filled)" />;
            default: return <IconBellRinging size={18} color="var(--mantine-color-gray-6)" />;
        }
    };

    return (
        <Menu
            opened={opened}
            onChange={setOpened}
            width={350}
            position="bottom-end"
            offset={10}
            shadow="xl"
            withArrow
            transitionProps={{ transition: 'pop-top-right', duration: 200 }}
        >
            <Menu.Target>
                <Indicator
                    label={unreadCount > 9 ? '9+' : unreadCount}
                    size={20}
                    offset={5}
                    color="red"
                    disabled={unreadCount === 0}
                    withBorder
                    processing
                >
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="lg"
                        radius="xl"
                        className="transition-all hover:bg-gray-100 hover:text-primary"
                    >
                        <IconBell size={24} stroke={1.5} />
                    </ActionIcon>
                </Indicator>
            </Menu.Target>

            <Menu.Dropdown p={0} className="overflow-hidden border-slate-100 rounded-2xl">
                <Box p="md" className="border-b border-slate-50 bg-slate-50/50">
                    <Group justify="space-between">
                        <Stack gap={0}>
                            <Text fw={800} size="lg">Notifications</Text>
                            <Text size="xs" c="dimmed">{unreadCount} unread messages</Text>
                        </Stack>
                        {unreadCount > 0 && (
                            <Button
                                variant="subtle"
                                size="compact-xs"
                                color="blue"
                                leftSection={<IconCircleCheck size={14} />}
                                onClick={handleMarkAllRead}
                            >
                                Mark all as read
                            </Button>
                        )}
                    </Group>
                </Box>

                <Box p="xs" className="border-b border-slate-50 bg-slate-50/30">
                    <SegmentedControl
                        fullWidth
                        size="xs"
                        radius="md"
                        value={filter}
                        onChange={setFilter}
                        data={[
                            { label: 'All', value: 'all' },
                            { label: 'Today', value: 'today' },
                            { label: 'Unread', value: 'unread' },
                        ]}
                        color="blue"
                    />
                </Box>

                <ScrollArea.Autosize mah={400} type="hover">
                    {filteredNotifications.length > 0 ? (
                        <Stack gap={0}>
                            {filteredNotifications.map((n) => (
                                <UnstyledButton
                                    key={n._id}
                                    onClick={() => {
                                        handleMarkAsRead(n._id);
                                        setOpened(false);
                                    }}
                                    className={`w-full p-5 transition-colors hover:bg-slate-50 border-b border-slate-50 last:border-b-0 ${!n.isRead ? 'bg-blue-50/20' : ''}`}
                                >
                                    <Group align="flex-start" wrap="nowrap" gap="md">
                                        <Box className={`p-2.5 rounded-xl ${!n.isRead ? 'bg-blue-100/50' : 'bg-slate-100'}`}>
                                            {getIcon(n.type)}
                                        </Box>
                                        <Stack gap={4} className="flex-1">
                                            <Group justify="space-between" wrap="nowrap">
                                                <Text size="sm" fw={!n.isRead ? 800 : 600} className="truncate pr-4 text-slate-900">
                                                    {n.title}
                                                </Text>
                                                {!n.isRead && (
                                                    <Box w={8} h={8} className="bg-blue-500 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                                )}
                                            </Group>
                                            <Text size="xs" c="dimmed" lineClamp={2} fw={500}>
                                                {n.message}
                                            </Text>
                                            <Group justify="space-between" mt={6}>
                                                <Text size="10px" c="dimmed" fw={600} className="uppercase tracking-wider">
                                                    {dayjs(n.createdAt).fromNow()}
                                                </Text>
                                                <Group gap={4}>
                                                    <ActionIcon
                                                        variant="transparent"
                                                        color="gray"
                                                        size="xs"
                                                        onClick={(e) => handleDelete(e, n._id)}
                                                    >
                                                        <IconTrash size={12} />
                                                    </ActionIcon>
                                                </Group>
                                            </Group>
                                        </Stack>
                                    </Group>
                                </UnstyledButton>
                            ))}
                        </Stack>
                    ) : (
                        <Stack align="center" py={40} gap="xs">
                            <Box className="p-4 bg-slate-50 rounded-full text-slate-300">
                                <IconBell size={40} stroke={1} />
                            </Box>
                            <Text size="sm" c="dimmed" fw={500}>No notifications yet</Text>
                        </Stack>
                    )}
                </ScrollArea.Autosize>

                <Box p="sm" className="border-t border-slate-50 text-center bg-slate-50/30">
                    <UnstyledButton
                        onClick={() => {
                            setOpened(false);
                            navigate('/dashboard/activity');
                        }}
                        className="w-full py-1 text-xs text-blue-600 font-bold hover:text-blue-700 transition-colors flex items-center justify-center gap-1"
                    >
                        View all activity history →
                    </UnstyledButton>
                </Box>
            </Menu.Dropdown>
        </Menu>
    );
}
