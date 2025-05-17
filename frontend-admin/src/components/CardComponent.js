import React from 'react';
import { Card, Typography, CircularProgress, Box } from '@mui/material';

const CardComponent = ({ title, value, description, icon, color, onClick, loading = false }) => {
  return (
    <Card 
      className="card" 
      variant="outlined"
      onClick={onClick} 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        height: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        borderRadius: '12px',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)'
        },
        position: 'relative',
        '&::after': onClick ? {
          content: '""',
          position: 'absolute',
          bottom: '1rem',
          width: '80px',
          height: '2px',
          backgroundColor: color,
          transition: 'width 0.3s ease'
        } : {},
        '&:hover::after': onClick ? {
          width: '120px'
        } : {}
      }}
    >
      <Box 
        sx={{
          fontSize: '2rem',
          color: 'white',
          backgroundColor: color,
          borderRadius: '50%',
          padding: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.75rem'
        }}
      >
        {icon}
      </Box>
      
      <Typography 
        variant="h6" 
        component="h2"
        sx={{ 
          fontSize: '1.1rem',
          fontWeight: 600,
          color: '#2c3e50',
          marginBottom: '0.5rem'
        }}
      >
        {title}
      </Typography>
      
      <Typography 
        variant="h4" 
        component="div"
        sx={{ 
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#2c3e50',
          marginBottom: '0.5rem'
        }}
      >
        {loading ? (
          <CircularProgress size={30} thickness={3} sx={{ color: color }} />
        ) : (
          value
        )}
      </Typography>
      
      <Typography 
        variant="body2"
        sx={{ 
          fontSize: '0.9rem',
          color: '#7f8c8d'
        }}
      >
        {description}
      </Typography>
    </Card>
  );
};

export default CardComponent;