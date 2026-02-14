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
    Button
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconHistory, IconSearch, IconBell, IconCalendar, IconX } from '@tabler/icons-react';
import '@mantine/dates/styles.css';
import api from '../services/api';
import dayjs from 'dayjs';

export default function ActivityLog() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState([null, null]);

    const fetchLogs = async (forceParams = null) => {
        setLoading(true);
        try {
            const params = {};
            const range = forceParams || dateRange;

            if (range[0]) params.startDate = dayjs(range[0]).startOf('day').toISOString();
            if (range[1]) params.endDate = dayjs(range[1]).endOf('day').toISOString();

            console.log('[ActivityLog Debug] Fetching with params:', params);
            const response = await api.get('/activity', { params });
            console.log(response, 'response');
            setLogs(response.data.data);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleDateChange = (val) => {
        setDateRange(val);
        console.log('[ActivityLog Debug] Date range changed:', val);
        // Only fetch if range is complete (both dates selected) or cleared (both null)
        if ((val[0] && val[1]) || (!val[0] && !val[1])) {
            fetchLogs(val);
        }
    };

    const getActionColor = (action) => {
        if (action.includes('CREATE')) return 'teal';
        if (action.includes('UPDATE')) return 'blue';
        if (action.includes('DELETE')) return 'red';
        if (action.includes('RESTORE')) return 'indigo';
        if (action.includes('UPLOAD')) return 'orange';
        return 'gray';
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

    const rows = logs.map((log) => (
        <Table.Tr key={log._id}>
            <Table.Td>
                <Badge variant="light" color={getActionColor(log.action)} size="sm">
                    {actionLabels[log.action] || log.action}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Text size="sm" fw={600} c="primary">{log.clientId?.name || log.clientName || 'System'}</Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm" fw={500}>{log.details}</Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm" c="dimmed">
                    {dayjs(log.timestamp).format('DD MMM YYYY, hh:mm A')}
                </Text>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Stack gap="xl" py="sm">
            <Box>
                <Group justify="space-between" align="center" mb="md">
                    <Box>
                        <Title order={1} fw={900} size="32px" mb={4}>Activity Log</Title>
                        <Text c="dimmed" size="sm" fw={500}>Monitor and audit all CA actions across the platform</Text>
                    </Box>
                    <div className="bg-primary/5 p-3 rounded-2xl text-primary">
                        <IconHistory size={28} />
                    </div>
                </Group>

                <Group gap="sm" mb="md">
                    <DatePickerInput
                        type="range"
                        placeholder="Filter by date range"
                        value={dateRange}
                        onChange={handleDateChange}
                        leftSection={<IconCalendar size={18} stroke={1.5} />}
                        clearable
                        className="w-72"
                        styles={{
                            input: {
                                borderRadius: '12px',
                                height: '42px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: 'white',
                                fontWeight: 500
                            }
                        }}
                    />
                    {(dateRange[0] || dateRange[1]) && (
                        <Button
                            variant="subtle"
                            color="gray"
                            onClick={() => handleDateChange([null, null])}
                            leftSection={<IconX size={16} />}
                            size="sm"
                        >
                            Reset
                        </Button>
                    )}
                </Group>
            </Box>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <Center py={100}>
                        <Loader size="lg" />
                    </Center>
                ) : (
                    <ScrollArea>
                        <Table verticalSpacing="md" horizontalSpacing="xl">
                            <Table.Thead style={{ backgroundColor: '#f8fafc' }}>
                                <Table.Tr>
                                    <Table.Th><Text size="xs" fw={700} tt="uppercase" c="dimmed">Action</Text></Table.Th>
                                    <Table.Th><Text size="xs" fw={700} tt="uppercase" c="dimmed">Client</Text></Table.Th>
                                    <Table.Th><Text size="xs" fw={700} tt="uppercase" c="dimmed">Description</Text></Table.Th>
                                    <Table.Th><Text size="xs" fw={700} tt="uppercase" c="dimmed">Date & Time</Text></Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {rows.length > 0 ? (
                                    rows
                                ) : (
                                    <Table.Tr>
                                        <Table.Td colSpan={4}>
                                            <Center py={50}>
                                                <Text c="dimmed">No activity logs found</Text>
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
