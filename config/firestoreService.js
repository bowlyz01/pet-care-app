import { db, auth } from "./firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

// เพิ่มสัตว์เลี้ยง
export const savePet = async (petData) => {
  try {
    const userId = auth.currentUser.uid;
    if (!userId) throw new Error("User not logged in");

    const docRef = await addDoc(collection(db, `users/${userId}/pets`), petData);
    console.log("Pet added with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding pet:", error);
    throw error;
  }
};

// ดึงข้อมูลสัตว์เลี้ยงของผู้ใช้
export const fetchUserPets = async () => {
  try {
    const userId = auth.currentUser.uid;
    if (!userId) throw new Error("User not logged in");

    const querySnapshot = await getDocs(collection(db, `users/${userId}/pets`));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching pets:", error);
    throw error;
  }
};

// อัปเดตสัตว์เลี้ยง
export const updatePet = async (petId, updatedData) => {
  try {
    const userId = auth.currentUser.uid;
    if (!userId) throw new Error("User not logged in");

    const petDoc = doc(db, `users/${userId}/pets`, petId);
    await updateDoc(petDoc, updatedData);
    console.log("Pet updated successfully!");
  } catch (error) {
    console.error("Error updating pet:", error);
    throw error;
  }
};

// ลบสัตว์เลี้ยง
export const deletePet = async (petId) => {
  try {
    const userId = auth.currentUser.uid;
    if (!userId) throw new Error("User not logged in");

    const petDoc = doc(db, `users/${userId}/pets`, petId);
    await deleteDoc(petDoc);
    console.log("Pet deleted successfully!");
  } catch (error) {
    console.error("Error deleting pet:", error);
    throw error;
  }
};
