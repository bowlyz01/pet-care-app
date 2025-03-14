import React from "react";
import { View, Text } from "react-native";
import dayjs from "dayjs";
import InfoBlock from "./InfoBlock";
import InfoHeart from "./InfoHeart";
import Foundation from "@expo/vector-icons/Foundation";

const PetCard = ({ pet }) => {

  // ฟังก์ชันคำนวณอายุ
  const calculateAge = (birthdate) => {
    const now = dayjs();
    const birth = dayjs(birthdate);

    // คำนวณปี เดือน และวัน
    const years = now.diff(birth, "year"); // จำนวนปี
    const months = now.diff(birth.add(years, "year"), "month"); // จำนวนเดือนที่เหลือ
    const days = now.diff(birth.add(years, "year").add(months, "month"), "day"); // จำนวนวันที่เหลือ

    // สร้างข้อความผลลัพธ์
    const yearText = years > 0 ? `${years} years` : ""; // แสดงเฉพาะเมื่อ years > 0
    const monthText = months > 0 ? `${months} months` : ""; // แสดงเฉพาะเมื่อ months > 0
    const dayText = days > 0 ? `${days} days` : ""; // แสดงเฉพาะเมื่อ days > 0

    return `${yearText} ${monthText} ${dayText}`.trim();
  }

  
    

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
            <Text className="text-sm text-white">{calculateAge(pet.birthdate)}</Text>
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
        <InfoHeart petID={pet.id} />
      </View>
      <View className="flex-row flex-wrap  justify-between gap-4 p-4">
      <InfoBlock label="Weight" screenName="WeightDetails" petID={pet.id}/>
      <InfoBlock label="Vaccinations" screenName="VaccinationsDetails" petID={pet.id}/>
        {/* ยังไม่ได้ทำ graph,health info,contacts */}
        <InfoBlock label="Graph Analyze" screenName="GraphAnalyzeDetails" petID={pet.id}/> 
        <InfoBlock label="Reminders" screenName="RemindersDetails" petID={pet.id}/>
        <InfoBlock label="Health Info" screenName="HealthDetails" petID={pet.id}/> 
        <InfoBlock label="Contacts" screenName="ContactsDetails" petID={pet.id}/> 
      </View>
    </View>
  );
};


export default PetCard;
