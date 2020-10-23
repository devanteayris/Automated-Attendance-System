import React from 'react';

import {
    Table,
} from 'reactstrap';

const AttendanceTable = (props) => {
    return (
        <Table bordered>
        <thead>
          <tr>
            <th>Attendance ID</th>
            <th>Full Name</th>
            <th>Time Logged</th>
            <th>Photo Proof</th>
          </tr>
        </thead>
        <tbody>
            { props.edges.length > 0 ? (
                props.edges.map(edge => {
                    const {
                        id, createdAt, person, personPhoto
                    } = edge.node;
                    var date = new Date(createdAt);
                    return (<tr>
                        <td>{id}</td>
                        <td>{person.firstName} {person.lastName}</td>
                        <td>{date.toString()}</td>
                        <td>{personPhoto && <img src={"https://face-attendance.s3.amazonaws.com/media/" + personPhoto} style={{height: "auto", maxWidth: "100%"}} alt={person.firstName}></img>}</td>
                    </tr>);
                }) 
            ) : (<tr><td colSpan={4}>No attendance logs were recorded</td></tr>)}
        </tbody>
      </Table>  
    )
}

export default AttendanceTable;