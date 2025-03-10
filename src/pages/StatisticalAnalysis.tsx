import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Patient, usePatientStore } from "../store/usePatientStore.js";
import NormalityTest from "./AnalisyStatics/NormalityTest.js";

// Funções de cálculo (ajustadas para garantir retornos válidos)
const calculateDescriptiveStats = (data: number[]) => {
  if (!data || data.length === 0) return { mean: 0, stdDev: 0, min: 0, max: 0 };
  const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
  const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);
  const min = Math.min(...data);
  const max = Math.max(...data);
  return { mean, stdDev, min, max };
};

const calculatePearsonCorrelation = (x: number[], y: number[]) => {
  if (!x || !y || x.length !== y.length || x.length === 0) return 0;
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

const calculateTTest = (group1: number[], group2: number[]) => {
  if (!group1 || !group2 || group1.length === 0 || group2.length === 0) {
    return { tStat: 0, mean1: 0, mean2: 0 };
  }
  const mean1 = group1.reduce((sum, value) => sum + value, 0) / group1.length;
  const mean2 = group2.reduce((sum, value) => sum + value, 0) / group2.length;
  const var1 = group1.reduce((sum, value) => sum + Math.pow(value - mean1, 2), 0) / (group1.length - 1);
  const var2 = group2.reduce((sum, value) => sum + Math.pow(value - mean2, 2), 0) / (group2.length - 1);
  const tStat = (mean1 - mean2) / Math.sqrt(var1 / group1.length + var2 / group2.length);
  return { tStat, mean1, mean2 };
};

const calculateANOVA = (groups: number[][]) => {
  if (!groups || groups.length === 0 || groups.some((g) => g.length === 0)) {
    return { fStat: 0, groupMeans: [] };
  }
  const groupMeans = groups.map((group) => group.reduce((sum, value) => sum + value, 0) / group.length);
  const overallMean = groups.flat().reduce((sum, value) => sum + value, 0) / groups.flat().length;
  const ssBetween = groups.reduce((sum, group, i) => sum + group.length * Math.pow(groupMeans[i] - overallMean, 2), 0);
  const ssWithin = groups.reduce((sum, group, i) => sum + group.reduce((s, value) => s + Math.pow(value - groupMeans[i], 2), 0), 0);
  const dfBetween = groups.length - 1;
  const dfWithin = groups.flat().length - groups.length;
  const fStat = ssBetween / dfBetween / (ssWithin / dfWithin);
  return { fStat: isNaN(fStat) ? 0 : fStat, groupMeans };
};

const calculateLinearRegression = (x: number[], y: number[]) => {
  if (!x || !y || x.length !== y.length || x.length === 0) return { slope: 0, intercept: 0 };
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
  return { slope: isNaN(slope) ? 0 : slope, intercept: isNaN(intercept) ? 0 : intercept };
};

function StatisticalAnalysis() {
  const { patients, fetchPatients } = usePatientStore();
  const navigate = useNavigate();
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(new Set());
  const [selectedVariableX, setSelectedVariableX] = useState<keyof Patient | "">("");
  const [selectedVariableY, setSelectedVariableY] = useState<keyof Patient | "">("");

  useEffect(() => {
    const loadPatients = async () => {
      await fetchPatients();
    };
    loadPatients();
  }, [fetchPatients]);

  const handlePatientSelection = (patientId: string) => {
    const newSelectedPatients = new Set(selectedPatients);
    if (newSelectedPatients.has(patientId)) {
      newSelectedPatients.delete(patientId);
    } else {
      newSelectedPatients.add(patientId);
    }
    setSelectedPatients(newSelectedPatients);
  };

  const handleSelectAll = () => {
    if (selectedPatients.size === patients.length) {
      setSelectedPatients(new Set());
    } else {
      setSelectedPatients(new Set(patients.map((p) => p.id)));
    }
  };

  const getSelectedPatients = () => patients.filter((p) => selectedPatients.has(p.id));

  const handleAnalysis = (analysisType: string) => {
    setSelectedAnalysis(analysisType);
    setResults(null);

    const selected = getSelectedPatients();
    if (selected.length === 0) {
      alert("Por favor, selecione pelo menos um paciente.");
      return;
    }

    if (analysisType !== "normality" && !selectedVariableX) {
      alert("Por favor, selecione a variável X antes de realizar a análise.");
      return;
    }

    if ((analysisType === "correlation" || analysisType === "regression") && !selectedVariableY) {
      alert("Por favor, selecione a variável Y para Correlação ou Regressão.");
      return;
    }

    if (analysisType === "descriptive") {
      const data = selected
        .map((p) => parseFloat(p[selectedVariableX as keyof Patient]))
        .filter((value) => !isNaN(value));
      const stats = calculateDescriptiveStats(data);
      setResults({ variable: selectedVariableX, ...stats });
    } else if (analysisType === "ttest") {
      const group1Data = selected
        .filter((p) => p.sex === "Masculino")
        .map((p) => parseFloat(p[selectedVariableX as keyof Patient]))
        .filter((value) => !isNaN(value));
      const group2Data = selected
        .filter((p) => p.sex === "Feminino")
        .map((p) => parseFloat(p[selectedVariableX as keyof Patient]))
        .filter((value) => !isNaN(value));
      const tTestResults = calculateTTest(group1Data, group2Data);
      setResults({
        group1: "Masculino",
        group2: "Feminino",
        variable: selectedVariableX,
        ...tTestResults,
      });
    } else if (analysisType === "anova") {
      const groupsByCategory = [...new Set(selected.map((p) => p.education))];
      const groups = groupsByCategory.map((category) =>
        selected
          .filter((p) => p.education === category)
          .map((p) => parseFloat(p[selectedVariableX as keyof Patient]))
          .filter((value) => !isNaN(value))
      );
      const anovaResults = calculateANOVA(groups);
      setResults({
        groups: groupsByCategory,
        variable: selectedVariableX,
        ...anovaResults,
      });
    } else if (analysisType === "correlation") {
      const xData = selected
        .map((p) => parseFloat(p[selectedVariableX as keyof Patient]))
        .filter((value) => !isNaN(value));
      const yData = selected
        .map((p) => parseFloat(p[selectedVariableY as keyof Patient]))
        .filter((value) => !isNaN(value));
      const minLength = Math.min(xData.length, yData.length);
      const correlation = calculatePearsonCorrelation(xData.slice(0, minLength), yData.slice(0, minLength));
      setResults({
        variableX: selectedVariableX,
        variableY: selectedVariableY,
        correlation,
      });
    } else if (analysisType === "regression") {
      const xData = selected
        .map((p) => parseFloat(p[selectedVariableX as keyof Patient]))
        .filter((value) => !isNaN(value));
      const yData = selected
        .map((p) => parseFloat(p[selectedVariableY as keyof Patient]))
        .filter((value) => !isNaN(value));
      const minLength = Math.min(xData.length, yData.length);
      const regressionResults = calculateLinearRegression(xData.slice(0, minLength), yData.slice(0, minLength));
      setResults({
        independentVariable: selectedVariableX,
        dependentVariable: selectedVariableY,
        ...regressionResults,
      });
    }
  };

  const variableOptions: { value: keyof Patient; label: string }[] = [
    { value: "age", label: "Idade" },
    { value: "weight", label: "Peso" },
    { value: "heightMeters", label: "Altura (metros)" },
    { value: "imc", label: "IMC" },
    { value: "satAtRest", label: "Sat em Repouso (%)" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col py-6 px-6">
      <div className="container mx-auto">
        <button
          onClick={() => navigate("/home")}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Análises Estatísticas</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Selecione os Pacientes</h2>
            <button
              onClick={handleSelectAll}
              className="mb-4 py-1 px-3 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700 text-sm"
            >
              {selectedPatients.size === patients.length ? "Desmarcar Todos" : "Selecionar Todos"}
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
                    {patient.name}
                  </label>
                </div>
              ))}
            </div>
            <p className="mt-2 text-gray-600">
              Pacientes selecionados: {selectedPatients.size} de {patients.length}
            </p>
          </div>

          <h2 className="text-xl font-semibold mb-4">Selecione o Tipo de Análise</h2>
          <div className="flex flex-wrap gap-4 mb-6">
            <button onClick={() => handleAnalysis("descriptive")} className="py-2 px-4 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700">
              Estatísticas Descritivas
            </button>
            <button onClick={() => handleAnalysis("ttest")} className="py-2 px-4 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700">
              Teste t de Amostras Independentes
            </button>
            <button onClick={() => handleAnalysis("anova")} className="py-2 px-4 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700">
              ANOVA
            </button>
            <button onClick={() => handleAnalysis("correlation")} className="py-2 px-4 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700">
              Correlação
            </button>
            <button onClick={() => handleAnalysis("regression")} className="py-2 px-4 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700">
              Regressão Linear
            </button>
            <button onClick={() => setSelectedAnalysis("normality")} className="py-2 px-4 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700">
              Teste de Normalidade
            </button>
          </div>

          {selectedAnalysis !== "normality" && (
            <div className="mb-6">
              <div className="mb-4">
                <label htmlFor="variableXSelect" className="block text-sm font-medium text-gray-700">
                  Selecione a Variável X:
                </label>
                <select
                  id="variableXSelect"
                  value={selectedVariableX}
                  onChange={(e) => setSelectedVariableX(e.target.value as keyof Patient | "")}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">-- Escolha uma variável --</option>
                  {variableOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {(selectedAnalysis === "correlation" || selectedAnalysis === "regression") && (
                <div>
                  <label htmlFor="variableYSelect" className="block text-sm font-medium text-gray-700">
                    Selecione a Variável Y:
                  </label>
                  <select
                    id="variableYSelect"
                    value={selectedVariableY}
                    onChange={(e) => setSelectedVariableY(e.target.value as keyof Patient | "")}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">-- Escolha uma variável --</option>
                    {variableOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {selectedAnalysis === "normality" ? (
            <NormalityTest selectedPatients={getSelectedPatients()} />
          ) : (
            results && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Resultados</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  {selectedAnalysis === "descriptive" && (
                    <>
                      <p><strong>Variável:</strong> {results.variable}</p>
                      <p><strong>Média:</strong> {(results.mean ?? 0).toFixed(2)}</p>
                      <p><strong>Desvio Padrão:</strong> {(results.stdDev ?? 0).toFixed(2)}</p>
                      <p><strong>Mínimo:</strong> {results.min ?? 0}</p>
                      <p><strong>Máximo:</strong> {results.max ?? 0}</p>
                    </>
                  )}
                  {selectedAnalysis === "ttest" && (
                    <>
                      <p><strong>Variável:</strong> {results.variable}</p>
                      <p><strong>Média ({results.group1}):</strong> {(results.mean1 ?? 0).toFixed(2)}</p>
                      <p><strong>Média ({results.group2}):</strong> {(results.mean2 ?? 0).toFixed(2)}</p>
                      <p><strong>Estatística t:</strong> {(results.tStat ?? 0).toFixed(2)}</p>
                    </>
                  )}
                  {selectedAnalysis === "anova" && (
                    <>
                      <p><strong>Variável:</strong> {results.variable}</p>
                      {results.groups.map((group: string, i: number) => (
                        <p key={i}><strong>Média ({group}):</strong> {(results.groupMeans[i] ?? 0).toFixed(2)}</p>
                      ))}
                      <p><strong>Estatística F:</strong> {(results.fStat ?? 0).toFixed(2)}</p>
                    </>
                  )}
                  {selectedAnalysis === "correlation" && (
                    <>
                      <p><strong>Variável X:</strong> {results.variableX}</p>
                      <p><strong>Variável Y:</strong> {results.variableY}</p>
                      <p><strong>Correlação de Pearson:</strong> {(results.correlation ?? 0).toFixed(2)}</p>
                    </>
                  )}
                  {selectedAnalysis === "regression" && (
                    <>
                      <p><strong>Variável Independente (X):</strong> {results.independentVariable}</p>
                      <p><strong>Variável Dependente (Y):</strong> {results.dependentVariable}</p>
                      <p><strong>Coeficiente (slope):</strong> {(results.slope ?? 0).toFixed(2)}</p>
                      <p><strong>Intercepto:</strong> {(results.intercept ?? 0).toFixed(2)}</p>
                    </>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default StatisticalAnalysis;