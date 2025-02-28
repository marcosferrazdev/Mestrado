import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.js";
import CandidateRegistration from "./pages/CandidateRegistration.js";
import PatientList from "./pages/PatientList.js";
import EditPatient from "./pages/EditPatient.js";
import Relatorios from "./pages/Relatorios.js";
import ExportPatients from "./pages/ExportPatients.js"; // Importa a nova página

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cadastro" element={<CandidateRegistration />} />
      <Route path="/pacientes" element={<PatientList />} />
      <Route path="/editar/:id" element={<EditPatient />} />
      <Route path="/relatorios" element={<Relatorios />} />
      <Route path="/exportar" element={<ExportPatients />} /> {/* Nova rota */}
    </Routes>
  );
}

export default App;
