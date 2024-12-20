import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import './App.css';
import { SocketProvider } from './providers/Socket';
import Roompage from './pages/Roompage';

function App() {

  return (
    <div className="App">
      <SocketProvider>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/room/:roomId" element={<Roompage />} />
        </Routes>
      </SocketProvider>
    </div>
  );
}

export default App;
