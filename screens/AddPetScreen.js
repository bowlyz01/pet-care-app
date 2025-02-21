import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import BackButton from '../components/BackButton';
import Foundation from '@expo/vector-icons/Foundation';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { Platform } from 'react-native';
import dayjs from 'dayjs';
import { getAuth } from 'firebase/auth'; // สำหรับดึงข้อมูล userId
import { db } from '../config/firebase';
import { getFirestore, collection, addDoc, updateDoc, arrayUnion, doc } from 'firebase/firestore';

const petData = {
  "🐶": ["Golden Retriever", "Poodle", "Bulldog", "Beagle", "Shiba Inu"],
  "🐱": ["Persian", "Siamese", "Maine Coon", "Bengal", "Ragdoll"],
  "🐰": ["Netherland Dwarf", "Lionhead", "Lop", "Angora", "Rex"],
  "🐹": ["Syrian", "Dwarf", "Chinese", "Roborovski", "Campbell"],
  "🐦": ["Parrot", "Canary", "Cockatiel", "Budgerigar", "Finch"],
};

export default function AddPetScreen() {
  const navigation = useNavigation();
  const firestore = getFirestore();
  const auth = getAuth(); // ดึง instance ของ Firebase Authentication
  const currentUser = auth.currentUser; // ใช้เพื่อดึง userId ของผู้ใช้งาน

  // State variables
  const [selectedIcon, setSelectedIcon] = useState("🐶");
  const [breedingOptions, setBreedingOptions] = useState(petData["🐶"]);
  const [selectedBreeding, setSelectedBreeding] = useState(null);
  const [customBreeding, setCustomBreeding] = useState("");
  const [petName, setPetName] = useState("");
  const [petGender, setPetGender] = useState("male");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  // Handle changing pet type
  const handlePetTypeChange = (icon) => {
    setSelectedIcon(icon);
    setBreedingOptions([...petData[icon], "Other"]);
    setSelectedBreeding(null);
    setCustomBreeding("");
  };

  // Format birthdate as YYYY-MM-DD
  const formatDate = (date) => dayjs(date).format("YYYY-MM-DD");

  // Validation for inputs
  const validateInputs = () => {
    if (!petName.trim()) {
      alert("Please enter the pet's name.");
      return false;
    }
    if (!selectedBreeding && !customBreeding.trim()) {
      alert("Please select or enter the breeding.");
      return false;
    }
    return true;
  };

  // Handle Save Button (store to Firestore)
  const handleSavePet = async () => {
    if (!validateInputs()) return; // หยุดหากข้อมูลไม่ถูกต้อง
  
    const birthdate = formatDate(selectedDate); // แปลงวันเกิดเป็น YYYY-MM-DD
    const userId = currentUser?.uid; // ดึง userId ของผู้ใช้ปัจจุบัน
  
    if (!userId) {
      alert("You must be logged in to save a pet.");
      return;
    }
  
    const petData = {
      userId, // เชื่อมข้อมูลกับเจ้าของสัตว์เลี้ยง
      name: petName,
      avatar: selectedIcon,
      breeding: selectedBreeding === "Other" ? customBreeding : selectedBreeding,
      weight: null,
      gender: petGender,
      birthdate,
      vaccinations: null,
      reminders: null,
      relationshipPoints: 0,
    };
  
    try {
      // 1️⃣ เพิ่มสัตว์เลี้ยงใหม่ใน Firestore
      const petRef = await addDoc(collection(firestore, "pets"), petData);
      const petId = petRef.id; // ดึง petId ของสัตว์เลี้ยงที่เพิ่ม
  
      console.log("Pet added with ID:", petId);
  
      // 2️⃣ อัปเดต users collection โดยเพิ่ม petId ลงใน users.pets (array)
      const userRef = doc(firestore, "users", userId);
      await updateDoc(userRef, {
        pets: arrayUnion(petId), // ใช้ arrayUnion() เพื่อป้องกันข้อมูลซ้ำ
      });
  
      console.log("User updated with new pet ID:", petId);
  
      alert("Pet added successfully!");
      navigation.replace("MainApp"); // กลับไปหน้า MainApp
    } catch (error) {
      console.error("Error adding pet:", error);
      alert("Error adding pet. Please try again.");
    }
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <View className="flex-row justify-start">
        <BackButton />
      </View>

      <View className="flex-row justify-center items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">Add New Pet</Text>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
        {/* Select Icon */}
        <Text className="text-lg font-semibold text-gray-700 mb-2">Select pet type</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {Object.keys(petData).map((icon, index) => (
            <TouchableOpacity
              key={index}
              className={`p-3 rounded-xl border ${
                selectedIcon === icon
                  ? "bg-blue-400 border-blue-600"
                  : "bg-gray-100 border-gray-300"
              }`}
              onPress={() => handlePetTypeChange(icon)}
            >
              <Text className="text-2xl">{icon}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dropdown Breeding */}
        <Text className="text-lg font-semibold text-gray-700">Breeding</Text>
        <DropDownPicker
          open={openDropdown}
          value={selectedBreeding}
          items={breedingOptions.map((breed) => ({ label: breed, value: breed }))}
          setOpen={setOpenDropdown}
          setValue={(value) => {
            setSelectedBreeding(value);
            if (value !== "Other") {
              setCustomBreeding(""); // Clear custom input when selecting predefined breeding
            }
          }}
          placeholder="Select breeding"
          style={{ borderRadius: 15, marginBottom: 15 }}
          dropDownContainerStyle={{ zIndex: 1000 }} // ป้องกัน DropDown ถูกบัง
          listMode="SCROLLVIEW" // ใช้ ScrollView สำหรับรายการใน DropDown
        />

        {selectedBreeding === "Other" && (
          <View className="mb-4">
            <Text className="text-lg font-semibold text-gray-700">
              Enter Custom Breeding
            </Text>
            <TextInput
              className="border border-gray-300 p-3 rounded-xl"
              placeholder="Enter breeding"
              value={customBreeding}
              onChangeText={setCustomBreeding}
            />
          </View>
        )}

        {/* Name, Birthdate, Gender */}
        <Text className="text-lg font-semibold text-gray-700">Pet Name</Text>
        <TextInput
          className="border border-gray-300 p-3 rounded-xl mb-4"
          placeholder="Enter pet name"
          value={petName}
          onChangeText={setPetName}
        />

        <Text className="text-lg font-semibold text-gray-700">Birthdate</Text>
        <TouchableOpacity
          className="border border-gray-300 p-3 rounded-xl mb-4"
          onPress={() => setShowPicker(true)}
        >
          <Text>{formatDate(selectedDate)}</Text>
        </TouchableOpacity>

        {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowPicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

        <Text className="text-lg font-semibold text-gray-700">Gender</Text>
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity
            className={`flex-row items-center px-4 py-2 rounded-xl border ${
              petGender === "male"
                ? "bg-blue-400 border-blue-600"
                : "bg-gray-100 border-gray-300"
            }`}
            onPress={() => setPetGender("male")}
          >
            <Foundation name="male-symbol" size={20} color="black" />
            <Text className="ml-2 text-lg">Male</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-row items-center px-4 py-2 rounded-xl border ${
              petGender === "female"
                ? "bg-pink-400 border-pink-600"
                : "bg-gray-100 border-gray-300"
            }`}
            onPress={() => setPetGender("female")}
          >
            <Foundation name="female-symbol" size={20} color="black" />
            <Text className="ml-2 text-lg">Female</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className="bg-green-500 p-4 rounded-xl items-center"
          onPress={handleSavePet}
        >
          <Text className="text-white font-bold text-lg">Save Pet</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
