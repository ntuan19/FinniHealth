import React from 'react';

// material-ui
import { Link, Typography, Stack } from '@material-ui/core';

//-----------------------|| FOOTER - AUTHENTICATION 2 & 3 ||-----------------------//

const AuthFooter = () => {
    return (
        <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle2" component={Link} href="" target="_blank" underline="hover">
                Finni Health 
            </Typography>
            <Typography variant="subtitle2" component={Link} href="" target="_blank" underline="hover">
            </Typography>
        </Stack>
    );
};

export default AuthFooter;
