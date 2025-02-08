import React from "react";
import { View, Text } from "react-native";

import Foundation from "@expo/vector-icons/Foundation";

const PetCard = ({ pet }) => {
  return (
    <View className="flex-1 bg-blue-50 shadow-lg rounded-2xl p-4 mb-4">
      {/* Header */}
      <View className="flex-row items-center justify-between bg-[#45BCD8] p-4 rounded-t-2xl mb-4">
        <View className="flex-row items-center space-x-4">
          <View className="relative w-16 h-16 bg-yellow-200 rounded-full items-center justify-center">
            <Text className="text-3xl">{pet.avatar}</Text>

          </View>
          <View>
            <Text className="text-xl font-bold text-white capitalize">{pet.name}</Text>
            <Text className="text-sm text-white">{pet.age}</Text>
          </View>
        </View>
        <Foundation
          name={pet.gender === "female" ? "female-symbol" : "male-symbol"}
          size={30}
          color="#FFD700" 
        />
      </View>

      {/* Info Section */}
      <View className="flex-1 items-center justify-center ">
        <InfoHart label="คะแนนหัวใจที่สะสมได้วันนี้" value="200" />
      </View>
      <View className="flex-row flex-wrap  justify-between gap-4 p-4">
      <InfoBlock label="Weight" value={pet.weight+'(kg)'} />
        <InfoBlock label="Vaccinations" value={pet.vaccinations} />
        <InfoBlock label="Graph Analyze" value="No data" /> 
        <InfoBlock label="Reminders" value={pet.reminders} />
        <InfoBlock label="Health Info" value="Healthy" /> 
        <InfoBlock label="Contacts" value="No contact" /> 
      </View>
    </View>
  );
};

const InfoBlock = ({ label, value }) => (
  <View className="bg-yellow-200 w-[32%] aspect-square rounded-xl mb-4 shadow-md items-center justify-center">
    <Text className="text-sm font-medium text-gray-700">{label}</Text>
    <Text className="text-lg font-bold text-gray-900">{value}</Text>
  </View>
);

const InfoHart = ({ label, value }) => (
  <View className="bg-yellow-200 w-full h-24 mb-4 rounded-xl shadow-md items-center justify-center">
    <Text className="text-3xl text-red-500 mb-2">{'\u2764'}</Text>
    <Text className="text-sm font-medium text-gray-700">{label}</Text>
    <Text className="text-lg font-bold text-gray-900">{value}</Text>
  </View>
);

export default PetCard;
