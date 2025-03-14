import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import Foundation from "@expo/vector-icons/Foundation";
import { doc, getDoc } from "firebase/firestore";
import { db } from '../config/firebase';
import dayjs from "dayjs";


const PetLittleCard = ({ petID }) => {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

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


useEffect(() => {
const getPetData = async () => {
    try {
    const petRef = doc(db, "pets", petID); // อ้างอิงถึงเอกสารของสัตว์เลี้ยง
    const petSnap = await getDoc(petRef);

    if (petSnap.exists()) {
        setPet(petSnap.data());
    } else {
        console.log("No such pet!");
        setPet(null);
    }
    } catch (error) {
    console.error("Error fetching pet:", error);
    setPet(null);
    }
    setLoading(false);
};

getPetData();
}, [petID]);

if (loading) {
return <ActivityIndicator size="large" color="#36A9CE" />;
}

if (!pet) {
return <Text style={{ color: "red" }}>Pet not found</Text>;
}

return (
<View
    style={{
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#36A9CE",
    padding: 10,
    borderRadius: 15,
    width: "50%",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    }}
>
    {/* Avatar */}
    <View
    style={{
        width: 50,
        height: 50,
        borderRadius: 50,
        backgroundColor: "#FFD700",
        alignItems: "center",
        justifyContent: "center",
    }}
    >
    <Text style={{ fontSize: 24 }}>{pet.avatar || "🐾"}</Text>
    </View>

    {/* ข้อมูลสัตว์เลี้ยง */}
    <View style={{ marginLeft: 10, flex: 1 }}>
    <Text style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}>{pet.name}</Text>
    <Text style={{ fontSize: 14, color: "#fff" }}>{calculateAge(pet.birthdate)}</Text>
    </View>

    {/* ไอคอนเพศ */}
    <Foundation
    name={pet.gender === "female" ? "female-symbol" : "male-symbol"}
    size={20}
    color="yellow"
    />
</View>
);
};

export default PetLittleCard;
