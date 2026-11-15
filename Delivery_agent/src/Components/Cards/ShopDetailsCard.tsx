import { View, Text,TouchableOpacity,Pressable } from 'react-native'
import React from 'react'
import Feather from '@expo/vector-icons/Feather';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { useRouter } from 'expo-router';
const ShopDetailsCard = () => {
  const router = useRouter()
  return (
    <View className='bg-[#ffffff] rounded-[20px] p-5 mt-4 items-left justify-between border-2 border-[#E3E6EB]'>
          <View className="flex-row justify-between items-center mb-3">
          <View>
          <Text className="font-Poppins-SemiBold text-2xl">ABC Shop</Text>
          <View className='flex-row items-center mt-2'><EvilIcons name="location" size={20} color="black" /> <Text className='font-Poppins-Light text-md'>24/14 , Saman mawatha, Kadawatha </Text>
          </View>
          

          </View>
      
          <Pressable>
  <View className="w-14 h-14 bg-[#F6F7F9] rounded-full items-center justify-center">
    <Feather name="phone-call" size={24} color="black" />
  </View>
</Pressable>
    </View>
          
            
              
              
              
              
              <TouchableOpacity className='bg-[#EAEEFC] my-2 p-4 rounded-[14px]'  onPress={() => {router.push({
        pathname: "/ProductDetails",
        
      });
    
  }} >
                                  <Text className='text-center font-Poppins-Medium text-[#1F33AE]'>View product details</Text>
                                </TouchableOpacity>
      
        </View>

                       
  )
}

export default ShopDetailsCard