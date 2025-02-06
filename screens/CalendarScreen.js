import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { auth } from '../config/firebase'
import { useNavigation } from '@react-navigation/native'
import BackButton from '../components/BackButton'


export default function CalendarScreen() {
  const navigation = useNavigation();
  return (
  <SafeAreaView className="flex">
    <View className="flex-row justify-start">
      <BackButton />
    </View>
    <View className="flex-row justify-center items-center">
      <Text className="text-lg">Calendar Page</Text>
    </View>
  </SafeAreaView>

  )
}