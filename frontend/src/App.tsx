import { Center, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import AppContainer from "./components/AppContainer";
import { TokenRefreshClient } from "./config/apiClient";
import AddSong from "./pages/AddSong";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import { EventsHistory } from "./pages/mainNavigation/EventsHistory";
import Settings from "./pages/profile/Settings";
import Statistics from "./pages/profile/Statistics";
import { SearchSong } from "./pages/SearchSong";
import SongList from "./pages/SongList";
import SongsSang from "./pages/SongsSang";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

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

  //TODO - extend and move away
  useEffect(() => {
    let pageTitle;
    if (pathname === '/') {
      pageTitle = 'Karaoke App - Add songs to your list';
    } else if (pathname === '/register') {
      pageTitle = 'Karaoke App - Create Account';
    } else if (pathname === '/login') {
      pageTitle = 'Karaoke App - Sign In';
    } else if (pathname === '/password/forgot') {
      pageTitle = 'Karaoke App - Request Password';
    } else if (pathname === '/password/reset') {
      pageTitle = 'Karaoke App - Reset Password';
    } else if (pathname === '/list') {
      pageTitle = 'Karaoke App - List';
    } else if (pathname === '/history') {
      pageTitle = 'Karaoke App - History Events';
    } else {
      pageTitle = 'Karaoke App';
    }
    document.title = pageTitle;

  }, [pathname]);

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
            <Route path="songs-sang" element={<SongsSang />} />
            <Route path="list" element={<SongList />} />
            <Route path="search-song" element={<SearchSong />} />
            <Route path="history" element={<EventsHistory />} />
            <Route path="settings" element={<Settings />} />
            <Route path="statistics" element={<Statistics />} />
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
