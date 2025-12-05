import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
    persist(
        (set) => ({
            mode: 'light', // 'light' | 'dark'
            type: 'gradient', // 'solid' | 'gradient'

            // Colors
            primaryColor: '#738fbd', // Default Salm Blue
            secondaryColor: '#cc8eb1', // Default Salm Purple

            // Actions
            setMode: (mode) => set({ mode }),
            setType: (type) => set({ type }),
            setPrimaryColor: (color) => set({ primaryColor: color }),
            setSecondaryColor: (color) => set({ secondaryColor: color }),

            resetTheme: () => set({
                mode: 'light',
                type: 'gradient',
                primaryColor: '#738fbd',
                secondaryColor: '#cc8eb1'
            })
        }),
        {
            name: 'theme-storage',
        }
    )
);

export default useThemeStore;
