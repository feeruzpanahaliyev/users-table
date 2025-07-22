import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchUserById, updateUser } from "../api/UsersApi";
import type { User } from "../store/userStore";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import { useUserStore } from "../store/userStore";

export default function UserDetailPage() {
  const { selectedUser, setSelectedUser } = useUserStore();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});

  const loadUserById = async (
    id: number | string,
    selectedUser: User | null,
    setSelectedUser: (user: User | null) => void,
    setLoading: (loading: boolean) => void,
    setError: (error: string | null) => void
  ) => {
    if (!selectedUser || selectedUser.id !== Number(id)) {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUserById(Number(id!));
        setSelectedUser(data);
        console.log("Fetched user:", data);
      } catch (err) {
        console.error("User fetch error:", err);
        setSelectedUser(null);
        setError("Failed to load user. Try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const syncFormWithUser = (
    selectedUser: User | null,
    setFormData: (data: User) => void
  ) => {
    if (selectedUser) {
      setFormData({ ...selectedUser });
    }
  };

  useEffect(() => {
    loadUserById(id!, selectedUser, setSelectedUser, setLoading, setError);
    return () => setSelectedUser(null);
  }, [id, setSelectedUser]);

  useEffect(() => {
    syncFormWithUser(selectedUser, setFormData);
  }, [selectedUser]);

  const handleSave = async () => {
    setError(null);
    if (formData.id == null) {
      console.error("Cannot update user: ID is missing");
      return;
    }

    try {
      const updated = await updateUser(formData.id, formData);
      setSelectedUser(updated);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update user", err);
      setError("Failed to update user. Try again.");
    }
  };

  if (loading) {
    return (
      <Box p={4}>
        <CircularProgress sx={{ color: "white" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography
        color="error"
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "center",
          fontWeight: "bold",
          p: 1,
          borderRadius: 1,
          width: "100%",
        }}
      >
        {error}
      </Typography>
    );
  }

  if (!selectedUser || !selectedUser.name) {
    return (
      <Box p={4}>
        <Typography variant="h6" color="white">
          User not found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Card sx={{ maxWidth: 300, margin: "0 auto", padding: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ width: 56, height: 56, mr: 2 }}>
              {selectedUser.name[0]}
            </Avatar>
            {isEditing ? (
              <TextField
                variant="standard"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            ) : (
              <Typography variant="h5">{selectedUser.name}</Typography>
            )}
          </Box>

          <Typography variant="body1" component={"div"}>
            <strong>Email:</strong>{" "}
            {isEditing ? (
              <TextField
                variant="standard"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            ) : (
              selectedUser.email
            )}
          </Typography>

          <Typography variant="body1" component={"div"}>
            <strong>Role:</strong>{" "}
            {isEditing ? (
              <Select
                variant="standard"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Viewer">Viewer</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
              </Select>
            ) : (
              selectedUser.role
            )}
          </Typography>

          <Typography variant="body1" component={"div"}>
            <strong>Status:</strong>{" "}
            {isEditing ? (
              <Select
                variant="standard"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            ) : (
              selectedUser.status
            )}
          </Typography>

          <Typography variant="body1" component={"div"}>
            <strong>Salary:</strong>{" "}
            {isEditing ? (
              <TextField
                variant="standard"
                type="number"
                value={formData.salary}
                onChange={(e) =>
                  setFormData({ ...formData, salary: Number(e.target.value) })
                }
              />
            ) : (
              `$${selectedUser.salary}`
            )}
          </Typography>

          <Box mt={2}>
            {isEditing ? (
              <>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleSave}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => setIsEditing(false)}
                  sx={{ ml: 1 }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIsEditing(true)}
              >
                Edit User
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
