import { useEffect, useState } from "react";

export default function UseTelementary(currentValue: number){

    const [isRecording, setIsRecording] = useState(false);
    const [startTime, setStartTime] = useState<number|null>(null);
    const [peak, setPeak] = useState<number>(currentValue);
    const [trough, setTrough] = useState<number>(currentValue);

    useEffect(()=>{
        if(isRecording){
            setPeak(Math.max(currentValue, peak));
            setTrough(Math.min(currentValue, trough));
        }
    },[currentValue, isRecording]);

    const startExperiment =()=>{
        setPeak(currentValue);
        setTrough(currentValue);
        setStartTime(Date.now());
        setIsRecording(true);
    }

    const stopExperiment = ()=>{
        setIsRecording(false);
        const duration = startTime ? ((Date.now()-startTime)/1000).toFixed(1):"0.0";

        return {
            type: 'experiment',
            peak,
            trough,
            duration,
            timeStamp: new Date().toISOString()
        }
    }

    const captureSnapshot = ()=>{

        return{
            type: 'snapshot',
            value: currentValue,
            timeStamp: new Date().toISOString()

        }
    }

    return{
        isRecording,
        peak,
        trough,
        startExperiment,
        stopExperiment,
        captureSnapshot
    }
}