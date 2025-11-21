/**
 * Shopping Page - Lista de compras
 * Gestiona sesiones de compras activas e historial
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiPlus, FiClock } from 'react-icons/fi';
import styled from 'styled-components';
import { ActiveShoppingSession, ShoppingListCard } from '@/components/shopping';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import EmptyState from '@/components/common/EmptyState';
import {
  useActiveSessionQuery,
  useShoppingSessionsQuery,
  useCreateSessionMutation,
  useDeleteSessionMutation,
} from '@/hooks/useShoppingLists';

const ShoppingContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.default};
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing[8]};

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing[4]};
  }
`;

const Header = styled.header`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};

  svg {
    color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border.light};
`;

interface TabProps {
  $active?: boolean;
}

const Tab = styled.button<TabProps>`
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[6]}`};
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary[500] : theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: -2px;

  ${({ $active, theme }) =>
    $active &&
    `
    border-bottom-color: ${theme.colors.primary[500]};
  `}

  &:hover {
    color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};

  svg {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const SessionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing[4]};

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ModalFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ModalLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ModalHint = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.disabled};
  margin: 0;
`;

type TabType = 'active' | 'history';

const Shopping = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [storeName, setStoreName] = useState('');

  // Queries
  const { data: activeSession } = useActiveSessionQuery();
  const { data: completedSessions = [] } = useShoppingSessionsQuery('completed');
  const { data: cancelledSessions = [] } = useShoppingSessionsQuery('cancelled');

  // Mutations
  const createSessionMutation = useCreateSessionMutation();
  const deleteSessionMutation = useDeleteSessionMutation();

  // Combine history sessions
  const historySessions = [...completedSessions, ...cancelledSessions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Handlers
  const handleCreateSession = () => {
    createSessionMutation.mutate(
      { store_name: storeName || undefined },
      {
        onSuccess: () => {
          setShowNewSessionModal(false);
          setStoreName('');
          setActiveTab('active');
        },
      }
    );
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteSessionMutation.mutate(sessionId);
  };

  const handleViewSession = (sessionId: string) => {
    // TODO: Navigate to session detail page
    console.log('View session:', sessionId);
  };

  const handleAddProduct = () => {
    // Navigate to search/dashboard to add products
    navigate('/');
  };

  return (
    <ShoppingContainer>
      <ContentWrapper>
        <Header>
          <TitleRow>
            <Title>
              <FiShoppingCart />
              Listas de Compras
            </Title>

            {!activeSession && (
              <Button
                variant="primary"
                iconLeft={<FiPlus />}
                onClick={() => setShowNewSessionModal(true)}
              >
                Nueva Sesión
              </Button>
            )}
          </TitleRow>

          <Subtitle>
            Organiza tus compras y compara precios mientras compras
          </Subtitle>
        </Header>

        {/* Tabs */}
        <TabsContainer>
          <Tab $active={activeTab === 'active'} onClick={() => setActiveTab('active')}>
            Sesión Activa
          </Tab>
          <Tab $active={activeTab === 'history'} onClick={() => setActiveTab('history')}>
            Historial
          </Tab>
        </TabsContainer>

        {/* Active Tab */}
        {activeTab === 'active' && (
          <Section>
            {activeSession ? (
              <ActiveShoppingSession onAddProduct={handleAddProduct} />
            ) : (
              <EmptyState
                icon={FiShoppingCart}
                title="No hay sesión activa"
                message="Inicia una nueva sesión de compras para comenzar"
                actionLabel="Iniciar Nueva Sesión"
                onAction={() => setShowNewSessionModal(true)}
              />
            )}
          </Section>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <Section>
            <SectionHeader>
              <SectionTitle>
                <FiClock />
                Historial de Compras
              </SectionTitle>
            </SectionHeader>

            {historySessions.length === 0 ? (
              <EmptyState
                icon={FiClock}
                title="Sin historial"
                message="Aquí aparecerán tus sesiones completadas y canceladas"
              />
            ) : (
              <SessionsGrid>
                {historySessions.map((session) => (
                  <ShoppingListCard
                    key={session.id}
                    session={session}
                    onClick={() => handleViewSession(session.id)}
                    onDelete={() => handleDeleteSession(session.id)}
                  />
                ))}
              </SessionsGrid>
            )}
          </Section>
        )}

        {/* New Session Modal */}
        <Modal
          open={showNewSessionModal}
          onClose={() => setShowNewSessionModal(false)}
        >
          <Modal.Header>
            Nueva Sesión de Compras
          </Modal.Header>

          <Modal.Body>
            <ModalFormGroup>
              <ModalLabel htmlFor="store-name">
                Nombre de la tienda (opcional)
              </ModalLabel>
              <Input
                id="store-name"
                type="text"
                placeholder="Ej: Super 99, El Machetazo, Riba Smith..."
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
              <ModalHint>
                Agrega el nombre de la tienda donde harás tus compras para mejor
                organización
              </ModalHint>
            </ModalFormGroup>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="outline"
              onClick={() => setShowNewSessionModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateSession}
              loading={createSessionMutation.isPending}
            >
              Iniciar Sesión
            </Button>
          </Modal.Footer>
        </Modal>
      </ContentWrapper>
    </ShoppingContainer>
  );
};

export default Shopping;
