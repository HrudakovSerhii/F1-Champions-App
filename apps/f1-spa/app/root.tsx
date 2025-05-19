import React from 'react';
import { AppNav } from './app-nav';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-container">
      <AppNav />
      <main className="app-content">
        {children}
      </main>
    </div>
  );
}
