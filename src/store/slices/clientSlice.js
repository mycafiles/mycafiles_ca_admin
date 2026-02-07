import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { clientService } from '../../services/clientService';

export const fetchClients = createAsyncThunk(
    'clients/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const data = await clientService.getClients();
            return data.data || [];
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch clients');
        }
    }
);

export const addClient = createAsyncThunk(
    'clients/add',
    async (clientData, { dispatch, rejectWithValue }) => {
        try {
            const data = await clientService.createClient(clientData);
            dispatch(fetchClients());
            return data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to add client');
        }
    }
);

export const updateClient = createAsyncThunk(
    'clients/update',
    async ({ id, data }, { dispatch, rejectWithValue }) => {
        try {
            const response = await clientService.updateClient(id, data);
            dispatch(fetchClients());
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update client');
        }
    }
);

export const deleteClient = createAsyncThunk(
    'clients/delete',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            await clientService.deleteClient(id);
            dispatch(fetchClients());
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete client');
        }
    }
);

export const bulkUploadClients = createAsyncThunk(
    'clients/bulkUpload',
    async ({ file, onProgress }, { dispatch, rejectWithValue }) => {
        try {
            const response = await clientService.bulkUpload(file, onProgress);
            dispatch(fetchClients());
            return response;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Bulk upload failed');
        }
    }
);

const clientSlice = createSlice({
    name: 'clients',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchClients.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClients.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchClients.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default clientSlice.reducer;
