import { config } from '@swc/core/spack';
import axios from 'axios';
import React, { useState } from 'react';
import configData from '../../config';
import {
    Button,
    TextField,
    FormControl,
    FormLabel,
    IconButton,
    Paper,
    Typography,
    Box
  } from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';


function FormComponent({ onHide }) {
    const account = useSelector((state) => state.account);
    const [formData, setFormData] = useState({
        name: ' ',
        dob: ' ',
        status: ' ',
        addresses: [{ street: '', city: '', state: '', zipcode: '' }],
        fields: [{field_name:"",field_value:""}]
    });
    const [submitted, setSubmitted] = useState(false);
    const [apiResponse, setApiResponse] = useState('');

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleAddressChange = (e, index) => {
        const newAddresses = [...formData.addresses];
        newAddresses[index][e.target.name] = e.target.value;
        setFormData({
            ...formData,
            addresses: newAddresses
        });
    };

    const handleAddAddress = (e) => {
        e.preventDefault();
        setFormData({
            ...formData,
            addresses: [...formData.addresses, { street: '', city: '', state: '', zipcode: '' }]
        });
    };

    const removeAddress = (index) => {
        const newAddresses = formData.addresses.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            addresses: newAddresses
        });
    };

    const handleAddField = (e) =>{
        e.preventDefault();
        setFormData({
            ...formData,fields:[...formData.fields,{field_name:"",field_value:""}]
        })
    }
    const handleFieldChange = (e,index) => {
        const newField = [...formData.fields];
        newField[index][e.target.name] = e.target.value;
        setFormData({
            ...formData,
            fields: newField
        })
    }
    
    const removeField = (index) => {
        const newFields = formData.fields.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            fields: newFields
        });
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        const isValid = validateFormData();
        if (!isValid) return;

        const confirm = window.confirm('Is the information correct?');
        if (!confirm) return;

        try {
            const response = await axios.post(configData.API_SERVER + "users/add_patient", formData,{ headers: { "Authorization": `${account.token}` } });
            setApiResponse('Success');
            onHide();
        } catch (error) {
            setApiResponse('Something went wrong');
        }
        setFormData({
            name: ' ',
            dob: ' ',
            status: ' ',
            addresses: [{ street: '', city: '', state: '', zipcode: '' }],
            fields: [{field_name:"",field_value:""}]
        })
    };

    const validateFormData = () => {
        // Perform validation here (e.g., check email format, check if city or street is valid)
        // Return true if valid, otherwise false
        // Perform other validations here...
        return true;
    };

    return (
        <Paper style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Patient Form</Typography>
  
          <button 
            onClick={onHide} 
            type="button" 
            style={{ 
              background: 'red', 
              padding: '5px 10px', 
              border: 'none', 
              cursor: 'pointer', 
              opacity: 0, 
              transition: 'opacity 0.3s ease',
              position: 'absolute', 
              right: '10px', 
              top: '10px' 
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
            onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
          >
            X
          </button>
        </div>
                <form>
                    <FormControl margin="normal" fullWidth>
                        <FormLabel>Full Name:</FormLabel>
                        <TextField name="name" value={formData.name} onChange={handleInputChange} variant="outlined" />
                    </FormControl> 
                    <FormControl margin="normal" fullWidth>
                        <FormLabel>Date of Birth:</FormLabel>
                        <TextField name="dob" type="date" value={formData.dob} onChange={handleInputChange} variant="outlined" />
                    </FormControl>
                    <FormControl margin="normal" fullWidth>
                        <FormLabel>Status:</FormLabel>
                        <TextField name="status" value={formData.status} onChange={handleInputChange} variant="outlined" />
                    </FormControl>
                    {formData.addresses.map((address, index) => (
                        <FormControl key={index} margin="normal" fullWidth>
                            <FormLabel>Address:</FormLabel>
                            <TextField name="street" label="Street" value={address.street} onChange={(e) => handleAddressChange(e, index)} variant="outlined" />
                            <TextField name="city" label="City" value={address.city} onChange={(e) => handleAddressChange(e, index)} variant="outlined" />
                            <TextField name="state" label="State" value={address.state} onChange={(e) => handleAddressChange(e, index)} variant="outlined" />
                            <TextField name="zipcode" label="Zipcode" value={address.zipcode} onChange={(e) => handleAddressChange(e, index)} variant="outlined" />
                            {formData.addresses.length > 1 && (
                                <IconButton onClick={() => removeAddress(index)} color="secondary">
                                    <RemoveCircleOutlineIcon />
                                </IconButton>
                            )}
                        </FormControl>
                    ))}
                    <Button onClick={handleAddAddress} startIcon={<AddCircleOutlineIcon />} variant="contained" color="primary">Add Address</Button>
                    {formData.fields.map((field, index) => (
                        <FormControl key={index} margin="normal" fullWidth>
                            <TextField name="field_name" label="Field Name" value={field.field_name} onChange={(e) => handleFieldChange(e, index)} variant="outlined" />
                            <TextField name="field_value" label="Field Value" value={field.field_value} onChange={(e) => handleFieldChange(e, index)} variant="outlined" />
                            {formData.fields.length > 1 && (
                                <IconButton onClick={() => removeField(index)} color="secondary">
                                    <RemoveCircleOutlineIcon />
                                </IconButton>
                            )}
                        </FormControl>
                    ))}
                    <Button onClick={handleAddField} startIcon={<AddCircleOutlineIcon />} variant="contained" color="primary">Add Field</Button>
                    <Button type="button" onClick={handleSubmit} variant="contained" color="secondary" fullWidth style={{ marginTop: '20px' }}>
                        Submit
                    </Button>
                    
                    
                </form>
                {submitted && <div>{apiResponse}</div>}
            </Paper>
        );
}


function AddPatientButton() {
    const [showForm, setShowForm] = useState(false);


    return (
        <Box
            display="flex"
            justifyContent="left"
            alignItems="center"
            minHeight="10vh"
        >
            {!showForm ? (
                <Paper elevation={3} sx={{ p: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                        }}
                        onClick={() => setShowForm(true)}
                    >
                        Add New Patient
                    </Button>
                </Paper>
            ) : (
                <FormComponent onHide={() => setShowForm(false)} />
            )}
        </Box>
    )
}

export default AddPatientButton;


