/**
 * ContributeDataModal Component
 *
 * Modal para permitir a usuarios contribuir con datos de productos:
 * - Código de barras
 * - Imagen del producto
 * - Precio en una tienda
 * - Información adicional (marca, descripción, categoría, etc.)
 */

import { useState } from 'react';
import styled from 'styled-components';
import { HiX, HiCamera, HiInformationCircle, HiCash } from 'react-icons/hi';
import { FiHash } from 'react-icons/fi';
import { Button } from '@/components/common/Button';
import { BarcodeScanner } from '@/components/common/BarcodeScanner';
import { useContributionsStore } from '@/store/contributionsStore';
import { useAuthStore } from '@/store/authStore';
import type {
  ContributionType,
  BarcodeContributionData,
  ImageContributionData,
  PriceContributionData,
  InfoContributionData,
} from '@/types/contribution';
import {
  isValidBarcode,
  isValidImageUrl,
  isValidPrice,
} from '@/types/contribution';

// Types
interface ContributeDataModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

// Styled Components
const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: ${({ theme }) => theme.zIndex.modalBackdrop};
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
  backdrop-filter: blur(3px);
`;

const ModalContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(${({ $isOpen }) => ($isOpen ? 1 : 0.9)});
  width: 90vw;
  max-width: 600px;
  max-height: 90vh;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  z-index: ${({ theme }) => theme.zIndex.modal};
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition: all 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[5]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const ModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const ProductNameBadge = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.neutral[100]};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ModalBody = styled.div`
  padding: ${({ theme }) => theme.spacing[5]};
  overflow-y: auto;
  flex: 1;
`;

const TypeSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[5]};

  @media (min-width: 640px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const TypeButton = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[3]};
  border: 2px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.primary[500] : theme.colors.border.light};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.primary[50] : 'transparent'};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary[700] : theme.colors.text.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary[500]};
    background: ${({ theme }) => theme.colors.primary[50]};
    color: ${({ theme }) => theme.colors.primary[700]};
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]};
  border: 1px solid
    ${({ theme, $hasError }) =>
      $hasError ? theme.colors.semantic.error.main : theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.background.paper};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.semantic.error.main : theme.colors.primary[500]};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.hint};
  }
`;

const Textarea = styled.textarea<{ $hasError?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]};
  border: 1px solid
    ${({ theme, $hasError }) =>
      $hasError ? theme.colors.semantic.error.main : theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.background.paper};
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.semantic.error.main : theme.colors.primary[500]};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.hint};
  }
`;

const ErrorMessage = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.semantic.error.main};
`;

const HelpText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[5]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const InfoBox = styled.div`
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.semantic.info.light};
  border: 1px solid ${({ theme }) => theme.colors.semantic.info.main};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  color: ${({ theme }) => theme.colors.semantic.info.dark};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const InputWithButton = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ScanButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: 0 ${({ theme }) => theme.spacing[4]};
  height: 44px;
  background: ${({ theme }) => theme.colors.primary[500]};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.button};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.primary[600]};
  }

  &:active {
    transform: scale(0.98);
  }

  svg {
    font-size: 18px;
  }
`;

export const ContributeDataModal: React.FC<ContributeDataModalProps> = ({
  open,
  onClose,
  productId,
  productName,
}) => {
  const { user } = useAuthStore();
  const { submitContribution, isLoading } = useContributionsStore();

  // State
  const [selectedType, setSelectedType] = useState<ContributionType>('barcode');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Form state for each type
  const [barcodeData, setBarcodeData] = useState<BarcodeContributionData>({
    barcode: '',
  });

  const [imageData, setImageData] = useState<ImageContributionData>({
    imageUrl: '',
  });

  const [priceData, setPriceData] = useState<PriceContributionData>({
    value: 0,
    storeId: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [infoData, setInfoData] = useState<InfoContributionData>({
    brand: '',
    description: '',
    category: '',
    manufacturer: '',
    weight: '',
    volume: '',
  });

  // Handle barcode scan
  const handleBarcodeDetected = (code: string) => {
    setBarcodeData({ barcode: code });
    setIsScannerOpen(false);
  };

  // Reset form when modal opens/closes
  const handleClose = () => {
    setBarcodeData({ barcode: '' });
    setImageData({ imageUrl: '' });
    setPriceData({ value: 0, storeId: '', date: new Date().toISOString().split('T')[0] });
    setInfoData({
      brand: '',
      description: '',
      category: '',
      manufacturer: '',
      weight: '',
      volume: '',
    });
    setErrors({});
    setIsScannerOpen(false);
    onClose();
  };

  // Validate current form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (selectedType) {
      case 'barcode':
        if (!barcodeData.barcode.trim()) {
          newErrors.barcode = 'El código de barras es requerido';
        } else if (!isValidBarcode(barcodeData.barcode)) {
          newErrors.barcode = 'El código de barras debe tener entre 8 y 14 dígitos';
        }
        break;

      case 'image':
        if (!imageData.imageUrl.trim()) {
          newErrors.imageUrl = 'La URL de la imagen es requerida';
        } else if (!isValidImageUrl(imageData.imageUrl)) {
          newErrors.imageUrl = 'La URL no es válida (debe comenzar con http:// o https://)';
        }
        break;

      case 'price':
        if (!priceData.storeId.trim()) {
          newErrors.storeId = 'La tienda es requerida';
        }
        if (priceData.value <= 0) {
          newErrors.value = 'El precio debe ser mayor a 0';
        } else if (!isValidPrice(priceData.value)) {
          newErrors.value = 'El precio no es válido';
        }
        if (!priceData.date) {
          newErrors.date = 'La fecha es requerida';
        }
        break;

      case 'info':
        // At least one field must be filled
        const hasAtLeastOneField = Object.values(infoData).some((value) => value?.trim());
        if (!hasAtLeastOneField) {
          newErrors.info = 'Debes completar al menos un campo de información';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!user) {
      return;
    }

    if (!validate()) {
      return;
    }

    let data:
      | BarcodeContributionData
      | ImageContributionData
      | PriceContributionData
      | InfoContributionData;

    switch (selectedType) {
      case 'barcode':
        data = barcodeData;
        break;
      case 'image':
        data = imageData;
        break;
      case 'price':
        data = priceData;
        break;
      case 'info':
        data = infoData;
        break;
    }

    const result = await submitContribution({
      productId,
      contributionType: selectedType,
      data,
    });

    if (result) {
      handleClose();
    }
  };

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <>
      <Overlay $isOpen={open} onClick={handleClose} />
      <ModalContainer $isOpen={open}>
        <ModalHeader>
          <div>
            <ModalTitle>Contribuir con Datos</ModalTitle>
            <ProductNameBadge>{productName}</ProductNameBadge>
          </div>
          <CloseButton onClick={handleClose} aria-label="Cerrar modal">
            <HiX />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <InfoBox>
            💡 Tu contribución será revisada por nuestro equipo antes de ser publicada. Gracias
            por ayudar a mejorar la información de productos en Prexiopá.
          </InfoBox>

          {/* Type Selector */}
          <TypeSelector>
            <TypeButton
              type="button"
              $active={selectedType === 'barcode'}
              onClick={() => setSelectedType('barcode')}
            >
              <FiHash />
              Código
            </TypeButton>
            <TypeButton
              type="button"
              $active={selectedType === 'image'}
              onClick={() => setSelectedType('image')}
            >
              <HiCamera />
              Imagen
            </TypeButton>
            <TypeButton
              type="button"
              $active={selectedType === 'price'}
              onClick={() => setSelectedType('price')}
            >
              <HiCash />
              Precio
            </TypeButton>
            <TypeButton
              type="button"
              $active={selectedType === 'info'}
              onClick={() => setSelectedType('info')}
            >
              <HiInformationCircle />
              Info
            </TypeButton>
          </TypeSelector>

          {/* Form Fields */}
          <FormSection>
            {selectedType === 'barcode' && (
              <FormField>
                <Label htmlFor="barcode">Código de Barras *</Label>
                <InputWithButton>
                  <Input
                    id="barcode"
                    type="text"
                    placeholder="7501234567890"
                    value={barcodeData.barcode}
                    onChange={(e) => setBarcodeData({ barcode: e.target.value })}
                    $hasError={!!errors.barcode}
                  />
                  <ScanButton
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    aria-label="Escanear código de barras"
                  >
                    <HiCamera />
                    Escanear
                  </ScanButton>
                </InputWithButton>
                {errors.barcode && <ErrorMessage>{errors.barcode}</ErrorMessage>}
                <HelpText>Ingresa o escanea el código EAN-13, UPC u otro código de barras válido</HelpText>
              </FormField>
            )}

            {selectedType === 'image' && (
              <FormField>
                <Label htmlFor="imageUrl">URL de la Imagen *</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://ejemplo.com/producto.jpg"
                  value={imageData.imageUrl}
                  onChange={(e) => setImageData({ imageUrl: e.target.value })}
                  $hasError={!!errors.imageUrl}
                />
                {errors.imageUrl && <ErrorMessage>{errors.imageUrl}</ErrorMessage>}
                <HelpText>
                  Proporciona una URL de imagen del producto (debe ser un enlace directo a la
                  imagen)
                </HelpText>
              </FormField>
            )}

            {selectedType === 'price' && (
              <>
                <FormField>
                  <Label htmlFor="storeId">Tienda *</Label>
                  <Input
                    id="storeId"
                    type="text"
                    placeholder="ID de la tienda"
                    value={priceData.storeId}
                    onChange={(e) => setPriceData({ ...priceData, storeId: e.target.value })}
                    $hasError={!!errors.storeId}
                  />
                  {errors.storeId && <ErrorMessage>{errors.storeId}</ErrorMessage>}
                  <HelpText>Selecciona la tienda donde encontraste el precio</HelpText>
                </FormField>

                <FormField>
                  <Label htmlFor="price">Precio *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={priceData.value || ''}
                    onChange={(e) =>
                      setPriceData({ ...priceData, value: parseFloat(e.target.value) || 0 })
                    }
                    $hasError={!!errors.value}
                  />
                  {errors.value && <ErrorMessage>{errors.value}</ErrorMessage>}
                  <HelpText>Ingresa el precio exacto que viste en la tienda</HelpText>
                </FormField>

                <FormField>
                  <Label htmlFor="date">Fecha *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={priceData.date}
                    onChange={(e) => setPriceData({ ...priceData, date: e.target.value })}
                    $hasError={!!errors.date}
                  />
                  {errors.date && <ErrorMessage>{errors.date}</ErrorMessage>}
                  <HelpText>¿Cuándo viste este precio?</HelpText>
                </FormField>
              </>
            )}

            {selectedType === 'info' && (
              <>
                {errors.info && <ErrorMessage>{errors.info}</ErrorMessage>}
                <FormField>
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    type="text"
                    placeholder="Ej: Coca-Cola"
                    value={infoData.brand}
                    onChange={(e) => setInfoData({ ...infoData, brand: e.target.value })}
                  />
                </FormField>

                <FormField>
                  <Label htmlFor="category">Categoría</Label>
                  <Input
                    id="category"
                    type="text"
                    placeholder="Ej: Bebidas"
                    value={infoData.category}
                    onChange={(e) => setInfoData({ ...infoData, category: e.target.value })}
                  />
                </FormField>

                <FormField>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe el producto con más detalle..."
                    value={infoData.description}
                    onChange={(e) => setInfoData({ ...infoData, description: e.target.value })}
                  />
                </FormField>

                <FormField>
                  <Label htmlFor="manufacturer">Fabricante</Label>
                  <Input
                    id="manufacturer"
                    type="text"
                    placeholder="Ej: The Coca-Cola Company"
                    value={infoData.manufacturer}
                    onChange={(e) => setInfoData({ ...infoData, manufacturer: e.target.value })}
                  />
                </FormField>

                <FormField>
                  <Label htmlFor="weight">Peso</Label>
                  <Input
                    id="weight"
                    type="text"
                    placeholder="Ej: 500g"
                    value={infoData.weight}
                    onChange={(e) => setInfoData({ ...infoData, weight: e.target.value })}
                  />
                </FormField>

                <FormField>
                  <Label htmlFor="volume">Volumen</Label>
                  <Input
                    id="volume"
                    type="text"
                    placeholder="Ej: 355ml"
                    value={infoData.volume}
                    onChange={(e) => setInfoData({ ...infoData, volume: e.target.value })}
                  />
                </FormField>
              </>
            )}
          </FormSection>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={isLoading}>
            Enviar Contribución
          </Button>
        </ModalFooter>
      </ModalContainer>

      {/* Barcode Scanner */}
      {isScannerOpen && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </>
  );
};
