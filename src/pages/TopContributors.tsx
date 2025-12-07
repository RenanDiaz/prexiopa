/**
 * TopContributors - Leaderboard page showing top contributors by reputation
 */

import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { FiTrophy, FiAward, FiStar } from 'react-icons/fi';
import { supabase } from '../supabaseClient';
import { ReputationBadge } from '@/components/user/ReputationBadge';

interface TopContributor {
  user_id: string;
  email: string;
  full_name: string | null;
  reputation_score: number;
  badge: string;
  contributions_approved: number;
  contributions_rejected: number;
  success_rate: number;
}

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing[6]};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const TrophyIcon = styled(FiTrophy)`
  color: ${({ theme }) => theme.colors.secondary[500]};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LeaderboardList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const ContributorCard = styled.div<{ $rank: number }>`
  background: ${({ theme, $rank }) =>
    $rank === 1
      ? `linear-gradient(135deg, ${theme.colors.secondary[50]} 0%, ${theme.colors.primary[50]} 100%)`
      : theme.colors.background.paper};
  border: 2px solid
    ${({ theme, $rank }) =>
      $rank === 1
        ? theme.colors.secondary[500]
        : $rank === 2
        ? theme.colors.primary[400]
        : $rank === 3
        ? '#CD7F32'
        : theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[5]};
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: ${({ theme }) => theme.spacing[4]};
  align-items: center;
  transition: all 0.2s ease;
  box-shadow: ${({ theme, $rank }) =>
    $rank <= 3 ? theme.shadows.md : theme.shadows.sm};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing[3]};
  }
`;

const RankSection = styled.div<{ $rank: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  font-size: ${({ theme, $rank }) =>
    $rank <= 3 ? theme.typography.fontSize['3xl'] : theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme, $rank }) =>
    $rank === 1
      ? theme.colors.secondary[600]
      : $rank === 2
      ? theme.colors.primary[600]
      : $rank === 3
      ? '#CD7F32'
      : theme.colors.text.secondary};

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
  }
`;

const ContributorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ContributorName = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ContributorEmail = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatsRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-top: ${({ theme }) => theme.spacing[2]};
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const StatLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const BadgeSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing[2]};

  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[12]};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ErrorState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[12]};
  color: ${({ theme }) => theme.colors.semantic.error.main};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing[12]};
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const EmptyText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const getRankIcon = (rank: number) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
};

const fetchTopContributors = async (): Promise<TopContributor[]> => {
  const { data, error } = await supabase.rpc('get_top_contributors', {
    p_limit: 50,
    p_min_contributions: 1,
  });

  if (error) {
    console.error('Error fetching top contributors:', error);
    throw error;
  }

  return data || [];
};

export const TopContributors = () => {
  const {
    data: contributors,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['top-contributors'],
    queryFn: fetchTopContributors,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <Container>
        <LoadingState>Cargando clasificación...</LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorState>
          Error al cargar la clasificación. Por favor, intenta de nuevo más tarde.
        </ErrorState>
      </Container>
    );
  }

  if (!contributors || contributors.length === 0) {
    return (
      <Container>
        <Header>
          <Title>
            <TrophyIcon size={40} />
            Top Contributors
          </Title>
          <Subtitle>Los mejores contribuidores de Prexiopá</Subtitle>
        </Header>
        <EmptyState>
          <EmptyIcon>🎯</EmptyIcon>
          <EmptyText>
            Aún no hay contribuidores. ¡Sé el primero en contribuir datos de productos!
          </EmptyText>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <TrophyIcon size={40} />
          Top Contributors
        </Title>
        <Subtitle>Los mejores contribuidores de Prexiopá</Subtitle>
      </Header>

      <LeaderboardList>
        {contributors.map((contributor, index) => {
          const rank = index + 1;
          return (
            <ContributorCard key={contributor.user_id} $rank={rank}>
              <RankSection $rank={rank}>{getRankIcon(rank)}</RankSection>

              <ContributorInfo>
                <ContributorName>
                  {contributor.full_name || 'Usuario Anónimo'}
                </ContributorName>
                <ContributorEmail>{contributor.email}</ContributorEmail>

                <StatsRow>
                  <StatItem>
                    <StatLabel>Aprobadas</StatLabel>
                    <StatValue>✅ {contributor.contributions_approved}</StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel>Rechazadas</StatLabel>
                    <StatValue>❌ {contributor.contributions_rejected}</StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel>Tasa de Éxito</StatLabel>
                    <StatValue>{contributor.success_rate.toFixed(1)}%</StatValue>
                  </StatItem>
                </StatsRow>
              </ContributorInfo>

              <BadgeSection>
                <ReputationBadge score={contributor.reputation_score} showScore />
              </BadgeSection>
            </ContributorCard>
          );
        })}
      </LeaderboardList>
    </Container>
  );
};

export default TopContributors;
