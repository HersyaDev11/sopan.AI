import React from 'react';
import './LogoWall.css';
import { MessageCircle, Mail, Send, Linkedin, MessageSquare, Slack, Users } from 'lucide-react';

const APP_LOGOS = [
  { name: "WhatsApp", icon: MessageCircle },
  { name: "Gmail", icon: Mail },
  { name: "Telegram", icon: Send },
  { name: "LinkedIn", icon: Linkedin },
  { name: "Discord", icon: MessageSquare },
  { name: "Slack", icon: Slack },
  { name: "Teams", icon: Users }
];

export default function LogoWall({ speed = 25, className = "" }) {
  // We duplicate the logos array once to create the infinite scroll effect
  const LogoGroup = () => (
    <div className="logo-wall-group">
      {APP_LOGOS.map((logo, idx) => {
        const Icon = logo.icon;
        return (
          <div key={idx} className="logo-item" title={`Terintegrasi dengan ${logo.name}`}>
            <Icon className="w-6 h-6" />
            <span className="logo-text">{logo.name}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={`logo-wall-container ${className}`}>
      <div 
        className="logo-wall-track" 
        style={{ animationDuration: `${speed}s` }}
      >
        <LogoGroup />
        <LogoGroup aria-hidden="true" />
      </div>
    </div>
  );
}
