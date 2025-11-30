/**
 * Barcode Test Page
 *
 * Utility page to test and validate barcode formats
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { validateBarcode, formatBarcodeDisplay, isScannable } from '@/utils/barcodeValidator';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  line-height: 1.6;
`;

const TestSection = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const InputGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ResultCard = styled.div<{ $isValid?: boolean }>`
  background: ${({ theme, $isValid }) =>
    $isValid === undefined
      ? theme.colors.background.tertiary
      : $isValid
      ? 'rgba(34, 197, 94, 0.1)'
      : 'rgba(239, 68, 68, 0.1)'};
  border: 2px solid
    ${({ theme, $isValid }) =>
      $isValid === undefined
        ? theme.colors.border.primary
        : $isValid
        ? 'rgba(34, 197, 94, 0.3)'
        : 'rgba(239, 68, 68, 0.3)'};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const ResultRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.secondary};

  &:last-child {
    border-bottom: none;
  }
`;

const ResultLabel = styled.span`
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ResultValue = styled.span<{ $highlight?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.mono};
  color: ${({ theme, $highlight }) =>
    $highlight ? theme.colors.primary.main : theme.colors.text.primary};
  font-weight: ${({ $highlight }) => ($highlight ? '600' : '400')};
`;

const Message = styled.p<{ $type: 'success' | 'error' | 'warning' }>`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  background: ${({ $type }) =>
    $type === 'success'
      ? 'rgba(34, 197, 94, 0.1)'
      : $type === 'error'
      ? 'rgba(239, 68, 68, 0.1)'
      : 'rgba(251, 191, 36, 0.1)'};
  color: ${({ $type }) =>
    $type === 'success' ? '#16a34a' : $type === 'error' ? '#dc2626' : '#d97706'};
`;

const PresetButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const PresetButton = styled(Button)`
  font-size: ${({ theme }) => theme.fontSize.sm};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
`;

const InfoBox = styled.div`
  background: ${({ theme }) => theme.colors.background.tertiary};
  border-left: 4px solid ${({ theme }) => theme.colors.primary.main};
  padding: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const InfoTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSize.lg};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const InfoItem = styled.li`
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: ${({ theme }) => theme.spacing.xs} 0;
  line-height: 1.6;

  &:before {
    content: '•';
    color: ${({ theme }) => theme.colors.primary.main};
    font-weight: bold;
    display: inline-block;
    width: 1em;
    margin-left: -1em;
    margin-right: 0.5em;
  }
`;

export const BarcodeTest: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState<ReturnType<typeof validateBarcode> | null>(null);
  const [scanResult, setScanResult] = useState<ReturnType<typeof isScannable> | null>(null);

  const handleTest = () => {
    if (!inputValue.trim()) {
      setResult(null);
      setScanResult(null);
      return;
    }

    const validation = validateBarcode(inputValue);
    const scannable = isScannable(inputValue);

    setResult(validation);
    setScanResult(scannable);
  };

  const handlePreset = (code: string) => {
    setInputValue(code);
  };

  const presetCodes = [
    { label: 'Altoids (Correcto)', code: '022000159335' },
    { label: 'Altoids (EAN-13)', code: '0022000159335' },
    { label: 'Código 8 dígitos', code: '02276908' },
    { label: 'Test EAN-8', code: '12345670' },
  ];

  return (
    <PageContainer>
      <Title>🔍 Validador de Códigos de Barras</Title>
      <Description>
        Herramienta para verificar la validez de códigos de barras EAN-8, EAN-13 y UPC-A.
        Ingresa un código para ver si es válido y escaneable.
      </Description>

      <TestSection>
        <InputGroup>
          <Label htmlFor="barcode-input">Código de Barras</Label>
          <Input
            id="barcode-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTest()}
            placeholder="Ej: 022000159335"
            autoFocus
          />
        </InputGroup>

        <Button onClick={handleTest} disabled={!inputValue.trim()}>
          Validar Código
        </Button>

        <PresetButtons>
          <span style={{ marginRight: '8px', alignSelf: 'center', fontWeight: 500 }}>
            Ejemplos:
          </span>
          {presetCodes.map((preset) => (
            <PresetButton
              key={preset.code}
              variant="outline"
              size="sm"
              onClick={() => handlePreset(preset.code)}
            >
              {preset.label}
            </PresetButton>
          ))}
        </PresetButtons>

        {result && (
          <ResultCard $isValid={result.isValid}>
            <ResultRow>
              <ResultLabel>Formato:</ResultLabel>
              <ResultValue $highlight>{result.format}</ResultValue>
            </ResultRow>
            <ResultRow>
              <ResultLabel>Longitud:</ResultLabel>
              <ResultValue>{inputValue.replace(/\D/g, '').length} dígitos</ResultValue>
            </ResultRow>
            <ResultRow>
              <ResultLabel>Formato Display:</ResultLabel>
              <ResultValue>{formatBarcodeDisplay(inputValue)}</ResultValue>
            </ResultRow>
            {result.checksum !== null && (
              <>
                <ResultRow>
                  <ResultLabel>Checksum Recibido:</ResultLabel>
                  <ResultValue>{result.checksum}</ResultValue>
                </ResultRow>
                <ResultRow>
                  <ResultLabel>Checksum Esperado:</ResultLabel>
                  <ResultValue>{result.expectedChecksum}</ResultValue>
                </ResultRow>
              </>
            )}
            <ResultRow>
              <ResultLabel>Estado:</ResultLabel>
              <ResultValue $highlight={result.isValid}>
                {result.isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}
              </ResultValue>
            </ResultRow>

            <Message $type={result.isValid ? 'success' : 'error'}>{result.message}</Message>

            {scanResult && (
              <Message
                $type={
                  scanResult.scannable
                    ? scanResult.reason
                      ? 'warning'
                      : 'success'
                    : 'error'
                }
              >
                {scanResult.scannable ? '📷 Escaneable' : '❌ No escaneable'}
                {scanResult.reason && <div style={{ marginTop: '8px' }}>{scanResult.reason}</div>}
              </Message>
            )}
          </ResultCard>
        )}
      </TestSection>

      <InfoBox>
        <InfoTitle>Formatos Soportados</InfoTitle>
        <InfoList>
          <InfoItem>
            <strong>EAN-8:</strong> 8 dígitos (códigos cortos, común en productos pequeños)
          </InfoItem>
          <InfoItem>
            <strong>UPC-A:</strong> 12 dígitos (estándar en USA/Canadá)
          </InfoItem>
          <InfoItem>
            <strong>EAN-13:</strong> 13 dígitos (estándar internacional)
          </InfoItem>
        </InfoList>
      </InfoBox>

      <InfoBox>
        <InfoTitle>Consejos para Escanear</InfoTitle>
        <InfoList>
          <InfoItem>Asegúrate de tener buena iluminación (luz natural preferible)</InfoItem>
          <InfoItem>Mantén el código a 10-20cm de distancia</InfoItem>
          <InfoItem>Coloca el teléfono perpendicular al código (no inclinado)</InfoItem>
          <InfoItem>Mantén el teléfono quieto por 2-3 segundos</InfoItem>
          <InfoItem>El código debe estar limpio y sin reflejos</InfoItem>
          <InfoItem>
            EAN-8 puede ser más difícil de escanear que códigos más largos (UPC-A/EAN-13)
          </InfoItem>
        </InfoList>
      </InfoBox>
    </PageContainer>
  );
};

export default BarcodeTest;
