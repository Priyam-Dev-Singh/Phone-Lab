import { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../src/context/ThemeContext';
import Svg, { Line, Polyline, Text as SvgText, Path, Rect, Circle } from "react-native-svg";
import AntDesign from '@expo/vector-icons/AntDesign';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

    const [history, setHistory] = useState<number[]>(new Array(40).fill(40));
    const [highest, setHighest] = useState<number>(0);
    const [lowest, setLowest] = useState<number>(130);

    const rawDBFS = recorderState.metering ?? -160;
    const currentDB = Math.max(0, rawDBFS + 100);

    useEffect(() => {
        if (recorderState.isRecording && currentDB > 0) {
            setHighest(prev => Math.max(prev, currentDB));
            setLowest(prev => prev === 130 ? currentDB : Math.min(prev, currentDB));
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
            setHighest(0);
            setLowest(130);
            setHistory(new Array(40).fill(40));
            await audioRecorder.prepareToRecordAsync();
            audioRecorder.record();
        }
    };

    // Graph mapping (40dB to 130dB range for the inner LCD graph)
    const pointString = history.map((db, index) => {
        const x = index * 6; // 40 points * 6 = 240px width
        const clampedDB = Math.max(40, Math.min(db, 130)); 
        const y = 60 - ((clampedDB - 40) / 90) * 60; // 60px height
        return `${x},${y}`;
    }).join(' ');

    const dateStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={styles.hardwareCasing}>
                    
                    {/* Microphone Wind Muff */}
                    <View style={styles.micMuffContainer}>
                        <View style={styles.micMuff} />
                        <View style={styles.micNeck} />
                    </View>

                    {/* Main Device Body */}
                    <View style={styles.deviceBody}>
                        
                        {/* Status LED */}
                        <View style={[styles.ledIndicator, { backgroundColor: recorderState.isRecording ? '#00ff00' : '#333' }]} />

                        {/* LCD Screen */}
                        <View style={styles.lcdScreen}>
                            <View style={styles.lcdTopBar}>
                                <Text style={styles.lcdSmallText}>{dateStr}  {timeStr}</Text>
                                <MaterialCommunityIcons name="battery-high" size={14} color="#111" />
                            </View>

                            <View style={styles.lcdGaugeArea}>
                                <Text style={styles.lcdSmallText}>30</Text>
                                <View style={styles.gaugeCenter}>
                                    <Svg height="30" width="160">
                                        <Path d="M 10 25 Q 80 -5 150 25" fill="none" stroke="#8cb4d6" strokeWidth="4" />
                                        <Path d={`M 10 25 Q ${10 + (currentDB/130)*70} ${25 - (currentDB/130)*30} ${10 + (currentDB/130)*140} ${25 - Math.sin(currentDB/130)*20}`} fill="none" stroke="#0a599c" strokeWidth="6" strokeLinecap="round" />
                                    </Svg>
                                    <Text style={[styles.lcdSmallText, { position: 'absolute', bottom: 0 }]}>Fast</Text>
                                </View>
                                <Text style={styles.lcdSmallText}>130</Text>
                            </View>

                            <View style={styles.lcdMainDisplay}>
                                <Text style={styles.lcdMainValue}>
                                    {recorderState.isRecording ? currentDB.toFixed(1) : "00.0"}
                                </Text>
                                <View style={styles.lcdUnits}>
                                    <Text style={styles.lcdUnitText}>C</Text>
                                    <Text style={styles.lcdUnitText}>dB</Text>
                                </View>
                            </View>

                            <View style={styles.lcdMinMax}>
                                <Text style={styles.lcdSmallText}>max:{highest.toFixed(1)}</Text>
                                <Text style={styles.lcdSmallText}>min:{lowest === 130 && highest === 0 ? "0.0" : lowest.toFixed(1)}</Text>
                            </View>

                            {/* Inner LCD Graph */}
                            <View style={styles.lcdGraphContainer}>
                                <Svg height="60" width="240">
                                    <Rect x="0" y="0" width="240" height="60" fill="#e9eed0" />
                                    {/* Grid Lines */}
                                    <Line x1="0" y1="15" x2="240" y2="15" stroke="#ffe066" strokeWidth="2" />
                                    <Line x1="0" y1="30" x2="240" y2="30" stroke="#d5dbb8" strokeWidth="1" />
                                    <Line x1="0" y1="45" x2="240" y2="45" stroke="#d5dbb8" strokeWidth="1" />
                                    
                                    <Polyline
                                        points={pointString}
                                        fill="none"
                                        stroke="#e84118"
                                        strokeWidth="1.5"
                                    />
                                    {history.map((db, i) => {
                                        if (db <= 40) return null;
                                        const cx = i * 6;
                                        const clampedDB = Math.max(40, Math.min(db, 130));
                                        const cy = 60 - ((clampedDB - 40) / 90) * 60;
                                        return <Circle key={i} cx={cx} cy={cy} r="1.5" fill="#e84118" />;
                                    })}
                                </Svg>
                                <View style={styles.graphYAxis}>
                                    <Text style={styles.graphAxisText}>120.0</Text>
                                    <Text style={styles.graphAxisText}>100.0</Text>
                                    <Text style={styles.graphAxisText}>80.0</Text>
                                    <Text style={styles.graphAxisText}>60.0</Text>
                                    <Text style={styles.graphAxisText}>40.0</Text>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.brandText}>Digital Sound Level Meter</Text>

                        {/* D-Pad Controls */}
                        <View style={styles.dPadContainer}>
                            <View style={styles.dPadRow}>
                                <MaterialCommunityIcons name="menu-up" size={32} color="#ddd" />
                            </View>
                            <View style={styles.dPadMiddleRow}>
                                <MaterialCommunityIcons name="menu-left" size={32} color="#ddd" />
                                
                                <TouchableOpacity 
                                    onPress={toggleRecording} 
                                    style={styles.powerButton}
                                    activeOpacity={0.7}
                                >
                                    <MaterialCommunityIcons name="power" size={24} color="#fff" />
                                    <Text style={styles.powerBtnText}>ENTER</Text>
                                </TouchableOpacity>

                                <MaterialCommunityIcons name="menu-right" size={32} color="#ddd" />
                            </View>
                            <View style={styles.dPadRow}>
                                <MaterialCommunityIcons name="menu-down" size={32} color="#ddd" />
                            </View>
                        </View>

                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

function createStyles(isDark: boolean) {
    return StyleSheet.create({
        container: {
            flex: 1, 
            backgroundColor: isDark ? '#121212' : '#d9d9d9'
        },
        scrollContent: {
            flexGrow: 1,
            alignItems: 'center',
            padding: 20,
            paddingBottom: 40,
        },
        hardwareCasing: {
            alignItems: 'center',
        },
        micMuffContainer: {
            alignItems: 'center',
            zIndex: 10,
        },
        micMuff: {
            width: 110,
            height: 120,
            backgroundColor: '#1a1a1a',
            borderRadius: 40,
            borderWidth: 1,
            borderColor: '#0a0a0a',
        },
        micNeck: {
            width: 50,
            height: 40,
            backgroundColor: '#2a2a2a',
            marginTop: -10,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
        },
        deviceBody: {
            width: 320,
            backgroundColor: '#2c2e33',
            borderTopLeftRadius: 80,
            borderTopRightRadius: 80,
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            borderLeftWidth: 12,
            borderRightWidth: 12,
            borderColor: '#c0392b',
            alignItems: 'center',
            paddingTop: 30,
            paddingBottom: 40,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 15 },
            shadowOpacity: 0.6,
            shadowRadius: 20,
            elevation: 15,
            marginTop: -20, 
        },
        ledIndicator: {
            width: 24,
            height: 8,
            borderRadius: 4,
            marginBottom: 20,
            shadowColor: '#00ff00',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 5,
        },
        lcdScreen: {
            width: 260,
            backgroundColor: '#bce8f1',
            borderRadius: 6,
            borderWidth: 2,
            borderColor: '#111',
            padding: 10,
            paddingBottom: 0,
            justifyContent: 'space-between',
        },
        lcdTopBar: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 5,
        },
        lcdSmallText: {
            color: '#111',
            fontFamily: 'monospace',
            fontSize: 10,
            fontWeight: '600',
        },
        lcdGaugeArea: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 10,
        },
        gaugeCenter: {
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
        },
        lcdMainDisplay: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 5,
        },
        lcdMainValue: {
            color: '#0a3d62',
            fontSize: 54,
            fontWeight: 'bold',
            fontFamily: 'monospace',
            letterSpacing: -2,
        },
        lcdUnits: {
            marginLeft: 10,
            justifyContent: 'center',
        },
        lcdUnitText: {
            color: '#111',
            fontSize: 12,
            fontWeight: 'bold',
            fontFamily: 'monospace',
        },
        lcdMinMax: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 5,
        },
        lcdGraphContainer: {
            width: 240,
            height: 60,
            backgroundColor: '#e9eed0',
            borderWidth: 1,
            borderColor: '#a3bfa8',
            position: 'relative',
            marginBottom: 10,
            alignSelf:'center'
        },
        graphYAxis: {
            position: 'absolute',
            left: 2,
            top: 2,
            bottom: 2,
            justifyContent: 'space-between',
        },
        graphAxisText: {
            fontSize: 6,
            color: '#111',
            fontFamily: 'monospace',
            fontWeight: 'bold',
        },
        lcdTabs: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 5,
            borderTopWidth: 1,
            borderTopColor: '#99c2d1',
            backgroundColor: '#fff',
            marginHorizontal: -10,
            paddingHorizontal: 10,
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
        },
        lcdTabText: {
            fontSize: 11,
            color: '#111',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            paddingVertical: 5,
            paddingHorizontal: 10,
        },
        brandText: {
            color: '#fff',
            fontSize: 14,
            fontWeight: 'bold',
            marginTop: 20,
            marginBottom: 20,
        },
        dPadContainer: {
            width: 140,
            height: 140,
            backgroundColor: '#1f2024',
            borderRadius: 70,
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 5,
            borderWidth: 1,
            borderColor: '#111',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 5,
            elevation: 5,
        },
        dPadRow: {
            alignItems: 'center',
            justifyContent: 'center',
            height: 35,
        },
        dPadMiddleRow: {
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        powerButton: {
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#e63946',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: '#b71c1c',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.6,
            shadowRadius: 3,
        },
        powerBtnText: {
            color: '#fff',
            fontSize: 9,
            fontWeight: 'bold',
            fontFamily: 'monospace',
            marginTop: -2,
        }
    });
}