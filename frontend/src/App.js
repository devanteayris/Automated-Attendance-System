import React from 'react';
import './App.css';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import * as faceapi from 'face-api.js';

// View Test
import Attendance from './views/Attendance/Attendance';
import PersonCRUD from './views/PersonCRUD/PersonCRUD';
import Logs from './views/Logs/Logs';
import Home from './views/Home/Home';

import NavBar from './components/NavBar/NavBar';

import { createUploadLink } from 'apollo-upload-client';

// Can Check for Progress
import customFetch from "./customfetch";

const MODEL_URL = "/models"

const client = new ApolloClient({
  link: createUploadLink({ uri: 'https://face-records.herokuapp.com/graphql', fetch: customFetch }),
  cache: new InMemoryCache(),
  defaultOptions: {
    mutate: { errorPolicy: 'all' },
  },
});

// Syncrhonous Function because Models must load first
const loadModels = function() {
  faceapi.loadSsdMobilenetv1Model('https://face-models-attendance.s3.amazonaws.com/models/');
  faceapi.loadAgeGenderModel('https://face-models-attendance.s3.amazonaws.com/models/');
  faceapi.loadFaceExpressionModel('https://face-models-attendance.s3.amazonaws.com/models/');

  return (
    <div>Loading Models for Facial Recognition....</div>
  );
}

loadModels();
  
function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
      <NavBar/>
        <Switch>
          <Route exact path="/all-people" component={PersonCRUD}/>
          <Route exact path="/mark-attendance" component={Attendance}/>
          <Route exact path="/attendance-logs" component={Logs}/>
          <Route exact path="/" component={Home}/>
          <Route path="*" component={() => "404 NOT FOUND"}/>
        </Switch>
      </Router>
    </ApolloProvider>
  );
}

export default App;
