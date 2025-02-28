import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.js";
import CandidateRegistration from "./pages/CandidateRegistration.js";
import PatientList from "./pages/PatientList.js";
import EditPatient from "./pages/EditPatient.js";
import Relatorios from "./pages/Relatorios.js";
import ExportPatients from "./pages/ExportPatients.js";
import Phase1Identification from "./pages/Phase1Identification.js";
import Phase1TestsAndQuestionnaires from "./pages/Phase1TestsAndQuestionnaires.js";
import Phase2Identification from "./pages/Phase2Identification.js";
import Phase2TestsAndQuestionnaires from "./pages/Phase2TestsAndQuestionnaires.js";
import Login from "./pages/Login.js";
import ResetPassword from "./pages/ResetPassword.js";
import Register from "./pages/Register.js";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/cadastro" element={<CandidateRegistration />} />
      <Route path="/pacientes" element={<PatientList />} />
      <Route path="/editar/:id" element={<EditPatient />} />
      <Route path="/relatorios" element={<Relatorios />} />
      <Route path="/exportar" element={<ExportPatients />} />
      {/* Novas rotas para as tabelas */}
      <Route
        path="/exportar/fase1-identificacao"
        element={<Phase1Identification />}
      />
      <Route
        path="/exportar/fase1-testes-questionarios"
        element={<Phase1TestsAndQuestionnaires />}
      />
      <Route
        path="/exportar/fase2-identificacao"
        element={<Phase2Identification />}
      />
      <Route
        path="/exportar/fase2-testes-questionarios"
        element={<Phase2TestsAndQuestionnaires />}
      />
    </Routes>
  );
}

export default App;
