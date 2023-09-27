import React, { lazy } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import Loadable from '../ui-component/Loadable';

// project imports
import MinimalLayout from './../layout/MinimalLayout';

// login option 3 routing
const AuthLogin = Loadable(lazy(() => import('../views/pages/authentication/authentication3/Login3')));
const AuthRegister = Loadable(lazy(() => import('../views/pages/authentication/authentication3/Register3')));

//-----------------------|| AUTHENTICATION ROUTING ||-----------------------//

const AuthenticationRoutes = () => {
    const location = useLocation();

    return (
        <Route path={['/user/login', '/user/register']}>
            <MinimalLayout>
                <Switch location={location} key={location.pathname}>
                    <Route path="/user/login" component={AuthLogin} />
                    <Route path="/user/register" component={AuthRegister} />
                </Switch>
            </MinimalLayout>
        </Route>
    );
};

export default AuthenticationRoutes;
