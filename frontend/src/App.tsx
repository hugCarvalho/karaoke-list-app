import { Center, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import AppContainer from "./components/AppContainer";
import { TokenRefreshClient } from "./config/apiClient";
import AddSong from "./pages/AddSong";
import Blacklist from "./pages/Blacklist";
import Favourites from "./pages/Favourites";
import NextEventList from "./pages/NextEventList";
import Settings from "./pages/Settings";
import SongList from "./pages/SongList";
import SongsSang from "./pages/SongsSang";
import Statistics from "./pages/Statistics";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import { EventsHistory } from "./pages/mainNavigation/EventsHistory";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await TokenRefreshClient.get('/auth/refresh');
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isAuthenticated === null) {
    return <Center w="100vw" h="90vh" flexDir="column">
      <p>Because of Renders free tier, initial app render is extremely slow...</p>
      <Spinner />
    </Center>
  }

  return (
    <Routes>
      {isAuthenticated ?
        (
          <Route path="/" element={<AppContainer />}>
            <Route index element={<AddSong />} />
            {/* <Route path="profile" element={<Profile />} /> */}
            <Route path="settings" element={<Settings />} />
            <Route path="favourites" element={<Favourites />} />
            <Route path="blacklist" element={<Blacklist />} />
            <Route path="next-event-list" element={<NextEventList />} />
            <Route path="songs-sang" element={<SongsSang />} />
            <Route path="list" element={<SongList />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="history" element={<EventsHistory />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        ) :
        (
          <>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/email/verify/:code" element={<VerifyEmail />} />
            <Route path="/password/forgot" element={<ForgotPassword />} />
            <Route path="/password/reset" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
    </Routes>
  );
}

export default App;
