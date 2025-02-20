import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CandidateRegistration from './pages/CandidateRegistration';
import PatientList from './pages/PatientList';
import EditPatient from './pages/EditPatient';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cadastro" element={<CandidateRegistration />} />
      <Route path="/pacientes" element={<PatientList />} />
      <Route path="/editar/:id" element={<EditPatient />} />

    </Routes>
  );
}

export default App;
