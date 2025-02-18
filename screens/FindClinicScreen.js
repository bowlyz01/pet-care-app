import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';

export default function FindClinicScreen() {
  const [location, setLocation] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      console.log("User Location:", userLocation.coords);
      setLocation(userLocation.coords);
      fetchClinics(userLocation.coords);
    })();
  }, []);

  const fetchClinics = async (coords) => {
    const { latitude, longitude } = coords;
    const apiKey = "AIzaSyATvQcmuutL9XZh_majL1--hogRsla0jd4"; // 🔹 ใส่ API Key ของคุณที่นี่
    const radius = 5000; // ค้นหาในระยะ 5 กิโลเมตร
    const type = "hospital"; // ค้นหาคลินิกหรือโรงพยาบาล
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setClinics(data.results);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching clinics:", error);
    }
  };

  return (
    <View className="flex-1">
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {/* แสดงตำแหน่งของผู้ใช้ */}
          {location && (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Your Location"
              pinColor="blue"
            />
          )}

          {/* แสดงตำแหน่งของคลินิกใกล้เคียง */}
          {clinics.map((clinic, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: clinic.geometry.location.lat,
                longitude: clinic.geometry.location.lng,
              }}
              title={clinic.name}
              description={clinic.vicinity}
            />
          ))}
        </MapView>
      )}
    </View>
  );
}
