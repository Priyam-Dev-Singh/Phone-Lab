import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {useRouter} from 'expo-router'
import { useContext } from "react";
import { ThemeContext } from "../src/context/ThemeContext";

export default function Home(){

    const router = useRouter();
    const {colorScheme, colors} = useContext(ThemeContext);
    const isDark = colorScheme === 'dark';
    //console.log(isDark);
    const styles = createStyles(isDark, colors);

    return(

       <SafeAreaView>
        <View style={{margin: 10, padding: 10}}>
            <Text>PHONE LAB</Text>
        </View>
          <View style={{flexDirection:'row', flexWrap:'wrap',gap:20, marginTop:20}}>
            <TouchableOpacity onPress={()=>{ router.push('/accelerometer')}}>
                <Text>Kinematics</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{router.push('/barometer')}}>
                <Text>Atmospherics</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <Text>ElectroMagnetics</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <Text>Kinematics</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <Text>Kinematics</Text>
            </TouchableOpacity>
          </View>
       </SafeAreaView>

    )
}

function createStyles(isDark, colors){

    return StyleSheet.create({

    })

}