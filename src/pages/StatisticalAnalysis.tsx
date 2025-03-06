import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Patient, usePatientStore } from "../store/usePatientStore.js";

// Função para calcular estatísticas descritivas (média, desvio padrão, min, max)
const calculateDescriptiveStats = (data: number[]) => {
  if (data.length === 0) return { mean: 0, stdDev: 0, min: 0, max: 0 };

  const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
  const variance =
    data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
    data.length;
  const stdDev = Math.sqrt(variance);
  const min = Math.min(...data);
  const max = Math.max(...data);

  return { mean, stdDev, min, max };
};

// Função para calcular correlação de Pearson entre duas variáveis
const calculatePearsonCorrelation = (x: number[], y: number[]) => {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const meanX = x.reduce((sum, value) => sum + value, 0) / n;
  const meanY = y.reduce((sum, value) => sum + value, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }

  return numerator / Math.sqrt(denomX * denomY);
};

// Função para realizar um teste t de amostras independentes (simplificado)
const calculateTTest = (group1: number[], group2: number[]) => {
  const mean1 = group1.reduce((sum, value) => sum + value, 0) / group1.length;
  const mean2 = group2.reduce((sum, value) => sum + value, 0) / group2.length;

  const var1 =
    group1.reduce((sum, value) => sum + Math.pow(value - mean1, 2), 0) /
    (group1.length - 1);
  const var2 =
    group2.reduce((sum, value) => sum + Math.pow(value - mean2, 2), 0) /
    (group2.length - 1);

  const tStat =
    (mean1 - mean2) / Math.sqrt(var1 / group1.length + var2 / group2.length);

  return { tStat, mean1, mean2 };
};

// Função para realizar ANOVA (simplificado)
const calculateANOVA = (groups: number[][]) => {
  const groupMeans = groups.map(
    (group) => group.reduce((sum, value) => sum + value, 0) / group.length
  );
  const overallMean =
    groups.flat().reduce((sum, value) => sum + value, 0) / groups.flat().length;

  const ssBetween = groups.reduce((sum, group, i) => {
    return sum + group.length * Math.pow(groupMeans[i] - overallMean, 2);
  }, 0);

  const ssWithin = groups.reduce((sum, group, i) => {
    return (
      sum +
      group.reduce((s, value) => s + Math.pow(value - groupMeans[i], 2), 0)
    );
  }, 0);

  const dfBetween = groups.length - 1;
  const dfWithin = groups.flat().length - groups.length;
  const fStat = ssBetween / dfBetween / (ssWithin / dfWithin);

  return { fStat, groupMeans };
};

// Função para realizar regressão linear simples
const calculateLinearRegression = (x: number[], y: number[]) => {
  if (x.length !== y.length || x.length === 0)
    return { slope: 0, intercept: 0 };

  const n = x.length;
  const meanX = x.reduce((sum, value) => sum + value, 0) / n;
  const meanY = y.reduce((sum, value) => sum + value, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denominator += diffX * diffX;
  }

  const slope = numerator / denominator;
  const intercept = meanY - slope * meanX;

  return { slope, intercept };
};

function StatisticalAnalysis() {
  const { patients, fetchPatients } = usePatientStore();
  const navigate = useNavigate();
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const loadPatients = async () => {
      await fetchPatients(); // Busca os pacientes quando o componente é montado
    };
    loadPatients();
  }, [fetchPatients]);

  // Função para alternar a seleção de um paciente
  const handlePatientSelection = (patientId: string) => {
    const newSelectedPatients = new Set(selectedPatients);
    if (newSelectedPatients.has(patientId)) {
      newSelectedPatients.delete(patientId);
    } else {
      newSelectedPatients.add(patientId);
    }
    setSelectedPatients(newSelectedPatients);
  };

  // Função para selecionar/deselecionar todos os pacientes
  const handleSelectAll = () => {
    if (selectedPatients.size === patients.length) {
      setSelectedPatients(new Set());
    } else {
      setSelectedPatients(new Set(patients.map((p) => p.id)));
    }
  };

  // Função para obter os pacientes selecionados
  const getSelectedPatients = () =>
    patients.filter((p) => selectedPatients.has(p.id));

  const handleAnalysis = (analysisType: string) => {
    setSelectedAnalysis(analysisType);
    setResults(null);

    const selected = getSelectedPatients();

    if (analysisType === "descriptive") {
      // Estatísticas descritivas para idade
      const ages = selected
        .map((p) => parseFloat(p.age))
        .filter((age) => !isNaN(age));
      const stats = calculateDescriptiveStats(ages);
      setResults({ variable: "Idade", ...stats });
    } else if (analysisType === "ttest") {
      // Teste t para Sat em Repouso entre homens e mulheres
      const maleSat = selected
        .filter((p) => p.sex === "Masculino")
        .map((p) => parseFloat(p.satAtRest))
        .filter((sat) => !isNaN(sat));
      const femaleSat = selected
        .filter((p) => p.sex === "Feminino")
        .map((p) => parseFloat(p.satAtRest))
        .filter((sat) => !isNaN(sat));
      const tTestResults = calculateTTest(maleSat, femaleSat);
      setResults({
        group1: "Masculino",
        group2: "Feminino",
        variable: "Sat em Repouso (%)",
        ...tTestResults,
      });
    } else if (analysisType === "anova") {
      // ANOVA para IMC por nível de escolaridade
      const educationLevels = [...new Set(selected.map((p) => p.education))];
      const groups = educationLevels.map((level) =>
        selected
          .filter((p) => p.education === level)
          .map((p) => parseFloat(p.imc))
          .filter((imc) => !isNaN(imc))
      );
      const anovaResults = calculateANOVA(groups);
      setResults({
        groups: educationLevels,
        variable: "IMC",
        ...anovaResults,
      });
    } else if (analysisType === "correlation") {
      // Correlação entre peso e altura
      const weights = selected
        .map((p) => parseFloat(p.weight))
        .filter((w) => !isNaN(w));
      const heights = selected
        .map((p) => parseFloat(p.heightMeters))
        .filter((h) => !isNaN(h));
      const minLength = Math.min(weights.length, heights.length);
      const correlation = calculatePearsonCorrelation(
        weights.slice(0, minLength),
        heights.slice(0, minLength)
      );
      setResults({
        variable1: "Peso",
        variable2: "Altura (metros)",
        correlation,
      });
    } else if (analysisType === "regression") {
      // Regressão linear para prever IMC com base no peso
      const weights = selected
        .map((p) => parseFloat(p.weight))
        .filter((w) => !isNaN(w));
      const imcs = selected
        .map((p) => parseFloat(p.imc))
        .filter((imc) => !isNaN(imc));
      const minLength = Math.min(weights.length, imcs.length);
      const regressionResults = calculateLinearRegression(
        weights.slice(0, minLength),
        imcs.slice(0, minLength)
      );
      setResults({
        independentVariable: "Peso",
        dependentVariable: "IMC",
        ...regressionResults,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col py-6 px-6">
      <div className="container mx-auto">
        <button
          onClick={() => navigate("/home")}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Análises Estatísticas
        </h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* Seção para seleção de pacientes */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Selecione os Pacientes
            </h2>
            <button
              onClick={handleSelectAll}
              className="mb-4 py-1 px-3 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700 text-sm" // Botão menor
            >
              {selectedPatients.size === patients.length
                ? "Desmarcar Todos"
                : "Selecionar Todos"}
            </button>
            <div className="max-h-60 overflow-y-auto border rounded-md p-2">
              {patients.map((patient) => (
                <div key={patient.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={patient.id}
                    checked={selectedPatients.has(patient.id)}
                    onChange={() => handlePatientSelection(patient.id)}
                    className="mr-2"
                  />
                  <label htmlFor={patient.id} className="text-sm text-gray-700">
                    {patient.name} {/* Removido (ID: {patient.id}) */}
                  </label>
                </div>
              ))}
            </div>
            <p className="mt-2 text-gray-600">
              Pacientes selecionados: {selectedPatients.size} de{" "}
              {patients.length}
            </p>
          </div>

          {/* Seção para seleção de análise */}
          <h2 className="text-xl font-semibold mb-4">
            Selecione o Tipo de Análise
          </h2>
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => handleAnalysis("descriptive")}
              className="py-2 px-4 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700"
            >
              Estatísticas Descritivas
            </button>
            <button
              onClick={() => handleAnalysis("ttest")}
              className="py-2 px-4 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700"
            >
              Teste t de Amostras Independentes
            </button>
            <button
              onClick={() => handleAnalysis("anova")}
              className="py-2 px-4 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700"
            >
              ANOVA
            </button>
            <button
              onClick={() => handleAnalysis("correlation")}
              className="py-2 px-4 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700"
            >
              Correlação
            </button>
            <button
              onClick={() => handleAnalysis("regression")}
              className="py-2 px-4 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700"
            >
              Regressão Linear
            </button>
          </div>

          {results && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Resultados</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                {selectedAnalysis === "descriptive" && (
                  <>
                    <p>
                      <strong>Variável:</strong> {results.variable}
                    </p>
                    <p>
                      <strong>Média:</strong> {results.mean.toFixed(2)}
                    </p>
                    <p>
                      <strong>Desvio Padrão:</strong>{" "}
                      {results.stdDev.toFixed(2)}
                    </p>
                    <p>
                      <strong>Mínimo:</strong> {results.min}
                    </p>
                    <p>
                      <strong>Máximo:</strong> {results.max}
                    </p>
                  </>
                )}
                {selectedAnalysis === "ttest" && (
                  <>
                    <p>
                      <strong>Variável:</strong> {results.variable}
                    </p>
                    <p>
                      <strong>Média ({results.group1}):</strong>{" "}
                      {results.mean1.toFixed(2)}
                    </p>
                    <p>
                      <strong>Média ({results.group2}):</strong>{" "}
                      {results.mean2.toFixed(2)}
                    </p>
                    <p>
                      <strong>Estatística t:</strong> {results.tStat.toFixed(2)}
                    </p>
                  </>
                )}
                {selectedAnalysis === "anova" && (
                  <>
                    <p>
                      <strong>Variável:</strong> {results.variable}
                    </p>
                    {results.groups.map((group: string, i: number) => (
                      <p key={i}>
                        <strong>Média ({group}):</strong>{" "}
                        {results.groupMeans[i].toFixed(2)}
                      </p>
                    ))}
                    <p>
                      <strong>Estatística F:</strong> {results.fStat.toFixed(2)}
                    </p>
                  </>
                )}
                {selectedAnalysis === "correlation" && (
                  <>
                    <p>
                      <strong>Variável 1:</strong> {results.variable1}
                    </p>
                    <p>
                      <strong>Variável 2:</strong> {results.variable2}
                    </p>
                    <p>
                      <strong>Correlação de Pearson:</strong>{" "}
                      {results.correlation.toFixed(2)}
                    </p>
                  </>
                )}
                {selectedAnalysis === "regression" && (
                  <>
                    <p>
                      <strong>Variável Independente:</strong>{" "}
                      {results.independentVariable}
                    </p>
                    <p>
                      <strong>Variável Dependente:</strong>{" "}
                      {results.dependentVariable}
                    </p>
                    <p>
                      <strong>Coeficiente (slope):</strong>{" "}
                      {results.slope.toFixed(2)}
                    </p>
                    <p>
                      <strong>Intercepto:</strong>{" "}
                      {results.intercept.toFixed(2)}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatisticalAnalysis;
