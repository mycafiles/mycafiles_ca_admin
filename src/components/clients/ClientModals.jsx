import React, { useEffect, useCallback, useRef } from 'react';
import { Modal, TextInput, Select, Button, Group, Stack, Text, Box, Paper, useMantineTheme, ThemeIcon, Progress, Alert, Divider } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Dropzone, MS_EXCEL_MIME_TYPE } from '@mantine/dropzone';
const CSV_MIME_TYPE = ['text/csv'];
import { IconUpload, IconUser, IconBuildingSkyscraper, IconMail, IconPlus, IconPhone, IconIdBadge, IconCheck, IconX, IconFileSpreadsheet, IconAlertCircle, IconCalendar } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

import * as XLSX from 'xlsx';

const ClientModals = ({
    addModalOpen, setAddModalOpen,
    editModalOpen, setEditModalOpen,
    bulkModalOpen, setBulkModalOpen,
    formData, setFormData,
    errors,
    handleAddClient, handleEditClient, handleDeleteClient,
    handleBulkUpload, bulkFile, setBulkFile,
    isUploading, uploadProgress,
    selectedClient
}) => {
    const theme = useMantineTheme();
    const openRef = useRef(null);

    const downloadTemplate = () => {
        const templateData = [
            {
                name: 'Rajesh Kumar',
                mobileNumber: '9876543210',
                panNumber: 'ABCDE1234F',
                type: 'INDIVIDUAL',
                email: 'rajesh@example.com',
                gstNumber: '',
                tanNumber: '',
                dob: '1990-01-01'
            },
            {
                name: 'Kriyona Business Solution',
                mobileNumber: '9123456789',
                panNumber: 'FGHIJ5678K',
                type: 'BUSINESS',
                email: 'contact@kriyona.com',
                gstNumber: '24ABCDE1234F1Z5',
                tanNumber: 'ABCD12345E',
                dob: '2015-05-20'
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients Template');
        XLSX.writeFile(workbook, 'client_template.xlsx');
    };

    // 1. Copy-Paste Support for Bulk Import
    const handlePaste = useCallback((event) => {
        if (!bulkModalOpen) return;
        const items = (event.clipboardData || event.originalEvent.clipboardData).items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                const file = items[i].getAsFile();
                if (file) {
                    // Check if Excel or CSV
                    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel';
                    const isCSV = file.type === 'text/csv';
                    if (isExcel || isCSV) {
                        setBulkFile(file);
                        break;
                    }
                }
            }
        }
    }, [bulkModalOpen, setBulkFile]);

    useEffect(() => {
        if (bulkModalOpen) {
            window.addEventListener('paste', handlePaste);
        } else {
            window.removeEventListener('paste', handlePaste);
        }
        return () => window.removeEventListener('paste', handlePaste);
    }, [bulkModalOpen, handlePaste]);

    // 2. Auto-Select Client Type Logic
    useEffect(() => {
        if (formData.gstNumber || formData.tanNumber) {
            if (formData.type !== 'BUSINESS') {
                setFormData(prev => ({ ...prev, type: 'BUSINESS' }));
            }
        }
    }, [formData.gstNumber, formData.tanNumber, setFormData, formData.type]);

    return (
        <>
            {/* Add/Edit Modal */}
            <Modal
                opened={addModalOpen || editModalOpen}
                onClose={() => addModalOpen ? setAddModalOpen(false) : setEditModalOpen(false)}
                title={addModalOpen ? "Register New Client" : "Update Client Details"}
                size="lg"
                radius="md"
            >
                <form onSubmit={addModalOpen ? handleAddClient : handleEditClient}>
                    <Stack gap="md">
                        <Select
                            label="Account Type"
                            placeholder="Select account type"
                            leftSection={formData.type === 'BUSINESS' ? <IconBuildingSkyscraper size={18} /> : <IconUser size={18} />}
                            value={formData.type}
                            onChange={(value) => setFormData({ ...formData, type: value })}
                            data={[
                                { value: 'INDIVIDUAL', label: 'Individual Client' },
                                { value: 'BUSINESS', label: 'Business Client' },
                            ]}
                            radius="md"
                        />

                        <Group grow align="flex-start">
                            <TextInput
                                label="Cleint Name"
                                placeholder="Rajesh Kumar"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                error={errors.name}
                                leftSection={<IconUser size={18} color="var(--mantine-color-dimmed)" />}
                                radius="md"
                            />
                        </Group>

                        <Group grow align="flex-start">
                            <TextInput
                                label="Phone Number"
                                placeholder="98765 43210"
                                value={formData.mobileNumber}
                                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                                error={errors.mobileNumber}
                                leftSection={<IconPhone size={18} color="var(--mantine-color-dimmed)" />}
                                radius="md"
                            />
                            <TextInput
                                label="PAN Card Number"
                                placeholder="ABCDE1234F"
                                value={formData.panNumber}
                                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                                error={errors.panNumber}
                                leftSection={<IconIdBadge size={18} color="var(--mantine-color-dimmed)" />}
                                radius="md"
                            />
                        </Group>

                        <Group grow align="flex-start" mt="md">
                            <DateInput
                                label="Date of Birth"
                                placeholder="Pick date"
                                value={formData.dob}
                                onChange={(date) => setFormData({ ...formData, dob: date })}
                                icon={<IconCalendar size={18} />}
                                radius="md"
                                required
                            />
                        </Group>

                        <Divider my="xs" label="Optional Business Details" labelPosition="center" />

                        {/* GST and TAN Numbers (Optional) */}
                        <Group grow align="flex-start">
                            <TextInput
                                label="GST Number"
                                description="Auto-creates GST Folders if provided"
                                placeholder="24ABCDE1234F1Z5"
                                value={formData.gstNumber || ''}
                                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                                error={errors.gstNumber}
                                leftSection={<IconFileSpreadsheet size={18} color="var(--mantine-color-dimmed)" />}
                                radius="md"
                            />
                            <TextInput
                                label="TAN Number"
                                description="Optional"
                                placeholder="ABCD12345E"
                                value={formData.tanNumber || ''}
                                onChange={(e) => setFormData({ ...formData, tanNumber: e.target.value.toUpperCase() })}
                                error={errors.tanNumber}
                                leftSection={<IconFileSpreadsheet size={18} color="var(--mantine-color-dimmed)" />}
                                radius="md"
                            />
                        </Group>

                        <Group justify="flex-end" mt="xl" pt="md" style={{ borderTop: `1px solid ${theme.colors.gray[2]}` }}>
                            {editModalOpen && (
                                <Button
                                    variant="filled"
                                    color="red"
                                    onClick={() => handleDeleteClient(selectedClient._id)}
                                >
                                    Delete Client
                                </Button>
                            )}
                            <Button
                                type="submit"
                                size="md"
                                radius="md"
                                leftSection={<IconPlus size={18} />}
                            >
                                {addModalOpen ? 'Create Client' : 'Save Changes'}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            {/* Bulk Upload Modal */}
            <Modal
                opened={bulkModalOpen}
                onClose={() => {
                    if (isUploading) return;
                    setBulkModalOpen(false);
                    setBulkFile(null);
                }}
                closeOnClickOutside={!isUploading}
                closeOnEscape={!isUploading}
                withCloseButton={!isUploading}
                title="Import Client Records"
                radius="md"
            >
                <Stack gap="xl" py="md">
                    <Dropzone
                        openRef={openRef}
                        onDrop={(files) => setBulkFile(files[0])}
                        onReject={() => notifications.show({ color: 'red', message: 'Please upload a valid CSV or Excel file' })}
                        maxSize={5 * 1024 ** 2}
                        accept={[...MS_EXCEL_MIME_TYPE, ...CSV_MIME_TYPE]}
                        multiple={false}
                        disabled={isUploading}
                    >
                        <Group justify="center" gap="xl" mih={180} style={{ border: '2px dashed var(--mantine-color-gray-3)', borderRadius: theme.radius.lg, backgroundColor: 'var(--mantine-color-gray-0)', cursor: 'pointer' }}>
                            <Dropzone.Accept>
                                <IconUpload
                                    size={50}
                                    stroke={1.5}
                                    color={theme.colors.blue[6]}
                                />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <IconX
                                    size={50}
                                    stroke={1.5}
                                    color={theme.colors.red[6]}
                                />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <Stack align="center" gap="xs">

                                    <Box style={{ textAlign: 'center' }}>
                                        <Button
                                            variant="light"
                                            size="sm"
                                            radius="md"
                                            my='xs'
                                            onClick={() => openRef.current?.()}
                                            disabled={isUploading}
                                        >
                                            Select File
                                        </Button>
                                        <Text fw={700} size="lg">Click, drag, or paste sheet</Text>
                                        <Text size="sm" c="dimmed" mb="md">Compatible with CSV, XLS, or XLSX files</Text>

                                    </Box>
                                </Stack>
                            </Dropzone.Idle>
                        </Group>
                    </Dropzone>

                    {bulkFile && (
                        <Group gap="xs" p="xs" style={{ backgroundColor: theme.colors.green[0], borderRadius: theme.radius.md, border: `1px solid ${theme.colors.green[2]}` }}>
                            <IconCheck size={18} color={theme.colors.green[6]} />
                            <Box style={{ flex: 1 }}>
                                <Text size="sm" fw={700} color="green.7" truncate>{bulkFile.name}</Text>
                                <Text size="xs" color="green.6">{(bulkFile.size / 1024).toFixed(1)} KB</Text>
                            </Box>
                        </Group>
                    )}

                    {isUploading && (
                        <Stack gap="xs">
                            <Group justify="space-between">
                                <Text size="sm" fw={700}>Processing Records...</Text>
                                <Text size="sm" fw={700}>{uploadProgress}%</Text>
                            </Group>
                            <Progress value={uploadProgress} animated size="xl" radius="xl" />
                            <Alert icon={<IconAlertCircle size={16} />} title="Warning" color="orange" radius="md">
                                Please do not close this tab or refresh the page while processing is in progress.
                            </Alert>
                        </Stack>
                    )}

                    <Stack gap="xs">
                        <Button
                            fullWidth
                            size="md"
                            radius="md"
                            onClick={handleBulkUpload}
                            disabled={!bulkFile || isUploading}
                            loading={isUploading}
                        >
                            {isUploading ? 'Uploading...' : 'Process Records'}
                        </Button>
                        <Button
                            variant="transparent"
                            size="xs"
                            color="dimmed"
                            onClick={downloadTemplate}
                            disabled={isUploading}
                        >
                            Download Template Sheet
                        </Button>
                    </Stack>
                </Stack>
            </Modal>
        </>
    );
};

export default ClientModals;