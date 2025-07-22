import { Box, Typography, Card, CircularProgress } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { fetchAllUsers } from "../api/UsersApi";
import { useEffect, useState } from "react";
import type { User } from "../store/userStore";

export default function StatisticsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAllUsers = async (setUsers: (users: User[]) => void) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllUsers();
      setUsers(data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllUsers(setUsers);
  }, []);
  
  const roleCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};

  users.forEach((user) => {
    if (user?.role) roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    if (user?.status)
      statusCounts[user.status] = (statusCounts[user.status] || 0) + 1;
  });

  const transformToPieData = (data: Record<string, number>) =>
    Object.entries(data).map(([label, value], index) => ({
      id: index,
      label,
      value,
    }));

  const rolePieData = transformToPieData(roleCounts);
  const statusPieData = transformToPieData(statusCounts);

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
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      width="100wv"
      margin="0 auto"
      maxWidth="100vw"
      // overflowX="hidden"
    >
      <Card
        sx={{
          backgroundColor: "#e7ecef",
          borderRadius: 4,
          width: "fit-content",
          maxWidth: "100vh",
          margin: "auto",
        }}
      >
        <Box p={1}>
          <Typography
            mb={10}
            mt={3}
            color="navy"
            fontWeight={"bold"}
            variant="h3"
            textAlign={"center"}
            gutterBottom
            sx={{ letterSpacing: "-1.5px" }}
          >
            User Statistics
          </Typography>

          <Box
            display="flex"
            justifyContent="space-around"
            mt={6}
            flexWrap="wrap"
            gap={6}
          >
            <Box>
              <Typography
                color="black"
                variant="h5"
                textAlign="center"
                fontWeight={"bold"}
                gutterBottom
                sx={{ letterSpacing: "-1px" }}
              >
                Role Distribution
              </Typography>
              <PieChart
                width={300}
                height={250}
                series={[
                  {
                    data: rolePieData,
                    innerRadius: 40,
                    outerRadius: 100,
                    paddingAngle: 4,
                  },
                ]}
              />
            </Box>

            <Box>
              <Typography
                color="black"
                variant="h5"
                textAlign="center"
                fontWeight={"bold"}
                gutterBottom
                sx={{ letterSpacing: "-1px" }}
              >
                Status Distribution
              </Typography>
              <PieChart
                width={300}
                height={250}
                series={[
                  {
                    data: statusPieData,
                    innerRadius: 40,
                    outerRadius: 100,
                    paddingAngle: 4,
                  },
                ]}
              />
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
