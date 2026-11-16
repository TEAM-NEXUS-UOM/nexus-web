
import { View, Text, Pressable, TouchableOpacity, FlatList } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import * as Progress from 'react-native-progress'
import ReportIssue from '@/Components/Buttons/ReportIssue'
import DocumentsCard from '@/Components/Cards/DocumentsCard'
import { LinearGradient } from 'expo-linear-gradient'

const ActiveDeliveryDetails = () => {
  const router = useRouter()

  const { isActive } = useLocalSearchParams<{
    type: string
    isActive: string
  }>()

  // Temporary document list for UI development
  const list = [1, 2, 3]

  const topComponent = (
    <>
      <LinearGradient
        style={{
          borderRadius: 24,
          marginHorizontal: 2,
          marginVertical: 20,
          padding: 12,
        }}
        colors={['#2A44D4', '#2A44D4']}
      >
        {/* Pickup Summary */}
        <View className="flex-row justify-between items-center my-4">
          <View>
            <Text className="font-Poppins-Light text-lg text-white">
              Shipment pickup
            </Text>

            <Text className="font-Poppins-SemiBold text-3xl text-white">
              P09134
            </Text>
          </View>

          <View>
            <Progress.Circle
              size={70}
              progress={0.5}
              thickness={4}
              color="#ffffff"
              unfilledColor="#D1D5DB"
              borderWidth={0}
              showsText
              formatText={() => '50%'}
              textStyle={{
                fontFamily: 'Poppins-Medium',
                fontSize: 16,
                color: '#ffffff',
              }}
              strokeCap="round"
            />
          </View>
        </View>

        {/* Pickup Information */}
        <View>
          <View className="flex-row justify-between mb-2">
            <Text className="font-Poppins-Light text-lg text-white">
              Location
            </Text>

            <Text className="font-Poppins-Medium text-xl text-white">
              Kottawa CBL
            </Text>
          </View>

          <View className="flex-row justify-between mb-4">
            <Text className="font-Poppins-Light text-lg text-white">
              Pickup time
            </Text>

            <Text className="font-Poppins-Medium text-xl text-white">
              10:30 am
            </Text>
          </View>

          <View className="flex-row justify-between mb-4">
            <Text className="font-Poppins-Light text-lg text-white">
              Loading Bay
            </Text>

            <Text className="font-Poppins-Medium text-xl text-white">
              04
            </Text>
          </View>

          <View className="flex-row justify-between mb-4">
            <Text className="font-Poppins-Light text-lg text-white">
              Delivery Vehicle
            </Text>

            <Text className="font-Poppins-Medium text-xl text-white">
              VEH1234
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-around gap-3">
          <TouchableOpacity
            className="flex-1 bg-white my-2 p-3 rounded-[14px]"
            onPress={() => console.log('Call Driver')}
          >
            <Text className="text-center font-Poppins-Medium">
              Call Driver
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-white my-2 p-3 rounded-[14px]"
            onPress={() => console.log('Open route')}
          >
            <Text className="text-center font-Poppins-Medium">
              Open route
            </Text>
          </TouchableOpacity>
        </View>

        {/* Start Task / Report Issue */}
        {isActive === '1' ? (
          <ReportIssue />
        ) : (
          <TouchableOpacity
            className="bg-white my-2 p-3 rounded-[14px]"
            onPress={() => console.log('Start Task')}
          >
            <Text className="text-center font-Poppins-Medium text-[#11692F]">
              Start Task
            </Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Documents Heading */}
      <Text className="font-Poppins-Light text-xl my-2">
        Documents and Vehicle Passes
      </Text>
    </>
  )

  return (
    <SafeAreaView
      className="flex-1 p-4"
      edges={['top', 'left', 'right']}
    >
      {/* Back Button */}
      <Pressable
        className="my-4"
        onPress={() => router.back()}
      >
        <MaterialIcons
          name="arrow-back"
          size={24}
          color="black"
        />
      </Pressable>

      {/* Documents List */}
      <FlatList
        ListHeaderComponent={topComponent}
        showsVerticalScrollIndicator={false}
        data={list}
        keyExtractor={(item) => item.toString()}
        renderItem={() => <DocumentsCard />}
      />
    </SafeAreaView>
  )
}

export default ActiveDeliveryDetails
