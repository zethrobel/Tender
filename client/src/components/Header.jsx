
import React from "react";


function Header() {
    return (
        <div >
           
        <header>
        <nav className="navbar row">
           <div className="container col-11">
               <a className="navbar-brand " href="#">
                    <img src="images/logo.jpg" alt="Bootstrap" width="30" height="24"/> <h1>TenderIntelligence</h1>
               </a>
    
           </div>
           
           <div className="btn-group col-1">
           <button 
                            className="btn dropdown-toggle user-menu btn-outline-success " 
                            type="button" 
                            data-bs-toggle="dropdown" 
                            aria-expanded="false"
                        >
                            
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li><a className="dropdown-item" href="/search">Product Search</a></li>
                            <li><a className="dropdown-item" href="/library">Product Library</a></li>
                            <li><a className="dropdown-item" href="/">Home</a></li>
                        </ul>
                    
                </div>
            </nav>
        </header>
        </div>

        
    )
}

export default Header