import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS, interpolate } from "react-native-reanimated";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default function ActivitiesCard({ id, startTime, endTime, name, petId, points, status, onDelete }) {
  const translateX = useSharedValue(0);

  const [petName, setPetName] = useState("Loading..."); // รอโหลดชื่อสัตว์

  // ดึงชื่อสัตว์จาก Firestore
  useEffect(() => {
    const fetchPetName = async () => {
      try {
        const db = getFirestore();
        const petRef = doc(db, "pets", petId); // ดึงข้อมูลจาก collection "pets"
        const petSnap = await getDoc(petRef);

        if (petSnap.exists()) {
          setPetName(petSnap.data().name);
        } else {
          setPetName("Unknown");
        }
      } catch (error) {
        console.error("Error fetching pet:", error);
        setPetName("Error");
      }
    };

    if (petId) {
      fetchPetName();
    }
  }, [petId]); // โหลดใหม่เมื่อ petId เปลี่ยน

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const iconOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-100, -50], [1, 0], "clamp"),
  }));

  const handleGesture = (event) => {
    if (status === "Expired") {
      // ไม่ให้สไลด์หากสถานะเป็น "Expired"
      translateX.value = 0;
      return;
    }
    translateX.value = event.nativeEvent.translationX;
  };

  const handleGestureEnd = () => {
    if (status === "Expired") {
      // ถ้าสถานะเป็น "Expired" ให้ไม่สามารถลบได้
      translateX.value = withSpring(0);
      return;
    }

    if (translateX.value < -100) {
      runOnJS(confirmDelete)();
    } else {
      translateX.value = withSpring(0);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {

      case "Created":
        return "#999"; // เทา
      case "Active":
        return "#45BCD8"; // ฟ้า
      case "Finished":
        return "#22C55E"; // เขียว
      case "Pending":
        return "#FFD701"; // เหลือง
      case "Expired":
        return "#EE443F"; // แดง
      default:
        return "#999"; // เทา (ค่าเริ่มต้น)
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Confirm Deletion",
      `Do you want to delete \"${name}\"?`,
      [
        { text: "Cancel", style: "cancel", onPress: () => (translateX.value = withSpring(0)) },
        { text: "Delete", style: "destructive", onPress: () => onDelete(id, "Delete") },
      ]
    );
  };

  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        {/* พื้นหลังแดง + ไอคอนถังขยะ */}
        <View style={styles.deleteBackground}>
          <Animated.View style={[styles.trashIcon, iconOpacity]}>
            <MaterialIcons name="delete" size={24} color="white" />
          </Animated.View>
        </View>

        {/* การ์ดที่เลื่อนได้ */}
        <PanGestureHandler onGestureEvent={handleGesture} onEnded={handleGestureEnd}>
          <Animated.View style={[styles.card, animatedStyle]}>
            {/* ไอคอนหัวใจในวงกลมแดง */}
            <View style={[styles.iconContainer, { backgroundColor: getStatusColor(status) }]}>
              <FontAwesome name="heart" size={24} color="white" />
            </View>

            {/* ข้อมูลกิจกรรม */}
            <View style={styles.infoContainer}>
              <Text style={styles.timeText}>{startTime} - {endTime}</Text>
              <Text style={styles.activityName}>{name}</Text>
              <Text style={styles.activityName}>{petName}</Text>
            </View>

            {/* คะแนน */}
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsText}>{points} points</Text>
              <FontAwesome name="heart" size={16} color="#FFB6C1" />
            </View>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    // overflow: "hidden",
    marginVertical: 8,
  },
  deleteBackground: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 20,
    borderRadius: 12,
  },
  trashIcon: {
    transform: [{ translateX: -10 }],
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 6, // เพิ่มเงาบน Android
    shadowColor: "#000",
    shadowOpacity: 0.2, 
    shadowRadius: 6, 
    shadowOffset: { width: 0, height: 4 }, 
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#D9534F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activityName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pointsText: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 5,
    color: "#666",
  },
});
