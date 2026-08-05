import React from 'react';
import GameZoneHeader from '../common/GameZoneHeader';
import GameZoneFooter from '../common/GameZoneFooter';
import './GameZoneLayout.css';

const GameZoneLayout = ({ children }) => {
  return (
    <div className="game-zone-layout">
      <GameZoneHeader />
      
      <main className="game-zone-main-content">
        {children}
      </main>

      <GameZoneFooter />
    </div>
  );
};

export default GameZoneLayout;