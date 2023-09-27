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
import Button from './views/patient_dashboard/button';
import PatientDataComponent from './views/patient_dashboard/datacomponent';
import EarningCard from './ui-component/cards/Skeleton/EarningCard';
import SearchBar from './views/patient_dashboard/searchbar';

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
       
        //     <ThemeProvider theme={theme(customization)}>
        //         <CssBaseline />
        //         <NavigationScroll>
        //             <Routes />
        //         </NavigationScroll>
        //     </ThemeProvider>
    );
};

export default App;
