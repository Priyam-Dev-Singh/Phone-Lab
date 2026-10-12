import { createContext, ReactNode } from "react";

export const SensorDataContext = createContext<any>({});
export const SensorDataProvider = ({children}:{children: ReactNode}) => {
    const barometerKey = '@barometerData';
    const magnetometerKey = '@magentometerData';
    const photometerKey = '@photometerData';
    const decibelmeterKey = '@decibelmeterData';

    return(
        <SensorDataContext.Provider value={{barometerKey, magnetometerKey, photometerKey, decibelmeterKey}}>
            {children}
        </SensorDataContext.Provider>
    )

}