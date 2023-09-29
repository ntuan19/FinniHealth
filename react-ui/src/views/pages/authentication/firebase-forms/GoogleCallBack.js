import React, { useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';



const GoogleCallback = () => {
    const history = useHistory();

    useEffect(() => {
        // Extract token and user info from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('code');
        const user = JSON.parse(urlParams.get('user'));
        console.log(token,user)

        if (token && user) {
            // Store token and user info in local storage or other state management
            localStorage.setItem('code', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Redirect to the appropriate page
            history.push('/dashboard/default');
        } else {
            // Handle error
            console.error('Failed to authenticate with Google');
            history.push('/user/login');
        }
    }, [history]);

    return (
        <div>
            Helo
        </div>
    )
}
export default GoogleCallback