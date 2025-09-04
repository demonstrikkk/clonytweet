import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import LoginPage from "./pages/login/page.jsx";
import HomePage from "./pages/sidebar/page.jsx";
import UserDetailsViaLogin from "./pages/userdetailvialogin/page.jsx"

import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // App handles auth
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "home", element: <HomePage /> },
      {path:"/userdetailvialogin",element: <UserDetailsViaLogin/>}
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);









// import React from "react";
// import { createRoot } from "react-dom/client";
// import "./index.css";
// import App from "./App.jsx";
// import LoginPage from "./pages/login/page.jsx";
// import HomePage from "./pages/sidebar/page.jsx";


// import ReactDOM from 'react-dom/client';
// import {
//   createBrowserRouter,
//   RouterProvider,
// } from 'react-router-dom';


// const router = createBrowserRouter([
//   {
//     path: '/',
//     element: <App />,
//     children: [
  
//       { path: '/Login', element: <LoginPage /> },
//       { path: '/Home', element: <HomePage /> },

//     ],
//   },
// ]);

// createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <RouterProvider router={router} />
//   </React.StrictMode>
// );
