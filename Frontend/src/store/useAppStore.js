import { create } from 'zustand';

/**
 * Global app store powered by Zustand.
 * Manages the reporting flow state and Firebase auth state.
 */
const useAppStore = create((set) => ({
    // ─── Auth ────────────────────────────────────────────────────────────────
    user: null,
    initializing: true,
    setUser: (user) => set({ user }),
    setInitializing: (initializing) => set({ initializing }),

    // ─── Navigation ──────────────────────────────────────────────────────────
    view: 'report', // 'report' | 'dashboard' | 'ministry'
    setView: (view) => set({ view }),

    // ─── Reporting Flow ──────────────────────────────────────────────────────
    step: 1, // 1=Upload | 2=AI Scan | 3=Location Form | 4=Success
    file: null,
    verificationData: null,

    // Move to AI scan step
    handleFileSelect: (file) => set({ file, step: 2 }),

    // Move to location form step
    handleVerifySuccess: (data) => set({ verificationData: data, step: 3 }),

    // Move to success step
    handleSubmissionSuccess: () => set({ step: 4 }),

    // Reset the entire reporting flow
    handleReset: () => set({ file: null, verificationData: null, step: 1 }),
}));

export default useAppStore;
