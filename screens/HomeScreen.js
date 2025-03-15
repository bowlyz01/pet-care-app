import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState,useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { signOut, getAuth } from 'firebase/auth'
import { db } from '../config/firebase'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import AddButton from '../components/AddButton'
import PetCard from "../components/PetCard";
import { collection, getDocs, query, where } from "firebase/firestore"; 

export default function HomeScreen() {
  const [petData, setPetData] = useState([]);
  const navigation = useNavigation();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log(error);
    }
  };

  // ดึงข้อมูลสัตว์เลี้ยงของผู้ใช้ที่ล็อกอิน
  const fetchPetData = async () => {
    if (!currentUser) return; // ถ้ายังไม่ได้ล็อกอิน ไม่ต้องดึงข้อมูล

    try {
      const petsCollection = collection(db, 'pets');
      const q = query(petsCollection, 
        where("userId", "==", currentUser.uid), // กรองตาม userId
        where("status", "==", "viewable"));     // กรองตามสถานะ viewable
      const petSnapshot = await getDocs(q);
      
      const petList = petSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPetData(petList); 
    } catch (error) {
      console.log('Error fetching pet data:', error);
    }
  };

  // โหลดข้อมูลเมื่อ Component โหลด และอัปเดต
  useEffect(() => {
    fetchPetData();
  }, []); 

    // รีโหลดข้อมูลเมื่อกลับมาที่หน้า HomeScreen
    useFocusEffect(
      useCallback(() => {
        fetchPetData();
      }, [])
    );

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
          {petData.length > 0 ? (
            petData.map((pet) => <PetCard key={pet.id} pet={pet} />)
          ) : (
            <Text className="text-center text-gray-500">No pets found.</Text>
          )}
        </View>
      </ScrollView>

      {/* ปุ่ม AddNewPet */}
      <AddButton />
    </SafeAreaView>
  );
}
