import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center">Sistema de Gestão de Pacientes</h1>
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/cadastro" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Cadastro de Pacientes</h3>
            <p className="text-gray-500">Registre novos pacientes.</p>
          </Link>
          <Link to="/pacientes" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Lista de Pacientes</h3>
            <p className="text-gray-500">Visualize e gerencie os pacientes cadastrados.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;