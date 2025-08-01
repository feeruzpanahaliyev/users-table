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
import type { User, Filters } from "../store/userStore";

export default function UsersPage() {
  const navigate = useNavigate();
  const { filters, setSelectedUser, setFilters } = useUserStore();

  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<User>>({} as User);

  const isSaveEditDisabled =
    !!roleError || !!statusError || !!emailError || !editedUser.name?.trim() || !editedUser.email?.trim();

  
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
  const isEmailSaveDisabled =
    !!emailError || !newUser.name?.trim() || !newUser.email?.trim();

  function loadUsers(
    page: number,
    filters: Filters,
    setUsers: Function,
    setTotalPages: Function,
    setLoading: Function,
    setError: Function
  ) {
    setLoading(true);
    setError(null);

    fetchPaginatedUsers(page, USERS_PER_PAGE, filters)
      .then(({ resJson, totalCount }) => {
        setUsers(resJson.users);
        setTotalPages(Math.ceil(totalCount / USERS_PER_PAGE));
      })
      .catch((err) => {
        console.error("User fetch error:", err);
        setError("Failed to fetch users. Please try again.");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadUsers(page, filters, setUsers, setTotalPages, setLoading, setError);
  }, [page, filters, setUsers]);

  const handleEdit = (user: User) => {
    setEditingUserId(user.id ?? null);
    setEditedUser({ ...user });
  };

  const statusRegex = /^([Active]|[Inactive])$/;
  const roleRegex = /^([Admin]|[User]|[Viewer])$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSave = async () => {
    setError(null);

    if (!statusRegex.test(editedUser.status ?? "")) {
      setError("Status must be either 'Active' or 'Inactive'.");
      return;
    }
    if (!roleRegex.test(editedUser.role ?? "")) {
      setError("Role must be either 'Admin', 'User', or 'Viewer'.");
      return;
    }

    if (!emailRegex.test(editedUser.email ?? "")) {
      setEmailError("Enter a valid email address");
      return;
    }

    try {
      const updatedUser = await updateUser(editingUserId!, {
        ...editedUser,
        id: Number(editingUserId),
      });

      setUsers(users.map((u) => (u.id === editingUserId ? updatedUser : u)));

      setEditingUserId(null);
      setEditedUser({});
    } catch (err) {
      console.error("Failed to update user", err);
      setError("Failed to update user. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      await deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Failed to delete user", err);
      setError("Failed to delete user.");
    }
  };
  const handleAddUser = async () => {
    setError(null);
    try {
      const allUsers = await fetchAllUsers();
      const maxId = Math.max(...allUsers.users?.map((u: User) => u.id ?? 0));
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
      setError("Failed to add user.");
    }
  };

  if (loading) return <CircularProgress sx={{ color: "white", m: 4 }} />;

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
        minHeight: "200px",
        minWidth: "1520px",
        marginLeft: "103px",
        margin: "0 auto",
        maxWidth: "100vw",
        overflowX: "hidden",
        overflowY: "auto",
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
                      error={!!emailError}
                      helperText={emailError}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewUser({ ...newUser, email: value });
                        if (value && !emailRegex.test(value)) {
                          setEmailError("Enter a valid email address");
                        }
                        else {
                          setEmailError(null);}
                      }}
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
                    disabled={isEmailSaveDisabled}
                    sx={{ opacity: isEmailSaveDisabled ? 0.5 : 1 }}
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
            {users?.map((user: User, index) => (
              <TableRow
                key={user.id ?? index}
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
                      error={!!emailError}
                      helperText={emailError}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditedUser({ ...editedUser, email: value });

                        if (value && !emailRegex.test(value)) {
                          setEmailError("Enter a valid email address");
                        } else {
                          setEmailError(null);
                        }
                      }}
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
                      error={!!roleError}
                      helperText={roleError}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditedUser({ ...editedUser, role: value });
                        if (!/^(Admin|User|Viewer)?$/.test(value)) {
                          setRoleError(
                            "Role must be 'Admin', 'User', or 'Viewer'"
                          );
                        } else {
                          setRoleError(null);
                        }
                      }}
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
                      error={!!statusError}
                      helperText={statusError}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditedUser({ ...editedUser, status: value });
                        if (!/^(Active|Inactive)?$/.test(value)) {
                          setStatusError(
                            "Status must be 'Active' or 'Inactive'"
                          );
                        } else {
                          setStatusError(null);
                        }
                      }}
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
                    `$ ${user.salary}`
                  )}
                </TableCell>
                <TableCell className="actions-cell" sx={{ color: "white" }}>
                  {editingUserId === user.id ? (
                    <>
                      <IconButton
                        onClick={handleSave}
                        color="primary"
                        disabled={isSaveEditDisabled}
                        sx={{ opacity: isSaveEditDisabled ? 0.5 : 1 }}
                      >
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
