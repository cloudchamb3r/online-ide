import { useEffect, useMemo, useRef } from 'react';
import { MyTerm } from './Termianl';
import { Terminal } from 'xterm';

function App() {

  const terminal = useMemo(() => new Terminal(), []); 
  const connection = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    const ws = new WebSocket('ws://192.168.0.44:1337/terminal');
    ws.onopen = () => {
      console.log('connected!');
    };
    
    ws.onmessage = (e) => {
      terminal.write(e.data);
    };

    ws.onclose = () => {
      console.log('closed')
    };

    connection.current = ws;
    return () => {
      connection.current?.close(); 
    }
  }, [terminal]);

  return (
    <>
      <MyTerm ws={connection} term={terminal} />
    </>
  )
}

export default App
