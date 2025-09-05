import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClientbrowser.js";
import { Outlet, Navigate } from "react-router-dom";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    // Loading state
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        Loading session...
      </div>
    );
  }

  // If logged in → allow access to children (Home, etc.)
  // If not logged in → redirect to login
  return session ? <Outlet /> : <Navigate to="/login" replace />;
}



// import React, { useEffect, useState } from "react";
// import { supabase } from "./lib/supabaseClientbrowser";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import { Link } from "react-router-dom";
// import LoginPage from "./pages/login/page";
// import HomePage from "./pages/sidebar/page";
// import { useNavigate } from "react-router-dom";

// export default function App() {
//   const [session, setSession] = useState(undefined); // undefined = loading
//   const navigate = useNavigate();
//   useEffect(() => {
//     // Get initial session
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//     });

//     // Listen for auth state changes
//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session);
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   if (session === undefined) {
//     // Loading state
//     return (
//       <div className="flex h-screen items-center justify-center bg-black text-white">
//         Loading session...
//       </div>
//     );
//   }

//   return (
//     <Router>
//       <Routes>
//         {!session ? (
//           <>
//             {/* <Link path="/login" element={<LoginPage />} /> */}
//             {navigate("/login")}
//             <Link path="*" element={<Navigate to="/login" replace />} />
//           </>
//         ) : (
//           <>
//         {navigate("/sidebar")}
//             <Link path="/sidebar" element={<HomePage />} />
//             <Link path="*" element={<Navigate to="/sidebar" replace />} />
//           </>
//         )}
//       </Routes>
//     </Router>
//   );
// }