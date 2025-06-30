import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Pagination,
  TextField,
  ListItem,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";

import { useUserStore } from "../store/userStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import {
  fetchPaginatedUsers,
  updateUser,
  deleteUser,
  addUser,
  fetchAllUsers,
} from "../api/UsersApi";
import type { User } from "../store/userStore";

export default function UsersPage() {
  const navigate = useNavigate();
  const { filters, setSelectedUser, setFilters } = useUserStore();

  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<User>>({} as User);

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  const USERS_PER_PAGE = 10;

  const { control } = useForm();

  const [newUser, setNewUser] = useState<User>({
    id: 0,
    name: "",
    email: "",
    role: "User",
    status: "Active",
    salary: 0,
  });

  useEffect(() => {
    console.log("Filters in useEffect:", filters);
    setLoading(true);
    fetchPaginatedUsers(page, USERS_PER_PAGE, filters)
      .then(({ resJson, totalCount }) => {
        setUsers(resJson);
        setTotalPages(Math.ceil(totalCount / USERS_PER_PAGE));
      })
      .catch((err) => console.error("User fetch error:", err))
      .finally(() => setLoading(false));
  }, [page, filters, setUsers]);

  const handleEdit = (user: User) => {
    setEditingUserId(user.id ?? null);
    setEditedUser({ ...user });
  };

  const handleSave = async () => {
    try {
      await updateUser(editingUserId!, editedUser);
      setUsers(users.map((u) => (u.id === editingUserId ? editedUser : u)));
      setEditingUserId(null);
      setEditedUser({});
    } catch (err) {
      console.error("Failed to update user", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };
  const handleAddUser = async () => {
    try {
      const allUsers = await fetchAllUsers();
      const maxId = Math.max(...allUsers?.map((u: User) => u.id ?? 0));
      const userToCreate = { ...newUser, id: maxId + 1 };

      await addUser(userToCreate);
      setUsers([...users, userToCreate]);
      setNewUser({
        id: 0,
        name: "",
        email: "",
        role: "User",
        status: "Active",
        salary: 0,
      });
    } catch (err) {
      console.error("Failed to add user", err);
    }
  };

  if (loading) return <CircularProgress sx={{ color: "white", m: 4 }} />;

  return (
    <Box
      sx={{
        display: "flex",
        flexGrow: 1,
        backgroundColor: "#afa193",
        p: 4,
        color: "white",
        borderRadius: 9,
        flexDirection: "column",
        position: "relative",
        minHeight: "600px",
        minWidth: "1200px",
      }}
    >
      <Box sx={{ width: "100%", color: "white" }}>
        <Typography fontWeight={"bold"} variant="h4" gutterBottom>
          Users
        </Typography>

        <Grid container mb={1} spacing={0.1}>
          <Grid size={2}>
            <ListItem>
              <Controller
                name="search"
                control={control}
                defaultValue={searchTerm}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Search by name/email"
                    variant="outlined"
                    sx={{ color: "white" }}
                    onChange={(e) => {
                      field.onChange(e);
                      setSearchTerm(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setFilters({ ...filters, search: searchTerm });
                        setPage(1);
                      }
                    }}
                  />
                )}
              />
            </ListItem>
          </Grid>

          <Grid size={2}>
            <ListItem>
              <Controller
                name="sortBy"
                control={control}
                defaultValue={filters.sortBy || ""}
                render={({ field }) => (
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="sort-by-label">Sort By</InputLabel>
                    <Select
                      labelId="sort-by-label"
                      label="Sort By"
                      sx={{ color: "white" }}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setFilters({ ...filters, sortBy: e.target.value });
                      }}
                    >
                      <MenuItem value="name">Name</MenuItem>
                      <MenuItem value="email">Email</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </ListItem>
          </Grid>

          <Grid size={2}>
            <ListItem>
              <Controller
                name="sortOrder"
                control={control}
                defaultValue={filters.sortOrder || ""}
                render={({ field }) => (
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="sort-order-label">Sort Order</InputLabel>
                    <Select
                      labelId="sort-order-label"
                      label="Sort Order"
                      value={field.value}
                      sx={{ color: "white" }}
                      onChange={(e) => {
                        field.onChange(e);
                        setFilters({ ...filters, sortOrder: e.target.value });
                      }}
                    >
                      <MenuItem value="asc">Ascending</MenuItem>
                      <MenuItem value="desc">Descending</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </ListItem>
          </Grid>

          <Grid size={2}>
            <ListItem>
              <Controller
                name="role"
                control={control}
                defaultValue={filters.role || ""}
                render={({ field }) => (
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={field.value || ""}
                      sx={{ color: "white" }}
                      onChange={(e) => {
                        field.onChange(e);
                        setFilters({ ...filters, role: e.target.value });
                      }}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="Admin">Admin</MenuItem>
                      <MenuItem value="User">User</MenuItem>
                      <MenuItem value="Viewer">Viewer</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </ListItem>
          </Grid>

          <Grid size={2}>
            <ListItem>
              <Controller
                name="status"
                control={control}
                defaultValue={filters.status || ""}
                render={({ field }) => (
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={field.value || ""}
                      sx={{ color: "white" }}
                      onChange={(e) => {
                        field.onChange(e);
                        setFilters({ ...filters, status: e.target.value });
                      }}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </ListItem>
          </Grid>

          <Grid size={2}>
            <ListItem>
              <Button
                sx={{
                  fontSize: "1rem",
                  padding: "12px 24px",
                  minWidth: "50px",
                }}
                variant="contained"
                color="primary"
                onClick={handleOpen}
              >
                Add User
              </Button>

              <Dialog open={open} onClose={handleClose}>
                <DialogTitle mt={2}>Add New User</DialogTitle>
                <DialogContent>
                  <Box display="flex" flexDirection="column" gap={2} my={2}>
                    <TextField
                      label="Name"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                      size="small"
                    />
                    <TextField
                      label="Email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      size="small"
                    />

                    <FormControl size="small">
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={newUser.role}
                        onChange={(e) =>
                          setNewUser({ ...newUser, role: e.target.value })
                        }
                        label="Role"
                      >
                        <MenuItem value="User">User</MenuItem>
                        <MenuItem value="Viewer">Viewer</MenuItem>
                        <MenuItem value="Admin">Admin</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={newUser.status}
                        onChange={(e) =>
                          setNewUser({ ...newUser, status: e.target.value })
                        }
                        label="Status"
                      >
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      label="Salary"
                      type="number"
                      value={newUser.salary}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          salary: Number(e.target.value),
                        })
                      }
                      size="small"
                    />
                  </Box>
                </DialogContent>

                <DialogActions>
                  <Button onClick={handleClose}>Cancel</Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      handleAddUser();
                      handleClose();
                    }}
                  >
                    Save
                  </Button>
                </DialogActions>
              </Dialog>
            </ListItem>
          </Grid>
        </Grid>

        <Table sx={{ color: "white" }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "white" }}>ID</TableCell>
              <TableCell sx={{ color: "white" }}>Name</TableCell>
              <TableCell sx={{ color: "white" }}>Email</TableCell>
              <TableCell sx={{ color: "white" }}>Role</TableCell>
              <TableCell sx={{ color: "white" }}>Status</TableCell>
              <TableCell sx={{ color: "white" }}>Salary</TableCell>
              <TableCell sx={{ color: "white" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.map((user: User) => (
              <TableRow
                key={user.id}
                hover
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest(".actions-cell")) return;

                  if (
                    target.closest("input") ||
                    target.closest("textarea") ||
                    target.closest("button") ||
                    target.closest("select")
                  ) {
                    return;
                  }
                  setSelectedUser(user);
                  navigate(`/users/${user.id}`);
                }}
                style={{ cursor: "pointer" }}
              >
                <TableCell sx={{ color: "white" }}>{user.id}</TableCell>
                <TableCell sx={{ color: "white" }}>
                  {editingUserId === user.id ? (
                    <TextField
                      variant="standard"
                      value={editedUser.name}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, name: e.target.value })
                      }
                    />
                  ) : (
                    user.name
                  )}
                </TableCell>
                <TableCell sx={{ color: "white" }}>
                  {editingUserId === user.id ? (
                    <TextField
                      variant="standard"
                      value={editedUser.email}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, email: e.target.value })
                      }
                    />
                  ) : (
                    user.email
                  )}
                </TableCell>
                <TableCell sx={{ color: "white" }}>
                  {editingUserId === user.id ? (
                    <TextField
                      variant="standard"
                      value={editedUser.role}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, role: e.target.value })
                      }
                    />
                  ) : (
                    user.role
                  )}
                </TableCell>
                <TableCell sx={{ color: "white" }}>
                  {editingUserId === user.id ? (
                    <TextField
                      variant="standard"
                      value={editedUser.status}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, status: e.target.value })
                      }
                    />
                  ) : (
                    user.status
                  )}
                </TableCell>
                <TableCell sx={{ color: "white" }}>
                  {editingUserId === user.id ? (
                    <TextField
                      variant="standard"
                      value={editedUser.salary}
                      onChange={(e) =>
                        setEditedUser({
                          ...editedUser,
                          salary: Number(e.target.value),
                        })
                      }
                    />
                  ) : (
                    user.salary
                  )}
                </TableCell>
                <TableCell className="actions-cell" sx={{ color: "white" }}>
                  {editingUserId === user.id ? (
                    <>
                      <IconButton onClick={handleSave} color="primary">
                        <SaveIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => setEditingUserId(null)}
                        color="inherit"
                      >
                        <CancelIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton
                        onClick={() => handleEdit(user)}
                        color="inherit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(user.id!)}
                        color="inherit"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {!loading && (
          <Box
            mt={2}
            display="flex"
            justifyContent="flex-end"
            sx={{ position: "relative", zIndex: 10, pointerEvents: "auto" }}
          >
            <Pagination
              sx={{
                "& .MuiPaginationItem-root": {
                  pointerEvents: "auto !important",
                  opacity: 1,
                  userSelect: "auto",
                  cursor: "pointer",
                  color: "white",
                },
              }}
              count={totalPages}
              page={page}
              variant="outlined"
              color="primary"
              onChange={(_, value) => {
                setPage(value);
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
