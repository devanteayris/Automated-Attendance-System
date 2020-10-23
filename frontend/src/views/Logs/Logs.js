import React from "react";

// GraphQL
import { useQuery, gql } from '@apollo/client';

import turnOffCamera from '../../views/Attendance/Camera';

import AttendanceTable from '../../components/Tables/AttendanceTable';

import LoadingOverlay from 'react-loading-overlay';

import {
    Row,
    Col,
    Container,
} from 'reactstrap';

import { IconButton } from '@material-ui/core';
import { Refresh } from '@material-ui/icons';

// GraphQL Endpoints Consumed
const GET_ATTENDANCE_RELAY = gql `
    query {
        allAttendances(orderBy: ["-createdAt"]) {
        edges {
            node {
            id,
            createdAt,
            personPhoto,
            person {
                uuid,
                id,
                firstName,
                lastName,
                createdAt,
                personPhoto
            }
            }
        }
        } 
    }
`;

const Logs = () => {
    turnOffCamera();
    const { loading, error, data, refetch } = useQuery(GET_ATTENDANCE_RELAY);

    if (loading) return <LoadingOverlay text="Loading Attendance Logs" active={ loading } spinner/>
    if (error) return `Error! ${error.message}`; 

    return (
        <Container fluid>
            <Row>
                <Col>
                    <IconButton onClick={() => refetch()}>
                        <Refresh/>
                    </IconButton>
                </Col>
            </Row>
            <AttendanceTable edges={data.allAttendances.edges}/>
        </Container>
    );
    
}

export default Logs;