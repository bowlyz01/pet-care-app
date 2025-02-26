import { View, Text, TouchableOpacity, TextInput,ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import BackButton from '../components/BackButton';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { db } from '../config/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';


const activityData = {
  Walking: { points: 20, duration: 60},
  Feeding: { points: 20, duration: 10},
  Training: { points: 10, duration: 20},
  Playing: { points: 10, duration: 15},
  Other: { points: 5, duration: 30},
};

export default function AddActivityScreen() {
  const navigation = useNavigation();
  
  const route = useRoute();
  const { selectedDay } = route.params || {};

  const auth = getAuth();
  const user = auth.currentUser;

  const [selectedDate, setSelectedDate] = useState(selectedDay ? new Date(selectedDay) : new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // ประเภทกิจกรรม
  const activityOptions = ["Walking", "Feeding", "Training", "Playing", "Other"];
  const [openDropdown, setOpenDropdown] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [customActivity, setCustomActivity] = useState("");
  const [heartScore, setHeartScore] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");

  // สัตว์เลี้ยง
  const [petOptions, setPetOptions] = useState([]);
  const [selectedPetID, setSelectedPetID] = useState(null);
  const [openPetDropdown, setOpenPetDropdown] = useState(false);

  useEffect(() => {
    const fetchPets = async () => {
      if (!user) return;
      
      try {
        const petsQuery = query(collection(db, "pets"), where("userId", "==", user.uid));
        const petDocs = await getDocs(petsQuery);
        const petList = petDocs.docs.map(doc => ({
          label: doc.data().name, // ชื่อสัตว์เลี้ยง
          value: doc.id, // petID
        }));
        setPetOptions(petList);
      } catch (error) {
        console.error("Error fetching pets:", error);
      }
    };

    fetchPets();
  }, [user]);

  const formatDate = (date) => dayjs(date).format("YYYY-MM-DD");
  const formatTime = (time) => dayjs(time).format("HH:mm");

  const calculateEndTime = (startTime, duration) => {
    return dayjs(startTime).add(duration, "minute").format("HH:mm");
  };

  const saveActivityToFirebase = async () => {
    const activityType = selectedActivity === "Other" ? customActivity : selectedActivity;
    if (!activityType) {
      alert("Please select or enter an activity type.");
      return;
    }

    const activityData = {
      userId: user.uid,
      petID: selectedPetID,
      activityType,
      date: formatDate(selectedDate),
      startTime: formatTime(selectedTime),
      endTime: eventEndTime,
      heartScore,
      createdAt: new Date(),
      status: "Created",
    };

    try {
      await addDoc(collection(db, "activities"), activityData);
      alert("Activity saved successfully!");
      navigation.replace("Calendar");
    } catch (error) {
      console.error("Error saving activity: ", error);
      alert("Failed to save activity.");
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white", paddingHorizontal: 20 }}>
      {/* ปุ่มย้อนกลับ */}
      <View className="flex-row justify-start mb-4">
        <BackButton />
      </View>

      {/* Title */}
      <View className="items-center mb-6">
        <Text className="text-xl font-bold text-gray-700">Add Activity</Text>
      </View>
      <ScrollView>

      {/* เลือกสัตว์เลี้ยง */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-2">Select Your Pet</Text>
        <DropDownPicker
          open={openPetDropdown}
          value={selectedPetID}
          items={petOptions}
          setOpen={setOpenPetDropdown}
          setValue={setSelectedPetID}
          placeholder="Select your pet"
          style={{ borderRadius: 15 }}
          listMode="SCROLLVIEW"
        />
      </View>

      {/* ปุ่มเลือกวันที่และเวลา */}
      <View className="space-y-4">
        {/* เลือกวัน */}
        <TouchableOpacity
          className="border border-gray-300 p-4 rounded-xl"
          style={{ alignItems: "center" }}
          onPress={() => setShowDatePicker(true)}
        >
          <Text className="text-lg text-gray-600">📅 {formatDate(selectedDate)}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setSelectedDate(date);
            }}
          />
        )}

        {/* เลือกเวลา */}
        <TouchableOpacity
          className="border border-gray-300 p-4 rounded-xl"
          style={{ alignItems: "center" }}
          onPress={() => setShowTimePicker(true)}
        >
          <Text className="text-lg text-gray-600">⏰ {formatTime(selectedTime)}</Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="default"
            is24Hour={true}
            onChange={(event, time) => {
              setShowTimePicker(false);
              if (time) setSelectedTime(time);
            }}
          />
        )}
      </View>

      {/* Dropdown เลือกประเภทกิจกรรม */}
      <View className="mt-6">
        <Text className="text-lg font-semibold text-gray-700 mb-2">Activity Type</Text>
      <DropDownPicker
        open={openDropdown}
        value={selectedActivity}
        items={activityOptions.map((activity) => ({ label: activity, value: activity }))}
        setOpen={setOpenDropdown}
        setValue={setSelectedActivity}
        onChangeValue={(value) => {
          if (value) {
            const activityInfo = activityData[value] || { points: "", duration: "" };
            setHeartScore(activityInfo.points.toString());
            // คำนวณ Event End Time
            const newEndTime = calculateEndTime(selectedTime, activityInfo.duration);
            setEventEndTime(newEndTime);
          }
          if (value !== "Other") {
            setCustomActivity(""); // ล้างค่าถ้าไม่ได้เลือก Other
          }
        }}
        placeholder="Select activity type"
        style={{ borderRadius: 15, marginBottom: 15 }}
        dropDownContainerStyle={{ zIndex: 1000 }}
        listMode="SCROLLVIEW"
      />
      </View>

      {/* แสดงช่องให้กรอกกิจกรรมเองถ้าเลือก Other */}
      {selectedActivity === "Other" && (
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-2">Enter Custom Activity</Text>
          <TextInput
            className="border border-gray-300 p-4 rounded-xl"
            placeholder="Enter activity type"
            value={customActivity}
            onChangeText={setCustomActivity}
          />
        </View>
      )}

      {/* แสดง Event End Time */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-2">Event End Time</Text>
        <TextInput
          className="border border-gray-300 p-4 rounded-xl bg-gray-100"
          value={eventEndTime ? `⏳ Ends at: ${eventEndTime}` : ""}
          editable={false}
        />
      </View>

      {/* Heart Score (แสดง point ของ activity) */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-2">Heart Score</Text>
        <TextInput
          className="border border-gray-300 p-4 rounded-xl bg-gray-100"
          value={heartScore ? `${heartScore} Points` : ""}
          editable={false}
        />
      </View>

      {/* ปุ่มบันทึกกิจกรรม */}
      <TouchableOpacity
        className="bg-green-500 p-4 rounded-xl mt-6"
        style={{
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 3,
          elevation: 5, // สำหรับ Android
        }}
        onPress={saveActivityToFirebase}
      >
        <Text className="text-white font-bold text-lg">Save Activity</Text>
      </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
