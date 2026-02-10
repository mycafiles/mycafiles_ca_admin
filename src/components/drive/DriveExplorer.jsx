import { useState, useEffect, useCallback, useRef } from 'react';
import {
    SimpleGrid, Card, Text, Group, ActionIcon, Menu,
    Breadcrumbs, Anchor, ThemeIcon, Loader, Center, Button, FileButton,
    Table, SegmentedControl, Box, Transition, Stack, Modal, ScrollArea
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { Dropzone, IMAGE_MIME_TYPE, PDF_MIME_TYPE, MS_EXCEL_MIME_TYPE } from '@mantine/dropzone';
import {
    IconFolderFilled, IconFileTypePdf, IconFileTypeXls,
    IconPhoto, IconFileText, IconDotsVertical, IconDownload,
    IconEye, IconTrash, IconUpload, IconHome, IconLayoutGrid, IconList,
    IconChevronRight, IconX, IconArrowLeft
} from '@tabler/icons-react';
import { driveService } from '../../services/driveService';
import { notifications } from '@mantine/notifications';

export default function DriveExplorer({ clientId, activeYear }) {
    const [data, setData] = useState({ folders: [], files: [] });
    const [currentFolderId, setCurrentFolderId] = useState(null);
    const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'Root' }]);
    const [loading, setLoading] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('mrd_drive_view_mode') || 'grid'); // 'grid' or 'list'

    const getDownloadUrl = (file) => {
        return `${import.meta.env.VITE_API_URL}/drive/files/download/${file._id}?token=${localStorage.getItem('token')}`;
    };

    const handleViewModeChange = (value) => {
        setViewMode(value);
        localStorage.setItem('mrd_drive_view_mode', value);
    };

    // 1. Fetch Data
    const loadData = async () => {
        setLoading(true);
        try {
            const res = await driveService.getAllData(clientId);
            setData(res);
        } catch (error) {
            notifications.show({ color: 'red', message: 'Failed to load drive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (clientId) loadData(); }, [clientId]);

    const lastSyncedYear = useRef(null);
    // 2. Sync with "Active Year" (Sidebar/Tab selection)
    useEffect(() => {
        if (!loading && activeYear && data.folders.length > 0) {
            // Only auto-navigate to the year folder if the activeYear itself changed
            if (lastSyncedYear.current !== activeYear) {
                const yearFolder = data.folders.find(f => f.name === activeYear && f.parentFolderId === null);
                if (yearFolder) {
                    setCurrentFolderId(yearFolder._id);
                    setBreadcrumbs([{ id: null, name: 'Root' }, { id: yearFolder._id, name: yearFolder.name }]);
                } else {
                    setCurrentFolderId(null);
                    setBreadcrumbs([{ id: null, name: 'Root' }]);
                }
                lastSyncedYear.current = activeYear;
            }
        }
    }, [activeYear, data.folders, loading]);

    // 3. Filtering Logic
    const currentFolders = data.folders
        .filter(f => f.parentFolderId === currentFolderId)
        .sort((a, b) => {
            // Check if it's a Financial Year folder (Starts with "FY")
            const isYear = a.name.startsWith('FY') && b.name.startsWith('FY');

            if (isYear) {
                // Years: Descending (Newest First) -> 2025 before 2024
                return b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' });
            } else {
                // Months/Others: Ascending (Numeric) -> 1-APRIL before 2-MAY
                return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
            }
        });

    const formatFolderName = (name) => name.replace(/^\d+-/, '');

    const currentFiles = data.files.filter(f => f.folderId === currentFolderId);

    // 4. Handlers
    const handleEnterFolder = (folder) => {
        setCurrentFolderId(folder._id);
        setBreadcrumbs([...breadcrumbs, { id: folder._id, name: folder.name }]);
    };

    const handleBreadcrumbClick = (index) => {
        const target = breadcrumbs[index];
        setCurrentFolderId(target.id);
        setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    };

    const handleUpload = async (files) => {
        const fileList = Array.isArray(files) ? files : [files];
        if (fileList.length === 0 || !currentFolderId) return;

        try {
            notifications.show({
                id: 'uploading',
                loading: true,
                title: 'Uploading...',
                message: `Please wait while we upload ${fileList.length} file(s)`,
                autoClose: false,
                withCloseButton: false,
            });

            await Promise.all(fileList.map(file =>
                driveService.uploadFile(file, {
                    clientId: clientId,
                    folderId: currentFolderId,
                    category: 'GENERAL'
                })
            ));

            notifications.update({
                id: 'uploading',
                color: 'green',
                title: 'Success',
                message: 'All files uploaded successfully',
                loading: false,
                autoClose: 2000,
            });

            loadData(); // Refresh
        } catch (err) {
            notifications.update({
                id: 'uploading',
                color: 'red',
                title: 'Upload failed',
                message: 'Something went wrong during upload',
                loading: false,
                autoClose: 3000,
            });
        }
    };

    // 5. Copy-Paste Support
    const handlePaste = useCallback((event) => {
        if (!currentFolderId) return;

        const items = (event.clipboardData || event.originalEvent.clipboardData).items;
        const filesToUpload = [];

        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                const file = items[i].getAsFile();
                if (file) filesToUpload.push(file);
            }
        }

        if (filesToUpload.length > 0) {
            handleUpload(filesToUpload);
        }
    }, [currentFolderId, handleUpload]);

    useEffect(() => {
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [handlePaste]);

    // Helper: File Icons
    const getFileIcon = (mimeType, size = 24) => {
        if (mimeType?.includes('pdf')) return <IconFileTypePdf size={size} color="#FA5252" />;
        if (mimeType?.includes('sheet') || mimeType?.includes('excel')) return <IconFileTypeXls size={size} color="#40C057" />;
        if (mimeType?.includes('image')) return <IconPhoto size={size} color="#228BE6" />;
        return <IconFileText size={size} color="gray" />;
    };



    const handleDelete = async (fileId) => {
        modals.openConfirmModal({
            title: 'Delete File',
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to delete this file? It will be moved to the Recycle Bin.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                try {
                    notifications.show({
                        id: 'deleting',
                        loading: true,
                        title: 'Deleting...',
                        message: 'Please wait while we remove the file',
                        autoClose: false,
                        withCloseButton: false,
                    });

                    await driveService.deleteFile(fileId);

                    notifications.update({
                        id: 'deleting',
                        color: 'green',
                        title: 'Deleted',
                        message: 'File removed successfully',
                        loading: false,
                        autoClose: 2000,
                    });

                    loadData(); // Refresh
                } catch (err) {
                    notifications.update({
                        id: 'deleting',
                        color: 'red',
                        title: 'Delete failed',
                        message: 'Could not delete the file',
                        loading: false,
                        autoClose: 3000,
                    });
                }
            }
        });
    };

    // Render Actions Menu
    const renderActions = (file) => (
        <Menu position="bottom-end" shadow="md">
            <Menu.Target>
                <ActionIcon variant="subtle" color="gray" size="sm">
                    <IconDotsVertical size={16} />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item
                    leftSection={<IconDownload size={14} />}
                    component="a"
                    href={getDownloadUrl(file)}
                    download
                    onClick={(e) => e.stopPropagation()}
                >
                    Download
                </Menu.Item>
                <Menu.Item
                    leftSection={<IconEye size={14} />}
                    onClick={(e) => {
                        e.stopPropagation();
                        setPreviewFile(file);
                    }}
                >
                    Preview
                </Menu.Item>
                <Menu.Item
                    color="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file._id);
                    }}
                >
                    Delete
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );

    const isIncomeTaxFolder = breadcrumbs.some(b => b.name?.toLowerCase().includes('income tax'));

    if (loading && data.folders.length === 0) return <Center p="xl"><Loader size="sm" /></Center>;

    return (
        <Box p="md">
            {/* Header: Breadcrumbs & Actions */}
            <Group justify="space-between" mb="lg">
                <Group gap="sm">
                    {breadcrumbs.length > 1 && (
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="md"
                            radius="xl"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleBreadcrumbClick(breadcrumbs.length - 2);
                            }}
                        >
                            <IconArrowLeft size={18} />
                        </ActionIcon>
                    )}
                    <Breadcrumbs separator={<IconChevronRight size={14} stroke={1.5} color="gray" />}>
                        {breadcrumbs.map((item, idx) => (
                            <Anchor
                                key={item.id || 'root'}
                                size="sm"
                                c={idx === breadcrumbs.length - 1 ? 'black' : 'dimmed'}
                                fw={idx === breadcrumbs.length - 1 ? 600 : 400}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleBreadcrumbClick(idx);
                                }}
                                component="button"
                            >
                                {item.name === 'Root' ? <IconHome size={14} /> : item.name}
                            </Anchor>
                        ))}
                    </Breadcrumbs>
                </Group>

                <Group gap="xs" onClick={(e) => e.stopPropagation()}>
                    <SegmentedControl
                        size="xs"
                        value={viewMode}
                        onChange={handleViewModeChange}
                        data={[
                            { label: <Center><IconLayoutGrid size={16} /></Center>, value: 'grid' },
                            { label: <Center><IconList size={16} /></Center>, value: 'list' },
                        ]}
                    />
                </Group>
            </Group>

            {/* Content Area - Expands naturally */}
            <Box>
                {/* Persistent Upload Section - Show if leaf folder OR if it's an Income Tax folder */}
                {currentFolderId && (currentFolders.length === 0 || isIncomeTaxFolder) && (
                    <Box mb="xl">
                        <Dropzone
                            onDrop={handleUpload}
                            onReject={() => notifications.show({ color: 'red', message: 'File rejected. Check file type/size.' })}
                            maxSize={50 * 1024 ** 2}
                            accept={[...IMAGE_MIME_TYPE, ...PDF_MIME_TYPE, ...MS_EXCEL_MIME_TYPE]}
                            styles={{
                                root: {
                                    border: '2px dashed var(--mantine-color-gray-3)',
                                    borderRadius: 'var(--mantine-radius-md)',
                                    backgroundColor: 'var(--mantine-color-gray-0)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: 'var(--mantine-color-gray-1)',
                                        borderColor: 'var(--mantine-color-blue-4)',
                                    },
                                    position: 'relative'
                                }
                            }}
                        >
                            <Stack align="center" gap="xs" py="md">
                                <ThemeIcon size={40} variant="light" color="blue" radius="md">
                                    <IconUpload size={24} />
                                </ThemeIcon>
                                <Box style={{ textAlign: 'center' }}>
                                    <Text fw={700} size="sm">Click to upload or drag and drop</Text>
                                    <Text size="xs" c="dimmed">PDF, JPG, ZIP (MAX. 50MB) | Supported: Images, PDFs, Excel</Text>
                                </Box>
                            </Stack>
                        </Dropzone>
                    </Box>
                )}

                {currentFolders.length === 0 && currentFiles.length === 0 ? (
                    <Center mih={200}>
                        <Stack align="center" gap="xs">
                            <ThemeIcon size={50} variant="light" color="gray" radius="md">
                                <IconFolderFilled size={30} />
                            </ThemeIcon>
                            <Text c="dimmed" size="sm">This folder is empty</Text>
                        </Stack>
                    </Center>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <>
                                {currentFolders.length > 0 && (
                                    <Box mb="xl">
                                        <Text size="xs" fw={700} c="dimmed" mb="sm" tt="uppercase">Folders</Text>
                                        <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="lg">
                                            {currentFolders.map(folder => (
                                                <div
                                                    key={folder._id}
                                                    className="cursor-pointer p-6 rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:bg-gray-100 active:bg-gray-200 hover:border-blue-300"
                                                    onClick={(e) => { e.stopPropagation(); handleEnterFolder(folder); }}
                                                >
                                                    <Group wrap="nowrap">
                                                        <ThemeIcon size={42} variant="light" color="yellow" radius="md">
                                                            <IconFolderFilled size={24} />
                                                        </ThemeIcon>
                                                        <Text size="md" fw={600} truncate>{formatFolderName(folder.name)}</Text>
                                                    </Group>
                                                </div>
                                            ))}
                                        </SimpleGrid>
                                    </Box>
                                )}

                                {currentFiles.length > 0 && (
                                    <Box>
                                        <Text size="xs" fw={700} c="dimmed" mb="xs" tt="uppercase">Files</Text>
                                        <SimpleGrid cols={{ base: 1, sm: 3, lg: 4 }} spacing="md">
                                            {currentFiles.map(file => (
                                                <Card
                                                    key={file._id}
                                                    padding="sm"
                                                    radius="md"
                                                    withBorder
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="hover:shadow-xs transition-all"
                                                >
                                                    <Group justify="space-between" mb="xs" align="start">
                                                        {getFileIcon(file.fileType)}
                                                        {renderActions(file)}
                                                    </Group>
                                                    <Text size="sm" fw={600} lineClamp={1}>{file.fileName}</Text>
                                                    <Group justify="space-between" mt={5}>
                                                        <Text size="xs" c="dimmed">{new Date(file.createdAt).toLocaleDateString()}</Text>
                                                        <Text size="xs" c="dimmed">{(file.fileSize / 1024).toFixed(0)} KB</Text>
                                                    </Group>
                                                </Card>
                                            ))}
                                        </SimpleGrid>
                                    </Box>
                                )}
                            </>
                        ) : (
                            <Table verticalSpacing="sm" highlightOnHover withTableBorder radius="md">
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Name</Table.Th>
                                        <Table.Th>Type</Table.Th>
                                        <Table.Th>Size</Table.Th>
                                        <Table.Th>Date Modified</Table.Th>
                                        <Table.Th></Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {currentFolders.map(folder => (
                                        <tr
                                            key={folder._id}
                                            className="cursor-pointer border-b border-gray-100 transition-colors duration-200 hover:bg-gray-100 active:bg-gray-200"
                                            onClick={(e) => { e.stopPropagation(); handleEnterFolder(folder); }}
                                        >
                                            <td className="p-3">
                                                <Group gap="sm">
                                                    <IconFolderFilled size={18} color="#FAB005" />
                                                    <Text size="sm" fw={500}>{formatFolderName(folder.name)}</Text>
                                                </Group>
                                            </td>
                                            <td className="p-3"><Text size="xs" c="dimmed">Folder</Text></td>
                                            <td className="p-3"><Text size="xs" c="dimmed">—</Text></td>
                                            <td className="p-3"><Text size="xs" c="dimmed">{new Date(folder.updatedAt || folder.createdAt).toLocaleDateString()}</Text></td>
                                            <td className="p-3"></td>
                                        </tr>
                                    ))}
                                    {currentFiles.map(file => (
                                        <Table.Tr key={file._id} onClick={(e) => e.stopPropagation()}>
                                            <Table.Td>
                                                <Group gap="sm">
                                                    {getFileIcon(file.fileType, 18)}
                                                    <Text size="sm" fw={500}>{file.fileName}</Text>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td><Text size="xs" c="dimmed">{file.fileType?.split('/')[1]?.toUpperCase() || 'FILE'}</Text></Table.Td>
                                            <Table.Td><Text size="xs" c="dimmed">{(file.fileSize / 1024).toFixed(0)} KB</Text></Table.Td>
                                            <Table.Td><Text size="xs" c="dimmed">{new Date(file.createdAt).toLocaleDateString()}</Text></Table.Td>
                                            <Table.Td align="right">{renderActions(file)}</Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}
                    </>
                )}
            </Box>

            {/* Preview Modal */}
            <Modal
                opened={!!previewFile}
                onClose={() => setPreviewFile(null)}
                title={previewFile?.fileName}
                size="70%"
                radius="md"
                padding="md"
            >
                {previewFile && (
                    <Box>
                        {previewFile.fileType.includes('image') ? (
                            <Center>
                                <img
                                    src={previewFile.fileUrl}
                                    alt={previewFile.fileName}
                                    style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px' }}
                                />
                            </Center>
                        ) : previewFile.fileType.includes('pdf') ? (
                            <Stack align="center" gap="md">
                                <object
                                    data={previewFile.fileUrl}
                                    type="application/pdf"
                                    width="100%"
                                    height="600px"
                                    style={{ borderRadius: '8px' }}
                                >
                                    <Center h={300} bg="gray.0" w="100%" style={{ borderRadius: 8 }}>
                                        <Stack align="center" gap="xs">
                                            <Text size="sm">PDF Preview inhibited by browser settings</Text>
                                            <Button
                                                component="a"
                                                href={previewFile.fileUrl}
                                                target="_blank"
                                                variant="light"
                                                leftSection={<IconEye size={14} />}
                                            >
                                                Open in New Tab
                                            </Button>
                                        </Stack>
                                    </Center>
                                </object>
                                <Button
                                    fullWidth
                                    variant="subtle"
                                    component="a"
                                    href={previewFile.fileUrl}
                                    target="_blank"
                                    leftSection={<IconEye size={14} />}
                                >
                                    Open PDF in full screen (New Tab)
                                </Button>
                            </Stack>
                        ) : (
                            <Stack align="center" py="xl">
                                <ThemeIcon size={60} radius="xl" variant="light" color="blue">
                                    <IconFileText size={30} />
                                </ThemeIcon>
                                <Text fw={500}>Preview not available for this file type</Text>
                                <Button
                                    component="a"
                                    href={getDownloadUrl(previewFile)}
                                    download
                                    leftSection={<IconDownload size={14} />}
                                    variant="light"
                                >
                                    Download to view
                                </Button>
                            </Stack>
                        )}
                    </Box>
                )}
            </Modal>
        </Box>
    );
}
