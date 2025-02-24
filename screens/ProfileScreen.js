import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; 
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { app } from '../config/firebase'; 
import BackButton from '../components/BackButton';

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); 

export default function PetOwnerDetailsScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({ username: '', name: '', phone: '', altPhone: '', profileImage: null });

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          setUserData({ username: user.displayName || '', name: '', phone: '', altPhone: '', profileImage: null });
        }
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Required", "กรุณาอนุญาตให้แอปเข้าถึงรูปภาพของคุณ");
      }
    })();
  }, []);
  

  const handleEdit = () => setIsEditing(true);
  
  const handleSave = async () => {
    const user = auth.currentUser;
    if (user) {
      // ตรวจสอบ Username
      if (userData.username.length < 6 || userData.username.length > 30) {
        Alert.alert('Sign Up', 'Username must be between 6 and 30 characters');
        return;
      }
  
      // ตรวจสอบ Phone Number (ต้องเป็นตัวเลข 10 หลัก)
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(userData.phone)) {
        Alert.alert('Invalid Phone Number', 'Phone number must be exactly 10 digits');
        return;
      }
  
      if (userData.altPhone && !phoneRegex.test(userData.altPhone)) {
        Alert.alert('Invalid Alternative Phone', 'Alternative phone number must be exactly 10 digits');
        return;
      }
  
      // บันทึกข้อมูลไปยัง Firestore
      await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
      setIsEditing(false);
    }
  };

  const handleChange = (key, value) => {
    setUserData((prevData) => ({ ...prevData, [key]: value }));
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
  
    console.log("📸 Image Picker Result:", result);
  
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      console.log("✅ Selected Image URI:", imageUri);
      uploadImage(imageUri);
    } else {
      console.log("❌ Image selection was canceled or failed.");
    }
  };
  
  
  
  
  const uploadImage = async (uri) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "User not authenticated");
        return;
      }
  
      // แปลง URI ให้เป็น Blob
      const response = await fetch(uri);
      const blob = await response.blob();
  
      // อัปโหลดไปยัง Firebase Storage
      const storageRef = ref(storage, `profileImages/${user.uid}.jpg`);
      const metadata = { contentType: 'image/jpeg' }; 
      await uploadBytes(storageRef, blob, metadata);
  
      // ดึง URL ของรูปที่อัปโหลดแล้ว
      const downloadURL = await getDownloadURL(storageRef);
      console.log("✅ Image uploaded:", downloadURL);
  
      // อัปเดตข้อมูลผู้ใช้ใน Firestore
      setUserData((prevData) => ({ ...prevData, profileImage: downloadURL }));
      await setDoc(doc(db, 'users', user.uid), { profileImage: downloadURL }, { merge: true });
  
      Alert.alert("สำเร็จ", "อัปโหลดรูปโปรไฟล์เรียบร้อยแล้ว!");
    } catch (error) {
      console.error("🚨 Error uploading image:", error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถอัปโหลดรูปภาพได้");
    }
  };
  
  

  return (
    <SafeAreaView className="flex-1 bg-sky-400 px-6 pt-6">
      <View className="flex-row justify-start mb-4">
        <BackButton />
      </View>

      <View className="items-center mt-4 relative">
        <TouchableOpacity onPress={pickImage} className="relative">
          {userData.profileImage ? (
            <Image source={{ uri: userData.profileImage }} className="w-28 h-28 rounded-full" />
          ) : (
            <View className="w-28 h-28 bg-gray-300 rounded-full" />
          )}
          <View className="absolute bottom-0 right-0 bg-white rounded-full p-1">
            <AntDesign name="pluscircleo" size={24} color="black" />
          </View>
        </TouchableOpacity>
      </View>

      <Text className="text-center text-white font-semibold text-lg mt-4">
        Pet owner details
      </Text>

      <View className="mt-6 space-y-4">
        {['username', 'name', 'phone', 'altPhone'].map((field, index) => (
          <View key={index}>
            <Text className="text-white font-semibold">
              {field === 'username' ? 'Username' :
               field === 'name' ? 'Name' :
               field === 'phone' ? 'Phone number' : 'Alternative contact number'}
            </Text>
            <TextInput
              className="border-b border-white text-white placeholder-white py-2"
              value={userData[field]}
              onChangeText={(text) => {
                if (field === 'phone' || field === 'altPhone') {
                  handleChange(field, text.replace(/[^0-9]/g, '')); // กรองเฉพาะตัวเลข
                } else {
                  handleChange(field, text);
                }
              }}
              editable={isEditing}
              placeholderTextColor="#e0f2fe"
              keyboardType={field === 'phone' || field === 'altPhone' ? 'numeric' : 'default'} // ตั้งค่าเป็น numeric
              maxLength={field === 'phone' || field === 'altPhone' ? 10 : undefined} // จำกัดความยาว 10 ตัว
            />


          </View>
        ))}
      </View>

      <View className="flex-row justify-center space-x-4 mt-6">
        {isEditing ? (
          <TouchableOpacity className="border border-black px-6 py-2 rounded-lg bg-white" onPress={handleSave}>
            <Text className="text-black font-semibold">Save</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity className="border border-black px-6 py-2 rounded-lg bg-white" onPress={handleEdit}>
            <Text className="text-black font-semibold">Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
