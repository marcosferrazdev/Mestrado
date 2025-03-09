import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
// ou onde você definiu a função calculateHistogram

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface HistogramModalProps {
  variablesData: Array<{
    variableName: string;
    data: number[];
  }>;
  onClose: () => void;
}

// Função para calcular bins e frequências de um array de números
function calculateHistogram(data: number[], bins: number = 10) {
  if (data.length === 0) return { labels: [], counts: [] };

  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / bins;
  const counts = Array(bins).fill(0);
  const labels: string[] = [];

  for (let i = 0; i < bins; i++) {
    const lower = min + i * binWidth;
    const upper = min + (i + 1) * binWidth;
    labels.push(`${lower.toFixed(1)} - ${upper.toFixed(1)}`);
  }

  data.forEach((value) => {
    let bin = Math.floor((value - min) / binWidth);
    if (bin >= bins) bin = bins - 1;
    counts[bin]++;
  });

  return { labels, counts };
}


function HistogramModal({ variablesData, onClose }: HistogramModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Container do Modal */}
      <div className="bg-white w-11/12 max-w-4xl p-4 rounded shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        >
          Fechar ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">Histogramas</h2>

        <div className="max-h-[70vh] overflow-auto">
          {variablesData.map((item, index) => {
            const { labels, counts } = calculateHistogram(item.data, 10);
            return (
              <div key={index} className="mb-8">
                <h3 className="text-md font-bold mb-2">{item.variableName}</h3>
                <Bar
                  data={{
                    labels,
                    datasets: [
                      {
                        label: "Frequência",
                        data: counts,
                        backgroundColor: "rgba(54, 162, 235, 0.5)",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      title: {
                        display: false,
                        text: item.variableName,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                      },
                    },
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default HistogramModal;
