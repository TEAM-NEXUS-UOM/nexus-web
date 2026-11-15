import { View, Text,TouchableOpacity } from 'react-native'
import React from 'react'
import OngoingTaskCard from './Cards/OngoingTaskCard'
const OngoingTask = () => {
  return (
          <View className='mt-3'>
            <Text className='font-Poppins-Medium text-xl my-2'>Ongoin Tasks</Text>
     {/* 1 for delivery and 0 for pickup */}
            <OngoingTaskCard type={1}/>
            <OngoingTaskCard type={0}/>
            
    
    
    
          </View>
    
  )
}

export default OngoingTask