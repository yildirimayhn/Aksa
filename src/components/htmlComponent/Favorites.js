import React from 'react';
import { Link } from 'react-router-dom';

function Favorites() {
    return (
        <div>
            <h2>Favorites</h2>
            <Link to="/favorites">Favorites</Link>
        </div>
    );
}

export default Favorites;
    