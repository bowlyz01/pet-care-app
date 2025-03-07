import { View, Text } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WeightDetailsScreen from '../screens/InfoPet/WeightDetails';
import VaccinationsDetailsScreen from '../screens/InfoPet/VaccinationsDetails';
import GraphAnalyzeScreen from '../screens/InfoPet/GraphAnalyzeDetails';
import RemindersScreen from '../screens/InfoPet/RemindersDetails';
import ContactsDetailsScreen from '../screens/InfoPet/ContactsDetails';
import HealthDetailsScreen from '../screens/InfoPet/HealthDetails';
import CalendarScreen from '../screens/CalendarScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SignUpScreen from '../screens/SignUpScreen';
import AddPetScreen from '../screens/AddPetScreen';
import useAuth from '../hooks/useAuth';
import BottomTabs from '../navigation/BottomTabs';
import AddActivity from '../screens/AddActivityScreen';
import FindClinicScreen from '../screens/FindClinicScreen';
import ActivityOverdueScreen from '../screens/ActivityOverdueScreen';
const Stack = createNativeStackNavigator();


export default function AppNavigation() {
  const {user} = useAuth();
  if(user){
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Home'>
          <Stack.Screen name="MainApp" options={{headerShown: false}} component={BottomTabs}/>
          <Stack.Screen name="Calendar" options={{headerShown: false}} component={CalendarScreen}/>
          <Stack.Screen name="AddPet" options={{headerShown: false}} component={AddPetScreen} />
          <Stack.Screen name="AddActivity" options={{headerShown: false}} component={AddActivity} />
          <Stack.Screen name="WeightDetails" options={{headerShown: false}} component={WeightDetailsScreen} />
          <Stack.Screen name="VaccinationsDetails" options={{headerShown: false}} component={VaccinationsDetailsScreen} />
          <Stack.Screen name="GraphAnalyzeDetails" options={{headerShown: false}} component={GraphAnalyzeScreen} />
          <Stack.Screen name="RemindersDetails" options={{headerShown: false}} component={RemindersScreen} />
          <Stack.Screen name="ContactsDetails" options={{headerShown: false}} component={ContactsDetailsScreen} />
          <Stack.Screen name="HealthDetails" options={{headerShown: false}} component={HealthDetailsScreen} />
          <Stack.Screen name="FindClinic" options={{headerShown: false}} component={FindClinicScreen} />
          <Stack.Screen name="Profile" options={{headerShown: false}} component={ProfileScreen} />
          <Stack.Screen name="ActivityOverdue" options={{headerShown: false}} component={ActivityOverdueScreen} />

        </Stack.Navigator>
      </NavigationContainer>
    )
  }else{
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Welcome'>
          <Stack.Screen name="Welcome" options={{headerShown: false}} component={WelcomeScreen} />
          <Stack.Screen name="Login" options={{headerShown: false}} component={LoginScreen} />
          <Stack.Screen name="SignUp" options={{headerShown: false}} component={SignUpScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    )
  }
  
}