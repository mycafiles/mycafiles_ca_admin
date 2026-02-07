import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconIdBadge } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { Text } from '@mantine/core'; // Need Text for modal children
import { clientService } from '../services/clientService';

// Custom Components
// Custom Components
import Badge from '../components/Badge';
import DriveExplorer from '../components/drive/DriveExplorer';
import ClientModals from '../components/clients/ClientModals';

// NOTE: Must match backend folder names exactly
const YEARS = ['FY - 2025-26', 'FY - 2024-25', 'FY - 2023-24', 'FY - 2022-23'];

export default function ClientDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);

    // Default to the first year in your list
    const [selectedYear, setSelectedYear] = useState(YEARS[0]);

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    // Handler to open modal and prepopulate data
    const handleEditClick = () => {
        if (!client) return;
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

    const [submitting, setSubmitting] = useState(false);

    // ... (rest)

    const handleEditClient = async (e) => {
        e.preventDefault();

        modals.openConfirmModal({
            title: 'Confirm Update',
            children: (
                <Text size="sm">
                    Are you sure you want to update the details for <strong>{formData.name}</strong>?
                </Text>
            ),
            labels: { confirm: 'Update', cancel: 'Cancel' },
            confirmProps: { color: 'blue', loading: submitting },
            onConfirm: async () => {
                setSubmitting(true);
                try {
                    const updated = await clientService.updateClient(id, formData);
                    setClient(updated); // Update local state
                    setEditModalOpen(false);
                } catch (err) {
                    console.error('Update failed', err);
                    // setErrors({ ... }) // Handle API errors if needed
                } finally {
                    setSubmitting(false);
                }
            }
        });
    };

    const handleDeleteClient = async (clientId) => {
        modals.openConfirmModal({
            title: 'Delete Client',
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to delete this client? This action cannot be undone.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                await clientService.deleteClient(clientId);
                navigate('/dashboard/clients');
            }
        });
    };

    useEffect(() => {
        const fetchClient = async () => {
            try {
                const data = await clientService.getClientById(id);
                setClient(data);
            } catch (err) {
                console.error('Error fetching client:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchClient();
    }, [id]);

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!client) return <div className="p-10 text-center">Client not found</div>;

    const isBusiness = client.type === 'BUSINESS';

    return (
        <div className="h-[calc(100vh-64px)] -mx-6 -mt-6 bg-[#f9fafb] flex flex-col">
            {/* Header Section */}
            <div className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex-shrink-0">
                {/* Back Button Row */}
                <div className="mb-3">
                    <button
                        onClick={() => navigate('/dashboard/clients')}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                        <IconArrowLeft size={18} stroke={2.5} />
                        Back to Clients
                    </button>
                </div>

                {/* Client Info Row */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 transition-colors ${isBusiness
                            ? 'bg-indigo-50 border-indigo-100/50 text-indigo-600'
                            : 'bg-emerald-50 border-emerald-100/50 text-emerald-600'
                            }`}>
                            <span className="text-2xl font-black uppercase">{client.name.charAt(0)}</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-2xl font-bold text-[#111827]">{client.name}</h2>
                                <Badge variant={isBusiness ? 'business' : 'individual'}>
                                    {isBusiness ? 'Business' : 'Individual'}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{client.panNumber}</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span>{client.mobileNumber}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleEditClick}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm"
                        >
                            <IconIdBadge size={18} />
                            View Details
                        </button>
                    </div>
                </div>
            </div>

            {/* Content - Finder Style Drive Explorer */}
            <div className="flex-1 overflow-hidden p-6">
                <div className="h-full bg-white rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col">
                    {/* 
                        DriveExplorer handles its own navigation and year selection internally 
                        or we pass a default year.
                    */}
                    <div className="flex-1 overflow-hidden">
                        <DriveExplorer
                            clientId={id}
                            activeYear={YEARS[0]} // Pass default, but Explorer should probably handle changing it
                        />
                    </div>
                </div>
            </div>

            <ClientModals
                editModalOpen={editModalOpen}
                setEditModalOpen={setEditModalOpen}
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                handleEditClient={handleEditClient}
                handleDeleteClient={handleDeleteClient}
                selectedClient={client}
                submitting={submitting}
            />
        </div>
    );
}