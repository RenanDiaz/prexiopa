/**
 * Shopping Page - Lista de compras
 * Gestiona sesiones de compras activas e historial
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiPlus, FiClock, FiCalendar, FiCheckSquare, FiSearch } from 'react-icons/fi';
import { Receipt } from 'lucide-react';
import styled from 'styled-components';
import { ActiveShoppingSession, ShoppingListCard } from '@/components/shopping';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import EmptyState from '@/components/common/EmptyState';
import { ImportCAFEModal } from '@/components/cafe';
import {
  useActiveSessionQuery,
  useShoppingSessionsQuery,
  useCreateSessionMutation,
  useDeleteSessionMutation,
} from '@/hooks/useShoppingLists';
import { useStoresQuery } from '@/hooks/useStores';
import type { SessionMode } from '@/services/supabase/shopping';

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

const ModeSelector = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-top: ${({ theme }) => theme.spacing[2]};

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

interface ModeCardProps {
  $selected?: boolean;
}

const ModeCard = styled.button<ModeCardProps>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary[50] : theme.colors.background.paper};
  border: 2px solid ${({ theme, $selected }) =>
    $selected ? theme.colors.primary[500] : theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary[400]};
  }

  svg {
    font-size: 24px;
    color: ${({ theme, $selected }) =>
      $selected ? theme.colors.primary[500] : theme.colors.text.secondary};
  }
`;

const ModeTitle = styled.span<ModeCardProps>`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary[600] : theme.colors.text.primary};
`;

const ModeDescription = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

const StoreSearchContainer = styled.div`
  position: relative;
`;

const StoreSuggestions = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: ${({ theme }) => theme.spacing[1]};
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  max-height: 240px;
  overflow-y: auto;
  z-index: 1000;
`;

const StoreSuggestionItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]};
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s ease;
  text-align: left;

  &:hover {
    background: ${({ theme }) => theme.colors.neutral[50]};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  }
`;

const StoreLogo = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const StoreInfo = styled.div`
  flex: 1;
`;

const StoreName = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StoreType = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const NoStoresMessage = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

type TabType = 'active' | 'history';

const HeaderButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;

  @media (max-width: 480px) {
    width: 100%;
    flex-direction: column;
  }
`;

const Shopping = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [showImportCAFEModal, setShowImportCAFEModal] = useState(false);
  const [storeSearchText, setStoreSearchText] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [showStoreSuggestions, setShowStoreSuggestions] = useState(false);
  const [sessionMode, setSessionMode] = useState<SessionMode>('planning');

  // Queries
  const { data: activeSession } = useActiveSessionQuery();
  const { data: completedSessions = [] } = useShoppingSessionsQuery('completed');
  const { data: cancelledSessions = [] } = useShoppingSessionsQuery('cancelled');
  const { data: stores = [] } = useStoresQuery();

  // Mutations
  const createSessionMutation = useCreateSessionMutation();
  const deleteSessionMutation = useDeleteSessionMutation();

  // Filter stores based on search text
  const filteredStores = useMemo(() => {
    if (!storeSearchText) return stores;
    const searchLower = storeSearchText.toLowerCase();
    return stores.filter(store =>
      store.name.toLowerCase().includes(searchLower)
    );
  }, [stores, storeSearchText]);

  // Combine history sessions
  const historySessions = [...completedSessions, ...cancelledSessions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Handlers
  const handleCreateSession = () => {
    const selectedStore = stores.find(s => s.id === selectedStoreId);

    createSessionMutation.mutate(
      {
        store_id: selectedStoreId || undefined,
        store_name: selectedStore ? selectedStore.name : (storeSearchText || undefined),
        mode: sessionMode,
      },
      {
        onSuccess: () => {
          setShowNewSessionModal(false);
          setStoreSearchText('');
          setSelectedStoreId(null);
          setShowStoreSuggestions(false);
          setSessionMode('planning');
          setActiveTab('active');
        },
      }
    );
  };

  const handleStoreSelect = (storeId: string, storeName: string) => {
    setSelectedStoreId(storeId);
    setStoreSearchText(storeName);
    setShowStoreSuggestions(false);
  };

  const handleStoreInputChange = (value: string) => {
    setStoreSearchText(value);
    setSelectedStoreId(null);
    setShowStoreSuggestions(value.length > 0);
  };

  const handleCloseModal = () => {
    setShowNewSessionModal(false);
    setStoreSearchText('');
    setSelectedStoreId(null);
    setShowStoreSuggestions(false);
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
              <HeaderButtons>
                <Button
                  variant="outline"
                  iconLeft={<Receipt size={18} />}
                  onClick={() => setShowImportCAFEModal(true)}
                >
                  Importar Factura
                </Button>
                <Button
                  variant="primary"
                  iconLeft={<FiPlus />}
                  onClick={() => setShowNewSessionModal(true)}
                >
                  Nueva Sesión
                </Button>
              </HeaderButtons>
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
          onClose={handleCloseModal}
        >
          <Modal.Header>
            Nueva Sesión de Compras
          </Modal.Header>

          <Modal.Body>
            <ModalFormGroup>
              <ModalLabel>Tipo de sesión</ModalLabel>
              <ModeSelector>
                <ModeCard
                  type="button"
                  $selected={sessionMode === 'planning'}
                  onClick={() => setSessionMode('planning')}
                >
                  <FiCalendar />
                  <ModeTitle $selected={sessionMode === 'planning'}>
                    Planear Compra
                  </ModeTitle>
                  <ModeDescription>
                    Crea una lista para tu próxima visita al supermercado
                  </ModeDescription>
                </ModeCard>
                <ModeCard
                  type="button"
                  $selected={sessionMode === 'completed'}
                  onClick={() => setSessionMode('completed')}
                >
                  <FiCheckSquare />
                  <ModeTitle $selected={sessionMode === 'completed'}>
                    Registrar Compra
                  </ModeTitle>
                  <ModeDescription>
                    Registra una compra ya realizada con los precios reales
                  </ModeDescription>
                </ModeCard>
              </ModeSelector>
            </ModalFormGroup>

            <ModalFormGroup style={{ marginTop: '16px' }}>
              <ModalLabel htmlFor="store-name">
                Nombre de la tienda (opcional)
              </ModalLabel>
              <StoreSearchContainer>
                <Input
                  id="store-name"
                  type="text"
                  placeholder="Busca una tienda o escribe un nombre..."
                  value={storeSearchText}
                  onChange={(e) => handleStoreInputChange(e.target.value)}
                  onFocus={() => storeSearchText && setShowStoreSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowStoreSuggestions(false), 200)}
                  iconLeft={<FiSearch />}
                />
                {showStoreSuggestions && filteredStores.length > 0 && (
                  <StoreSuggestions>
                    {filteredStores.map((store) => (
                      <StoreSuggestionItem
                        key={store.id}
                        type="button"
                        onClick={() => handleStoreSelect(store.id, store.name)}
                      >
                        {store.logo && (
                          <StoreLogo
                            src={store.logo}
                            alt={store.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <StoreInfo>
                          <StoreName>{store.name}</StoreName>
                          {store.chain && <StoreType>{store.chain}</StoreType>}
                        </StoreInfo>
                      </StoreSuggestionItem>
                    ))}
                  </StoreSuggestions>
                )}
                {showStoreSuggestions && filteredStores.length === 0 && storeSearchText && (
                  <StoreSuggestions>
                    <NoStoresMessage>
                      No se encontraron tiendas. Puedes escribir el nombre manualmente.
                    </NoStoresMessage>
                  </StoreSuggestions>
                )}
              </StoreSearchContainer>
              <ModalHint>
                {sessionMode === 'planning'
                  ? 'Busca una tienda registrada o escribe el nombre de donde planeas comprar'
                  : 'Busca una tienda registrada o escribe el nombre de donde compraste'}
              </ModalHint>
            </ModalFormGroup>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="outline"
              onClick={handleCloseModal}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateSession}
              loading={createSessionMutation.isPending}
            >
              {sessionMode === 'planning' ? 'Crear Lista' : 'Registrar Compra'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Import CAFE Modal */}
        <ImportCAFEModal
          isOpen={showImportCAFEModal}
          onClose={() => setShowImportCAFEModal(false)}
          onImportSuccess={() => {
            setShowImportCAFEModal(false);
            // Switch to history tab to see the imported session
            setActiveTab('history');
          }}
        />
      </ContentWrapper>
    </ShoppingContainer>
  );
};

export default Shopping;
