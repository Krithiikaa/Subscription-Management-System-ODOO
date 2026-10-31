import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { DemoModeProvider } from './context/DemoModeContext';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DemoModeProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </DemoModeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
