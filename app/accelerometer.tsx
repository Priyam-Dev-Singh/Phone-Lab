import { useEffect, useState } from "react";
import { Text, Touchable, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {Accelerometer} from 'expo-sensors'



export default function AcclrtComp(){

    const [data, setData] = useState({
        x: 0,
        y: 0,
        z: 0
    });
    const [subscription, setSubscription] = useState<any>(null);
    const subscribe = ()=>{
        setSubscription(Accelerometer.addListener(setData));
    }

    const _slow =()=> Accelerometer.setUpdateInterval(1000);
    const _fast =()=> Accelerometer.setUpdateInterval(50);

    const unsubscribe = ()=>{
        subscription && subscription?.remove()
        setSubscription(null);
    }

    useEffect(()=>{
        const sub = Accelerometer.addListener(setData);
        setSubscription(sub);

        return ()=> sub.remove();
    },[]);

    return(
        <SafeAreaView>
            <View>
                <Text>Accelerometer</Text>
            </View>
            <View style={{flexDirection:'row', flexWrap: 'wrap', gap: 10}}>
                <Text>x:{data.x.toFixed(5)} or {(data.x * 9.81).toFixed(5)} m/s^2</Text>
                <Text>y:{data.y.toFixed(5)} or {(data.y * 9.81).toFixed(5)} m/s^2</Text>
                <Text>z:{data.z.toFixed(5)} or {(data.z * 9.81).toFixed(5)} m/s^2</Text>
            </View>
            <TouchableOpacity onPress={subscription ? unsubscribe : subscribe} style={{margin: 10, padding: 10, backgroundColor:'#e4e6ca'}}>
                <Text>{subscription ? 'On':'Off'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={_slow}>
                <Text>Slow</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={_fast}>
                <Text>Fast</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}