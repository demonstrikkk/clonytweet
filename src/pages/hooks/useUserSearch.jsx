"use client";

import { useState } from 'react';

export default function useUserSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async (query) => {
    if (!query) return setResults([]);
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/search?q=${query}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, searchUsers };
}
