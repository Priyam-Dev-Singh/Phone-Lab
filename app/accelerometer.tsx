import { useEffect, useState, useContext } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Accelerometer } from 'expo-sensors';
import Svg, { Line, Polyline, Text as SvgText } from 'react-native-svg';
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
    const dotX = data.x * 100;
    const dotY = -data.y * 100;
    const dotScale = Math.max(0.5, Math.abs(data.z)); 

    const activeColor = '#ff3366';

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
        const x = index * 6;
        const clampedG = Math.min(Math.max(g, 0), 3);
        const y = 100 - (clampedG / 3) * 90;
        return `${x},${y}`;
    }).join(' ');

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={styles.header}>
                    <Text style={styles.title}>KINEMATICS (ACCELEROMETER)</Text>
                    <View style={[styles.statusDot, { backgroundColor: subscription ? activeColor : (isDark ? '#555' : '#ccc') }]} />
                </View>

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

                <View style={styles.dashboard}>
                    <Text style={styles.label}>NET ACCELERATION</Text>
                    <Text style={[styles.mainValue, { color: activeColor }]}>
                        {(netG * 9.81).toFixed(2)} <Text style={styles.unit}>m/s²</Text>
                    </Text>

                    <View style={styles.axisGrid}>
                        <View style={styles.axisItem}>
                            <Text style={styles.axisLabel}>X-AXIS</Text>
                            <Text style={styles.axisValue}>{(data.x * 9.81).toFixed(2)}</Text>
                        </View>
                        <View style={styles.axisItem}>
                            <Text style={styles.axisLabel}>Y-AXIS</Text>
                            <Text style={styles.axisValue}>{(data.y * 9.81).toFixed(2)}</Text>
                        </View>
                        <View style={styles.axisItem}>
                            <Text style={styles.axisLabel}>Z-AXIS</Text>
                            <Text style={styles.axisValue}>{(data.z * 9.81).toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.graphContainer}>
                    <View style={styles.graphHeader}>
                        <Text style={styles.graphLabel}>ROLLING INTENSITY (T-5s)</Text>
                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Text style={[styles.graphLabel, { color: activeColor }]}>
                                PEAK: {(peakValue * 9.81).toFixed(1)} m/s²
                            </Text>
                            <TouchableOpacity onPress={() => setPeakValue(0)}>
                                <AntDesign name="redo" size={16} color={activeColor} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Svg height="100" width="300">
                        <Line x1="0" y1="10" x2="300" y2="10" stroke={isDark ? "#333" : "#ddd"} strokeWidth="1" />
                        <SvgText x="5" y="22" fill={isDark ? "#666" : "#999"} fontSize="9" fontFamily="monospace" fontWeight="bold">
                            ~3G (MAX)
                        </SvgText>

                        <Line x1="0" y1="70" x2="300" y2="70" stroke={isDark ? "#333" : "#ddd"} strokeWidth="1" strokeDasharray="3,3" />
                        <SvgText x="5" y="66" fill={isDark ? "#666" : "#999"} fontSize="9" fontFamily="monospace" fontWeight="bold">
                            1G (RESTING)
                        </SvgText>

                        <Polyline
                            points={pointString}
                            fill="none"
                            stroke={activeColor}
                            strokeWidth="2"
                        />
                    </Svg>
                </View>

                <TouchableOpacity 
                    onPress={subscription ? unsubscribe : subscribe} 
                    style={[styles.powerButton, { borderColor: subscription ? activeColor : (isDark ? '#333' : '#ccc') }]}
                >
                    <Text style={[styles.powerText, { color: subscription ? activeColor : (isDark ? '#888' : '#666') }]}>
                        {subscription ? 'DISENGAGE SENSOR' : 'ENGAGE SENSOR'}
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
            backgroundColor: isDark ? '#121212' : '#f5f5f5',
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
        },
        speedControls: {
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'flex-end',
            paddingRight: 10,
            marginTop: 10,
            marginBottom: -20,
            zIndex: 10,
        },
        radarContainer: {
            width: 250,
            height: 250,
            borderRadius: 125,
            borderWidth: 2,
            borderColor: isDark ? '#333' : '#ccc',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            overflow: 'hidden',
            marginVertical: 40,
        },
        crosshairH: {
            position: 'absolute',
            width: '100%',
            height: 1,
            backgroundColor: isDark ? '#333' : '#eee',
        },
        crosshairV: {
            position: 'absolute',
            width: 1,
            height: '100%',
            backgroundColor: isDark ? '#333' : '#eee',
        },
        dot: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#ff3366',
            position: 'absolute',
            shadowColor: '#ff3366',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            elevation: 5,
        },
        dashboard: {
            width: '100%',
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            padding: 20,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#ddd',
            alignItems: 'center',
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
        }
    });
}