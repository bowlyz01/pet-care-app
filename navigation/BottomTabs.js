import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Entypo, FontAwesome } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import FindClinicScreen from '../screens/FindClinicScreen';
import CalendarScreen from '../screens/CalendarScreen';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home';
            return <Entypo name={iconName} size={size} color={color} />;
          } else if (route.name === 'Calendar') {
            iconName = 'calendar';
            return <FontAwesome name={iconName} size={size} color={color} />;
          }
          else if (route.name === 'FindClinic') {
            iconName = 'clinic-medical';
            return <FontAwesome5 name={iconName} size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: '#45BCD8',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: 'white', paddingBottom: 5, height: 60 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ headerShown: false }} />
      <Tab.Screen name="FindClinic" component={FindClinicScreen} options={{ headerShown: false }}/>
    </Tab.Navigator>
  );
}
