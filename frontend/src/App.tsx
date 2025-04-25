import { Route, Routes } from "react-router-dom";
import AppContainer from "./components/AppContainer";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {

  return (
    <Routes>
      <Route path="/" element={<AppContainer />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;
