import React from 'react';
import { HashRouter } from 'react-router-dom';
import { SocietyProvider } from './context/SocietyContext';
import { SupabaseAuthProvider } from './context/SupabaseAuthContext';
import { GoogleAuthProvider } from './context/GoogleAuthContext';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <HashRouter>
      <SupabaseAuthProvider>
        <GoogleAuthProvider>
          <SocietyProvider>
            <AppRoutes />
          </SocietyProvider>
        </GoogleAuthProvider>
      </SupabaseAuthProvider>
    </HashRouter>
  );
}
