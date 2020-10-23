import React from 'react';

import {
    Container,
    Row,
    Col
} from 'reactstrap';

import turnOffCamera from '../../views/Attendance/Camera';

import {
    Typography
} from '@material-ui/core';

const Home = () => {
    turnOffCamera();
    return (
        <Container>
            <Row>
                <Col>
                    <Typography variant="h3" component="h3">
                        Facial Recognition Attendance System
                    </Typography>
                </Col>
            </Row>
        </Container>
    );
};


export default Home;