import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { signOut } from 'firebase/auth'
import { auth } from '../config/firebase'
import { useNavigation } from '@react-navigation/native'
import AddButton from '../components/AddButton'
import PetCard from "../components/PetCard";

const petData = [
  {
    name: "bambi",
    age: "21 Days Old (3 Week)",
    gender: "male",
    avatar: "\ud83d\udc04", // Cow emoji as placeholder
    stats: {
      weight: "0 gr",
      vaccinations: 0,
      photos: 0,
      reminders: 3,
      notes: 0,
      contacts: 1
    }
  },
  {
    name: "bamboo",
    age: "7 Years and 5 Months Old",
    gender: "female",
    avatar: "\ud83d\udc36", // Dog emoji as placeholder
    stats: {
      weight: "0 gr",
      vaccinations: 2,
      photos: 0,
      reminders: 0,
      notes: 0,
      contacts: 0
    }
  }
];


export default function HomeScreen() {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <SafeAreaView className="flex-1">
      {/* แถบสำหรับ Logout */}
      <View className="flex-row justify-end items-center p-4">
        <Text className="text-lg">Home Page - </Text>
        <TouchableOpacity onPress={handleLogout} className="ml-2 p-2 bg-red-400 rounded-lg">
          <Text className="text-white text-lg font-bold">Logout</Text>
        </TouchableOpacity>
      </View>

      {/* ScrollView สำหรับเนื้อหาหลัก */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-blue-100">
        
        {/* Pet Card */}
        <View className="p-4">
        {petData.map((pet, index) => (
          <PetCard key={index} pet={pet} />
        ))}
        </View>
        
        
      </ScrollView>

      {/* ปุ่ม AddNewPet */}
      <AddButton />
    </SafeAreaView>
  )
}