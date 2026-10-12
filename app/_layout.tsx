import {Stack} from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ThemeProvider } from '../src/context/ThemeContext'
import { SensorDataProvider } from '../src/context/sensorDataKeys'

export default function Layout(){


    return(
        <SafeAreaProvider>
            <ThemeProvider>
                <SensorDataProvider>
                    <Stack screenOptions={{headerShown:false}}>
                        <Stack.Screen name='index'/>
                    </Stack>
                </SensorDataProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    )
}