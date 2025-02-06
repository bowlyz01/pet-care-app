import React from "react";
import { View, Text } from "react-native";

import Foundation from '@expo/vector-icons/Foundation';

const PetCard = ({ pet }) => {
  return (
    <View className="flex-1 bg-blue-50 shadow-lg rounded-2xl p-4 mb-4">
      <View className="flex-row items-center justify-between bg-[#45BCD8] p-4 rounded-t-2xl">
        <View className="flex-row items-center space-x-4">
          <View className="relative w-16 h-16 bg-yellow-400 rounded-full items-center justify-center">
            <Text className="text-3xl">{pet.avatar}</Text>
            {/* <Entypo 
              name="camera" 
              size={20} 
              color="black" 
              className="absolute bottom-0 right-0 bg-yellow-300 rounded-full p-1"
            /> */}
          </View>
          <View>
            <Text className="text-xl font-bold text-white capitalize">{pet.name}</Text>
            <Text className="text-sm text-white">{pet.age}</Text>
          </View>
          
        </View>
        <View className="absolute right-8 top-1/2 -translate-y-1/2">
          <Foundation 
            name={pet.gender === "female" ? "female-symbol" : "male-symbol"} 
            size={30} 
            color="white" 
          />
        </View>
      </View>


      {/* ปรับขนาด InfoBlock ให้เท่ากัน */}
      <View className="flex-row flex-wrap justify-between p-4">
        <InfoHart label="คะแนนหัวใจที่สะสมได้วันนี้" value='200'/>
        <InfoBlock label="Weight" value={pet.stats.weight} />
        <InfoBlock label="Vaccinations" value={pet.stats.vaccinations} />
        <InfoBlock label="Photos" value={pet.stats.photos} />
        <InfoBlock label="Reminders" value={pet.stats.reminders} />
        <InfoBlock label="Notes" value={pet.stats.notes} />
        <InfoBlock label="Contacts" value={pet.stats.contacts} />
      </View>
    </View>
  );
};

const InfoBlock = ({ label, value }) => (
  <View className="bg-yellow-400 w-[30%] aspect-square rounded-xl mb-4 shadow-md items-center justify-center">
    <Text className="text-sm font-medium text-gray-700">{label}</Text>
    <Text className="text-lg font-bold text-gray-900">{value}</Text>
  </View>
);

const InfoHart= ({ label, value }) => (
  <View className="bg-yellow-400 w-full h-24 mb-4 rounded-xl shadow-md items-center justify-center">
    <Text className="text-sm font-medium text-gray-700">{'\u2764'}{label}</Text>
        <Text className="text-lg font-bold text-gray-900">{value}</Text>
  </View>
);


export default PetCard;
