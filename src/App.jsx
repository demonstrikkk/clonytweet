import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClientbrowser";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/login/page";
import HomePage from "./pages/sidebar/page";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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

  return (
    <Router>
      <Routes>
        {!session ? (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route path="/sidebar" element={<HomePage />} />
            <Route path="*" element={<Navigate to="/sidebar" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}