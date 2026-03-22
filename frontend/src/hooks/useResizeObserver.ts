import { useEffect, useState, type RefObject } from "react";

function useResizeObserver(containerRef:RefObject<Element | null>){

    const [entry,setEntry] = useState<ResizeObserverEntry>()
    useEffect(()=>{
        const resizeObserver = new ResizeObserver((entries) => {
            console.log("called here");
            const container = entries[0]
            setEntry(container)
            
        })

        if(containerRef.current)
            resizeObserver.observe(containerRef.current)

        return () => {
            resizeObserver.disconnect()
        }
    },[])

    return entry
    
}

export default useResizeObserver;