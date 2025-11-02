import { LanguageContext, useLanguageState } from '@/src/hook/useLanguage';
import React from 'react';

interface LanguageProviderProps {
    children: React.ReactNode;
}

export default function LanguageProvider({ children }: LanguageProviderProps) {
    const languageState = useLanguageState();

    return (
        <LanguageContext.Provider value={languageState}>
            {children}
        </LanguageContext.Provider>
    );
}