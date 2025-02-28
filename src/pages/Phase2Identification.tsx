import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function Phase2Identification() {
  const navigate = useNavigate();

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
          FASE 2 - Identificação
        </h1>
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <p className="text-gray-500">
            Tabela bloqueada: FASE 2 - Identificação.
          </p>
          {/* Adicione a tabela aqui quando estiver disponível */}
        </div>
      </div>
    </div>
  );
}

export default Phase2Identification;
