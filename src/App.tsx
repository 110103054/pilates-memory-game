import React, { useState, useEffect } from 'react';
import { CssBaseline, ThemeProvider, createTheme, Typography } from '@mui/material';
import MemoryGame from './components/MemoryGame';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  const [movements, setMovements] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/movement.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(data => {
        console.log('CSV data loaded:', data.substring(0, 200)); // 只顯示前200個字符
        const rows = data.split('\n');
        // Skip the header row and get all movement names
        const movementNames = rows.slice(1).map(row => row.trim()).filter(Boolean);
        console.log('Parsed movements:', movementNames);
        setMovements(movementNames);
      })
      .catch(error => {
        console.error('Error loading movements:', error);
        setError(error.message);
      });
  }, []);

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Typography color="error" sx={{ p: 2 }}>
          Error loading movements: {error}
        </Typography>
      </ThemeProvider>
    );
  }

  if (movements.length === 0) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Typography sx={{ p: 2 }}>
          Loading movements...
        </Typography>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MemoryGame movements={movements} />
    </ThemeProvider>
  );
}

export default App;
