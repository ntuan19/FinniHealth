import React from 'react';
import axios from 'axios';
import configData from "../../../../config";
import { useHistory } from 'react-router';
import { useDispatch } from 'react-redux';
import { ACCOUNT_INITIALIZE } from './../../../../store/actions';
import { useGoogleLogin } from "@react-oauth/google";
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/styles';
import Google from './../../../../assets/images/icons/social-google.svg';

const useStyles = makeStyles((theme) => ({
    redButton: {
        fontSize: '1rem',
        fontWeight: 500,
        backgroundColor: theme.palette.grey[50],
        border: '1px solid',
        borderColor: theme.palette.grey[100],
        color: theme.palette.grey[700],
        textTransform: 'none',
        '&:hover': {
            backgroundColor: theme.palette.primary.light
        },
        [theme.breakpoints.down('sm')]: {
            fontSize: '0.875rem'
        }
    },
    signDivider: {
        flexGrow: 1
    },
    signText: {
        cursor: 'unset',
        margin: theme.spacing(2),
        padding: '5px 56px',
        borderColor: theme.palette.grey[100] + ' !important',
        color: theme.palette.grey[900] + '!important',
        fontWeight: 500
    },
    loginIcon: {
        marginRight: '16px',
        [theme.breakpoints.down('sm')]: {
            marginRight: '8px'
        }
    },
    loginInput: {
        ...theme.typography.customInput
    }
}));


export const LoginButton = ({ textInfor }) => {
    const classes = useStyles();
    const history = useHistory();
    const dispatcher = useDispatch();

    const handleSuccess = async (tokenResponse) => {
        try {
            const response = await axios.post(`${configData.API_SERVER}users/oauth_google`, tokenResponse);
            const data_retrieve = response.data;
            if (data_retrieve.status && data_retrieve.token) {
                dispatcher({
                    type: ACCOUNT_INITIALIZE,
                    payload: {
                        isLoggedIn: true,
                        user: data_retrieve.user,
                        token: data_retrieve.token
                    }
                });
                history.push('/dashboard/default');
            }
        } catch (error) {
            if (error.response && error.response.status !== 200) {
                console.error('Server Internal Error', error.response.status);
            } else {
                console.error('Error sending data to the server', error);
            }
        }
    };

    const login = useGoogleLogin({
        onSuccess: handleSuccess,
        flow: 'auth-code'
    });

    return (
        <Button
            disableElevation
            fullWidth={true}
            className={classes.redButton}
            onClick={login}
            size="large"
            variant="contained"
                        >
            <img src={Google} alt="google" width="20px" className={classes.loginIcon} /> {textInfor}
        </Button>
    );
}
