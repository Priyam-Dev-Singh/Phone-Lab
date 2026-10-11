
import { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform, ScrollView } from 'react-native';
import { LightSensor } from 'expo-sensors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../src/context/ThemeContext';
import Svg, { Line, Polyline, Text as SvgText } from 'react-native-svg';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function LightSnsr() {

  const {colorScheme} = useContext(ThemeContext);
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);
  const [history, setHistory] = useState<number[]>(new Array(50).fill(0));
  const [highest, setHighest] = useState<number>(0);

  const [{ illuminance }, setData] = useState({ illuminance: 0 });
  const [subscription, setSubscription] = useState<any>(null);

  const handleSensorData = (sensorData :{illuminance: number})=>{
    setData(sensorData);
    const currentLux = Math.max(sensorData.illuminance,0);
    setHighest(prev => Math.max(prev, currentLux));
    setHistory(prev => [...prev.slice(1), currentLux]);
  }

  const subscribe = () => {
    setSubscription(
      LightSensor.addListener(handleSensorData)
    );
  };

  const unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  const toggle = subscription ? unsubscribe : subscribe;


  useEffect(() => {
    LightSensor.setUpdateInterval(50);
    const sub = LightSensor.addListener(handleSensorData);
    setSubscription(sub);
    return () => sub.remove();
  }, []);

  const safeLux = Math.max(illuminance, 0);
  const normalisedLight = Math.min(Math.log10(safeLux+1) / 4.5,1);

  const coreScale = 1 + (normalisedLight *2);
  const glowOpacity = 0.1 + (normalisedLight * 0.9);

  const pointString = history.map((lux, index)=>{
    const x = index * 6;
    const clampedLux = Math.min(Math.max(lux,0), 1000);
    const y= 100-(clampedLux/1000)*90;
    return `${x},${y}`;

  }).join(' ');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#121212':'#f5f5f5'}}>
            <View style={[styles.header, {alignItems:'center', justifyContent:'center'}]}>
                <Text style={styles.title}>PHOTOMETER (LIGHT SENSOR)</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.visualizerContainer}>
                {Platform.OS === 'ios' ? (
                    <Text style={styles.iosWarning}>SENSOR NOT EXPOSED ON IOS</Text>
                ) : (
                    <View style={styles.glowWrapper}>
                        <View style={[styles.gridBackground, { opacity: glowOpacity * 0.5 }]} />
                        
                        <View style={[
                            styles.outerGlow, 
                            { 
                                transform: [{ scale: coreScale * 1.5 }],
                                opacity: glowOpacity * 0.3 
                            }
                        ]} />
                        
                        <View style={[
                            styles.midGlow, 
                            { 
                                transform: [{ scale: coreScale * 1.2 }],
                                opacity: glowOpacity * 0.6 
                            }
                        ]} />
                        
                        <View style={[
                            styles.coreLight, 
                            { 
                                transform: [{ scale: coreScale }],
                                opacity: glowOpacity,
                                shadowOpacity: glowOpacity,
                            }
                        ]} />
                    </View>
                )}
            </View>

            <View style={styles.dashboard}>
                <Text style={styles.label}>AMBIENT ILLUMINANCE</Text>
                <Text style={styles.luxValue}>
                    {Platform.OS === 'android' ? safeLux.toFixed(3) : '0.0'} <Text style={styles.unit}>lx</Text>
                </Text>

                <View style={styles.meterBarContainer}>
                    <View style={[styles.meterBarFill, { width: `${normalisedLight * 100}%` }]} />
                </View>
                <View style={styles.meterLabels}>
                    <Text style={styles.meterLabelText}>PITCH BLACK</Text>
                    <Text style={styles.meterLabelText}>DIRECT SUN</Text>
                </View>
            </View>

            <View style={styles.graphContainer}>
                    <View style={styles.graphHeader}>
                        <Text style={styles.graphLabel}>ILLUMINANCE HISTORY</Text>
                        <View style={{flexDirection:'row', gap: 10, alignItems: 'center'}}>
                            <Text style={styles.graphLabel}>Peak: {highest.toFixed(1)} lx</Text>
                            <TouchableOpacity onPress={() => setHighest(0)}>
                                <AntDesign name="redo" size={16} color={isDark ? '#fff' : '#000'} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <Svg height="100" width="300">
                        {/* Upper Bound (1000 lx) */}
                        <Line x1="0" y1="10" x2="300" y2="10" stroke={isDark ? "#333" : "#ddd"} strokeWidth="1" />
                        <SvgText x="5" y="22" fill={isDark ? "#666" : "#999"} fontSize="9" fontFamily="monospace" fontWeight="bold">
                            1000 lx (INDOOR MAX)
                        </SvgText>

                        {/* Mid Threshold Line (500 lx) */}
                        <Line x1="0" y1="55" x2="300" y2="55" stroke={isDark ? "#444" : "#ccc"} strokeWidth="1" strokeDasharray="5,5" />
                        <SvgText x="5" y="51" fill={isDark ? "#666" : "#999"} fontSize="9" fontFamily="monospace" fontWeight="bold">
                            500 lx (OFFICE)
                        </SvgText>

                        {/* Lower Bound (0 lx) */}
                        <Line x1="0" y1="99" x2="300" y2="99" stroke={isDark ? "#333" : "#ddd"} strokeWidth="1" />
                        <SvgText x="5" y="95" fill={isDark ? "#666" : "#999"} fontSize="9" fontFamily="monospace" fontWeight="bold">
                            0 lx
                        </SvgText>

                        <Polyline
                            points={pointString}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="2"
                        />
                    </Svg>
                </View>

            <TouchableOpacity 
                onPress={toggle} 
                style={styles.powerButton}
            >
                <Text style={styles.powerText}>
                    {subscription ? 'DISENGAGE SENSOR' : 'ENGAGE SENSOR'}
                </Text>

            </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
  );
}

function createStyles(isDark: boolean) {
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
        },
        visualizerContainer: {
            width: 300,
            height: 300,
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 40,
            overflow: 'hidden',
            borderRadius: 150,
            backgroundColor: isDark ? '#050505' : '#e0e0e0',
            borderWidth: 1,
            borderColor: isDark ? '#222' : '#ccc',
        },
        iosWarning: {
            color: '#ff3366',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            textAlign: 'center',
            padding: 20,
        },
        glowWrapper: {
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
        },
        gridBackground: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderWidth: 1,
            borderColor: '#fff',
            borderStyle: 'dashed',
            borderRadius: 150,
        },
        outerGlow: {
            position: 'absolute',
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: '#ffffff',
            filter: 'blur(20px)',
        },
        midGlow: {
            position: 'absolute',
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#ffffff',
            filter: 'blur(10px)',
        },
        coreLight: {
            position: 'absolute',
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#ffffff',
            shadowColor: '#ffffff',
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 0 },
        },
        dashboard: {
            width: '100%',
            backgroundColor: isDark ? '#151515' : '#ffffff',
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
        luxValue: {
            color: isDark ? '#ffffff' : '#000000',
            fontFamily: 'monospace',
            fontSize: 48,
            fontWeight: 'bold',
            marginVertical: 10,
        },
        unit: {
            fontSize: 20,
            color: isDark ? '#666' : '#888',
        },
        meterBarContainer: {
            width: '100%',
            height: 4,
            backgroundColor: isDark ? '#333' : '#eee',
            borderRadius: 2,
            marginTop: 20,
            overflow: 'hidden',
        },
        meterBarFill: {
            height: '100%',
            backgroundColor: '#ffffff',
        },
        meterLabels: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            marginTop: 8,
        },
        meterLabelText: {
            color: '#666',
            fontFamily: 'monospace',
            fontSize: 9,
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
            alignItems: 'center',
            marginBottom: 10,
        },
        graphLabel: {
            color: isDark ? '#888' : '#666',
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
            borderColor: isDark ? '#ffffff' : '#000000',
            backgroundColor: isDark ? '#111' : '#fff',
        },
        powerText: {
            color: isDark ? '#ffffff' : '#000000',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            letterSpacing: 1,
        },
    });
}
