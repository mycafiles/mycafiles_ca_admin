import { useState, useEffect } from 'react';
import { Title, Text, Button, Group, Stack, Card, Badge, Switch, Modal, TextInput, NumberInput, ActionIcon, LoadingOverlay, FileInput, Image, AspectRatio } from '@mantine/core';
import { IconPlus, IconTrash, IconSpeakerphone, IconUpload, IconPhoto } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import bannerService from '../services/bannerService';

export default function BannerManagement() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        image: null,
        order: 0
    });
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const data = await bannerService.getAllBanners();
            setBanners(data);
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Failed to fetch banners',
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.title || !formData.image) {
            notifications.show({ title: 'Error', message: 'Title and Image are required', color: 'red' });
            return;
        }

        try {
            setSubmitting(true);
            const data = new FormData();
            data.append('title', formData.title);
            data.append('image', formData.image);
            data.append('order', formData.order);

            await bannerService.createBanner(data);
            notifications.show({ title: 'Success', message: 'Banner created successfully', color: 'green' });
            setModalOpen(false);
            setFormData({ title: '', image: null, order: 0 });
            setPreview(null);
            fetchBanners();
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to create banner', color: 'red' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) return;
        try {
            await bannerService.deleteBanner(id);
            notifications.show({ title: 'Deleted', message: 'Banner removed', color: 'blue' });
            fetchBanners();
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to delete banner', color: 'red' });
        }
    };

    const handleToggle = async (id) => {
        try {
            await bannerService.toggleBanner(id);
            setBanners(prev => prev.map(b => b._id === id ? { ...b, isActive: !b.isActive } : b));
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to update status', color: 'red' });
            fetchBanners();
        }
    };

    const handleImageChange = (file) => {
        setFormData({ ...formData, image: file });
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
        } else {
            setPreview(null);
        }
    };

    return (
        <Stack gap="xl" py="sm">
            <Group justify="space-between" align="flex-end">
                <div>
                    <Title order={1} fw={900} tracking="tight">App Banners</Title>
                    <Text c="dimmed" fw={500}>Manage image banners visible in the mobile app carousel.</Text>
                </div>
                <Button
                    leftSection={<IconPlus size={18} />}
                    onClick={() => setModalOpen(true)}
                    size="md"
                    radius="md"
                >
                    Add Banner
                </Button>
            </Group>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative min-h-[200px]">
                <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />

                {!loading && banners.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <IconSpeakerphone size={48} stroke={1} />
                        <Text mt="md" fw={500}>No banners active</Text>
                        <Text size="sm">Upload an image to engage your clients.</Text>
                    </div>
                )}

                {banners.map((banner) => (
                    <Card key={banner._id} shadow="sm" padding="lg" radius="md" withBorder>
                        <Card.Section>
                            <AspectRatio ratio={2 / 1}>
                                <Image src={banner.imageUrl} alt={banner.title} fit="cover" />
                            </AspectRatio>
                        </Card.Section>

                        <Group justify="space-between" mt="md" mb="xs">
                            <Badge color={banner.isActive ? 'green' : 'gray'} variant="light">
                                {banner.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(banner._id)}>
                                <IconTrash size={16} />
                            </ActionIcon>
                        </Group>

                        <Text fw={700} size="lg" lineClamp={1}>{banner.title}</Text>

                        <Group mt="md" align="center">
                            <Switch
                                label="Published"
                                checked={banner.isActive}
                                onChange={() => handleToggle(banner._id)}
                            />
                        </Group>
                    </Card>
                ))}
            </div>

            <Modal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                title={<Text fw={700}>Create New Banner</Text>}
                centered
            >
                <Stack>
                    <TextInput
                        label="Banner Title"
                        placeholder="Internal Name (e.g. Diwali Offer)"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />

                    <FileInput
                        label="Banner Image"
                        description="Recommended size: 1000x500px"
                        placeholder="Click to upload"
                        leftSection={<IconUpload size={16} />}
                        accept="image/png,image/jpeg,image/webp"
                        value={formData.image}
                        onChange={handleImageChange}
                        required
                    />

                    {preview && (
                        <AspectRatio ratio={2 / 1}>
                            <Image src={preview} radius="md" alt="Preview" />
                        </AspectRatio>
                    )}

                    <NumberInput
                        label="Sort Order"
                        description="Higher numbers appear first"
                        value={formData.order}
                        onChange={(val) => setFormData({ ...formData, order: val })}
                    />

                    <Button mt="md" fullWidth onClick={handleCreate} loading={submitting}>
                        Upload & Create
                    </Button>
                </Stack>
            </Modal>
        </Stack>
    );
}
