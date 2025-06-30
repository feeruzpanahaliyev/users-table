import { Box, Typography} from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { fetchAllUsers } from "../api/UsersApi";
import { useEffect, useState } from "react";
import type { User } from "../store/userStore"


export default function StatisticsPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchAllUsers()
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  const roleCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};

  users.forEach((user) => {
   if(user?.role ) roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    if(user?.status) statusCounts[user.status] = (statusCounts[user.status] || 0) + 1;
  });


  const transformToPieData = (data: Record<string, number>) =>
    Object.entries(data).map(([label, value], index) => ({
      id: index,
      label,
      value,
    }));

  const rolePieData = transformToPieData(roleCounts);
  const statusPieData = transformToPieData(statusCounts);

  return (
    <Box p={1}>
      <Typography mb ={20} color="navy"fontWeight={"bold"} variant="h3" justifyContent={"center"}gutterBottom>
        User Statistics
      </Typography>

      <Box display="flex" justifyContent="space-around" mt={6} flexWrap="wrap" gap={6}>
        <Box>
          <Typography color="black" variant="h5" textAlign="center" fontWeight={"bold"} gutterBottom>
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
          <Typography color= "black" variant="h5" textAlign="center" fontWeight={"bold"} gutterBottom>
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
  );
}
