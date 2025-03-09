import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { Patient, usePatientStore } from '../store/usePatientStore.js';

const patientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  recruitmentCity: z.string().min(1, 'Cidade de Recrutamento é obrigatória'),
  diagnosis: z.string().min(1, 'Diagnóstico é obrigatório'),
  phase: z.string().min(1, 'Fase é obrigatória'),
  collectionDate: z.string().min(1, 'Data da próxima coleta é obrigatória'),
  callComments: z.string().optional(),
  transportation: z.enum(['próprio', 'não próprio'], {
    required_error: 'Selecione o tipo de transporte',
  }),
});

type PatientForm = z.infer<typeof patientSchema>;

function EditPatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients, updatePatient, fetchPatients } = usePatientStore();
  const patient = patients.find((p) => p.id === id);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
  });

  useEffect(() => {
    if (patient) {
      Object.keys(patient).forEach((key) => {
        setValue(key as keyof PatientForm, patient[key as keyof Patient] as string);
      });
    }
  }, [patient, setValue]);

  const onSubmit = async (data: PatientForm) => {
    if (!id) return;
    await updatePatient(id, data);
    await fetchPatients();
    navigate('/pacientes');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => navigate('/pacientes')}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
            </button>
            <h2 className="text-2xl font-bold text-gray-800">Editar Paciente</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input {...register('name')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <input {...register('phone')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cidade de Recrutamento</label>
                <input {...register('recruitmentCity')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                {errors.recruitmentCity && <p className="text-red-500 text-sm mt-1">{errors.recruitmentCity.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Diagnóstico</label>
                <input {...register('diagnosis')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                {errors.diagnosis && <p className="text-red-500 text-sm mt-1">{errors.diagnosis.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fase</label>
                <input {...register('phase')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                {errors.phase && <p className="text-red-500 text-sm mt-1">{errors.phase.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Data da Coleta</label>
                <input type="date" {...register('collectionDate')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                {errors.collectionDate && <p className="text-red-500 text-sm mt-1">{errors.collectionDate.message}</p>}
              </div>
              <div>
              <label className="block text-sm font-medium text-gray-700">Comentário sobre Ligação</label>
                <textarea {...register('callComments')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border resize-none" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Transporte</label>
                <select {...register('transportation')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                  <option value="">Selecione o tipo de transporte</option>
                  <option value="próprio">Próprio</option>
                  <option value="não próprio">Não Próprio</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2 px-4 border rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPatient;
