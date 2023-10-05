import React from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider, CssBaseline, StyledEngineProvider } from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';

// routing
import Routes from './routes';

// defaultTheme
import theme from './themes';

// project imports
import NavigationScroll from './layout/NavigationScroll';

//-----------------------|| APP ||-----------------------//


const App = () => {
    const customization = useSelector((state) => state.customization);

    return (
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme(customization)}>
                  <CssBaseline />
                   <NavigationScroll>
                    <Routes />
                </NavigationScroll>
          </ThemeProvider>
        </StyledEngineProvider>
    );
};

export default App;
