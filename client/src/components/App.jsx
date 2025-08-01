import React,{useState} from "react"


import Home from "../pages/Home"
import Layout from "../pages/Layout"
import Nopage from "../pages/Nopage"
import OpenTender from "../pages/OpenTender"
import RFQ from "../pages/RFQ" 
import Product_Library from "../pages/ProductLibrary"
import Search from "../pages/Search"
import { BrowserRouter } from 'react-router-dom';

import { Route } from "react-router-dom"
import { Routes } from 'react-router-dom';

function App() {
  
    return (
        
        <BrowserRouter >
            <Routes >
                <Route path="/" element ={<Layout />} />
                <Route index element={<Home />}/>
                <Route path ="search" element={<Search />} />
                <Route path ="library" element={<Product_Library />} />
                <Route path ="rfq" element={<RFQ/>} />
                <Route path ="openTender" element={<OpenTender />} />
                <Route path ="*" element ={<Nopage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App