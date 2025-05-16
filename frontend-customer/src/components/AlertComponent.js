import React, { useEffect} from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';

export default function AlertComponent({ severity, title, message, onClose, sx }) {
    useEffect(() => {
        const timer = setTimeout(() => {
          onClose();
        }, 3000);
        return () => clearTimeout(timer);
        }, [onClose]);

    return (
        <Stack sx={{ width: '100%', ...sx }} spacing={2}>
        <Alert severity={severity} onClose={onClose}>
            {title && <AlertTitle>{title}</AlertTitle>}
            {message}
        </Alert>
        </Stack>
    );
}