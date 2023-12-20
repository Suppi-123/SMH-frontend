import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';


import Login from './components/login';
import Register from './components/Register'; 

const App = () => {
  return (
   <div>
    <Login/>
    <Register/>
   </div>
  );
};

export default App;

