import { useEffect, useState } from "react";
import { ScrollView, Text, Touchable, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {Accelerometer} from 'expo-sensors'
import Svg, { Line, Polyline } from 'react-native-svg'


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

    const [history, setHistory] = useState<number[]>(new Array(50).fill(0));
    const [peakValue, setPeakValue] = useState(0);

    const handleSensorData = (sensorData:{x:number, y: number, z: number})=>{
        setData(sensorData);
        const currentNetG = Math.sqrt(sensorData.x ** 2 +sensorData.y ** 2 + sensorData.z ** 2);
        setPeakValue(prev => Math.max(prev, currentNetG));
        setHistory(prev => {
            return[...prev.slice(1), currentNetG];
        })
    }

    const [subscription, setSubscription] = useState<any>(null);
    const subscribe = ()=>{
        setSubscription(Accelerometer.addListener(handleSensorData));
    }

    const _slow =()=> Accelerometer.setUpdateInterval(1000);
    const _fast =()=> Accelerometer.setUpdateInterval(50);

    const unsubscribe = ()=>{
        subscription && subscription?.remove()
        setSubscription(null);
    }

    const pointString = history.map((g, index)=>{
        const x = index * 6;
        const y = Math.max(10, 100-(g/3)*90);
        return `${x},${y}`;
    }).join(' ');

    useEffect(()=>{
        const sub = Accelerometer.addListener(handleSensorData);
        setSubscription(sub);

        return ()=> sub.remove();
    },[]);

    //console.log(pointString);
    return(
        <SafeAreaView>
            <ScrollView>
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

            <View style={{width: 'auto',
                          borderColor: '#333',
                          borderWidth: 1,
                          borderRadius: 8,
                          padding: 12,
                          backgroundColor: '#151515',
                          marginTop: 20,}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5}}>
                    <Text style={{ color: '#00ffcc', fontFamily: 'monospace', fontSize: 11 }}>ROLLING INTENSITY (T-5s)</Text>
                    <Text style={{ color: '#ff3366', fontFamily: 'monospace', fontSize: 11 }}>PEAK: {(peakValue * 9.81).toFixed(2)} m/s²</Text>
                </View>

                <View style={{height: 110, justifyContent: 'center', alignItems: 'center'}}>
                    <Svg height='100' width="300">
                        <Line x1="0" y1="70" x2="300" y2="70" stroke="#222" strokeWidth="1" strokeDasharray="3,3" />
                        <Line x1="0" y1="10" x2="300" y2="10" stroke="#311" strokeWidth="1" />

                        <Polyline
                            points={pointString}
                            fill='none'
                            stroke='#ff3366'
                            strokeWidth='2'
                        />
                    </Svg>
                </View>

            </View>
            </ScrollView>
        </SafeAreaView>
    )
}