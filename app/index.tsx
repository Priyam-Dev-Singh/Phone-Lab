import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home(){

    return(

       <SafeAreaView>
            <TouchableOpacity>
                <Text>Accelerometer</Text>
            </TouchableOpacity>
       </SafeAreaView>

    )
}
