import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div>
            <h1>Welcome to Password Reset App</h1>
            <Link to="/forgot-password">Forgot Password?</Link>
        </div>
    );
};

export default HomePage;