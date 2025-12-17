import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TaskContext = createContext();

// Key used to store and retrieve data in local storage
const STORAGE_KEY = '@TaskStore:tasks';

export const TaskProvider = ({ children }) => {
  // The main state that all screens will share
  const [tasks, setTasks] = useState([]); 

  const saveTasks = async (newTasks) => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
        setTasks(newTasks);
      } catch (e) {
        console.error('Failed to save tasks:', e);
      }
    };
  
  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTasks !== null) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (e) {
      console.error('Failed to load tasks:', e);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const addTask = (taskText, taskDate) => {
    const newTask = {
      id: Date.now().toString(),
      text: taskText,
      isCompleted: false,
      date: taskDate || new Date().toISOString().split('T')[0], // Default to today (YYYY-MM-DD)
    };
    saveTasks([...tasks, newTask]);
  };

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(updatedTasks);
  };

  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
    );
    saveTasks(updatedTasks);
  };

  // The 'value' is what will be passed down to all screens
  const contextValue = {
    tasks,
    addTask,
    deleteTask,
    toggleTaskCompletion,
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};