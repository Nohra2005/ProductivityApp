import React, { useContext, useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    TouchableOpacity, 
    FlatList, 
    KeyboardAvoidingView, 
    Platform, 
    Keyboard,
    Vibration,
    Modal
} from 'react-native';
import { TaskContext } from '../context/TaskContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const TodoListScreen = () => {
    const { tasks, addTask, deleteTask, toggleTaskCompletion } = useContext(TaskContext);
    const [newTask, setNewTask] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleAddTask = () => {
        if (newTask.trim()) {
            const formattedDate = date.toISOString().split('T')[0];
            addTask(newTask.trim(), formattedDate);
            setNewTask('');
            Keyboard.dismiss();
            Vibration.vibrate(50);
            setDate(new Date()); 
        }
    };

    const renderTaskItem = ({ item }) => (
        <View style={[styles.taskCard, item.isCompleted && styles.completedCard]}>
            <TouchableOpacity 
                style={styles.checkArea} 
                onPress={() => {
                    toggleTaskCompletion(item.id);
                    Vibration.vibrate(10);
                }}
            >
                <Ionicons 
                    name={item.isCompleted ? "checkmark-circle" : "ellipse-outline"} 
                    size={26} 
                    color={item.isCompleted ? "#4CAF50" : "#C7C7CC"} 
                />
            </TouchableOpacity>

            <View style={styles.taskInfo}>
                <Text style={[styles.taskText, item.isCompleted && styles.completedText]}>
                    {item.text}
                </Text>
                <View style={styles.dateBadge}>
                    <Ionicons name="calendar-outline" size={12} color="#8E8E93" />
                    <Text style={styles.dateText}> {item.date}</Text>
                </View>
            </View>

            <TouchableOpacity onPress={() => { deleteTask(item.id); Vibration.vibrate(5); }} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
        </View>
    );

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Tasks</Text>
                <Text style={styles.headerSubtitle}>
                    {tasks.filter(t => !t.isCompleted).length} active goals
                </Text>
            </View>

            {/* Input Card */}
            <View style={styles.inputCard}>
                <TextInput
                    style={styles.input}
                    placeholder="Add a new goal..."
                    placeholderTextColor="#AEAEB2"
                    value={newTask}
                    onChangeText={setNewTask}
                />
                <View style={styles.inputActions}>
                    <TouchableOpacity 
                        style={styles.dateSelector} 
                        onPress={() => {
                            Vibration.vibrate(5);
                            setShowDatePicker(true);
                        }}
                    >
                        <Ionicons name="calendar" size={18} color="#007AFF" />
                        <Text style={styles.dateSelectorText}>
                            {date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.addButton, !newTask.trim() && styles.disabledButton]} 
                        onPress={handleAddTask}
                        disabled={!newTask.trim()}
                    >
                        <Ionicons name="arrow-up" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* 🗓️ MODAL CALENDAR: Only appears when showDatePicker is true */}
                <Modal
                    visible={showDatePicker}
                    transparent={true}
                    animationType="slide"
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Date</Text>
                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                    <Text style={styles.doneText}>Done</Text>
                                </TouchableOpacity>
                            </View>
                            
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                style={styles.picker}
                                onChange={(e, d) => {
                                    if (Platform.OS === 'android') setShowDatePicker(false);
                                    if (d) setDate(d);
                                }}
                            />
                        </View>
                    </View>
                </Modal>
            </View>

            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={renderTaskItem}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="sparkles-outline" size={60} color="#D1D1D6" />
                        <Text style={styles.emptyText}>Nothing to do? Add a task!</Text>
                    </View>
                }
            />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { paddingHorizontal: 25, paddingTop: 60, marginBottom: 20 },
    headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#1C1C1E' },
    headerSubtitle: { fontSize: 16, color: '#8E8E93', marginTop: 4 },
    inputCard: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 20, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    input: { fontSize: 18, paddingVertical: 10, color: '#1C1C1E', fontWeight: '500' },
    inputActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    dateSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F7FF', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
    dateSelectorText: { marginLeft: 6, color: '#007AFF', fontWeight: '700' },
    addButton: { backgroundColor: '#007AFF', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    disabledButton: { backgroundColor: '#A2CFFE' },
    listContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
    taskCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 18, borderRadius: 18, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F2F2F7' },
    completedCard: { opacity: 0.5, backgroundColor: '#F8F9FA' },
    checkArea: { marginRight: 15 },
    taskInfo: { flex: 1 },
    taskText: { fontSize: 17, color: '#1C1C1E', fontWeight: '600' },
    completedText: { textDecorationLine: 'line-through', color: '#8E8E93' },
    dateBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    dateText: { fontSize: 12, color: '#8E8E93', fontWeight: '500' },
    deleteButton: { padding: 5, marginLeft: 10 },
    emptyState: { alignItems: 'center', marginTop: 80 },
    emptyText: { marginTop: 15, color: '#AEAEB2', fontSize: 16, fontWeight: '500' },
    
    // 🎨 NEW MODAL STYLES
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, paddingBottom: 50 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    doneText: { color: '#007AFF', fontWeight: 'bold', fontSize: 17 },
    picker: { height: 350, alignSelf: 'center' }
});

export default TodoListScreen;