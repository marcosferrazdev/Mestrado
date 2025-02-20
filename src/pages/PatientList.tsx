import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Edit } from 'lucide-react';
import { Patient, usePatientStore } from '../store/usePatientStore.js';

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient) => (
          <div key={patient.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
            <div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">{patient.name}</h3>
              <p className="text-gray-700"><span className="font-semibold">Telefone:</span> {patient.phone}</p>
              <p className="text-gray-700"><span className="font-semibold">Cidade:</span> {patient.recruitmentCity}</p>
              <p className="text-gray-700"><span className="font-semibold">Diagnóstico:</span> {patient.diagnosis}</p>
              <p className="text-gray-700"><span className="font-semibold">Fase:</span> {patient.phase}</p>
              <p className="text-gray-700"><span className="font-semibold">Próx. Coleta:</span> {formatDate(patient.nextCollectionDate)}</p>
              <p className="text-gray-700"><span className="font-semibold">Comentário:</span> {patient.callComments}</p>
              <p className="text-gray-700"><span className="font-semibold">Transporte:</span> {patient.transportation}</p>
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => handleDeleteClick(patient.id)}
                className="text-red-600 hover:text-red-800"
                title="Excluir"
              >
                <Trash2 className="w-6 h-6" />
              </button>
              <Link
                to={`/editar/${patient.id}`}
                className="text-blue-600 hover:text-blue-800"
                title="Editar"
              >
                <Edit className="w-6 h-6" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Confirmação de Exclusão */}
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
    </div>
  );
}

export default PatientList;
