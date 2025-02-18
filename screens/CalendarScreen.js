import { View, Text, ScrollView, StyleSheet } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import BackButton from "../components/BackButton";
import ActivitiesCard from "../components/ActivityCard";
import { Calendar } from "react-native-calendars";
import { db } from "../config/firebase";
import AddActivity from "../components/AddActivity";
const activities = {
  "2025-02-22": [
    { time: "23:45", type: "Weight", description: "Time for bambi's weight update!" },
    { time: "23:45", type: "Picture", description: "Time for bambi's new picture!" },
  ],
  "2025-02-23": [
    { time: "10:00", type: "Walk", description: "Morning walk for bambi." },
  ],
};

export default function CalendarScreen() {
  const navigation = useNavigation();
  const today = new Date().toISOString().split("T")[0]; // Get current date in "YYYY-MM-DD" format
  const [selectedDay, setSelectedDay] = useState(today);

  // Reset selectedDay to today when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setSelectedDay(today);
    }, [today])
  );

  // Generate markedDates with dots for days with activities
  const markedDates = {
    ...Object.keys(activities).reduce((acc, date) => {
      acc[date] = {
        marked: true,
        dots: [{ color: "blue", key: "activity" }],
      };
      return acc;
    }, {}),
    [selectedDay]: {
      selected: true,
      selectedColor: "blue",
    },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View className="flex-row justify-start">
        <BackButton />
      </View>
      <View className="flex-row justify-center items-center">
        <Text className="text-lg font-bold">Calendar Page</Text>
      </View>

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={(day) => setSelectedDay(day.dateString)}
          markedDates={markedDates}
          theme={{
            todayTextColor: "red",
            arrowColor: "gray",
            textDayFontWeight: "600",
            selectedDayBackgroundColor: "blue",
            dotColor: "blue",
          }}
        />
      </View>

      {/* Selected Day Activities */}
      <ScrollView style={styles.activitiesContainer}>
        <View className="flex-row justify-between items-center">
        <Text style={styles.activitiesHeader}>
          {selectedDay ? `Activities for ${selectedDay}` : "Select a day to view activities"}
        </Text>
        <AddActivity selectedDay={selectedDay} />

        </View>
        
        {selectedDay && activities[selectedDay] ? (
          activities[selectedDay].map((activity, idx) => (
            <ActivitiesCard
              key={idx}
              time={activity.time}
              type={activity.type}
              description={activity.description}
            />
          ))
        ) : (
          <Text style={styles.noActivities}>
            {selectedDay
              ? "No activities for this day."
              : "Please select a date to see activities."}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  calendarContainer: { padding: 16, backgroundColor: "white", elevation: 2 },
  activitiesContainer: { flex: 1, padding: 16 },
  activitiesHeader: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  noActivities: { fontSize: 14, color: "gray", textAlign: "center", marginTop: 16 },
});
