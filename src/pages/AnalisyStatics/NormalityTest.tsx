// NormalityTest.tsx
import { useEffect, useState } from "react";
import HistogramModal from "./HistogramModal.js";

// ----------------------------------------------------
// 1) FUNÇÕES AUXILIARES
// ----------------------------------------------------

// CDF da Normal Padrão (aproximação por polinômios, método de Abramowitz & Stegun)
function standardNormalCDF(x: number): number {
  if (x > 8) return 1;
  if (x < -8) return 0;
  const p = 0.2316419;
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;

  const phi = Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI); // PDF da Normal(0,1)
  const t = 1 / (1 + p * Math.abs(x));
  let z = 1 - phi * (b1 * t + b2 * t * t + b3 * t ** 3 + b4 * t ** 4 + b5 * t ** 5);
  return x >= 0 ? z : 1 - z;
}

// Calcula média e desvio padrão populacional
function meanAndStd(data: number[]) {
  const n = data.length;
  const mean = data.reduce((s, v) => s + v, 0) / n;
  const variance = data.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  return { mean, std: Math.sqrt(variance) };
}

// Kolmogorov-Smirnov (para Normal)
function kolmogorovSmirnovTest(data: number[]) {
  const n = data.length;
  if (n < 3) {
    return { statistic: 0, df: n, pValue: 1 };
  }
  const { mean, std } = meanAndStd(data);
  const zscores = data.map((x) => (x - mean) / std).sort((a, b) => a - b);

  let d = 0;
  for (let i = 0; i < n; i++) {
    const F_empirico = (i + 1) / n;
    const F_teorico = standardNormalCDF(zscores[i]);
    const diff = Math.abs(F_empirico - F_teorico);
    if (diff > d) d = diff;
  }

  // Aproximação do p-value
  const lambda = (Math.sqrt(n) + 0.12 + 0.11 / Math.sqrt(n)) * d;
  let pValue = 0;
  const altSumLimit = 100;
  for (let k = 1; k < altSumLimit; k++) {
    const term = 2 * (-1) ** (k - 1) * Math.exp(-2 * k * k * lambda * lambda);
    pValue += term;
  }
  if (pValue < 0) pValue = 0;
  if (pValue > 1) pValue = 1;

  return { statistic: d, df: n, pValue };
}

// Shapiro-Wilk
function shapiroWilkTest(data: number[]) {
  const n = data.length;
  if (n < 3) {
    return { statistic: 1.0, df: n, pValue: 1 };
  }
  const sorted = [...data].sort((a, b) => a - b);
  const meanData = sorted.reduce((s, v) => s + v, 0) / n;
  const xx = sorted.map((v) => v - meanData);
  const s2 = xx.reduce((s, v) => s + v * v, 0);

  const a = shapiroWilkCoefficients(n);
  let numerator = 0;
  for (let i = 0; i < n; i++) {
    numerator += a[i] * sorted[n - 1 - i];
  }
  const W = (numerator * numerator) / s2;

  const { pValue } = approximateShapiroWilkPValue(W, n);
  return { statistic: W, df: n, pValue };
}

function shapiroWilkCoefficients(n: number): number[] {
  const quantis = [];
  for (let i = 1; i <= n; i++) {
    const q = standardNormalCDF((i - 0.375) / (n + 0.25));
    quantis.push(q);
  }
  const meanQ = quantis.reduce((s, v) => s + v, 0) / n;
  const sdQ = Math.sqrt(
    quantis.reduce((s, v) => s + (v - meanQ) ** 2, 0) / n
  );
  const a = quantis.map((v) => (v - meanQ) / sdQ);
  return a;
}

function approximateShapiroWilkPValue(W: number, n: number) {
  const y = Math.log(1 - W);
  const m = -1.2725 + 1.0521 * Math.log(n);
  const s = 1.0308 - 0.26758 * Math.log(n);
  const z = (y - m) / s;
  const pValue = standardNormalCDF(z);
  return { pValue };
}

// ----------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------

/**
 * Recebe via props: selectedPatients -> array de pacientes que foram selecionados.
 */
function NormalityTest({ selectedPatients }: { selectedPatients: any[] }) {
  const [results, setResults] = useState<
    Array<{
      variableName: string;
      ksStatistic: number;
      ksDf: number;
      ksSig: number;
      swStatistic: number;
      swDf: number;
      swSig: number;
      rawData: number[];
    }>
  >([]);

  const [showHistograms, setShowHistograms] = useState(false);

  useEffect(() => {
    // Aqui vamos analisar SOMENTE selectedPatients
    const variables = [
        // FASE 1 - Identificação
        { key: "age", label: "Idade" },
        { key: "heightMeters", label: "Altura (metros)" },
        { key: "weight", label: "Peso" },
        { key: "imc", label: "IMC" },
        { key: "satAtRest", label: "Sat em Repouso (%)" },
        { key: "charlsonComorbidityIndex", label: "Charlson Comorbidity Index" },

        // FASE 1 - Testes e Questionários (exemplos)
        { key: "satAtRestStartTC6", label: "SAT em Repouso (%) - Início TC6" },
        { key: "satAtRestEndTC6", label: "SAT (%) Final TC6" },
        { key: "litersO2TC6", label: "Litros de O2 (TC6)" },
        { key: "tc6_1", label: "TC6-1" },
        { key: "tc6_2", label: "TC6-2" },
        { key: "satAtRestStartTSL", label: "SAT em Repouso (%) - Início TSL" },
        { key: "satAtRestEndTSL", label: "SAT (%) Final TSL" },
        { key: "litersO2TSL", label: "Litros de O2 (TSL)" },
        { key: "tsl5RepSeconds", label: "TSL 5rep em Segundos" },
        { key: "kbildSimpleSum", label: "KBILD (Soma simples)" },
        { key: "kbildScale0_100", label: "KBILD (escala de 0-100)" },
        { key: "whodas", label: "WHODAS" },
        { key: "pahD1EMA", label: "PAH (D1) EMA" },
        { key: "pahD1EAA", label: "PAH (D1) EAA" },
        { key: "pahD2EMA", label: "PAH (D2) EMA" },
        { key: "pahD2EAA", label: "PAH (D2) EAA" },
        { key: "participationScale", label: "Escala de Participação" },
        { key: "vef1CVF", label: "VEF1/CVF" },
        { key: "vef1CVFPred", label: "VEF1/CVF - %PRED" },
        { key: "vef1", label: "VEF1" },
        { key: "vef1Pred", label: "VEF1 - %PRED" },
        { key: "cvf", label: "CVF" },
        { key: "cvfPred", label: "CVF - %PRED" },
        { key: "pef", label: "PEF" },
        { key: "pefPred", label: "PEF - %PRED" },
        { key: "fef2575", label: "FEF25-75" },
        { key: "fef257Pred", label: "FEF25-75 - %PRED" },
      ];
      
    const newResults: Array<{
      variableName: string;
      ksStatistic: number;
      ksDf: number;
      ksSig: number;
      swStatistic: number;
      swDf: number;
      swSig: number;
      rawData: number[];
    }> = [];

    for (const variable of variables) {
      // extrai valores APENAS dos pacientes selecionados
      const data: number[] = selectedPatients
        .map((p) => parseFloat(p[variable.key]))
        .filter((val) => !isNaN(val));

      if (data.length === 0) continue;

      // K-S
      const ks = kolmogorovSmirnovTest(data);
      // S-W
      const sw = shapiroWilkTest(data);

      newResults.push({
        variableName: variable.label,
        ksStatistic: ks.statistic,
        ksDf: ks.df,
        ksSig: ks.pValue,
        swStatistic: sw.statistic,
        swDf: sw.df,
        swSig: sw.pValue,
        rawData: data,
      });
    }

    setResults(newResults);
  }, [selectedPatients]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Teste de Normalidade</h1>
      {results.length === 0 ? (
        <p>Nenhuma variável numérica (ou nenhum paciente selecionado).</p>
      ) : (
        <>
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-2 border-r">Variável</th>
                <th colSpan={3} className="px-4 py-2 border-r text-center">
                  Kolmogorov-Smirnov
                </th>
                <th colSpan={3} className="px-4 py-2 text-center">
                  Shapiro-Wilk
                </th>
              </tr>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-2 border-r"></th>
                <th className="px-4 py-2 border-r">Statistic</th>
                <th className="px-4 py-2 border-r">df</th>
                <th className="px-4 py-2 border-r">Sig.</th>
                <th className="px-4 py-2 border-r">Statistic</th>
                <th className="px-4 py-2 border-r">df</th>
                <th className="px-4 py-2">Sig.</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={idx} className="border-b">
                  <td className="px-4 py-2 border-r">{r.variableName}</td>
                  <td className="px-4 py-2 border-r text-center">
                    {r.ksStatistic.toFixed(3)}
                  </td>
                  <td className="px-4 py-2 border-r text-center">{r.ksDf}</td>
                  <td className="px-4 py-2 border-r text-center">
                    {r.ksSig.toFixed(3)}
                  </td>
                  <td className="px-4 py-2 border-r text-center">
                    {r.swStatistic.toFixed(3)}
                  </td>
                  <td className="px-4 py-2 border-r text-center">{r.swDf}</td>
                  <td className="px-4 py-2 text-center">
                    {r.swSig.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Botão para exibir modal com histogramas */}
          <div className="mt-4">
            <button
              onClick={() => setShowHistograms(true)}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Ver Histogramas
            </button>
          </div>
        </>
      )}

      {showHistograms && (
        <HistogramModal
          variablesData={results.map((item) => ({
            variableName: item.variableName,
            data: item.rawData,
          }))}
          onClose={() => setShowHistograms(false)}
        />
      )}
    </div>
  );
}

export default NormalityTest;
