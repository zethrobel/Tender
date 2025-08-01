

import React from "react";
import ReactDOM  from 'react-dom/client';
import SearchArea from "../components/SearchArea";
import Header from './../components/Header';



function Search(){
    return(
        <>
                <div>
                     <Header />
                     <SearchArea />
                     
                     {/* <Footer /> */}
                 </div>

        </>
    )
}

export default Search
