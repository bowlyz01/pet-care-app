import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import BackButton from '../components/BackButton';
import Foundation from '@expo/vector-icons/Foundation';
import DateTimePicker from '@react-native-community/datetimepicker';

// ไอคอนสัตว์เลี้ยงให้เลือก
const petIcons = ["🐶", "🐱", "🐰", "🐹", "🐦", "🐠", "🐢", "🐍"];

export default function AddPetScreen() {
  const navigation = useNavigation();
  const [selectedIcon, setSelectedIcon] = useState("🐶");
  const [petName, setPetName] = useState("");
  const [petWeight, setPetWeight] = useState("");
  const [petGender, setPetGender] = useState("male");

  // State สำหรับ Date Picker
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      {/* ปุ่มย้อนกลับ */}
      <View className="flex-row justify-start">
        <BackButton />
      </View>

      {/* หัวข้อ */}
      <View className="flex-row justify-center items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">Add New Pet</Text>
      </View>

      <ScrollView>
        {/* เลือกไอคอนสัตว์เลี้ยง */}
        <Text className="text-lg font-semibold text-gray-700 mb-2">Select an Icon</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {petIcons.map((icon, index) => (
            <TouchableOpacity 
              key={index} 
              className={`p-3 rounded-xl border ${selectedIcon === icon ? "bg-blue-400 border-blue-600" : "bg-gray-100 border-gray-300"}`}
              onPress={() => setSelectedIcon(icon)}
            >
              <Text className="text-2xl">{icon}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* กรอกข้อมูลสัตว์เลี้ยง */}
        <Text className="text-lg font-semibold text-gray-700">Pet Name</Text>
        <TextInput 
          className="border border-gray-300 p-3 rounded-xl mb-4"
          placeholder="Enter pet name"
          value={petName}
          onChangeText={setPetName}
        />

        {/* Date Picker */}
        <Text className="text-lg font-semibold text-gray-700">Birthdate</Text>
        <TouchableOpacity 
          className="border border-gray-300 p-3 rounded-xl mb-4"
          onPress={() => setShowPicker(true)}
        >
          <Text>{selectedDate.toDateString()}</Text>
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

        <Text className="text-lg font-semibold text-gray-700">Weight (kg)</Text>
        <TextInput 
          className="border border-gray-300 p-3 rounded-xl mb-4"
          placeholder="Enter pet weight"
          keyboardType="numeric"
          value={petWeight}
          onChangeText={setPetWeight}
        />

        {/* เลือกเพศ */}
        <Text className="text-lg font-semibold text-gray-700">Gender</Text>
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity 
            className={`flex-row items-center px-4 py-2 rounded-xl border ${petGender === "male" ? "bg-blue-400 border-blue-600" : "bg-gray-100 border-gray-300"}`}
            onPress={() => setPetGender("male")}
          >
            <Foundation name="male-symbol" size={20} color="black" />
            <Text className="ml-2 text-lg">Male</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className={`flex-row items-center px-4 py-2 rounded-xl border ${petGender === "female" ? "bg-pink-400 border-pink-600" : "bg-gray-100 border-gray-300"}`}
            onPress={() => setPetGender("female")}
          >
            <Foundation name="female-symbol" size={20} color="black" />
            <Text className="ml-2 text-lg">Female</Text>
          </TouchableOpacity>
        </View>

        {/* ปุ่มบันทึก */}
        <TouchableOpacity className="bg-green-500 p-4 rounded-xl items-center">
          <Text className="text-white font-bold text-lg">Save Pet</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
