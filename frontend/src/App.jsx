// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Complaints from './pages/Complaints';
import CreateComplaint from './pages/CreateComplaint';
import ComplaintDetail from './pages/ComplaintDetail';
import AdminDashboard from './pages/AdminDashboard';
import Marketplace from './pages/Marketplace';
import MarketplaceDetail from './pages/MarketplaceDetail';
import AddRentalItem from './pages/AddRentalItem';
import Profile from './pages/Profile';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import CreateGroup from './pages/CreateGroup';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />

            <Route path="/complaints" element={
              <PrivateRoute>
                <Complaints />
              </PrivateRoute>
            } />

            <Route path="/complaints/new" element={
              <PrivateRoute roles={['student']}>
                <CreateComplaint />
              </PrivateRoute>
            } />

            <Route path="/complaints/:id" element={
              <PrivateRoute>
                <ComplaintDetail />
              </PrivateRoute>
            } />

            <Route path="/admin" element={
              <PrivateRoute roles={['admin', 'warden']}>
                <AdminDashboard />
              </PrivateRoute>
            } />

            <Route path="/" element={<Navigate to="/dashboard" />} />

            <Route path="/marketplace" element={
              <PrivateRoute>
                <Marketplace />
              </PrivateRoute>
            } />

            <Route path="/marketplace/add" element={
              <PrivateRoute roles={['student']}>
                <AddRentalItem />
              </PrivateRoute>
            } />

            <Route path="/marketplace/:id" element={
              <PrivateRoute>
                <MarketplaceDetail />
              </PrivateRoute>
            } />

            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />

            <Route path="/groups" element={
              <PrivateRoute>
                <Groups />
              </PrivateRoute>
            } />

            <Route path="/groups/create" element={
              <PrivateRoute>
                <CreateGroup />
              </PrivateRoute>
            } />

            <Route path="/groups/:id" element={
              <PrivateRoute>
                <GroupDetail />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;