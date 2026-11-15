import AssignedTasks from '@/Components/AssignedTasks'
import CheckInCard from '@/Components/Cards/CheckInCard'
import HistoryCard from '@/Components/Cards/HIstoryCard'
import Header from '@/Components/Header'
import OngoingTask from '@/Components/OngoingTask'
import { FlatList, ScrollView, StyleSheet,Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const addnewshop = () => {
  const data = [1,0,1,1,0]
  return (
    <SafeAreaView className='flex-1 p-2 pb-0' edges={['top', 'left', 'right']}>
      <Header />
      <FlatList
              showsVerticalScrollIndicator={false}
        data={data}
        renderItem={({item}) => <HistoryCard type={item}/>}
        />
        
    </SafeAreaView>
  )
}

export default addnewshop