import { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeContext } from "../src/context/ThemeContext";
import { Barometer } from "expo-sensors";

export default function Baromtr(){

    const {colorScheme} = useContext(ThemeContext);
    const isDark = colorScheme === 'dark';
    const styles = createStyles();

    const [data, setData] = useState<object>({pressure: 0, relativeAltitude: 0});
    const [subscription, setSubcription] = useState<any>(null);

    const subscribe = ()=>{
        setSubcription(Barometer.addListener(setData));
    }

    const unsubscribe = ()=>{
        subscription && subscription.remove();
        setSubcription(null);
    }

    useEffect(()=>{
        const sub = Barometer.addListener(setData);
        setSubcription(sub);

        return ()=> unsubscribe();
    },[])

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

function createStyles(){
    return StyleSheet.create({

    })
}