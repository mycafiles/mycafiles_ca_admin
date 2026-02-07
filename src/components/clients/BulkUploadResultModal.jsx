import { Modal, Stack, Group, Text, Paper, ThemeIcon, Button, Table, Badge, Box, ScrollArea, Alert } from '@mantine/core';
import { IconCheck, IconX, IconAlertCircle, IconDownload, IconFileSpreadsheet } from '@tabler/icons-react';
import * as XLSX from 'xlsx';

const BulkUploadResultModal = ({ opened, onClose, result }) => {
    if (!result) return null;

    const { count = 0, skipped = 0, errors = [] } = result;
    const totalProcessed = count + skipped;
    const hasErrors = errors.length > 0;

    const downloadErrorReport = () => {
        if (errors.length === 0) return;

        const errorData = errors.map(err => ({
            'Row Number': err.row,
            'Error Reason': err.error
        }));

        const worksheet = XLSX.utils.json_to_sheet(errorData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Upload Errors');

        // Auto-size columns
        const maxWidth = 50;
        worksheet['!cols'] = [
            { wch: 12 }, // Row Number
            { wch: maxWidth } // Error Reason
        ];

        XLSX.writeFile(workbook, `bulk_upload_errors_${new Date().getTime()}.xlsx`);
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group gap="xs">
                    <ThemeIcon
                        size="lg"
                        radius="xl"
                        variant="light"
                        color={hasErrors ? (count > 0 ? 'yellow' : 'red') : 'green'}
                    >
                        {hasErrors ? <IconAlertCircle size={20} /> : <IconCheck size={20} />}
                    </ThemeIcon>
                    <Text fw={700} size="lg">Bulk Upload Complete</Text>
                </Group>
            }
            size="lg"
            radius="md"
            centered
        >
            <Stack gap="lg">
                {/* Summary Cards */}
                <Group grow>
                    {/* Success Card */}
                    <Paper p="md" radius="md" withBorder style={{ borderColor: 'var(--mantine-color-green-3)', backgroundColor: 'var(--mantine-color-green-0)' }}>
                        <Stack gap="xs" align="center">
                            <ThemeIcon size={48} radius="xl" variant="light" color="green">
                                <IconCheck size={28} stroke={2.5} />
                            </ThemeIcon>
                            <Text size="xl" fw={900} c="green.7">{count}</Text>
                            <Text size="sm" c="green.7" fw={600}>Successfully Added</Text>
                        </Stack>
                    </Paper>

                    {/* Failed/Skipped Card */}
                    <Paper
                        p="md"
                        radius="md"
                        withBorder
                        style={{
                            borderColor: skipped > 0 ? 'var(--mantine-color-red-3)' : 'var(--mantine-color-gray-3)',
                            backgroundColor: skipped > 0 ? 'var(--mantine-color-red-0)' : 'var(--mantine-color-gray-0)'
                        }}
                    >
                        <Stack gap="xs" align="center">
                            <ThemeIcon size={48} radius="xl" variant="light" color={skipped > 0 ? 'red' : 'gray'}>
                                <IconX size={28} stroke={2.5} />
                            </ThemeIcon>
                            <Text size="xl" fw={900} c={skipped > 0 ? 'red.7' : 'gray.7'}>{skipped}</Text>
                            <Text size="sm" c={skipped > 0 ? 'red.7' : 'gray.7'} fw={600}>Failed / Skipped</Text>
                        </Stack>
                    </Paper>
                </Group>

                {/* Overall Summary */}
                <Alert icon={<IconFileSpreadsheet size={16} />} color="blue" radius="md">
                    <Text size="sm" fw={500}>
                        Processed <strong>{totalProcessed}</strong> records from your file.
                        {count > 0 && <> <strong>{count}</strong> clients were successfully added to your database.</>}
                        {skipped > 0 && <> <strong>{skipped}</strong> records were skipped due to validation errors or duplicates.</>}
                    </Text>
                </Alert>

                {/* Error Details Table */}
                {hasErrors && (
                    <Stack gap="xs">
                        <Group justify="space-between" align="center">
                            <Text fw={700} size="sm" c="red.7">
                                Error Details ({errors.length})
                            </Text>
                            <Button
                                size="xs"
                                variant="light"
                                color="red"
                                leftSection={<IconDownload size={14} />}
                                onClick={downloadErrorReport}
                            >
                                Download Error Report
                            </Button>
                        </Group>

                        <ScrollArea h={Math.min(errors.length * 50 + 50, 300)} type="auto">
                            <Table striped highlightOnHover withTableBorder withColumnBorders>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th style={{ width: 80 }}>Row</Table.Th>
                                        <Table.Th>Error Reason</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {errors.map((err, index) => (
                                        <Table.Tr key={index}>
                                            <Table.Td>
                                                <Badge color="red" variant="light" size="sm">
                                                    #{err.row}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" c="red.8">{err.error}</Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </ScrollArea>

                        <Text size="xs" c="dimmed" ta="center">
                            💡 Tip: Fix the errors in your file and re-upload to add the remaining clients.
                        </Text>
                    </Stack>
                )}

                {/* No Errors Message */}
                {!hasErrors && count > 0 && (
                    <Alert icon={<IconCheck size={16} />} color="green" radius="md">
                        <Text size="sm" fw={500}>
                            🎉 All records were processed successfully! No errors found.
                        </Text>
                    </Alert>
                )}

                {/* All Failed Message */}
                {count === 0 && skipped > 0 && (
                    <Alert icon={<IconAlertCircle size={16} />} color="orange" radius="md">
                        <Text size="sm" fw={500}>
                            ⚠️ No clients were added. Please review the errors above and fix your file before re-uploading.
                        </Text>
                    </Alert>
                )}

                {/* Close Button */}
                <Button
                    fullWidth
                    size="md"
                    radius="md"
                    onClick={onClose}
                    variant={hasErrors ? 'outline' : 'filled'}
                    color={hasErrors ? 'gray' : 'green'}
                >
                    {hasErrors ? 'Close' : 'Done'}
                </Button>
            </Stack>
        </Modal>
    );
};

export default BulkUploadResultModal;
