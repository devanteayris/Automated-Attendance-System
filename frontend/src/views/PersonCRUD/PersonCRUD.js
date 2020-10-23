import React, { useState } from "react";

// GraphQL
import { useQuery, gql, useMutation } from '@apollo/client';

import LoadingOverlay from 'react-loading-overlay';

import PeopleTable from '../../components/Tables/PeopleTable';
import AddPersonForm from '../../components/Forms/AddPersonForm';
import EditPersonForm from '../../components/Forms/EditPersonForm';

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import {
    Row,
    Col,
    Container,
} from 'reactstrap';

import turnOffCamera from '../../views/Attendance/Camera';

import { IconButton } from '@material-ui/core';
import { Refresh } from '@material-ui/icons';
// GraphQL Endpoints Consumed
const GET_PEOPLE = gql `
    query {
        allPeople {
            uuid,
            id,
            firstName,
            lastName,
            createdAt,
            personPhoto
        }
    }
`;

const DELETE_PERSON = gql `
    mutation DeletePerson($id: String!,) {
        deletePerson(id: $id) {
            success
        }
    }
`;


const UPDATE_PERSON = gql `
    mutation UpdatePerson(
        $firstName: String!,
        $lastName: String!,
        $id: String!
    ) {
        updatePerson(
            firstName: $firstName,
            lastName: $lastName,
            id: $id
        ) {
            success
            person {
                firstName,
                lastName,
                uuid,
                id,
                createdAt,
                personPhoto
            }
        }
    }
`


function PersonCRUD() {
    turnOffCamera();
    const [editing, setEditing] = useState(false);
    const initialPerson = {
        id: "",
        uuid: "",
        firstName: "",
        lastname: "",
        createdAt: "",
        personPhoto: "",
    };
    const [currentPerson, setCurrentPerson] = useState(initialPerson);

    const { loading, error, data, refetch } = useQuery(GET_PEOPLE);
    const [deletePerson] = useMutation(DELETE_PERSON, { errorPolicy: 'all'});
    const [updatePerson] = useMutation(UPDATE_PERSON, { errorPolicy: 'all'});

    const deletePersonHandler = id => {
        deletePerson({
            variables : {
                id: id
            },
            update(cache) {
                cache.modify({
                    fields : {
                        allPeople(existingAllPeopleRefs, { readField }) {
                            return existingAllPeopleRefs.filter(
                                personRef => id !== readField('id', personRef),
                            );
                        },
                    },
                });
            },
        });
    } 
    
    const editPerson = (id, person) => {
        setEditing(true);
        setCurrentPerson(person);
    }

    const updateCurrentPerson = (newPerson) => {
        updatePerson({
            variables : {
                firstName: newPerson.firstName,
                lastName: newPerson.lastName,
                id: newPerson.id
            },
            update(cache, { data: { updatePerson }}) {
                cache.modify({
                    fields: {
                        allPeople(existingAllPeopleRefs, { readField }) {
                            const newPersonRef = cache.writeFragment({
                                data: updatePerson["person"],
                                fragment: gql `
                                    fragment NewPerson on Person {
                                        id
                                        uuid
                                        firstName
                                        lastName
                                        personPhoto
                                        createdAt
                                    }
                                `
                            });
                            if (existingAllPeopleRefs.some(
                                ref => readField('id', ref) === updatePerson["person"].id
                              )) {
                                return existingAllPeopleRefs;
                              }
                            return [...existingAllPeopleRefs, newPersonRef]
                        }
                    }
                });
            }
        });
        setEditing(false);
    }

    if (loading) return <LoadingOverlay text="Loading People" active={ loading } spinner></LoadingOverlay>;
    if (error) return `Error! ${error.message}`;

    return (
        <Container fluid>
            <Popup open={editing} closeOnDocumentClick onClose={() => setEditing(false)}>
                <Container>
                    <EditPersonForm currentPerson={currentPerson} setEditing={setEditing} updatePerson={updateCurrentPerson}/>
                </Container>
            </Popup>
            <Row> 
            <Col xs="auto">
                <h2 className="h2 mb-2">Add Person</h2>
                <AddPersonForm/>
              </Col> 
              <Col >
                <Row>
                    <Col>
                        <IconButton onClick={() => refetch()}>
                            <Refresh/>
                        </IconButton>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <PeopleTable people={data.allPeople} deletePerson={deletePersonHandler} editPerson={editPerson}></PeopleTable>
                    </Col>
                </Row>        
              </Col>
            </Row>
        </Container>
    );

}

export default PersonCRUD;
