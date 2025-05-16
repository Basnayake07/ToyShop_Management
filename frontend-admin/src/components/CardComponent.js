import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const CardComponent = ({ title, value, description, icon, color, onClick }) => {
  return (
    <Card
      sx={{
        minWidth: 275,
        margin: 2,
        backgroundColor: color,
        color: '#fff',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          transform: onClick ? 'scale(1.05)' : 'none',
          transition: 'transform 0.3s ease',
        },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '2rem',
            marginBottom: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h5" component="div" sx={{ textAlign: 'center' }}>
          {title}
        </Typography>
        <Typography variant="h4" component="div" sx={{ textAlign: 'center', marginTop: 2 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ textAlign: 'center', marginTop: 2 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CardComponent;