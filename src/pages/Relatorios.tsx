import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import OpenAI from 'openai';
import { Patient, usePatientStore } from '../store/usePatientStore.js';

// Importa o tipo ChatCompletionMessageParam da biblioteca OpenAI
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Inicializar o cliente OpenAI com sua chave de API
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, // Certifique-se de que sua chave está no arquivo .env
  dangerouslyAllowBrowser: true, // Nota: Apenas para desenvolvimento; em produção, use um backend
});

// Função para formatar a data no formato "DD/MM/AAAA"
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

// Função para simular a escrita progressiva
const typeMessage = (
  message: string,
  setMessage: (content: string) => void,
  onComplete: () => void,
  speed: number = 20 // Velocidade em milissegundos por caractere
) => {
  let index = 0;
  let currentMessage = '';

  const type = () => {
    if (index < message.length) {
      currentMessage += message[index];
      setMessage(currentMessage);
      index++;
      setTimeout(type, speed);
    } else {
      onComplete();
    }
  };

  type();
};

function Relatorios() {
  const { patients, fetchPatients } = usePatientStore();
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatCompletionMessageParam[]>([]);
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState<string>(''); // Para a mensagem sendo digitada
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState<string>(''); // Para o campo de entrada de texto
  const chatContainerRef = useRef<HTMLDivElement>(null); // Referência para rolar o chat

  useEffect(() => {
    fetchPatients(); // Busca a lista de pacientes quando o componente é montado
  }, [fetchPatients]);

  // Rola o chat para o final automaticamente
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, currentAssistantMessage]);

  // Função genérica para enviar mensagens ao assistente
  const sendMessageToAssistant = async (userMessage: string) => {
    if (!selectedPatient) {
      alert('Por favor, selecione um paciente antes de interagir com o chat.');
      return;
    }

    setIsLoading(true);
    setCurrentAssistantMessage(''); // Limpa a mensagem sendo digitada

    // Adiciona a mensagem do usuário ao chat
    setChatMessages((prev) => [
      ...prev,
      { role: 'user', content: userMessage },
    ]);

    // Prepara os dados do paciente para enviar à OpenAI
    const patientData = `
      Nome: ${selectedPatient.name}
      Telefone: ${selectedPatient.phone}
      Cidade de Recrutamento: ${selectedPatient.recruitmentCity}
      Diagnóstico: ${selectedPatient.diagnosis}
      Fase: ${selectedPatient.phase}
      Próxima Coleta: ${formatDate(selectedPatient.nextCollectionDate)}
      Comentários: ${selectedPatient.callComments || 'Nenhum comentário'}
      Transporte: ${selectedPatient.transportation}
    `;

    // Define o prompt inicial com os dados do paciente
    const systemPrompt = `
      Você é um assistente médico especializado em gerar relatórios claros e profissionais sobre pacientes e responder perguntas relacionadas a eles. 
      Você tem acesso aos seguintes dados do paciente:\n${patientData}\n
      Forneça respostas claras e objetivas, sempre com base nos dados do paciente e no histórico da conversa. 
      Se for solicitado um relatório, forneça-o estruturado com as seguintes seções: 
      - Resumo do Paciente
      - Diagnóstico e Fase
      - Planejamento de Coleta
      - Possíveis Doenças (liste possíveis doenças que o paciente pode ter com base no diagnóstico e na fase, e se houver comentários, use-os para embasar ainda mais suas sugestões, dando maior peso aos comentários)
      - Observações Gerais

      **Instruções de formatação para relatórios:**
      - Não use hashtags (#) ou qualquer tipo de Markdown.
      - Separe cada seção com uma linha em branco.
      - Use títulos claros para cada seção, como "Resumo do Paciente", "Diagnóstico e Fase", etc., sem formatação adicional.
      - Escreva o texto em parágrafos simples e legíveis, sem símbolos ou marcações desnecessárias.
      - Use linguagem profissional e objetiva, adequada para um relatório médico.

      Para outras perguntas, responda de forma profissional, usando linguagem clara e objetiva, com base nos dados do paciente e no histórico da conversa.
    `;

    // Monta o histórico de mensagens para enviar à OpenAI
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...chatMessages,
      { role: 'user', content: userMessage },
    ];

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 1500,
        temperature: 0.7,
      });

      const assistantResponse = response.choices[0]?.message?.content || 'Erro ao gerar a resposta.';

      // Garante que assistantResponse seja uma string
      const responseText = typeof assistantResponse === 'string' ? assistantResponse : String(assistantResponse);

      // Simula a escrita progressiva
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '' }, // Placeholder para a mensagem do assistente
      ]);

      typeMessage(
        responseText,
        (content) => {
          setCurrentAssistantMessage(content);
          setChatMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content };
            return updated;
          });
        },
        () => {
          setCurrentAssistantMessage(''); // Limpa após terminar
          setIsLoading(false);
        },
        20 // Velocidade de digitação
      );
    } catch (error) {
      console.error('Erro ao interagir com o assistente:', error);
      let errorMessage = 'Erro desconhecido';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Desculpe, ocorreu um erro: ${errorMessage}. Tente novamente.` },
      ]);
      setIsLoading(false);
    }
  };

  // Função para gerar o relatório inicial
  const handleGenerateReport = () => {
    if (!selectedPatient) return;
    const message = `Gerar relatório para o paciente ${selectedPatient.name}`;
    sendMessageToAssistant(message);
  };

  // Função para enviar uma nova pergunta
  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return; // Evita enviar mensagens vazias
    sendMessageToAssistant(userInput);
    setUserInput(''); // Limpa o campo de entrada
  };

  // Função para limpar a conversa
  const handleClearChat = () => {
    setChatMessages([]);
    setCurrentAssistantMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col py-6 px-6">
      <div className="container mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Relatórios</h1>

        {/* Seção de Seleção de Paciente */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Selecione um Paciente</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className={`bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition ${
                  selectedPatient?.id === patient.id ? 'border-2 border-indigo-500' : ''
                }`}
              >
                <h3 className="text-lg font-bold text-gray-900">{patient.name}</h3>
                <p className="text-gray-700"><span className="font-semibold">Diagnóstico:</span> {patient.diagnosis}</p>
                <p className="text-gray-700"><span className="font-semibold">Fase:</span> {patient.phase}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Botões para Gerar Relatório e Limpar Conversa */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={handleGenerateReport}
            disabled={!selectedPatient || isLoading}
            className={`w-full sm:w-auto py-2 px-4 rounded-md text-white font-medium ${
              !selectedPatient || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isLoading ? 'Gerando Relatório...' : 'Gerar Relatório'}
          </button>
          <button
            onClick={handleClearChat}
            disabled={chatMessages.length === 0 || isLoading}
            className={`w-full sm:w-auto py-2 px-4 rounded-md text-white font-medium ${
              chatMessages.length === 0 || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Limpar Conversa
          </button>
        </div>

        {/* Seção do Chatbox */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Chat com o Assistente</h2>
          <div
            ref={chatContainerRef}
            className="h-64 overflow-y-auto border rounded-md p-4 mb-4"
          >
            {chatMessages.length === 0 ? (
              <p className="text-gray-500">Selecione um paciente e clique em "Gerar Relatório" para começar.</p>
            ) : (
              chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <span
                    className={`inline-block p-4 rounded-lg whitespace-pre-wrap text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                    style={{ lineHeight: '1.75' }}
                  >
                    {typeof message.content === 'string' ? (
                      message.content.split('\n').map((line: string, lineIndex: number) => {
                        const sectionTitles: string[] = [
                          'Resumo do Paciente',
                          'Diagnóstico e Fase',
                          'Planejamento de Coleta',
                          'Possíveis Doenças',
                          'Observações Gerais',
                        ];
                        const isSectionTitle: boolean = sectionTitles.includes(line.trim());

                        return (
                          <div
                            key={lineIndex}
                            className={isSectionTitle ? 'font-bold text-base mt-4 mb-2' : 'mb-2'}
                          >
                            {line}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-gray-500">
                        [Conteúdo não suportado: {JSON.stringify(message.content)}]
                      </div>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Campo de Entrada para Perguntas */}
          <form onSubmit={handleSendQuestion} className="flex items-center gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Faça uma pergunta sobre o paciente..."
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading || !selectedPatient}
            />
            <button
              type="submit"
              disabled={isLoading || !selectedPatient || !userInput.trim()}
              className={`py-2 px-4 rounded-md text-white font-medium ${
                isLoading || !selectedPatient || !userInput.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Relatorios;