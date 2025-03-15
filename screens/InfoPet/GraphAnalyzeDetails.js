import { View, Text, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/BackButton';
import PetLittleCard from '../../components/PetLittleCard';
import { BarChart, PieChart, LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get("window").width;

const GraphDetailsScreen = () => {
  const route = useRoute();
  const { label, value,petID } = route.params; // ดึง label และ value จาก params
  const [selectedTab, setSelectedTab] = useState("Weekly"); 

  // ✅ ข้อมูล Bar Chart (Heart Score รายสัปดาห์)
  const heartScoreData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [{ data: [100, 130, 150, 170] }]
  };

  // ✅ ข้อมูล Pie Chart (User State Distribution)
  const userStateData = [
    { name: "Created", population: 20, color: "#009EFF", legendFontColor: "#7F7F7F", legendFontSize: 12 },
    { name: "Pending", population: 15, color: "#FFC107", legendFontColor: "#7F7F7F", legendFontSize: 12 },
    { name: "Active", population: 30, color: "#4CAF50", legendFontColor: "#7F7F7F", legendFontSize: 12 },
    { name: "Finished", population: 25, color: "#FF5722", legendFontColor: "#7F7F7F", legendFontSize: 12 },
    { name: "Expired", population: 10, color: "#9C27B0", legendFontColor: "#7F7F7F", legendFontSize: 12 },
  ];

  // ✅ ข้อมูล Line Chart (Animal Weight Over Years)
  const weightData = {
    labels: ["2020", "2021", "2022", "2023", "2024"],
    datasets: [{ data: [5, 10, 15, 20, 25] }]
  };


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