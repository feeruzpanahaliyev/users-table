import { Routes, Route } from "react-router-dom";
import SideBar from "./components/Sidebar";
import UsersPage from "./pages/UsersPage";
import UserDetailPage from "./pages/UserDetailPage";
import StatisticsPage from "./pages/StatisticsPage";


function App() {
  return (
    <>
      <div style={{ display: "flex" , maxWidth: '100vw'}}>
        <SideBar />
        <div style={{marginLeft: '103px', padding: "20px", width: "90vw" , minWidth: '90px',   display: 'block'}}>
          <Routes>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />
            {/** <Route path="/users/:id" element={<UserDetailPage />} /> */}
            <Route path="/statistics" element={<StatisticsPage />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
