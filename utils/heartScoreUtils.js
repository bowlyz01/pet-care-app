import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import dayjs from "dayjs";

/**
 * ดึงข้อมูลกิจกรรมของสัตว์เลี้ยงและคำนวณ Total Heart Score
 * @param {string} userId - รหัสของผู้ใช้
 * @param {string} petID - รหัสของสัตว์เลี้ยง
 * @returns {Promise<number>} - ผลรวมของ Heart Score วันนี้
 */
export const getTotalHeartScore = async (userId, petID) => {
  try {
    if (!userId || !petID) return 0;

    const today = dayjs().format("YYYY-MM-DD");
    const q = query(
      collection(db, "activities"),
      where("userId", "==", userId),
      where("petID", "==", petID),
      where("date", "==", today),
      where("status", "==", "Finished")
    );

    const querySnapshot = await getDocs(q);
    let totalScore = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalScore += Number(data.heartScore) || 0;
    });

    return totalScore;
  } catch (error) {
    console.error("Error fetching Heart Score:", error);
    return 0;
  }
};
