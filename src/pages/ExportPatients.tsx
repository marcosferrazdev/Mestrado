import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function ExportPatients() {
  const navigate = useNavigate();

  // Função para verificar se a Fase 2 está bloqueada (6 meses após o início)
  const isPhase2Blocked = () => {
    // Aqui você pode implementar a lógica para verificar se já se passaram 6 meses
    // Por enquanto, vamos assumir que a Fase 2 está sempre bloqueada
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col py-6 px-6">
      <div className="container mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Exportar Pacientes
        </h1>

        {/* Cards para as diferentes tabelas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* FASE 1 - Identificação */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
            <h2 className="text-xl font-semibold mb-4">
              FASE 1 - Identificação
            </h2>
            <p className="text-gray-500 mb-4">
              Visualize e exporte os dados de identificação da Fase 1.
            </p>
            <Link
              to="/exportar/fase1-identificacao"
              className="text-indigo-600 hover:underline"
            >
              Acesse a tabela
            </Link>
          </div>

          {/* FASE 1 - Testes e Questionários */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
            <h2 className="text-xl font-semibold mb-4">
              FASE 1 - Testes e Questionários
            </h2>
            <p className="text-gray-500 mb-4">
              Visualize e exporte os dados de testes e questionários da Fase 1.
            </p>
            <Link
              to="/exportar/fase1-testes-questionarios"
              className="text-indigo-600 hover:underline"
            >
              Acesse a tabela
            </Link>
          </div>

          {/* FASE 2 - Identificação (Bloqueada) */}
          <div
            className={`relative bg-gray-200 p-6 rounded-lg shadow-md transition ${
              isPhase2Blocked() ? "opacity-50" : "hover:shadow-xl"
            }`}
          >
            {isPhase2Blocked() && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-300 bg-opacity-75 rounded-lg">
                <p className="text-lg font-semibold text-gray-700">
                  Bloqueado: Disponível após 6 meses
                </p>
              </div>
            )}
            <h2 className="text-xl font-semibold mb-4">
              FASE 2 - Identificação
            </h2>
            <p className="text-gray-500 mb-4">
              Visualize e exporte os dados de identificação da Fase 2.
            </p>
            <Link
              to="/exportar/fase2-identificacao"
              className={`text-indigo-600 hover:underline ${
                isPhase2Blocked()
                  ? "cursor-not-allowed pointer-events-none"
                  : ""
              }`}
            >
              Acesse a tabela
            </Link>
          </div>

          {/* FASE 2 - Testes e Questionários (Bloqueada) */}
          <div
            className={`relative bg-gray-200 p-6 rounded-lg shadow-md transition ${
              isPhase2Blocked() ? "opacity-50" : "hover:shadow-xl"
            }`}
          >
            {isPhase2Blocked() && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-300 bg-opacity-75 rounded-lg">
                <p className="text-lg font-semibold text-gray-700">
                  Bloqueado: Disponível após 6 meses
                </p>
              </div>
            )}
            <h2 className="text-xl font-semibold mb-4">
              FASE 2 - Testes e Questionários
            </h2>
            <p className="text-gray-500 mb-4">
              Visualize e exporte os dados de testes e questionários da Fase 2.
            </p>
            <Link
              to="/exportar/fase2-testes-questionarios"
              className={`text-indigo-600 hover:underline ${
                isPhase2Blocked()
                  ? "cursor-not-allowed pointer-events-none"
                  : ""
              }`}
            >
              Acesse a tabela
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExportPatients;
