

import React, { useState,useRef } from 'react';
import axios from 'axios';  // Assuming you use axios for API calls
import { Select, MenuItem, InputBase, IconButton, Paper, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { useSelector } from 'react-redux';
import debounce from 'lodash/debounce'; 
import configData from '../../config';

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

function SearchBar({onSearch}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('general');
  const account = useSelector((state) => state.account);
  const [loading, setLoading] = useState(false); // Loading indicator state
  const [cachedResults, setCachedResults] = useState({}); // Cache for search results
  const debouncedSearch = useRef(debounce((term, type) => handleSearch(term, type), 500)).current;

  const handleSearch = async (term, type) => {
    setLoading(true);
    console.log("handleSearch here ", term,type)
    try {
      if (cachedResults[term]) {
        // Use cached results if available
        onSearch(cachedResults[term]);
      } else {
        console.log("Failed here")
        console.log(configData.API_SERVER)
        console.log("users/search?query=${term}&type=${type}")
        const response = await axios.get(configData.API_SERVER+`users/search?query=${term}&type=${type}`, {
          headers: { Authorization: `${account.token}` },
        });
        console.log("DAta responsed", response.data)
        if (response.data.success) {
          const results = response.data.patients;
          setCachedResults((prevCachedResults) => ({ ...prevCachedResults, [term]: results }));
          onSearch(results);
        } else {
          console.error("Search failed");
        }
      }
    } catch (error) {
      console.error("There was an error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { value } = e.target;
    setSearchTerm(value);
    debouncedSearch(value, searchType);
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
            <IconButton style={styles.iconButton} aria-label="search" onClick={() => handleSearch(searchTerm, searchType)}>
                <SearchIcon />
            </IconButton>
        </Paper>
    );
}


export default SearchBar;
