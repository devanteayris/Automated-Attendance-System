import React, { useState, useEffect } from 'react';

import {
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle
} from '@material-ui/core';

const Loader = (props) => {

    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(props.active);
    }, [props.active])

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <Dialog 
            disableBackdropClick={true}
            open={open} 
            onClose={handleClose}
        >
            <DialogTitle>
                {props.message}
            </DialogTitle>
            <DialogContent style={{textAlign: "center"}}>
                <CircularProgress/>
            </DialogContent>
        </Dialog>
    );
}

export default Loader;