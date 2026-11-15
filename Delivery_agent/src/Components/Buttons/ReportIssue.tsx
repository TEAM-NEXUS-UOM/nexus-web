import { View, Text,TouchableOpacity } from 'react-native'
import React from 'react'

const ReportIssue = () => {
  return (
    <TouchableOpacity
    className="bg-[#FFCCCC] my-2 p-3 rounded-[14px] w-full"
    onPress={() => console.log("Pressed")}
  >
    <Text className="text-center font-Poppins-Medium text-[#B91C1C]">
      Report an issue
    </Text>
  </TouchableOpacity>
  )
}

export default ReportIssue