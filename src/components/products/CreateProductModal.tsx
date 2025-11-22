/**
 * CreateProductModal Component
 * Modal para crear un nuevo producto cuando se escanea un código de barras que no existe
 */

import { useState } from "react";
import styled from "styled-components";
import { FiPackage } from "react-icons/fi";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";

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
  onCreateProduct: (productData: { barcode: string; name: string; brand?: string }) => void;
}

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  barcode,
  onClose,
  onCreateProduct,
}) => {
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreateProduct({
        barcode,
        name: productName.trim(),
        brand: brand.trim() || undefined,
      });

      // Reset form
      setProductName("");
      setBrand("");
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
      onClose();
    }
  };

  return (
    <Modal open={isOpen} onClose={handleClose} size="md">
      <Modal.Header>Producto no encontrado</Modal.Header>

      <Modal.Body>
        <ModalContent>
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
        </ModalContent>
      </Modal.Body>
    </Modal>
  );
};

export default CreateProductModal;
