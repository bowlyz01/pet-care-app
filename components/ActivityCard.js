import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert, TextInput } from "react-native";
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS, interpolate } from "react-native-reanimated";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import dayjs from "dayjs";
import Modal from "react-native-modal";

const activityData = {
  Walking: { points: 20, duration: 60 },
  Feeding: { points: 20, duration: 10 },
  Training: { points: 10, duration: 20 },
  Playing: { points: 10, duration: 15 },
  Other: { points: 5, duration: 30 },
};

export default function ActivitiesCard({
  id,
  startTime,
  endTime,
  name,
  petId,
  points,
  status,
  onDelete,
}) {
  const translateX = useSharedValue(0);
  const [petName, setPetName] = useState("Loading...");
  const [isModalVisible, setModalVisible] = useState(false);
  const [formattedStartTime, setFormattedStartTime] = useState("");
  const [formattedEndTime, setFormattedEndTime] = useState("");

  useEffect(() => {
    const fetchPetName = async () => {
      try {
        const db = getFirestore();
        const petRef = doc(db, "pets", petId);
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
  }, [petId]);

  useEffect(() => {
    const calculateTime = () => {
      const currentTime = dayjs();
      const activityType = activityData[name] ? name : "Other"; // ตรวจสอบว่ามีใน activityData ไหม
  
      const startTime = currentTime.format("HH:mm");
      const endTime = currentTime.add(activityData[activityType].duration, "minute").format("HH:mm");
  
      setFormattedStartTime(startTime);
      setFormattedEndTime(endTime);
    };
  
    if (isModalVisible) {
      calculateTime();
    }
  }, [isModalVisible, name]);
  


  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const iconOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-100, -50], [1, 0], "clamp"),
  }));

  const handleGesture = (event) => {
    if (status === "Expired") {
      translateX.value = 0;
      return;
    }
    translateX.value = event.nativeEvent.translationX;
  };

  const handleGestureEnd = () => {
    if (status === "Expired") {
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
        return "#999"; // gray
      case "Active":
        return "#45BCD8"; // blue
      case "Finished":
        return "#22C55E"; // green
      case "Pending":
        return "#FFD701"; // yellow
      case "Expired":
        return "#EE443F"; // red
      default:
        return "#999"; // gray (default)
    }
  };

  const confirmDelete = () => {
    Alert.alert("Confirm Deletion", `Do you want to delete "${name}"?`, [
      { text: "Cancel", style: "cancel", onPress: () => (translateX.value = withSpring(0)) },
      { text: "Delete", style: "destructive", onPress: () => onDelete(id, "Delete") },
    ]);
  };

  const handleCardPress = () => {
    if (status === "Pending") {
      setModalVisible(true);
    }
  };

  const startActivity = async () => {
    try {
      const db = getFirestore();
      const activityRef = doc(db, "activities", id);
      await updateDoc(activityRef, {
        status: "Active",
        startTime: formattedStartTime,
        endTime: formattedEndTime,
      });

      setModalVisible(false);

      alert(
        `"${name}" of ${petName} has been started at ${formattedStartTime} and will end at ${formattedEndTime}.`
      );
    } catch (error) {
      console.error("Error starting activity:", error);
      alert("An error occurred while starting the activity.");
    }
  };

  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        <View style={styles.deleteBackground}>
          <Animated.View style={[styles.trashIcon, iconOpacity]}>
            <MaterialIcons name="delete" size={24} color="white" />
          </Animated.View>
        </View>

        <PanGestureHandler onGestureEvent={handleGesture} onEnded={handleGestureEnd}>
          <Animated.View style={[styles.card, animatedStyle]} onTouchEnd={handleCardPress}>
            <View style={[styles.iconContainer, { backgroundColor: getStatusColor(status) }]}>
              <FontAwesome name="heart" size={24} color="white" />
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.timeText}>{startTime} - {endTime}</Text>
              <Text style={styles.activityName}>{name}</Text>
              <Text style={styles.activityName}>{petName}</Text>
            </View>

            <View style={styles.pointsContainer}>
              <Text style={styles.pointsText}>{points} points</Text>
              <FontAwesome name="heart" size={16} color="#FFB6C1" />
            </View>
          </Animated.View>
        </PanGestureHandler>
      </View>

      {/* Custom Modal */}
      <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Start Activity: {name} for {petName}
          </Text>
          <Text style={styles.modalDescription}>
            Do you want to start the activity? It will last for {activityData[name] ? activityData[name].duration : activityData["Other"].duration} minutes.
          </Text>

          {/* Start Time */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Start Time</Text>
            <TextInput
              style={styles.inputField}
              value={formattedStartTime}
              editable={false}
            />
          </View>

          {/* End Time */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>End Time</Text>
            <TextInput
              style={styles.inputField}
              value={formattedEndTime}
              editable={false}
            />
          </View>

          {/* Heart Score */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Heart Score</Text>
            <TextInput
              style={styles.inputField}
              value={`${points} points 🩷`}
              editable={false}
            />
          </View>

          <View style={styles.modalButtons}>
            <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.startButton} onPress={startActivity}>
              <Text style={styles.startText}>Start</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
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
    elevation: 6,
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
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 12,
    width: "100%",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  inputField: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    width: "100%",
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    width: "45%",
  },
  cancelText: {
    textAlign: "center",
    color: "#333",
  },
  startButton: {
    backgroundColor: "#45BCD8",
    padding: 10,
    borderRadius: 5,
    width: "45%",
  },
  startText: {
    textAlign: "center",
    color: "white",
  },
});
