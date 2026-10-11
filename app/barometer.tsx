import { useContext, useEffect, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeContext } from "../src/context/ThemeContext";
import { Barometer } from "expo-sensors";
import { useRouter } from "expo-router";

export default function Baromtr() {
    const router = useRouter();

    const { colorScheme } = useContext<any>(ThemeContext);
    const isDark = colorScheme === 'dark';

    const [data, setData] = useState({ pressure: 0, relativeAltitude: 0 });
    const [subscription, setSubcription] = useState<any>(null);
    const [baseline, setBaseline] = useState<number | null>(null);

    const checkAvailability = async () => {
        const isAvailable = await Barometer.isAvailableAsync();
        if (!isAvailable) {
            alert("No Barometer sensor found on this device!");
            //router.back();
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
            Barometer.setUpdateInterval(200);
        };

        loadData();

        return () => {
            if (sub) sub.remove();
        };
    }, []);

    // Physics Math
    const altitudeMeters = baseline ? (baseline - data.pressure) * 8.3 : 0;
    const floorsTraveled = altitudeMeters / 3;

    // Visual Math (1 meter = 10 pixels of screen movement)
    const indicatorY = -altitudeMeters * 10;

    return (
        <SafeAreaProvider>
            <View style={styles.container}>
                
                {/* LEFT SIDE: The Vertical Elevator Track */}
                <View style={styles.trackContainer}>
                    <View style={styles.rail} />
                    <View style={styles.zeroMarker} />
                    
                    {/* The dynamic moving block */}
                    <View style={[styles.indicatorBlock, { transform: [{ translateY: indicatorY }] }]}>
                        <View style={styles.laserLine} />
                    </View>
                </View>

                {/* RIGHT SIDE: The Data Dashboard */}
                <View style={styles.dashboard}>
                    
                    <Text style={styles.label}>ABSOLUTE PRESSURE</Text>
                    <Text style={styles.valueLarge}>
                        {data.pressure.toFixed(2)} <Text style={styles.unit}>hPa</Text>
                    </Text>

                    <Text style={[styles.label, { marginTop: 20 }]}>ELEVATION SHIFT</Text>
                    <Text style={styles.valueAccent}>
                        {altitudeMeters > 0 ? '+' : ''}{altitudeMeters.toFixed(1)} <Text style={styles.unitAccent}>m</Text>
                    </Text>

                    {/* Floor Counter */}
                    <View style={styles.floorCard}>
                        <Text style={styles.label}>ESTIMATED FLOORS</Text>
                        <Text style={styles.floorValue}>
                            {floorsTraveled.toFixed(1)}
                        </Text>
                    </View>

                    {/* Zero Gauge Button */}
                    <TouchableOpacity 
                        onPress={() => setBaseline(data.pressure)}
                        style={styles.resetButton}
                    >
                        <Text style={styles.resetButtonText}>ZERO GAUGE</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </SafeAreaProvider>
    );
}

// React Native standard: Define styles statically outside the component 
// to prevent recreating the object on every frame render.
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
    },
    // Track UI
    trackContainer: {
        width: 60,
        height: '80%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rail: {
        position: 'absolute',
        width: 4,
        height: '100%',
        backgroundColor: '#333',
        borderRadius: 2,
    },
    zeroMarker: {
        position: 'absolute',
        width: 30,
        height: 2,
        backgroundColor: '#00ffcc',
        opacity: 0.5,
    },
    indicatorBlock: {
        width: 40,
        height: 20,
        backgroundColor: '#00ffcc',
        borderRadius: 4,
        shadowColor: '#00ffcc',
        shadowOpacity: 1,
        shadowRadius: 10,
    },
    laserLine: {
        width: '100%',
        height: 2,
        backgroundColor: '#fff',
        marginTop: 9,
    },
    // Dashboard UI
    dashboard: {
        flex: 1,
        paddingLeft: 30,
        justifyContent: 'center',
    },
    label: {
        color: '#888',
        fontWeight: 'bold',
        fontSize: 12,
        marginBottom: 5,
    },
    valueLarge: {
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: 28,
    },
    unit: {
        fontSize: 16,
        color: '#aaa',
    },
    valueAccent: {
        color: '#00ffcc',
        fontFamily: 'monospace',
        fontSize: 40,
        fontWeight: 'bold',
    },
    unitAccent: {
        fontSize: 18,
        color: '#00ffcc',
    },
    floorCard: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    floorValue: {
        color: '#fff',
        fontSize: 24,
        fontFamily: 'monospace',
        marginTop: 5,
    },
    resetButton: {
        marginTop: 40,
        padding: 15,
        backgroundColor: '#222',
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444',
    },
    resetButtonText: {
        color: '#00ffcc',
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});