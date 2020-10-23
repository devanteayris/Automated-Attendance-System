import React, { useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { PersonAdd, Check, Home, Group } from '@material-ui/icons/';

import {
    Link
  } from "react-router-dom";

const routes = [
    {
        key : "home",
        path : "/",
        name : "Home",
        icon : <Home/>
    },
];

const crudRoutes = [
    {
        key : "all-people-crud",
        path : "/all-people",
        name : "People CRUD",
        icon : <PersonAdd/>
    },
]

const attendanceRoutes = [
    {
        key : "mark-attendance",
        path : "/mark-attendance",
        name : "Mark Attendance",
        icon: <Check/>
    },
    {
        key : "attendance-logs",
        path : "/attendance-logs",
        name : "Attendance Logs",
        icon: <Group/>
    },
]

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
  root: {
    flexGrow: 1,
  },

  title: {
    flexGrow: 1,
  },
  a: {
    textDecoration: "none"
   }
});

export default function NavBar() {
    const [title, setTitle] = useState("");
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const toggleDrawer = open => (event) => {
    setOpen(open);
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    
  };

  const list = () => (
    <div
    className={clsx(classes.list)}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
        <List>
            {routes.map((obj) => (
            <Link to={obj.path} key={obj.key} style={{color: 'inherit', textDecoration: 'none' }} >
            <ListItem button key={obj.key} onClick={(e) => setTitle(obj.name)}>
                <ListItemIcon>{obj.icon}</ListItemIcon>
                <ListItemText primary={obj.name} />
            </ListItem></Link>
            ))}
        </List>
      <Divider />
        <List>
            {attendanceRoutes.map((obj) => (
                <Link to={obj.path} key={obj.key} style={{color: 'inherit', textDecoration: 'none' }}>
            <ListItem button key={obj.key} onClick={(e) => setTitle(obj.name)}>
                <ListItemIcon>{obj.icon}</ListItemIcon>
                <ListItemText primary={obj.name} />
            </ListItem></Link>
            ))}
        </List>
        <Divider />
        <List>
            {crudRoutes.map((obj) => (
                <Link to={obj.path} key={obj.key} style={{color: 'inherit', textDecoration: 'none' }}>
            <ListItem button key={obj.key} onClick={(e) => setTitle(obj.name)}>
                <ListItemIcon>{obj.icon}</ListItemIcon>
                <ListItemText primary={obj.name} />
            </ListItem></Link>
            ))}
        </List>
    </div>
  );

  return (
    <div>
        <Drawer open={open} onClose={toggleDrawer(false)} anchor="left">
            {list()}
        </Drawer>
        <AppBar position="static" className="mb-5">
            <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
                <MenuIcon/>
            </IconButton>
            <Typography variant="h6" className={classes.title}>
                {title} 
            </Typography>   
            </Toolbar>
        </AppBar>
    </div>
  );
}