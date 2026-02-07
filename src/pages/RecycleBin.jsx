import { useEffect, useState } from 'react';
import { clientService } from '../services/clientService';
import { driveService } from '../services/driveService';
import { notifications } from '@mantine/notifications';
import {
    IconTrash,
    IconRefresh,
    IconFile,
    IconFolder,
    IconAlertCircle,
    IconSearch,
    IconTrashX // For empty state or delete forever
} from '@tabler/icons-react';
import { Loader, Modal, Button as MantineButton, Text, Select } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useDisclosure } from '@mantine/hooks';

export default function RecycleBin() {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [binItems, setBinItems] = useState({ folders: [], files: [] });
    const [loading, setLoading] = useState(false);
    const [restoring, setRestoring] = useState(null); // id of item being restored/deleted

    // For search/filter
    const [searchQuery, setSearchQuery] = useState('');


    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        // Auto-select first client if available
        if (clients.length > 0 && !selectedClient) {
            setSelectedClient(clients[0]._id);
        }
    }, [clients]);

    useEffect(() => {
        if (selectedClient) {
            fetchBinItems(selectedClient);
        }
    }, [selectedClient]);

    const fetchClients = async () => {
        try {
            const data = await clientService.getClients();
            // Adjust based on actual API response structure (e.g., data.results vs data)
            setClients(data.data || []);
        } catch (err) {
            console.error(err);
            notifications.show({
                title: 'Error',
                message: 'Failed to fetch clients',
                color: 'red'
            });
        }
    };

    const fetchBinItems = async (clientId) => {
        setLoading(true);
        try {
            const data = await driveService.getBinItems(clientId);
            setBinItems(data);
        } catch (err) {
            console.error(err);
            notifications.show({
                title: 'Error',
                message: 'Failed to fetch bin items',
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (type, id) => {
        modals.openConfirmModal({
            title: 'Restore Item',
            children: (
                <Text size="sm">
                    Are you sure you want to restore this item? It will be moved back to its original location.
                </Text>
            ),
            labels: { confirm: 'Restore', cancel: 'Cancel' },
            confirmProps: { color: 'green' },
            onConfirm: async () => {
                setRestoring(id);
                try {
                    await driveService.restoreItem(type, id);
                    notifications.show({
                        title: 'Success',
                        message: 'Item restored successfully',
                        color: 'green'
                    });
                    // Refresh list
                    fetchBinItems(selectedClient);
                } catch (err) {
                    console.error(err);
                    notifications.show({
                        title: 'Error',
                        message: 'Failed to restore item',
                        color: 'red'
                    });
                } finally {
                    setRestoring(null);
                }
            }
        });
    };

    const handlePermanentDelete = async (type, id) => {
        modals.openConfirmModal({
            title: 'Permanently Delete',
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure? This action <strong>CANNOT</strong> be undone. The item will be lost forever.
                </Text>
            ),
            labels: { confirm: 'Delete Forever', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                setRestoring(id);
                try {
                    await driveService.permanentDelete(type, id);
                    notifications.show({
                        title: 'Success',
                        message: 'Item permanently deleted',
                        color: 'green'
                    });
                    // Refresh list
                    fetchBinItems(selectedClient);
                } catch (err) {
                    console.error(err);
                    notifications.show({
                        title: 'Error',
                        message: 'Failed to delete item',
                        color: 'red'
                    });
                } finally {
                    setRestoring(null);
                }
            }
        });
    };

    // Filter items
    const filteredFolders = binItems.folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredFiles = binItems.files.filter(f => f.fileName.toLowerCase().includes(searchQuery.toLowerCase()));
    const hasItems = filteredFolders.length > 0 || filteredFiles.length > 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-border shadow-sm">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                        <IconTrash size={24} stroke={2} />
                        Recycle Bin
                    </h2>
                    <p className="text-sm text-gray-500">Items are automatically deleted after 90 days.</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Client Selector */}
                    {/* Client Selector */}
                    <Select
                        placeholder="Select Client"
                        data={clients.map(c => ({ value: c._id, label: c.name }))}
                        value={selectedClient}
                        onChange={setSelectedClient}
                        searchable
                        clearable
                        className="w-64"
                        styles={{
                            input: {
                                height: 42,
                                borderRadius: 12,
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#f8fafc',
                                fontWeight: 500
                            }
                        }}
                    />

                    {/* Search */}
                    <div className="relative">
                        <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search bin..."
                            className="pl-9 pr-4 py-2 rounded-lg border border-border bg-slate-50 text-sm focus:ring-2 focus:ring-primary/20 outline-none w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader color="blue" />
                </div>
            ) : !hasItems ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <div className="bg-slate-50 p-6 rounded-full mb-4">
                        <IconTrashX size={48} stroke={1.5} />
                    </div>
                    <p className="text-lg font-medium">Recycle Bin is Empty</p>
                    <p className="text-sm">No items found for this client.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-slate-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <div className="col-span-5">Name</div>
                        <div className="col-span-2">Type</div>
                        <div className="col-span-3">Deleted Date</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    <div className="divide-y divide-border">
                        {/* Folders */}
                        {filteredFolders.map(folder => (
                            <div key={folder._id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors group">
                                <div className="col-span-5 flex items-center gap-3">
                                    <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                                        <IconFolder size={20} stroke={2} />
                                    </div>
                                    <span className="font-medium text-gray-900">{folder.name}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                                        Folder
                                    </span>
                                </div>
                                <div className="col-span-3 text-sm text-gray-500 font-medium font-mono">
                                    {new Date(folder.deletedAt).toLocaleDateString()}
                                </div>
                                <div className="col-span-2 flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleRestore('folder', folder._id)}
                                        disabled={restoring === folder._id}
                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                        title="Restore"
                                    >
                                        <IconRefresh size={18} stroke={2} />
                                    </button>
                                    <button
                                        onClick={() => handlePermanentDelete('folder', folder._id)}
                                        disabled={restoring === folder._id}
                                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        title="Delete Forever"
                                    >
                                        <IconTrashX size={18} stroke={2} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Files */}
                        {filteredFiles.map(file => (
                            <div key={file._id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors group">
                                <div className="col-span-5 flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <IconFile size={20} stroke={2} />
                                    </div>
                                    <span className="font-medium text-gray-900 truncate" title={file.fileName}>{file.fileName}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 uppercase">
                                        {file.fileType ? file.fileType.split('/')[1] : 'FILE'}
                                    </span>
                                </div>
                                <div className="col-span-3 text-sm text-gray-500 font-medium font-mono">
                                    {new Date(file.deletedAt).toLocaleDateString()}
                                </div>
                                <div className="col-span-2 flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleRestore('file', file._id)}
                                        disabled={restoring === file._id}
                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                        title="Restore"
                                    >
                                        <IconRefresh size={18} stroke={2} />
                                    </button>
                                    <button
                                        onClick={() => handlePermanentDelete('file', file._id)}
                                        disabled={restoring === file._id}
                                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        title="Delete Forever"
                                    >
                                        <IconTrashX size={18} stroke={2} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
