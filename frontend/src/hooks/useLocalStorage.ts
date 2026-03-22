import { useEffect, useState } from "react"

function getLocalStorageItem(key:string){
    if(!globalThis.window) return null

    const value = window.localStorage.getItem(key)
    if(value) return JSON.parse(value)
    
    return null
}

export function useLocalStorage<T>(key:string,initialValue: T):[T,(value: T) => void]{

    //use state for functional reference
    const [item,setItem] = useState(getLocalStorageItem(key) ?? initialValue)

    //fetch value
    useEffect(()=>{
        const value = getLocalStorageItem(key)
        if (value) setItem(value)
    },[])

    const setValue = (value:T) => {
        setItem(value)
        window.localStorage.setItem(key,JSON.stringify(value))
    }

    return [item,setValue]
}