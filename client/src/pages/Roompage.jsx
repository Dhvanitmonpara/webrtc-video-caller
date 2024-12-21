import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";
import ReactPlayer from "react-player";
import toast, { Toaster } from "react-hot-toast";

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
      toast(`User with email ${emailId} joined the room`);
    },
    [createOffer, socket]
  );

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      const ans = await createAnswer(offer);
      socket.emit("call-accepted", { emailId: from, answer: ans });
      setRemoteEmailId(from);
      toast(`Incoming call from ${from}`);
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
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideoInput = devices.some((device) => device.kind === "videoinput");
      const hasAudioInput = devices.some((device) => device.kind === "audioinput");
  
      if (!hasVideoInput) {
        toast.error("No camera found on this device.");
        return;
      }
  
      if (!hasAudioInput) {
        toast.error("No microphone found on this device.");
        return;
      }
  
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
    } catch (error) {
      if (error.name === "NotReadableError") {
        toast.error("The camera or microphone is already in use by another application.");
      } else if (error.name === "NotAllowedError") {
        toast.error("Permission to access the camera or microphone was denied.");
      } else if (error.name === "NotFoundError") {
        toast.error("No camera or microphone was found on this device.");
      } else if (error.name === "OverconstrainedError") {
        toast.error("Device constraints are too specific. Adjust your settings.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
        console.error("Error accessing media devices:", error);
      }
    }
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
      <h4>
        {remoteEmailId
          ? `You are connected to ${remoteEmailId}.`
          : "You are not connected to anyone :("}
      </h4>
      <button onClick={() => sendStream(myStream)}>Send Stream</button>
      <ReactPlayer url={myStream} playing muted />
      <ReactPlayer url={remoteStream} playing />
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

export default Roompage;
