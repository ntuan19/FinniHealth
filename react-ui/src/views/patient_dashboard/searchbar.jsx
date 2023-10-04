

import React, { useState } from 'react';
import axios from 'axios';  // Assuming you use axios for API calls
import { Select, MenuItem, InputBase, IconButton, Paper, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

function SearchBar() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('general'); // State for search type

    const handleSearch = async () => {
        try {
            const response = await axios.get(`/api/users/search?query=${searchTerm}&type=${searchType}`);
            if (response.data.success) {
                console.log(response.data.patients);
            } else {
                console.error("Search failed");
            }
        } catch (error) {
            console.error("There was an error searching:", error);
        }
    };

    return (
        <Paper component="form" style={styles.root}>
            { searchType === 'dob' ? 
                <TextField
                    type="date"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                :
                <InputBase
                    style={styles.input}
                    placeholder="Search"
                    inputProps={{ 'aria-label': 'search' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            }
            <Select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
            >
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="dob">DOB</MenuItem>
                <MenuItem value="address">Address</MenuItem>
                <MenuItem value="field_name">Field Name</MenuItem>
            </Select>
            <IconButton style={styles.iconButton} aria-label="search" onClick={handleSearch}>
                <SearchIcon />
            </IconButton>
        </Paper>
    );
}

const styles = {
  root: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '24px',
    padding: '2px',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#f4f4f9',
    margin: '20px',
  },
  input: {
    marginLeft: '8px',
    flex: 1,
  },
  iconButton: {
    padding: 10,
    color: '#1976d2',
  },
};

export default SearchBar;
