import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const CardComponent = ({ title, value, description, onClick }) => {
  return (
    <Card sx={{ minWidth: 275, margin: 2 }} onClick={onClick}>
      <CardContent>
        <Typography variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="h4" component="div" sx={{ marginTop: 2 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ marginTop: 2 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CardComponent;