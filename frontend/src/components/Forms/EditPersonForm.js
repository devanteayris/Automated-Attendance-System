import React, { useState } from 'react';

import {
    Form,
    Button,
    FormGroup,
    Label,
    Input,
    Row,
    Container,
    Col
} from 'reactstrap'

const EditPersonForm = (props) => {
    const [person, setPerson] = useState(props.currentPerson);

    const handleChange = e => {
        const { name, value } = e.target;
        setPerson({
            ...person,
            [name] : value
        });
    }

    const handleSubmit = e => {
        e.preventDefault();
        if (person.firstName && person.lastName) {
            props.updatePerson(person);
        }
    }

    return (
        <Container className="p-5" fluid>
            <Form>
                <h2 className="h2">Editing: {person.firstName} {person.lastName}</h2>
                <FormGroup>
                    <Label>
                        First Name
                    </Label>
                    <Input type="text" value={person.firstName} name="firstName" onChange={handleChange}/>
                </FormGroup>
                <FormGroup>
                    <Label>
                        Last Name
                    </Label>
                    <Input type="text" value={person.lastName} name="lastName" onChange={handleChange}/>
                </FormGroup>
                <FormGroup>
                <Row className="pb-3 pt-3">
                    <Col>
                        <Button className="btn btn-primary btn-lg btn-block" color="success" type="submit" onClick={handleSubmit}>Update Person</Button>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Button className="btn btn-primary btn-lg btn-block" color="danger" type="submit" onClick={() => props.setEditing(false)}>Cancel</Button>
                    </Col>
                </Row>
                </FormGroup>
            </Form>
        </Container>
    )
}

export default EditPersonForm;