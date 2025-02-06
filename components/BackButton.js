import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const BackButton = () => {
  const navigation = useNavigation();
  

  return (
    <TouchableOpacity 
                onPress={()=> navigation.goBack()}
                className="bg-yellow-400 p-2 rounded-tr-2xl rounded-bl-2xl ml-4"
            >
                <FontAwesome name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
  );
};

export default BackButton;
