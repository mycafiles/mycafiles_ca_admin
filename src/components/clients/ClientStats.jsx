import React from 'react';
import { Card, Text, Group, ThemeIcon, Grid, Box, UnstyledButton } from '@mantine/core';
import { IconUsers, IconBuildingSkyscraper, IconUser, IconPlus } from '@tabler/icons-react';

const ClientStats = ({ stats, filterType, setFilterType, onBulkUpload }) => {
    const statItems = [
        { id: 'ALL', label: 'All Clients', count: stats.total, icon: IconUsers, color: 'blue' },
        { id: 'BUSINESS', label: 'Business Clients', count: stats.business, icon: IconBuildingSkyscraper, color: 'indigo' },
        { id: 'INDIVIDUAL', label: 'Individual Clients', count: stats.individual, icon: IconUser, color: 'teal' },
    ];

    return (
        <Grid gutter="md">
            {statItems.map((s) => (
                <Grid.Col key={s.id} span={{ base: 12, sm: 6, lg: 3 }}>
                    <Card
                        withBorder
                        padding="lg"
                        radius="md"
                        onClick={() => setFilterType(s.id)}
                        style={{
                            cursor: 'pointer',
                            borderColor: filterType === s.id ? 'var(--mantine-color-blue-filled)' : undefined,
                            backgroundColor: filterType === s.id ? 'var(--mantine-color-blue-light)' : 'white',
                            transition: 'all 0.2s ease'
                        }}
                        className="hover:shadow-sm"
                    >
                        <Group justify="space-between" mb="xs">
                            <ThemeIcon
                                size="lg"
                                radius="md"
                                variant="light"
                                color={s.color}
                            >
                                <s.icon size={20} />
                            </ThemeIcon>
                            {filterType === s.id && (
                                <Box
                                    w={8}
                                    h={8}
                                    style={{
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--mantine-color-blue-filled)',
                                        boxShadow: '0 0 0 4px var(--mantine-color-blue-light)'
                                    }}
                                />
                            )}
                        </Group>

                        <div>
                            <Text size="xs" c="dimmed" fw={700} tt="uppercase" ls={1}>
                                {s.label}
                            </Text>
                            <Text size="xl" fw={900}>
                                {s.count}
                            </Text>
                        </div>
                    </Card>
                </Grid.Col>
            ))}

            <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                <Card
                    withBorder
                    padding="lg"
                    radius="md"
                    onClick={onBulkUpload}
                    style={{
                        cursor: 'pointer',
                        borderStyle: 'dashed',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center'
                    }}
                    className="hover:bg-gray-50 transition-colors"
                >
                    <ThemeIcon size="lg" radius="md" variant="light" color="orange" mb="xs">
                        <IconPlus size={20} stroke={3} />
                    </ThemeIcon>
                    <Text fw={700} size="sm">Bulk Import</Text>
                    <Text size="xs" c="dimmed">Upload CSV/Excel</Text>
                </Card>
            </Grid.Col>
        </Grid>
    );
};

export default ClientStats;
