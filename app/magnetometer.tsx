import { Magnetometer } from "expo-sensors";
import { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../src/context/ThemeContext";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Svg, { Line, Polyline, Text as SvgText, Path, G } from "react-native-svg";
import AntDesign from '@expo/vector-icons/AntDesign';

export default function Magnetomtr() {
    const { colorScheme } = useContext<any>(ThemeContext);
    const isDark: boolean = colorScheme === 'dark';
    const styles = createStyles(isDark); 

    const [data, setData] = useState<any>({ x: 0, y: 0, z: 0 });
    const [speed, setSpeed] = useState<string>('normal');
    const [highest, setHighest] = useState<number>(0);
    const [subscription, setSubscription] = useState<any>(null);

    const netFlux = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
    let angle = Math.atan2(data.y, data.x) * (180 / Math.PI) - 90;

    const isAnomaly = netFlux > 80;
    const activeColor = isAnomaly ? '#ff3333' : '#111111';

    const [history, setHistory] = useState<number[]>(new Array(50).fill(0));

    const handleSensorData = (result: { x: number, y: number, z: number }) => {
        setData(result);
        const currentFlux = Math.sqrt(result.x ** 2 + result.y ** 2 + result.z ** 2);
        setHighest(prev => Math.max(prev, currentFlux));
        setHistory(prev => [...prev.slice(1), currentFlux]);
    }

    const pointString = history.map((flux, index) => {
        const x = index * 3; 
        const clampedFlux = Math.min(Math.max(flux, 0), 120); 
        const y = 80 - (clampedFlux / 120) * 70; 
        return `${x},${y}`;
    }).join(' ');

    const _slow = () => Magnetometer.setUpdateInterval(1000);
    const _fast = () => Magnetometer.setUpdateInterval(16);

    const subscribe = () => {
        setSubscription(Magnetometer.addListener(result => { setData(result); }));
    }

    const unsubscribe = () => {
        subscription && subscription.remove();
        setSubscription(null);
    }

    useEffect(() => {
        const sub = Magnetometer.addListener(handleSensorData);
        setSubscription(sub);
        Magnetometer.setUpdateInterval(50);

        return () => sub.remove();
    }, []);

    const clampedFluxAngle = Math.min(Math.max(netFlux, 0), 120);
    const meterNeedleAngle = -50 + (clampedFluxAngle / 120) * 100;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={styles.deviceCasing}>
                    <View style={styles.lcdScreen}>
                        <View style={styles.lcdHeader}>
                            <Text style={styles.lcdSmallText}>PEAK {highest.toFixed(1)}</Text>
                            <MaterialCommunityIcons name="battery-high" size={16} color="#111" />
                        </View>
                        
                        <View style={styles.lcdMeterArea}>
                            <Svg height="80" width="260">
                                <Path d="M 30 70 Q 130 10 230 70" fill="none" stroke="#111" strokeWidth="2" />
                                
                                <Line x1="30" y1="70" x2="35" y2="60" stroke="#111" strokeWidth="2" />
                                <Line x1="130" y1="23" x2="130" y2="33" stroke="#111" strokeWidth="2" />
                                <Line x1="230" y1="70" x2="225" y2="60" stroke="#111" strokeWidth="2" />
                                
                                <SvgText x="35" y="55" fill="#111" fontSize="10" fontFamily="monospace" textAnchor="middle">0</SvgText>
                                <SvgText x="130" y="20" fill="#111" fontSize="10" fontFamily="monospace" textAnchor="middle">60</SvgText>
                                <SvgText x="225" y="55" fill="#111" fontSize="10" fontFamily="monospace" textAnchor="middle">120</SvgText>

                                <G transform={`rotate(${meterNeedleAngle}, 130, 80)`}>
                                    <Line x1="130" y1="80" x2="130" y2="20" stroke={activeColor} strokeWidth="3" />
                                    <Polyline points="126,30 130,20 134,30" fill={activeColor} />
                                </G>
                            </Svg>
                        </View>

                        <View style={styles.lcdValueArea}>
                            <Text style={[styles.lcdMainValue, { color: activeColor }]}>{netFlux.toFixed(1)}</Text>
                            <Text style={styles.lcdUnit}>µT</Text>
                        </View>
                    </View>

                    <View style={styles.brandingStrip}>
                        <MaterialCommunityIcons name="triangle" size={24} color="#7cb342" style={{ transform: [{ rotate: '90deg' }] }} />
                        <View>
                            <Text style={styles.brandTitle}>Flux Scanner®</Text>
                        </View>
                    </View>

                    <View style={styles.controlPanel}>
                        <View style={styles.dialSurround}>
                            <View style={styles.speedSelector}>
                                <TouchableOpacity 
                                    onPress={() => { _fast(); setSpeed('fast'); }}
                                    style={[styles.speedOption, speed === 'fast' && styles.speedOptionActive]}
                                >
                                    <Text style={[styles.speedText, speed === 'fast' && styles.speedTextActive]}>FAST</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => { Magnetometer.setUpdateInterval(50); setSpeed('normal'); }}
                                    style={[styles.speedOption, speed === 'normal' && styles.speedOptionActive]}
                                >
                                    <Text style={[styles.speedText, speed === 'normal' && styles.speedTextActive]}>NORM</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => { _slow(); setSpeed('slow'); }}
                                    style={[styles.speedOption, speed === 'slow' && styles.speedOptionActive]}
                                >
                                    <Text style={[styles.speedText, speed === 'slow' && styles.speedTextActive]}>SLOW</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity 
                                onPress={subscription ? unsubscribe : subscribe} 
                                style={[styles.mainDialButton, !subscription && styles.mainDialButtonOff]}
                            >
                                <View style={styles.dialIndentation}>
                                    <Text style={styles.dialText}>
                                        {subscription ? 'ON' : 'OFF'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.sideBySideContainer}>
                    <View style={styles.radarCard}>
                        <View style={styles.radarContainer}>
                            <View style={[styles.radarRing, { borderColor: '#888', opacity: 0.3 }]} />
                            <View style={[styles.radarRing, { width: 80, height: 80, borderColor: '#888', opacity: 0.5 }]} />
                            
                            <View style={[styles.needleContainer, { transform: [{ rotate: `${angle}deg` }] }]}>
                                <View style={[styles.needle, { borderBottomColor: isAnomaly ? '#ff3333' : '#00ffcc' }]} />
                            </View>

                            <View style={[styles.centerHub, { backgroundColor: isAnomaly ? '#ff3333' : '#00ffcc' }]} />
                        </View>
                    </View>

                    <View style={styles.graphCard}>
                        <View style={styles.graphHeader}>
                            <Text style={styles.graphLabel}>HISTORY</Text>
                            <TouchableOpacity onPress={() => { setHighest(0) }}>
                                <AntDesign name="redo" size={12} color={isDark ? '#aaa' : '#555'} />
                            </TouchableOpacity>
                        </View>
                        
                        <Svg height="80" width="150">
                            <Line x1="0" y1="10" x2="150" y2="10" stroke={isDark ? "#444" : "#ccc"} strokeWidth="1" />
                            <SvgText x="2" y="20" fill={isDark ? "#666" : "#999"} fontSize="8" fontFamily="monospace">120 µT</SvgText>
                            
                            <Line x1="0" y1="45" x2="150" y2="45" stroke={isDark ? "#444" : "#ccc"} strokeWidth="1" strokeDasharray="3,3" />
                            
                            <Line x1="0" y1="79" x2="150" y2="79" stroke={isDark ? "#444" : "#ccc"} strokeWidth="1" />
                            <SvgText x="2" y="75" fill={isDark ? "#666" : "#999"} fontSize="8" fontFamily="monospace">0 µT</SvgText>
                            
                            <Polyline
                                points={pointString}
                                fill="none"
                                stroke={isAnomaly ? '#ff3333' : '#00ffcc'}
                                strokeWidth="2"
                            />
                        </Svg>
                    </View>
                </View>

                <View style={styles.dashboard}>
                    <View style={styles.axisGrid}>
                        <View style={styles.axisItem}>
                            <Text style={styles.axisLabel}>X-AXIS</Text>
                            <Text style={styles.axisValue}>{data.x.toFixed(2)}</Text>
                        </View>
                        <View style={styles.axisItem}>
                            <Text style={styles.axisLabel}>Y-AXIS</Text>
                            <Text style={styles.axisValue}>{data.y.toFixed(2)}</Text>
                        </View>
                        <View style={styles.axisItem}>
                            <Text style={styles.axisLabel}>Z-AXIS</Text>
                            <Text style={styles.axisValue}>{data.z.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    )
}

function createStyles(isDark: boolean) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#121212' : '#e0e0e0',
        },
        scrollContent: {
            flexGrow: 1,
            alignItems: 'center',
            padding: 20,
            paddingBottom: 40,
        },
        deviceCasing: {
            width: 320,
            backgroundColor: '#1f2022',
            borderRadius: 12,
            borderWidth: 2,
            borderColor: '#111',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 15 },
            shadowOpacity: 0.6,
            shadowRadius: 20,
            elevation: 15,
            overflow: 'hidden',
            marginBottom: 20,
            
        },
        lcdScreen: {
            width: 280,
            height: 250,
            backgroundColor: '#c4d4c4',
            alignSelf: 'center',
            marginTop: 20,
            borderRadius: 4,
            borderWidth: 3,
            borderColor: '#111',
            borderTopColor: '#333',
            borderLeftColor: '#333',
            padding: 10,
        },
        lcdHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        lcdSmallText: {
            fontFamily: 'monospace',
            fontSize: 10,
            color: '#111',
            fontWeight: 'bold',
        },
        lcdMeterArea: {
            alignItems: 'center',
            marginTop: 10,
            height: 80,
        },
        lcdValueArea: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'baseline',
            marginTop: 5,
        },
        lcdMainValue: {
            fontFamily: 'monospace',
            fontSize: 48,
            fontWeight: 'bold',
            letterSpacing: -2,
        },
        lcdUnit: {
            fontFamily: 'monospace',
            fontSize: 14,
            color: '#111',
            marginLeft: 5,
            fontWeight: 'bold',
        },
        brandingStrip: {
            flexDirection: 'row',
            backgroundColor: '#f5f5f5',
            paddingVertical: 8,
            paddingHorizontal: 20,
            alignItems: 'center',
            marginTop: 20,
            borderTopWidth: 2,
            borderBottomWidth: 2,
            borderColor: '#111',
        },
        brandTitle: {
            fontFamily: 'monospace',
            fontSize: 20,
            fontWeight: 'bold',
            color: '#1a4e8a',
            marginLeft: 10,
            letterSpacing: 1,
        },
        brandSubtitle: {
            fontFamily: 'monospace',
            fontSize: 10,
            color: '#333',
            marginLeft: 10,
        },
        controlPanel: {
            backgroundColor: '#e6e6e6',
            padding: 20,
            alignItems: 'center',
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
        },
        dialSurround: {
            width: 200,
            alignItems: 'center',
        },
        speedSelector: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: 20,
            paddingHorizontal: 10,
        },
        speedOption: {
            paddingVertical: 5,
            paddingHorizontal: 10,
            backgroundColor: '#ccc',
            borderRadius: 4,
            borderWidth: 1,
            borderColor: '#999',
        },
        speedOptionActive: {
            backgroundColor: '#1a4e8a',
            borderColor: '#111',
        },
        speedText: {
            fontFamily: 'monospace',
            fontSize: 10,
            color: '#555',
            fontWeight: 'bold',
        },
        speedTextActive: {
            color: '#fff',
        },
        mainDialButton: {
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: '#222',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 4,
            borderColor: '#111',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 5,
            elevation: 8,
        },
        mainDialButtonOff: {
            transform: [{ rotate: '-45deg' }],
        },
        dialIndentation: {
            width: 80,
            height: 20,
            backgroundColor: '#111',
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
        },
        dialText: {
            color: '#aaa',
            fontFamily: 'monospace',
            fontSize: 10,
            fontWeight: 'bold',
        },
        madeInText: {
            fontFamily: 'monospace',
            fontSize: 8,
            color: '#666',
            marginTop: 20,
        },
        sideBySideContainer: {
            flexDirection: 'row',
            width: 320,
            justifyContent: 'space-between',
            marginBottom: 20,
        },
        radarCard: {
            width: 155,
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#ddd',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
        },
        radarContainer: {
            width: 130,
            height: 130,
            justifyContent: 'center',
            alignItems: 'center',
        },
        radarRing: {
            position: 'absolute',
            width: 130,
            height: 130,
            borderRadius: 65,
            borderWidth: 1,
            borderStyle: 'dashed',
        },
        needleContainer: {
            position: 'absolute',
            width: 4,
            height: 130,
            alignItems: 'center',
            justifyContent: 'flex-start',
        },
        needle: {
            width: 0,
            height: 0,
            borderLeftWidth: 6,
            borderRightWidth: 6,
            borderBottomWidth: 60,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
        },
        centerHub: {
            width: 12,
            height: 12,
            borderRadius: 6,
            position: 'absolute',
            borderWidth: 2,
            borderColor: isDark ? '#1a1a1a' : '#fff',
        },
        graphCard: {
            width: 155,
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#ddd',
            padding: 10,
        },
        graphHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 5,
        },
        graphLabel: {
            color: isDark ? '#666' : '#999',
            fontSize: 10,
            fontFamily: 'monospace',
            fontWeight: 'bold',
        },
        dashboard: {
            width: 320,
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            padding: 15,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#ddd',
            alignItems: 'center',
        },
        axisGrid: {
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-around',
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
            fontSize: 14,
        }
    });
}