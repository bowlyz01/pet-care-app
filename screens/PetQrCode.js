import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRoute } from "@react-navigation/native";
import BackButton from "../components/BackButton";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PetQRCodeScreen() {
  const route = useRoute();
  const { petID } = route.params || {};

  const [petData, setPetData] = useState(null);
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPetData = async () => {
      if (!petID) {
        setLoading(false);
        return;
      }

      try {
        const petRef = doc(db, "pets", petID);
        const petSnap = await getDoc(petRef);

        if (petSnap.exists()) {
          const petInfo = petSnap.data();
          setPetData(petInfo);

          if (petInfo.userId) {
            const ownerRef = doc(db, "users", petInfo.userId);
            const ownerSnap = await getDoc(ownerRef);

            if (ownerSnap.exists()) {
              setOwnerData(ownerSnap.data());
            } else {
              console.warn("Owner data not found");
            }
          }
        } else {
          console.warn("Pet data not found");
        }
      } catch (error) {
        console.error("Error fetching pet data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPetData();
  }, [petID]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text>Loading pet data...</Text>
      </View>
    );
  }

  if (!petData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 18, color: "red" }}>Pet not found.</Text>
      </View>
    );
  }

  const qrValue = `https://pet-care-expo.web.app?petID=${petID}`;

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4">
      <View className="flex-row justify-start mb-4">
        <BackButton />
      </View>

      <ScrollView contentContainerStyle={{ alignItems: "center" }}>
        <Text className="text-2xl font-bold mb-4">Pet QR Code</Text>

        <View className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <QRCode value={qrValue} size={180} />
          <Text className="mt-4 text-gray-600 text-center">
            Scan this QR to view pet details.
          </Text>
        </View>

        {petData && (
          <View className="bg-white p-4 rounded-2xl shadow-lg mb-4 w-11/12">
            <Text className="text-lg font-bold mb-2 text-gray-800">🐾 Pet Details:</Text>
            <Text className="text-gray-700">Name: {petData.name || "Unknown"}</Text>
            <Text className="text-gray-700">Breed: {petData.breed || "Unknown"}</Text>
            <Text className="text-gray-700">Gender: {petData.gender || "Unknown"}</Text>
            <Text className="text-gray-700">Birthdate: {petData.birthdate || "Unknown"}</Text>
          </View>
        )}

        {ownerData && (
          <View className="bg-white p-4 rounded-2xl shadow-lg w-11/12">
            <Text className="text-lg font-bold mb-2 text-gray-800">👤 Owner Details:</Text>
            <Text className="text-gray-700">Name: {ownerData.name || "Unknown"}</Text>
            <Text className="text-gray-700">Phone: {ownerData.phone || "Unknown"}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
