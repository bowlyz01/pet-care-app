import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Modal } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/BackButton';
import { AntDesign } from '@expo/vector-icons';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, storage } from '../../config/firebase';
import { getDownloadURL, ref } from "firebase/storage";
import DropDownPicker from "react-native-dropdown-picker";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import EditMenuModal from '../../components/EditMenuModal';
import { doc, deleteDoc,updateDoc  } from "firebase/firestore";

const categories = [
  { label: "All", value: "All" },
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
  const [category, setCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // State สำหรับ Modal และ documentId ที่เลือก
const [isModalVisible, setModalVisibleB] = useState(false);
const [selectedDocumentId, setSelectedDocumentId] = useState(null);
const [createdAt, setCreatedAt] = useState(null);
const [selectedDocumentName, setSelectedDocumentName] = useState(null);
const [selectedDocumentNote, setSelectedDocumentNote] = useState(null);


  
// ฟังก์ชันเปิด Modal พร้อมกับตั้งค่า documentId
const openEditMenu = (docId) => {
  const doc = documents.find((document) => document.id === docId); // หาข้อมูลเอกสารที่เลือก
  setSelectedDocumentId(docId);
  const createdAtDate = doc?.createdAt?.toDate(); // ใช้ .toDate() แปลง Timestamp เป็น Date object
  setCreatedAt(createdAtDate);
  setSelectedDocumentName(doc?.name || "Untitled");
  setSelectedDocumentNote(doc?.notes || "No notes available");  
  setModalVisibleB(true); // เปิด Modal
};



// ฟังก์ชันเปิดหน้าแก้ไขเอกสาร
const handleEdit = () => {
  navigation.navigate("EditDocument", {
      documentId: selectedDocumentId,
      documentName: selectedDocumentName,
      documentNote: selectedDocumentNote,
      createdAt: createdAt
  });
  setModalVisibleB(false); // ปิด modal หลังจากเปลี่ยนหน้า
};



// ฟังก์ชันลบเอกสาร
const handleDelete = async (docId) => {
  try {
    await deleteDoc(doc(db, "documents", docId)); // ลบเอกสารจาก Firestore
    console.log("Document deleted:", docId);
    
    // อัปเดต state เพื่อลบเอกสารออกจาก UI
    setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== docId));
    
  } catch (error) {
    console.error("Error deleting document:", error);
  } finally {
    setModalVisibleB(false); // ปิด Modal
  }
};


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
    <GestureHandlerRootView style={{ flex: 1 }}>
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

          <View className="items-center mb-4">
            <Text className="text-xl font-bold text-gray-700">Document</Text>
          </View>

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
              style={{ backgroundColor: "#f3f4f6" }}
            />
          </View>

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
              data={documents}
              keyExtractor={(item) => item.id}
              numColumns={2}
              renderItem={({ item }) => (
                <View className="m-2 bg-white rounded-lg shadow p-2">
                  <TouchableOpacity onPress={() => { setSelectedImage(item.imageUrl); setModalVisible(true); }}>
                    <Image source={{ uri: item.imageUrl }} className="w-40 h-40 rounded-md" />
                  </TouchableOpacity>
                  <Text className="text-center mt-2">{String(item.name ?? "Unnamed Document")}</Text>
                  {/* ปุ่มเปิดเมนูแก้ไข */}
                  <TouchableOpacity className="absolute top-4 right-4" onPress={() => openEditMenu(item.id)}>
                    <AntDesign name="ellipsis1" size={24} color="black" backgroundColor="white"  />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}

          <Modal
            visible={modalVisible}
            transparent={false} // ให้ Modal เต็มหน้าจอ
            animationType="fade" // ให้มีเอฟเฟกต์เวลาเปิด
            presentationStyle="fullScreen" // ทำให้ Modal เต็มหน้าจอจริง ๆ
          >
            <View className="flex-1 bg-black justify-center items-center">
              <Image source={{ uri: selectedImage }} className="w-full h-full" resizeMode="contain" />
              <TouchableOpacity className="absolute top-10 right-5" onPress={() => setModalVisible(false)}>
                <AntDesign name="close" size={30} color="white" />
              </TouchableOpacity>
            </View>
          </Modal>


          {/*  ใช้ EditMenuModal */}
          <EditMenuModal
            visible={isModalVisible}
            onClose={() => setModalVisibleB(false)}
            documentId={selectedDocumentId}
            documentName={selectedDocumentName} // ส่งชื่อเอกสาร
            documentNote={selectedDocumentNote} // ส่ง Note
            createdAt={createdAt} // ส่ง createdAt
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default HealthDetailsScreen;
