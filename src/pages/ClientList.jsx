import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Title, Text, Button, Group, Stack, Box, ThemeIcon, Container } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPlus, IconX } from '@tabler/icons-react';

import {
    fetchClients,
    addClient,
    updateClient,
    deleteClient,
    bulkUploadClients
} from '../store/slices/clientSlice';
import { notifications } from '@mantine/notifications';

// Modular Components
import ClientStats from '../components/clients/ClientStats';
import ClientFilters from '../components/clients/ClientFilters';
import ClientTable from '../components/clients/ClientTable';
import ClientModals from '../components/clients/ClientModals';
import BulkUploadResultModal from '../components/clients/BulkUploadResultModal';

export default function ClientList() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { items: clients, loading } = useSelector((state) => state.clients);

    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [fy, setFy] = useState('2024-25');

    // Modal states
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [bulkFile, setBulkFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [resultModalOpen, setResultModalOpen] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        mobileNumber: '',
        panNumber: '',
        gstNumber: '',
        tanNumber: '',
        tradeNumber: '',
        gstId: '',
        gstPassword: '',
        address: '',
        dob: null,
        type: 'INDIVIDUAL'
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        dispatch(fetchClients());
    }, [dispatch]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isUploading) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isUploading]);

    const validateField = (name, value) => {
        let error = '';
        if (name === 'name' && value.length < 2) error = 'Name too short';

        if (name === 'mobileNumber' && !/^\d{10}$/.test(value)) error = 'Invalid mobile number (10 digits required)';

        if (name === 'panNumber' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
            error = 'Invalid PAN Number (Ex: ABCDE1234F)';
        }

        if (name === 'gstNumber' && value) {
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!gstRegex.test(value)) {
                error = 'Invalid GST Number (Ex: 22ABCDE1234F1Z5)';
            } else if (formData.panNumber && value.substring(2, 12) !== formData.panNumber) {
                error = 'GST Number does not match the entered PAN';
            }
        }

        if (name === 'tanNumber' && value) {
            if (value.length !== 10) {
                error = 'TDS Number must be 10 characters long';
            }
        }

        return error;
    };

    const handleInputChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));

        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const validate = () => {
        const newErrors = {};
        if (formData.name.length < 2) newErrors.name = 'Name too short';

        if (!/^\d{10}$/.test(formData.mobileNumber)) newErrors.mobileNumber = 'Invalid mobile number (10 digits required)';

        // PAN: 5 uppercase letters, 4 digits, 1 uppercase letter
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
            newErrors.panNumber = 'Invalid PAN Number (Ex: ABCDE1234F)';
        }

        // GST: 2 digits + PAN + 1 char + Z + 1 char
        if (formData.gstNumber) {
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!gstRegex.test(formData.gstNumber)) {
                newErrors.gstNumber = 'Invalid GST Number (Ex: 22ABCDE1234F1Z5)';
            } else if (formData.panNumber && formData.gstNumber.substring(2, 12) !== formData.panNumber) {
                newErrors.gstNumber = 'GST Number does not match the entered PAN';
            }
        }

        // TDS: Length 10
        if (formData.tanNumber) {
            if (formData.tanNumber.length !== 10) {
                newErrors.tanNumber = 'TDS Number must be 10 characters long';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const [submitting, setSubmitting] = useState(false);

    // ... (rest of state)

    const handleAddClient = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            const result = await dispatch(addClient(formData));
            if (!result.error) {
                setAddModalOpen(false);
                setFormData({ name: '', mobileNumber: '', panNumber: '', gstNumber: '', tanNumber: '', tradeNumber: '', gstId: '', gstPassword: '', address: '', dob: null, type: 'INDIVIDUAL' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditClient = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        modals.openConfirmModal({
            title: 'Confirm Update',
            children: (
                <Text size="sm">
                    Are you sure you want to update the details for <strong>{formData.name}</strong>?
                </Text>
            ),
            labels: { confirm: 'Update Client', cancel: 'Cancel' },
            confirmProps: { color: 'blue', loading: submitting },
            onConfirm: async () => {
                setSubmitting(true);
                try {
                    const result = await dispatch(updateClient({ id: selectedClient._id, data: formData }));
                    if (!result.error) setEditModalOpen(false);
                } finally {
                    setSubmitting(false);
                }
            }
        });
    };

    const handleDeleteClient = (id) => {
        modals.openConfirmModal({
            title: 'Delete Client',
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to remove this client? This action cannot be undone.
                </Text>
            ),
            labels: { confirm: 'Delete Client', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: () => {
                dispatch(deleteClient(id));
                setEditModalOpen(false);
            }
        });
    };

    const handleStatusChange = async (id, isActive) => {
        try {
            const result = await dispatch(updateClient({ id, data: { isActive } }));
            if (!result.error) {
                notifications.show({
                    title: 'Status Updated',
                    message: `Client ${isActive ? 'activated' : 'deactivated'} successfully`,
                    color: 'green'
                });
            }
        } catch (err) {
            notifications.show({
                title: 'Update Failed',
                message: 'Failed to update client status',
                color: 'red'
            });
        }
    };

    const handleEditClick = (client) => {
        setSelectedClient(client);
        setFormData({
            name: client.name,
            mobileNumber: client.mobileNumber,
            panNumber: client.panNumber,
            gstNumber: client.gstNumber || '',
            tanNumber: client.tanNumber || '',
            tradeNumber: client.tradeNumber || '',
            gstId: client.gstId || '',
            gstPassword: client.gstPassword || '',
            address: client.address || '',
            dob: client.dob ? new Date(client.dob) : null,
            type: client.type
        });
        setEditModalOpen(true);
    };

    const handleBulkUpload = async () => {
        if (!bulkFile) return;
        setIsUploading(true);
        setUploadProgress(0);

        const result = await dispatch(bulkUploadClients({
            file: bulkFile,
            onProgress: (progress) => {
                // Upload part: 0-90%
                setUploadProgress(Math.round(progress * 0.9));
            }
        }));

        if (!result.error) {
            setUploadProgress(100);

            setTimeout(() => {
                setBulkModalOpen(false);
                setBulkFile(null);
                setIsUploading(false);
                setUploadProgress(0);

                // Show result modal instead of notification
                setUploadResult(result.payload);
                setResultModalOpen(true);
            }, 500);
        } else {
            setIsUploading(false);
            setUploadProgress(0);
            notifications.show({
                title: 'Upload Failed',
                message: result.payload || 'An error occurred during bulk upload',
                color: 'red',
                icon: <IconX size={16} />
            });
        }
    };

    const filteredClients = useMemo(() => {
        return clients.filter(c => {
            const matchesSearch = (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
                (c.panNumber || '').toLowerCase().includes(search.toLowerCase()) ||
                (c.mobileNumber || '').includes(search);

            const clientType = (c.type || '').toUpperCase();
            const matchesFilter = filterType === 'ALL' || clientType === filterType;

            return matchesSearch && matchesFilter;
        });
    }, [clients, search, filterType]);

    const stats = useMemo(() => ({
        total: clients.length,
        business: clients.filter(c => (c.type || '').toUpperCase() === 'BUSINESS').length,
        individual: clients.filter(c => (c.type || '').toUpperCase() === 'INDIVIDUAL').length,
    }), [clients]);

    return (
        <Stack gap="xl" py="sm" >
            {/* Page Header with Actions */}
            <Box>
                <Group justify="space-between" align="flex-start" mb="md">
                    <Box>
                        <Title order={1} fw={900} size="32px" mb={4}>Client Management</Title>
                        <Text c="dimmed" size="sm" fw={500}>Manage and track your client base and compliance status</Text>
                    </Box>
                </Group>

                {/* Action Buttons Bar */}
                <Group gap="sm" mt="lg">
                    <Button
                        size="md"
                        radius="md"
                        leftSection={<IconPlus size={18} stroke={2.5} />}
                        onClick={() => {
                            setFormData({
                                name: '',
                                mobileNumber: '',
                                panNumber: '',
                                gstNumber: '',
                                tanNumber: '',
                                tradeNumber: '',
                                gstId: '',
                                gstPassword: '',
                                address: '',
                                dob: null,
                                type: 'INDIVIDUAL'
                            });
                            setAddModalOpen(true);
                        }}
                        style={{ height: '40px' }}
                    >
                        Add Client
                    </Button>
                    <Button
                        size="md"
                        radius="md"
                        variant="outline"
                        leftSection={<IconPlus size={18} stroke={2.5} />}
                        onClick={() => setBulkModalOpen(true)}
                        style={{ height: '40px' }}
                    >
                        Add Bulk Clients
                    </Button>
                </Group>
            </Box>

            {/* Statistics Section */}
            <ClientStats
                stats={stats}
                filterType={filterType}
                setFilterType={setFilterType}
                onBulkUpload={() => setBulkModalOpen(true)}
            />


            {/* Filter & Actions Section */}
            <ClientFilters
                search={search}
                setSearch={setSearch}
                fy={fy}
                setFy={setFy}
                filterType={filterType}
                setFilterType={setFilterType}
            />

            {/* Main Data Table */}
            <ClientTable
                data={filteredClients}
                loading={loading}
                onRowClick={(row) => navigate(`/dashboard/clients/${row._id}`)}
                onEdit={handleEditClick}
                onStatusChange={handleStatusChange}
            />

            {/* Feature Modals */}
            <ClientModals
                addModalOpen={addModalOpen}
                setAddModalOpen={setAddModalOpen}
                editModalOpen={editModalOpen}
                setEditModalOpen={setEditModalOpen}
                bulkModalOpen={bulkModalOpen}
                setBulkModalOpen={setBulkModalOpen}
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                handleAddClient={handleAddClient}
                handleEditClient={handleEditClient}
                handleDeleteClient={handleDeleteClient}
                handleBulkUpload={handleBulkUpload}
                bulkFile={bulkFile}
                setBulkFile={setBulkFile}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                selectedClient={selectedClient}
                handleInputChange={handleInputChange}
                submitting={submitting}
            />

            {/* Bulk Upload Result Modal */}
            <BulkUploadResultModal
                opened={resultModalOpen}
                onClose={() => {
                    setResultModalOpen(false);
                    setUploadResult(null);
                    // Refresh client list after closing result modal
                    dispatch(fetchClients());
                }}
                result={uploadResult}
            />
        </Stack>
    );
}
