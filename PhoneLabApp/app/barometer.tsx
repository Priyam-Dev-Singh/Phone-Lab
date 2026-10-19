import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../src/context/ThemeContext";
import { Barometer } from "expo-sensors";
import { useRouter } from "expo-router";
import Svg, { Circle, Line, Polygon, Rect, Text as SvgText, G } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Baromtr() {
    const router = useRouter();
    const { colorScheme } = useContext<any>(ThemeContext);
    const isDark = colorScheme === 'dark';
    const styles = createStyles(isDark);

    const [data, setData] = useState({ pressure: 0, relativeAltitude: 0 });
    const [subscription, setSubcription] = useState<any>(null);
    const [baseline, setBaseline] = useState<number | null>(null);

    const activeColor = '#e6dbae'; 

    const checkAvailability = async () => {
        const isAvailable = await Barometer.isAvailableAsync();
        if (!isAvailable) {
            alert("No Barometer sensor found on this device!");
            return false;
        }
        return true;
    };

    useEffect(() => {
        let sub: any;
        const loadData = async () => {
            const available = await checkAvailability();
            if (!available) return;

            sub = Barometer.addListener(sensorData => {
                setData(sensorData as any);
                setBaseline(prev => prev === null ? sensorData.pressure : prev);
            });
            
            setSubcription(sub);
            Barometer.setUpdateInterval(100);
        };

        loadData();
        return () => {
            if (sub) sub.remove();
        };
    }, []);

    const altitudeMeters = baseline ? (baseline - data.pressure) * 8.3 : 0;
    const floorsTraveled = altitudeMeters / 3;

    const needleAngle = (altitudeMeters % 100) * 3.6;

    const ticks = Array.from({ length: 50 }, (_, i) => i);

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    <View style={styles.header}>
                        <Text style={styles.title}>ATMOSPHERICS (ALTIMETER)</Text>
                        <View style={[styles.statusDot, { backgroundColor: subscription ? activeColor : (isDark ? '#555' : '#ccc') }]} />
                    </View>

                    <View style={styles.analogCasing}>
                        <View style={[styles.screw, { top: 10, left: 10 }]}><View style={styles.screwCross1} /><View style={styles.screwCross2} /></View>
                        <View style={[styles.screw, { top: 10, right: 10 }]}><View style={styles.screwCross1} /><View style={styles.screwCross2} /></View>
                        <View style={[styles.screw, { bottom: 10, left: 10 }]}><View style={styles.screwCross1} /><View style={styles.screwCross2} /></View>
                        <View style={[styles.screw, { bottom: 10, right: 10 }]}><View style={styles.screwCross1} /><View style={styles.screwCross2} /></View>

                        <Svg height="300" width="300">
                            <Circle cx="150" cy="150" r="135" fill="#1b1c1b" stroke="#000" strokeWidth="4" />
                            
                            {ticks.map(val => {
                                const angle = (val * 7.2) - 90;
                                const isMajor = val % 5 === 0;
                                const num = val / 5;
                                const textRadius = 95;
                                const rad = (angle * Math.PI) / 180;
                                const textX = 150 + textRadius * Math.cos(rad);
                                const textY = 150 + textRadius * Math.sin(rad) + 8; 

                                return (
                                    <G key={val}>
                                        <G transform={`rotate(${angle + 90}, 150, 150)`}>
                                            <Line x1="150" y1="15" x2="150" y2={isMajor ? "30" : "22"} stroke={activeColor} strokeWidth={isMajor ? "3" : "1.5"} />
                                        </G>
                                        {isMajor && (
                                            <SvgText x={textX} y={textY} fill={activeColor} fontSize="28" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                                                {num === 0 ? '0' : num}
                                            </SvgText>
                                        )}
                                    </G>
                                );
                            })}

                            <Rect x="110" y="75" width="50" height="30" fill="#0a0a0a" stroke="#333" strokeWidth="2" rx="2" />
                            <SvgText x="150" y="96" fill="#ffffff" fontSize="18" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                                {data.pressure.toFixed(0)}
                            </SvgText>
                            <SvgText x="150" y="115" fill={activeColor} fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                                MILLIBARS
                            </SvgText>

                            <Rect x="185" y="130" width="40" height="60" fill="#0a0a0a" stroke="#333" strokeWidth="2" rx="2" />
                            <SvgText x="205" y="156" fill="#ffffff" fontSize="18" fontFamily="monospace" textAnchor="middle">
                                {Math.abs(floorsTraveled).toFixed(0)}
                            </SvgText>
                            <SvgText x="205" y="185" fill={activeColor} fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                                FLOORS
                            </SvgText>

                            <Rect x="110" y="185" width="80" height="30" fill="#0a0a0a" stroke="#333" strokeWidth="2" rx="2" />
                            <SvgText x="150" y="206" fill="#ffffff" fontSize="18" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                                {(data.pressure * 0.02953).toFixed(2)}
                            </SvgText>
                            <SvgText x="150" y="225" fill={activeColor} fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                                IN HG
                            </SvgText>

                            <SvgText x="90" y="160" fill={activeColor} fontSize="24" fontFamily="monospace" textAnchor="middle">ALT</SvgText>
                            
                            <Polygon 
                                points="144,150 156,150 152,35 148,35" 
                                fill={activeColor} 
                                transform={`rotate(${needleAngle}, 150, 150)`} 
                            />
                            
                            <Polygon 
                                points="140,150 150,185 160,150" 
                                fill="#ffffff" 
                                transform={`rotate(${needleAngle}, 150, 150)`} 
                            />
                            <Circle cx="150" cy="150" r="8" fill="#111" stroke={activeColor} strokeWidth="1" />
                        </Svg>
                    </View>

                    <View style={styles.dashboard}>
                        <View style={styles.dataRow}>
                            <View style={styles.dataBlock}>
                                <Text style={styles.label}>ABSOLUTE PRESSURE</Text>
                                <Text style={styles.valueLarge}>
                                    {data.pressure.toFixed(2)} <Text style={styles.unit}>hPa</Text>
                                </Text>
                            </View>
                            <View style={styles.dataBlock}>
                                <Text style={styles.label}>ELEVATION SHIFT</Text>
                                <Text style={styles.valueAccent}>
                                    {altitudeMeters > 0 ? '+' : ''}{altitudeMeters.toFixed(1)} <Text style={styles.unitAccent}>m</Text>
                                </Text>
                            </View>
                        </View>

                        <View style={{flexDirection:'row', alignItems:'center'}}>
                            <TouchableOpacity 
                            onPress={() => setBaseline(data.pressure)}
                            style={styles.resetButton}
                        >
                            <MaterialCommunityIcons name="target" size={20} color={activeColor} style={{ marginRight: 10 }} />
                            <Text style={[styles.resetButtonText, { color: activeColor }]}>ZERO GAUGE (CALIBRATE)</Text>
                        </TouchableOpacity>
                        </View>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
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
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-between',
            marginBottom: 30,
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
        },
        analogCasing: {
            width: 320,
            height: 320,
            backgroundColor: '#2a2b2e',
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: '#1a1a1c',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.6,
            shadowRadius: 15,
            elevation: 10,
            position: 'relative',
        },
        screw: {
            position: 'absolute',
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#1f2022',
            borderWidth: 1,
            borderColor: '#0a0a0a',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 1, height: 1 },
            shadowOpacity: 0.8,
            shadowRadius: 2,
        },
        screwCross1: {
            position: 'absolute',
            width: 12,
            height: 2,
            backgroundColor: '#0a0a0a',
            transform: [{ rotate: '45deg' }],
        },
        screwCross2: {
            position: 'absolute',
            width: 12,
            height: 2,
            backgroundColor: '#0a0a0a',
            transform: [{ rotate: '-45deg' }],
        },
        dashboard: {
            width: '100%',
            marginTop: 40,
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            padding: 20,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#ddd',
        },
        dataRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20,
        },
        dataBlock: {
            flex: 1,
        },
        label: {
            color: isDark ? '#888' : '#666',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            fontSize: 10,
            marginBottom: 5,
            letterSpacing: 1,
        },
        valueLarge: {
            color: isDark ? '#fff' : '#000',
            fontFamily: 'monospace',
            fontSize: 24,
            fontWeight: 'bold',
        },
        unit: {
            fontSize: 14,
            color: isDark ? '#888' : '#aaa',
        },
        valueAccent: {
            color: '#e6dbae',
            fontFamily: 'monospace',
            fontSize: 24,
            fontWeight: 'bold',
        },
        unitAccent: {
            fontSize: 14,
            color: '#e6dbae',
        },
        resetButton: {
            flexDirection: 'row',
            marginTop: 10,
            padding: 15,
            backgroundColor: isDark ? '#222' : '#eee',
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: isDark ? '#444' : '#ccc',
        },
        resetButtonText: {
            fontFamily: 'monospace',
            fontWeight: 'bold',
            letterSpacing: 1,
        }
    });
}