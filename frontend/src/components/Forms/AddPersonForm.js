import React, { useState } from 'react';

import { gql, useMutation } from '@apollo/client';

import {
    Form,
    Button,
    FormGroup,
    Label,
    Input,
    Progress,
    Container
} from 'reactstrap'

import AlertDialog from '../../components/Alert/Alert';

// GraphQL Endpoints Consumed
const ADD_PERSON = gql `
    mutation AddPerson(
        $firstName: String!,
        $lastName: String!,
        $image64: Upload!
    ) {
        addPerson(
            firstName: $firstName,
            lastName: $lastName,
            image64: $image64
        ) {
            success
            person {
                uuid,
                id,
                firstName,
                lastName,
                personPhoto,
                createdAt
            }
            logged {
                title,
                message
            }
            errors {
                title,
                message
            }
        }
    }
`;



const AddPersonForm = (props) => {
    let firstName;
    let lastName;
    let personPhoto;

    const [addPerson, { data: mutationData, loading: mutationLoading }] = useMutation(ADD_PERSON, {
        errorPolicy: 'all',
        update(cache, { data: { addPerson }}) {
            cache.modify({
                fields: {
                    allPeople(existingAllPeopleRefs, { readField }) {
                        if(addPerson["person"]) {
                            const newPersonRef = cache.writeFragment({
                                data: addPerson["person"],
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
                            return [...existingAllPeopleRefs, newPersonRef]
                        }
                    }
                }
            })
        }
    });

    // Handler for rendering error alerts
    const renderAlert = () => {
        if(mutationData) {
            if(mutationData.addPerson.errors) {
                return (
                    <AlertDialog message={ mutationData.addPerson.errors[0].message } title={ mutationData.addPerson.errors[0].title }/>
                );
            }
            if(mutationData.addPerson.logged) {
                return (
                    <AlertDialog message={ mutationData.addPerson.logged[0].message } title={ mutationData.addPerson.logged[0].title }/>
                )
            }
        }
    }

    const [progress, setProgress] = useState(0);
    return (
        <Container fluid>
            { renderAlert() }
            <Form onSubmit={e => {
            e.preventDefault();
            
            var file = personPhoto.files[0];
            
            let abort;
            addPerson({
                variables : {
                    firstName: firstName.value,
                    lastName: lastName.value,
                    image64: file,
                },
                context: {
                    fetchOptions : {
                        useUpload: true,
                        onProgress: (ev) => {
                            setProgress(ev.loaded / ev.total * 100);
                        },
                        onAbortPossible: (abortHandle) => {
                            abort = abortHandle;
                        }
                    }
                },
            }).catch(err => console.log(err));
        }}>
        <FormGroup>
            <Label>First Name</Label>
            <Input required innerRef={node => {
                firstName = node;
            }}/>
        </FormGroup>
        <FormGroup>
            <Label>Last Name</Label>
            <Input required innerRef={node => {
                lastName = node;
            }}/>
        </FormGroup>
        <FormGroup>
            <Label>Photo of Person</Label>
            <Input required type="file" innerRef={node => {
                personPhoto = node;
            }}></Input>
        </FormGroup>
        <FormGroup>
            <Button type="submit" color="primary">Add Person</Button>
        </FormGroup>
        <FormGroup>
            { mutationLoading && <Progress value={progress}/>}
        </FormGroup>
        </Form>
        </Container>
        
    )

}

export default AddPersonForm;