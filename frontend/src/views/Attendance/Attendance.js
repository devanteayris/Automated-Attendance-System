import React from  "react";

// GraphQL
import { gql, useMutation } from '@apollo/client';

// Reactstrap UI
import { 
    Card,
    CardHeader,
    CardBody,
    Container,
    Row,
    Col 
} from "reactstrap";

import sketch from "./Face";
import P5Wrapper from "react-p5-wrapper";

import Loader from '../../components/Loader/Loader';

import AlertDialog from '../../components/Alert/Alert';

// GraphQL Endpoints Consumed
const UPDATE_ATTENDANCE = gql `
mutation UpdateAttendance($image64: String!) {
    updateAttendance(image64: $image64) {
      success,
      attendance {
          id,
          createdAt,
          person {
            uuid,
            id,
            firstName,
            lastName,
            createdAt,
            personPhoto
          }
      }
      errors {
        title
        message
        }
        logged {
            title
            message
        }
    }
  }
`

function Attendance() {
    const [updateAttendance, { data: mutationData, loading: mutationLoading, error: mutationError }] = useMutation(UPDATE_ATTENDANCE, { 
        errorPolicy : 'all',
        update(cache, { data: { updateAttendance }}) {
            cache.modify({
                fields: {
                    allAttendance(existingAllAtendancerefs, { readField }) {
                        const newAttendanceRef = cache.writeFragment({
                            data: updateAttendance["attendance"],
                            fragment: gql `
                            fragment NewAttendance on Attendance {
                                id,
                                createdAt,
                                person
                            }
                            `
                        });
                        return [...existingAllAtendancerefs, newAttendanceRef]
                    }
                }
            })
        }
    });

    // Event Handler for Facial Recognition
    const markAttendance = async (image64) => {
        var image = image64.split("base64,")[1];
        updateAttendance({
            variables : {
                image64 : image
            }
        });
    };

    // Handler for rendering error alerts
    const renderAlert = () => {
        if(mutationData) {
            if(mutationData.updateAttendance.errors) {
                return (
                    <AlertDialog message={ mutationData.updateAttendance.errors[0].message } title={ mutationData.updateAttendance.errors[0].title }/>
                );
            }
            if(mutationData.updateAttendance.logged) {
                return (
                    <AlertDialog message={ mutationData.updateAttendance.logged[0].message } title={ mutationData.updateAttendance.logged[0].title }/>
                )
            }
        }
    }


    return (
        <Container fluid>
            <Loader message="Marking attendance..." active={ mutationLoading }/>
            { renderAlert() }
            <Row>
                <Col>
                    <Card>
                        <CardHeader className="bg-transparent">
                            <h3 className="mb-3">Attendance</h3>
                            <p>Note: After each scan that you have done, please refresh the page to enable a new scan to occur</p>
                        </CardHeader>
                        <CardBody>
                            <P5Wrapper sketch={sketch} markAttendance={markAttendance}/>
                            { mutationError ? <pre>Error: {mutationError.graphQLErrors.map(({ message }, i) => (
        <span key={i}>{message}</span>
      ))}
      </pre>: null}
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Attendance;