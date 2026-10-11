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

    const netG = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);

    const dotX = data.x * 100;
    const dotY = -data.y * 100;
    const dotScale = Math.abs(data.z);

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
                <Text>y:{data.y.toFixed(5)} or {(data.y * 9.81).toFixed(5)} m/s²</Text>
                <Text>z:{data.z.toFixed(5)} or {(data.z * 9.81).toFixed(5)} m/s²</Text>
                <Text>x:{data.x.toFixed(5)} or {(data.x * 9.81).toFixed(5)} m/s²</Text>
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

            <View style={{
                width: 250,
                height: 250,
                borderRadius: 125,
                borderWidth: 2,
                borderColor: '#444',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#1a1a1a',
                overflow: 'hidden'}}>

                <View style={{ position: 'absolute', width: '100%', height: 1, backgroundColor: '#333' }} />
                <View style={{ position: 'absolute', width: 1, height: '100%', backgroundColor: '#333' }} />
                <View style={{width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#ff3366',
                    position: 'absolute',
                    transform: [
                        { translateX: dotX },
                        { translateY: dotY },
                        { scale: dotScale } // Changes size as Z-axis shifts
                    ],
                    shadowColor: '#ff3366',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 10,}} />
            </View>
            <View>
                <Text style={{color: '#888', fontWeight: 'bold', marginBottom: 5}}>NET ACCELERATION</Text>
                <Text style={{color: '#ff3366', fontFamily: 'monospace', fontSize: 32, fontWeight: 'bold'}}>{(netG * 9.81).toFixed(5)} m/s²</Text>
            </View>
        </SafeAreaView>
    )
}