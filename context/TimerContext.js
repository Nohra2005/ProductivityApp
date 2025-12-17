import React, { createContext, useState, useEffect, useRef, useMemo } from 'react';
import * as Notifications from 'expo-notifications';
export const TimerContext = createContext();

// Default configuration 
const DEFAULT_CONFIG = {
    workDuration: 30, // seconds
    restDuration: 10, // seconds
    rounds: 8,
};

export const TimerProvider = ({ children }) => {
    // State for timer running status
    const [isRunning, setIsRunning] = useState(false);

    // State for configuration (editable by the user)
    const [config, setConfigState] = useState(DEFAULT_CONFIG);

    // State for tracking the current interval status
    const [currentRound, setCurrentRound] = useState(1);
    const [isWorking, setIsWorking] = useState(true); // true = work, false = rest
    const [timeRemaining, setTimeRemaining] = useState(config.workDuration);

    const intervalRef = useRef(null); 

    const setConfig = (newConfig) => {
        setConfigState(newConfig);
        setTimeRemaining(newConfig.workDuration); // Reset display to new work time
        setCurrentRound(1);                       // Reset to round 1
        setIsWorking(true);                       // Ensure we start with "Work"
    };

    // Determine the total rounds/intervals completed so far
    const totalIntervalsCompleted = useMemo(() => {
        if (currentRound === 1) {
            return isWorking ? 0 : 1; 
        }
        return ((currentRound - 1) * 2) + (isWorking ? 1 : 2);
    }, [currentRound, isWorking]);

    const startTimer = () => setIsRunning(true);
    const pauseTimer = () => setIsRunning(false);

    const resetTimer = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsRunning(false);
        setCurrentRound(1);
        setIsWorking(true);
        setTimeRemaining(config.workDuration);
    };

    // Function to handle moving to the next interval/round
    const nextInterval = () => {
        if (isWorking) {
            setIsWorking(false);
            setTimeRemaining(config.restDuration);
            Notifications.scheduleNotificationAsync({
            content: { title: "Rest Time! ☕", body: "Take a breather.", sound: true },
            trigger: null, // Trigger immediately
        });
        } else {
            if (currentRound < config.rounds) {
                setCurrentRound(prev => prev + 1);
                setIsWorking(true);
                setTimeRemaining(config.workDuration);
                Notifications.scheduleNotificationAsync({
                content: { title: "Work! 💪", body: `Round ${currentRound + 1} starting!`, sound: true },
                trigger: null,
            });
            } else {
                resetTimer();
                Notifications.scheduleNotificationAsync({
                content: { title: "Workout Complete! 🎉", body: "Great job!", sound: true },
                trigger: null,
            });
            }
        }
    };

    // useEffect hook for countdown and transition
    useEffect(() => {
        if (isRunning && timeRemaining > 0) {
            intervalRef.current = setInterval(() => {
                setTimeRemaining(prevTime => prevTime - 1);
            }, 1000);
        } else if (timeRemaining === 0 && isRunning) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            nextInterval(); 
        } else if (!isRunning && intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeRemaining, config]); 

    const contextValue = {
        isRunning,
        startTimer,
        pauseTimer,
        resetTimer,
        config,
        setConfig, // Now uses the custom logic above
        timeRemaining,
        currentRound,
        isWorking,
        statusText: isWorking 
            ? `Work: Round ${currentRound}/${config.rounds}` 
            : `Rest: Round ${currentRound}/${config.rounds}`,
    };

    return (
        <TimerContext.Provider value={contextValue}>
            {children}
        </TimerContext.Provider>
    );
};