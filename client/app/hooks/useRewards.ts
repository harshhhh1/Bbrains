"use client"

import { useState, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';

export const useRewards = (DAILY_POINTS: number = 50) => {
    const { coins, setCoins, dailyClaimed, setDailyClaimed, setIsDarkModeUnlocked, setIsDarkMode } = useTheme();
    const [animatingCoins, setAnimatingCoins] = useState(false);
    const [justClaimed, setJustClaimed] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = useCallback((msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    }, []);

    const animateCoins = useCallback((target: number) => {
        setAnimatingCoins(true);
        const start = coins;
        const diff = target - start;
        const startTime = Date.now();

        const tick = () => {
            const p = Math.min((Date.now() - startTime) / 1000, 1);
            const currentCoins = Math.round(start + diff * (1 - Math.pow(1 - p, 3)));
            setCoins(currentCoins);

            if (p < 1) {
                requestAnimationFrame(tick);
            } else {
                setAnimatingCoins(false);
            }
        };

        requestAnimationFrame(tick);
    }, [coins, setCoins]);

    const claimDailyPoints = useCallback(() => {
        if (dailyClaimed) return;
        animateCoins(coins + DAILY_POINTS);
        setDailyClaimed(true);
        setJustClaimed(true);
        showToast(`Daily reward claimed! +${DAILY_POINTS} 🎉 Now unlock Dark Mode!`);
        setTimeout(() => setJustClaimed(false), 10000);
    }, [dailyClaimed, animateCoins, coins, setDailyClaimed, showToast, DAILY_POINTS]);

    const purchaseDarkMode = useCallback((DARK_MODE_PRICE: number) => {
        if (coins < DARK_MODE_PRICE) {
            showToast("Not enough coins! Claim daily rewards first.");
            return;
        }
        animateCoins(coins - DARK_MODE_PRICE);
        setTimeout(() => {
            setIsDarkModeUnlocked(true);
            setIsDarkMode(true);
            setJustClaimed(false);
            showToast('Dark Mode unlocked! 🌙 Enjoy your upgrade!');
        }, 500);
    }, [coins, animateCoins, setIsDarkModeUnlocked, setIsDarkMode, showToast]);

    return {
        animatingCoins,
        justClaimed,
        toast,
        showToast,
        claimDailyPoints,
        purchaseDarkMode,
        setJustClaimed
    };
};
