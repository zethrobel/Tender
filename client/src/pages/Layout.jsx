
import {Outlet, Link} from "react-router-dom"
import  SearchIcon  from '@mui/icons-material/Search';

const Layout=()=>{
    return(
        <>
            <nav>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li> <Link to ="/search"><SearchIcon /></Link></li>
                    <li> <Link to ="/library">Product Library</Link></li>
                </ul>
            </nav>

            <Outlet />
        </>
    )
}

export default Layout