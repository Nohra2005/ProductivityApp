import React, { useContext, useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput, 
    Keyboard, 
    ScrollView, 
    Vibration,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { TimerContext } from '../context/TimerContext'; 
import { secondsToHms, hmsToSeconds } from '../utils/TimeUtils'; 
import { Ionicons } from '@expo/vector-icons';

const TimerScreen = () => {
    const { 
        timeRemaining, 
        isRunning, 
        startTimer, 
        pauseTimer, 
        resetTimer, 
        config,
        setConfig,
        currentRound,
        statusText,
        isWorking
    } = useContext(TimerContext);

    // State for inputs
    const [tempConfig, setTempConfig] = useState({
        workH: secondsToHms(config.workDuration).h.toString(),
        workM: secondsToHms(config.workDuration).m.toString(),
        workS: secondsToHms(config.workDuration).s.toString(),
        restH: secondsToHms(config.restDuration).h.toString(),
        restM: secondsToHms(config.restDuration).m.toString(),
        restS: secondsToHms(config.restDuration).s.toString(),
        rounds: config.rounds.toString(),
    });
    
    // Logic to start a fresh session with the numbers in the boxes
    const handleStartWithSettings = () => {
        Keyboard.dismiss();
        Vibration.vibrate(50);

        const newWorkDuration = hmsToSeconds(
            parseInt(tempConfig.workH) || 0,
            parseInt(tempConfig.workM) || 0,
            parseInt(tempConfig.workS) || 0
        );
        const newRestDuration = hmsToSeconds(
            parseInt(tempConfig.restH) || 0,
            parseInt(tempConfig.restM) || 0,
            parseInt(tempConfig.restS) || 0
        );

        if (newWorkDuration <= 0 || newRestDuration < 0 || parseInt(tempConfig.rounds) < 1) {
            alert("Please enter valid durations and rounds.");
            return;
        }

        setConfig({
            workDuration: newWorkDuration,
            restDuration: newRestDuration,
            rounds: parseInt(tempConfig.rounds),
        });
        startTimer();
    };

    const displayTime = secondsToHms(timeRemaining);

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
        >
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Interval Timer</Text>
                    <Text style={[styles.statusBadge, { color: isWorking ? '#FF9500' : '#4CAF50' }]}>
                        {statusText.toUpperCase()}
                    </Text>
                </View>

                {/* Big Timer Display */}
                <View style={styles.timerCard}>
                    <Text style={styles.timerText}>
                        {displayTime.h.toString().padStart(2, '0')}:
                        {displayTime.m.toString().padStart(2, '0')}:
                        {displayTime.s.toString().padStart(2, '0')}
                    </Text>
                    <View style={styles.roundIndicator}>
                        <Ionicons name="repeat" size={16} color="#8E8E93" />
                        <Text style={styles.roundText}> Round {currentRound} / {config.rounds}</Text>
                    </View>
                </View>

                {/* Main Controls */}
                <View style={styles.controlRow}>
                    {isRunning ? (
                        <TouchableOpacity 
                            style={[styles.mainButton, styles.pauseBtn]} 
                            onPress={pauseTimer}
                        >
                            <Ionicons name="pause" size={32} color="#fff" />
                            <Text style={styles.buttonText}>Pause</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.pausedButtonContainer}>
                            {/* RESUME BUTTON: Only shows if the timer has started but isn't finished */}
                            {timeRemaining > 0 && timeRemaining < (isWorking ? config.workDuration : config.restDuration) && (
                                <TouchableOpacity 
                                    style={[styles.mainButton, styles.resumeBtn]} 
                                    onPress={() => { Vibration.vibrate(10); startTimer(); }}
                                >
                                    <Ionicons name="play" size={28} color="#fff" />
                                    <Text style={styles.buttonText}>Resume</Text>
                                </TouchableOpacity>
                            )}

                            {/* START/APPLY BUTTON: Always available to start fresh */}
                            <TouchableOpacity 
                                style={[styles.mainButton, styles.startBtn, { marginLeft: 10 }]} 
                                onPress={handleStartWithSettings}
                            >
                                <Ionicons name="rocket-outline" size={24} color="#fff" />
                                <Text style={styles.buttonText}>
                                    {timeRemaining === config.workDuration && currentRound === 1 ? "Start" : "New"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity style={styles.resetBtn} onPress={resetTimer}>
                        <Ionicons name="stop" size={24} color="#FF3B30" />
                    </TouchableOpacity>
                </View>

                {/* Configuration Section */}
                {!isRunning && (
                    <View style={styles.configCard}>
                        <Text style={styles.configTitle}>Edit Intervals</Text>

                        <Text style={styles.label}>Work Duration</Text>
                        <View style={styles.inputRow}>
                            <View style={styles.inputWrap}><TextInput style={styles.input} keyboardType="numeric" value={tempConfig.workH} onChangeText={(t) => setTempConfig(p => ({...p, workH: t}))} returnKeyType="done" /><Text style={styles.unit}>H</Text></View>
                            <View style={styles.inputWrap}><TextInput style={styles.input} keyboardType="numeric" value={tempConfig.workM} onChangeText={(t) => setTempConfig(p => ({...p, workM: t}))} returnKeyType="done" /><Text style={styles.unit}>M</Text></View>
                            <View style={styles.inputWrap}><TextInput style={styles.input} keyboardType="numeric" value={tempConfig.workS} onChangeText={(t) => setTempConfig(p => ({...p, workS: t}))} returnKeyType="done" /><Text style={styles.unit}>S</Text></View>
                        </View>

                        <Text style={styles.label}>Rest Duration</Text>
                        <View style={styles.inputRow}>
                            <View style={styles.inputWrap}><TextInput style={styles.input} keyboardType="numeric" value={tempConfig.restH} onChangeText={(t) => setTempConfig(p => ({...p, restH: t}))} returnKeyType="done" /><Text style={styles.unit}>H</Text></View>
                            <View style={styles.inputWrap}><TextInput style={styles.input} keyboardType="numeric" value={tempConfig.restM} onChangeText={(t) => setTempConfig(p => ({...p, restM: t}))} returnKeyType="done" /><Text style={styles.unit}>M</Text></View>
                            <View style={styles.inputWrap}><TextInput style={styles.input} keyboardType="numeric" value={tempConfig.restS} onChangeText={(t) => setTempConfig(p => ({...p, restS: t}))} returnKeyType="done" /><Text style={styles.unit}>S</Text></View>
                        </View>

                        <View style={styles.roundsRow}>
                            <Text style={styles.label}>Total Rounds</Text>
                            <TextInput style={styles.roundsInput} keyboardType="numeric" value={tempConfig.rounds} onChangeText={(t) => setTempConfig(p => ({...p, rounds: t}))} returnKeyType="done" />
                        </View>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    scrollContainer: { paddingBottom: 100 },
    header: { paddingHorizontal: 25, paddingTop: 60, marginBottom: 10 },
    headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#1C1C1E' },
    statusBadge: { fontSize: 13, fontWeight: '800', marginTop: 5, letterSpacing: 1 },
    timerCard: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
    timerText: { fontSize: 72, fontWeight: '200', color: '#1C1C1E', letterSpacing: -2 },
    roundIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    roundText: { fontSize: 16, color: '#8E8E93', fontWeight: '500' },
    controlRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
    pausedButtonContainer: { flexDirection: 'row', alignItems: 'center' },
    mainButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    startBtn: { backgroundColor: '#007AFF', paddingHorizontal: 30 },
    resumeBtn: { backgroundColor: '#4CAF50', paddingHorizontal: 25 },
    pauseBtn: { backgroundColor: '#FF9500', paddingHorizontal: 45 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
    resetBtn: { marginLeft: 15, padding: 15, borderRadius: 15, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F2F2F7' },
    configCard: { backgroundColor: '#FFF', marginHorizontal: 20, borderRadius: 25, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 2 },
    configTitle: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 15 },
    label: { fontSize: 14, color: '#8E8E93', fontWeight: '600', marginBottom: 8 },
    inputRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, marginHorizontal: 4, paddingHorizontal: 10 },
    input: { flex: 1, height: 45, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
    unit: { fontSize: 12, color: '#C7C7CC', fontWeight: 'bold' },
    roundsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    roundsInput: { width: 80, height: 45, backgroundColor: '#F8F9FA', borderRadius: 12, textAlign: 'center', fontSize: 16, fontWeight: 'bold' }
});

export default TimerScreen;