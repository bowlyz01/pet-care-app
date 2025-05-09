import { View, Text, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { themeColors } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import BackButton from '../components/BackButton';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firestore = getFirestore();

export default function SignUpScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    // ตรวจสอบ username
    if (username.length < 6 || username.length > 30) {
      Alert.alert('Sign Up', 'Username must be between 6 and 30 characters');
      return;
    }

    // ตรวจสอบ email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Sign Up', 'Please enter a valid email address');
      return;
    }

    // ตรวจสอบ password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,64}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert('Sign Up', 'Password must be between 8 and 64 characters, include a mix of uppercase, lowercase, numbers, and special characters');
      return;
    }

    // ตรวจสอบว่าไม่มีช่องว่าง
    if (!email || !password || !username) {
      Alert.alert('Sign Up', 'Please fill in all fields');
      return;
    }

    try {
      console.log('Starting sign-up process...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User created successfully: ', user.uid);
      console.log(auth.currentUser);

      // เพิ่มข้อมูลลง Firestore พร้อมค่าเริ่มต้น
      await setDoc(doc(firestore, 'users', user.uid), {
        username: username,
        email: user.email,
        name: null,      // เพิ่ม name ให้เป็นค่า null
        phone: null,
        altPhone: null,
        profileImage: null,
        createdAt: new Date().toISOString(),
        pets: []
      });

      console.log('User data added to Firestore!');
      Alert.alert('Sign Up', 'User registered successfully!');
      navigation.navigate('Home');
    } catch (err) {
      console.log('Got error: ', err.message);
      let msg = err.message;
      if (msg.includes('auth/email-already-in-use')) msg = 'Email already in use';
      if (msg.includes('auth/invalid-email')) msg = 'Please use a valid email';
      Alert.alert('Sign Up', msg);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ backgroundColor: themeColors.bg }}>
      <SafeAreaView className="flex">
        <View className="flex-row justify-start">
          <BackButton />
        </View>
        <View className="flex-row justify-center">
          <Image source={require('../assets/images/signup.png')} style={{ width: 165, height: 110 }} />
        </View>
      </SafeAreaView>
      <View className="flex-1 bg-white px-8 pt-8" style={{ borderTopLeftRadius: 50, borderTopRightRadius: 50 }}>
        <View className="form space-y-2">
          <Text className="text-gray-700 ml-4">Username</Text>
          <TextInput
            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
            value={username}
            onChangeText={(value) => setUsername(value)}
            placeholder="Enter Username"
          />
          <Text className="text-gray-700 ml-4">Email Address</Text>
          <TextInput
            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
            value={email}
            onChangeText={(value) => setEmail(value)}
            placeholder="Enter Email"
          />
          <Text className="text-gray-700 ml-4">Password</Text>
          <TextInput
            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-7"
            secureTextEntry
            value={password}
            onChangeText={(value) => setPassword(value)}
            placeholder="Enter Password"
          />
          <TouchableOpacity className="py-3 bg-yellow-400 rounded-xl" onPress={handleSubmit}>
            <Text className="text-xl font-bold text-center text-gray-700">Sign Up</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-center mt-7">
          <Text className="text-gray-500 font-semibold">Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="font-semibold text-yellow-500"> Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
