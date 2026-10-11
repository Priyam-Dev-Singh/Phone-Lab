import { Magnetometer } from "expo-sensors";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Magnetomtr(){

    const [data, setData] = useState<any>({x:0, y:0,z:0});
    const [subscription, setSubscription] = useState<any>(null);

    Magnetometer.setUpdateInterval(50);

    const _slow = ()=> Magnetometer.setUpdateInterval(1000);
    const _fast = ()=> Magnetometer.setUpdateInterval(16);

    const subscribe = ()=>{
        setSubscription(Magnetometer.addListener(result => {setData(result);}));
    }

    const unsubscribe = ()=>{
        subscription && subscription.remove();
        setSubscription(null);
    }

    useEffect(()=>{
        const sub = Magnetometer.addListener(setData);
        setSubscription(sub);

        return ()=> sub.remove();
    },[])


    return(
        <SafeAreaView>
            <View style={{padding: 10, margin: 10}}>
                <Text>Magnetometer</Text>
            </View>
            <ScrollView>
                <View>
                    <Text>x: {data.x.toFixed(5)}</Text>
                    <Text>y: {data.y.toFixed(5)}</Text>
                    <Text>z: {data.z.toFixed(5)}</Text>
                </View>
                <TouchableOpacity onPress={subscription ? unsubscribe : subscribe}>
                    <Text>{subscription? 'OFF': 'ON'}</Text>
                </TouchableOpacity>

                <View style={{flexDirection:'row'}}>
                    <TouchableOpacity onPress={_fast}>
                        <Text>Fast</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={_slow}>
                        <Text>Slow</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}