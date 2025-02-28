import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient.js"; // Certifique-se de que o caminho está correto
import { toast } from "react-hot-toast";

function Home() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Erro ao desconectar: " + error.message);
        return;
      }

      toast.success("Desconectado com sucesso!");
      navigate("/login");
    } catch (error) {
      toast.error("Erro ao desconectar. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col px-6 py-16">
      <div className="flex justify-end mb-6">
        <button
          onClick={handleLogout}
          className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Sair
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Sistema de Gestão de Pacientes
          </h1>
          <p className="text-gray-500 mt-2">
            Gerencie o cadastro e acompanhamento de pacientes de forma eficiente
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full">
          {/* Cadastro de Pacientes */}
          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Cadastro de Pacientes
            </h3>
            <p className="text-gray-500">
              Registre novos pacientes no sistema com todas as informações
              necessárias para acompanhamento.
            </p>
            <Link
              to="/cadastro"
              className="text-indigo-600 mt-4 inline-block hover:underline"
            >
              Acessar cadastro →
            </Link>
          </div>

          {/* Lista de Pacientes */}
          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Lista de Pacientes
            </h3>
            <p className="text-gray-500">
              Visualize e gerencie os pacientes cadastrados.
            </p>
            <Link
              to="/pacientes"
              className="text-indigo-600 mt-4 inline-block hover:underline"
            >
              Acessar lista →
            </Link>
          </div>

          {/* Relatórios */}
          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Relatórios
            </h3>
            <p className="text-gray-500">
              Gere relatórios e análises sobre os pacientes e atendimentos.
            </p>
            <Link
              to="/relatorios"
              className="text-indigo-600 mt-4 inline-block hover:underline"
            >
              Acessar relatórios →
            </Link>
          </div>

          {/* Exportar Pacientes */}
          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Exportar Pacientes
            </h3>
            <p className="text-gray-500">
              Exporte os dados dos pacientes em formato numérico para outros
              sistemas.
            </p>
            <Link
              to="/exportar"
              className="text-indigo-600 mt-4 inline-block hover:underline"
            >
              Acessar exportação →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
