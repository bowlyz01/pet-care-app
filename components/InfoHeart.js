import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from '@react-navigation/native';
import { db } from "../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import dayjs from "dayjs";

export default function InfoHeart({ petID }) {
  const navigation = useNavigation();
  const [totalHeartScore, setTotalHeartScore] = useState(0);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user && petID) {
      fetchHeartScore();
    }
  }, [user, petID]);

  const handlePress = () => {
    navigation.navigate('PetDailyPoints', { petID });
  };

  const fetchHeartScore = async () => {
    try {
      const today = dayjs().format("YYYY-MM-DD");
      const q = query(
        collection(db, "activities"),
        where("userId", "==", user.uid),
        where("petID", "==", petID),
        where("date", "==", today),
        where("status", "==", "Finished")
      );
      
      const querySnapshot = await getDocs(q);
      let totalScore = 0;

      querySnapshot.forEach((doc) => {
        const heartScore = parseInt(doc.data().heartScore, 10) || 0;
        totalScore += heartScore;
      });

      setTotalHeartScore(totalScore);
    } catch (error) {
      console.error("Error fetching heart score:", error);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Text style={styles.heartIcon}>{'\u2764'}</Text>
      <Text style={styles.label}>คะแนนสัตว์เลี้ยง</Text>
      <Text style={styles.score}>{totalHeartScore}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFEB99",
    width: "100%",
    height: 100,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  heartIcon: {
    fontSize: 30,
    color: "#FF4444",
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#444",
  },
  score: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
});
