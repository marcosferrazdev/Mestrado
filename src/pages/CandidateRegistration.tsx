import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const candidateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  recruitmentCity: z.string().min(1, 'Cidade de Recrutamento é obrigatória'),
  diagnosis: z.string().min(1, 'Diagnóstico é obrigatório'),
  phase: z.string().min(1, 'Fase é obrigatória'),
  nextCollectionDate: z.string().min(1, 'Data da próxima coleta é obrigatória'),
  callComments: z.string(),
  transportation: z.enum(['próprio', 'não próprio'], {
    required_error: 'Selecione o tipo de transporte',
  }),
});

type CandidateForm = z.infer<typeof candidateSchema>;

function CandidateRegistration() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CandidateForm>({
    resolver: zodResolver(candidateSchema),
  });

  const onSubmit = async (data: CandidateForm) => {
    console.log(data);
    try {
      const { data: insertedData, error } = await supabase
      .from('patients') // Nome correto
      .insert([data]);


      if (error) {
        console.error('Error inserting data:', error);
      } else {
        console.log('Data inserted successfully:', insertedData);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center space-x-5 justify-between mb-8">
              <Link
                to="/"
                className="text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                ← Voltar
              </Link>
              <h2 className="text-2xl font-bold text-gray-800">Cadastro de Pacientes</h2>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <input
                      {...register('name')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <input
                      {...register('phone')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cidade de Recrutamento</label>
                    <input
                      {...register('recruitmentCity')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                    {errors.recruitmentCity && <p className="text-red-500 text-sm mt-1">{errors.recruitmentCity.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Diagnóstico</label>
                    <input
                      {...register('diagnosis')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                    {errors.diagnosis && <p className="text-red-500 text-sm mt-1">{errors.diagnosis.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fase</label>
                    <input
                      {...register('phase')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                    {errors.phase && <p className="text-red-500 text-sm mt-1">{errors.phase.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data da Próxima Coleta</label>
                    <input
                      type="date"
                      {...register('nextCollectionDate')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                    {errors.nextCollectionDate && <p className="text-red-500 text-sm mt-1">{errors.nextCollectionDate.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 ">Comentário sobre Ligação</label>
                    <textarea
                      {...register('callComments')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border resize-none"
                      rows={3}
                    />
                    {errors.callComments && <p className="text-red-500 text-sm mt-1">{errors.callComments.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transporte</label>
                    <select
                      {...register('transportation')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    >
                      <option value="">Selecione o tipo de transporte</option>
                      <option value="próprio">Próprio</option>
                      <option value="não próprio">Não Próprio</option>
                    </select>
                    {errors.transportation && <p className="text-red-500 text-sm mt-1">{errors.transportation.message}</p>}
                  </div>

                  <div className="pt-5">
                    <button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cadastrar Paciente
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateRegistration;