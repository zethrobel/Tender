
import React from 'react';
import ReactDOM from "react-dom/client";
import App from './components/App';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Nopage from "./pages/Nopage";
import Search from "./pages/Search";
import ProductLibrary from "./pages/ProductLibrary";

// Create a root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render your App component
root.render(
  
    <App />
  
);


