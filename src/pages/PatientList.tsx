import React, { useEffect, useState } from 'react';
import { Patient, usePatientStore } from '../store/usePatientStore';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Edit } from 'lucide-react';

// Função para formatar a data no formato "DD/MM/YYYY"
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR'); // Formato DD/MM/AAAA
};

function PatientList() {
  const { patients, fetchPatients, deletePatient, updatePatient } = usePatientStore();
  const [editingPatient, setEditingPatient] = useState<null | Patient>(null);
  const [editData, setEditData] = useState<Partial<Patient>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
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

  const handleDeleteClick = (patientId: string) => {
    setSelectedPatientId(patientId);
    setShowDeleteModal(true);
  };

  const confirmDeletePatient = async () => {
    if (selectedPatientId) {
      await deletePatient(selectedPatientId);
      setShowDeleteModal(false);
      setSelectedPatientId(null);
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
              <td className="border p-2 text-center flex items-center justify-center gap-3">
                <button
                  onClick={() => handleDeleteClick(patient.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Excluir"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

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
              <td className="border p-2">{formatDate(patient.nextCollectionDate)}</td>
              <td className="border p-2">{patient.callComments}</td>
              <td className="border p-2">{patient.transportation}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-4">Tem certeza que deseja excluir?</h3>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeletePatient}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

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
