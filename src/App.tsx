import React, { useState, useEffect } from 'react';
import { Container, Typography, ThemeProvider, createTheme } from '@mui/material';
import MemoryGame from './components/MemoryGame';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    success: {
      main: '#4caf50',
    },
    error: {
      main: '#f44336',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          '&.Mui-disabled': {
            opacity: 1,
          },
        },
        contained: {
          '&.Mui-disabled': {
            backgroundColor: 'inherit',
            color: 'inherit',
          },
        },
      },
    },
  },
});

function App() {
  const [movements, setMovements] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/movement.csv')
      .then(async response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const allRows = text.split('\n');
        console.log('Total rows in CSV:', allRows.length);
        const movementNames = allRows
          .slice(1, 91) // Only take rows 2 to 91 (index 1 to 90)
          .map(row => row.trim().replace(/\r/g, '')) // Remove carriage returns
          .filter(row => row.length > 0 && !row.includes('\r')); // Remove empty lines and lines with carriage returns
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
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Typography color="error" sx={{ p: 2 }}>
            Failed to load movements: {error}
          </Typography>
        </Container>
      </ThemeProvider>
    );
  }

  if (movements.length === 0) {
    return (
      <ThemeProvider theme={theme}>
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Typography sx={{ p: 2 }}>
            Loading movements...
          </Typography>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <MemoryGame movements={movements} />
      </Container>
    </ThemeProvider>
  );
}

export default App;
