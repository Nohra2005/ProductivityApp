import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    TouchableOpacity, 
    FlatList, 
    Alert, 
    KeyboardAvoidingView, 
    Platform, 
    Keyboard,
    Vibration 
} from 'react-native';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

const RemindersScreen = () => {
    const [reminderText, setReminderText] = useState('');
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [scheduledReminders, setScheduledReminders] = useState([]);

    useEffect(() => {
        const prepare = async () => {
            await registerForNotifications();
            await fetchReminders();
        };
        prepare();
    }, []);

    const registerForNotifications = async () => {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('reminders', {
                name: 'Reminders',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    };

    const fetchReminders = async () => {
        try {
            const scheduled = await Notifications.getAllScheduledNotificationsAsync();
            setScheduledReminders(scheduled);
        } catch (e) {
            console.error("Failed to fetch reminders", e);
        }
    };

    const scheduleReminder = async () => {
        if (!reminderText.trim()) return; // Silent return if empty

        const finalDate = new Date(date);
        finalDate.setSeconds(0);
        finalDate.setMilliseconds(0);

        if (finalDate.getTime() <= Date.now()) {
            Alert.alert("Invalid Time", "Please select a future time.");
            return;
        }

        const hasPermission = await registerForNotifications();
        if (!hasPermission) {
            Alert.alert("Permission Error", "Please enable notifications in settings.");
            return;
        }

        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Reminder! 🔔",
                    body: reminderText,
                    sound: true,
                    android: { channelId: 'reminders' },
                },
                trigger: {
                    type: 'date',
                    date: finalDate.getTime(),
                },
            });

            // 🚨 SUCCESS ACTION: No Alert, just UI updates and subtle haptic feedback
            setReminderText('');
            Keyboard.dismiss();
            Vibration.vibrate(50); // Short pulse to confirm success
            
            setTimeout(() => fetchReminders(), 600);
        } catch (error) {
            console.error("Trigger Error Detail:", error);
            Alert.alert("Error", "The system rejected the notification trigger.");
        }
    };

    const cancelReminder = async (id) => {
        await Notifications.cancelScheduledNotificationAsync(id);
        Vibration.vibrate(20); // Even shorter pulse for deletion
        fetchReminders();
    };

    const onDateChange = (event, selectedDate) => {
        setShowPicker(Platform.OS === 'ios');
        if (selectedDate) setDate(selectedDate);
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Reminders</Text>
                <Text style={styles.headerSubtitle}>Set quick alerts for later</Text>
            </View>

            <View style={styles.card}>
                <TextInput
                    style={styles.input}
                    placeholder="Reminder message..."
                    placeholderTextColor="#999"
                    value={reminderText}
                    onChangeText={setReminderText}
                />
                
                <View style={styles.row}>
                    <TouchableOpacity style={styles.timeButton} onPress={() => setShowPicker(true)}>
                        <Ionicons name="time-outline" size={20} color="#007AFF" />
                        <Text style={styles.timeButtonText}>
                            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.addButton, !reminderText.trim() && { backgroundColor: '#A2CFFE' }]} 
                        onPress={scheduleReminder}
                    >
                        <Ionicons name="add-circle" size={20} color="#fff" />
                        <Text style={styles.addButtonText}>Set</Text>
                    </TouchableOpacity>
                </View>

                {showPicker && (
                    <DateTimePicker
                        value={date}
                        mode="time"
                        is24Hour={true}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onDateChange}
                    />
                )}
            </View>

            <View style={styles.listSection}>
                <Text style={styles.sectionTitle}>Active Reminders</Text>
                <FlatList
                    data={scheduledReminders}
                    keyExtractor={(item) => item.identifier}
                    renderItem={({ item }) => (
                        <View style={styles.reminderItem}>
                            <View style={styles.infoCol}>
                                <Text style={styles.reminderText}>{item.content.body}</Text>
                                <View style={styles.timeTag}>
                                    <Ionicons name="alarm-outline" size={12} color="#8E8E93" />
                                    <Text style={styles.reminderTime}> Scheduled</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => cancelReminder(item.identifier)}>
                                <Ionicons name="close-circle" size={24} color="#FF3B30" />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No reminders active</Text>
                    }
                />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { paddingHorizontal: 25, paddingTop: 60, marginBottom: 20 },
    headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#1C1C1E' },
    headerSubtitle: { fontSize: 16, color: '#8E8E93', marginTop: 5 },
    card: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
    input: { fontSize: 18, borderBottomWidth: 1, borderBottomColor: '#F2F2F7', paddingBottom: 12, marginBottom: 20, color: '#000' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    timeButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F7FF', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 },
    timeButtonText: { marginLeft: 8, color: '#007AFF', fontWeight: '700', fontSize: 15 },
    addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#007AFF', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12 },
    addButtonText: { marginLeft: 6, color: '#fff', fontWeight: 'bold', fontSize: 16 },
    listSection: { flex: 1, marginTop: 30, paddingHorizontal: 25 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#1C1C1E' },
    reminderItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F2F2F7' },
    infoCol: { flex: 1 },
    reminderText: { fontSize: 17, fontWeight: '600', color: '#1C1C1E' },
    timeTag: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    reminderTime: { fontSize: 13, color: '#8E8E93' },
    emptyText: { textAlign: 'center', marginTop: 60, color: '#AEAEB2', fontSize: 16 }
});

export default RemindersScreen;