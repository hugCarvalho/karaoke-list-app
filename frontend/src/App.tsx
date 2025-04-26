import { Route, Routes } from "react-router-dom";
import AppContainer from "./components/AppContainer";
import Blacklist from "./pages/Blacklist";
import Favourites from "./pages/Favourites";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NextEventList from "./pages/NextEventList";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";
import SongList from "./pages/SongList";
import SongsSang from "./pages/SongsSang";
import VerifyEmail from "./pages/VerifyEmail";

function App() {

  return (
    <Routes>
      <Route path="/" element={<AppContainer />}>
        <Route index element={<Home />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="favourites" element={<Favourites />} />
        <Route path="blacklist" element={<Blacklist />} />
        <Route path="next-event-list" element={<NextEventList />} />
        <Route path="songs-sang" element={<SongsSang />} />
        <Route path="list" element={<SongList />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/email/verify/:code" element={<VerifyEmail />} />
      <Route path="/password/forgot" element={<ForgotPassword />} />
      <Route path="/password/reset" element={<ResetPassword />} />
    </Routes>
  );
}

export default App;
