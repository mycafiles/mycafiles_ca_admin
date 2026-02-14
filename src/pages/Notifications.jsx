import React, { useState, useEffect } from 'react';
import {
    Table,
    Title,
    Text,
    Stack,
    Box,
    Badge,
    Group,
    ScrollArea,
    Loader,
    Center,
    ActionIcon,
    Button,
    SegmentedControl
} from '@mantine/core';
import {
    IconBell,
    IconFileUpload,
    IconTrash,
    IconBellRinging,
    IconCheck,
    IconCircleCheck,
    IconDotsVertical,
    IconAdjustmentsHorizontal
} from '@tabler/icons-react';
import { notificationService } from '../services/notificationService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('today');

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const result = await notificationService.getNotifications();
            setNotifications(result.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'FILE_UPLOAD': return <IconFileUpload size={18} />;
            case 'DEVICE_APPROVAL': return <IconCircleCheck size={18} />;
            default: return <IconBellRinging size={18} />;
        }
    };

    const getBadgeColor = (type) => {
        switch (type) {
            case 'FILE_UPLOAD': return 'blue';
            case 'DEVICE_APPROVAL': return 'green';
            default: return 'gray';
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'today') return dayjs(n.createdAt).isSame(dayjs(), 'day');
        if (filter === 'file_upload') return n.type === 'FILE_UPLOAD';
        return true;
    });

    const handleRowClick = async (n) => {
        if (!n.isRead) {
            await handleMarkAsRead(n._id);
        }

        switch (n.type) {
            case 'FILE_UPLOAD':
                if (n.metadata?.clientId) {
                    navigate(`/dashboard/clients/${n.metadata.clientId}`);
                }
                break;
            case 'DEVICE_APPROVAL':
                navigate('/dashboard/home');
                break;
            default:
                // No specific navigation for general
                break;
        }
    };

    const rows = filteredNotifications.map((n) => (
        <Table.Tr
            key={n._id}
            className={`${!n.isRead ? 'bg-blue-50/20' : ''} cursor-pointer hover:bg-slate-50 transition-colors`}
            onClick={() => handleRowClick(n)}
        >
            <Table.Td>
                <Group gap="md" wrap="nowrap">
                    <Box className={`size-10 shrink-0 flex items-center justify-center rounded-2xl transition-all ${!n.isRead ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}>
                        {getIcon(n.type)}
                    </Box>
                    <Box className="flex-1 min-w-0">
                        <Group gap="xs" mb={1} wrap="nowrap">
                            <Text size="sm" fw={!n.isRead ? 800 : 700} c={!n.isRead ? 'slate.9' : 'slate.7'} className="truncate">
                                {n.title}
                            </Text>
                            {!n.isRead && <Badge size="xs" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>New</Badge>}
                        </Group>
                        <Group gap={6} align="center">
                            {n.sender?.name && (
                                <Text size="10px" c="blue" fw={800} tt="uppercase" className="shrink-0 tracking-wider">FROM: {n.sender.name}</Text>
                            )}
                            <Text size="xs" c="dimmed" fw={500} lineClamp={1} className="flex-1 italic">{n.message}</Text>
                        </Group>
                    </Box>
                </Group>
            </Table.Td>
            <Table.Td>
                <Badge variant="light" color={getBadgeColor(n.type)} size="sm">
                    {n.type?.replace(/_/g, ' ')}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Text size="xs" fw={500} c="dimmed">
                    {dayjs(n.createdAt).format('DD MMM YYYY, hh:mm A')}
                    <br />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                        {dayjs(n.createdAt).fromNow()}
                    </span>
                </Text>
            </Table.Td>
            <Table.Td>
                <Group gap="xs" justify="flex-end">
                    {!n.isRead && (
                        <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => handleMarkAsRead(n._id)}
                            title="Mark as read"
                        >
                            <IconCheck size={16} />
                        </ActionIcon>
                    )}
                    <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => handleDelete(n._id)}
                        title="Delete"
                    >
                        <IconTrash size={16} />
                    </ActionIcon>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Stack gap="xl" py="sm">
            <Box>
                <Group justify="space-between" align="flex-end" mb="md">
                    <Box>
                        <Title order={1} fw={900} size="32px" mb={4} className="tracking-tight">Notifications</Title>
                        <Text c="dimmed" size="sm" fw={500}>View and manage all system alerts and client notifications</Text>
                    </Box>
                    <div className="bg-blue-50 text-blue-600 p-2.5 rounded-2xl border border-blue-100 shadow-sm">
                        <IconBell size={24} stroke={2.5} />
                    </div>
                </Group>
            </Box>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6">
                <Group justify="space-between" mb="xl">
                    <SegmentedControl
                        value={filter}
                        onChange={setFilter}
                        data={[
                            { label: 'Today', value: 'today' },
                            { label: 'All', value: 'all' },
                            { label: 'Unread', value: 'unread' },
                            { label: 'Files', value: 'file_upload' },
                        ]}
                        radius="md"
                        color="blue"
                    />
                    <Button
                        variant="subtle"
                        color="blue"
                        leftSection={<IconCircleCheck size={20} />}
                        onClick={handleMarkAllRead}
                        disabled={!notifications.some(n => !n.isRead)}
                    >
                        Mark all as read
                    </Button>
                </Group>

                {loading ? (
                    <Center py={100}>
                        <Loader size="lg" />
                    </Center>
                ) : (
                    <ScrollArea>
                        <Table verticalSpacing="md" horizontalSpacing="xl">
                            <Table.Thead style={{ backgroundColor: '#f8fafc' }}>
                                <Table.Tr>
                                    <Table.Th><Text size="xs" fw={700} tt="uppercase" c="dimmed">Notification</Text></Table.Th>
                                    <Table.Th><Text size="xs" fw={700} tt="uppercase" c="dimmed">Category</Text></Table.Th>
                                    <Table.Th><Text size="xs" fw={700} tt="uppercase" c="dimmed">Date</Text></Table.Th>
                                    <Table.Th style={{ textAlign: 'right' }}><Text size="xs" fw={700} tt="uppercase" c="dimmed">Actions</Text></Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {rows.length > 0 ? (
                                    rows
                                ) : (
                                    <Table.Tr>
                                        <Table.Td colSpan={4}>
                                            <Center py={100}>
                                                <Stack align="center" gap="xs">
                                                    <Box className="p-4 bg-slate-50 rounded-full text-slate-300">
                                                        <IconBell size={48} stroke={1} />
                                                    </Box>
                                                    <Text c="dimmed" fw={600}>No notifications found</Text>
                                                </Stack>
                                            </Center>
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </ScrollArea>
                )}
            </div>
        </Stack>
    );
}
