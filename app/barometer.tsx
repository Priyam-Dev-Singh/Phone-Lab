import { ScrollView, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Baromtr(){

    return(
        <SafeAreaProvider>
            <View>
                <Text>Barometer</Text>
            </View>
            <ScrollView>
            </ScrollView>
        </SafeAreaProvider>
    )

}