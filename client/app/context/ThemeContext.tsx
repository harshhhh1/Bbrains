"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
    isDarkMode: boolean;
    setIsDarkMode: (val: boolean) => void;
    isDarkModeUnlocked: boolean;
    setIsDarkModeUnlocked: (val: boolean) => void;
    coins: number;
    setCoins: (val: number | ((prev: number) => number)) => void;
    dailyClaimed: boolean;
    setDailyClaimed: (val: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
    return ctx;
};

const stored = (key: string, fallback: any) => {
    if (typeof window === 'undefined') return fallback;
    try {
        const val = localStorage.getItem(key);
        return val !== null ? JSON.parse(val) : fallback;
    } catch { return fallback; }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isDarkModeUnlocked, setIsDarkModeUnlocked] = useState(false);
    const [coins, setCoins] = useState(80);
    const [dailyClaimed, setDailyClaimed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        setIsDarkMode(stored('bb-dark', false));
        setIsDarkModeUnlocked(stored('bb-dark-unlocked', false));
        setCoins(stored('bb-coins', 80));

        const lastDailyClaimed = stored('bb-daily', null);
        const today = new Date().toDateString();
        const claimedToday = lastDailyClaimed ? new Date(lastDailyClaimed).toDateString() === today : false;
        setDailyClaimed(claimedToday);
    }, []);

    useEffect(() => { if (isMounted) localStorage.setItem('bb-dark', JSON.stringify(isDarkMode)); }, [isDarkMode, isMounted]);
    useEffect(() => { if (isMounted) localStorage.setItem('bb-dark-unlocked', JSON.stringify(isDarkModeUnlocked)); }, [isDarkModeUnlocked, isMounted]);
    useEffect(() => { if (isMounted) localStorage.setItem('bb-coins', JSON.stringify(coins)); }, [coins, isMounted]);
    useEffect(() => {
        if (isMounted && dailyClaimed) localStorage.setItem('bb-daily', JSON.stringify(new Date().toISOString()));
    }, [dailyClaimed, isMounted]);

    useEffect(() => {
        if (isMounted) document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode, isMounted]);

    return (
        <ThemeContext.Provider value={{
            isDarkMode, setIsDarkMode,
            isDarkModeUnlocked, setIsDarkModeUnlocked,
            coins, setCoins,
            dailyClaimed, setDailyClaimed
        }}>
            {children}
        </ThemeContext.Provider>
    );
};
