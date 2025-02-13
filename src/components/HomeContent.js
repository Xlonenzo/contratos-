import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { FaStar } from 'react-icons/fa';
import { PieChart, Pie } from 'recharts';
import { API_URL } from '../config';
import { HelpCircle, RefreshCw } from 'lucide-react';

const HomeContent = ({ projectData: existingProjectData, bondsData, buttonColor, isSidebarCollapsed }) => {
  const [projectData, setProjectData] = useState([]);
  const [allKpis, setAllKpis] = useState([]);
  const [favoriteKpis, setFavoriteKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ws] = useState(new WebSocket('ws://seu-servidor/ws'));

  // Função para buscar dados
  const fetchData = async () => {
    try {
      // Buscar dados de projetos
      const projectResponse = await axios.get(`${API_URL}/project-tracking`);
      setProjectData(projectResponse.data);

      // Buscar KPIs
      const kpiResponse = await axios.get(`${API_URL}/kpi-entries-with-templates?limit=1000`);
      setAllKpis(kpiResponse.data);
      setFavoriteKpis(kpiResponse.data.filter(kpi => kpi.isfavorite));
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Falha ao carregar dados');
      setLoading(false);
    }
  };

  // Efeito inicial para carregar dados
  useEffect(() => {
    fetchData();

    // Configurar polling para atualização a cada 30 segundos
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    // Limpar intervalo quando componente for desmontado
    return () => clearInterval(interval);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'project_update') {
          fetchData();
        }
      };
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  // Função para atualizar manualmente os dados
  const handleRefresh = async () => {
    setLoading(true);
    await fetchData();
  };

  // Função para renderizar KPIs favoritos
  const renderFavoriteKPIs = () => {
    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3">KPIs Favoritos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {favoriteKpis.map(kpi => (
            <div key={kpi.entry_id} className="bg-white p-3 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-medium">{kpi.template_name}</h4>
                <FaStar className="text-yellow-400 text-xs" />
              </div>
              <div className="text-xs space-y-1">
                <p className="flex justify-between">
                  <span className="text-gray-500">Atual:</span>
                  <span>{kpi.actual_value.toFixed(2)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Meta:</span>
                  <span>{kpi.target_value.toFixed(2)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Estado:</span>
                  <span>{kpi.state || 'N/A'}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Funções para os novos gráficos
  const renderBarChart = (data, title, color) => {
    if (data.length === 0) {
      return (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">{title}</h3>
          <p>Não há dados disponíveis para este gráfico.</p>
        </div>
      );
    }

    const chartData = data.map(kpi => ({
      ...kpi,
      value: kpi.actual_value,
      target: kpi.target_value
    }));

    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="state" />
            <YAxis />
            <Tooltip
              formatter={(value, name, props) => {
                const percentage = ((value / props.payload.target) * 100).toFixed(2);
                return [
                  `Atual: ${value.toFixed(2)}`,
                  `Meta: ${props.payload.target.toFixed(2)}`,
                  `Desempenho: ${percentage}%`,
                  `Estado: ${props.payload.state || 'N/A'}`
                ];
              }}
            />
            <Legend />
            <ReferenceLine y={0} stroke="#000" />
            <Bar dataKey="value" fill={color} name="Valor Atual">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.value >= entry.target ? '#4CAF50' : '#FF5252'} />
              ))}
            </Bar>
            <Bar dataKey="target" fill="#8884d8" name="Meta" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderComparisonCharts = () => {
    const ieerTypes = [
      "IEER N1 - Gerência",
      "IEER N1 - Não Liderança",
      "IEER N1 - Diretoria",
      "IEER N1 - Ponderado"
    ];

    return ieerTypes.map(type => {
      const filteredKPIs = allKpis.filter(kpi => 
        kpi.template_name.toLowerCase().includes(type.toLowerCase().replace("IEER N1 - ", ""))
      );
      return renderBarChart(filteredKPIs, `Comparação de Estados - ${type}`, "#1E90FF");
    });
  };

  // Dados e função para o gráfico de Diversidade Racial
  const diversidadeRacialData = [
    { name: 'Branco', value: 2661, color: '#0088FE' },
    { name: 'Pardo', value: 1086, color: '#00C49F' },
    { name: 'Preto', value: 298, color: '#FFBB28' },
    { name: 'Amarelo', value: 114, color: '#FF8042' },
    { name: 'Indígena', value: 11, color: '#8884D8' },
    { name: 'Outros', value: 49, color: '#82CA9D' }
  ];

  const renderDiversidadeRacialChart = () => {
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };

    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={diversidadeRacialData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {diversidadeRacialData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const showHelp = () => {
    const helpText = `
      <div class="space-y-6">
        <div class="flex items-center gap-2 pb-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold" style="color: ${buttonColor}">
            Dashboard
          </h2>
          <div class="w-1.5 h-1.5 rounded-full" style="background-color: ${buttonColor}"></div>
          <span class="text-sm text-gray-500">Ajuda</span>
        </div>

        <div>
          <h3 class="text-sm font-semibold mb-4" style="color: ${buttonColor}">
            Visão Geral
          </h3>
          <p class="text-sm leading-relaxed text-gray-600 mb-4">
            O Dashboard oferece uma visão consolidada dos principais indicadores ESG da organização.
            Aqui você encontra KPIs favoritos, análises ODS, progresso de projetos, métricas de diversidade e comparativos IEER.
            Os dados são atualizados automaticamente a cada 30 segundos e podem ser atualizados manualmente quando necessário.
          </p>
        </div>

        <div>
          <h3 class="text-sm font-semibold mb-3" style="color: ${buttonColor}">
            Funcionalidades
          </h3>
          <div class="bg-gray-50 p-3 rounded-md">
            <ul class="space-y-2 text-sm text-gray-600">
              <li class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full" style="background-color: ${buttonColor}"></div>
                KPIs Favoritos em destaque para rápido acesso
              </li>
              <li class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full" style="background-color: ${buttonColor}"></div>
                Gráfico radar para análise de ODS
              </li>
              <li class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full" style="background-color: ${buttonColor}"></div>
                Acompanhamento do progresso de projetos
              </li>
              <li class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full" style="background-color: ${buttonColor}"></div>
                Métricas de diversidade racial
              </li>
              <li class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full" style="background-color: ${buttonColor}"></div>
                Comparativos IEER por categoria
              </li>
            </ul>
          </div>
        </div>
      </div>
    `;

    const modal = document.createElement('div');
    modal.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div class="prose prose-sm max-w-none">
            ${helpText}
          </div>
          <div class="mt-6 flex justify-end border-t border-gray-100 pt-4">
            <button
              class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
              style="color: ${buttonColor}; hover:background-color: ${buttonColor}10"
              onclick="this.parentElement.parentElement.parentElement.remove()"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div 
      className={`
        fixed
        top-12
        ${isSidebarCollapsed ? 'left-16' : 'left-64'}
        right-0
        bottom-0
        flex
        flex-col
        transition-all 
        duration-300 
        bg-gray-100
      `}
    >
      <div className="flex justify-between items-center h-14 bg-white border-b px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-medium text-gray-800">Dashboard</h1>
          <button
            onClick={showHelp}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Ajuda"
          >
            <HelpCircle size={16} className="stroke-[1.5] stroke-current" />
          </button>
        </div>
        <button
          onClick={handleRefresh}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          title="Atualizar dados"
          disabled={loading}
        >
          <RefreshCw 
            size={16} 
            className={`stroke-[1.5] ${loading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* KPIs Favoritos */}
        {renderFavoriteKPIs()}

        {/* Grid responsivo para os cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {/* Card Progresso dos Projetos */}
          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <h3 className="text-sm font-medium mb-3">Progresso dos Projetos</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{fontSize: 11}} />
                  <YAxis tick={{fontSize: 11}} />
                  <Tooltip contentStyle={{fontSize: 11}} />
                  <Bar dataKey="progress_percentage" fill="#82ca9d" name="Progresso (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card Diversidade Racial */}
          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <h3 className="text-sm font-medium mb-3">Diversidade Racial - Visão Geral</h3>
            <div className="h-[300px]">
              {renderDiversidadeRacialChart()}
            </div>
          </div>
        </div>

        {/* Comparação de Estados */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Comparação de Estados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {renderComparisonCharts()}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomeContent;

