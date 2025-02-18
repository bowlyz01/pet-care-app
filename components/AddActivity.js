import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons'; 

const AddActivity = ({ selectedDay }) => {
  const navigation = useNavigation();
  
  return (
    <TouchableOpacity
      onPress={() => {
        console.log(`Navigating to AddActivity with selectedDay: ${selectedDay}`);
        navigation.navigate('AddActivity', { selectedDay });
      }} 
      className="bg-yellow-500 rounded-full justify-center items-center shadow-lg p-2"
    >
      <AntDesign name="plus" size={30} color="white" />
    </TouchableOpacity>
  );
};

export default AddActivity;
