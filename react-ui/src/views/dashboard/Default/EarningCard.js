import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
// material-ui
import { makeStyles } from '@material-ui/styles';
// import { Avatar, Grid, Menu, MenuItem, Typography } from '@material-ui/core';

// project imports
import MainCard from './../../../ui-component/cards/MainCard';
import SkeletonEarningCard from './../../../ui-component/cards/Skeleton/EarningCard';

// // assets
// import EarningIcon from './../../../assets/images/icons/earning.svg';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
// import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
// import GetAppTwoToneIcon from '@material-ui/icons/GetAppOutlined';
// import FileCopyTwoToneIcon from '@material-ui/icons/FileCopyOutlined';
// import PictureAsPdfTwoToneIcon from '@material-ui/icons/PictureAsPdfOutlined';
// import ArchiveTwoToneIcon from '@material-ui/icons/ArchiveOutlined';
// import PropTypes from 'prop-types';
import { Grid, Typography, Avatar, Button, IconButton, FormControl, FormLabel, TextField, Menu, MenuItem } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import { useSelector } from 'react-redux';
import configData from "/Users/ntuan_195/react-flask-authentication/react-ui/src/config.js"
// style constant
const useStyles = makeStyles((theme) => ({
    card: {
        backgroundColor: theme.palette.secondary.dark,
        color: '#fff',
        overflow: 'hidden',
        position: 'relative',
        '&:after': {
            content: '""',
            position: 'absolute',
            width: '210px',
            height: '210px',
            background: theme.palette.secondary[800],
            borderRadius: '50%',
            top: '-85px',
            right: '-95px',
            [theme.breakpoints.down('xs')]: {
                top: '-105px',
                right: '-140px'
            }
        },
        '&:before': {
            content: '""',
            position: 'absolute',
            width: '210px',
            height: '210px',
            background: theme.palette.secondary[800],
            borderRadius: '50%',
            top: '-125px',
            right: '-15px',
            opacity: 0.5,
            [theme.breakpoints.down('xs')]: {
                top: '-155px',
                right: '-70px'
            }
        }
    },
    content: {
        padding: '20px !important'
    },
    avatar: {
        ...theme.typography.commonAvatar,
        ...theme.typography.largeAvatar,
        backgroundColor: theme.palette.secondary[800],
        marginTop: '8px'
    },
    avatarRight: {
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        backgroundColor: theme.palette.secondary.dark,
        color: theme.palette.secondary[200],
        zIndex: 1
    },
    cardHeading: {
        fontSize: '2.125rem',
        fontWeight: 500,
        marginRight: '8px',
        marginTop: '14px',
        marginBottom: '6px'
    },
    subHeading: {
        fontSize: '1rem',
        fontWeight: 500,
        color: theme.palette.secondary[200]
    },
    avatarCircle: {
        cursor: 'pointer',
        ...theme.typography.smallAvatar,
        backgroundColor: theme.palette.secondary[200],
        color: theme.palette.secondary.dark
    },
    circleIcon: {
        transform: 'rotate3d(1, 1, 1, 45deg)'
    },
    menuItem: {
        marginRight: '14px',
        fontSize: '1.25rem'
    }
}));

//===========================|| DASHBOARD DEFAULT - EARNING CARD ||===========================//


const EarningCard = ({ isLoading }) => {
    const classes = useStyles();

    const [statusAnchor, setStatusAnchor] = useState(null);
    const [statusCounts, setStatusCounts] = useState({});
    const [selectedStatus, setSelectedStatus] = useState('Total Patients');
    const [selectedStatusCount, setSelectedStatusCount] = useState(0);
    const account = useSelector((state) => state.account);

    useEffect(() => {
        async function fetchStatusCounts() {
            try {
                const response = await axios.get(`${configData.API_SERVER}/users/status_counts`,{ headers: { "Authorization": `${account.token}` }});
                if (response.data.success) {
                    setStatusCounts(response.data.status_counts);
                    setSelectedStatusCount(Object.values(response.data.status_counts).reduce((a, b) => a + b, 0));
                }
            } catch (error) {
                console.error("Failed to fetch patient status counts", error);
            }
        }
        fetchStatusCounts();
    }, []);

    const handleStatusClick = (event) => {
        setStatusAnchor(event.currentTarget);
    };

    const handleStatusClose = () => {
        setStatusAnchor(null);
    };

    const handleStatusSelect = (status) => {
        setSelectedStatus(status);
        setSelectedStatusCount(statusCounts[status]);
        setStatusAnchor(null);
    };

    return (
        <React.Fragment>
            {isLoading ? (
                // Assuming you've defined a SkeletonEarningCard elsewhere in your project
                <SkeletonEarningCard />
            ) : (
                <MainCard border={false} className={classes.card} contentClass={classes.content}>
                    <Grid container direction="column">
                        <Grid item>
                        <IconButton aria-controls="menu-status" aria-haspopup="true" onClick={handleStatusClick} style={{position: 'absolute', top: '10px', right: '20px', zIndex: 1000}}>
                            <MoreVertIcon />
                        </IconButton>

                            <Menu
                                id="menu-status"
                                anchorEl={statusAnchor}
                                keepMounted
                                open={Boolean(statusAnchor)}
                                onClose={handleStatusClose}
                            >
                                {['Inquiry', 'Onboarding', 'Active', 'Churned'].map(status => (
                                    <MenuItem onClick={() => handleStatusSelect(status)} key={status}>
                                        {status}
                                    </MenuItem>
                                ))}
                            </Menu>
                            <Typography className={classes.cardHeading}>{selectedStatusCount}</Typography>
                            <Typography className={classes.subHeading}>{selectedStatus}</Typography>
                        </Grid>
                    </Grid>
                </MainCard>
            )}
        </React.Fragment>
    );
};


        // <React.Fragment>
        //     {isLoading ? (
        //         <SkeletonEarningCard />
        //     ) : (
        //         <MainCard border={false} className={classes.card} contentClass={classes.content}>
        //             <Grid container direction="column">
        //                 <Grid item>
        //                     <Grid container justifyContent="space-between">
        //                         <Grid item>
        //                             <Avatar variant="rounded" className={classes.avatar}>
        //                                 <img src={EarningIcon} alt="Notification" />
        //                             </Avatar>
        //                         </Grid>
        //                         <Grid item>
        //                             <Avatar
        //                                 variant="rounded"
        //                                 className={classes.avatarRight}
        //                                 aria-controls="menu-earning-card"
        //                                 aria-haspopup="true"
        //                                 onClick={handleClick}
        //                             >
        //                                 <MoreHorizIcon fontSize="inherit" />
        //                             </Avatar>
        //                             <Menu
        //                                 id="menu-earning-card"
        //                                 anchorEl={anchorEl}
        //                                 keepMounted
        //                                 open={Boolean(anchorEl)}
        //                                 onClose={handleClose}
        //                                 variant="selectedMenu"
        //                                 anchorOrigin={{
        //                                     vertical: 'bottom',
        //                                     horizontal: 'right'
        //                                 }}
        //                                 transformOrigin={{
        //                                     vertical: 'top',
        //                                     horizontal: 'right'
        //                                 }}
        //                             >
        //                                 <MenuItem onClick={handleClose}>
        //                                     <GetAppTwoToneIcon fontSize="inherit" className={classes.menuItem} /> Import Card
        //                                 </MenuItem>
        //                                 <MenuItem onClick={handleClose}>
        //                                     <FileCopyTwoToneIcon fontSize="inherit" className={classes.menuItem} /> Copy Data
        //                                 </MenuItem>
        //                                 <MenuItem onClick={handleClose}>
        //                                     <PictureAsPdfTwoToneIcon fontSize="inherit" className={classes.menuItem} /> Export
        //                                 </MenuItem>
        //                                 <MenuItem onClick={handleClose}>
        //                                     <ArchiveTwoToneIcon fontSize="inherit" className={classes.menuItem} /> Archive File
        //                                 </MenuItem>
        //                             </Menu>
        //                         </Grid>
        //                     </Grid>
        //                 </Grid>
        //                 <Grid item>
        //                     <Grid container alignItems="center">
        //                         <Grid item>
        //                             <Typography className={classes.cardHeading}>$500.00</Typography>
        //                         </Grid>
        //                         <Grid item>
        //                             <Avatar className={classes.avatarCircle}>
        //                                 <ArrowUpwardIcon fontSize="inherit" className={classes.circleIcon} />
        //                             </Avatar>
        //                         </Grid>
        //                     </Grid>
        //                 </Grid>
        //                 <Grid item sx={{ mb: 1.25 }}>
        //                     <Typography className={classes.subHeading}>Total Earning</Typography>
        //                 </Grid>
        //             </Grid>
        //         </MainCard>
        //     )}
        // </React.Fragment>
// };

EarningCard.propTypes = {
    isLoading: PropTypes.bool
};

export default EarningCard;
