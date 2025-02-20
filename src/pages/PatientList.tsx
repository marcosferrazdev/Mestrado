import React, { useEffect, useState } from 'react';
import { Patient, usePatientStore } from '../store/usePatientStore';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash, Edit } from 'lucide-react';

function PatientList() {
  const { patients, fetchPatients, deletePatient, updatePatient } = usePatientStore();
  const [editingPatient, setEditingPatient] = useState<null | Patient>(null);
  const [editData, setEditData] = useState<Partial<Patient>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleUpdate = async () => {
    if (editingPatient) {
      await updatePatient(editingPatient.id, editData);
      setEditingPatient(null);
      setEditData({});
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Botão Voltar */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
      </button>

      <h2 className="text-2xl font-bold mb-4 text-center sm:text-left">Lista de Pacientes</h2>

      {/* Responsividade: Container com Scroll */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 min-w-[800px]">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-center">Ações</th>
              <th className="border p-2">Nome</th>
              <th className="border p-2">Telefone</th>
              <th className="border p-2">Cidade</th>
              <th className="border p-2">Diagnóstico</th>
              <th className="border p-2">Fase</th>
              <th className="border p-2">Data Próx. Coleta</th>
              <th className="border p-2">Comentário</th>
              <th className="border p-2">Transporte</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id} className="border">
                <td className="border p-2 text-center flex gap-2 justify-center">
                  {/* Ícone de Excluir */}
                  <button
                    onClick={() => deletePatient(patient.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Excluir"
                  >
                    <Trash className="w-5 h-5" />
                  </button>

                  {/* Ícone de Editar */}
                  <Link
                    to={`/editar/${patient.id}`}
                    className="text-blue-600 hover:text-blue-800"
                    title="Editar"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                </td>
                <td className="border p-2">{patient.name}</td>
                <td className="border p-2">{patient.phone}</td>
                <td className="border p-2">{patient.recruitmentCity}</td>
                <td className="border p-2">{patient.diagnosis}</td>
                <td className="border p-2">{patient.phase}</td>
                <td className="border p-2">{patient.nextCollectionDate}</td>
                <td className="border p-2">{patient.callComments}</td>
                <td className="border p-2">{patient.transportation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Se estiver editando um paciente */}
      {editingPatient && (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <h3 className="text-lg font-bold">Editar Paciente</h3>
          <input
            type="text"
            value={editData.name || ''}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className="border p-2 rounded w-full mt-2"
          />
          <button
            onClick={handleUpdate}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Salvar
          </button>
        </div>
      )}
    </div>
  );
}

export default PatientList;
