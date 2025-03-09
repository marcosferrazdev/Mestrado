import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Select, { ActionMeta, MultiValue } from "react-select";
import { Patient, usePatientStore } from "../store/usePatientStore.js";
import { NumericInput } from "./NumericInput.js";

// Função para formatar a data no formato "DD/MM/AAAA"
const formatDate = (dateInput: string | Date | null): string => {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString("pt-BR");
};


// Função para validar se o valor é numérico
const isNumeric = (value: string): boolean => {
  return /^\d*\.?\d*$/.test(value);
};

// Mapeamento de nomes de campos para nomes amigáveis
const fieldNameMap: { [key: string]: string } = {
  age: "Idade",
  heightMeters: "Altura (metros)",
  weight: "Peso",
  imc: "IMC",
  satAtRest: "Sat em Repouso (%)",
  charlsonComorbidityIndex: "Charlson Comorbidity Index (CCI)",
};

// Mapeamentos para converter palavras em números com base nas legendas da planilha
const sexMap: { [key: string]: string } = {
  Feminino: "1",
  Masculino: "2",
};
const sexOptions = ["Feminino", "Masculino"];

const recruitmentCityMap: { [key: string]: string } = {
  Diamantina: "1",
  "São Carlos": "2",
};
const recruitmentCityOptions = ["Diamantina", "São Carlos"];

const imcClassificationMap: { [key: string]: string } = {
  "Abaixo do peso": "1",
  "Peso normal": "2",
  Sobrepeso: "3",
  "Obesidade grau 1": "4",
  "Obesidade grau 2": "5",
  "Obesidade grau 3": "6",
};
const imcClassificationOptions = [
  "Abaixo do peso",
  "Peso normal",
  "Sobrepeso",
  "Obesidade grau 1",
  "Obesidade grau 2",
  "Obesidade grau 3",
];

const educationMap: { [key: string]: string } = {
  Analfabeto: "1",
  "Educação infantil": "2",
  Fundamental: "3",
  Médio: "4",
  "Superior (Graduação)": "5",
  "Pós-graduação": "6",
};
const educationOptions = [
  "Analfabeto",
  "Educação infantil",
  "Fundamental",
  "Médio",
  "Superior (Graduação)",
  "Pós-graduação",
];

const raceMap: { [key: string]: string } = {
  Branca: "1",
  Indígena: "2",
  Amarela: "3",
  Parda: "4",
  Preta: "5",
};
const raceOptions = ["Branca", "Indígena", "Amarela", "Parda", "Preta"];

const maritalStatusMap: { [key: string]: string } = {
  Solteiro: "1",
  Casado: "2",
  Divorciado: "3",
  Viúvo: "4",
};
const maritalStatusOptions = ["Solteiro", "Casado", "Divorciado", "Viúvo"];

const professionMap: { [key: string]: string } = {
  "do lar": "1",
  aposentado: "2",
  comerciante: "3",
  "trabalhador rural": "4",
  "funcionário público": "5",
  professora: "6",
  cabelereira: "7",
  caixa: "8",
  "policial penal": "9",
  "serviços gerais": "10",
  marteleiro: "11",
};
const professionOptions = [
  "do lar",
  "aposentado",
  "comerciante",
  "trabalhador rural",
  "funcionário público",
  "professora",
  "cabelereira",
  "caixa",
  "policial penal",
  "serviços gerais",
  "marteleiro",
];

const smokingHistoryMap: { [key: string]: string } = {
  Não: "1",
  Sim: "2",
};
const smokingHistoryOptions = ["Não", "Sim"];

const stoveExposureMap: { [key: string]: string } = {
  Não: "1",
  Sim: "2",
};
const stoveExposureOptions = ["Não", "Sim"];

const medicationMap: { [key: string]: string } = {
  Antifibróticos: "1",
  Corticosteróides: "2",
  Imunossupressores: "3",
  Antibióticos: "4",
  Broncodilatadores: "5",
  Antidepressivos: "6",
  "Anti-hipertensivos": "7",
  Analgésicos: "8",
  Anticoagulantes: "9",
  Ansiolíticos: "10",
  "Suplemento de Vitamina": "11",
  "Inibidor de bomba de prótons": "12",
  Antimalárico: "13",
  "Anti-inflamatório": "14",
  Estatinas: "15",
  Expectoantes: "16",
  "Suplemento hormonal tireoidiano": "17",
  "Suplemento nutricional": "18",
  Anticonvulsivante: "19",
  "Supressores de ácido gástrico": "20",
  "Relaxante muscular": "21",
  "Hipoglicemiante/antidiabético": "22",
  Antiarrítmico: "23",
  Antilipêmico: "24",
  Antigotoso: "25",
};
const medicationOptions = Object.keys(medicationMap);
const medicationSelectOptions = medicationOptions.map((option) => ({
  value: option,
  label: option,
}));

const comorbidityMap: { [key: string]: string } = {
  "Diabetes Mellitus": "1",
  "Hipertensão Arterial Sistêmica": "2",
  Neoplasia: "3",
  Cardiopatia: "4",
  "Doença reumatológica": "5",
  AVE: "6",
  "Doença Renal": "7",
  Depressão: "8",
  Ansiedade: "9",
  Hipotiroidismo: "10",
  Fibromialgia: "11",
  "Pré-diabetes": "12",
  "Arritmia cardíaca": "13",
  "Lesão óssea": "14",
  "Esclerose sistêmica": "15",
  "Esteatose hepática": "16",
  Lombalgia: "17",
  Hipercolesterolemia: "18",
  "Problema auditivo": "19",
};
const comorbidityOptions = Object.keys(comorbidityMap);
const comorbiditySelectOptions = comorbidityOptions.map((option) => ({
  value: option,
  label: option,
}));

const conditionMap: { [key: string]: string } = {
  Fibrose: "1",
  Reumatológica: "2",
  "Ligada a atividade ocupacional": "3",
  "Induzida por medicamento": "4",
  "Pneumonite por hipersensibilidade": "5",
  "Pneumonia intersticial usual": "6",
  "Fibrose pós-COVID": "7",
  "Doença mista do tecido conjuntivo": "8",
  Sarcoidose: "9",
  Silicose: "10",
};
const conditionOptions = Object.keys(conditionMap);

// Função para ordenar pacientes alfabeticamente por nome
const sortPatientsByName = (patients: Patient[]): Patient[] => {
  return [...patients].sort((a, b) => a.name.localeCompare(b.name));
};

const formatCSVField = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return "";
  // Converte para string e envolve em aspas
  return `"${value.toString().replace(/"/g, '""')}"`;
};


// Função para converter uma lista de valores separados por vírgula ou ponto e vírgula em números
const convertListToNumbers = (
  list: string | undefined,
  map: { [key: string]: string }
): string => {
  if (!list) return "";
  const items = list
    .replace(/;/g, ",")
    .split(",")
    .map((item) => item.trim());
  const numbers = items.map((item) => map[item] || item).filter((num) => num);
  return numbers.join(",");
};

const add6MonthsToDateString = (dateString: string): Date | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  date.setMonth(date.getMonth() + 6);
  return date;
};


// Função para exportar os dados para CSV com valores numéricos
const exportToCSV = (patients: Patient[]) => {
  const headers = [
    "Nome",
    "Fase",
    "Telefone",
    "Local da Coleta",
    "Data da Primeira Coleta",
    "Data Prevista Segunda Coleta",
    "Sexo",
    "Idade",
    "Altura (metros)",
    "Peso",
    "IMC",
    "IMC-Classificação",
    "Escolaridade",
    "Raça",
    "Estado Civil",
    "Profissão",
    "Histórico de Tabagismo",
    "Histórico de Tabagismo Passivo",
    "Histórico de Exposição a Fogão de Lenha",
    "Medicamentos",
    "Sat em Repouso (%)",
    "Comorbidades Associadas",
    "Charlson Comorbidity Index (CCI)",
    "Condição de Saúde",
  ];

 const rows = patients.map((patient) => {
  return [
    formatCSVField(patient.name),
    formatCSVField(patient.phase?.replace("FASE ", "") || ""),
    formatCSVField(patient.phone),
    formatCSVField(
      recruitmentCityMap[patient.recruitmentCity] || patient.recruitmentCity || ""
    ),
    formatCSVField(formatDate(patient.collectionDate)),
    formatCSVField(formatDate(add6MonthsToDateString(patient.collectionDate))),
    formatCSVField(sexMap[patient.sex] || patient.sex || ""),
    formatCSVField(patient.age || ""),
    formatCSVField(patient.heightMeters || ""),
    formatCSVField(patient.weight || ""),
    formatCSVField(patient.imc || ""),
    formatCSVField(
      imcClassificationMap[patient.imcClassification] ||
      patient.imcClassification ||
      ""
    ),
    formatCSVField(educationMap[patient.education] || patient.education || ""),
    formatCSVField(raceMap[patient.race] || patient.race || ""),
    formatCSVField(
      maritalStatusMap[patient.maritalStatus] || patient.maritalStatus || ""
    ),
    formatCSVField(professionMap[patient.profession] || patient.profession || ""),
    formatCSVField(
      smokingHistoryMap[patient.smokingHistory] || patient.smokingHistory || ""
    ),
    formatCSVField(
      smokingHistoryMap[patient.passiveSmokingHistory] ||
      patient.passiveSmokingHistory ||
      ""
    ),
    formatCSVField(
      stoveExposureMap[patient.stoveExposureHistory] ||
      patient.stoveExposureHistory ||
      ""
    ),
    formatCSVField(convertListToNumbers(patient.medications, medicationMap)),
    formatCSVField(patient.satAtRest || ""),
    formatCSVField(
      convertListToNumbers(patient.associatedComorbidities, comorbidityMap)
    ),
    formatCSVField(patient.charlsonComorbidityIndex || ""),
    formatCSVField(
      conditionMap[patient.healthCondition] || patient.healthCondition || ""
    ),
  ].join(",");
});


  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "patients_export.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function Phase1Identification() {
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
    setSortedPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, [field]: value } : p))
    );
  };

  const handleTextFieldChange = async (
  patientId: string,
  field: keyof Patient,
  value: string
) => {
  // Para campos numéricos, converte a vírgula em ponto
  const numericFields = [
    "age",
    "heightMeters",
    "weight",
    "imc",
    "satAtRest",
    "charlsonComorbidityIndex",
  ];

  if (numericFields.includes(field)) {
    // Usa parseNumber para converter "1,4" em 1.4
    const parsedValue = parseNumber(value);
    // Se o valor convertido não é um número (NaN), exibe um erro
    if (isNaN(parsedValue)) {
      toast.error(`O campo ${fieldNameMap[field]} só aceita valores numéricos!`);
      const updatedPatient = { [field]: "" };
      await updatePatient(patientId, updatedPatient);
      setSortedPatients((prev) =>
        prev.map((p) => (p.id === patientId ? { ...p, [field]: "" } : p))
      );
      return;
    }
    value = parsedValue.toString();
  }

  const updatedPatient = { [field]: value };
  await updatePatient(patientId, updatedPatient);
  setSortedPatients((prev) =>
    prev.map((p) => (p.id === patientId ? { ...p, [field]: value } : p))
  );
};

const parseNumber = (value: string): number => {
  return parseFloat(value.replace(",", "."));
};


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col py-6 px-6">
      <div className="container mx-auto">
        <button
          onClick={() => navigate("/exportar")}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          FASE 1 - Identificação
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
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fase
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Local da Coleta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data da Primeira Coleta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Prevista Segunda Coleta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sexo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Idade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Altura (metros)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Peso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IMC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IMC-Classificação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Escolaridade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Raça
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado Civil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profissão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Histórico de Tabagismo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Histórico de Tabagismo Passivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Histórico de Exposição a Fogão de Lenha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicamentos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sat em Repouso (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comorbidades Associadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Charlson Comorbidity Index (CCI)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condição de Saúde
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
                    {patient.phase}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <select
                      value={patient.recruitmentCity || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "recruitmentCity",
                          e.target.value
                        )
                      }
                      className="w-40 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {recruitmentCityOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(patient.collectionDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(add6MonthsToDateString(patient.collectionDate))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <select
                      value={patient.sex || ""}
                      onChange={(e) =>
                        handleFieldChange(patient.id, "sex", e.target.value)
                      }
                      className="w-32 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {sexOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.age || ""}
                      onChange={(e) =>
                        handleFieldChange(patient.id, "age", e.target.value)
                      }
                     
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <NumericInput
                      initialValue={patient.heightMeters || ""}
                      onCommit={(newValue) => handleFieldChange(patient.id, "heightMeters", newValue)}
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.weight || ""}
                      onChange={(e) =>
                        handleFieldChange(patient.id, "weight", e.target.value)
                      }
                     
                      className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.imc || ""}
                      onChange={(e) =>
                        handleFieldChange(patient.id, "imc", e.target.value)
                      }
                     
                      className="w-28 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <select
                      value={patient.imcClassification || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "imcClassification",
                          e.target.value
                        )
                      }
                      className="w-48 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {imcClassificationOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <select
                      value={patient.education || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "education",
                          e.target.value
                        )
                      }
                      className="w-48 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {educationOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <select
                      value={patient.race || ""}
                      onChange={(e) =>
                        handleFieldChange(patient.id, "race", e.target.value)
                      }
                      className="w-32 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {raceOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <select
                      value={patient.maritalStatus || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "maritalStatus",
                          e.target.value
                        )
                      }
                      className="w-32 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {maritalStatusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <select
                      value={patient.profession || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "profession",
                          e.target.value
                        )
                      }
                      className="w-48 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {professionOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <select
                      value={patient.smokingHistory || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "smokingHistory",
                          e.target.value
                        )
                      }
                      className="w-32 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {smokingHistoryOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <select
                      value={patient.passiveSmokingHistory || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "passiveSmokingHistory",
                          e.target.value
                        )
                      }
                      className="w-32 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {smokingHistoryOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <select
                      value={patient.stoveExposureHistory || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "stoveExposureHistory",
                          e.target.value
                        )
                      }
                      className="w-32 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {stoveExposureOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  {/* Coluna Medicamentos */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Select
                      isMulti
                      placeholder="Selecione"
                      value={
                        patient.medications
                          ? patient.medications
                              .split(",")
                              .map((med: string) => ({
                                value: med,
                                label: med,
                              }))
                          : []
                      }
                      onChange={(
                        newValue: MultiValue<{ value: string; label: string }>,
                        actionMeta: ActionMeta<{ value: string; label: string }>
                      ) => {
                        const selectedValues = newValue.map(
                          (option) => option.value
                        );
                        handleFieldChange(
                          patient.id,
                          "medications",
                          selectedValues.join(",")
                        );
                      }}
                      options={medicationSelectOptions}
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          minWidth: 250,
                        }),
                        menu: (provided) => ({
                          ...provided,
                          width: "auto",
                          minWidth: 250,
                        }),
                      }}
                      menuPortalTarget={document.body}
                      className="basic-multi-select"
                      classNamePrefix="select"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.satAtRest || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "satAtRest",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "satAtRest",
                          patient.satAtRest || ""
                        )
                      }
                      className="w-28 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Select
                      isMulti
                      placeholder="Selecione"
                      value={
                        patient.associatedComorbidities
                          ? patient.associatedComorbidities
                              .split(",")
                              .map((comorb: string) => ({
                                value: comorb,
                                label: comorb,
                              }))
                          : []
                      }
                      onChange={(
                        newValue: MultiValue<{ value: string; label: string }>,
                        actionMeta: ActionMeta<{ value: string; label: string }>
                      ) => {
                        const selectedValues = newValue.map(
                          (option) => option.value
                        );
                        handleFieldChange(
                          patient.id,
                          "associatedComorbidities",
                          selectedValues.join(",")
                        );
                      }}
                      options={comorbiditySelectOptions}
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          minWidth: 250,
                        }),
                        menu: (provided) => ({
                          ...provided,
                          width: "auto",
                          minWidth: 250,
                        }),
                      }}
                      menuPortalTarget={document.body}
                      className="basic-multi-select"
                      classNamePrefix="select"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={patient.charlsonComorbidityIndex || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          patient.id,
                          "charlsonComorbidityIndex",
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        handleTextFieldChange(
                          patient.id,
                          "charlsonComorbidityIndex",
                          patient.charlsonComorbidityIndex || ""
                        )
                      }
                      className="w-28 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <select
                      value={patient.healthCondition || ""}
                      onChange={(e) => {
                        if (conditionOptions.includes(e.target.value)) {
                          handleFieldChange(
                            patient.id,
                            "healthCondition",
                            e.target.value
                          );
                        } else {
                          toast.error(
                            "Condição de saúde não está nas opções permitidas!"
                          );
                        }
                      }}
                      className="w-48 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {conditionOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
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

export default Phase1Identification;
