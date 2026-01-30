import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Title, Text, Button, Group, Stack, Box, ThemeIcon, Container } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import {
    fetchClients,
    addClient,
    updateClient,
    deleteClient,
    bulkUploadClients
} from '../store/slices/clientSlice';

// Modular Components
import ClientStats from '../components/clients/ClientStats';
import ClientFilters from '../components/clients/ClientFilters';
import ClientTable from '../components/clients/ClientTable';
import ClientModals from '../components/clients/ClientModals';

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

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        mobileNumber: '',
        panNumber: '',
        gstNumber: '',
        tanNumber: '',
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

    const validate = () => {
        const newErrors = {};
        if (formData.name.length < 2) newErrors.name = 'Name too short';
        if (!/^\d{10}$/.test(formData.mobileNumber)) newErrors.mobileNumber = 'Invalid mobile number';
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) newErrors.panNumber = 'Invalid PAN format';
        if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
            newErrors.gstNumber = 'Invalid GST format';
        }
        if (formData.tanNumber && !/^[A-Z]{4}[0-9]{5}[A-Z]{1}$/.test(formData.tanNumber)) {
            newErrors.tanNumber = 'Invalid TAN format';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddClient = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        const result = await dispatch(addClient(formData));
        if (!result.error) {
            setAddModalOpen(false);
            setFormData({ name: '', mobileNumber: '', panNumber: '', gstNumber: '', tanNumber: '', dob: null, type: 'INDIVIDUAL' });
        }
    };

    const handleEditClient = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        const result = await dispatch(updateClient({ id: selectedClient._id, data: formData }));
        if (!result.error) setEditModalOpen(false);
    };

    const handleDeleteClient = (id) => {
        if (window.confirm('Are you sure you want to remove this client? This action cannot be undone.')) {
            dispatch(deleteClient(id));
            setEditModalOpen(false);
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
            }, 500);
        } else {
            setIsUploading(false);
            setUploadProgress(0);
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
            {/* Page Header */}
            <Group justify="space-between" align="flex-end">
                <Box>
                    <Title order={1} fw={900} tracking="tight">Client Management</Title>
                    <Text c="dimmed" fw={500}>Manage and track your client base and compliance status.</Text>
                </Box>
                <Button
                    size="lg"
                    radius="md"
                    leftSection={<IconPlus size={18} stroke={3} />}
                    onClick={() => {
                        setFormData({
                            name: '',
                            mobileNumber: '',
                            panNumber: '',
                            gstNumber: '',
                            tanNumber: '',
                            dob: null,
                            type: 'INDIVIDUAL'
                        });
                        setAddModalOpen(true);
                    }}
                >
                    Add Client
                </Button>

            </Group>

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
            />
        </Stack>
    );
}
