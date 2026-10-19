import { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform, ScrollView } from 'react-native';
import { LightSensor } from 'expo-sensors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../src/context/ThemeContext';
import Svg, { Line, Polyline, Text as SvgText, Path, G, Polygon } from 'react-native-svg';
import AntDesign from '@expo/vector-icons/AntDesign';

// ---------- CONFIG ----------
const BRAND = 'LUX LAB'; // <- put your own name here

// ---------- ONE SHARED LUX SCALE (needle, ticks, graph, glow all use this) ----------
const MAX_LUX = 100000;
const DECADES = Math.log10(MAX_LUX); // 5

// 1 lux -> 0, 10 -> 0.2, 100 -> 0.4, 1k -> 0.6, 10k -> 0.8, 100k -> 1
const luxToNorm = (lux: number) =>
    Math.min(Math.max(Math.log10(Math.max(lux, 1)) / DECADES, 0), 1);

// ---------- METER GEOMETRY (needle pivots at 140,130) ----------
const PIVOT_X = 140;
const PIVOT_Y = 130;
const ANGLE_RANGE = 45; // needle sweeps -45deg .. +45deg

const angleFor = (lux: number) => -ANGLE_RANGE + luxToNorm(lux) * ANGLE_RANGE * 2;

const polar = (angleDeg: number, r: number) => {
    const a = (angleDeg * Math.PI) / 180;
    return { x: PIVOT_X + r * Math.sin(a), y: PIVOT_Y - r * Math.cos(a) };
};

const MARKS = [
    { lux: 1, label: '1' },
    { lux: 10, label: '10' },
    { lux: 100, label: '100' },
    { lux: 1000, label: '1k' },
    { lux: 10000, label: '10k' },
    { lux: 100000, label: '100k' },
];

// ---------- GRAPH GEOMETRY ----------
const GRAPH_W = 300;
const GRAPH_BASE_Y = 100;
const GRAPH_SPAN = 90;
const graphY = (lux: number) => GRAPH_BASE_Y - luxToNorm(lux) * GRAPH_SPAN;

const GRID_LINES = [
    { lux: 100, label: '100 lx (HOME)' },
    { lux: 1000, label: '1k lx (OVERCAST)' },
    { lux: 10000, label: '10k lx (DAYLIGHT)' },
    { lux: 100000, label: '100k lx (DIRECT SUN)' },
];

const lightCondition = (lux: number) => {
    if (lux < 5) return 'DARK';
    if (lux < 50) return 'DIM';
    if (lux < 200) return 'HOME';
    if (lux < 1000) return 'OFFICE';
    if (lux < 10000) return 'OVERCAST';
    return 'DAYLIGHT';
};

export default function LightSnsr() {
    const { colorScheme } = useContext<any>(ThemeContext);
    const isDark = colorScheme === 'dark';
    const styles = createStyles(isDark);

    const [history, setHistory] = useState<number[]>(new Array(50).fill(0));
    const [highest, setHighest] = useState<number>(0);
    const [{ illuminance }, setData] = useState({ illuminance: 0 });
    const [subscription, setSubscription] = useState<any>(null);

    const handleSensorData = (sensorData: { illuminance: number }) => {
        setData(sensorData);
        const currentLux = Math.max(sensorData.illuminance, 0);
        setHighest(prev => Math.max(prev, currentLux));
        setHistory(prev => [...prev.slice(1), currentLux]);
    };

    const subscribe = () => {
        setSubscription(LightSensor.addListener(handleSensorData));
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
    const normalisedLight = luxToNorm(safeLux);

    const coreScale = 1 + normalisedLight * 2;
    const glowOpacity = 0.1 + normalisedLight * 0.9;

    const pointString = history
        .map((lux, index) => `${index * 6},${graphY(lux)}`)
        .join(' ');

    const needleAngle = angleFor(safeLux);

    return (
        <SafeAreaView edges={['top']} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>PHOTOMETER (OPTICS)</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.deviceCasing}>
                    <View style={styles.domeHousing}>
                        <View style={styles.domeArch} />

                        <View style={styles.visualizerContainer}>
                            {Platform.OS === 'ios' ? (
                                <Text style={styles.iosWarning}>N/A</Text>
                            ) : (
                                <View style={styles.glowWrapper}>
                                    <View style={[styles.outerGlow, {
                                        transform: [{ scale: coreScale * 1.5 }],
                                        opacity: glowOpacity * 0.3,
                                    }]} />
                                    <View style={[styles.midGlow, {
                                        transform: [{ scale: coreScale * 1.2 }],
                                        opacity: glowOpacity * 0.6,
                                    }]} />
                                    <View style={[styles.coreLight, {
                                        transform: [{ scale: coreScale }],
                                        opacity: glowOpacity,
                                    }]} />
                                </View>
                            )}
                        </View>
                        <View style={styles.domeBaseLine} />
                    </View>

                    <View style={styles.mainBody}>
                        <View style={styles.screwTopLeft} />
                        <View style={styles.screwTopRight} />

                        <Text style={styles.brandText}>{BRAND}</Text>

                        <View style={styles.analogMeter}>
                            <Svg height="120" width="280">
                                {/* true arcs around the pivot, so ticks sit exactly on them */}
                                <Path d="M 79.9 69.9 A 85 85 0 0 1 200.1 69.9" fill="none" stroke="#fff" strokeWidth="2" />
                                <Path d="M 87 77 A 75 75 0 0 1 193 77" fill="none" stroke="#fff" strokeWidth="1" />

                                {/* ticks + labels generated from the same scale as the needle */}
                                {MARKS.map(m => {
                                    const ang = angleFor(m.lux);
                                    const outer = polar(ang, 85);
                                    const inner = polar(ang, 75);
                                    const label = polar(ang, 97);
                                    return (
                                        <G key={m.label}>
                                            <Line
                                                x1={inner.x} y1={inner.y}
                                                x2={outer.x} y2={outer.y}
                                                stroke="#fff" strokeWidth="2"
                                            />
                                            <SvgText
                                                x={label.x} y={label.y + 3}
                                                fill="#fff" fontSize="10"
                                                fontFamily="monospace" textAnchor="middle"
                                            >
                                                {m.label}
                                            </SvgText>
                                        </G>
                                    );
                                })}

                                <SvgText x="140" y="95" fill="#aaa" fontSize="8" fontFamily="monospace" textAnchor="middle">INCIDENT LIGHT</SvgText>
                                <SvgText x="140" y="105" fill="#aaa" fontSize="8" fontFamily="monospace" textAnchor="middle">(LUX, LOG SCALE)</SvgText>

                                <G transform={`rotate(${needleAngle}, ${PIVOT_X}, ${PIVOT_Y})`}>
                                    <Line x1="140" y1="130" x2="140" y2="40" stroke="#ff3333" strokeWidth="2" />
                                    <Polygon points="137,50 140,40 143,50" fill="#ff3333" />
                                </G>
                            </Svg>
                        </View>

                        <View style={styles.dialContainer}>
                            <View style={styles.dialOuterRing}>
                                <View style={styles.dialInnerRing}>
                                    <View style={styles.dialCenter}>
                                        <View style={styles.dialKnob}>
                                            <View style={styles.knobDot} />
                                        </View>
                                        <View style={styles.readoutDisplay}>
                                            <Text style={styles.luxValue}>
                                                {Platform.OS === 'android' ? safeLux.toFixed(0) : '0'}
                                            </Text>
                                            <Text style={styles.unit}>LUX</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.dialScaleTextContainer}>
                                <Text style={styles.dialScaleText} numberOfLines={1} adjustsFontSizeToFit>
                                    {lightCondition(safeLux)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.graphContainer}>
                    <View style={styles.graphHeader}>
                        <Text style={styles.graphLabel}>ILLUMINANCE HISTORY (LOG)</Text>
                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Text style={styles.graphLabel}>Peak: {highest.toFixed(1)} lx</Text>
                            <TouchableOpacity onPress={() => setHighest(0)}>
                                <AntDesign name="redo" size={16} color={isDark ? '#fff' : '#000'} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Svg width="100%" height="104" viewBox={`0 0 ${GRAPH_W} 104`}>
                        {GRID_LINES.map(g => {
                            const y = graphY(g.lux);
                            return (
                                <G key={g.lux}>
                                    <Line
                                        x1="0" y1={y} x2={GRAPH_W} y2={y}
                                        stroke={isDark ? '#333' : '#ddd'}
                                        strokeWidth="1" strokeDasharray="5,5"
                                    />
                                    <SvgText
                                        x="5" y={y + 11}
                                        fill={isDark ? '#666' : '#999'}
                                        fontSize="9" fontFamily="monospace" fontWeight="bold"
                                    >
                                        {g.label}
                                    </SvgText>
                                </G>
                            );
                        })}

                        <Line x1="0" y1={GRAPH_BASE_Y} x2={GRAPH_W} y2={GRAPH_BASE_Y} stroke={isDark ? '#444' : '#ccc'} strokeWidth="1" />
                        <SvgText x="5" y={GRAPH_BASE_Y - 4} fill={isDark ? '#666' : '#999'} fontSize="9" fontFamily="monospace" fontWeight="bold">
                            ~0 lx
                        </SvgText>

                        <Polyline
                            points={pointString}
                            fill="none"
                            stroke={isDark ? '#ffffff' : '#111111'}
                            strokeWidth="2"
                        />
                    </Svg>
                </View>

                <TouchableOpacity onPress={toggle} style={styles.powerButton}>
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
        container: {
            flex: 1,
            backgroundColor: isDark ? '#121212' : '#d9d9d9',
        },
        header: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 15,
        },
        title: {
            color: isDark ? '#888' : '#666',
            fontFamily: 'monospace',
            fontSize: 14,
            fontWeight: 'bold',
            letterSpacing: 2,
        },
        scrollContent: {
            flexGrow: 1,
            alignItems: 'center',
            padding: 20,
            paddingBottom: 40,
        },
        deviceCasing: {
            marginTop: 20,
            alignItems: 'center',
            marginBottom: 30,
        },

        // ---- DOME (true semicircle: height = width / 2) ----
        domeHousing: {
            width: 200,
            height: 100,
            backgroundColor: '#050505',
            borderTopLeftRadius: 100,
            borderTopRightRadius: 100,
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingBottom: 0,
            borderWidth: 3,
            borderColor: '#222',
            borderBottomWidth: 0,
            zIndex: 2,
            elevation: 16, // keeps dome above mainBody (elevation 15) on Android
        },
        domeArch: {
            position: 'absolute',
            width: 170,
            height: 85,
            borderTopLeftRadius: 85,
            borderTopRightRadius: 85,
            borderWidth: 15,
            borderColor: '#111',
            borderBottomWidth: 0,
            top: 12,
        },
        domeBaseLine: {
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: 4,
            backgroundColor: '#111',
        },

        // ---- LENS (half-sphere, dark so the glow shows) ----
        visualizerContainer: {
            width: 120,
            height: 60,
            justifyContent: 'center',
            alignItems: 'center',
            borderTopLeftRadius: 60,
            borderTopRightRadius: 60,
            backgroundColor: '#1c1c1c',
            borderWidth: 2,
            borderBottomWidth: 0,
            borderColor: '#333',
            overflow: 'hidden',
        },
        iosWarning: {
            color: '#ff3366',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fontSize: 10,
        },
        glowWrapper: {
            width: '100%',
            height: '100%',
            alignItems: 'center',
        },
        // Glows are centred on the lens baseline so they radiate upward.
        outerGlow: {
            position: 'absolute',
            bottom: -50,
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: '#fff4c2',
        },
        midGlow: {
            position: 'absolute',
            bottom: -30,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#fff4c2',
        },
        coreLight: {
            position: 'absolute',
            bottom: -10,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#fff4c2',
        },

        // ---- BODY ----
        mainBody: {
            width: 300,
            height: 448,
            backgroundColor: '#111111',
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 150,
            borderBottomRightRadius: 150,
            borderWidth: 4,
            borderColor: 'rgba(255,255,255,0.3)',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.8,
            shadowRadius: 20,
            elevation: 15,
            zIndex: 1,
            marginTop: -5,
        },
        screwTopLeft: {
            position: 'absolute',
            top: 15,
            left: 15,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: '#ccc',
            borderWidth: 1,
            borderColor: '#555',
        },
        screwTopRight: {
            position: 'absolute',
            top: 15,
            right: 15,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: '#ccc',
            borderWidth: 1,
            borderColor: '#555',
        },
        brandText: {
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: 16,
            letterSpacing: 4,
            marginTop: 20,
            fontWeight: 'bold',
        },
        analogMeter: {
            width: 280,
            height: 120,
            marginTop: 10,
            alignItems: 'center',
        },

        // ---- DIAL ----
        dialContainer: {
            width: 260,
            height: 260,
            borderRadius: 130,
            backgroundColor: '#1a1a1a',
            borderWidth: 2,
            borderColor: '#333',
            marginTop: -10,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
        },
        dialOuterRing: {
            width: 230,
            height: 230,
            borderRadius: 115,
            borderWidth: 10,
            borderColor: '#222',
            borderStyle: 'solid',
            alignItems: 'center',
            justifyContent: 'center',
        },
        dialInnerRing: {
            width: 180,
            height: 180,
            borderRadius: 90,
            borderWidth: 2,
            borderColor: '#444',
            backgroundColor: '#111',
            alignItems: 'center',
            justifyContent: 'center',
        },
        dialCenter: {
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: '#222',
            borderWidth: 1,
            borderColor: '#555',
            alignItems: 'center',
            justifyContent: 'center',
        },
        dialKnob: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#ccc',
            position: 'absolute',
            borderWidth: 2,
            borderColor: '#999',
            alignItems: 'center',
            paddingTop: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.5,
            shadowRadius: 4,
        },
        knobDot: {
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: '#111',
        },
        readoutDisplay: {
            position: 'absolute',
            top: -45,
            alignItems: 'center',
        },
        luxValue: {
            color: '#ff3333',
            fontFamily: 'monospace',
            fontSize: 20,
            fontWeight: 'bold',
            backgroundColor: '#0a0a0a',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderWidth: 1,
            borderColor: '#333',
        },
        unit: {
            color: '#aaa',
            fontFamily: 'monospace',
            fontSize: 8,
            marginTop: 2,
        },
        dialScaleTextContainer: {
            position: 'absolute',
            bottom: 22,
            width: 200,
            alignItems: 'center',
        },
        dialScaleText: {
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: 12,
            letterSpacing: 3,
        },

        // ---- GRAPH ----
        graphContainer: {
            width: '100%',
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            padding: 15,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#ddd',
            alignItems: 'center',
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
            marginTop: 30,
            paddingVertical: 15,
            paddingHorizontal: 40,
            borderWidth: 1,
            borderRadius: 8,
            borderColor: isDark ? '#ffffff' : '#000000',
            backgroundColor: isDark ? '#111' : '#fff',
            width: '100%',
            alignItems: 'center',
        },
        powerText: {
            color: isDark ? '#ffffff' : '#000000',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            letterSpacing: 1,
        },
    });
}