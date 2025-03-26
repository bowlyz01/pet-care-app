import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from '../config/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../components/BackButton';

const EditDocumentScreen = ({ route, navigation }) => {
  const { documentId, documentName, documentNote, createdAt } = route.params;

  const [newName, setNewName] = useState(documentName);
  const [newNote, setNewNote] = useState(documentNote);

  const handleSave = async () => {
    if (!newName.trim() || !newNote.trim()) return;

    try {
      const docRef = doc(db, "documents", documentId);
      await updateDoc(docRef, {
        name: newName,
        notes: newNote,
      });

      console.log("Document updated:", newName, newNote);
      navigation.goBack(); // Go back after saving
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-row justify-between items-center">
            <BackButton />
        </View>
    <View className="p-4 flex-1 ">
    <View className="items-center mb-4">
        <Text className="text-xl font-bold text-gray-700">Edit Document</Text>
    </View>
      {/* <Text style={{ marginVertical: 10 }}>Created on: {createdAt?.toDate().toLocaleString() || "Unknown Date"}</Text> */}

    {/* Name*/}
      <Text className="text-lg font-semibold">Images Name</Text>
      <TextInput
        className="border rounded-lg p-3 h-12 mb-4"
        placeholder="Enter new name"
        value={newName}
        onChangeText={setNewName}
      />
    {/* Additional Information */}
      <Text className="text-lg font-semibold">Additional Information</Text>
      <TextInput
        className="border rounded-lg p-3 h-24 mb-4"
        placeholder="Edit Note"
        value={newNote}
        onChangeText={setNewNote}
        multiline
      />

      <TouchableOpacity onPress={handleSave} style={{ backgroundColor: 'blue', padding: 10, borderRadius: 8 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Save</Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
};

export default EditDocumentScreen;
