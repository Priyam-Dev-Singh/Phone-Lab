import {Stack} from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ThemeProvider } from '../src/context/ThemeContext'

export default function Layout(){


    return(
        <SafeAreaProvider>
            <ThemeProvider>
                <Stack screenOptions={{headerShown : false}}>
                <Stack.Screen name='index'/>
            </Stack>
            </ThemeProvider>
        </SafeAreaProvider>
    )
}