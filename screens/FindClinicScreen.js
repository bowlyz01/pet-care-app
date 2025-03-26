import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

export default function FindClinicScreen() {
  const [location, setLocation] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const navigation = useNavigation();
  const apiKey = Constants.expoConfig.extra.googleApiKey;

  console.log('Google API Key:', apiKey);


  

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        setLoading(false);
        return;
      }      

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);
      fetchClinics(userLocation.coords);
    })();
  }, []);

  const fetchClinics = async (coords) => {
    const { latitude, longitude } = coords;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=veterinary_care&key=${apiKey}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log('Clinic Data:', data);
      if (data.results && data.results.length > 0) {
        setClinics(data.results);
      } else {
        alert('No clinics found.');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      alert('Error fetching clinics.');
    }
  };
  
  const openGoogleMaps = (clinic) => {
    const { lat, lng } = clinic.geometry.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    Linking.openURL(url);
  };

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Your Location"
              pinColor="blue"
            />

            {clinics.map((clinic, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: clinic.geometry.location.lat,
                  longitude: clinic.geometry.location.lng,
                }}
                title={clinic.name}
                description={clinic.vicinity}
                onPress={() => setSelectedClinic(clinic)}
              />
            ))}
          </MapView>

          {selectedClinic && (
            <View style={styles.clinicCard}>
              <Text style={styles.clinicName}>{selectedClinic.name}</Text>
              <Text style={styles.clinicVicinity}>{selectedClinic.vicinity}</Text>
              <Text style={styles.clinicRating}>
                ⭐ {selectedClinic.rating || 'No Rating'} ({selectedClinic.user_ratings_total || 0} reviews)
              </Text>
              <TouchableOpacity
                style={styles.directionButton}
                onPress={() => openGoogleMaps(selectedClinic)}
              >
                <Text style={styles.directionText}>Get Direction</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  clinicCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  clinicVicinity: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  clinicRating: {
    fontSize: 14,
    marginBottom: 10,
    color: '#888',
  },
  directionButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  directionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
