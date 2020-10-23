import React from 'react';

import {
    Table,
    Button,
    Col,
    Row,
    Container
} from 'reactstrap';

const PeopleTable = (props) => {
    return (
        <Table bordered>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Created At</th>
                    <th>Photo</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                { props.people.length > 0 ? (
                    props.people.map(person => {
                        const { uuid, id, firstName, lastName, createdAt, personPhoto} = person;
                        var date = new Date(createdAt);
                        return (
                            <tr key={uuid}>
                                <td>{id}</td>
                                <td>{firstName} {lastName}</td>
                                <td>{date.toString()}</td>
                                <td><img src={"https://face-attendance.s3.amazonaws.com/media/" + personPhoto} alt={firstName}></img></td>
                                <td>
                                    <Container >
                                        <Row className="mb-2">
                                            <Col>
                                                <Button color="danger" onClick={() => props.deletePerson(id)}>Delete</Button>
                                            </Col>
                                        </Row>
                                        <Row >
                                            <Col>
                                                <Button color="primary" onClick={() => props.editPerson(id, person)}>Edit</Button>
                                            </Col>
                                        </Row>
                                    </Container>
                                    
                                    
                                </td>
                            </tr>
                        );
                    })
                ) : (<tr><td colSpan={4}>No people found in Database</td></tr>)}
            </tbody>
        </Table>
    );
}

export default PeopleTable;