import axios from 'axios';
import React, { useEffect, useState } from 'react';
import configData from '../../config';
import './styles.css';
import { Card, CardContent, Typography, Box, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import AddPatientButton from './button';
import SearchBar from './searchbar';
import { useSelector } from 'react-redux';
import {store} from "/Users/ntuan_195/react-flask-authentication/react-ui/src/store/index.js";


function ListInfoEdit({ listInfo, onChange, index }) {
    return (
        <div>
            {Object.entries(listInfo).map(([key, value]) => (
                <div key={key}>
                    <label>{key}:</label>
                    <input value={value} onChange={(e) => onChange(index, { ...listInfo, [key]: e.target.value })} />
                </div>
            ))}
        </div>
    );
}

function PatientEdit({ patient, onSave }) {
    const [editedPatient, setEditedPatient] = useState(patient);
    const currentState = store.getState();
    const account = useSelector((state) => state.account);

    
    const handleSave = async () => {
        try {
            const response = await axios.put(`${configData.API_SERVER}users/update_patient/${editedPatient.id}`, editedPatient,{ headers: { "Authorization": `${account.token}` } });
            if (response.data.success) {
                onSave(editedPatient);
            } else {
                console.error('Error updating patient:', response.data.message);
            }
        } catch (error) {
            console.error('API request failed:', error);
        }
    };
    const handleChange = (index, updatedInfo) => {
        setEditedPatient({
            ...editedPatient,
            addresses: editedPatient.addresses.map((address, i) => (i === index ? updatedInfo : address))
        });
        setEditedPatient({
            ...editedPatient,
            fields: editedPatient.fields.map((field, i) => (i === index ? updatedInfo : field))
        });
    };

    return (
        <div>
            {Object.entries(editedPatient).map(([key, value]) => {
                if (key !== 'id' && key !== 'addresses' && key !== 'fields') {
                    return (
                        <div key={key}>
                            <label>{key}:</label>
                            <input value={value} onChange={(e) => setEditedPatient({ ...editedPatient, [key]: e.target.value })} />
                        </div>
                    );
                } else if (key === 'addresses' || key === 'fields') {
                    return (
                        <div key={key}>
                            <label>{key}:</label>
                            {value.map((info, index) => (
                                <ListInfoEdit key={index} listInfo={info} onChange={handleChange} index={index} />
                            ))}
                        </div>
                    );
                } else {
                    return null;
                }
            })}
            <button onClick={handleSave}>Save</button>
        </div>
    );
}

function Patient({ patient, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);

    const handleUpdate = (updatedPatient) => {
        onUpdate(updatedPatient);
        setIsEditing(false);
    };

    return (
        <Card className="patient_block">
            {isEditing ? (
                <PatientEdit patient={patient} onSave={handleUpdate} />
            ) : (
                <Box>
                    <CardContent className="contentBox">
                        <Typography variant="h6" className="boldText">
                            Name: {patient.name}
                        </Typography>
                        <Typography variant="body1" className="boldText">
                            DOB: {patient.dob}
                        </Typography>
                        <Typography variant="body1" className="boldText">
                            Status: {patient.status}
                        </Typography>
                        {patient.addresses.map((address) => (
                            <Box className="address">
                                <Typography variant="body2">Street: {address.street}</Typography>
                                <Typography variant="body2">State: {address.state}</Typography>
                                <Typography variant="body2">City: {address.city}</Typography>
                                <Typography variant="body2">Zipcode: {address.zipcode}</Typography>
                            </Box>
                        ))}
                        {patient.fields.map((field) => (
                            <Box className="field">
                                <Typography variant="body2">Field Name: {field.field_name}</Typography>
                                <Typography variant="body2">Field Value: {field.field_value}</Typography>
                            </Box>
                        ))}
                    </CardContent>
                    <Button variant="contained" className="editButton" onClick={() => setIsEditing(true)}>
                        Edit
                    </Button>
                </Box>
            )}
        </Card>
    );
}

// export default function PatientDataComponent({addPatient,searchPatient}) {
//     const [patientData, setPatientData] = useState([]);

//     const account = useSelector((state) => state.account);
    
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const response = await axios.get(configData.API_SERVER + 'users/dashboard',{ headers: { "Authorization": `${account.token}` } });
//                 if (response.data.status_code === 200) {
//                     const rawData = response.data.patients;
//                     const arrayPatientData = Object.values(rawData);
//                     setPatientData(arrayPatientData);
//                 } else {
//                     console.error('Error fetching patients, status_code', response.data.status_code);
//                 }
//             } catch (error) {
//                 console.log('Error fetching data', error);
//             }
//         };
//         fetchData();
//     }, [searchPatient,addPatient]);

//     const handleUpdate = (updatedPatient) => {
//         setPatientData((prevState) => prevState.map((patient) => (patient.id === updatedPatient.id ? updatedPatient : patient)));
//     };

//     return (
//         <div className="container">
//         <div className="button-wrapper">
//             <AddPatientButton />
//         </div>
//         <div className="page_wrapper">
//             {patientData.map((patient) => (
//                 <Patient key={patient.id} patient={patient} onUpdate={handleUpdate} />
//             ))}
//         </div>
//          </div>
       
//     );
// }
function PatientDataComponent({ addPatient }) {
    const [patientData, setPatientData] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const account = useSelector((state) => state.account);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get(configData.API_SERVER + 'users/dashboard', {
            headers: { Authorization: `${account.token}` },
          });
          if (response.data.status_code === 200) {
            const rawData = response.data.patients;
            const arrayPatientData = Object.values(rawData);
            setPatientData(arrayPatientData);
          } else {
            console.error('Error fetching patients, status_code', response.data.status_code);
          }
        } catch (error) {
          console.log('Error fetching data', error);
        }
      };
      fetchData();
    }, [addPatient]);
  
    const handleSearch = (results) => {
      setSearchResults(results);
    };
    const handleUpdate = (updatedPatient) => {
        setPatientData((prevState) => prevState.map((patient) => (patient.id === updatedPatient.id ? updatedPatient : patient)));
            };
  
    const dataToDisplay = searchResults.length > 0 ? searchResults : patientData;
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        width: '100%'
    };
    
    const searchBarAndButtonContainerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
    };
    
    const searchBarWrapperStyle = {
        flex: 1,
        marginRight: '20px' // gives some space between the search bar and the button
    };
    
    return (
        <div style={containerStyle}>
        <div style={searchBarAndButtonContainerStyle}>
            <div style={searchBarWrapperStyle}>
                <SearchBar onSearch={handleSearch}/>
            </div>
            <AddPatientButton />
        </div>
        
        <div className="page_wrapper">
            {dataToDisplay.map((patient) => (
                <Patient key={patient.id} patient={patient} onUpdate={handleUpdate} />
            ))}
        </div>
    </div>
     
    );
  }
export default PatientDataComponent;