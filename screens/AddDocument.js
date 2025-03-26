import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import BackButton from "../components/BackButton";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";


const categories = [
  { label: "Health Certificate", value: "Health Certificate" },
  { label: "Medical Record / Treatment Report", value: "Medical Record / Treatment Report" },
  { label: "Invoice / Receipt", value: "Invoice / Receipt" },
  { label: "Vaccination Record / Certificate", value: "Vaccination Record / Certificate" },
  { label: "Sterilization Certificate", value: "Sterilization Certificate" },
  { label: "Referral Letter", value: "Referral Letter" },
  { label: "X-ray Images", value: "X-ray Images" },
];

const AddDocument = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { petID } = route.params;

  const [category, setCategory] = useState(null);
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [open, setOpen] = useState(false); 
  const [loading, setLoading] = useState(false);

  // 📌 ฟังก์ชันเลือกภาพจากแกลเลอรี
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 📌 ฟังก์ชันอัปโหลดภาพไป Firebase Storage
  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `documents/${petID}/${Date.now()}`);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null,
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  // 📌 ฟังก์ชันบันทึกข้อมูลลง Firestore

  const saveDocument = async () => {
    if (!name) {
      Alert.alert("Error", "Please enter a image name.");
      return;
    }
    if (!category) {
      Alert.alert("Error", "Please select a document category.");
      return;
    }
  
    if (!image) {
      Alert.alert("Error", "Please upload an image before saving.");
      return;
    }
  
    const auth = getAuth();
    if (!auth.currentUser) {
      Alert.alert("Error", "User is not logged in. Please log in first.");
      return;
    }
  
    setLoading(true);
    
    try {
      const storage = getStorage();
      const imageRef = ref(storage, `documents/${petID}/${Date.now()}`);
      const response = await fetch(image);
      const blob = await response.blob();
  
      // 📌 อัปโหลดรูปไป Firebase Storage
      const uploadTask = uploadBytesResumable(imageRef, blob);
  
      let imageUrl = await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          null,
          (error) => reject(error),
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
  
      // 📌 บันทึกข้อมูลเอกสารลง Firestore
      await addDoc(collection(db, "documents"), {
        petID,
        category,
        name,
        notes,
        ownerID: auth.currentUser.uid,
        imageUrl, // 👈 รูปเป็นค่าบังคับ
        createdAt: serverTimestamp(),
      });
  
      Alert.alert("Success", "Document added successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error saving document:", error);
      Alert.alert("Error", "Failed to save document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      {/* Header */}
      <View className="flex-row justify-between items-center">
        <BackButton />
      </View>

      {/* Title */}
      <View className="items-center mb-4">
        <Text className="text-xl font-bold text-gray-700">Add Document</Text>
      </View>

      {/* Select Document Category */}
      <Text className="text-lg font-semibold mb-2">Document Category</Text>
      <DropDownPicker
        open={open}
        value={category}
        items={categories}
        setOpen={setOpen}
        setValue={setCategory}
        placeholder="Select Document Category"
        containerStyle={{ marginBottom: 20 }}
      />

      {/* Upload Image */}
      <Text className="text-lg font-semibold">Images</Text>
      <TouchableOpacity onPress={pickImage} className="border rounded-lg p-4 items-center mb-4 bg-gray-100">
        {image ? (
          <Image source={{ uri: image }} className="w-40 h-40 rounded-md" />
        ) : (
          <Text className="text-gray-500">Click to Upload an Image</Text>
        )}
      </TouchableOpacity>

      {/* Name*/}
      <Text className="text-lg font-semibold">Images Name</Text>
      <TextInput
        placeholder="Type Here..."
        className="border rounded-lg p-3 h-12 mb-4"
        value={name}
        onChangeText={setName}
      />

      {/* Additional Information */}
      <Text className="text-lg font-semibold">Additional Information</Text>
      <TextInput
        placeholder="Type Here..."
        className="border rounded-lg p-3 h-24 mb-4"
        multiline
        value={notes}
        onChangeText={setNotes}
      />

      {/* Save Button */}
      <TouchableOpacity
        onPress={saveDocument}
        className="px-4 py-2 rounded-lg bg-blue-500"
      >
        <Text className="text-white font-semibold text-center">Save</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AddDocument;
