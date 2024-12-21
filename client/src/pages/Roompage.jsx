import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";
import ReactPlayer from "react-player";

function Roompage() {
  const { socket } = useSocket();
  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAnswer,
    sendStream,
    remoteStream,
  } = usePeer();

  const [myStream, setMyStream] = useState(null);
  const [remoteEmailId, setRemoteEmailId] = useState();

  const handleNewUserJoined = useCallback(
    async ({ emailId }) => {
      console.log(`New user joined with email ${emailId}`);
      const offer = await createOffer();
      socket.emit("call-user", { emailId, offer });
      setRemoteEmailId(emailId);
    },
    [createOffer, socket]
  );

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      const ans = await createAnswer(offer);
      socket.emit("call-accepted", { emailId: from, answer: ans });
      setRemoteEmailId(from);
    },
    [createAnswer, socket]
  );

  const handleNegotiationNeeded = useCallback(async () => {
    console.log("Negotiation needed");
    const localOffer = peer.localDescription;
    socket.emit("call-user", { emailId: remoteEmailId, offer: localOffer });
  }, [peer.localDescription, remoteEmailId, socket]);

  const handleCallAccepted = useCallback(
    async ({ answer }) => {
      console.log(`Call got accepted:  ${answer}`);
      await setRemoteAnswer(answer);
    },
    [setRemoteAnswer]
  );

  const getUserMediaStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
  }, []);

  useEffect(() => {
    peer.addEventListener("negotiationneeded", handleNegotiationNeeded);

    return () => {
      peer.removeEventListener("negotiationneeded", handleNegotiationNeeded);
    };
  }, [handleNegotiationNeeded, peer]);

  useEffect(() => {
    socket.on("user-joined", handleNewUserJoined);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);

    return () => {
      socket.off("user-joined", handleNewUserJoined);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
    };
  }, [socket, handleNewUserJoined, handleIncomingCall, handleCallAccepted]);

  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  return (
    <div className="roompage-container">
      <h1>Room page</h1>
      <h4>
        {remoteEmailId
          ? `You are connected to ${remoteEmailId}.`
          : "You are not connected to anyone :("}
      </h4>
      <button onClick={() => sendStream(myStream)}>Send Stream</button>
      <ReactPlayer url={myStream} playing muted />
      <ReactPlayer url={remoteStream} playing />
    </div>
  );
}

export default Roompage;
