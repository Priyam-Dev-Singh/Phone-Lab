import { Children, createContext, ReactNode, useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage'

const themeKey = "@themeData";
export const ThemeContext = createContext<any>(null);
export const ThemeProvider = ({children}: {children: ReactNode} ) =>{

    const [colorScheme, setColorScheme] = useState('dark');
    const isDark:boolean = colorScheme === 'dark';

    const colors: object = {
        bg: isDark?'#0000':'#ffff',
    }

    useEffect(()=>{

        const loadTheme = async()=>{
            try{
                const savedTheme = await AsyncStorage.getItem(themeKey);
                if(savedTheme){
                    setColorScheme(savedTheme);
                }else{
                    return;
                }
            }catch(e){
                console.log("Error getting Theme Data", e);
            }
        }
        loadTheme();

    },[]);

    return(
        <ThemeContext.Provider value={{colorScheme, setColorScheme, colors}}>
            {children}
        </ThemeContext.Provider>
    )
    
}