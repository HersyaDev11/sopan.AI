import React, { useState, useEffect } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+~`|}{[]:;?><,./-=';

export default function DecryptedText({ 
  text, 
  speed = 40, // ms per iteration
  duration = 800, // total ms
  className = "" 
}) {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    if (!text) {
      setDisplayText('');
      return;
    }
    
    let iteration = 0;
    const maxIterations = Math.floor(duration / speed);
    
    const interval = setInterval(() => {
      setDisplayText(prev => {
        return text.split('').map((char, index) => {
          // Keep spaces and newlines intact
          if (char === ' ' || char === '\n') return char;
          
          // Reveal character if its proportional time has passed
          if (index < (iteration / maxIterations) * text.length) {
            return text[index];
          }
          
          // Otherwise show random character
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('');
      });
      
      iteration++;
      if (iteration >= maxIterations) {
        clearInterval(interval);
        setDisplayText(text);
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [text, speed, duration]);

  return <span className={className}>{displayText}</span>;
}
