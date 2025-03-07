import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import BackButton from "../components/BackButton";
import ActivitiesCard from "../components/ActivityCard";
import { Calendar } from "react-native-calendars";
import AddActivity from "../components/AddActivity";
import { db } from "../config/firebase";
import { collection, query, where, getDocs, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function ActivityOverdueScreen() {
  const navigation = useNavigation();
  const today = new Date().toISOString().split("T")[0];
  const [selectedDay, setSelectedDay] = useState(today);
  const [activities, setActivities] = useState({});
  const [markedDates, setMarkedDates] = useState({});

  const auth = getAuth();
  const user = auth.currentUser;

  useFocusEffect(
    useCallback(() => {
      setSelectedDay(today);
    }, [today])
  );

  // Load data when the screen loads
  useEffect(() => {
    fetchMarkedDates();
  }, [user]);

  // Fetch all activities for the user and set dates with a blue dot for "Expired" status
  const fetchMarkedDates = async () => {
    if (!user) return;

    try {
      const q = query(collection(db, "activities"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      let datesWithActivities = {};
      querySnapshot.forEach(doc => {
        const activityDate = doc.data().date;
        const activityStatus = doc.data().status;

        // Only mark dates with "Expired" status
        if (activityDate && activityStatus === "Expired") {
          datesWithActivities[activityDate] = {
            marked: true,
            dotColor: "blue", // Blue dot for expired activities
          };
        }
      });

      setMarkedDates(datesWithActivities);
    } catch (error) {
      console.error("Error fetching marked dates:", error);
    }
  };

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


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View className="flex-row justify-between items-center px-4 py-2">
        <BackButton />
      </View>
      <View className="flex-row justify-center items-center">
        <Text className="text-lg font-bold">Activity Overdue</Text>
      </View>

      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={(day) => {
            setSelectedDay(day.dateString);
            fetchActivities(day.dateString);
          }}
          markedDates={{
            ...markedDates,
            [selectedDay]: { selected: true, selectedColor: "blue", ...markedDates[selectedDay] },
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
            {selectedDay ? `Expired Activities for ${selectedDay}` : "Select a day to view activities"}
          </Text>
          <AddActivity selectedDay={selectedDay} />
        </View>

        {selectedDay && activities[selectedDay]?.filter(activity => activity.status === "Expired").length > 0 ? (
          activities[selectedDay]
            .filter(activity => activity.status === "Expired") // Filter activities with "Expired" status
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
              />
            ))
        ) : (
          <Text style={styles.noActivities}>
            {selectedDay ? "No expired activities for this day." : "Please select a date to see expired activities."}
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
