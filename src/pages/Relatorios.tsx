import jsPDF from "jspdf";
import { ArrowLeft, Download } from "lucide-react";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Patient, usePatientStore } from "../store/usePatientStore.js";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Nota: Apenas para desenvolvimento; em produção, use um backend
});

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
};

const typeMessage = (
  message: string,
  setMessage: (content: string) => void,
  onComplete: () => void,
  speed: number = 30
) => {
  let index = 0;
  let currentMessage = "";

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
  const [chatMessages, setChatMessages] = useState<
    ChatCompletionMessageParam[]
  >([]);
  const [currentAssistantMessage, setCurrentAssistantMessage] =
    useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState<string>("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, currentAssistantMessage]);

  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    const patient = patients.find((p) => p.id === patientId) || null;
    setSelectedPatient(patient);
    setChatMessages([]);
    setCurrentAssistantMessage("");
  };

  const downloadReportAsPDF = (reportContent: string) => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFont("helvetica", "normal");

    // Cabeçalho
    doc.setFontSize(16);
    doc.text("RELATÓRIO DE AVALIAÇÃO FISIOTERAPÉUTICA", 148.5, 15, {
      align: "center",
    });
    doc.setFontSize(12);
    doc.text("UFVJM", 20, 25);
    doc.text("UFSCAR", 277, 25, { align: "right" });

    // Dados do Participante
    doc.setFontSize(14);
    doc.text("DADOS DO PARTICIPANTE", 20, 40);
    doc.setFontSize(12);
    const participantData =
      reportContent
        .split("\n\n")
        .find((section) => section.startsWith("DADOS DO PARTICIPANTE")) || "";
    const participantLines = participantData.split("\n").slice(1);
    let yPosition = 50;
    participantLines.forEach((line) => {
      doc.text(line, 20, yPosition);
      yPosition += 8;
    });

    // Tabela
    const tableData =
      reportContent
        .split("\n\n")
        .find((section) => section.startsWith("| Teste/ Questionário")) || "";
    const tableRows = tableData
      .split("\n")
      .filter((line) => line.trim() !== "");
    let startYTable = yPosition + 8;
    doc.setFontSize(8);

    const columnWidths = [50, 20, 90, 97];
    const columnXPositions = [20, 70, 90, 180];
    const maxPageHeight = 190;

    const drawTableHeader = (y: number) => {
      doc.setFillColor(220, 220, 220);
      doc.rect(20, y, 257, 10, "F");
      doc.setFont("helvetica", "bold");
      const headers = tableRows[0]
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell !== "");
      headers.forEach((cell, cellIndex) => {
        const x = columnXPositions[cellIndex];
        const width = columnWidths[cellIndex];
        const lines = doc.splitTextToSize(
          cell.replace(/<br>/g, "\n"),
          width - 4
        );
        doc.text(lines, x + 2, y + 7);
      });
      doc.setFont("helvetica", "normal");
    };

    let y = startYTable;
    drawTableHeader(y);
    y += 10;

    tableRows.slice(1).forEach((row, index) => {
      const cells = row
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell !== "");
      let maxHeight = 20;
      const cellHeights = cells.map((cell, cellIndex) => {
        const width = columnWidths[cellIndex];
        const lines = doc.splitTextToSize(
          cell.replace(/<br>/g, "\n"),
          width - 4
        );
        return lines.length * 5 + 10;
      });
      maxHeight = Math.max(maxHeight, ...cellHeights);

      if (y + maxHeight > maxPageHeight) {
        doc.addPage();
        y = 20;
        startYTable = y;
        drawTableHeader(y);
        y += 10;
      }

      cells.forEach((cell, cellIndex) => {
        const x = columnXPositions[cellIndex];
        const width = columnWidths[cellIndex];
        doc.rect(x, y, width, maxHeight);
        const lines = doc.splitTextToSize(
          cell.replace(/<br>/g, "\n"),
          width - 4
        );
        doc.text(lines, x + 2, y + 5);
      });
      y += maxHeight;
    });

    for (let i = 0; i < 5; i++) {
      const x = columnXPositions[i] || 277;
      doc.line(x, startYTable, x, y > maxPageHeight ? 20 : y);
    }
    doc.line(20, startYTable, 277, startYTable);
    doc.line(20, y > maxPageHeight ? 20 : y, 277, y > maxPageHeight ? 20 : y);

    doc.addPage();
    y = 20;

    const observationsSection =
      reportContent
        .split("\n\n")
        .find((section) => section.startsWith("Observações Gerais:")) || "";
    const attentionPointsSection =
      reportContent
        .split("\n\n")
        .find((section) => section.startsWith("Pontos de Atenção:")) || "";

    if (observationsSection) {
      doc.setFontSize(14);
      doc.text("Observações Gerais:", 20, y);
      y += 8;
      doc.setFontSize(12);
      const observationLines = observationsSection.split("\n").slice(1);
      observationLines.forEach((line) => {
        if (y + 8 > maxPageHeight) {
          doc.addPage();
          y = 20;
        }
        const lines = doc.splitTextToSize(line, 257);
        lines.forEach((splitLine: string) => {
          doc.text(splitLine, 20, y);
          y += 8;
        });
      });
    }

    if (attentionPointsSection) {
      y += 10;
      if (y + 20 > maxPageHeight) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(14);
      doc.text("Pontos de Atenção:", 20, y);
      y += 8;
      doc.setFontSize(12);
      const attentionLines = attentionPointsSection.split("\n").slice(1);
      attentionLines.forEach((line) => {
        if (y + 8 > maxPageHeight) {
          doc.addPage();
          y = 20;
        }
        const lines = doc.splitTextToSize(line, 257);
        lines.forEach((splitLine: string) => {
          doc.text(splitLine, 20, y);
          y += 8;
        });
      });
    }

    doc.save(`${selectedPatient?.name}_relatorio.pdf`);
  };

  const sendMessageToAssistant = async (userMessage: string) => {
    if (!selectedPatient) {
      alert("Por favor, selecione um paciente antes de interagir com o chat.");
      return;
    }

    setIsLoading(true);
    setCurrentAssistantMessage("");

    setChatMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);

    const patientData = `
      Nome: ${selectedPatient.name}
      Data da Avaliação: 21 de Janeiro de 2025
      Pesquisador Responsável: Vanessa Pereira de Lima
      Cidade de Recrutamento: ${selectedPatient.recruitmentCity}
      Fase: ${selectedPatient.phase}
      Próxima Coleta: ${formatDate(selectedPatient.collectionDate)}
      TC6-1: ${selectedPatient.tc6_1 || "Não disponível"}
      TC6-2: ${selectedPatient.tc6_2 || "Não disponível"}
      TPP: ${selectedPatient.tpp || "Não disponível"}
      PGI (D1 Intra) (escore total): ${
        selectedPatient.pgiD1IntraScore || "Não disponível"
      }
      PGI (D1 inter) (escore total): ${
        selectedPatient.pgiD1InterScore || "Não disponível"
      }
      PGI (D2 Intra) (escore total): ${
        selectedPatient.pgiD2IntraScore || "Não disponível"
      }
      KBILD (Soma simples): ${
        selectedPatient.kbildSimpleSum || "Não disponível"
      }
      KBILD (escala de 0-100): ${
        selectedPatient.kbildScale0_100 || "Não disponível"
      }
      WHODAS: ${selectedPatient.whodas || "Não disponível"}
      PAH (D1) EMA: ${selectedPatient.pahD1EMA || "Não disponível"}
      PAH (D1) EAA: ${selectedPatient.pahD1EAA || "Não disponível"}
      PAH(D2) EMA: ${selectedPatient.pahD2EMA || "Não disponível"}
      PAH(D2) EAA: ${selectedPatient.pahD2EAA || "Não disponível"}
      Escala de Participação: ${
        selectedPatient.participationScale || "Não disponível"
      }
      Classificação Escala de Participação: ${
        selectedPatient.participationScaleClassification || "Não disponível"
      }
    `;

    const systemPrompt = `
      Você é um assistente médico especializado em gerar relatórios fisioterapêuticos claros e profissionais sobre pacientes. Você tem acesso aos seguintes dados do paciente:\n${patientData}\n

      Quando solicitado para gerar um relatório, siga rigorosamente o formato abaixo, preenchindo com base nos dados do paciente fornecidos. Não adicione informações que não estejam nos dados fornecidos. Use "Não disponível" quando um dado não estiver presente. O relatório deve ser formatado como texto puro, sem Markdown ou símbolos desnecessários, e deve ser estruturado exatamente como o exemplo fornecido. Certifique-se de usar português correto, evitando erros gramaticais ou ortográficos (ex.: "realization" deve ser "realizar", "asperado" deve ser "esperada", "efetos" deve ser "efeitos", "menal" deve ser "mental", "nerhuma" deve ser "nenhuma", "retlete" deve ser "reflete", "limitaçōes" deve ser "limitações").

      **Formato do Relatório:**

      RELATÓRIO DE AVALIAÇÃO FISIOTERAPÉUTICA
      UFVJM                                                                                       UFSCAR

      DADOS DO PARTICIPANTE
      NOME: [Nome do Paciente]
      DATA DA AVALIAÇÃO: [Data da Avaliação]
      PESQUISADOR RESPONSÁVEL: [Pesquisador Responsável]

      | Teste/ Questionário                      | Valor            | Valores de referência/ Classificação                                                                 | Descrição/Interpretação                                                                                                                                                                                                 |
      | Teste de Caminhada de 6 Minutos (TC6) (metros) | [TC6-1 e TC6-2]  | Segundo a equação de referência o participante deveria realizar 580,47 metros<br>Referência: Britto, R. R. et al., 2013 | O participante alcançou uma distância de [TC6-2] metros, [acima/abaixo] da referência esperada de 580,47 metros para suas características. Esse resultado indica [boa/moderada/baixa] capacidade funcional e aptidão física durante o exercício. |
      | Teste de Preensão Palmar (TPP) - (quilograma-força (kgf)) | [TPP] kgf | 30-34 anos mão direita: 52.8 (44.1-61.5)<br>Referência: Bohannon, R. W. 2006                                   | O valor de [TPP] kgf está [dentro/acima/abaixo] da faixa de referência, [acima/abaixo] da média para a faixa etária, indicando que a força de preensão está [normal/ligeiramente reduzida/reduzida]. Esse resultado sugere [nenhuma/uma leve/uma significativa] diminuição da integridade funcional das mãos, do estado geral do corpo e da extremidade superior. |
      | Patient Generated Index (PGI)            | [PGI (D2 Intra)] | 0 (pior qualidade de vida relacionada à saúde possível) a 100 (melhor qualidade de vida relacionada à saúde)<br>Referência: Cardoso R. F. et al 2020 | Um escore de [PGI (D2 Intra)] no PGI indica que o participante percebe um impacto [baixo/moderado/significativo] de sua condição de saúde na qualidade de vida. Esse valor sugere [nenhuma/pequenas/significativas] limitações e restrições em várias áreas da vida do participante que podem impactar no seu bem-estar. |
      | The King's Brief Interstitial Lung Disease (KBILD) | [KBILD (escala de 0-100)] | 0 (indica um estado de saúde muito baixo, com impacto significativo da doença) a 100 (indica um estado de saúde alto, com impacto mínimo da doença)<br>Referência: Patel, A. S. et al., 2012 | O escore de [KBILD (escala de 0-100)] sugere um impacto [baixo/moderado/significativo] da condição pulmonar no estado de saúde e na qualidade de vida do participante, com efeitos na saúde física e mental. Esse valor indica que a doença pulmonar [não limita/limita em alguns pontos/limita significativamente] a capacidade do participante em participar de atividades e no seu bem-estar geral. |
      | World Health Organization Disability Assessment Schedule (WHODAS 2.0) | [WHODAS] | 0 (sem incapacidade) a 100 (incapacidade total) | O escore de [WHODAS] indica [nenhuma incapacidade/incapacidade leve/incapacidade moderada/incapacidade significativa]. Este valor reflete o nível de dificuldade do participante em diversas áreas da vida, como mobilidade, autocuidado, e participação social. |
      | Perfil de Atividade Humana (PAH)         | [PAH(D2) EMA] | 0 (atividade mínima) a 100 (atividade máxima) | O escore de [PAH(D2) EMA] reflete um nível de atividade [baixo/moderado/alto] no segundo dia de avaliação, indicando o grau de envolvimento do participante em atividades diárias e sua capacidade funcional geral. |
      | Escala de Participação                   | [Escala de Participação] | 0-12 Sem restrição significativa<br>13-22 Leve restrição<br>23-32 Restrição moderada<br>33-52 Restrição grave<br>53-90 Restrição extrema<br>Referência: Loures, L. F., Mármora, C. H. C., 2017 | O escore de [Escala de Participação] indica [Classificação Escala de Participação] na participação em atividades diárias e sociais. Esse valor reflete a presença de algumas limitações impostas pela condição de saúde do participante, com impactos negativos na autonomia e na capacidade de se engajar em atividades cotidianas. |

      Observações Gerais:
      [Gerar uma análise detalhada com base nos resultados dos testes (TC6, TPP, PGI, KBILD, WHODAS, PAH, Escala de Participação). Descrever a capacidade funcional do participante, o impacto da condição de saúde na qualidade de vida, limitações em atividades diárias e sociais, necessidade de suplementação de oxigênio, nível de atividade física, e restrições funcionais. Fornecer uma visão geral do estado do participante, incluindo pontos fortes (ex.: bom desempenho no TC6) e áreas de preocupação (ex.: força de preensão reduzida ou impacto significativo na qualidade de vida).]

      Pontos de Atenção:
      [Gerar recomendações específicas com base nos resultados dos testes. Sugerir intervenções como exercícios supervisionados para melhorar a capacidade respiratória, resistência física e força muscular; acompanhamento da saúde respiratória com intervenções fisioterapêuticas; estímulo a atividades sociais e físicas para melhorar o bem-estar; e reavaliações periódicas para ajustar as intervenções conforme a evolução do quadro clínico. As recomendações devem ser práticas e voltadas para melhorar a qualidade de vida e a autonomia do participante.]

      **Instruções adicionais:**
      - Substitua os placeholders [Nome do Paciente], [Data da Avaliação], etc., pelos valores correspondentes dos dados fornecidos.
      - Para o TC6, use os valores TC6-1 e TC6-2. Se ambos forem iguais, mostre apenas um valor na coluna "Valor". Compare TC6-2 com 580.47 para determinar se está acima ou abaixo da referência e classifique a capacidade funcional como "baixa" (abaixo de 500), "moderada" (500-580.47), ou "boa" (acima de 580.47).
      - Para o TPP, compare o valor com a média (52.8) e a faixa (44.1-61.5) para determinar a classificação ("normal", "ligeiramente reduzida", ou "reduzida") e o nível de diminuição funcional ("nenhuma", "leve", ou "significativa").
      - Para o PGI, classifique o impacto como "baixo" (< 40), "moderado" (40-70), ou "significativo" (> 70), e as limitações como "nenhuma" (< 40), "pequenas" (40-70), ou "significativas" (> 70).
      - Para o KBILD, classifique o impacto como "baixo" (> 70), "moderado" (40-70), ou "significativo" (< 40), e as limitações como "não limita" (> 70), "limita em alguns pontos" (40-70), ou "limita significativamente" (< 40).
      - Para o WHODAS, classifique a incapacidade como "nenhuma" (< 10), "leve" (10-20), "moderada" (20-50), ou "significativa" (> 50).
      - Para o PAH, classifique o nível de atividade como "baixo" (< 40), "moderado" (40-70), ou "alto" (> 70).
      - Para a Escala de Participação, use o valor de [Escala de Participação] e [Classificação Escala de Participação] para descrever o nível de restrição na participação em atividades.
      - Use "Não disponível" para valores ausentes e ajuste a descrição/interpretação conforme necessário.
      - Não adicione informações fictícias ou fora dos dados fornecidos.
    `;

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...chatMessages,
      { role: "user", content: userMessage },
    ];

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 1500,
        temperature: 0.7,
      });

      const assistantResponse =
        response.choices[0]?.message?.content || "Erro ao gerar a resposta.";

      const responseText =
        typeof assistantResponse === "string"
          ? assistantResponse
          : String(assistantResponse);

      setChatMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      typeMessage(
        responseText,
        (content) => {
          setCurrentAssistantMessage(content);
          setChatMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content };
            return updated;
          });
        },
        () => {
          setCurrentAssistantMessage("");
          setIsLoading(false);
        },
        20 // Velocidade de digitação
      );
    } catch (error) {
      console.error("Erro ao interagir com o assistente:", error);
      let errorMessage = "Erro desconhecido";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Desculpe, ocorreu um erro: ${errorMessage}. Tente novamente.`,
        },
      ]);
      setIsLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (!selectedPatient) return;
    const message = `Gerar relatório para o paciente ${selectedPatient.name}`;
    sendMessageToAssistant(message);
  };

  const handleDownloadReport = () => {
    const lastAssistantMessage = chatMessages
      .filter((msg) => msg.role === "assistant")
      .slice(-1)[0]?.content;
    if (typeof lastAssistantMessage === "string") {
      downloadReportAsPDF(lastAssistantMessage);
    } else {
      alert("Nenhum relatório disponível para download.");
    }
  };

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    sendMessageToAssistant(userInput);
    setUserInput("");
  };

  const handleClearChat = () => {
    setChatMessages([]);
    setCurrentAssistantMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="container mx-auto flex-1 flex flex-col py-4 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/home")}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          Relatórios
        </h1>

        <div className="mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Selecione um Paciente
          </h2>
          <select
            value={selectedPatient?.id || ""}
            onChange={handlePatientSelect}
            className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="" disabled>
              Selecione um paciente
            </option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleGenerateReport}
            disabled={!selectedPatient || isLoading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              !selectedPatient || isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {isLoading ? "Gerando Relatório..." : "Gerar Relatório"}
          </button>
          <button
            onClick={handleDownloadReport}
            disabled={
              !selectedPatient ||
              isLoading ||
              !chatMessages.some((msg) => msg.role === "assistant")
            }
            className={`w-full py-2 px-4 rounded-md text-white font-medium flex items-center justify-center gap-2 ${
              !selectedPatient ||
              isLoading ||
              !chatMessages.some((msg) => msg.role === "assistant")
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            <Download className="w-5 h-5" /> Baixar Relatório
          </button>
          <button
            onClick={handleClearChat}
            disabled={chatMessages.length === 0 || isLoading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              chatMessages.length === 0 || isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            Limpar Conversa
          </button>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md flex-1 flex flex-col">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Chat com o Assistente
          </h2>
          <div
            ref={chatContainerRef}
            className="flex-1 min-h-[16rem] max-h-[50vh] overflow-y-auto border rounded-md p-4 mb-4"
          >
            {chatMessages.length === 0 ? (
              <p className="text-gray-500">
                Selecione um paciente e clique em "Gerar Relatório" para
                começar.
              </p>
            ) : (
              chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    message.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <span
                    className={`inline-block p-4 rounded-lg whitespace-pre-wrap text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                    style={{ lineHeight: "1.75" }}
                  >
                    {typeof message.content === "string" ? (
                      message.content
                        .split("\n")
                        .map((line: string, lineIndex: number) => {
                          const sectionTitles: string[] = [
                            "RELATÓRIO DE AVALIAÇÃO FISIOTERAPÉUTICA",
                            "DADOS DO PARTICIPANTE",
                            "Observações Gerais:",
                            "Pontos de Atenção:",
                          ];
                          const isSectionTitle: boolean =
                            sectionTitles.includes(line.trim());

                          return (
                            <div
                              key={lineIndex}
                              className={
                                isSectionTitle
                                  ? "font-bold text-base mt-4 mb-2"
                                  : "mb-2"
                              }
                            >
                              {line}
                            </div>
                          );
                        })
                    ) : (
                      <div className="text-gray-500">
                        [Conteúdo não suportado:{" "}
                        {JSON.stringify(message.content)}]
                      </div>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={handleSendQuestion}
            className="flex flex-col sm:flex-row items-center gap-2 mt-auto"
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Faça uma pergunta sobre o paciente..."
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading || !selectedPatient}
            />
            <button
              type="submit"
              disabled={isLoading || !selectedPatient || !userInput.trim()}
              className={`w-full sm:w-auto py-2 px-4 rounded-md text-white font-medium ${
                isLoading || !selectedPatient || !userInput.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
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
