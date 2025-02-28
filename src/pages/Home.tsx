import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient.js"; // Certifique-se de que o caminho está correto
import { toast } from "react-hot-toast";
import { User, ChevronDown, LogOut } from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Obtém o nome do usuário da sessão
  useEffect(() => {
    const fetchUserName = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Erro ao obter usuário:", error.message);
        toast.error("Erro ao carregar dados do usuário.");
        return;
      }

      if (data.user) {
        const fullName = data.user.user_metadata?.full_name || "Usuário";
        setUserName(fullName);
      }
    };

    fetchUserName();
  }, []);

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
      <div className="flex justify-end mb-6 relative">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <User className="h-6 w-6 text-gray-600" />
          <span className="text-gray-800 font-medium">{userName}</span>
          <ChevronDown
            className={`h-5 w-5 text-gray-600 transform transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </div>
        {isDropdownOpen && (
          <div className="absolute top-10 right-0 bg-white shadow-lg rounded-md py-2 w-40">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              <LogOut className="h-5 w-5" />
              <span>Sair</span>
            </button>
          </div>
        )}
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
