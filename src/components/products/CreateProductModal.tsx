/**
 * CreateProductModal Component
 * Modal para crear un nuevo producto cuando se escanea un código de barras que no existe
 */

import { useState, useEffect } from "react";
import styled from "styled-components";
import { FiPackage, FiCheckCircle } from "react-icons/fi";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { getProductByBarcode } from "@/services/supabase/products";
import type { Product, ProductUnit } from "@/types/product.types";
import { UNIT_NAMES, formatProductMeasurement } from "@/types/product.types";

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const BarcodeDisplay = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border: 2px dashed ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing[4]};
  text-align: center;
`;

const BarcodeLabel = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing[2]} 0;
`;

const BarcodeValue = styled.code`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary[500]};
  font-family: "Monaco", "Courier New", monospace;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const HelpText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const Select = styled.select`
  width: 100%;
  height: 44px;
  padding: 0 ${({ theme }) => theme.spacing[3]};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.background.default};
  border: 2px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.button};
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary[400]};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary[100]};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.neutral[100]};
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-top: ${({ theme }) => theme.spacing[2]};

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const InfoBox = styled.div`
  background: ${({ theme }) => theme.colors.semantic.info.light};
  border-left: 4px solid ${({ theme }) => theme.colors.semantic.info.main};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing[4]};
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const InfoIcon = styled.div`
  color: ${({ theme }) => theme.colors.semantic.info.main};
  font-size: 24px;
  flex-shrink: 0;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.semantic.info.dark};
  margin: 0 0 ${({ theme }) => theme.spacing[1]} 0;
`;

const InfoText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.semantic.info.dark};
  margin: 0;
`;

export interface CreateProductModalProps {
  isOpen: boolean;
  barcode: string;
  onClose: () => void;
  onCreateProduct: (productData: {
    barcode: string;
    name: string;
    brand?: string;
    unit?: ProductUnit;
    measurement_value?: number;
  }) => void;
}

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  barcode,
  onClose,
  onCreateProduct,
}) => {
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [unit, setUnit] = useState<ProductUnit>("un");
  const [measurementValue, setMeasurementValue] = useState<string>("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingProduct, setIsCheckingProduct] = useState(true);
  const [existingProduct, setExistingProduct] = useState<Product | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedMeasurement = parseFloat(measurementValue);
      await onCreateProduct({
        barcode,
        name: productName.trim(),
        brand: brand.trim() || undefined,
        unit,
        measurement_value: isNaN(parsedMeasurement) ? 1 : parsedMeasurement,
      });

      // Reset form
      setProductName("");
      setBrand("");
      setUnit("un");
      setMeasurementValue("1");
      onClose();
    } catch (error) {
      console.error("Error creating product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setProductName("");
      setBrand("");
      setUnit("un");
      setMeasurementValue("1");
      setExistingProduct(null);
      setIsCheckingProduct(true);
      onClose();
    }
  };

  // Check if product exists when modal opens
  useEffect(() => {
    const checkProduct = async () => {
      if (isOpen && barcode) {
        setIsCheckingProduct(true);
        try {
          const product = await getProductByBarcode(barcode);
          setExistingProduct(product);
        } catch (error) {
          console.error("Error checking product:", error);
          setExistingProduct(null);
        } finally {
          setIsCheckingProduct(false);
        }
      }
    };

    checkProduct();
  }, [isOpen, barcode]);

  return (
    <Modal open={isOpen} onClose={handleClose} size="md">
      <Modal.Header>
        {isCheckingProduct ? "Verificando producto..." : existingProduct ? "Producto encontrado" : "Producto no encontrado"}
      </Modal.Header>

      <Modal.Body>
        <ModalContent>
          {isCheckingProduct ? (
            // Loading state
            <InfoBox>
              <InfoIcon>
                <FiPackage />
              </InfoIcon>
              <InfoContent>
                <InfoTitle>Verificando código de barras</InfoTitle>
                <InfoText>Buscando el producto en nuestra base de datos...</InfoText>
              </InfoContent>
            </InfoBox>
          ) : existingProduct ? (
            // Product exists
            <>
              <InfoBox style={{ background: "rgba(0, 200, 83, 0.1)", borderLeftColor: "#00C853" }}>
                <InfoIcon style={{ color: "#00C853" }}>
                  <FiCheckCircle />
                </InfoIcon>
                <InfoContent>
                  <InfoTitle style={{ color: "#00C853" }}>¡Producto encontrado!</InfoTitle>
                  <InfoText style={{ color: "#00693B" }}>
                    Este producto ya existe en nuestra base de datos.
                  </InfoText>
                </InfoContent>
              </InfoBox>

              <BarcodeDisplay>
                <BarcodeLabel>Código de barras</BarcodeLabel>
                <BarcodeValue>{barcode}</BarcodeValue>
              </BarcodeDisplay>

              <FormGroup>
                <Label>Nombre del producto</Label>
                <Input value={existingProduct.name} disabled />
              </FormGroup>

              {existingProduct.brand && (
                <FormGroup>
                  <Label>Marca</Label>
                  <Input value={existingProduct.brand} disabled />
                </FormGroup>
              )}

              {existingProduct.unit && existingProduct.measurement_value && (
                <FormGroup>
                  <Label>Presentación</Label>
                  <Input
                    value={formatProductMeasurement(existingProduct.measurement_value, existingProduct.unit) || ""}
                    disabled
                  />
                </FormGroup>
              )}

              <ButtonGroup>
                <Button type="button" variant="primary" onClick={handleClose} fullWidth>
                  Cerrar
                </Button>
              </ButtonGroup>
            </>
          ) : (
            // Product doesn't exist - create form
            <>
              <InfoBox>
                <InfoIcon>
                  <FiPackage />
                </InfoIcon>
                <InfoContent>
                  <InfoTitle>Ayúdanos a crear este producto</InfoTitle>
                  <InfoText>
                    Este código de barras no está en nuestra base de datos. Puedes agregarlo para que
                    otros usuarios también lo encuentren.
                  </InfoText>
                </InfoContent>
              </InfoBox>

              <BarcodeDisplay>
                <BarcodeLabel>Código de barras escaneado</BarcodeLabel>
                <BarcodeValue>{barcode}</BarcodeValue>
              </BarcodeDisplay>

              <form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label htmlFor="product-name">
                    Nombre del producto <span style={{ color: "red" }}>*</span>
                  </Label>
                  <Input
                    id="product-name"
                    type="text"
                    placeholder="Ej: Coca Cola 2L"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                    disabled={isSubmitting}
                    autoFocus
                  />
                  <HelpText>Ingresa el nombre completo del producto</HelpText>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="brand">Marca (opcional)</Label>
                  <Input
                    id="brand"
                    type="text"
                    placeholder="Ej: Coca Cola"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <HelpText>Ayuda a otros usuarios a encontrar productos de esta marca</HelpText>
                </FormGroup>

                <FormGroup>
                  <Label>Presentación <span style={{ color: "red" }}>*</span></Label>
                  <Row>
                    <Input
                      id="measurement-value"
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Ej: 500"
                      value={measurementValue}
                      onChange={(e) => setMeasurementValue(e.target.value)}
                      disabled={isSubmitting}
                      min="0.01"
                      step="any"
                      style={{ flex: 1 }}
                    />
                    <Select
                      id="unit"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as ProductUnit)}
                      disabled={isSubmitting}
                      style={{ flex: 1 }}
                    >
                      {Object.entries(UNIT_NAMES).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label} ({value})
                        </option>
                      ))}
                    </Select>
                  </Row>
                  <HelpText>Ej: 500g, 1L, 12 unidades</HelpText>
                </FormGroup>

                <ButtonGroup>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    fullWidth
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!productName.trim() || isSubmitting}
                    loading={isSubmitting}
                    fullWidth
                  >
                    Crear Producto
                  </Button>
                </ButtonGroup>
              </form>
            </>
          )}
        </ModalContent>
      </Modal.Body>
    </Modal>
  );
};

export default CreateProductModal;
