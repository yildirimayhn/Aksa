import React from 'react';
import { Link } from 'react-router-dom';

function AttendedEvents() {
    return (
        <div>
            <h2>Attended Events</h2>
            <Link to="/events">Events</Link>
        </div>
    );
}

export default AttendedEvents;