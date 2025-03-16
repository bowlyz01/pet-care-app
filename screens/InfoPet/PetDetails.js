import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/BackButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getAuth } from 'firebase/auth';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
import Foundation from '@expo/vector-icons/Foundation';
import { Platform } from 'react-native';



const petList = {
    "🐶": ["Golden Retriever", "Poodle", "Bulldog", "Beagle", "Shiba Inu"],
    "🐱": ["Persian", "Siamese", "Maine Coon", "Bengal", "Ragdoll"],
    "🐰": ["Netherland Dwarf", "Lionhead", "Lop", "Angora", "Rex"],
    "🐹": ["Syrian", "Dwarf", "Chinese", "Roborovski", "Campbell"],
    "🐦": ["Parrot", "Canary", "Cockatiel", "Budgerigar", "Finch"],
};

const PetDetailsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { petID } = route.params;

    const auth = getAuth();
    const currentUser = auth.currentUser;

    // State variables
    const [petBreed, setPetBreed] = useState(null);
    const [breedingOptions, setBreedingOptions] = useState([]);
    const [customBreed, setCustomBreed] = useState("");
    const [petName, setPetName] = useState("");
    const [petSex, setPetSex] = useState("male");
    const [petBirthdate, setPetBirthdate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(false);

    useEffect(() => {
        const fetchPetDetails = async () => {
            try {
                const petRef = doc(db, "pets", petID);
                const petSnap = await getDoc(petRef);

                if (petSnap.exists()) {
                    const petData = petSnap.data();
                    setPetName(petData.name || "");
                    setPetSex(petData.gender || "male");
                    setPetBirthdate(petData.birthdate ? new Date(petData.birthdate) : new Date());
                    setPetBreed(petData.breeding);
                    console.log(petData);
                    console.log(petBreed);

                    if (petData.avatar && petData.avatar in petList) {
                        setBreedingOptions(petList[petData.avatar]);
                    }
                } else {
                    Alert.alert("Error", "Pet not found!");
                    navigation.goBack();
                }
            } catch (error) {
                console.error("Error fetching pet details:", error);
                Alert.alert("Error", "Failed to load pet details.");
            }
        };

        fetchPetDetails();
    }, [petID]);

    const formatDate = (date) => dayjs(date).format("YYYY-MM-DD");

    const validateInputs = () => {
        if (!petName.trim()) {
            alert("Please enter the pet's name.");
            return false;
        }
        if (!petBreed && !customBreed.trim()) {
            alert("Please select or enter the breed.");
            return false;
        }
        return true;
    };

    const handleDisablePet = async () => {
        try {
            const petRef = doc(db, "pets", petID);
            await updateDoc(petRef, { status: "disabled" });

            Alert.alert("Success", "Pet has been disabled.");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Error", "Failed to disable pet.");
            console.error(error);
        }
    };

    const handleSave = async () => {
        if (!validateInputs()) return;

        try {
            const petRef = doc(db, "pets", petID);
            await updateDoc(petRef, {
                name: petName,
                breed: petBreed || customBreed,
                birthdate: formatDate(petBirthdate),
                gender: petSex,
            });

            Alert.alert("Success", "Pet details updated successfully!");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Error", "Failed to update pet details.");
            console.error(error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white p-4">
            <View className="flex-row justify-between items-center">
                <BackButton />
            </View>

            <View className="items-center mb-4">
                <Text className="text-xl font-bold text-gray-700">Pet Detail</Text>
            </View>

            <Text className="text-lg font-semibold text-gray-700">Pet Name</Text>
            <TextInput
                className="border border-gray-300 p-3 rounded-xl mb-4"
                placeholder="Enter pet name"
                value={petName}
                onChangeText={setPetName}
            />

            <Text className="text-lg font-semibold text-gray-700">Breed</Text>
            <DropDownPicker
                open={openDropdown}
                value={petBreed}
                items={[...breedingOptions.map((breed) => ({ label: breed, value: breed })), { label: "Other", value: "Other" }]} // 👈 เพิ่ม "Other"
                setOpen={setOpenDropdown}
                setValue={setPetBreed}
                placeholder="Select breed"
                style={{ borderRadius: 15, marginBottom: 15 }}
                dropDownContainerStyle={{ zIndex: 1000 }}
                listMode="SCROLLVIEW"
            />

            {petBreed === "Other" && (
                <View className="mb-4">
                    <Text className="text-lg font-semibold text-gray-700">Enter Custom Breed</Text>
                    <TextInput
                        className="border border-gray-300 p-3 rounded-xl"
                        placeholder="Enter breed"
                        value={customBreed}
                        onChangeText={setCustomBreed}
                    />
                </View>
            )}


            <Text className="text-lg font-semibold text-gray-700">Birthdate</Text>
            <TouchableOpacity
                className="border border-gray-300 p-3 rounded-xl mb-4"
                onPress={() => setShowPicker(true)}
            >
                <Text>{formatDate(petBirthdate)}</Text>
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={petBirthdate}
                    mode="date"
                    display="default"
                    maximumDate={new Date()} // ป้องกันการเลือกวันในอนาคต
                    onChange={(event, date) => {
                    if (date) setPetBirthdate(date);
                    if (Platform.OS === 'android') setShowPicker(false); // ปิด Picker อัตโนมัติบน Android
                    }}
                />
                )}

            <Text className="text-lg font-semibold text-gray-700">Gender</Text>
            <View className="flex-row justify-between mb-6">
                <TouchableOpacity
                    className={`flex-row items-center px-4 py-2 rounded-xl border ${petSex === "male" ? "bg-blue-400 border-blue-600" : "bg-gray-100 border-gray-300"}`}
                    onPress={() => setPetSex("male")}
                >
                    <Foundation name="male-symbol" size={20} color="black" />
                    <Text className="text-lg">Male</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className={`flex-row items-center px-4 py-2 rounded-xl border ${petSex === "female" ? "bg-pink-400 border-pink-600" : "bg-gray-100 border-gray-300"}`}
                    onPress={() => setPetSex("female")}
                >
                    <Foundation name="female-symbol" size={20} color="black" />
                    <Text className="text-lg">Female</Text>
                </TouchableOpacity>
            </View>

            <View className="flex-row justify-between">
                <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-xl" onPress={handleSave}>
                    <Text className="text-white font-semibold">Save</Text>
                </TouchableOpacity>

                <TouchableOpacity className="bg-red-500 px-6 py-3 rounded-xl" onPress={handleDisablePet}>
                    <Text className="text-white font-semibold">Remove</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default PetDetailsScreen;
