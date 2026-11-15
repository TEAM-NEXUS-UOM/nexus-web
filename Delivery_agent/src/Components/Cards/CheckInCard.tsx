import { View, Text,TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const CheckInCard = () => {
  const [isCheckedIn,setCheckIn] = useState<boolean>(false);
  const checkCheckedIn = ()=>{
    setCheckIn(prev=>!prev);
  }
  const today = new Date();

  const formattedDate = today.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return (
    <LinearGradient
        style={{borderRadius:24,marginHorizontal:2}}       
        colors={['#2A44D4', '#2A44D4']}
        >
          <View className='flex-row m-2 p-4 items-center justify-between'>
          <View className='flex-row items-center'>
          <View className="w-12 h-12 bg-white rounded-full items-center justify-center">
              <MaterialIcons name="person-outline" size={24} color="black" />
          </View>
          <View className='mx-5'>
            <Text className='font-Poppins-Bold text-white text-[20px]'>Eranjna Vishwajith</Text>
            <Text className='font-Poppins-Light text-white text-[15px]'>Marketing Agent</Text>
          </View>
          </View>
          <View className='mx-5'>
          <MaterialIcons name="arrow-forward-ios" size={24} color="white" />
          </View>
          
          </View>
          <View className="px-4">
            <View className="h-px w-full bg-white" />
          </View>



          <View className='p-4'>

            <View className='my-2 flex-row items-center'>
            <MaterialIcons name="calendar-today" size={18} color="white" />
            <Text className='font-Poppins-Medium text-white pl-2 text-lg'>{formattedDate}</Text>
            </View>

          <View className=' flex-row justify-between my-2'>
            <View className='flex gap-2'>
              <Text className='font-Poppins-Light text-white pr-2'>Check-In Time</Text>
              <Text className='font-Poppins-Medium text-white text-xl'>09:40</Text>
            </View>
            <View className='flex gap-2'>
              <Text className='font-Poppins-Light text-white pr-2'>Check-Out Time</Text>
              <Text className='font-Poppins-Medium text-white text-xl'>Not yet</Text>
            </View>
          </View>
          <TouchableOpacity className="bg-[white] my-4 p-4 rounded-[14px]" onPress={checkCheckedIn}>
              <Text className={`${isCheckedIn?"text-[#34C759]":"text-[#FF383C]"} text-center text-xl font-Poppins-SemiBold`}>{isCheckedIn?"Check-In":"Check-Out"}</Text>
            </TouchableOpacity>
          </View>
      </LinearGradient>
  )
}

export default CheckInCard