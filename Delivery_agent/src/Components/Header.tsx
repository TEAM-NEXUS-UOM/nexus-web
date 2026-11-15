import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, View } from 'react-native';

const Header = () => {
  const today = new Date();

const hour = today.getHours();

let greeting;

if (hour < 12) {
  greeting = "Good Morning";
} else if (hour < 17) {
  greeting = "Good Afternoon";
} else {
  greeting = "Good Evening";
}
  return (
    <View className='flex-row justify-between items-center mt-2 mb-4'>
      <View>
      <Text className='font-Poppins-Light font-bold text-md'>
         {greeting}
        </Text>
        <Text className='font-Poppins-Regular font-bold text-2xl'>
          Hello Eranjana
        </Text>
      </View>
      <View className="w-12 h-12 bg-[#1F41BB] rounded-full items-center justify-center">
        <MaterialIcons name="person-outline" size={24} color="white" />
      </View>

    </View>
  )
}

export default Header