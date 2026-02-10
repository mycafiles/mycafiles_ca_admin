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
    Center
} from '@mantine/core';
import { IconHistory, IconSearch } from '@tabler/icons-react';
import api from '../services/api';
import dayjs from 'dayjs';

export default function ActivityLog() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await api.get('/activity');
                setLogs(response.data.data);
            } catch (error) {
                console.error('Failed to fetch logs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

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
                <Text size="sm" fw={500}>{log.details}</Text>
                {log.clientName && (
                    <Text size="xs" c="dimmed">Client: {log.clientName}</Text>
                )}
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
                                    <Table.Th><Text size="xs" fw={700} tt="uppercase" c="dimmed">Description</Text></Table.Th>
                                    <Table.Th><Text size="xs" fw={700} tt="uppercase" c="dimmed">Date & Time</Text></Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {rows.length > 0 ? (
                                    rows
                                ) : (
                                    <Table.Tr>
                                        <Table.Td colSpan={3}>
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
