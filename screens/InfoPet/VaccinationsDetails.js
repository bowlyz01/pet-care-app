import { View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import React, { useState,useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/BackButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { getFirestore, collection, addDoc, updateDoc, arrayUnion, doc,query, where, getDocs, orderBy  } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const VaccinationsDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { label, value, petID } = route.params;

  // Format birthdate as YYYY-MM-DD
  const formatDate = (date) => dayjs(date).format("YYYY-MM-DD");

  // State variables
  const [vaccine, setVaccine] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [description, setDescription] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchVaccinationHistory();
  }, []);

  // Validation for inputs
  const validateInputs = () => {
    if (!vaccine.trim()) {
      alert("Please enter the vaccine.");
      return false;
    }
    return true;
  };

  // ✅ ฟังก์ชันดึงข้อมูลประวัติการฉีดวัคซีนจาก Firestore
  const fetchVaccinationHistory = async () => {
    try {
      const q = query(
        collection(db, "vaccinations"),
        where("petID", "==", petID),
        orderBy("date", "desc")
      );

      const querySnapshot = await getDocs(q);
      const vaccinations = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: dayjs(data.date).format("YYYY-MM-DD"), // ✅ ตรวจสอบให้เป็น YYYY-MM-DD
          createdAt: dayjs(data.createdAt).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"), // ✅ แสดงเป็น ISO String
        };
      });

      setHistory(vaccinations);
    } catch (error) {
      console.error("Error fetching vaccination history:", error);
    }
  };

  const saveVaccineToFirestore = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (!user) {
        alert("You must be logged in to save a vaccination record.");
        return;
      }
  
      const userId = user.uid;
  
      if (!petID) {
        alert("Pet ID is missing.");
        return;
      }
  
      // สร้างเอกสารใหม่ในคอลเลกชัน vaccinations
      const vaccineData = {
        userId,
        petID,
        vaccine,
        date: dayjs(selectedDate).format("YYYY-MM-DD"),
        description,
        createdAt: new Date().toISOString(),
      };
  
      await addDoc(collection(db, "vaccinations"), vaccineData);
      fetchVaccinationHistory();
      setVaccine("");
      setDescription("");
      setSelectedDate(new Date());
      alert("Vaccination record saved successfully!");
      navigation.replace("MainApp"); // กลับไปหน้า MainApp
    } catch (error) {
      console.error("Error saving vaccination:", error);
      alert("Failed to save vaccination. Please try again.");
    }
  };
  

  // ✅ ฟังก์ชันยืนยันก่อนบันทึก
  const handleSave = async () => {
    if (!validateInputs()) return; // หยุดหากข้อมูลไม่ถูกต้อง

    Alert.alert(
      'Confirm Save',
      `Are you sure you want to save?\nVacine: ${vaccine} \nDate: ${dayjs(selectedDate).format('MMM D, YYYY h:mm A')}\nDescription: ${description || 'None'}`,
      [{ text: 'Cancel', style: 'cancel' }, { text: 'OK', onPress: saveVaccineToFirestore }]
    );
  }



  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <View className="flex-[7] bg-white p-4">
      <View className="flex-row justify-start">
        <BackButton />
      </View>
      <View className="flex-1 bg-white p-4">
        <Text className="text-lg font-semibold text-gray-700 mb-2">The pet's vaccinations</Text>

          <Text className="text-lg font-semibold text-gray-700">What the vaccine:</Text>
            <TextInput
              className="border border-gray-300 p-3 rounded-xl mb-4"
              placeholder="Vaccine"
              value={vaccine}
              onChangeText={setVaccine}
            />

          <Text className="text-lg font-semibold text-gray-700">Vaccine application date</Text>
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

          <Text className="text-lg font-semibold text-gray-700">Add a description</Text>
            <TextInput
              className="border border-gray-300 p-3 rounded-xl mb-4"
              placeholder=""
              value={description}
              onChangeText={setDescription}
            />

          {/* Save Button */}
          <TouchableOpacity
            className="bg-green-500 p-4 rounded-xl items-center"
            onPress={handleSave}
          >
            <Text className="text-white font-bold text-lg">Save</Text>
          </TouchableOpacity>

      </View>
      </View>
      {/* Vaccination History */}
      <View className="flex-[3] p-4 border-t border-gray-300">
              <Text className="text-lg font-semibold text-gray-700 mb-2">Vaccination History</Text>
              {history.length === 0 ? (
                <Text className="text-gray-500">No vaccination records found.</Text>
              ) : (
                <FlatList
                  data={history}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View className="border border-gray-300 p-3 rounded-xl mb-2">
                      <Text className="text-gray-800">{item.vaccine}</Text>
                      <Text className="text-gray-600">{dayjs(item.date).format('MMM D, YYYY h:mm A')}</Text>
                      {item.description ? <Text className="text-gray-500">Description: {item.description}</Text> : null}
                    </View>
                  )}
                />
              )}
            </View>
    </SafeAreaView>
  );
};

export default VaccinationsDetailsScreen;
