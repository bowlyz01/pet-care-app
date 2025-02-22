import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const InfoBlock = ({ label, screenName, petID }) => {
  const navigation = useNavigation();
  const [value, setValue] = useState("");

  // ฟังก์ชันดึงข้อมูลสัตว์เลี้ยง
  const fetchData = async () => {
    try {
      if (!petID) return;

      if (label === "Weight") {
        const petRef = doc(db, "pets", petID);
        const petSnap = await getDoc(petRef);

        if (petSnap.exists()) {
          const petData = petSnap.data();
          setValue(petData.weight ? `${petData.weight} kg` : "N/A");
        } else {
          setValue("N/A");
        }
      } else if (label === "Vaccinations") {
        const q = query(collection(db, "vaccinations"), where("petID", "==", petID));
        const querySnapshot = await getDocs(q);
        const count = querySnapshot.size; // นับจำนวนวัคซีนที่บันทึกไว้
        setValue(count > 0 ? `${count}` : "0");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setValue("N/A");
    }
  };

  useEffect(() => {
    fetchData();
  }, [petID, label]);

  const handlePress = () => {
    navigation.navigate(screenName, { petID, label });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-yellow-200 w-[32%] aspect-square rounded-xl mb-4 shadow-md items-center justify-center"
    >
      <Text className="text-sm font-medium text-gray-700">{label}</Text>
      <Text className="text-lg font-bold text-gray-900">{value}</Text>
    </TouchableOpacity>
  );
};

export default InfoBlock;
