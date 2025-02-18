import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import BackButton from '../components/BackButton';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';

export default function AddActivityScreen() {
  const route = useRoute();
  const { selectedDay } = route.params || {};
  
  const [selectedDate, setSelectedDate] = useState(selectedDay ? new Date(selectedDay) : new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // ประเภทกิจกรรม
  const activityOptions = ["Walking", "Feeding", "Training", "Playing", "Other"];
  const [openDropdown, setOpenDropdown] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [customActivity, setCustomActivity] = useState("");

  const formatDate = (date) => dayjs(date).format("YYYY-MM-DD");
  const formatTime = (time) => dayjs(time).format("HH:mm");

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
          setValue={(value) => {
            setSelectedActivity(value);
            if (value !== "Other") {
              setCustomActivity(""); // ล้างค่า Custom เมื่อเลือกตัวเลือกที่มีอยู่แล้ว
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
        onPress={() => {
          const activityType = selectedActivity === "Other" ? customActivity : selectedActivity;
          if (!activityType) {
            alert("Please select or enter an activity type.");
            return;
          }
          alert(`Saved activity: ${activityType} on ${formatDate(selectedDate)} at ${formatTime(selectedTime)}`);
        }}
      >
        <Text className="text-white font-bold text-lg">Save Activity</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
