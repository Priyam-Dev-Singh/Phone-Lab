import { Magnetometer } from "expo-sensors";
import { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../src/context/ThemeContext";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Svg, { Line, Polyline,Text as SvgText } from "react-native-svg";
import AntDesign from '@expo/vector-icons/AntDesign';

export default function Magnetomtr(){

    const {colorScheme} = useContext<any>(ThemeContext);
    const isDark: boolean = colorScheme === 'dark';
    const styles = createStyles(isDark); 
    const [data, setData] = useState<any>({x:0, y:0,z:0});
    const [speed, setSpeed] = useState<string>('normal');
    const [highest, setHighest] = useState<number>(0);
    const [subscription, setSubscription] = useState<any>(null);

    const netFlux = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
    let angle = Math.atan2(data.y, data.x) * (180/Math.PI) - 90;

    const isAnomaly = netFlux > 80;

    const [history, setHistory] = useState<number[]>(new Array(50).fill(0));

    const handleSensorData = (result:{x:number, y: number, z: number})=>{
        setData(result);
        const currentFlux = Math.sqrt(result.x ** 2 + result.y ** 2 + result.z ** 2);
        setHighest(prev => Math.max(prev, currentFlux));
        setHistory(prev => [...prev.slice(1), currentFlux]);
    }

    const pointString = history.map((flux, index) => {
        const x = index * 6; // 50 points * 6px = 300px width
        const clampedFlux = Math.min(Math.max(flux, 0), 120); 
        const y = 100 - (clampedFlux / 120) * 90; 
        return `${x},${y}`;
    }).join(' ');

    const _slow = ()=> Magnetometer.setUpdateInterval(1000);
    const _fast = ()=> Magnetometer.setUpdateInterval(16);
    const activeColor = isAnomaly ? '#ff9900' : '#00ffcc';
    //console.log(speed);

    const subscribe = ()=>{
        setSubscription(Magnetometer.addListener(result => {setData(result);}));
    }

    const unsubscribe = ()=>{
        subscription && subscription.remove();
        setSubscription(null);
    }

    useEffect(()=>{
        const sub = Magnetometer.addListener(handleSensorData);
        setSubscription(sub);
        Magnetometer.setUpdateInterval(50);

        return ()=> sub.remove();
    },[])

    return(
        <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#121212':'#f5f5f5' }}>
            
             <View style={[styles.header,{padding: 10}]}>
                <Text style={styles.title}>MAGNETOMETER (FLUX)</Text>  
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                {speed === 'normal' && (
                    <TouchableOpacity onPress={() => { _fast(); setSpeed('fast'); }}>
                        <MaterialCommunityIcons name="speedometer-medium" size={28} color={activeColor} />
                    </TouchableOpacity>
                )}
                {speed === 'fast' && (
                    <TouchableOpacity onPress={() => { _slow(); setSpeed('slow'); }}>
                        <MaterialCommunityIcons name="speedometer" size={28} color={activeColor} />
                    </TouchableOpacity>
                )}
                {speed === 'slow' && (
                    <TouchableOpacity onPress={() => { 
                        Magnetometer.setUpdateInterval(50); // Reset to default
                        setSpeed('normal'); 
                    }}>
                        <MaterialCommunityIcons name="speedometer-slow" size={28} color={activeColor} />
                    </TouchableOpacity>
                )}
            </View>
            </View>

               <ScrollView contentContainerStyle={styles.scrollContent}>
    
            <View style={styles.radarContainer}>
                <View style={[styles.radarRing, { borderColor: activeColor, opacity: 0.3 }]} />
                <View style={[styles.radarRing, { width: 150, height: 150, borderColor: activeColor, opacity: 0.5 }]} />
                
                <View style={[styles.needleContainer, { transform: [{ rotate: `${angle}deg` }] }]}>
                    <View style={[styles.needle, { borderBottomColor: activeColor }]} />
                </View>

                <View style={[styles.centerHub, { backgroundColor: activeColor }]} />
                
            </View>

            <View style={[styles.dashboard, { borderColor: isAnomaly ? '#553300' : (isDark ? '#333' : '#ddd') }]}>
                <Text style={styles.label}>NET MAGNETIC FLUX</Text>
                <Text style={[styles.fluxValue, { color: activeColor }]}>
                    {netFlux.toFixed(1)} <Text style={styles.unit}>µT</Text>
                </Text>

                <View style={styles.axisGrid}>
                    <View style={styles.axisItem}>
                        <Text style={styles.axisLabel}>X-AXIS</Text>
                        <Text style={styles.axisValue}>{data.x.toFixed(3)}</Text>
                    </View>
                    <View style={styles.axisItem}>
                        <Text style={styles.axisLabel}>Y-AXIS</Text>
                        <Text style={styles.axisValue}>{data.y.toFixed(3)}</Text>
                    </View>
                    <View style={styles.axisItem}>
                        <Text style={styles.axisLabel}>Z-AXIS</Text>
                        <Text style={styles.axisValue}>{data.z.toFixed(3)}</Text>
                    </View>
                </View>

                {isAnomaly && (
                    <Text style={styles.warningText}>⚠️ MAGNETIC ANOMALY DETECTED</Text>
                )}
            </View>

            <TouchableOpacity 
                onPress={subscription ? unsubscribe : subscribe} 
                style={[styles.powerButton, { borderColor: activeColor }]}
            >
                <Text style={[styles.powerText, { color: activeColor }]}>
                    {subscription ? 'DISENGAGE SENSOR' : 'ENGAGE SENSOR'}
                </Text>
            </TouchableOpacity>
            <View style={styles.graphContainer}>
                <View style={styles.graphHeader}>
                    <Text style={styles.graphLabel}>FLUX HISTORY</Text>

                    <View style={{flexDirection:'row', gap: 10}}>
                        <Text style={styles.graphLabel}>Max: {highest.toFixed(3)}</Text>
                    <TouchableOpacity onPress={()=>{setHighest(0)}}>
                        <AntDesign name="redo" size={20} color={activeColor} />
                    </TouchableOpacity>
                    </View>
                    
                </View>
                
                <Svg height="100" width="300">

                    <Line x1="0" y1="10" x2="300" y2="10" stroke={isDark ? "#333" : "#ddd"} strokeWidth="1" />
                    <SvgText x="5" y="22" fill={isDark ? "#666" : "#999"} fontSize="9" fontFamily="monospace" fontWeight="bold">
                        120 µT (MAX)
                    </SvgText>
                    {/* Background baseline ~50 µT (Earth's average field) */}
                    <Line x1="0" y1="62.5" x2="300" y2="62.5" stroke={isDark ? "#333" : "#ddd"} strokeWidth="1" strokeDasharray="3,3" />
                    
                    {/* Anomaly Threshold Line (80 µT) */}
                    <Line x1="0" y1="40" x2="300" y2="40" stroke="#ff9900" strokeWidth="1" strokeDasharray="5,5" opacity="0.5" />
                    <Line x1="0" y1="99" x2="300" y2="99" stroke={isDark ? "#333" : "#ddd"} strokeWidth="1" />
                    <SvgText x="5" y="95" fill={isDark ? "#666" : "#999"} fontSize="9" fontFamily="monospace" fontWeight="bold">
                        0 µT
                    </SvgText>
                    <Polyline
                        points={pointString}
                        fill="none"
                        stroke={activeColor} // Turns amber dynamically
                        strokeWidth="2"
                    />
                </Svg>
            </View>
               </ScrollView>
          
        </SafeAreaView>
    )
}

function createStyles(isDark: boolean){
    return StyleSheet.create({

        scrollContent: {
        flexGrow: 1, // Crucial: allows it to fill the screen but still scroll if needed
        alignItems: 'center',
        padding: 20,
        paddingBottom: 40, // Gives a little extra breathing room at the bottom of the scroll
    },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-between',
            marginTop: 10,
        },
        title: {
            color: isDark ? '#888' : '#666',
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
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            padding: 20,
            borderRadius: 12,
            borderWidth: 1,
            alignItems: 'center',
        },
        label: {
            color: isDark ? '#888' : '#666',
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
            color: isDark ? '#666' : '#888',
        },
        axisGrid: {
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-between',
            marginTop: 20,
            paddingTop: 20,
            borderTopWidth: 1,
            borderTopColor: isDark ? '#333' : '#eee',
        },
        axisItem: {
            alignItems: 'center',
        },
        axisLabel: {
            color: isDark ? '#666' : '#888',
            fontSize: 10,
            fontFamily: 'monospace',
            marginBottom: 5,
        },
        axisValue: {
            color: isDark ? '#fff' : '#000',
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
            backgroundColor: isDark ? '#151515' : '#ffffff',
        },
        powerText: {
            fontFamily: 'monospace',
            fontWeight: 'bold',
            letterSpacing: 1,
        },
        graphContainer: {
            width: '100%',
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            padding: 15,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#ddd',
            alignItems: 'center',
            marginTop: 20,
        },
        graphHeader: {
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-between',
            marginBottom: 10,
        },
        graphLabel: {
            color: isDark ? '#666' : '#999',
            fontSize: 10,
            fontFamily: 'monospace',
            fontWeight: 'bold',
        }
    });
}