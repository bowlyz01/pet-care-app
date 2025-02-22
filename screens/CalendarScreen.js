import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import BackButton from "../components/BackButton";
import ActivitiesCard from "../components/ActivityCard";
import { Calendar } from "react-native-calendars";
import AddActivity from "../components/AddActivity";

const initialActivities = {
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
  const today = new Date().toISOString().split("T")[0];
  const [selectedDay, setSelectedDay] = useState(today);
  const [activities, setActivities] = useState(initialActivities);
  const [lastDeleted, setLastDeleted] = useState(null);

  useFocusEffect(
    useCallback(() => {
      setSelectedDay(today);
    }, [today])
  );

  const handleDelete = (day, index) => {
    const deletedActivity = activities[day][index];
    setLastDeleted({ day, index, activity: deletedActivity });

    const updatedActivities = { ...activities };
    updatedActivities[day].splice(index, 1);
    if (updatedActivities[day].length === 0) delete updatedActivities[day];
    setActivities(updatedActivities);

    Alert.alert("Activity Deleted", "The activity has been removed.", [
      {
        text: "Undo",
        onPress: () => undoDelete(),
        style: "cancel",
      },
      { text: "OK" },
    ]);
  };

  const undoDelete = () => {
    if (!lastDeleted) return;
    const { day, index, activity } = lastDeleted;
    const updatedActivities = { ...activities };
    if (!updatedActivities[day]) updatedActivities[day] = [];
    updatedActivities[day].splice(index, 0, activity);
    setActivities(updatedActivities);
    setLastDeleted(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View className="flex-row justify-start">
        <BackButton />
      </View>
      <View className="flex-row justify-center items-center">
        <Text className="text-lg font-bold">Calendar Page</Text>
      </View>

      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={(day) => setSelectedDay(day.dateString)}
          markedDates={{
            [selectedDay]: { selected: true, selectedColor: "blue" },
          }}
          theme={{
            todayTextColor: "red",
            arrowColor: "gray",
            textDayFontWeight: "600",
            selectedDayBackgroundColor: "blue",
            dotColor: "blue",
          }}
        />
      </View>

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
              onDelete={() => handleDelete(selectedDay, idx)}
            />
          ))
        ) : (
          <Text style={styles.noActivities}>
            {selectedDay ? "No activities for this day." : "Please select a date to see activities."}
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
