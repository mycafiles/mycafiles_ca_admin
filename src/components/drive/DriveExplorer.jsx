import { useState, useEffect, useCallback, useRef } from 'react';
import {
    SimpleGrid, Card, Text, Group, ActionIcon, Menu,
    Breadcrumbs, Anchor, ThemeIcon, Loader, Center, Button, FileButton,
    Table, SegmentedControl, Box, Transition, Stack, Modal
} from '@mantine/core';
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
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

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
        if (!window.confirm('Are you sure you want to delete this file?')) return;

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
                    href={file.fileUrl}
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

    if (loading && data.folders.length === 0) return <Center p="xl"><Loader size="sm" /></Center>;

    return (
        <Box pos="relative" style={{ minHeight: '400px' }} p="md">
            {/* Persistent Upload Section */}
            <Box mb="xl">
                <Dropzone
                    onDrop={handleUpload}
                    onReject={(files) => notifications.show({ color: 'red', message: 'File rejected. Check file type/size.' })}
                    maxSize={10 * 1024 ** 2}
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

                    <Dropzone.Accept>
                        <Center
                            pos="absolute"
                            inset={0}
                            bg="rgba(77, 128, 255, 0.1)"
                            style={{ zIndex: 10, border: '2px dashed var(--mantine-color-blue-6)', borderRadius: 8 }}
                        >
                            <Stack align="center" gap="xs">
                                <ThemeIcon size={60} radius="xl" variant="filled">
                                    <IconUpload size={30} />
                                </ThemeIcon>
                                <Text fw={700}>Drop to upload to this folder</Text>
                            </Stack>
                        </Center>
                    </Dropzone.Accept>

                    <Dropzone.Reject>
                        <Center
                            pos="absolute"
                            inset={0}
                            bg="rgba(250, 82, 82, 0.1)"
                            style={{ zIndex: 10, border: '2px dashed var(--mantine-color-red-6)', borderRadius: 8 }}
                        >
                            <Stack align="center" gap="xs">
                                <ThemeIcon size={60} radius="xl" color="red">
                                    <IconX size={30} />
                                </ThemeIcon>
                                <Text fw={700} c="red">Unsupported file type or too large</Text>
                            </Stack>
                        </Center>
                    </Dropzone.Reject>
                </Dropzone>
            </Box>

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
                            {/* Folders Grid */}
                            {currentFolders.length > 0 && (
                                <Box mb="xl">
                                    <Text size="xs" fw={700} c="dimmed" mb="sm" tt="uppercase">Folders</Text>
                                    <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="lg">
                                        {currentFolders.map(folder => (
                                            <Card
                                                key={folder._id}
                                                padding="lg"
                                                radius="md"
                                                withBorder
                                                className="cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEnterFolder(folder);
                                                }}
                                            >
                                                <Group wrap="nowrap">
                                                    <ThemeIcon size={42} variant="light" color="yellow" radius="md">
                                                        <IconFolderFilled size={24} />
                                                    </ThemeIcon>
                                                    <Text size="md" fw={600} truncate>{formatFolderName(folder.name)}</Text>
                                                </Group>
                                            </Card>
                                        ))}
                                    </SimpleGrid>
                                </Box>
                            )}

                            {/* Files Grid */}
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

                                                <Text size="sm" fw={600} lineClamp={1} title={file.fileName}>{file.fileName}</Text>
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
                        /* List View */
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
                                    <Table.Tr
                                        key={folder._id}
                                        className="cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEnterFolder(folder);
                                        }}
                                    >
                                        <Table.Td>
                                            <Group gap="sm">
                                                <IconFolderFilled size={18} color="#FAB005" />
                                                <Text size="sm" fw={500}>{formatFolderName(folder.name)}</Text>
                                            </Group>
                                        </Table.Td>
                                        <Table.Td><Text size="xs" c="dimmed">Folder</Text></Table.Td>
                                        <Table.Td><Text size="xs" c="dimmed">—</Text></Table.Td>
                                        <Table.Td><Text size="xs" c="dimmed">{new Date(folder.updatedAt || folder.createdAt).toLocaleDateString()}</Text></Table.Td>
                                        <Table.Td></Table.Td>
                                    </Table.Tr>
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
                                    href={previewFile.fileUrl}
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
