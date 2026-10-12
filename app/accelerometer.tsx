import { useEffect, useState, useContext } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Accelerometer } from 'expo-sensors';
import Svg, { Circle, Line, Polygon, Polyline, Text as SvgText, G } from 'react-native-svg';
import { ThemeContext } from "../src/context/ThemeContext";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function AcclrtComp() {
    const { colorScheme } = useContext<any>(ThemeContext);
    const isDark: boolean = colorScheme === 'dark';
    const styles = createStyles(isDark);

    const [data, setData] = useState({ x: 0, y: 0, z: 0 });
    const [history, setHistory] = useState<number[]>(new Array(50).fill(0));
    const [peakValue, setPeakValue] = useState(0);
    const [subscription, setSubscription] = useState<any>(null);
    const [speed, setSpeed] = useState<string>('normal');

    const netG = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
    const SIunit = netG * 9.81;
    const xSI = data.x * 9.81;
    const ySI = data.y * 9.81;
    const zSI = data.z * 9.81;
    
    const dotX = data.x * 60;
    const dotY = -data.y * 60;
    const dotScale = Math.max(0.5, Math.abs(data.z)); 

    const activeColor = '#dced87';

    const handleSensorData = (sensorData: { x: number, y: number, z: number }) => {
        setData(sensorData);
        const currentNetG = Math.sqrt(sensorData.x ** 2 + sensorData.y ** 2 + sensorData.z ** 2);
        setPeakValue(prev => Math.max(prev, currentNetG));
        setHistory(prev => [...prev.slice(1), currentNetG]);
    }

    const _slow = () => Accelerometer.setUpdateInterval(1000);
    const _fast = () => Accelerometer.setUpdateInterval(16);

    const subscribe = () => {
        setSubscription(Accelerometer.addListener(handleSensorData));
    }

    const unsubscribe = () => {
        subscription && subscription.remove();
        setSubscription(null);
    }

    useEffect(() => {
        const sub = Accelerometer.addListener(handleSensorData);
        setSubscription(sub);
        Accelerometer.setUpdateInterval(50);

        return () => sub.remove();
    }, []);

    const pointString = history.map((g, index) => {
        const x = index * 3;
        const clampedG = Math.min(Math.max(g, 0), 3);
        const y = 80 - (clampedG / 3) * 70;
        return `${x},${y}`;
    }).join(' ');

    const clampedG = Math.max(-4, Math.min(netG, 10));
    const needleAngle = 180 + (clampedG * 22.5);

    const ticks = Array.from({ length: 15 }, (_, i) => -4 + i);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={styles.speedControls}>
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
                        <TouchableOpacity onPress={() => { Accelerometer.setUpdateInterval(50); setSpeed('normal'); }}>
                            <MaterialCommunityIcons name="speedometer-slow" size={28} color={activeColor} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.analogCasing}>
                    <View style={[styles.screw, { top: 10, left: 10 }]}><View style={styles.screwCross1} /><View style={styles.screwCross2} /></View>
                    <View style={[styles.screw, { top: 10, right: 10 }]}><View style={styles.screwCross1} /><View style={styles.screwCross2} /></View>
                    <View style={[styles.screw, { bottom: 10, left: 10 }]}><View style={styles.screwCross1} /><View style={styles.screwCross2} /></View>
                    <View style={[styles.screw, { bottom: 10, right: 10 }]}><View style={styles.screwCross1} /><View style={styles.screwCross2} /></View>

                    <Svg height="300" width="300">
                        <Circle cx="150" cy="150" r="135" fill="#1b1c1b" stroke="#000" strokeWidth="4" />
                        
                        {ticks.map(val => {
                            const angle = 180 + (val * 22.5);
                            const isEven = val % 2 === 0;
                            const textRadius = 90;
                            const rad = (angle * Math.PI) / 180;
                            const textX = 150 + textRadius * Math.cos(rad);
                            const textY = 150 + textRadius * Math.sin(rad) + 8; 

                            return (
                                <G key={val}>
                                    <G transform={`rotate(${angle}, 150, 150)`}>
                                        <Line x1="265" y1="150" x2={isEven ? "280" : "275"} y2="150" stroke={activeColor} strokeWidth={isEven ? "4" : "2"} />
                                    </G>
                                    {isEven && (
                                        <SvgText x={textX} y={textY} fill={activeColor} fontSize="24" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                                            {val}
                                        </SvgText>
                                    )}
                                </G>
                            );
                        })}

                        <SvgText x="150" y="115" fill="#ffffff" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">ACCELERATION</SvgText>
                        <SvgText x="150" y="130" fill="#ffffff" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">g UNITS</SvgText>

                        <Polygon 
                            points="130,146 130,154 260,154 275,150 260,146" 
                            fill={activeColor} 
                            transform={`rotate(${needleAngle}, 150, 150)`} 
                        />
                        <Circle cx="150" cy="150" r="12" fill="#3a3d3c" stroke="#111" strokeWidth="2" />
                    </Svg>
                </View>

                <View style={styles.sideBySideContainer}>
                    <View style={styles.radarContainer}>
                        <View style={styles.crosshairH} />
                        <View style={styles.crosshairV} />
                        <View style={[
                            styles.dot,
                            {
                                transform: [
                                    { translateX: dotX },
                                    { translateY: dotY },
                                    { scale: dotScale }
                                ]
                            }
                        ]} />
                    </View>

                    <View style={styles.graphContainer}>
                        <View style={styles.graphHeader}>
                            <Text style={styles.graphLabel}>T-5s</Text>
                            <View style={{flexDirection:'row', gap: 5}}>
                            <View>
                                <Text style={styles.graphLabel}>{peakValue.toFixed(3)}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setPeakValue(0)}>
                                <AntDesign name="redo" size={14} color={activeColor} />
                            </TouchableOpacity>
                            </View>
                        </View>
                        
                        <Svg height="80" width="150">
                            <Line x1="0" y1="10" x2="150" y2="10" stroke={isDark ? "#333" : "#ddd"} strokeWidth="1" />
                            <SvgText x="2" y="20" fill={isDark ? "#666" : "#999"} fontSize="8" fontFamily="monospace" fontWeight="bold">3G</SvgText>
                            <Line x1="0" y1="56" x2="150" y2="56" stroke={isDark ? "#333" : "#ddd"} strokeWidth="1" strokeDasharray="3,3" />
                            <SvgText x="2" y="53" fill={isDark ? "#666" : "#999"} fontSize="8" fontFamily="monospace" fontWeight="bold">1G</SvgText>
                            
                            <Polyline points={pointString} fill="none" stroke={activeColor} strokeWidth="2" />
                        </Svg>
                    </View>
                </View>

                <View style={styles.dashboard}>
                    <Text style={styles.label}>NET KINEMATIC FORCE</Text>
                    <Text style={[styles.mainValue, { color: activeColor }]}>
                        {netG.toFixed(2)} <Text style={styles.unit}>g</Text>
                    </Text>
                    <View>
                        <Text style={styles.axisValue}>{SIunit.toFixed(3)} m/s²</Text>
                    </View>

                    <View style={styles.axisGrid}>
                        <View style={styles.axisItem}>
                            <Text style={styles.axisLabel}>X</Text>
                            <Text style={styles.axisValue}>{data.x.toFixed(2)}</Text>
                            <Text style={styles.axisLabel}>{xSI.toFixed(3)} m/s²</Text>
                        </View>
                        
                        <View style={styles.axisItem}>
                            <Text style={styles.axisLabel}>Y</Text>
                            <Text style={styles.axisValue}>{data.y.toFixed(2)}</Text>
                            <Text style={styles.axisLabel}>{ySI.toFixed(3)} m/s²</Text>

                        </View>
                        <View style={styles.axisItem}>
                            <Text style={styles.axisLabel}>Z</Text>
                            <Text style={styles.axisValue}>{data.z.toFixed(2)}</Text>
                            <Text style={styles.axisLabel}>{zSI.toFixed(3)} m/s²</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity 
                    onPress={subscription ? unsubscribe : subscribe} 
                    style={[styles.powerButton, { borderColor: subscription ? activeColor : (isDark ? '#333' : '#ccc') }]}
                >
                    <Text style={[styles.powerText, { color: subscription ? activeColor : (isDark ? '#888' : '#666') }]}>
                        {subscription ? 'DISENGAGE POWER' : 'ENGAGE POWER'}
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

function createStyles(isDark: boolean) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#121212' : '#d9d9d9',
        },
        scrollContent: {
            flexGrow: 1,
            alignItems: 'center',
            padding: 20,
            paddingBottom: 40,
        },
        speedControls: {
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'flex-end',
            marginBottom: 10,
        },
        analogCasing: {
            width: 320,
            height: 320,
            backgroundColor: '#3a3d3c',
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 3,
            borderColor: '#222322',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 10,
            position: 'relative',
        },
        screw: {
            position: 'absolute',
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: '#2a2c2b',
            borderWidth: 1,
            borderColor: '#111',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 1, height: 1 },
            shadowOpacity: 0.8,
            shadowRadius: 2,
        },
        screwCross1: {
            position: 'absolute',
            width: 14,
            height: 2,
            backgroundColor: '#1a1a1a',
            transform: [{ rotate: '45deg' }],
        },
        screwCross2: {
            position: 'absolute',
            width: 14,
            height: 2,
            backgroundColor: '#1a1a1a',
            transform: [{ rotate: '-45deg' }],
        },
        sideBySideContainer: {
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-between',
            marginTop: 20,
            height: 160,
        },
        radarContainer: {
            width: '48%',
            height: '100%',
            borderRadius: 8,
            borderWidth: 2,
            borderColor: isDark ? '#333' : '#bbb',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDark ? '#1a1a1a' : '#eaeaea',
            overflow: 'hidden',
        },
        crosshairH: {
            position: 'absolute',
            width: '100%',
            height: 1,
            backgroundColor: isDark ? '#333' : '#ccc',
        },
        crosshairV: {
            position: 'absolute',
            width: 1,
            height: '100%',
            backgroundColor: isDark ? '#333' : '#ccc',
        },
        dot: {
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#dced87',
            position: 'absolute',
            shadowColor: '#dced87',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            elevation: 5,
        },
        graphContainer: {
            width: '48%',
            height: '100%',
            backgroundColor: isDark ? '#1a1a1a' : '#eaeaea',
            padding: 10,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: isDark ? '#333' : '#bbb',
            alignItems: 'center',
        },
        graphHeader: {
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-between',
            marginBottom: 5,
        },
        graphLabel: {
            color: isDark ? '#666' : '#888',
            fontSize: 10,
            fontFamily: 'monospace',
            fontWeight: 'bold',
        },
        dashboard: {
            width: '100%',
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            padding: 20,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#ddd',
            alignItems: 'center',
            marginTop: 20,
        },
        label: {
            color: isDark ? '#888' : '#666',
            fontSize: 12,
            fontWeight: 'bold',
            letterSpacing: 1,
        },
        mainValue: {
            fontFamily: 'monospace',
            fontSize: 42,
            fontWeight: 'bold',
            marginVertical: 10,
        },
        unit: {
            fontSize: 16,
            color: isDark ? '#666' : '#888',
        },
        axisGrid: {
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-between',
            marginTop: 15,
            paddingTop: 15,
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
        powerButton: {
            marginTop: 20,
            paddingVertical: 15,
            width: '100%',
            alignItems: 'center',
            borderWidth: 1,
            borderRadius: 8,
            backgroundColor: isDark ? '#151515' : '#ffffff',
        },
        powerText: {
            fontFamily: 'monospace',
            fontWeight: 'bold',
            letterSpacing: 1,
        }
    });
}