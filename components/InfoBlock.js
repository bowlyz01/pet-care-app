import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const InfoBlock = ({ label, value, screenName, petID }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate(screenName, { petID,label, value }); // เปลี่ยนหน้าไปยัง screenName พร้อม params
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-yellow-200 w-[32%] aspect-square rounded-xl mb-4 shadow-md items-center justify-center"
    >
      <Text className="text-sm font-medium text-gray-700">{label}</Text>
      <Text className="text-lg font-bold text-gray-900">{value}</Text>
    </TouchableOpacity>
  );
};

export default InfoBlock;
