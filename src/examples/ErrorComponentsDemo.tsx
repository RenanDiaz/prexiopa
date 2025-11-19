/**
 * Demo de Componentes de Manejo de Errores
 *
 * Ejemplos de uso de ErrorMessage, ErrorBoundary y EmptyState
 * Para desarrollo y testing
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSearch, FiHeart, FiShoppingCart, FiAlertCircle } from 'react-icons/fi';
import { ErrorMessage, ErrorBoundary, EmptyState } from '../components/common';

// ============================================
// STYLED COMPONENTS
// ============================================

const DemoContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing[8]};
`;

const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing[12]};
`;

const SectionTitle = styled.h2`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ExampleGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[6]};
`;

const ExampleCard = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const ExampleTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CodeBlock = styled.pre`
  margin-top: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[4]};
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  overflow-x: auto;
`;

const TestButton = styled.button`
  margin-top: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[4]}`};
  background-color: ${({ theme }) => theme.colors.primary[500]};
  color: ${({ theme }) => theme.colors.primary.contrast};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary[600]};
  }
`;

// ============================================
// COMPONENTE PROBLEMÁTICO (para ErrorBoundary)
// ============================================

const BuggyComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Este es un error de prueba para ErrorBoundary');
  }
  return <div>Componente funcionando correctamente</div>;
};

// ============================================
// DEMO PRINCIPAL
// ============================================

export const ErrorComponentsDemo: React.FC = () => {
  const [showError, setShowError] = useState(false);
  const [throwError, setThrowError] = useState(false);

  const handleRetry = () => {
    console.log('Retry clicked');
    alert('Reintentando operación...');
  };

  const handleDismiss = () => {
    console.log('Dismiss clicked');
    setShowError(false);
  };

  const handleAction = (action: string) => {
    console.log(`Action clicked: ${action}`);
    alert(`Acción: ${action}`);
  };

  return (
    <DemoContainer>
      <h1>Demo: Componentes de Manejo de Errores</h1>

      {/* ERROR MESSAGE EXAMPLES */}
      <Section>
        <SectionTitle>1. ErrorMessage Component</SectionTitle>

        <ExampleGrid>
          {/* Error Variant */}
          <ExampleCard>
            <ExampleTitle>Error (con reintentar)</ExampleTitle>
            <ErrorMessage
              variant="error"
              title="Error de conexión"
              message="No se pudo conectar al servidor. Por favor intenta de nuevo."
              onRetry={handleRetry}
              onDismiss={handleDismiss}
            />
            <CodeBlock>{`<ErrorMessage
  variant="error"
  title="Error de conexión"
  message="No se pudo conectar al servidor..."
  onRetry={handleRetry}
  onDismiss={handleDismiss}
/>`}</CodeBlock>
          </ExampleCard>

          {/* Warning Variant */}
          <ExampleCard>
            <ExampleTitle>Warning (con cerrar)</ExampleTitle>
            <ErrorMessage
              variant="warning"
              title="Sesión por expirar"
              message="Tu sesión expirará en 5 minutos. Guarda tu trabajo."
              onDismiss={handleDismiss}
            />
            <CodeBlock>{`<ErrorMessage
  variant="warning"
  title="Sesión por expirar"
  message="Tu sesión expirará en 5 minutos..."
  onDismiss={handleDismiss}
/>`}</CodeBlock>
          </ExampleCard>

          {/* Info Variant */}
          <ExampleCard>
            <ExampleTitle>Info (solo mensaje)</ExampleTitle>
            <ErrorMessage
              variant="info"
              title="Nueva función disponible"
              message="Ahora puedes guardar tus búsquedas favoritas y recibir alertas de precios."
            />
            <CodeBlock>{`<ErrorMessage
  variant="info"
  title="Nueva función disponible"
  message="Ahora puedes guardar tus búsquedas..."
/>`}</CodeBlock>
          </ExampleCard>

          {/* Simple Error */}
          <ExampleCard>
            <ExampleTitle>Error simple (sin título)</ExampleTitle>
            <ErrorMessage
              message="No se encontraron productos con ese nombre"
            />
            <CodeBlock>{`<ErrorMessage
  message="No se encontraron productos..."
/>`}</CodeBlock>
          </ExampleCard>

          {/* Toggleable Error */}
          <ExampleCard>
            <ExampleTitle>Error interactivo</ExampleTitle>
            <TestButton onClick={() => setShowError(!showError)}>
              {showError ? 'Ocultar' : 'Mostrar'} Error
            </TestButton>
            {showError && (
              <ErrorMessage
                variant="error"
                title="Error al cargar productos"
                message="Ocurrió un error al cargar la lista de productos. Por favor intenta de nuevo."
                onRetry={() => {
                  setShowError(false);
                  alert('Recargando...');
                }}
                onDismiss={() => setShowError(false)}
              />
            )}
          </ExampleCard>
        </ExampleGrid>
      </Section>

      {/* EMPTY STATE EXAMPLES */}
      <Section>
        <SectionTitle>2. EmptyState Component</SectionTitle>

        <ExampleGrid>
          {/* No Search Results */}
          <ExampleCard>
            <ExampleTitle>Sin resultados de búsqueda</ExampleTitle>
            <EmptyState
              icon={FiSearch}
              title="No se encontraron resultados"
              message="Intenta con otros términos de búsqueda o revisa los filtros aplicados."
            />
            <CodeBlock>{`<EmptyState
  icon={FiSearch}
  title="No se encontraron resultados"
  message="Intenta con otros términos..."
/>`}</CodeBlock>
          </ExampleCard>

          {/* No Favorites */}
          <ExampleCard>
            <ExampleTitle>Sin favoritos (con acción)</ExampleTitle>
            <EmptyState
              icon={FiHeart}
              title="No tienes productos favoritos"
              message="Guarda productos para compararlos más tarde y recibir alertas de precio."
              actionLabel="Explorar Productos"
              onAction={() => handleAction('Explorar Productos')}
            />
            <CodeBlock>{`<EmptyState
  icon={FiHeart}
  title="No tienes productos favoritos"
  message="Guarda productos para compararlos..."
  actionLabel="Explorar Productos"
  onAction={handleExplore}
/>`}</CodeBlock>
          </ExampleCard>

          {/* Empty Cart */}
          <ExampleCard>
            <ExampleTitle>Carrito vacío (con texto secundario)</ExampleTitle>
            <EmptyState
              icon={FiShoppingCart}
              title="Tu carrito está vacío"
              message="Agrega productos para comenzar a comparar precios en diferentes tiendas."
              actionLabel="Ver Ofertas del Día"
              onAction={() => handleAction('Ver Ofertas')}
              secondaryText="Las mejores ofertas se actualizan diariamente"
            />
            <CodeBlock>{`<EmptyState
  icon={FiShoppingCart}
  title="Tu carrito está vacío"
  message="Agrega productos..."
  actionLabel="Ver Ofertas del Día"
  onAction={handleViewDeals}
  secondaryText="Las mejores ofertas..."
/>`}</CodeBlock>
          </ExampleCard>

          {/* No Alerts */}
          <ExampleCard>
            <ExampleTitle>Sin alertas</ExampleTitle>
            <EmptyState
              icon={FiAlertCircle}
              title="No hay alertas activas"
              message="Crea alertas para recibir notificaciones cuando bajen los precios de tus productos favoritos."
              actionLabel="Crear Primera Alerta"
              onAction={() => handleAction('Crear Alerta')}
            />
          </ExampleCard>
        </ExampleGrid>
      </Section>

      {/* ERROR BOUNDARY EXAMPLES */}
      <Section>
        <SectionTitle>3. ErrorBoundary Component</SectionTitle>

        <ExampleGrid>
          {/* Working Component */}
          <ExampleCard>
            <ExampleTitle>Componente sin error</ExampleTitle>
            <ErrorBoundary>
              <BuggyComponent shouldThrow={false} />
            </ErrorBoundary>
            <TestButton onClick={() => setThrowError(false)}>
              Componente OK
            </TestButton>
          </ExampleCard>

          {/* Error Component */}
          <ExampleCard>
            <ExampleTitle>Componente con error (capturado)</ExampleTitle>
            <ErrorBoundary
              onError={(error, errorInfo) => {
                console.error('Error capturado:', error);
                console.error('Error info:', errorInfo);
              }}
            >
              <BuggyComponent shouldThrow={throwError} />
            </ErrorBoundary>
            <TestButton onClick={() => setThrowError(true)}>
              Provocar Error
            </TestButton>
            <CodeBlock>{`<ErrorBoundary
  onError={(error, errorInfo) => {
    logErrorToService(error, errorInfo);
  }}
>
  <ProductList />
</ErrorBoundary>`}</CodeBlock>
          </ExampleCard>

          {/* Custom Fallback */}
          <ExampleCard>
            <ExampleTitle>Con fallback personalizado</ExampleTitle>
            <ErrorBoundary
              fallback={
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <h3>Oops! Algo salió mal</h3>
                  <p>UI de fallback personalizada</p>
                </div>
              }
            >
              <div>Componente protegido por ErrorBoundary</div>
            </ErrorBoundary>
            <CodeBlock>{`<ErrorBoundary
  fallback={<CustomErrorUI />}
>
  <ComplexFeature />
</ErrorBoundary>`}</CodeBlock>
          </ExampleCard>
        </ExampleGrid>
      </Section>

      {/* USAGE TIPS */}
      <Section>
        <SectionTitle>Consejos de Uso</SectionTitle>
        <ExampleCard>
          <h4>ErrorMessage</h4>
          <ul>
            <li>Usa variant="error" para errores críticos que requieren acción</li>
            <li>Usa variant="warning" para advertencias que el usuario debe conocer</li>
            <li>Usa variant="info" para mensajes informativos no urgentes</li>
            <li>Incluye onRetry cuando la acción se puede reintentar</li>
            <li>Incluye onDismiss cuando el mensaje se puede cerrar</li>
          </ul>

          <h4 style={{ marginTop: '24px' }}>EmptyState</h4>
          <ul>
            <li>Usa para listas vacías, búsquedas sin resultados, etc.</li>
            <li>Incluye un icono apropiado para el contexto</li>
            <li>Proporciona una acción clara para que el usuario sepa qué hacer</li>
            <li>El texto secundario es útil para dar más contexto</li>
          </ul>

          <h4 style={{ marginTop: '24px' }}>ErrorBoundary</h4>
          <ul>
            <li>Envuelve componentes propensos a errores</li>
            <li>Usa en niveles estratégicos del árbol de componentes</li>
            <li>Proporciona onError para logging de errores</li>
            <li>Considera múltiples boundaries para mejor granularidad</li>
            <li>Los detalles técnicos solo se muestran en desarrollo</li>
          </ul>
        </ExampleCard>
      </Section>
    </DemoContainer>
  );
};

export default ErrorComponentsDemo;
