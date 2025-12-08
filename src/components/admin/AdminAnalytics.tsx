/**
 * AdminAnalytics - Dashboard de análisis y estadísticas
 * Muestra métricas de moderación, contribuciones y calidad de datos
 */

import { useState } from 'react';
import styled from 'styled-components';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, Clock, BarChart2, BarChart3 } from 'lucide-react';
import { useAdminAnalytics } from '@/hooks/useAnalytics';
import {
  calculatePercentageChange,
  formatReviewTime,
  getContributionTypeLabel,
  formatPercentageChange,
  getTrendIcon,
} from '@/types/analytics';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const TimeRangeSelector = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const TimeRangeButton = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[4]}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.primary[500] : theme.colors.border.main};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.primary[500] : theme.colors.background.paper};
  color: ${({ theme, $active }) =>
    $active ? 'white' : theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, $active }) =>
      $active ? theme.colors.primary[600] : theme.colors.background.elevated};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[5]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ $color }) => $color}15;
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StatChange = styled.div<{ $positive: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ $positive, theme }) =>
    $positive ? theme.colors.semantic.success.main : theme.colors.semantic.error.main};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const ChartsGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[6]};
`;

const ChartCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[5]};
`;

const ChartTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[12]};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
`;

const ErrorState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[12]};
  color: ${({ theme }) => theme.colors.semantic.error.main};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
`;

const COLORS = {
  primary: '#6366F1',
  success: '#16A34A',
  warning: '#CA8A04',
  error: '#DC2626',
  secondary: '#8B5CF6',
};

export const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const { trends, byType, reviewStats, activeContributors, completeness, dailyStats, isLoading, isError } =
    useAdminAnalytics(timeRange);

  if (isLoading) {
    return (
      <Container>
        <LoadingState>Cargando estadísticas...</LoadingState>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <ErrorState>
          Error al cargar estadísticas. Por favor, intenta de nuevo más tarde.
        </ErrorState>
      </Container>
    );
  }

  // Calculate changes
  const contributionsChange = calculatePercentageChange(
    dailyStats.data?.contributions_today || 0,
    dailyStats.data?.contributions_yesterday || 0
  );
  const reviewsChange = calculatePercentageChange(
    dailyStats.data?.reviews_today || 0,
    dailyStats.data?.reviews_yesterday || 0
  );

  // Format chart data
  const trendData = trends.data?.map((item) => ({
    date: new Date(item.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    Total: item.total,
    Aprobadas: item.approved,
    Rechazadas: item.rejected,
    Pendientes: item.pending,
  })) || [];

  const typeData = byType.data?.map((item) => ({
    name: getContributionTypeLabel(item.contribution_type),
    Aprobadas: item.approved,
    Rechazadas: item.rejected,
    Pendientes: item.pending,
    'Tasa de Aprobación': item.approval_rate,
  })) || [];

  const pieData = byType.data?.map((item) => ({
    name: getContributionTypeLabel(item.contribution_type),
    value: item.total,
  })) || [];

  const completenessData = completeness.data?.slice(0, 8).map((item) => ({
    name: item.category_name.length > 15 ? item.category_name.substring(0, 15) + '...' : item.category_name,
    'Completitud (%)': Math.round(item.avg_completeness),
    Incompletos: item.incomplete_products,
  })) || [];

  return (
    <Container>
      <Header>
        <Title><BarChart3 size={28} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} /> Dashboard de Analíticas</Title>
        <Subtitle>Estadísticas de moderación, contribuciones y calidad de datos</Subtitle>
      </Header>

      <TimeRangeSelector>
        <TimeRangeButton $active={timeRange === 7} onClick={() => setTimeRange(7)}>
          7 días
        </TimeRangeButton>
        <TimeRangeButton $active={timeRange === 30} onClick={() => setTimeRange(30)}>
          30 días
        </TimeRangeButton>
        <TimeRangeButton $active={timeRange === 90} onClick={() => setTimeRange(90)}>
          90 días
        </TimeRangeButton>
      </TimeRangeSelector>

      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatLabel>Contribuciones Hoy</StatLabel>
            <StatIcon $color={COLORS.primary}>
              <TrendingUp size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{dailyStats.data?.contributions_today || 0}</StatValue>
          <StatChange $positive={contributionsChange >= 0}>
            {getTrendIcon(contributionsChange)} {formatPercentageChange(contributionsChange)} vs
            ayer
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatLabel>Revisiones Hoy</StatLabel>
            <StatIcon $color={COLORS.success}>
              <BarChart2 size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{dailyStats.data?.reviews_today || 0}</StatValue>
          <StatChange $positive={reviewsChange >= 0}>
            {getTrendIcon(reviewsChange)} {formatPercentageChange(reviewsChange)} vs ayer
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatLabel>Contribuidores Activos</StatLabel>
            <StatIcon $color={COLORS.secondary}>
              <Users size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{activeContributors.data || 0}</StatValue>
          <StatChange $positive={true}>En los últimos {timeRange} días</StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatLabel>Tiempo de Revisión</StatLabel>
            <StatIcon $color={COLORS.warning}>
              <Clock size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>
            {formatReviewTime(reviewStats.data?.avg_review_hours || 0)}
          </StatValue>
          <StatChange $positive={true}>
            Promedio de {reviewStats.data?.total_reviewed || 0} revisiones
          </StatChange>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        {/* Contribution Trends Over Time */}
        <ChartCard>
          <ChartTitle><TrendingUp size={20} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} /> Tendencia de Contribuciones</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Total"
                stroke={COLORS.primary}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="Aprobadas"
                stroke={COLORS.success}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="Rechazadas"
                stroke={COLORS.error}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="Pendientes"
                stroke={COLORS.warning}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Contributions by Type */}
        <ChartCard>
          <ChartTitle><BarChart2 size={20} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} /> Contribuciones por Tipo</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Aprobadas" fill={COLORS.success} />
              <Bar dataKey="Rechazadas" fill={COLORS.error} />
              <Bar dataKey="Pendientes" fill={COLORS.warning} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Contribution Type Distribution */}
        <ChartCard>
          <ChartTitle>🥧 Distribución de Contribuciones</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={[COLORS.primary, COLORS.success, COLORS.warning, COLORS.secondary][index % 4]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Product Completeness by Category */}
        <ChartCard>
          <ChartTitle>📦 Completitud de Productos por Categoría</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={completenessData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="name" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Completitud (%)" fill={COLORS.primary}>
                {completenessData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry['Completitud (%)'] >= 80 ? COLORS.success : entry['Completitud (%)'] >= 50 ? COLORS.warning : COLORS.error}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsGrid>
    </Container>
  );
};

export default AdminAnalytics;
