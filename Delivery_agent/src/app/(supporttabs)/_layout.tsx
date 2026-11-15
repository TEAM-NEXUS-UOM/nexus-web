import { Stack } from "expo-router";
import { ActivityIndicator,View } from "react-native";
import { useFonts } from "expo-font";


export default function RootLayout() {




  return (
    <Stack>
     
      <Stack.Screen name="ActiveDeliveryDetails" options={{ headerShown: false }} />
      <Stack.Screen name="ActivePickupDetails" options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetails" options={{ headerShown: false }} />
     
    </Stack>
  );
}
