import { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../src/context/ThemeContext';
import Svg, { Line, Polyline, Text as SvgText } from "react-native-svg";
import AntDesign from '@expo/vector-icons/AntDesign';
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
} from 'expo-audio';

export default function DbMeter() {
    const { colorScheme } = useContext<any>(ThemeContext);
    const isDark = colorScheme === 'dark';
    const styles = createStyles(isDark);

    const audioRecorder = useAudioRecorder({
        ...RecordingPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
    });
    
    const recorderState = useAudioRecorderState(audioRecorder);

    const [history, setHistory] = useState<number[]>(new Array(50).fill(0));
    const [highest, setHighest] = useState<number>(0);

    const rawDBFS = recorderState.metering ?? -160;
    const currentDB = Math.max(0, rawDBFS + 100);

    useEffect(() => {
        if (recorderState.isRecording) {
            setHighest(prev => Math.max(prev, currentDB));
            setHistory(prev => [...prev.slice(1), currentDB]);
        }
    }, [recorderState.metering, recorderState.isRecording]);

    useEffect(() => {
        (async () => {
            const status = await AudioModule.requestRecordingPermissionsAsync();
            if (!status.granted) {
                alert('Permission to access microphone was denied');
                return;
            }

            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: true,
            });
        })();
    }, []);

    const toggleRecording = async () => {
        if (recorderState.isRecording) {
            await audioRecorder.stop();
        } else {
            await audioRecorder.prepareToRecordAsync();
            audioRecorder.record();
        }
    };

    const pointString = history.map((db, index) => {
        const x = index * 6; 
        const clampedDB = Math.min(Math.max(db, 0), 120); 
        const y = 100 - (clampedDB / 120) * 90; 
        return `${x},${y}`;
    }).join(' ');

    const activeColor = currentDB > 90 ? '#ff3366' : (currentDB > 70 ? '#ff9900' : '#00ffcc');

    // Generate 40 LED blocks for the VU Meter (120dB max / 40 blocks = 3dB per block)
    const TOTAL_SEGMENTS = 40;
    const vuSegments = Array.from({ length: TOTAL_SEGMENTS });

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                <View style={styles.header}>
                    <Text style={styles.title}>ACOUSTIC DECIBEL METER</Text>
                    <View style={[styles.statusDot, { backgroundColor: recorderState.isRecording ? '#ff3366' : '#555' }]} />
                </View>

                {/* Main Readout Row: VU Meter + Text */}
                <View style={styles.readoutRow}>
                    
                    {/* The LED Level Bar */}
                    <View style={styles.vuMeter}>
                        {vuSegments.map((_, i) => {
                            // Calculate top-to-bottom threshold (120 down to 3)
                            const threshold = 120 - (i * (120 / TOTAL_SEGMENTS)); 
                            const isActive = currentDB >= threshold;
                            
                            let segColor = '#00ffcc'; // Default Cyan
                            if (threshold > 90) segColor = '#ff3366'; // Red Damage
                            else if (threshold > 70) segColor = '#ff9900'; // Amber Loud

                            return (
                                <View key={i} style={[styles.vuSegment, {
                                    backgroundColor: isActive ? segColor : (isDark ? '#222' : '#e0e0e0'),
                                    shadowColor: isActive ? segColor : 'transparent',
                                    shadowOpacity: isActive ? 0.8 : 0,
                                }]} />
                            );
                        })}
                    </View>

                    {/* Numeric Data */}
                    <View style={styles.textReadout}>
                        
                        <Text style={[styles.dbValue, { color: activeColor }]}>
                            {currentDB.toFixed(1)}
                        </Text>
                        <Text style={styles.unit}>dB SPL</Text>
                        
                        <Text style={[styles.warningText, { opacity: currentDB > 90 ? 1 : 0 }]}>
                            ⚠️ DANGER
                        </Text>
                    </View>
                </View>

                {/* Oscilloscope Graph */}
                <View style={styles.graphContainer}>
                    <View style={styles.graphHeader}>
                        <Text style={styles.graphLabel}>AUDIO WAVEFORM</Text>
                        <View style={{flexDirection:'row', gap: 10}}>
                            <Text style={styles.graphLabel}>PEAK: {highest.toFixed(3)} dB</Text>
                        <TouchableOpacity onPress={() => setHighest(0)}>
                            <AntDesign name="redo" size={16} color={isDark ? '#fff' : '#000'} />
                        </TouchableOpacity>
                        </View>
                    </View>
                    
                    <Svg height="100" width="300">
                        <Line x1="0" y1="10" x2="300" y2="10" stroke="#ff3366" strokeWidth="1" strokeDasharray="3,3" />
                        <SvgText x="5" y="22" fill="#ff3366" fontSize="9" fontFamily="monospace" fontWeight="bold">
                            120 dB (PAIN)
                        </SvgText>

                        <Line x1="0" y1="36" x2="300" y2="36" stroke="#ff9900" strokeWidth="1" strokeDasharray="3,3" />
                        <SvgText x="5" y="48" fill="#ff9900" fontSize="9" fontFamily="monospace" fontWeight="bold">
                            85 dB (WARNING)
                        </SvgText>

                        <Line x1="0" y1="99" x2="300" y2="99" stroke={isDark ? "#333" : "#ddd"} strokeWidth="1" />
                        <SvgText x="5" y="95" fill={isDark ? "#666" : "#999"} fontSize="9" fontFamily="monospace" fontWeight="bold">
                            0 dB
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
                    onPress={toggleRecording} 
                    style={[styles.powerButton, { borderColor: recorderState.isRecording ? '#ff3366' : activeColor }]}
                >
                    <Text style={[styles.powerText, { color: recorderState.isRecording ? '#ff3366' : activeColor }]}>
                        {recorderState.isRecording ? 'DISENGAGE SENSOR' : 'ENGAGE SENSOR'}
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
            backgroundColor: isDark ? '#121212' : '#f5f5f5'
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
        readoutRow: {
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 40,
            gap: 40,
        },
        vuMeter: {
            height: 200,
            justifyContent: 'space-between',
            width: 40,
            backgroundColor: isDark ? '#1a1a1a' : '#fff',
            paddingVertical: 5,
            paddingHorizontal: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#ddd',
        },
        vuSegment: {
            height: 3,
            width: '100%',
            borderRadius: 1,
            shadowRadius: 3,
            shadowOffset: { width: 0, height: 0 },
        },
        textReadout: {
            alignItems: 'flex-start',
            justifyContent: 'center',
            height: 200,
        },
        label: {
            color: isDark ? '#888' : '#666',
            fontSize: 12,
            fontWeight: 'bold',
            letterSpacing: 1,
        },
        dbValue: {
            fontFamily: 'monospace',
            fontSize: 72,
            fontWeight: 'bold',
            marginVertical: -5,
            marginLeft: -3,
        },
        unit: {
            fontSize: 20,
            color: isDark ? '#666' : '#888',
            fontFamily: 'monospace',
            fontWeight: 'bold',
        },
        warningText: {
            color: '#ff3366',
            fontFamily: 'monospace',
            fontSize: 14,
            fontWeight: 'bold',
            marginTop: 20,
            letterSpacing: 2,
        },
        graphContainer: {
            width: '100%',
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            padding: 15,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#ddd',
            alignItems: 'center',
            marginTop: 10,
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