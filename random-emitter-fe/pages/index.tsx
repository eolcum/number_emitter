import React, { useRef, useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import BarChart from '../components/BarChart'
import socketIOClient from 'socket.io-client'

interface Response {
  channelNo: number //Channel No of random value
  value: number //Random value itself with specific range
}

const socket = socketIOClient('http://localhost:3001')
/**
 * This is a React component that displays two bar charts that receive data from a server through a Socket.IO connection. It uses the useState and useEffect hooks to manage the state of the component and establish the Socket.IO connection.
 * It listens for two types of events from the server: numbers and events. When the server sends a numbers event, the component updates its state with the received data. When the server sends an events event, the component logs the data to the console.
 * The component also has a function called onSocketAction that sends events to the server through the Socket.IO connection. This function takes in three arguments: action, channelNo, and data. It sends an event to the server with the provided action and channelNo values, and includes the data object in the event if action is either "start" or "setParam".
 * It renders two BarChart components, passing them props such as color, numbers, label, channelNo, and onSocketAction. 
 */
export default function Home() {

  const [reponses, setResponses] = useState<Array<Response>>([])

  useEffect(() => {
    socket.on('numbers', data => {
      setResponses(oldArray => [...oldArray, data])
    })

    socket.on('events', data => {
      console.log(data)
      //Can be pushed to tostify
    })

    return () => {
      socket.off('numbers');
      socket.off('events');
    }
  }, [])

 /**
  * Sends an event to the server through a socket connection to perform an action related to a channel.
  * @param {String} action - The action to be performed. Can be 'start', 'stop' or 'setParam'.
  * @param {Number} channelNo - The number of the channel to perform the action on.
  * @param {Object} data - An object containing the data required to perform the action. For 'start' and 'setParam' actions, it must contain 'interval' and 'range' properties.
*/
  const onSocketAction = (action: String, channelNo: Number, data:any) => {
     if(action == "stop") { 
      socket.emit('events', {
        "action": action,
        "channelId": channelNo
      });
    } else if(action == "start" || action == "setParam") {
      socket.emit('events', {
        "action": action,
        "channelId": channelNo,
        "data": {
          "interval": data.interval,
          "range": data.range
        }
      });
    }
  }

  return (
    <>
      <main className={styles.main}>
        <BarChart
          color="rgba(0,0,255,.5)"
          onSocketAction = {onSocketAction}
          numbers={reponses.filter((response: Response) => response.channelNo == 1).map(response => response.value)}
          label="Channel 1"
          channelNo={1}></BarChart>
        <BarChart
          color="rgba(255,0,0,.4)"
          onSocketAction = {onSocketAction}
          numbers={reponses.filter((response: Response) => response.channelNo == 2).map(response => response.value)}
          label="Channel 2"
          channelNo={2}></BarChart>
      </main>
    </>
  )
}
