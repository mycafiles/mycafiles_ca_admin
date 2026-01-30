import { configureStore } from '@reduxjs/toolkit';
import clientReducer from './slices/clientSlice';

export const store = configureStore({
    reducer: {
        clients: clientReducer,
    },
});

export default store;
