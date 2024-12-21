import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../providers/Socket";
import { useNavigate } from "react-router-dom";

function Homepage() {
  const { socket } = useSocket();

  const [email, setEmail] = useState();
  const [room, setRoom] = useState();

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
    </div>
  );
}

export default Homepage;
