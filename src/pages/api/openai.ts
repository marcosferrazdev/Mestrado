import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Middleware para configurar CORS
function corsMiddleware(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Permite qualquer origem
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // Métodos permitidos
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Lidar com preflight request (CORS OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

// Instância do OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Executa o middleware de CORS
  if (corsMiddleware(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { patient, prompt } = req.body;

    const message = `
      Paciente: ${patient.name}
      Diagnóstico: ${patient.diagnosis}
      Fase: ${patient.phase}
      Transporte: ${patient.transportation}

      Relatório solicitado: ${prompt}
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: message }],
      max_tokens: 500,
    });

    res.status(200).json({ report: response.choices[0].message.content });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório.' });
  }
}
