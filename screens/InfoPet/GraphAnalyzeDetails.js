import { View, Text, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/BackButton';
import PetLittleCard from '../../components/PetLittleCard';
import { BarChart, PieChart, LineChart } from 'react-native-chart-kit';
import { getFirestore, collection, addDoc, updateDoc, arrayUnion, doc,query, where, getDocs, orderBy, deleteDoc  } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getAuth } from 'firebase/auth';
import moment from 'moment';

const screenWidth = Dimensions.get("window").width;

const sanitizeData = (data) => {
  if (!data || !data.datasets || !Array.isArray(data.datasets)) {
    return { labels: [], datasets: [{ data: [] }] };
  }

  return {
    labels: data.labels || [],
    datasets: [
      {
        data: data.datasets[0].data.map((val) => 
          isNaN(val) || val === null || val === undefined || !isFinite(val) ? 0 : val
        ),
      },
    ],
  };
};





const getYAxisMax = (selectedTab) => {
  switch (selectedTab) {
    case "Weekly": return { max: 700, interval: 100 };
    case "Monthly": return { max: 3000, interval: 500 };
    case "Yearly": return { max: 36500, interval: 5000 };
    default: return { max: 700, interval: 100 }; 
  }
};


const getWeeklyHeartScore = async (petID) => {
  try {
    const today = moment();
    const targetMonth = today.month(); // เดือนปัจจุบัน (0-11)
    const targetYear = today.year(); // ปีปัจจุบัน

    const startOfMonth = moment().year(targetYear).month(targetMonth).startOf("month"); // วันที่ 1 ของเดือน
    const endOfMonth = moment().year(targetYear).month(targetMonth).endOf("month"); // วันสุดท้ายของเดือน

    const q = query(
      collection(db, "activities"),
      where("petID", "==", petID),
      where("status", "==", "Finished")
    );

    const querySnapshot = await getDocs(q);
    const weeklyData = [0, 0, 0, 0]; // เตรียม array สำหรับ 4 สัปดาห์

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      if (!data.date) return;

      let activityDate = data.date.toDate
        ? moment(data.date.toDate()) // ถ้าเป็น Firestore Timestamp แปลงเป็น moment()
        : moment(data.date, "YYYY-MM-DD"); // ถ้าเป็น string format YYYY-MM-DD

      // ตรวจสอบว่าอยู่ในเดือน-ปีปัจจุบันหรือไม่
      if (activityDate.month() === targetMonth && activityDate.year() === targetYear) {
        const dayOfMonth = activityDate.date(); // วันที่ของเดือน (1-31)
        const weekIndex = Math.floor((dayOfMonth - 1) / 7); // แบ่งเป็น 4 สัปดาห์

        if (weekIndex >= 0 && weekIndex < 4) {
          const heartScoreNum = Number(data.heartScore);
          if (!isNaN(heartScoreNum)) {
            weeklyData[weekIndex] += heartScoreNum;
          }
          console.log(`✅ Activity Date: ${activityDate.format("YYYY-MM-DD")} => Week: ${weekIndex + 1}`);
        }
      }
    });

    console.log("✅ Fetched Heart Score Data:", {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [{ data: weeklyData }],
    });
    console.log("✅ Data Values:", weeklyData);

    return {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [{ data: weeklyData }],
    };
  } catch (error) {
    console.error("❌ Error fetching weekly heart scores:", error);
    return { labels: [], datasets: [{ data: [] }] };
  }
};


const getMonthlyHeartScore = async (petID) => {
  try {
    const today = moment();
    const targetYear = today.year(); // ปีปัจจุบัน

    const q = query(
      collection(db, "activities"),
      where("petID", "==", petID),
      where("status", "==", "Finished")
    );

    const querySnapshot = await getDocs(q);
    const monthlyData = Array(12).fill(0); // เตรียม array สำหรับ 12 เดือน

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      if (!data.date) return;

      let activityDate = data.date.toDate
        ? moment(data.date.toDate()) // ถ้าเป็น Firestore Timestamp แปลงเป็น moment()
        : moment(data.date, "YYYY-MM-DD"); // ถ้าเป็น string format YYYY-MM-DD

      // ตรวจสอบว่าอยู่ในปีปัจจุบันหรือไม่
      if (activityDate.year() === targetYear) {
        const monthIndex = activityDate.month(); // ดึงค่าดัชนีเดือน (0-11)

        const heartScoreNum = Number(data.heartScore);
        if (!isNaN(heartScoreNum)) {
          monthlyData[monthIndex] += heartScoreNum;
        }
        console.log(`✅ Activity Date: ${activityDate.format("YYYY-MM-DD")} => Month: ${monthIndex + 1}`);
      }
    });

    console.log("✅ Fetched Heart Score Data:", {
      labels: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ],
      datasets: [{ data: monthlyData }],
    });
    console.log("✅ Data Values:", monthlyData);

    return {
      labels: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ],
      datasets: [{ data: monthlyData }],
    };
  } catch (error) {
    console.error("❌ Error fetching monthly heart scores:", error);
    return { labels: [], datasets: [{ data: [] }] };
  }
};

const getYearlyHeartScore = async (petID) => {
  try {
    const today = moment();
    const currentYear = today.year(); // ปีปัจจุบัน
    const startYear = currentYear - 4; // ย้อนหลัง 4 ปี

    const yearlyData = {};
    for (let year = startYear; year <= currentYear; year++) {
      yearlyData[year] = 0;
    }

    const q = query(
      collection(db, "activities"),
      where("petID", "==", petID),
      where("status", "==", "Finished")
    );

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      if (!data.date) return;

      let activityDate = data.date.toDate
        ? moment(data.date.toDate()) // ถ้าเป็น Firestore Timestamp แปลงเป็น moment()
        : moment(data.date, "YYYY-MM-DD"); // ถ้าเป็น string format YYYY-MM-DD

      const activityYear = activityDate.year();

      // ตรวจสอบว่าปีนั้นอยู่ในช่วง 4 ปีที่เราต้องการ
      if (activityYear >= startYear && activityYear <= currentYear) {
        const heartScoreNum = Number(data.heartScore);
        if (!isNaN(heartScoreNum)) {
          yearlyData[activityYear] += heartScoreNum;
        }
        console.log(`✅ Activity Date: ${activityDate.format("YYYY-MM-DD")} => Year: ${activityYear}`);
      }
    });

    console.log("✅ Fetched Heart Score Data:", {
      labels: Object.keys(yearlyData),
      datasets: [{ data: Object.values(yearlyData) }],
    });
    console.log("✅ Data Values:", Object.values(yearlyData));

    return {
      labels: Object.keys(yearlyData),
      datasets: [{ data: Object.values(yearlyData) }],
    };
  } catch (error) {
    console.error("❌ Error fetching yearly heart scores:", error);
    return { labels: [], datasets: [{ data: [] }] };
  }
};

const getUserStateDistribution = async (petID, selectedTab) => {
  try {
    const today = moment();
    let startDate, endDate;

    if (selectedTab === "Weekly" || selectedTab === "Monthly") {
      startDate = moment().startOf("month"); // เริ่มต้นเดือนปัจจุบัน
      endDate = moment().endOf("month"); // สิ้นสุดเดือนปัจจุบัน
    } else if (selectedTab === "Yearly") {
      startDate = moment().startOf("year"); // เริ่มต้นปีปัจจุบัน
      endDate = moment().endOf("year"); // สิ้นสุดปีปัจจุบัน
    }

    // ✅ ดึงเฉพาะ petID และ status (ไม่ใช้ date filter)
    const q = query(
      collection(db, "activities"),
      where("petID", "==", petID)
    );

    const querySnapshot = await getDocs(q);
    const statusCount = {
      Created: 0,
      Pending: 0,
      Active: 0,
      Finished: 0,
      Expired: 0,
    };

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      if (!data.date || !data.status) return;

      let activityDate = data.date.toDate
        ? moment(data.date.toDate()) // ถ้าเป็น Firestore Timestamp
        : moment(data.date, "YYYY-MM-DD"); // ถ้าเป็น string format YYYY-MM-DD

      // ✅ กรองข้อมูลตาม startDate และ endDate
      if (activityDate.isBetween(startDate, endDate, null, "[]")) {
        if (statusCount.hasOwnProperty(data.status)) {
          statusCount[data.status] += 1;
        }
      }
    });

    console.log("✅ User State Data:", statusCount);

    return Object.keys(statusCount).map((status) => ({
      name: status,
      population: statusCount[status],
      color: getStatusColor(status),
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    }));
  } catch (error) {
    console.error("❌ Error fetching user state distribution:", error);
    return [];
  }
};

// ฟังก์ชันกำหนดสีของสถานะต่าง ๆ
const getStatusColor = (status) => {
  const colors = {
    Created: "#009EFF",
    Pending: "#FFC107",
    Active: "#4CAF50",
    Finished: "#FF5722",
    Expired: "#9C27B0",
  };
  return colors[status] || "#CCCCCC";
};

const getWeightData = async (petID) => {
  try {
    const q = query(collection(db, "weights"), where("petID", "==", petID));
    const querySnapshot = await getDocs(q);

    const weightByYear = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.weight || !data.date) return;

      const weightDate = data.date.toDate
        ? moment(data.date.toDate())
        : moment(data.date, "YYYY-MM-DD");

      const year = weightDate.format("YYYY");

      if (!weightByYear[year]) {
        weightByYear[year] = { totalWeight: 0, count: 0 };
      }
      weightByYear[year].totalWeight += data.weight;
      weightByYear[year].count += 1;
    });

    let labels = Object.keys(weightByYear).sort();

    // ✅ ถ้าไม่มีข้อมูลเลย ให้ใช้ปีปัจจุบัน และกำหนดน้ำหนักเป็น 0
    if (labels.length === 0) {
      const currentYear = moment().format("YYYY");
      console.warn(`⚠️ No weight data found for petID: ${petID}`);
      return { labels: [currentYear], datasets: [{ data: [0] }] };
    }

    // ✅ ตรวจสอบช่วงปีต่อเนื่อง และเติม 0 ถ้าปีไหนไม่มีข้อมูล
    const minYear = Math.min(...labels.map(Number));
    const maxYear = Math.max(...labels.map(Number));
    labels = Array.from({ length: maxYear - minYear + 1 }, (_, i) =>
      (minYear + i).toString()
    );

    const data = labels.map((year) =>
      weightByYear[year]
        ? (weightByYear[year].totalWeight / weightByYear[year].count).toFixed(2)
        : "0"
    );

    const weightData = {
      labels,
      datasets: [{ data: data.map(Number) }],
    };

    console.log("✅ Weight Data:", weightData);
    return weightData;
  } catch (error) {
    console.error("❌ Error fetching weight data:", error);
    return { labels: [], datasets: [{ data: [] }] };
  }
};


const GraphDetailsScreen = () => {
  const route = useRoute();
  const { label, value,petID } = route.params; // ดึง label และ value จาก params
  const [selectedTab, setSelectedTab] = useState("Weekly"); 
  const [heartScoreData, setHeartScoreData] = useState({ labels: [], datasets: [{ data: [] }] });
  const [userStateData, setUserStateData] = useState([]);
  const [weightData, setWeightData] = useState({ labels: [], datasets: [{ data: [] }] });

  useEffect(() => {
    const fetchData = async () => {
      let data;
      if (selectedTab === "Weekly") {
        data = await getWeeklyHeartScore(petID);
      } else if (selectedTab === "Monthly") {
        data = await getMonthlyHeartScore(petID);
      } else if (selectedTab === "Yearly") {
        data = await getYearlyHeartScore(petID);
      }
  
      console.log("✅ Fetched Heart Score Data:", data);
      setHeartScoreData(sanitizeData(data));
  
      const stateData = await getUserStateDistribution(petID, selectedTab);
      setUserStateData(stateData.map((item) => ({
        ...item,
        population: isNaN(item.population) || item.population === null ? 0 : item.population
      })));
  
      const weightData = await getWeightData(petID);
      setWeightData(sanitizeData(weightData));
    };
  
    fetchData();
  }, [selectedTab, petID]);
  
  
  


  // // ✅ ข้อมูล Line Chart (Animal Weight Over Years)
  // const weightData = {
  //   labels: ["2020", "2021", "2022", "2023", "2024"],
  //   datasets: [{ data: [5, 10, 15, 20, 25] }]
  // };


  return (
    <SafeAreaView className="flex-1 bg-white p-4">
    <View className="flex-row justify-between items-center">
      <BackButton />
      <PetLittleCard petID={petID} />
    </View>
    
    {/* Title */}
    <View className="items-center mb-4">
        <Text className="text-xl font-bold text-gray-700">Dashboard</Text>
    </View>

    {/* ✅ Tab Switcher */}
    <View className="flex-row justify-center mb-4">
        {["Weekly", "Monthly", "Yearly"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            className={`px-4 py-2 mx-2 rounded ${selectedTab === tab ? "bg-blue-500" : "bg-gray-300"}`}
          >
            <Text className={selectedTab === tab ? "text-white font-bold" : "text-gray-700"}>{tab}</Text>
          </TouchableOpacity>
        ))}
    </View>

    <ScrollView>
        {/* ✅ Bar Chart */}
        <Text className="text-lg font-semibold text-gray-700">Heart Score</Text>
        <BarChart
          data={heartScoreData}
          width={screenWidth - 20}
          height={220}
          yAxisSuffix=" pts"
          fromZero={true}
          yAxisMax={getYAxisMax(selectedTab).max}
          yAxisInterval={getYAxisMax(selectedTab).interval}
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          style={{ marginVertical: 8, borderRadius: 16 }}
        />

        {/* ✅ Pie Chart */}
        <Text className="text-lg font-semibold text-gray-700 mt-4">User State Distribution</Text>
        <PieChart
          data={userStateData}
          width={screenWidth - 20}
          height={220}
          chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />


        {/* ✅ Line Chart */}
        <Text className="text-lg font-semibold text-gray-700 mt-4">Animal Weight Over Years</Text>
        <LineChart
          data={weightData}
          width={screenWidth - 20}
          height={220}
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
    </ScrollView>

    </SafeAreaView>
  );
};

export default GraphDetailsScreen;

// ฉันมี ตารางที่มีเก็บ activities ทั้งหมด โดยใน bar chart(heart score) ให้ดึงคะแนน ที่มี status 'Finished' โดยให้ดึงวันที่มาจัดว่าเป็น week ไหนและแบบ เดือนปี
// ส่วน Pie Chart ให้ดึงตาม status  ที่มี

// ส่วน Line Chart จะดึงจาก weights