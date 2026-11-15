import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';


interface prop{
  type:number
}


const AssignedTaskCard = ({type}:prop) => {
  const router = useRouter()
  return (
    <View className='bg-[white] rounded-[24px] p-5 m-2 items-left justify-between border-2 border-[#E3E6EB]'>
    
    {type?<><Text className='font-Poppins-Medium text-xl'>Delivery : D099134</Text>
    <View className='flex-row justify-between mt-2'>
    <Text className='font-Poppins-Light text-md'>Area : Katubedda</Text>
    <Text className='font-Poppins-Light text-md'>Total Locations : 35</Text>
    </View>
      
</>:<><Text className='font-Poppins-Medium text-xl'>Pickup : P099134</Text>
<View className='flex-row justify-between mt-2'>
      <Text className='font-Poppins-Light text-md'>Location : Kottawa CBL</Text>
      <Text className='font-Poppins-Light text-md'>Pickup time : 10:30am</Text>
      </View>
</>}
      


      <TouchableOpacity className='bg-[#E6F6EC] my-4 p-2 rounded-[10px]'   onPress={() => {
    if (type) {
      router.push({
        pathname: "/ActiveDeliveryDetails",
        params: { type, isActive: 0 },
      });
    } else {
      router.push({
        pathname: "/ActivePickupDetails" as any,
        params: { type, isActive: 0 },
      });
    }
  }}>
                    <Text className='text-center font-Poppins-Medium text-[#11692F]'>View more details</Text>
                  </TouchableOpacity>
      
    
    

  </View>
  )
}

export default AssignedTaskCard