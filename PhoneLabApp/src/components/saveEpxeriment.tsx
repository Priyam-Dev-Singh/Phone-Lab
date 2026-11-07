import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import UseTelementary from "../hooks/useTelementaryData"; // Assuming this is your hook's path

export default function SaveExperiment({ liveValue, unit }: { liveValue: number, unit: string }) {
    type Snapshot = {
        type: string;
        value: number;
        timeStamp: string;
    }
    
    const telemetry = UseTelementary(liveValue);
    const [data, setData] = useState<Snapshot[]>([]);
    const [expData, setExpData] = useState<any[]>([]);

    const handleSnapshot = () => {
        const snapshot: Snapshot = telemetry.captureSnapshot();
        setData(prev => [...prev, snapshot]);
    }

    const handleExperiment = () => {
        if (telemetry.isRecording) {
            const result = telemetry.stopExperiment();
            setExpData(prev => [...prev, result])
            console.log("Closed the experiment", result);
        } else {
            telemetry.startExperiment();
        }
    }

    const handleClearLocalData = ()=>{
        setData([]);
    }

    const handleClearExpData = ()=>{
        setExpData([]);
    }

    return (
        <View style={styles.controlPanel}>
            
            <TouchableOpacity 
                style={[styles.button, styles.snapshotButton]} 
                onPress={handleSnapshot}
                disabled={telemetry.isRecording} 
            >
                <Text style={styles.buttonText}>CAPTURE SNAPSHOT</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[
                    styles.button, 
                    telemetry.isRecording ? styles.experimentActive : styles.experimentIdle
                ]} 
                onPress={handleExperiment}
            >
                <Text style={[styles.buttonText, telemetry.isRecording && { color: '#000000' }]}>
                    {telemetry.isRecording ? 'HALT EXPERIMENT' : 'INITIATE EXPERIMENT'}
                </Text>
            </TouchableOpacity>

            {telemetry.isRecording && (
                <View style={styles.activeReadout}>
                    <Text style={styles.readoutText}>PEAK: {telemetry.peak.toFixed(2)}</Text>
                    <Text style={styles.readoutText}>MIN: {telemetry.trough.toFixed(2)}</Text>
                </View>
            )}

            {expData.length > 0 && (
                <View style={styles.ledgerContainer}>
                    <View style={{flexDirection: 'row', justifyContent:'space-between'}}>
                        <Text style={styles.ledgerTitle}>EXP SNAPSHOTS</Text>
                        <TouchableOpacity style={{}} onPress={handleClearExpData}>
                            <Text style={[styles.ledgerTitle]}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                    {expData.slice(-5).map((snapshot, index) => {
                        const time = new Date(snapshot.timeStamp).toLocaleTimeString([], { hour12: false });
                        return (
                            <View key={index} style={styles.ledgerRow}>
                                <Text style={[styles.ledgerTime, {fontSize: 10}]}>[{time}]</Text>
                                <Text style={[styles.ledgerTime, {fontSize: 10}]}>{snapshot.duration}s</Text>
                                <Text style={[styles.ledgerValue, {fontSize: 12}]}>
                                    {snapshot.peak.toFixed(2)}
                                </Text>
                                <Text style={[styles.ledgerValue, {color:'#D32F2F', fontSize: 12}]}>
                                    {snapshot.trough.toFixed(2)}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            )}

            {/* Tactical Snapshot Ledger */}
            {data.length > 0 && (
                <View style={styles.ledgerContainer}>
                    <View style={{flexDirection: 'row', justifyContent:'space-between'}}>
                        <Text style={styles.ledgerTitle}>LOCAL SNAPSHOTS</Text>
                        <TouchableOpacity style={{}} onPress={handleClearLocalData}>
                            <Text style={[styles.ledgerTitle]}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                    {data.slice(-5).map((snapshot, index) => {
                        const time = new Date(snapshot.timeStamp).toLocaleTimeString([], { hour12: false });
                        return (
                            <View key={index} style={styles.ledgerRow}>
                                <Text style={styles.ledgerTime}>[{time}]</Text>
                                <Text style={styles.ledgerValue}>
                                    {snapshot.value.toFixed(2)} <Text style={styles.ledgerUnit}>{unit}</Text>
                                </Text>
                            </View>
                        );
                    })}
                </View>
            )}

            <TouchableOpacity style={styles.saveButton}>
                <Text style={styles.saveButtonText}>COMMIT TO ARCHIVE</Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    controlPanel: {
        width: '100%',
        padding: 20,
        backgroundColor: '#0a0a0a',
        borderWidth: 1,
        borderColor: '#333333',
        marginTop: 30,
        gap: 15,
        borderRadius: 8,
    },
    button: {
        width: '100%',
        paddingVertical: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 4,
    },
    snapshotButton: {
        backgroundColor: '#111111',
        borderColor: '#555555',
    },
    experimentIdle: {
        backgroundColor: '#111111',
        borderColor: '#D32F2F', 
    },
    experimentActive: {
        backgroundColor: '#D32F2F',
        borderColor: '#D32F2F',
    },
    buttonText: {
        color: '#FFFFFF',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        letterSpacing: 1.5,
    },
    activeReadout: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#333333',
    },
    readoutText: {
        color: '#D32F2F',
        fontFamily: 'monospace',
        fontWeight: 'bold',
    },
    ledgerContainer: {
        marginTop: 10,
        backgroundColor: '#151515',
        padding: 10,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#222',
    },
    ledgerTitle: {
        color: '#666',
        fontFamily: 'monospace',
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingBottom: 5,
    },
    ledgerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    ledgerTime: {
        color: '#888',
        fontFamily: 'monospace',
        fontSize: 12,
    },
    ledgerValue: {
        color: '#00ffcc',
        fontFamily: 'monospace',
        fontSize: 14,
        fontWeight: 'bold',
    },
    ledgerUnit: {
        color: '#666',
        fontSize: 10,
    },
    saveButton: {
        marginTop: 10,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#222',
        borderWidth: 1,
        borderColor: '#444',
        borderRadius: 4,
    },
    saveButtonText: {
        color: '#aaa',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});