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

const WeightDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { petID } = route.params;
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('kg');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState([]);

  const toggleUnit = () => {
    if (unit === 'kg') {
      setWeight((parseFloat(weight) * 1000).toString());
      setUnit('g');
    } else {
      setWeight((parseFloat(weight) / 1000).toString());
      setUnit('kg');
    }
  };

  const validateInputs = () => {
    const weightKg = unit === 'g' ? parseFloat(weight) / 1000 : parseFloat(weight);
    if (weightKg <= 0 || weightKg > 300) {
      alert('Please enter a valid weight between 0 - 300 kg.');
      return false;
    }
    return true;
  };

  
  // ✅ อัปเดต `weight` ใน pets collection
  const updatePetWeight = async (weightKg) => {
    try {
      const petRef = doc(db, 'pets', petID); // 🔥 อ้างอิงไปที่เอกสารสัตว์เลี้ยง
      await updateDoc(petRef, { weight: weightKg }); // ✅ อัปเดตเฉพาะฟิลด์ `weight`
      console.log(`✅ Updated pet (${petID}) weight: ${weightKg} kg`);
    } catch (error) {
      console.error('❌ Error updating pet weight:', error);
      alert('Failed to update pet weight.');
    }
  };

  // ✅ บันทึกลง Firestore และอัปเดต pet
  const saveWeightToFirestore = async () => {
    try {
      const auth = getAuth();
      if (!auth.currentUser) {
        alert('You must be logged in.');
        return;
      }
  
      const weightKg = unit === 'g' ? parseFloat(weight) / 1000 : parseFloat(weight);
      const weightData = {
        userID: auth.currentUser.uid,  // ✅ บันทึก user ID
        petID: petID,
        weight: weightKg,
        unit: 'kg',
        date: selectedDate.toISOString(),
        notes: notes.trim() || null,
      };
  
      await addDoc(collection(db, 'weights'), weightData);
      await updatePetWeight(weightKg);
  
      setHistory([...history, weightData]);
      setWeight('');
      setNotes('');
      alert('Weight record saved successfully!');
      navigation.replace("MainApp"); // กลับไปหน้า MainApp
    } catch (error) {
      console.error('❌ Error saving weight:', error);
      alert('Failed to save weight record.');
    }
  };
  
  // ✅ ฟังก์ชันยืนยันก่อนบันทึก
  const handleSavePet = () => {
    if (!validateInputs()) return;
    const weightC = unit === 'g' ? parseFloat(weight) / 1000 : parseFloat(weight);
    Alert.alert(
      'Confirm Save',
      `Are you sure you want to save?\nWeight: ${weightC} kg\nDate: ${dayjs(selectedDate).format('MMM D, YYYY h:mm A')}\nNotes: ${notes || 'None'}`,
      [{ text: 'Cancel', style: 'cancel' }, { text: 'OK', onPress: saveWeightToFirestore }]
    );
  };



const fetchWeightHistory = async () => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) return;

    const weightRef = collection(db, 'weights');
    const q = query(weightRef, where('petID', '==', petID), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    const weightHistory = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    setHistory(weightHistory);
  } catch (error) {
    console.error('❌ Error fetching weight history:', error);
    alert('Failed to fetch weight history.');
  }
};

// ✅ โหลดข้อมูลเมื่อหน้าจอเปิด
useEffect(() => {
  fetchWeightHistory();
}, []);

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <View className="flex-[7] bg-white p-4">
      <View className="flex-row justify-start">
        <BackButton />
      </View>

      <View className="flex-1 bg-white p-4">
        <Text className="text-lg font-semibold text-gray-700 mb-2">The pet's weight</Text>
        <View className="flex-row items-center gap-2 mb-4">
          <View className="flex-1 border border-gray-300 p-3 rounded-xl flex-row items-center">
            <TextInput className="flex-1 text-lg" keyboardType="numeric" value={weight} onChangeText={setWeight} placeholder="Enter weight" />
            <Text className="text-gray-600">{unit}</Text>
          </View>
          <TouchableOpacity className="bg-gray-200 p-3 rounded-xl" onPress={toggleUnit}>
            <Text className="text-gray-700">{unit === 'kg' ? 'g' : 'kg'}</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-gray-600 mb-4">Pet weight is: {unit === 'kg' ? weight : (parseFloat(weight) / 1000 || 0)} kg</Text>

        <Text className="text-lg font-semibold text-gray-700 mb-2">Measurement Date and Time</Text>
        <TouchableOpacity className="border border-gray-300 p-3 rounded-xl mb-4" onPress={() => setShowPicker(true)}>
          <Text>{dayjs(selectedDate).format('MMM D, YYYY h:mm A')}</Text>
        </TouchableOpacity>

        {showPicker && <DateTimePicker value={selectedDate} mode="datetime" display="default" onChange={(event, date) => { setShowPicker(false); if (date) setSelectedDate(date); }} />}

        <Text className="text-lg font-semibold text-gray-700 mb-2">Notes</Text>
        <TextInput className="border border-gray-300 p-3 rounded-xl mb-4" placeholder="Enter notes" value={notes} onChangeText={setNotes} />

        <TouchableOpacity className="bg-blue-500 p-4 rounded-xl items-center" onPress={handleSavePet}>
          <Text className="text-white font-bold text-lg">Save</Text>
        </TouchableOpacity>
      </View>
      </View>

      <View className="flex-[3] p-4 border-t border-gray-300">
        <Text className="text-lg font-semibold text-gray-700 mb-2">Weight History</Text>
        {history.length === 0 ? (
          <Text className="text-gray-500">No weight records found.</Text>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="border border-gray-300 p-3 rounded-xl mb-2">
                <Text className="text-gray-800">{item.weight} kg</Text>
                <Text className="text-gray-600">{dayjs(item.date).format('MMM D, YYYY h:mm A')}</Text>
                {item.notes ? <Text className="text-gray-500">Notes: {item.notes}</Text> : null}
              </View>
            )}
          />
        )}
      </View>

    </SafeAreaView>
  );
};

export default WeightDetailsScreen;
