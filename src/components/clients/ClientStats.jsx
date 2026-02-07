import React from 'react';
import { Card, Text, Group, ThemeIcon, Grid, Box } from '@mantine/core';
import { IconUsers, IconBuildingSkyscraper, IconUser, IconTrendingUp } from '@tabler/icons-react';
import { motion } from 'framer-motion';

const ClientStats = ({ stats, filterType, setFilterType }) => {
    const statItems = [
        { id: 'ALL', label: 'All Clients', count: stats.total, icon: IconUsers, color: 'blue' },
        { id: 'BUSINESS', label: 'Business Clients', count: stats.business, icon: IconBuildingSkyscraper, color: 'indigo' },
        { id: 'INDIVIDUAL', label: 'Individual Clients', count: stats.individual, icon: IconUser, color: 'teal' },
    ];

    return (
        <Grid gutter="md">
            {statItems.map((s, index) => (
                <Grid.Col key={s.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -4 }}
                    >
                        <Card
                            withBorder
                            padding="lg"
                            radius="md"
                            onClick={() => setFilterType(s.id)}
                            style={{
                                cursor: 'pointer',
                                borderWidth: '2px',
                                borderColor: filterType === s.id ? 'var(--mantine-color-blue-filled)' : 'var(--mantine-color-gray-3)',
                                backgroundColor: filterType === s.id ? 'var(--mantine-color-blue-light)' : 'white',
                                transition: 'all 0.2s ease',
                                height: '100%'
                            }}
                            className="hover:shadow-md"
                        >
                            <Group justify="space-between" mb="md">
                                <ThemeIcon
                                    size="xl"
                                    radius="md"
                                    variant="light"
                                    color={s.color}
                                >
                                    <s.icon size={24} />
                                </ThemeIcon>
                                {filterType === s.id && (
                                    <Box
                                        w={10}
                                        h={10}
                                        style={{
                                            borderRadius: '50%',
                                            backgroundColor: 'var(--mantine-color-blue-filled)',
                                            boxShadow: '0 0 0 4px var(--mantine-color-blue-light)'
                                        }}
                                    />
                                )}
                            </Group>

                            <div>
                                <Text size="xs" c="dimmed" fw={700} tt="uppercase" ls={1} mb={4}>
                                    {s.label}
                                </Text>
                                <Group gap="xs" align="baseline">
                                    <Text size="32px" fw={900} lh={1}>
                                        {s.count}
                                    </Text>
                                    {filterType === s.id && s.count > 0 && (
                                        <Text size="sm" c="blue" fw={600} className="flex items-center gap-1">
                                            <IconTrendingUp size={14} />
                                            Active
                                        </Text>
                                    )}
                                </Group>
                            </div>
                        </Card>
                    </motion.div>
                </Grid.Col>
            ))}
        </Grid>
    );
};

export default ClientStats;
