import OneSignal from 'react-onesignal';

export const oneSignalService = {
    async init() {
        try {
            await OneSignal.init({
                appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
                allowLocalhostAsSecureOrigin: true,
            });
            console.log('OneSignal initialized');
        } catch (e) {
            console.error('OneSignal initialization failed:', e);
        }
    },

    async setExternalUserId(userId) {
        console.log('Attempting to set OneSignal External ID for:', userId);
        try {
            if (userId) {
                await OneSignal.login(userId);
                console.log('✅ OneSignal login successful for ID:', userId);
                const id = await OneSignal.getUserId();
                console.log('OneSignal internal Player ID:', id);
            } else {
                console.warn('⚠️ No userId provided to setExternalUserId');
            }
        } catch (e) {
            console.error('❌ OneSignal login failed:', e);
        }
    },

    async removeExternalUserId() {
        try {
            await OneSignal.logout();
            console.log('OneSignal external id removed');
        } catch (e) {
            console.error('OneSignal removeExternalUserId failed:', e);
        }
    }
};
