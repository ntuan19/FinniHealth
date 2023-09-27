import React, { useState } from 'react';
import { InputBase, IconButton, Paper } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    console.log('Searching:', searchTerm);
    
  };

  return (
    <Paper component="form" style={styles.root}>
      <InputBase
        style={styles.input}
        placeholder="Search"
        inputProps={{ 'aria-label': 'search' }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
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
