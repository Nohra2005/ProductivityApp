import React, { useState, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Vibration } from 'react-native';
import { Calendar } from 'react-native-calendars'; // Use this for the UI
import { TaskContext } from '../context/TaskContext'; 
import { Ionicons } from '@expo/vector-icons';

const CalendarScreen = () => {
    const { tasks, toggleTaskCompletion } = useContext(TaskContext);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Filter tasks for the selected day
    const dayTasks = tasks.filter(task => task.date === selectedDate);

    // Create dots on the calendar for days that have tasks
    const markedDates = useMemo(() => {
        let marks = {};
        tasks.forEach(task => {
            marks[task.date] = { marked: true, dotColor: '#007AFF' };
        });
        // Highlight the selected day
        marks[selectedDate] = { 
            ...marks[selectedDate], 
            selected: true, 
            selectedColor: '#007AFF' 
        };
        return marks;
    }, [tasks, selectedDate]);

    const renderTaskItem = ({ item }) => (
        <TouchableOpacity 
            style={[styles.taskCard, item.isCompleted && styles.completedCard]}
            onPress={() => {
                toggleTaskCompletion(item.id);
                Vibration.vibrate(10);
            }}
        >
            <Ionicons 
                name={item.isCompleted ? "checkmark-circle" : "ellipse-outline"} 
                size={22} 
                color={item.isCompleted ? "#4CAF50" : "#007AFF"} 
            />
            <Text style={[styles.taskText, item.isCompleted && styles.completedText]}>
                {item.text}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Calendar</Text>
                <Text style={styles.headerSubtitle}>View tasks by date</Text>
            </View>

            <View style={styles.calendarCard}>
                <Calendar
                    onDayPress={day => {
                        setSelectedDate(day.dateString);
                        Vibration.vibrate(5);
                    }}
                    markedDates={markedDates}
                    theme={{
                        selectedDayBackgroundColor: '#007AFF',
                        todayTextColor: '#007AFF',
                        arrowColor: '#007AFF',
                        dotColor: '#007AFF',
                        indicatorColor: '#007AFF',
                        'stylesheet.calendar.header': {
                            monthText: {
                                fontSize: 18,
                                fontWeight: 'bold',
                                color: '#1C1C1E',
                                margin: 10,
                            }
                        }
                    }}
                />
            </View>

            <View style={styles.listSection}>
                <Text style={styles.sectionTitle}>
                    {selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : selectedDate}
                </Text>
                <FlatList
                    data={dayTasks}
                    keyExtractor={(item) => item.id}
                    renderItem={renderTaskItem}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No tasks for this day</Text>
                        </View>
                    }
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { paddingHorizontal: 25, paddingTop: 60, marginBottom: 15 },
    headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#1C1C1E' },
    headerSubtitle: { fontSize: 16, color: '#8E8E93' },
    calendarCard: { 
        backgroundColor: '#fff', 
        marginHorizontal: 20, 
        borderRadius: 20, 
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5
    },
    listSection: { flex: 1, marginTop: 25, paddingHorizontal: 25 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 15 },
    taskCard: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#fff', 
        padding: 15, 
        borderRadius: 15, 
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F2F2F7'
    },
    completedCard: { opacity: 0.6 },
    taskText: { marginLeft: 12, fontSize: 16, color: '#1C1C1E', fontWeight: '500' },
    completedText: { textDecorationLine: 'line-through', color: '#8E8E93' },
    emptyState: { alignItems: 'center', marginTop: 30 },
    emptyText: { color: '#AEAEB2', fontSize: 15 }
});

export default CalendarScreen;