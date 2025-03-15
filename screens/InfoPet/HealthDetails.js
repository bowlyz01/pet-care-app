import { View, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/BackButton';
import { AntDesign } from '@expo/vector-icons';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, storage } from '../../config/firebase';
import { getDownloadURL, ref } from "firebase/storage";
import DropDownPicker from "react-native-dropdown-picker";

const categories = [
  { label: "All", value: "All" }, // Default แสดงทั้งหมด
  { label: "Health Certificate", value: "Health Certificate" },
  { label: "Medical Record / Treatment Report", value: "Medical Record / Treatment Report" },
  { label: "Invoice / Receipt", value: "Invoice / Receipt" },
  { label: "Vaccination Record / Certificate", value: "Vaccination Record / Certificate" },
  { label: "Sterilization Certificate", value: "Sterilization Certificate" },
  { label: "Referral Letter", value: "Referral Letter" },
  { label: "X-ray Images", value: "X-ray Images" },
];

const HealthDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { petID } = route.params;

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔽 State สำหรับ Dropdown Picker
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("All"); // Default = All

  const getPublicImageUrl = async (path) => {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "documents"), where("petID", "==", petID));
        const querySnapshot = await getDocs(q);
        const docs = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            if (data.imagePath) {
              try {
                data.imageUrl = await getPublicImageUrl(data.imagePath);
              } catch (error) {
                console.error("Error fetching image URL:", error);
              }
            }
            return { id: doc.id, ...data };
          })
        );

        setDocuments(docs);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [petID]);

  // 🔽 ฟิลเตอร์เอกสารตาม Category ที่เลือก
  const filteredDocuments = category === "All"
    ? documents
    : documents.filter((doc) => doc.category === category);

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <View className="flex-row justify-between items-center">
        <BackButton />
        <TouchableOpacity
          onPress={() => navigation.navigate('AddDocument', { petID })}
          className="p-4 bg-yellow-500 rounded-full justify-center items-center shadow-md"
        >
          <AntDesign name="plus" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View className="items-center mb-4">
        <Text className="text-xl font-bold text-gray-700">Document</Text>
      </View>

      {/* Category Filter */}
      <View className="mb-4">
        <Text className="text-gray-600 font-semibold mb-1">Category:</Text>
        <DropDownPicker
          open={open}
          value={category}
          items={categories}
          setOpen={setOpen}
          setValue={setCategory}
          placeholder="Select Category"
          containerStyle={{ marginBottom: 10 }}
          style={{ backgroundColor: "#f3f4f6" }} // Gray Background
        />
      </View>

      {/* Check if there are documents */}
      {loading ? (
        <Text className="text-center text-gray-500">Loading...</Text>
      ) : filteredDocuments.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-semibold text-gray-700">No Documents Found.</Text>
          <Text className="text-gray-500 mb-4">Adding a medical record for pets</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddDocument", { petID })}
            className="px-4 py-2 bg-blue-500 rounded-lg"
          >
            <Text className="text-white font-semibold">Create First Entry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredDocuments}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <TouchableOpacity 
              className="m-2 bg-white rounded-lg shadow p-2" 
              onPress={() => console.log(`Open ${item.name}`)}
            >
              <Image 
                source={{ uri: item.imageUrl }} 
                className="w-40 h-40 rounded-md" 
                onError={(e) => console.log("Error loading image:", e.nativeEvent.error)}
              />
              <Text className="text-center mt-2">{item.name || "No Name"}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default HealthDetailsScreen;
