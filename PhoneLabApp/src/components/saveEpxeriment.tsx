import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import UseTelementary from "../hooks/useTelementaryData";

export default function SaveExperiment({liveValue}:any){

    const telementary = UseTelementary(liveValue);

    const handleSnapshot = ()=>{
        telementary.captureSnapshot();
        console.log("Snapshot captured");
    }

    const handleExperiment = ()=>{
        if(telementary.isRecording){
            telementary.startExperiment();

            console.log("Started the experiment");
        }
        else{
            console.log("Closed the experiment");
        }
    }
    return (
        <View style={styles.controlPanel}>
            
            {/* Manual Snapshot Button */}
            <TouchableOpacity 
                style={[styles.button, styles.snapshotButton]} 
                onPress={handleSnapshot}
                disabled={telementary.isRecording} // Disable snapshots during a live experiment
            >
                <Text style={styles.buttonText}>CAPTURE SNAPSHOT</Text>
            </TouchableOpacity>

            {/* Live Experiment Toggle */}
            <TouchableOpacity 
                style={[
                    styles.button, 
                    telementary.isRecording ? styles.experimentActive : styles.experimentIdle
                ]} 
                onPress={handleExperiment}
            >
                <Text style={[styles.buttonText, telementary.isRecording && { color: '#000000' }]}>
                    {telementary.isRecording ? 'HALT EXPERIMENT' : 'INITIATE EXPERIMENT'}
                </Text>
            </TouchableOpacity>

            {/* Live Experiment Readout (Only visible while recording) */}
            {telementary.isRecording && (
                <View style={styles.activeReadout}>
                    <Text style={styles.readoutText}>PEAK: {telementary.peak.toFixed(2)}</Text>
                    <Text style={styles.readoutText}>MIN: {telementary.trough.toFixed(2)}</Text>
                </View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    controlPanel: {
        width: '100%',
        padding: 20,
        backgroundColor: '#000000',
        borderWidth: 1,
        borderColor: '#333333',
        marginTop: 20,
        gap: 15,
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
        borderColor: '#D32F2F', // Crimson Red
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
    }
});