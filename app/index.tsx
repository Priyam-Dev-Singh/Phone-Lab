import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { useContext } from "react";
import { ThemeContext } from "../src/context/ThemeContext";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const LAB_MODULES = [
    { id: 'kinematics', title: 'KINEMATICS', subtitle: 'Accelerometer', route: '/accelerometer', icon: 'axis-arrow', color: '#ff3366' },
    { id: 'atmospherics', title: 'ATMOSPHERICS', subtitle: 'Barometer', route: '/barometer', icon: 'gauge', color: '#00ffcc' },
    { id: 'electromagnetics', title: 'ELECTRO  MAGNETICS', subtitle: 'Flux Scanner', route: '/magnetometer', icon: 'magnet', color: '#ff9900' },
    { id: 'optics', title: 'OPTICS', subtitle: 'Photometer', route: '/lightSensor', icon: 'lightbulb-on-outline', color: '#ffd700' },
    { id: 'acoustics', title: 'ACOUSTICS', subtitle: 'Decibel Meter', route: '/decibelMeter', icon: 'waveform', color: '#9933ff' },
];

export default function Home() {
    const router = useRouter();
    const { colorScheme, colors } = useContext<any>(ThemeContext);
    const isDark = colorScheme === 'dark';
    
    const styles = createStyles(isDark, colors);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>PHONE PHYSICS LAB</Text>
                    <Text style={styles.headerSubtitle}>Sensors Available</Text>
                </View>

                <View style={styles.grid}>
                    {LAB_MODULES.map((module) => (
                        <TouchableOpacity 
                            key={module.id} 
                            style={[styles.card, { borderColor: module.color }]} 
                            onPress={() => router.push(module.route as any)}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: `${module.color}15` }]}>
                                <MaterialCommunityIcons name={module.icon as any} size={32} color={module.color} />
                            </View>
                            
                            <View style={styles.textContainer}>
                                <Text style={styles.cardTitle}>{module.title}</Text>
                                <Text style={styles.cardSubtitle}>{module.subtitle}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

function createStyles(isDark: boolean, colors: any) {
    return StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: isDark ? '#0a0a0a' : '#f0f0f0',
        },
        scrollContainer: {
            padding: 20,
            paddingBottom: 40,
        },
        header: {
            marginVertical: 20,
            marginBottom: 40,
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#333' : '#ccc',
            paddingBottom: 20,
        },
        headerTitle: {
            color: isDark ? '#ffffff' : '#111111',
            fontSize: 24,
            fontFamily: 'monospace',
            fontWeight: 'bold',
            letterSpacing: 2,
        },
        headerSubtitle: {
            color: '#00ffcc',
            fontSize: 10,
            fontFamily: 'monospace',
            fontWeight: 'bold',
            letterSpacing: 4,
            marginTop: 5,
        },
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 15,
        },
        card: {
            width: '47%', // Fits exactly two columns with the gap
            backgroundColor: isDark ? '#151515' : '#ffffff',
            borderRadius: 12,
            borderWidth: 1,
            padding: 15,
            aspectRatio: 1, // Keeps the cards perfectly square
            justifyContent: 'space-between',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 5,
            elevation: 3,
        },
        iconContainer: {
            width: 50,
            height: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
        },
        textContainer: {
            marginTop: 10,
        },
        cardTitle: {
            color: isDark ? '#ffffff' : '#111111',
            fontSize: 11,
            fontFamily: 'monospace',
            fontWeight: 'bold',
            letterSpacing: 1,
        },
        cardSubtitle: {
            color: isDark ? '#888888' : '#666666',
            fontSize: 10,
            fontFamily: 'monospace',
            marginTop: 4,
        }
    });
}