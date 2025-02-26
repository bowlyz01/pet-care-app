import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import BackButton from "../components/BackButton";
import ActivitiesCard from "../components/ActivityCard";
import { Calendar } from "react-native-calendars";
import AddActivity from "../components/AddActivity";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { db } from "../config/firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";


export default function CalendarScreen() {
  const navigation = useNavigation();
  const today = new Date().toISOString().split("T")[0];
  const [selectedDay, setSelectedDay] = useState(today);
  const [activities, setActivities] = useState({});


  const auth = getAuth();
  const user = auth.currentUser;

  useFocusEffect(
    useCallback(() => {
      setSelectedDay(today);
    }, [today])
  );

  const fetchActivities = async (day) => {
    if (!user) return;
  
    try {
      const q = query(collection(db, "activities"), where("userId", "==", user.uid), where("date", "==", day));
      const querySnapshot = await getDocs(q);
      const activitiesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime || "00:00",
        endTime: doc.data().endTime || "00:00",
      }));
  
      setActivities(prev => ({ ...prev, [day]: activitiesList }));
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };
  


  const handleDelete = async (selectedDay, activityId, newStatus) => {
    setActivities((prevActivities) => {
      const updatedActivities = { ...prevActivities };
  
      if (updatedActivities[selectedDay]) {
        updatedActivities[selectedDay] = updatedActivities[selectedDay].map((activity) =>
          activity.id === activityId ? { ...activity, status: newStatus } : activity
        );
      }
  
      return updatedActivities;
    });
  
    try {
      if (newStatus === "Delete") {
        await deleteDoc(doc(db, "activities", activityId)); // ลบจาก Firebase
        console.log(`Activity ${activityId} deleted successfully`);
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View className="flex-row justify-between items-center px-4 py-2">
        <BackButton />
        <MaterialCommunityIcons name="calendar-clock-outline" size={24} color="black" />
      </View>
      <View className="flex-row justify-center items-center">
        <Text className="text-lg font-bold">Calendar Page</Text>
      </View>

      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={(day) => {
            setSelectedDay(day.dateString);
            fetchActivities(day.dateString);}}
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

        {selectedDay && activities[selectedDay]?.filter(activity => activity.status !== "Delete").length > 0 ? (
        activities[selectedDay]
          .filter(activity => activity.status !== "Delete") // กรองข้อมูลที่ต้องการ
          .map((activity, idx) => (
            <ActivitiesCard
            key={activity.id}
            id={activity.id} 
            startTime={activity.startTime || "00:00"}
            endTime={activity.endTime || "00:00"}
            name={activity.activityType || "Unnamed Activity"}
            petId={activity.petID || "Unknown Pet"}
            points={activity.heartScore || 0}
            status={activity.status || "Created"}
            onDelete={(id, newStatus) => handleDelete(selectedDay, activity.id, newStatus)}
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
