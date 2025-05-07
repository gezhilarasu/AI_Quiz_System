import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
function Landing() {
    const navigate = useNavigate();
    return(
        <div>
            <button onClick={() =>navigate('/login') }>Login</button>
            <button onClick={() =>navigate('/signUp') }>Sign_up</button>

        </div>
    )

}

export default Landing;
