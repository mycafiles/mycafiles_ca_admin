import React from 'react';
import { Group, TextInput, Select, Box } from '@mantine/core';
import { IconSearch, IconCalendar, IconFilter } from '@tabler/icons-react';

const ClientFilters = ({ search, setSearch, fy, setFy, filterType, setFilterType }) => {
    return (
        <Group justify="space-between" align="center" mb="md">
            {/* Search Bar */}
            <TextInput
                placeholder="Search clients by name, PAN, mobile..."
                leftSection={<IconSearch size={18} stroke={2.5} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="md"
                radius="md"
                style={{ flex: 1, maxWidth: 450 }}
                styles={{
                    input: {
                        '&:focus': {
                            borderColor: 'var(--mantine-color-blue-filled)',
                        }
                    }
                }}
            />

            {/* Filter Group */}
            <Group gap="xs">
                <Select
                    label="Financial Year"
                    placeholder="Select FY"
                    leftSection={<IconCalendar size={18} stroke={2.5} />}
                    value={fy}
                    onChange={setFy}
                    data={[
                        { value: '2024-25', label: '2024 - 25' },
                        { value: '2023-24', label: '2023 - 24' },
                        { value: '2022-23', label: '2022 - 23' },
                    ]}
                    size="sm"
                    radius="md"
                    w={150}
                />

                <Select
                    label="Entity Profile"
                    placeholder="Select Category"
                    leftSection={<IconFilter size={18} stroke={2.5} />}
                    value={filterType}
                    onChange={setFilterType}
                    data={[
                        { value: 'ALL', label: 'All Types' },
                        { value: 'INDIVIDUAL', label: 'Individual' },
                        { value: 'BUSINESS', label: 'Business' },
                    ]}
                    size="sm"
                    radius="md"
                    w={180}
                />
            </Group>
        </Group>
    );
};

export default ClientFilters;
