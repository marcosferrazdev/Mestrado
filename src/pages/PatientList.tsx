import React, { useEffect, useState } from 'react';
import { Patient, usePatientStore } from '../store/usePatientStore';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

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
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
      </button>
      <h2 className="text-2xl font-bold mb-4">Lista de Pacientes</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Nome</th>
            <th className="border p-2">Telefone</th>
            <th className="border p-2">Cidade</th>
            <th className="border p-2">Diagnóstico</th>
            <th className="border p-2">Fase</th>
            <th className="border p-2">Data Próx. Coleta</th>
            <th className="border p-2">Comentário</th>
            <th className="border p-2">Transporte</th>
            <th className="border p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id} className="border">
              <td className="border p-2">{patient.name}</td>
              <td className="border p-2">{patient.phone}</td>
              <td className="border p-2">{patient.recruitmentCity}</td>
              <td className="border p-2">{patient.diagnosis}</td>
              <td className="border p-2">{patient.phase}</td>
              <td className="border p-2">{patient.nextCollectionDate}</td>
              <td className="border p-2">{patient.callComments}</td>
              <td className="border p-2">{patient.transportation}</td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => deletePatient(patient.id)}
                  className="px-2 py-1 text-white bg-red-600 rounded hover:bg-red-700"
                >
                  Excluir
                </button>
                
                <Link
                  to={`/editar/${patient.id}`}
                  className="ml-2 px-2 py-1 text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Editar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
