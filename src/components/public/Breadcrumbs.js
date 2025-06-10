import React from "react";
import { Link } from 'react-router-dom';

const Breadcrumbs = ({breadcrumbs }) => { 
    return (
        <nav className="breadcrumbs">
         
            <Link to="/">Anasayfa </Link> 
            {
                breadcrumbs.map((value, index) => {
                    const pathname = value.path ? value.path : '';
                    const link = value.link ? value.link : '';
                    if (link == '') {
                        return (
                            <span key={index}>&nbsp;&nbsp;/ {decodeURIComponent(pathname)}</span>
                        );
                    }else {
                        return (
                            <Link key={index} to={link} replace={true}  >&nbsp;&nbsp;/ {decodeURIComponent(pathname)}</Link>
                        );
                    }
                     
                })
            }
    </nav>
    ); 
}
export default Breadcrumbs;