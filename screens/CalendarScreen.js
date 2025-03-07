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
import { collection, query, where, getDocs, deleteDoc, doc,updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import dayjs from 'dayjs';

export default function CalendarScreen() {
  const navigation = useNavigation();
  const today = new Date().toISOString().split("T")[0];
  const [selectedDay, setSelectedDay] = useState(today);
  const [activities, setActivities] = useState({});
  const [markedDates, setMarkedDates] = useState({});
  const [expiredCount, setExpiredCount] = useState(0);

  const auth = getAuth();
  const user = auth.currentUser;

  useFocusEffect(
    useCallback(() => {
      setSelectedDay(today);
    }, [today])
  );

  // โหลดข้อมูลเมื่อหน้าโหลด
  useEffect(() => {
    fetchMarkedDates();
  }, [user]);

  // โหลดกิจกรรมทั้งหมดของผู้ใช้และกำหนดวันที่ที่มีจุดสีน้ำเงิน
  const fetchMarkedDates = async () => {
    if (!user) return;

    try {
      const q = query(collection(db, "activities"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      let datesWithActivities = {};
      querySnapshot.forEach(doc => {
        const activityDate = doc.data().date;
        if (activityDate) {
          datesWithActivities[activityDate] = {
            marked: true,
            dotColor: "blue", // จุดสีน้ำเงิน
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
  
      // Update activities and check for expired ones
      setActivities(prev => {
        const updatedActivities = { ...prev, [day]: activitiesList };
        checkExpiredStatus(activitiesList); // เช็คสถานะหมดอายุ
        return updatedActivities;
      });
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };
  
  const checkExpiredStatus = (activitiesList) => {
    const currentTime = new Date();
    const currentDate = currentTime.toISOString().split("T")[0];  // เอาแค่วันที่ (YYYY-MM-DD)
  
    // แปลงเวลาเป็นรูปแบบ "HH:mm"
    const currentFormattedTime = dayjs(currentTime).format("HH:mm");

    activitiesList.forEach(activity => {
      const endTime = activity.endTime; // เวลาสิ้นสุด
      const startTime = activity.startTime; // เวลาเริ่มต้น
      
      const activityDate = activity.date; // กิจกรรมที่ถูกเก็บไว้ใน date (ซึ่งเป็นวันที่)
      console.log("Activity Date:", activityDate);
      console.log("Current Date:", currentDate);
      console.log("Current Formatted Time:", currentFormattedTime);
      console.log("Start Time:", startTime);
      console.log("End Time:", endTime);
      
      // ถ้ากิจกรรมเลยวันที่ปัจจุบันไปแล้ว (activityDate < currentDate)
    if (activityDate < currentDate && activity.status !== 'Expired') {
      console.log("Activity expired by date, updating status...");
      updateActivityStatus(activity.id, 'Expired');  // เปลี่ยนสถานะเป็น "Expired"
    }
    // ถ้าเป็นวันเดียวกัน ให้เช็คเวลา
    else if (activityDate === currentDate) {
      if (currentFormattedTime > endTime && activity.status !== 'Expired') {
        console.log("Activity expired by time, updating status...");
        updateActivityStatus(activity.id, 'Expired'); // เปลี่ยนสถานะเป็น "Expired"
      } else if (currentFormattedTime > startTime && currentFormattedTime < endTime && activity.status !== 'Pending') {
        console.log("Activity pending, updating status...");
        updateActivityStatus(activity.id, 'Pending'); // เปลี่ยนสถานะเป็น "Pending"
      }
    }
    });
  };
  
  
  const updateActivityStatus = async (activityId, newStatus) => {
    try {
      // อัพเดตสถานะกิจกรรมใน Firestore
      const activityRef = doc(db, "activities", activityId);
      await updateDoc(activityRef, {
        status: newStatus,
      });
  
      // อัพเดตสถานะใน state
      setActivities(prevActivities => {
        const updatedActivities = { ...prevActivities };
        for (let day in updatedActivities) {
          updatedActivities[day] = updatedActivities[day].map(activity => {
            if (activity.id === activityId) {
              return { ...activity, status: newStatus };
            }
            return activity;
          });
        }
        return updatedActivities;
      });
    } catch (error) {
      console.error("Error updating activity status:", error);
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
        <View>
          <MaterialCommunityIcons
            name="calendar-clock-outline"
            size={24}
            color="black"
            onPress={() => navigation.navigate('ActivityOverdue')} // เปลี่ยนหน้าไปหน้า ActivityOverdue
          />
          {/* แสดงจำนวนกิจกรรมที่หมดอายุ */}
          {expiredCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>{expiredCount}</Text>
            </View>
          )}
        </View>
      </View>
      <View className="flex-row justify-center items-center">
        <Text className="text-lg font-bold">Calendar Page</Text>
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
  notificationBadge: {
    position: "absolute",
    left: -5,
    bottom: -5, 
    backgroundColor: "red",
    borderRadius: 12,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  
  notificationText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
});
