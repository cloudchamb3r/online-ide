import { useEffect, useMemo, useRef, useState } from 'react';
import { MyTerm } from './Terminal';
import { Terminal } from 'xterm';
import { Editor, OnChange } from '@monaco-editor/react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {

  const terminal = useMemo(() => new Terminal({rows: 13}), []); 
  const connection = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    const ws = new WebSocket('ws://192.168.0.44:1337/terminal');
    ws.onopen = () => {
      ws.send('\n');
    };
    
    ws.onmessage = (e) => {
      console.log('on message =>' + e.data)
      terminal.write(e.data);
    };

    ws.onclose = () => {
      console.log('closed')
    };

    connection.current = ws;
    return () => {
      connection.current?.close(); 
    }
  }, []);


  const [language, setLanguage] = useState<string>('javascript');
  const handleLanguageChange : React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setLanguage(e.target.value);
  }
  const [theme, setTheme] = useState<string>('light');
  const handleThemeChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setTheme(e.target.value);
  }

  const [content, setContent] = useState<string>(''); 
  const handleContentChange : OnChange = (value) => {
    setContent(value || '')
  }
  const handleRunOnServer : React.MouseEventHandler<HTMLButtonElement> = () => {
    const outname = (language == 'javascript') ? 'main.js'
                : (language == 'python') ? 'main.py'
                : (language == 'cpp') ? 'main.cpp'
                : 'out';
    
    
    connection.current?.send('\n'); // send ctrl + c 
    connection.current?.send('cat << EOF > ' + outname + ' \n'); 
    connection.current?.send(content + '\n')
    connection.current?.send('EOF\n');


    if (language == 'javascript') {
      connection.current?.send('clear\n');
      connection.current?.send('node ' + outname+ '\n');
    } else if (language == 'python') {
      connection.current?.send('clear\n');
      connection.current?.send('python3 ' + outname + '\n'); 
    } else if (language == 'cpp') {
      connection.current?.send('clear\n');
      connection.current?.send('g++ ' + outname +' -o /tmp/a.out --std=c++17\n')
      connection.current?.send('clear\n');
      connection.current?.send('./tmp/a.out\n'); 
    }
  } 
  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      <div className='mx-2 mt-4 row row-cols-2'>
        <div className="col">
          <div className="control-label">Language</div>
          <select name="" id="" className="form-select form-select-sm" onChange={handleLanguageChange} value={language}>
            <option value="javascript">Javascript</option>
            <option value="cpp">C++</option>
            <option value="python">python</option>
          </select>
        </div>
        <div className="col">
          <div className="control-label">Theme</div>
          <select name="" id="" className="form-select form-select-sm" onChange={handleThemeChange} value={theme}>
            <option value="light">Visual Studio</option>
            <option value="vs-dark">Visual Studio Dark</option>
            
          </select>
        </div>
      </div>

      <div className='mx-4 my-2 d-flex justify-content-end'>
        <button onClick={handleRunOnServer} className='btn btn-sm btn-success'>Run on Server</button>
      </div>
      <div className='mt-4' style={{flexGrow: 1, flexShrink: 1}}>
        <Editor className='h-auto'  defaultLanguage={language} language={language} theme={theme} value={content} onChange={handleContentChange}></Editor>
      </div>
      
      <div style={{overflow: 'hidden' }}>
        <MyTerm ws={connection} term={terminal} />
      </div>
    </div>
  )
}

export default App
