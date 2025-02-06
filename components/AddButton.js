import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons'; 

const AddButton = () => {
  const navigation = useNavigation();
  

  return (
    <TouchableOpacity
    
      onPress={() => {
        console.log("Navigating to AddPet...");
        navigation.navigate('AddPet');
      }} // เปลี่ยน 'AddPetScreen' เป็นชื่อหน้าที่คุณต้องการนำทางไป
      className="absolute bottom-10 right-10 p-4 bg-yellow-500 rounded-full justify-center items-center shadow-lg"
    >
      <AntDesign name="plus" size={30} color="white" />
    </TouchableOpacity>
  );
};

export default AddButton;
