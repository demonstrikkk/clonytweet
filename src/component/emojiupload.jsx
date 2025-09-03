


"use client";
import React, { useRef } from 'react';
import  { lazy, Suspense } from 'react';
const Picker = lazy(() => import('emoji-picker-react'));
const EmojiPicker = ({ onEmojiClick, onEmojiSelect }) => {
  const pickerRef = useRef(null);

  // Combine both handlers safely
  const handleEmojiClick = (emojiData, event) => {
    if (typeof onEmojiClick === 'function') {
      onEmojiClick(emojiData, event);
    }
    if (typeof onEmojiSelect === 'function') {
      onEmojiSelect(emojiData, event);
    }
  };

  return (
    <div ref={pickerRef} className='fixed top-1/3 inset-0 flex items-center justify-center z-40'
    // className="absolute bottom-10 left-0 z-50"
    >
     <Suspense fallback={<div>Loading emoji picker...</div>}>
      <Picker
        onEmojiClick={handleEmojiClick}
        theme="dark"
        native
      />
      </Suspense>
    </div>
  );
};

export default EmojiPicker;
