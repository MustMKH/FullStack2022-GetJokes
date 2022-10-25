import './App.css';
import React, { useReducer, useEffect } from 'react';
import axios from 'axios'

// ACTIONS:
let DATA_REQUESTED = 'DATA_REQUESTED'
let DATA_FETCH_INITIATED = 'DATA_FETCH_INITIATED'
let DATA_FETCH_COMPLETE = 'DATA_FETCH_COMPLETE'
let DATA_FETCH_FAILED = 'DATA_FETCH_FAILED'
let START_TIMER = 'START_TIMER'

function reducer(state, action) {
  console.log("Reducer() function called")
  switch (action.type) {

    case DATA_REQUESTED:
      console.log("User is requesting data.", action.payload)
      return { ...state, dataRequested: true }

    case START_TIMER:
      return { ...state, startTimer: true }

    case DATA_FETCH_INITIATED:
      console.log("Data fetch has begun.")
      return { ...state, dataFetchInitiated: true, dataRequested: false }
    
    case DATA_FETCH_COMPLETE:
      console.log("Data fetch is complete.")
      return { ...state, fetchedData: action.payload, dataRequested: false, dataFetchInitiated: false }

    case DATA_FETCH_FAILED:
      console.log("Data fetch has failed.")
      return { ...state, dataFetchFailed: true, dataFetchInitiated: false }
   
    default:
      throw new Error("Cannot read the value of action.type");

  }
}

function App() {
  console.log("React calling the App() function")
  // initial data:
  const [appData, dispatch] = useReducer(reducer, {fetchedData: "", dataFetchInitiated: false, dataFetchFailed: false, dataRequested: false, startTimer: false});

  useEffect(() => {
    console.log("Calling the useEffect() function")

    async function fetchData() {
      console.log("The fetchData async function called")
      try {
        dispatch({ type: DATA_FETCH_INITIATED })
        let result = await axios('https://api.chucknorris.io/jokes/random');
        dispatch({ type: DATA_FETCH_COMPLETE, payload: result.data.value })
        console.log(result.data.value)
      } catch (error) {
        console.log("Failed to retrieve data from server:", error)
        dispatch({ type: DATA_FETCH_FAILED })
      }
    }
    if (appData.dataRequested) {
      fetchData();
    }
  }, [appData.dataRequested]);

  // TOINEN USEEFFECT TÄHÄN:
  useEffect(() => {
    let timer
    if(appData.startTimer) {
      timer = setInterval(async() => {
        try {
          let result = await axios('https://api.chucknorris.io/jokes/random')
          dispatch({type: DATA_REQUESTED, payload: result.data.value})
        }
        catch (error) {
          console.log('Data retrieval error: ', error)
          dispatch({type: DATA_FETCH_FAILED})
        }
      }, 10000)
    }

    return () => clearTimeout(timer)
  }, [appData.startTimer])
  
  return (
    <div>
{/* NOTE: Huuto.net-versiossa mapattiin kategoriat listaksi: {appData.kategoriat.map(item => <div>{item.title}</div> )} */}
      <div>
          <input type="button" id="get-joke-button" onClick={(event) => {
            dispatch({type: DATA_REQUESTED, payload: {dataRequested: true}})}} value="Click here for a bad joke."/>
      </div>
            <div className='App'>{appData.dataFetchInitiated && "Fetching data"}</div>
              <h1>{appData.fetchedData !== "" && appData.fetchedData}</h1>
            <div>{appData.dataFetchFailed && "Failed to retrieve data"}</div>
    </div>
  );
}

export default App;
