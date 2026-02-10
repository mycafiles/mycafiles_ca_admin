import React from 'react';
import { Table, Badge, Group, Text, Avatar, ActionIcon, ScrollArea, Switch, Tooltip } from '@mantine/core';
import { IconArrowRight, IconEdit, IconCheck, IconX } from '@tabler/icons-react';
import { motion } from 'framer-motion';

const ClientTable = ({ data, loading, onRowClick, onEdit, onStatusChange }) => {
    const rows = data.map((row, index) => (
        <Table.Tr
            key={row._id}
            onClick={() => onRowClick(row)}
            style={{
                cursor: 'pointer',
                backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
                transition: 'all 0.2s ease',
                height: '60px'
            }}
            className="hover:!bg-blue-50"
        >
            <Table.Td>
                <Text size="sm" fw={600} c="dimmed">
                    {index + 1}
                </Text>
            </Table.Td>
            <Table.Td>
                <Group gap="sm">
                    <Avatar
                        size={40}
                        radius="xl"
                        color={(row.type || 'individual').toLowerCase() === 'business' ? 'indigo' : 'teal'}
                        variant="light"
                    >
                        {(row.name || 'CN').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </Avatar>
                    <div>
                        <Text size="sm" fw={600} style={{ lineHeight: 1.2 }}>
                            {row.name}
                        </Text>
                    </div>
                </Group>
            </Table.Td>
            <Table.Td>
                <Text size="sm" fw={600} c="dark">
                    {row.panNumber || 'N/A'}
                </Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm" fw={500} c="dimmed">
                    {row.mobileNumber ? `+91 ${row.mobileNumber}` : 'No Contact'}
                </Text>
            </Table.Td>
            <Table.Td>
                <Badge
                    variant="light"
                    color={(row.type || 'individual').toLowerCase() === 'business' ? 'indigo' : 'teal'}
                    size="md"
                    radius="md"
                    style={{ textTransform: 'uppercase', fontWeight: 600 }}
                >
                    {row.type || 'Individual'}
                </Badge>
            </Table.Td>
            <Table.Td>
                <div onClick={(e) => e.stopPropagation()}>
                    <Group gap="xs">
                        <Switch
                            checked={row.isActive !== false}
                            onChange={(e) => {
                                onStatusChange(row._id, e.currentTarget.checked);
                            }}
                            color="teal"
                            size="md"
                            thumbIcon={
                                row.isActive !== false ? (
                                    <IconCheck size={12} color="teal" stroke={3} />
                                ) : (
                                    <IconX size={12} color="red" stroke={3} />
                                )
                            }
                        />
                        <div
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: row.isActive !== false ? '#10b981' : '#ef4444',
                                boxShadow: row.isActive !== false
                                    ? '0 0 0 3px rgba(16, 185, 129, 0.2)'
                                    : '0 0 0 3px rgba(239, 68, 68, 0.2)'
                            }}
                        />
                    </Group>
                </div>
            </Table.Td>
            <Table.Td>
                <Group gap="sm" justify="flex-end">
                    <Tooltip label="Edit Client" position="top">
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="lg"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(row);
                            }}
                            className="hover:bg-gray-100"
                        >
                            <IconEdit size={20} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="View Details" position="top">
                        <ActionIcon
                            variant="light"
                            color="blue"
                            radius="md"
                            size="lg"
                            className="hover:bg-blue-100"
                        >
                            <IconArrowRight size={18} stroke={2.5} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    const HeaderText = ({ children }) => (
        <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '1px' }}>
            {children}
        </Text>
    );

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-8">
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="animate-pulse flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <ScrollArea>
            <Table
                verticalSpacing="0"
                highlightOnHover={false}
                withTableBorder
                radius="md"
                style={{
                    borderCollapse: 'separate',
                    borderSpacing: 0
                }}
            >
                <Table.Thead style={{ backgroundColor: '#f8fafc' }}>
                    <Table.Tr style={{ height: '48px' }}>
                        <Table.Th style={{ width: '60px' }}><HeaderText>Sr No.</HeaderText></Table.Th>
                        <Table.Th><HeaderText>Client Info</HeaderText></Table.Th>
                        <Table.Th><HeaderText>Pan No.</HeaderText></Table.Th>
                        <Table.Th><HeaderText>Mobile No.</HeaderText></Table.Th>
                        <Table.Th><HeaderText>Type</HeaderText></Table.Th>
                        <Table.Th><HeaderText>Status</HeaderText></Table.Th>
                        <Table.Th><HeaderText>Actions</HeaderText></Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {rows.length > 0 ? (
                        rows
                    ) : (
                        <Table.Tr>
                            <Table.Td colSpan={6}>
                                <div className="text-center py-12">
                                    <Text size="lg" fw={600} c="dimmed" mb="xs">No clients found</Text>
                                    <Text size="sm" c="dimmed">Try adjusting your search or filters</Text>
                                </div>
                            </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>
        </ScrollArea>
    );
};

export default ClientTable;
