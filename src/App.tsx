import { Routes, Route } from "react-router-dom";
import SideBar from "./components/Sidebar";
import { lazy, Suspense } from "react";

const UsersPage = lazy(() => import("./pages/UsersPage"));
const UserDetailPage = lazy(() => import("./pages/UserDetailPage"));
const StatisticsPage = lazy(() => import("./pages/StatisticsPage"));

function App() {
  return (
    <>
      <div style={{ display: "flex", maxWidth: "100vw", overflow: "hidden" }}>
        <SideBar />
        <div
          style={{
            marginLeft: "103px",
            padding: "20px",
            width: "90vw",
            minWidth: "90px",
            display: "block",
          }}
        >
          <Suspense
            fallback={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                }}
              >
                Loading page...
              </div>
            }
          >
            <Routes>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/users/:id" element={<UserDetailPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </>
  );
}

export default App;
