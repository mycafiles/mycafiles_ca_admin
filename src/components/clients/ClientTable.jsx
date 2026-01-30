import React from 'react';
import { Table, Badge, Group, Text, Avatar, ActionIcon, ScrollArea } from '@mantine/core';
import { IconArrowRight, IconUser, IconBuildingSkyscraper, IconEdit } from '@tabler/icons-react';

const ClientTable = ({ data, loading, onRowClick, onEdit }) => {
    const rows = data.map((row) => (
        <Table.Tr
            key={row._id}
            onClick={() => onRowClick(row)}
            style={{ cursor: 'pointer' }}
        >
            <Table.Td>
                <Group gap="sm">
                    <Avatar
                        size={36}
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
                <Text size="sm" fw={600}>
                    {row.panNumber || 'N/A'}
                </Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm" fw={500}>
                    {row.mobileNumber ? `+91 ${row.mobileNumber}` : 'No Contact'}
                </Text>
            </Table.Td>
            <Table.Td>
                <Badge
                    variant="light"
                    color={(row.type || 'individual').toLowerCase() === 'business' ? 'indigo' : 'teal'}
                    size="sm"
                    radius="sm"
                >
                    {row.type || 'Individual'}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Group gap="xs" justify="flex-end">
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(row);
                        }}
                    >
                        <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon variant="light" color="blue" radius="md" size="sm">
                        <IconArrowRight size={14} stroke={3} />
                    </ActionIcon>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    const HeaderText = ({ children }) => (
        <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.8px' }}>
            {children}
        </Text>
    );

    return (
        <ScrollArea>
            <Table verticalSpacing="md" highlightOnHover withTableBorder radius="md">
                <Table.Thead bg="gray.0">
                    <Table.Tr>
                        <Table.Th><HeaderText>Client Info</HeaderText></Table.Th>
                        <Table.Th><HeaderText>Pan No.</HeaderText></Table.Th>
                        <Table.Th><HeaderText>Mobile No.</HeaderText></Table.Th>
                        <Table.Th><HeaderText>Type</HeaderText></Table.Th>
                        <Table.Th />
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {loading ? (
                        <Table.Tr>
                            <Table.Td colSpan={5}>
                                <Text ta="center" py="xl" c="dimmed">Loading clients...</Text>
                            </Table.Td>
                        </Table.Tr>
                    ) : rows.length > 0 ? (
                        rows
                    ) : (
                        <Table.Tr>
                            <Table.Td colSpan={5}>
                                <Text ta="center" py="xl" c="dimmed">No clients found</Text>
                            </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>
        </ScrollArea>
    );
};

export default ClientTable;
