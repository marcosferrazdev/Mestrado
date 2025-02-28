import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Patient, usePatientStore } from "../store/usePatientStore.js";
import { toast, Toaster } from "react-hot-toast";

// Função para verificar se o valor é numérico
const isNumeric = (value: string): boolean => {
  return /^\d*\.?\d*$/.test(value);
};

// Mapeamento de nomes de campos para nomes amigáveis
const fieldNameMap: { [key: string]: string } = {
  satAtRestStartTC6: "SAT em Repouso (%) - Início TC6",
  satAtRestEndTC6: "SAT (%) Final TC6",
  litersO2TC6: "Litros de O2 (TC6)",
  tc6_1: "TC6-1",
  tc6_2: "TC6-2",
  satAtRestStartTSL: "SAT em Repouso (%) - Início TSL",
  satAtRestEndTSL: "SAT (%) Final TSL",
  litersO2TSL: "Litros de O2 (TSL)",
  tsl5RepSeconds: "TSL 5rep em Segundos",
  pgiD1IntraScore: "PGI (D1 Intra) (escore total)",
  pgiD1InterScore: "PGI (D1 inter) (escore total)",
  pgiD2IntraScore: "PGI (D2 Intra) (escore total)",
  kbildSimpleSum: "KBILD (Soma simples)",
  kbildScale0_100: "KBILD (escala de 0-100)",
  whodas: "WHODAS",
  pahD1EMA: "PAH (D1) EMA",
  pahD1EAA: "PAH (D1) EAA",
  pahD2EMA: "PAH(D2) EMA",
  pahD2EAA: "PAH(D2) EAA",
  participationScale: "Escala de Participação",
  vef1CVF: "VEF1/CVF",
  vef1CVFPred: "VEF1/CVF - %PRED",
  vef1: "VEF1",
  vef1Pred: "VEF1 - %PRED",
  cvf: "CVF",
  cvfPred: "CVF - %PRED",
  pef: "PEF",
  pefPred: "PEF - %PRED",
  fef2575: "FEF2575",
  fef257Pred: "FEF257 - %PRED",
};

// Mapeamentos para converter palavras em números com base na legenda
const o2DuringTestMap: { [key: string]: string } = {
  Não: "1",
  Sim: "2",
};
const o2DuringTestOptions = ["Não", "Sim"];

const mrcMap: { [key: string]: string } = {
  "0 - Só sofre de falta de ar durante exercícios intensos": "0",
  "1 - Sofre falta de ar quando andando apressadamente ou subindo rampa leve":
    "1",
  "2 - Anda mais devagar que pessoas da mesma idade por causa da falta de ar ou tem de parar para respirar mesmo quando anda devagar":
    "2",
  "3 - Para para respirar depois de andar menos de 100 metros ou após alguns minutos":
    "3",
  "4 - Sente tanta falta de ar que não sai mais de casa ou quando está se vestindo":
    "4",
};
const mrcOptions = [
  "0 - Só sofre de falta de ar durante exercícios intensos",
  "1 - Sofre falta de ar quando andando apressadamente ou subindo rampa leve",
  "2 - Anda mais devagar que pessoas da mesma idade por causa da falta de ar ou tem de parar para respirar mesmo quando anda devagar",
  "3 - Para para respirar depois de andar menos de 100 metros ou após alguns minutos",
  "4 - Sente tanta falta de ar que não sai mais de casa ou quando está se vestindo",
];

const pahActivityLevelMap: { [key: string]: string } = {
  Inativo: "1",
  "Moderadamente ativo": "2",
  Ativo: "3",
};
const pahActivityLevelOptions = ["Inativo", "Moderadamente ativo", "Ativo"];

const participationScaleClassificationMap: { [key: string]: string } = {
  "Sem restrição significativa": "1",
  "Leve restrição": "2",
  "Restrição moderada": "3",
  "Restrição grave": "4",
  "Restrição extrema": "5",
};
const participationScaleClassificationOptions = [
  "Sem restrição significativa",
  "Leve restrição",
  "Restrição moderada",
  "Restrição grave",
  "Restrição extrema",
];

// Função para ordenar pacientes alfabeticamente por nome
const sortPatientsByName = (patients: Patient[]): Patient[] => {
  return [...patients].sort((a, b) => a.name.localeCompare(b.name));
};

// Função para exportar os dados para CSV com valores numéricos
const exportToCSV = (patients: Patient[]) => {
  const headers = [
    "Identificação",
    "SAT em Repouso (%) - Início TC6",
    "SAT (%) Final TC6",
    "O2 Durante o Teste (TC6)",
    "Litros de O2 (TC6)",
    "TC6-1",
    "TC6-2",
    "SAT em Repouso (%) - Início TSL",
    "SAT (%) Final TSL",
    "O2 Durante o Teste (TSL)",
    "Litros de O2 (TSL)",
    "TSL 5rep em Segundos",
    "TPP",
    "Ordem Randomização",
    "MRC",
    "PGI (qualitativo)",
    "PGI (D1 Intra) (escore total)",
    "PGI (D1 inter) (escore total)",
    "PGI (D2 Intra) (escore total)",
    "KBILD (Soma simples)",
    "KBILD (escala de 0-100)",
    "WHODAS",
    "PAH (D1) EMA",
    "PAH (D1) EAA",
    "Nivel de Atividade (PAH) D1",
    "PAH(D2) EMA",
    "PAH(D2) EAA",
    "Nivel de Atividade (PAH) D2",
    "Escala de Participação",
    "Classificação Escala de Participação",
    "VEF1/CVF",
    "VEF1/CVF - %PRED",
    "VEF1",
    "VEF1 - %PRED",
    "CVF",
    "CVF - %PRED",
    "PEF",
    "PEF - %PRED",
    "FEF2575",
    "FEF257 - %PRED",
  ];

  const rows = patients.map((patient) => {
    return [
      `"${patient.name}"`,
      patient.satAtRestStartTC6 || "",
      patient.satAtRestEndTC6 || "",
      o2DuringTestMap[patient.o2DuringTestTC6] || patient.o2DuringTestTC6 || "",
      patient.litersO2TC6 || "",
      patient.tc6_1 || "",
      patient.tc6_2 || "",
      patient.satAtRestStartTSL || "",
      patient.satAtRestEndTSL || "",
      o2DuringTestMap[patient.o2DuringTestTSL] || patient.o2DuringTestTSL || "",
      patient.litersO2TSL || "",
      patient.tsl5RepSeconds || "",
      patient.tpp || "",
      patient.randomizationOrder || "",
      mrcMap[patient.mrc] || patient.mrc || "",
      `"${patient.pgiQualitative || ""}"`,
      patient.pgiD1IntraScore || "",
      patient.pgiD1InterScore || "",
      patient.pgiD2IntraScore || "",
      patient.kbildSimpleSum || "",
      patient.kbildScale0_100 || "",
      patient.whodas || "",
      patient.pahD1EMA || "",
      patient.pahD1EAA || "",
      pahActivityLevelMap[patient.pahD1ActivityLevel] ||
        patient.pahD1ActivityLevel ||
        "",
      patient.pahD2EMA || "",
      patient.pahD2EAA || "",
      pahActivityLevelMap[patient.pahD2ActivityLevel] ||
        patient.pahD2ActivityLevel ||
        "",
      patient.participationScale || "",
      participationScaleClassificationMap[
        patient.participationScaleClassification
      ] ||
        patient.participationScaleClassification ||
        "",
      patient.vef1CVF || "",
      patient.vef1CVFPred || "",
      patient.vef1 || "",
      patient.vef1Pred || "",
      patient.cvf || "",
      patient.cvfPred || "",
      patient.pef || "",
      patient.pefPred || "",
      patient.fef2575 || "",
      patient.fef257Pred || "",
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "phase1_tests_questionnaires_export.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function Phase1TestsAndQuestionnaires() {
  const { patients, fetchPatients, updatePatient } = usePatientStore();
  const navigate = useNavigate();
  const [sortedPatients, setSortedPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const loadPatients = async () => {
      await fetchPatients(); // Busca os pacientes quando o componente é montado
    };
    loadPatients();
  }, [fetchPatients]);

  // Ordena os pacientes alfabeticamente apenas na carga inicial
  useEffect(() => {
    const sorted = sortPatientsByName(patients);
    setSortedPatients(sorted);
  }, [patients]);

  const handleExport = () => {
    exportToCSV(sortedPatients);
  };

  // Funções para atualizar os campos do paciente
  const handleFieldChange = async (
    patientId: string,
    field: keyof Patient,
    value: string
  ) => {
    const updatedPatient = { [field]: value };
    await updatePatient(patientId, updatedPatient);
    // Atualiza localmente para refletir a alteração
    setSortedPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, [field]: value } : p))
    );
  };

  const handleTextFieldChange = async (
    patientId: string,
    field: keyof Patient,
    value: string
  ) => {
    // Validação para campos numéricos
    const numericFields = [
      "satAtRestStartTC6",
      "satAtRestEndTC6",
      "tc6_1",
      "tc6_2",
      "satAtRestStartTSL",
      "satAtRestEndTSL",
      "tsl5RepSeconds",
      "pgiD1IntraScore",
      "pgiD1InterScore",
      "pgiD2IntraScore",
      "kbildSimpleSum",
      "kbildScale0_100",
      "whodas",
      "pahD1EMA",
      "pahD1EAA",
      "pahD2EMA",
      "pahD2EAA",
      "participationScale",
      "vef1CVF",
      "vef1CVFPred",
      "vef1",
      "vef1Pred",
      "cvf",
      "cvfPred",
      "pef",
      "pefPred",
      "fef2575",
      "fef257Pred",
    ];

    if (numericFields.includes(field)) {
      if (!isNumeric(value) && value !== "") {
        toast.error(
          `O campo ${fieldNameMap[field]} só aceita valores numéricos!`
        );
        const updatedPatient = { [field]: "" };
        await updatePatient(patientId, updatedPatient);
        setSortedPatients((prev) =>
          prev.map((p) => (p.id === patientId ? { ...p, [field]: "" } : p))
        );
        return;
      }
    }

    const updatedPatient = { [field]: value };
    await updatePatient(patientId, updatedPatient);
    setSortedPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, [field]: value } : p))
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col py-6 px-6">
      <div className="container mx-auto">
        <Toaster position="top-right" />
        <button
          onClick={() => navigate("/exportar")}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          FASE 1 - Testes e Questionários
        </h1>
        <div className="mb-4">
          <button
            onClick={handleExport}
            className="py-2 px-4 rounded-md text-white font-medium bg-green-600 hover:bg-green-700"
          >
            Exportar para CSV
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Identificação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SAT em Repouso (%) - Início TC6
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SAT (%) Final TC6
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  O2 Durante o Teste (TC6)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Litros de O2 (TC6)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TC6-1
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TC6-2
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SAT em Repouso (%) - Início TSL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SAT (%) Final TSL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  O2 Durante o Teste (TSL)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Litros de O2 (TSL)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TSL 5rep em Segundos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TPP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ordem Randomização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MRC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PGI (qualitativo)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PGI (D1 Intra) (escore total)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PGI (D1 inter) (escore total)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PGI (D2 Intra) (escore total)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KBILD (Soma simples)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KBILD (escala de 0-100)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  WHODAS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PAH (D1) EMA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PAH (D1) EAA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nivel de Atividade (PAH) D1
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PAH(D2) EMA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PAH(D2) EAA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nivel de Atividade (PAH) D2
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Escala de Participação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classificação Escala de Participação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VEF1/CVF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VEF1/CVF - %PRED
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VEF1
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VEF1 - %PRED
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CVF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CVF - %PRED
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PEF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PEF - %PRED
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  FEF2575
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  FEF257 - %PRED
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPatients.map((patient) => (
                <tr key={patient.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.satAtRestStartTC6 || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "satAtRestStartTC6",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "satAtRestStartTC6",
                          patient.satAtRestStartTC6 || ""
                        )
                      }
                      className="w-28 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.satAtRestEndTC6 || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "satAtRestEndTC6",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "satAtRestEndTC6",
                          patient.satAtRestEndTC6 || ""
                        )
                      }
                      className="w-28 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <select
                      value={patient.o2DuringTestTC6 || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "o2DuringTestTC6",
                          e.target.value
                        )
                      }
                      className="w-32 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {o2DuringTestOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.litersO2TC6 || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "litersO2TC6",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "litersO2TC6",
                          patient.litersO2TC6 || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.tc6_1 || ""}
                      onChange={(e) =>
                        handleFieldChange(patient.id, "tc6_1", e.target.value)
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "tc6_1",
                          patient.tc6_1 || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.tc6_2 || ""}
                      onChange={(e) =>
                        handleFieldChange(patient.id, "tc6_2", e.target.value)
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "tc6_2",
                          patient.tc6_2 || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.satAtRestStartTSL || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "satAtRestStartTSL",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "satAtRestStartTSL",
                          patient.satAtRestStartTSL || ""
                        )
                      }
                      className="w-28 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.satAtRestEndTSL || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "satAtRestEndTSL",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "satAtRestEndTSL",
                          patient.satAtRestEndTSL || ""
                        )
                      }
                      className="w-28 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <select
                      value={patient.o2DuringTestTSL || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "o2DuringTestTSL",
                          e.target.value
                        )
                      }
                      className="w-32 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {o2DuringTestOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.litersO2TSL || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "litersO2TSL",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "litersO2TSL",
                          patient.litersO2TSL || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.tsl5RepSeconds || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "tsl5RepSeconds",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "tsl5RepSeconds",
                          patient.tsl5RepSeconds || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.tpp || ""}
                      onChange={(e) =>
                        handleFieldChange(patient.id, "tpp", e.target.value)
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "tpp",
                          patient.tpp || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.randomizationOrder || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "randomizationOrder",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "randomizationOrder",
                          patient.randomizationOrder || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <select
                      value={patient.mrc || ""}
                      onChange={(e) =>
                        handleFieldChange(patient.id, "mrc", e.target.value)
                      }
                      className="w-48 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {mrcOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.pgiQualitative || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "pgiQualitative",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "pgiQualitative",
                          patient.pgiQualitative || ""
                        )
                      }
                      className="w-72 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.pgiD1IntraScore || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "pgiD1IntraScore",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "pgiD1IntraScore",
                          patient.pgiD1IntraScore || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.pgiD1InterScore || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "pgiD1InterScore",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "pgiD1InterScore",
                          patient.pgiD1InterScore || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.pgiD2IntraScore || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "pgiD2IntraScore",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "pgiD2IntraScore",
                          patient.pgiD2IntraScore || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.kbildSimpleSum || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "kbildSimpleSum",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "kbildSimpleSum",
                          patient.kbildSimpleSum || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.kbildScale0_100 || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "kbildScale0_100",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "kbildScale0_100",
                          patient.kbildScale0_100 || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.whodas || ""}
                      onChange={(e) =>
                        handleFieldChange(patient.id, "whodas", e.target.value)
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "whodas",
                          patient.whodas || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.pahD1EMA || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "pahD1EMA",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "pahD1EMA",
                          patient.pahD1EMA || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.pahD1EAA || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "pahD1EAA",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "pahD1EAA",
                          patient.pahD1EAA || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <select
                      value={patient.pahD1ActivityLevel || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "pahD1ActivityLevel",
                          e.target.value
                        )
                      }
                      className="w-48 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {pahActivityLevelOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.pahD2EMA || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "pahD2EMA",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "pahD2EMA",
                          patient.pahD2EMA || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.pahD2EAA || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "pahD2EAA",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "pahD2EAA",
                          patient.pahD2EAA || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <select
                      value={patient.pahD2ActivityLevel || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "pahD2ActivityLevel",
                          e.target.value
                        )
                      }
                      className="w-48 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {pahActivityLevelOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.participationScale || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "participationScale",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "participationScale",
                          patient.participationScale || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <select
                      value={patient.participationScaleClassification || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "participationScaleClassification",
                          e.target.value
                        )
                      }
                      className="w-48 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {participationScaleClassificationOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.vef1CVF || ""}
                      onChange={(e) =>
                        handleFieldChange(patient.id, "vef1CVF", e.target.value)
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "vef1CVF",
                          patient.vef1CVF || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.vef1CVFPred || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "vef1CVFPred",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "vef1CVFPred",
                          patient.vef1CVFPred || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.vef1 || ""}
                      onChange={(e) =>
                        handleFieldChange(patient.id, "vef1", e.target.value)
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "vef1",
                          patient.vef1 || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.vef1Pred || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "vef1Pred",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "vef1Pred",
                          patient.vef1Pred || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.cvf || ""}
                      onChange={(e) =>
                        handleFieldChange(patient.id, "cvf", e.target.value)
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "cvf",
                          patient.cvf || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.cvfPred || ""}
                      onChange={(e) =>
                        handleFieldChange(patient.id, "cvfPred", e.target.value)
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "cvfPred",
                          patient.cvfPred || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.pef || ""}
                      onChange={(e) =>
                        handleFieldChange(patient.id, "pef", e.target.value)
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "pef",
                          patient.pef || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.pefPred || ""}
                      onChange={(e) =>
                        handleFieldChange(patient.id, "pefPred", e.target.value)
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "pefPred",
                          patient.pefPred || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.fef2575 || ""}
                      onChange={(e) =>
                        handleFieldChange(patient.id, "fef2575", e.target.value)
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "fef2575",
                          patient.fef2575 || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.fef257Pred || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "fef257Pred",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "fef257Pred",
                          patient.fef257Pred || ""
                        )
                      }
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Phase1TestsAndQuestionnaires;
