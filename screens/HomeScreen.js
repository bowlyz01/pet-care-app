import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { signOut } from 'firebase/auth'
import { auth } from '../config/firebase'
import { useNavigation } from '@react-navigation/native'
import AddButton from '../components/AddButton'
import PetCard from "../components/PetCard";
import { db } from '../config/firebase';
import { collection, getDocs } from "firebase/firestore"; 




export default function HomeScreen() {
  const [petData, setPetData] = useState([]);
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log(error);
    }
  };

  // ฟังก์ชันดึงข้อมูลจาก Firestore
  const fetchPetData = async () => {
    try {
      const petsCollection = collection(db, 'pets'); // อ้างอิงถึง Collection ชื่อ "pets"
      const petSnapshot = await getDocs(petsCollection); // ดึงข้อมูลทั้งหมดใน Collection
      const petList = petSnapshot.docs.map((doc) => ({
        id: doc.id, // เก็บ ID ของเอกสาร
        ...doc.data(), // ข้อมูลในเอกสาร
      }));
      setPetData(petList); 
    } catch (error) {
      console.log('Error fetching pet data:', error);
    }
  };

  // เรียก fetchPetData เมื่อ Component ถูกโหลด
  useEffect(() => {
    fetchPetData();
  }, []);

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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        
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