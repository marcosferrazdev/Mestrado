import React, { useEffect, useState } from 'react';
import OpenAI from 'openai';
import { Loader } from 'lucide-react';
import { usePatientStore } from '../store/usePatientStore.js';

// Instância da OpenAI usando a chave do ambiente
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, // Pegando a chave do ambiente
  dangerouslyAllowBrowser: true, // Necessário para rodar no frontend
});

function Relatorios() {
  const { patients, fetchPatients } = usePatientStore();
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);

  // Buscar pacientes ao carregar a página
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleGenerateReport = async () => {
    if (!selectedPatientId || !prompt) {
      alert('Selecione um paciente e insira um prompt.');
      return;
    }

    const selectedPatient = patients.find((p) => p.id === selectedPatientId);
    if (!selectedPatient) {
      alert('Paciente não encontrado.');
      return;
    }

    setLoading(true);

    try {
      await sleep(3000); // Aguarda 3 segundos antes de fazer a requisição

      const response = await fetch('https://mestrado-sigma.vercel.app/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient: selectedPatient, prompt }),
      });

      const data = await response.json();
      setReport(data.report);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      setReport('Erro ao gerar relatório. Tente novamente mais tarde.');
    }

    setLoading(false);
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
      <p className="text-gray-500 mt-2">Selecione um paciente e gere um relatório com IA.</p>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        {/* Seleção de Paciente */}
        <label className="block text-sm font-medium text-gray-700">Paciente</label>
        <select
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className="w-full mt-1 p-2 border rounded-md"
        >
          <option value="">Selecione um paciente</option>
          {patients && patients.length > 0 ? (
            patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))
          ) : (
            <option disabled>Carregando pacientes...</option>
          )}
        </select>

        {/* Prompt para a IA */}
        <label className="block text-sm font-medium text-gray-700 mt-4">Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full mt-1 p-2 border rounded-md resize-none"
          placeholder="Exemplo: 'Gerar um relatório sobre a evolução do paciente nos últimos meses'"
        />

        {/* Botão de Geração */}
        <button
          onClick={handleGenerateReport}
          className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Gerar Relatório'}
        </button>
      </div>

      {/* Exibição do Relatório */}
      {report && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
          <h2 className="text-xl font-semibold text-gray-900">Relatório Gerado</h2>
          <p className="text-gray-700 mt-2 whitespace-pre-line">{report}</p>
        </div>
      )}
    </div>
  );
}

export default Relatorios;
