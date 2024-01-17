import {  MutableRefObject, useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "../node_modules/xterm/css/xterm.css";

interface MyTermProp {
    ws: MutableRefObject<WebSocket | null>, 
    term: Terminal
}

export function MyTerm({ws, term}: MyTermProp) {
    const myTermRef = useRef<HTMLDivElement>(null); 
    useEffect(()=>{
        term.open(myTermRef.current!);

        term.onKey(e => {
            ws.current?.send(e.key);
        });

        return () => {
            term.dispose();
        }
    })
    return <div ref={myTermRef}></div>
}