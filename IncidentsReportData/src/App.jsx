import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import SignUp from '../src/Pages/SignUp/SignUp'
import Login from '../src/Pages/Login/Login'
import Home from '../src/Pages/Home/Home';
import ApiFireStore from '../src/Pages/Test/ApiFireStore';
import Dashboard from '../src/Pages/Dashboard/Dashboard';

function App() {
  return (
    <BrowserRouter basename="/IncidentsReportData">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/test" element={<ApiFireStore />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
