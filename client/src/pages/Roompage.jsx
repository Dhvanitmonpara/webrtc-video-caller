import React, { useEffect } from 'react'
import { useSocket } from '../providers/Socket'

function Roompage() {

  const {socket} = useSocket()
  
  const handleNewUserJoined = ({emailId}) => {
    console.log(`New user joined with email ${emailId}`)
  }

  useEffect(()=>{
    socket.on("user-joined", handleNewUserJoined)
  },[socket])

  return (
    <div className="roompage-container">
      <h1>Room page</h1>
    </div>
  )
}

export default Roompage