import React from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS, interpolate } from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";

export default function ActivitiesCard({ id, time, type, description, onDelete }) {
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const iconOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-100, -50], [1, 0], "clamp"),
  }));

  const handleGesture = (event) => {
    translateX.value = event.nativeEvent.translationX;
  };

  const handleGestureEnd = () => {
    if (translateX.value < -100) {
      runOnJS(confirmDelete)();
    } else {
      translateX.value = withSpring(0);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "ยืนยันการลบ",
      `คุณต้องการลบ \"${description}\" หรือไม่?`,
      [
        { text: "ยกเลิก", style: "cancel", onPress: () => (translateX.value = withSpring(0)) },
        { text: "ลบ", style: "destructive", onPress: () => onDelete(id) },
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
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>{type[0]}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.timeText}>{time}</Text>
              <Text style={styles.descriptionText}>{description}</Text>
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
    overflow: "hidden",
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
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  infoContainer: {
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
  },
});

