import { View, Text,TouchableOpacity,Pressable,Image } from 'react-native'
import React from 'react'
import { Images } from '@/assets/assets';

const DocumentsCard = () => {
  return (
    <View className='flex-1 bg-white rounded-[10px] p-5 mt-4 items-left justify-between border-2 border-[#E3E6EB]'>
          <View className="flex-row justify-between items-center mb-3">
      <Text className="font-Poppins-Medium text-xl">
        Vehicle Pass
      </Text>
      <Text className="font-Poppins-Medium text-lg text-[grey]">
      Sun, Jul 23
      </Text>

    </View>
    <View className="mb-4">
                <View className="h-px w-full bg-[#696969]" />
    </View>
    <View className="flex-row">

  {/* Left  */}
  <View className="flex-1 w-0 justify-between ">
    <View className="mb-4">
      <Text className="font-Poppins-Light text-lg text-[grey]">
        Scheduled arrival
      </Text>
      <Text className="font-Poppins-bold text-xl">
        10:30 am
      </Text>
    </View>

    <View>
      <Text className="font-Poppins-Light text-lg text-[grey]">
        No. of Personnel
      </Text>
      <Text className="font-Poppins-bold text-xl">
        2
      </Text>
    </View>
  </View>

  {/* Right  */}
  <View className="flex-1 w-0 justify-between ">
    <View className="mb-4">
      <Text className="font-Poppins-Light text-lg text-[grey]">
        Arrived at
      </Text>
      <Text className="font-Poppins-bold text-xl">
        10:30 am
      </Text>
    </View>

    <View>
      <Text className="font-Poppins-Light text-lg text-[grey]">
        Gate
      </Text>
      <Text className="font-Poppins-bold text-xl">
        G7
      </Text>
    </View>
  </View>

</View>
      <View className='flex-1 mt-5 justify-center items-center '>
      <Image
  source={Images.barcode}
  style={{ width: 300, height: 100 }}
  resizeMode="cover"
/>
</View>  
      
      
        </View>

  )
}

export default DocumentsCard