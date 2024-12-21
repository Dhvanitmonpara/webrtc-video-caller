import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../providers/Socket";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

function Homepage() {
  const { socket } = useSocket();

  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const navigate = useNavigate();

  const handleJoinRoom = (e) => {
    e.preventDefault();
    socket.emit("join-room", { roomId: room, emailId: email });
  };

  const handleRoomJoined = useCallback(
    ({ roomId }) => {
      navigate(`/room/${roomId}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("joined-room", handleRoomJoined);

    return () => {
      socket.off("joined-room", handleRoomJoined);
    };
  }, [socket, handleRoomJoined]);

  return (
    <div className="homepage-container">
      <h1>Welcome to Room chat</h1>
      <form onSubmit={handleJoinRoom} className="input-container">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          placeholder="Enter your email here"
        />
        <input
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          type="text"
          required
          placeholder="Enter Room code"
        />
        <button type="submit">Enter Room</button>
      </form>
      <Toaster
        position={window.innerWidth >= 1024 ? "bottom-right" : "top-center"}
        toastOptions={{
          style: {
            background: "#fff",
            color: "#333",
          },
        }}
      />
    </div>
  );
}

export default Homepage;
