import { useState } from "react";
export  function usePollVoting(userEmail, posts, setPosts) {
  const [userSelectedOption, setUserSelectedOption] = useState({}); // keyed by postId

  const handleVote = async (postId, selectedOption) => {
    try {
      const res = await fetch('/api/posts/voteuser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userEmail, selectedOption }),
      });

      const data = await res.json();

      if (res.ok) {
        setPosts(prev =>
          prev.map(p =>
            p.postId === postId
              ? { ...p, content: { ...p.content, poll: data.post.content.poll } }
              : p
          )
        );

        setUserSelectedOption(prev => ({ ...prev, [postId]: selectedOption }));
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error("Voting error:", err);
    }
  };
  
  return { handleVote, userSelectedOption };
}