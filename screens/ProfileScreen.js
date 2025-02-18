import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../components/BackButton';

export default function PetOwnerDetailsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-sky-400 px-6 pt-6">
      {/* ปุ่มย้อนกลับ */}
      <View className="flex-row justify-start mb-4">
        <BackButton />
      </View>

      {/* รูปโปรไฟล์ */}
      <View className="items-center mt-4">
        <View className="w-28 h-28 bg-gray-300 rounded-full" />
      </View>

      {/* Title */}
      <Text className="text-center text-white font-semibold text-lg mt-4">
        Pet owner details
      </Text>

      {/* Input Fields */}
      <View className="mt-6 space-y-4">
        <View>
          <Text className="text-white font-semibold">Name</Text>
          <TextInput
            className="border-b border-white text-white placeholder-white py-2"
            placeholder="Please enter here"
            placeholderTextColor="#e0f2fe"
          />
        </View>

        <View>
          <Text className="text-white font-semibold">Phone number</Text>
          <TextInput
            className="border-b border-white text-white placeholder-white py-2"
            placeholder="Please enter here"
            placeholderTextColor="#e0f2fe"
            keyboardType="phone-pad"
          />
        </View>

        <View>
          <Text className="text-white font-semibold">Alternative contact number</Text>
          <TextInput
            className="border-b border-white text-white placeholder-white py-2"
            placeholder="Please enter here"
            placeholderTextColor="#e0f2fe"
            keyboardType="phone-pad"
          />
        </View>

        <View>
          <Text className="text-white font-semibold">Pet name</Text>
          <TextInput
            className="border-b border-white text-white placeholder-white py-2"
            placeholder="Please enter here"
            placeholderTextColor="#e0f2fe"
          />
        </View>
      </View>

      {/* ปุ่มบันทึกและแก้ไข */}
      <View className="flex-row justify-center space-x-4 mt-6">
        <TouchableOpacity className="border border-black px-6 py-2 rounded-lg bg-white">
          <Text className="text-black font-semibold">save</Text>
        </TouchableOpacity>
        <TouchableOpacity className="border border-black px-6 py-2 rounded-lg bg-white">
          <Text className="text-black font-semibold">edit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
