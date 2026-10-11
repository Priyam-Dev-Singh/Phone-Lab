import { Magnetometer } from "expo-sensors";
import { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../src/context/ThemeContext";

export default function Magnetomtr(){

    const {colorScheme} = useContext(ThemeContext);
    const isDark: boolean = colorScheme === 'dark';
    const styles = createStyles(isDark); 
    const [data, setData] = useState<any>({x:0, y:0,z:0});
    const [subscription, setSubscription] = useState<any>(null);

    const netFlux = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
    let angle = Math.atan2(data.y, data.x) * (180/Math.PI) - 90;

    const isAnomaly = netFlux > 80;


    const _slow = ()=> Magnetometer.setUpdateInterval(1000);
    const _fast = ()=> Magnetometer.setUpdateInterval(16);
    const activeColor = isAnomaly ? '#ff9900' : '#00ffcc'; // Amber warning vs Cyan safe

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
        Magnetometer.setUpdateInterval(50);


        return ()=> sub.remove();
    },[])


    return(
        <SafeAreaView>
            <View style={{padding: 10, margin: 10}}>
                <Text>Magnetometer</Text>
            </View>
            <ScrollView>
                <View>
                    <Text>x: {data.x.toFixed(5)} µT</Text>
                    <Text>y: {data.y.toFixed(5)} µT</Text>
                    <Text>z: {data.z.toFixed(5)} µT</Text>
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

function createStyles(isDark: boolean){

    return StyleSheet.create({
        container: {
        flex: 1,
        backgroundColor: isDark ? '#121212':'#ffffff',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    title: {
        color: '#888',
        fontFamily: 'monospace',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        shadowOpacity: 0.8,
        shadowRadius: 5,
        shadowColor: '#ff9900',
    },
    radarContainer: {
        width: 250,
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 40,
    },
    radarRing: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    needleContainer: {
        position: 'absolute',
        width: 4,
        height: 250,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    needle: {
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderBottomWidth: 100,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
    },
    centerHub: {
        width: 16,
        height: 16,
        borderRadius: 8,
        position: 'absolute',
    },
    dashboard: {
        width: '100%',
        backgroundColor: '#1a1a1a',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    label: {
        color: '#888',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    fluxValue: {
        fontFamily: 'monospace',
        fontSize: 48,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    unit: {
        fontSize: 20,
        color: '#666',
    },
    axisGrid: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    axisItem: {
        alignItems: 'center',
    },
    axisLabel: {
        color: '#666',
        fontSize: 10,
        fontFamily: 'monospace',
        marginBottom: 5,
    },
    axisValue: {
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: 16,
    },
    warningText: {
        color: '#ff9900',
        fontFamily: 'monospace',
        fontSize: 12,
        marginTop: 15,
        fontWeight: 'bold',
    },
    powerButton: {
        marginTop: 40,
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#151515',
    },
    powerText: {
        fontFamily: 'monospace',
        fontWeight: 'bold',
        letterSpacing: 1,
    }
    })
}