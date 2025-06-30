import { Drawer, List, ListItemText, ListItemButton} from '@mui/material';
import { Link } from 'react-router-dom';

export default function SideBar() {
    return (
        <Drawer variant="permanent" anchor="left">
            <List>
                <ListItemButton component ={Link} to="/users">
                    <ListItemText primary="Users" />
                </ListItemButton>
                <ListItemButton component ={Link} to="/statistics">
                    <ListItemText primary="Statistics" />
                </ListItemButton>
            </List>
        </Drawer>
    );
}