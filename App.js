import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Used for the tab bar icons 
import { TaskProvider } from './context/TaskContext'; // Global State Provider
import { TimerProvider } from './context/TimerContext';

import TodoListScreen from './screens/TodoListScreen';
import TimerScreen from './screens/TimerScreen';
import CalendarScreen from './screens/CalendarScreen';
import RemindersScreen from './screens/RemindersScreen';

const Tab = createBottomTabNavigator();

// This tells the phone how to handle an alert if the app is already open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    // Request permission on startup
    const requestPermission = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    };
    requestPermission();
  }, []);
  
  return (
    <TaskProvider>
      <TimerProvider>
        <NavigationContainer>
          <Tab.Navigator
            initialRouteName="Tasks" // Start on the todo screen
            screenOptions={({ route }) => ({
              // Function to select the icon based on the route name
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                if (route.name === 'Tasks') {
                  iconName = focused ? 'list-circle' : 'list-circle-outline';
                } else if (route.name === 'Timer') {
                  iconName = focused ? 'timer' : 'timer-outline';
                } else if (route.name === 'Calendar') {
                  iconName = focused ? 'calendar' : 'calendar-outline';
                } else if (route.name === 'Reminders') {
                  iconName = focused ? 'notifications' : 'notifications-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              // styling for the tab bar
              tabBarActiveTintColor: '#2196F3', // Blue color when active
              tabBarInactiveTintColor: 'gray',
              headerShown: false, // Hides the header bar
            })}
          >
            <Tab.Screen name="Tasks" component={TodoListScreen} />
            <Tab.Screen name="Timer" component={TimerScreen} />
            <Tab.Screen name="Calendar" component={CalendarScreen} />
            <Tab.Screen name="Reminders" component={RemindersScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </TimerProvider>
    </TaskProvider>
  );
}