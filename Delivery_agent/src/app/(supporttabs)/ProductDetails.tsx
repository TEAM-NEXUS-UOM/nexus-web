import { View, Text, Pressable,TouchableOpacity,FlatList,Image } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Progress from 'react-native-progress';
import { useLocalSearchParams } from 'expo-router';
import ReportIssue from '@/Components/Buttons/ReportIssue';
import DocumentsCard from '@/Components/Cards/DocumentsCard';
import { Images } from '@/assets/assets';

const ProductDetails = () => {
  const router = useRouter();
  const list = [1,2,3,4]
  const [number,setNumber] = useState(0)
const changeCount= (n:number) =>{
    setNumber(prev=>prev + n)

}
  return (
    <SafeAreaView className='flex-1 p-4' edges={['top', 'left', 'right']}>
      <Pressable onPress={() => router.back()}>
      <MaterialIcons name="arrow-back" size={24} color="black" />
      </Pressable>
      <FlatList
              showsVerticalScrollIndicator={false}
        data={list}
        renderItem={({index}) => <View className='flex-row bg-white p-2 my-2 items-center rounded-[10px] justify-between'>
        <View className=''>
        <Image
        source={Images.cracker}
        className='rounded-[10px]'
        style={{ width: 100, height: 50 }}
        
        />
    <Text className='font-Poppins-Light mt-2'>
        Munchee Cream Cracker 100g
    </Text>
        </View>
        <View className='mx-2 flex-row justify-center'>
            <Pressable onPress={()=>changeCount(-1)}>
                <Text className='bg-[#F2F2F7] font-Poppins-Light text-xl p-2 rounded-[5px]'>-1</Text>
            </Pressable>
            <Text className='bg-[#F2F2F7] font-Poppins-Light text-xl px-5 py-2 mx-4 rounded-[5px]'>{number}</Text>
            <Pressable onPress={()=>changeCount(+1)}>
                <Text className='bg-[#F2F2F7] font-Poppins-Light text-xl p-2 rounded-[5px]'>+1</Text>
            </Pressable>
        </View>
    
    </View> }/>
        


    </SafeAreaView>
  )
}

export default ProductDetails