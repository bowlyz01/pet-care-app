import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRoute } from '@react-navigation/native';
import BackButton from '../components/BackButton';
export default function AddActivityScreen() {
  const route = useRoute();
  const { selectedDay } = route.params || {};

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-row justify-between items-center p-4">
        <BackButton />
        <Text className="text-lg font-bold">
          Add Activity {selectedDay ? `for ${selectedDay}` : ""}
        </Text>
      </View>
    </SafeAreaView>
  );
}
