import { View, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/BackButton';

const RemindersDetailsScreen = () => {
  const route = useRoute();
  const { label, value } = route.params; // ดึง label และ value จาก params

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
    <View className="flex-row justify-start">
      <BackButton />
    </View>
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-4">{label} Details</Text>
      <Text className="text-lg text-gray-700">Value: {value}</Text>
      <Text className="text-lg text-gray-700">Additional details about {label} can go here.</Text>
    </View>
    </SafeAreaView>
  );
};

export default RemindersDetailsScreen;
