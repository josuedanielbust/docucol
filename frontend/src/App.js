import React from 'react';
import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import NavigationBar from './components/NavigationBar';
import UploadFilePage from './pages/UploadFilePage';
import LoginPage from './pages/SignInPage';
import DocumentsPage from './pages/DocumentsPage';
import RegisterPage from './pages/SignUpPage';
import EditProfilePage from './pages/EditProfilePage';
import OperadoresPage from './pages/OperadoresPage';
import TransferPage from './pages/TransferPage';

function App() {
  return (
    <Router>
      <NavigationBar />
      <Routes>
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
        <Route path="/upload" element={<UploadFilePage />} />
        <Route path="/my-documents" element={<DocumentsPage />} />
        <Route path="/operadores" element={<OperadoresPage />} />
        <Route path="/transferencia" element={<TransferPage />} />
      </Routes>
    </Router>
  );
}

export default App;