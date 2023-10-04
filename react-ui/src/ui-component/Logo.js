import React from 'react';

import { useTheme } from '@material-ui/styles';
import logo from "/Users/ntuan_195/react-flask-authentication/react-ui/src/assets/images/finni.svg"


const Logo = () => {
    const theme = useTheme();
    return (
        <img src={logo} alt="Berry" width="100" />
    );
};

export default Logo;
