import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import './App.css';
import { SocketProvider } from './providers/Socket';
import Roompage from './pages/Roompage';
import { PeerProvider } from './providers/Peer';

function App() {

  return (
    <div className="App">
      <SocketProvider>
        <PeerProvider>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/room/:roomId" element={<Roompage />} />
          </Routes>
        </PeerProvider>
      </SocketProvider>
    </div>
  );
}

export default App;
