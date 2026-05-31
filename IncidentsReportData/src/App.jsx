import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignUp from '../src/Pages/SignUp/SignUp'
import Login from '../src/Pages/Login/Login'
import Home from '../src/Pages/Home/Home';
import ApiFireStore from '../src/Pages/Test/ApiFireStore';
import DashboardUsuario from './Pages/Dashboard/DashboardUsuario';
import DashboardAdmin from './Pages/Dashboard/DashboardAdmin';
import NotFound from './Pages/NotFound/NotFound';
import MisReportes from './Pages/Dashboard/Admin/MisReportes';
import Estadisticas from './Pages/Dashboard/Admin/Estadisticas';
import Perfil from './Pages/Dashboard/Admin/Perfil';
import NuevoReporte from './Pages/Dashboard/Admin/NuevoReporte'
import DetalleReporte from './Pages/Dashboard/Admin/DetalleReporte';

function App() {
  return (
    <BrowserRouter basename="/IncidentsReportData">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/test" element={<ApiFireStore />} />
        <Route path="/dashboard-usuario" element={<DashboardUsuario />} />
        <Route path="/dashboard-admin" element={<DashboardAdmin />} />
            <Route path="/reportes" element={<MisReportes />} />
            <Route path="/estadisticas" element={<Estadisticas />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/nuevo-reporte" element={<NuevoReporte />} />
            <Route path="/reporte/:id" element={<DetalleReporte />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
