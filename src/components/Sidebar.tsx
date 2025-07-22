import { Drawer, List, ListItemText, ListItemButton } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

export default function SideBar() {
  const location = useLocation();

  return (
    <Drawer variant="permanent" anchor="left">
      <List>
        <ListItemButton
          component={Link}
          to="/users"
          selected={location.pathname === "/users"}
        >
          <ListItemText primary="Users" />
        </ListItemButton>

        <ListItemButton
          component={Link}
          to="/statistics"
          selected={location.pathname === "/statistics"}
        >
          <ListItemText primary="Statistics" />
        </ListItemButton>
      </List>
    </Drawer>
  );
}
