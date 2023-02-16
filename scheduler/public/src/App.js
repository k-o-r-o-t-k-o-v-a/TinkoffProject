import React, { Fragment } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Help from "./helpers/Help";
import Skeleton from "./templates/Skeleton";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Msg from "./pages/Msg";
import Dialog from "./pages/Dialog";
import Register from "./pages/Register";
import Create from "./pages/Create";

function RequireAuth({ children }: { children: JSX.Element }) {
  let auth = Help.GetData("token");

  if (auth == "") {
    return <Navigate to="/login" />;
  }

  return children;
}
function App() {
  return (
      <>
        <Routes>
          <Route
              path="/"
              element={
                <RequireAuth>
                  <Skeleton page={<Home />} />
                </RequireAuth>
              }
          />
          <Route
              path="/create"
              element={
                <RequireAuth>
                  <Skeleton page={<Create />} />
                </RequireAuth>
              }
          />
          <Route path="/msg" element={ <RequireAuth> <Skeleton page={<Msg />} /> </RequireAuth> } />
          <Route path="/msg/:id" element={ <RequireAuth> <Skeleton page={<Dialog />} /> </RequireAuth> } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </>
  );
}

export default App;