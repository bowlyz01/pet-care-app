import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Table, Row, Rows } from 'react-native-table-component';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import dayjs from 'dayjs';
import DropDownPicker from 'react-native-dropdown-picker';
import BackButton from '../../components/BackButton';
import HeartScoreUI from '../../components/HeartScoreUI';
import PetLittleCard from '../../components/PetLittleCard';

export default function PetDailyPointsDetails() {
  const route = useRoute();
  const { petID } = route.params;
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ กำหนด Header และ Column Widths
  const tableHead = ["Activity Type", "Date", "Start Time", "End Time", "Heart Score"];
  const columnWidths = [120, 100, 100, 100, 100];

  // State สำหรับ Dropdown
  const [open, setOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [items, setItems] = useState([
    { label: 'All', value: 'All' },
    { label: 'Walking', value: 'Walking' },
    { label: 'Feeding', value: 'Feeding' },
    { label: 'Training', value: 'Training' },
    { label: 'Playing', value: 'Playing' },
    { label: 'Other', value: 'Other' },
  ]);

  const getHeartScoreMessage = (score) => {
    if (score >= 80) return '✅ Excellent Care – Well-balanced pet care, including exercise, nutrition, and training.';
    if (score >= 60) return '👍 Good Care – Overall care is good, but you can add more activities.';
    if (score >= 40) return '🔹 Needs More Attention – Consider adding activities like exercise or playtime.';
    if (score >= 20) return '⚠️ Needs Improvement – Lacking key activities like walking or training. Try to balance care.';
    return '🚨 Insufficient Care – Not enough pet care, which may impact health and behavior.';
  };

  const auth = getAuth();
  const user = auth.currentUser;

  const getTotalHeartScore = () => {
    return filteredActivities.reduce((sum, act) => sum + act.heartScore, 0);
  };

  useEffect(() => {
    if (user && petID) {
      fetchActivities();
    }
  }, [user, petID]);

  useEffect(() => {
    applyFilter(selectedFilter);
  }, [activities, selectedFilter]);

  useEffect(() => {
    updateTableData();
  }, [filteredActivities, currentPage, sortColumn, sortOrder]);

  const fetchActivities = async () => {
    try {
      const today = dayjs().format("YYYY-MM-DD");
      const q = query(
        collection(db, "activities"),
        where("userId", "==", user.uid),
        where("petID", "==", petID),
        where("date", "==", today),
        where("status", "==", "Finished")
      );

      const querySnapshot = await getDocs(q);
      let activitiesList = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        activitiesList.push({
          id: doc.id,
          ...data,
          heartScore: Number(data.heartScore) || 0,
        });
      });

      setActivities(activitiesList);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const applyFilter = (filter) => {
    let filtered = filter === 'All' ? activities : activities.filter(act => act.activityType === filter);
    setFilteredActivities(filtered);
    setCurrentPage(1);
  };

  const updateTableData = () => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const paginatedData = filteredActivities.slice(startIdx, endIdx);

    setTableData(paginatedData.map(act => [act.activityType, act.date, act.startTime, act.endTime, act.heartScore]));
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <View className="flex-row justify-between">
        <View>
          <BackButton />
        </View>
        
        <PetLittleCard petID={petID} />
      </View>

      <View className="mb-6 p-4">
        <Text className="text-xl font-bold text-gray-700">Measure</Text>
        <Text className="text-xl text-gray-700">Heart Score Summary ❤️</Text>
        <Text className="text-md text-gray-600">{getHeartScoreMessage(getTotalHeartScore())}</Text>
        <HeartScoreUI score={getTotalHeartScore()} />
      </View>

      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold">Today's Activities</Text>
        <View style={{ width: 150 }}>
          <DropDownPicker
            open={open}
            value={selectedFilter}
            items={items}
            setOpen={setOpen}
            setValue={setSelectedFilter}
            setItems={setItems}
            containerStyle={{ height: 40 }}
            style={{ backgroundColor: '#fafafa' }}
            dropDownStyle={{ backgroundColor: '#fafafa' }}
          />
        </View>
      </View>

      <ScrollView horizontal>
        <View>
          {/* ✅ Table Header */}
          <Table borderStyle={{ borderWidth: 1, borderColor: "#C1C0B9" }}>
            <Row
              data={tableHead}
              widthArr={columnWidths}
              style={{ height: 50, backgroundColor: "#f1f8ff" }}
              textStyle={{ margin: 6, fontWeight: "bold", textAlign: "center" }}
            />
          </Table>

          {/* ✅ Table Body */}
          <ScrollView style={{ maxHeight: 300 }}> 
            <Table borderStyle={{ borderWidth: 1, borderColor: "#C1C0B9" }}>
              <Rows
                data={tableData}
                widthArr={columnWidths}
                textStyle={{ margin: 6, textAlign: "center" }}
              />
            </Table>
          </ScrollView>
        </View>
      </ScrollView>

      {/* ✅ Pagination Controls */}
      <View className="flex-row justify-center mt-4">
        <TouchableOpacity 
          onPress={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : currentPage)} 
          className="px-4 py-2 bg-gray-300 rounded mx-2"
        >
          <Text>Previous</Text>
        </TouchableOpacity>

        <Text className="text-lg">{currentPage}</Text>

        <TouchableOpacity 
          onPress={() => setCurrentPage(currentPage < Math.ceil(filteredActivities.length / itemsPerPage) ? currentPage + 1 : currentPage)} 
          className="px-4 py-2 bg-gray-300 rounded mx-2"
        >
          <Text>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
