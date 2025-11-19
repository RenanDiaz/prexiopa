/**
 * BarcodeScanner Demo Page
 *
 * Demonstration page for the BarcodeScanner component.
 * Shows different usage scenarios and configuration options.
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { BarcodeScanner } from '../components/scanner';
import { theme } from '../styles/theme';

/**
 * Demo Page Container
 */
const DemoContainer = styled.div`
  min-height: 100vh;
  padding: ${theme.spacing[8]} ${theme.spacing[4]};
  background: ${theme.colors.background.default};

  @media (min-width: 768px) {
    padding: ${theme.spacing[12]} ${theme.spacing[8]};
  }
`;

/**
 * Content wrapper
 */
const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

/**
 * Page title
 */
const Title = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[2]};

  @media (min-width: 768px) {
    font-size: ${theme.typography.fontSize['4xl']};
  }
`;

/**
 * Page description
 */
const Description = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[8]};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

/**
 * Demo section
 */
const DemoSection = styled.section`
  margin-bottom: ${theme.spacing[8]};
  padding: ${theme.spacing[6]};
  background: ${theme.colors.background.paper};
  border-radius: ${theme.borderRadius.card};
  box-shadow: ${theme.shadows.card};
`;

/**
 * Section title
 */
const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[4]};
`;

/**
 * Section description
 */
const SectionDescription = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[4]};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

/**
 * Button grid
 */
const ButtonGrid = styled.div`
  display: grid;
  gap: ${theme.spacing[3]};
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

/**
 * Demo button
 */
const DemoButton = styled.button`
  padding: ${theme.spacing[4]};
  background: ${theme.colors.primary[500]};
  color: ${theme.colors.primary.contrast};
  border: none;
  border-radius: ${theme.borderRadius.button};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${theme.shadows.sm};

  &:hover {
    background: ${theme.colors.primary[600]};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: 2px solid ${theme.colors.primary[300]};
    outline-offset: 2px;
  }
`;

/**
 * Result display
 */
const ResultContainer = styled.div`
  margin-top: ${theme.spacing[6]};
  padding: ${theme.spacing[4]};
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.base};
  border-left: 4px solid ${theme.colors.primary[500]};
`;

/**
 * Result label
 */
const ResultLabel = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.wide};
  margin-bottom: ${theme.spacing[2]};
`;

/**
 * Result value
 */
const ResultValue = styled.p`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fontFamily.mono};
  word-break: break-all;
  margin: 0;
`;

/**
 * History list
 */
const HistoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: ${theme.spacing[4]} 0 0 0;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

/**
 * History item
 */
const HistoryItem = styled.li`
  padding: ${theme.spacing[3]};
  background: ${theme.colors.background.paper};
  border-radius: ${theme.borderRadius.base};
  border: 1px solid ${theme.colors.border.light};
  font-family: ${theme.typography.fontFamily.mono};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

/**
 * Timestamp
 */
const Timestamp = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.hint};
  white-space: nowrap;
`;

/**
 * Scanner Demo Component
 */
export const ScannerDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<Array<{ code: string; time: string }>>([]);
  const [autoClose, setAutoClose] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  /**
   * Handle scan result
   */
  const handleScan = (code: string) => {
    setLastScan(code);
    setScanHistory((prev) => [
      { code, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 9), // Keep last 10 scans
    ]);
  };

  /**
   * Open scanner with specific config
   */
  const openScanner = (config: { autoClose?: boolean; facingMode?: 'user' | 'environment' }) => {
    setAutoClose(config.autoClose ?? true);
    setFacingMode(config.facingMode ?? 'environment');
    setIsOpen(true);
  };

  /**
   * Close scanner
   */
  const closeScanner = () => {
    setIsOpen(false);
  };

  /**
   * Clear history
   */
  const clearHistory = () => {
    setScanHistory([]);
    setLastScan(null);
  };

  return (
    <DemoContainer>
      <ContentWrapper>
        <Title>Escáner de Código de Barras</Title>
        <Description>
          Prueba el componente BarcodeScanner con diferentes configuraciones.
          Soporta múltiples formatos: EAN-13, UPC-A, Code-128, QR Code.
        </Description>

        {/* Basic Usage */}
        <DemoSection>
          <SectionTitle>Uso Básico</SectionTitle>
          <SectionDescription>
            Escáner con configuración por defecto: auto-cierre activado, cámara trasera.
          </SectionDescription>
          <ButtonGrid>
            <DemoButton onClick={() => openScanner({ autoClose: true, facingMode: 'environment' })}>
              Escanear (Auto-cierre)
            </DemoButton>
            <DemoButton onClick={() => openScanner({ autoClose: false, facingMode: 'environment' })}>
              Escanear (Sin auto-cierre)
            </DemoButton>
            <DemoButton onClick={() => openScanner({ autoClose: true, facingMode: 'user' })}>
              Escanear (Cámara frontal)
            </DemoButton>
          </ButtonGrid>
        </DemoSection>

        {/* Last Scan Result */}
        {lastScan && (
          <DemoSection>
            <SectionTitle>Último Resultado</SectionTitle>
            <ResultContainer>
              <ResultLabel>Código Detectado</ResultLabel>
              <ResultValue>{lastScan}</ResultValue>
            </ResultContainer>
          </DemoSection>
        )}

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <DemoSection>
            <SectionTitle>
              Historial de Escaneos ({scanHistory.length})
            </SectionTitle>
            <DemoButton onClick={clearHistory} style={{ marginBottom: theme.spacing[4] }}>
              Limpiar Historial
            </DemoButton>
            <HistoryList>
              {scanHistory.map((item, index) => (
                <HistoryItem key={`${item.code}-${index}`}>
                  <span>{item.code}</span>
                  <Timestamp>{item.time}</Timestamp>
                </HistoryItem>
              ))}
            </HistoryList>
          </DemoSection>
        )}

        {/* Features */}
        <DemoSection>
          <SectionTitle>Características</SectionTitle>
          <HistoryList style={{ marginTop: 0 }}>
            <HistoryItem>
              <span>Acceso a cámara con manejo de permisos</span>
            </HistoryItem>
            <HistoryItem>
              <span>Detección en tiempo real de códigos de barras</span>
            </HistoryItem>
            <HistoryItem>
              <span>Guía visual de escaneo con animaciones</span>
            </HistoryItem>
            <HistoryItem>
              <span>Cambio entre cámara frontal y trasera</span>
            </HistoryItem>
            <HistoryItem>
              <span>Estados de carga, éxito y error</span>
            </HistoryItem>
            <HistoryItem>
              <span>Cerrar con ESC o clic fuera del área</span>
            </HistoryItem>
            <HistoryItem>
              <span>Accesible con navegación por teclado</span>
            </HistoryItem>
            <HistoryItem>
              <span>Responsive y optimizado para móviles</span>
            </HistoryItem>
          </HistoryList>
        </DemoSection>

        {/* Supported Formats */}
        <DemoSection>
          <SectionTitle>Formatos Soportados</SectionTitle>
          <ButtonGrid>
            <HistoryItem>EAN-13</HistoryItem>
            <HistoryItem>UPC-A</HistoryItem>
            <HistoryItem>Code-128</HistoryItem>
            <HistoryItem>QR Code</HistoryItem>
            <HistoryItem>EAN-8</HistoryItem>
            <HistoryItem>UPC-E</HistoryItem>
          </ButtonGrid>
        </DemoSection>
      </ContentWrapper>

      {/* Scanner Component */}
      <BarcodeScanner
        isOpen={isOpen}
        onClose={closeScanner}
        onScan={handleScan}
        autoClose={autoClose}
        autoCloseDelay={1500}
        noCodeTimeout={15000}
        initialFacingMode={facingMode}
      />
    </DemoContainer>
  );
};

export default ScannerDemo;
