import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Table, Row, Rows } from 'react-native-table-component';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import DropDownPicker from 'react-native-dropdown-picker';
import BackButton from '../components/BackButton';

export default function ActivityOverdueScreen() {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'All', value: 'All' },
    { label: 'Walking', value: 'Walking' },
    { label: 'Feeding', value: 'Feeding' },
    { label: 'Training', value: 'Training' },
    { label: 'Playing', value: 'Playing' },
    { label: 'Other', value: 'Other' },
  ]);

  const tableHead = ["Activity Type", "Date", "Start Time", "End Time"];
  const columnWidths = [120, 100, 100, 100];

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [activities, searchText, selectedFilter]);

  const fetchActivities = async () => {
    try {
      const q = query(
        collection(db, "activities"),
        where("userId", "==", user.uid),
        where("status", "==", "Expired")
      );
      const querySnapshot = await getDocs(q);
      let activitiesList = [];
      querySnapshot.forEach((doc) => {
        activitiesList.push({ id: doc.id, ...doc.data() });
      });
      setActivities(activitiesList);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const applyFilters = () => {
    let filtered = activities;
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(act => act.activityType === selectedFilter);
    }
    if (searchText.trim() !== '') {
      filtered = filtered.filter(act => act.activityType.toLowerCase().includes(searchText.toLowerCase()));
    }
    setFilteredActivities(filtered);
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <View className="flex-row justify-between items-center">
        <BackButton />
        <Text className="text-xl font-bold">Overdue Activities</Text>
      </View>

      {/* Search & Filter */}
      <View className="flex-row justify-between items-center my-4">
        <TextInput
          placeholder="Search Activity..."
          value={searchText}
          onChangeText={setSearchText}
          className="flex-1 border p-2 rounded"
        />
        <View className="w-40 ml-2">
          <DropDownPicker
            open={open}
            value={selectedFilter}
            items={items}
            setOpen={setOpen}
            setValue={setSelectedFilter}
            setItems={setItems}
            containerStyle={{ height: 40 }}
            style={{ backgroundColor: '#fafafa' }}
          />
        </View>
      </View>

      <ScrollView horizontal>
        <View>
          <Table borderStyle={{ borderWidth: 1, borderColor: "#C1C0B9" }}>
            <Row
              data={tableHead}
              widthArr={columnWidths}
              style={{ height: 50, backgroundColor: "#f1f8ff" }}
              textStyle={{ margin: 6, fontWeight: "bold", textAlign: "center" }}
            />
            <Rows
              data={filteredActivities.map(act => [act.activityType, act.date, act.startTime, act.endTime])}
              widthArr={columnWidths}
              textStyle={{ margin: 6, textAlign: "center" }}
            />
          </Table>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
