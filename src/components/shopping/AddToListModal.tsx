/**
 * AddToListModal Component
 *
 * Modal para agregar productos a la lista de compras con verificación de precio.
 * Permite a los usuarios:
 * - Ingresar/verificar el precio del producto
 * - Seleccionar la tienda
 * - Ajustar la cantidad
 * - Opcionalmente contribuir el precio para otros usuarios
 */

import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FiShoppingCart, FiDollarSign, FiPackage, FiAlertCircle } from 'react-icons/fi';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { PriceInput } from '@/components/common/PriceInput';
import { Button } from '@/components/common/Button';
import type { Product } from '@/types/product.types';
import productPlaceholder from '@/assets/images/product-placeholder.svg';
import { formatProductMeasurement } from '@/types/product.types';

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[5]};
`;

const ProductPreview = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  align-items: center;
`;

const ProductImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  background: ${({ theme }) => theme.colors.background.paper};
  flex-shrink: 0;
`;

const ProductInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProductName = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing[1]} 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProductMeta = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
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
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};

  svg {
    color: ${({ theme }) => theme.colors.primary[500]};
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
    opacity: 0.6;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing[3]};

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const CheckboxWrapper = styled.label`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.neutral[100]};
  }
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
`;

const CheckboxLabel = styled.div`
  flex: 1;
`;

const CheckboxTitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing[1]} 0;
`;

const CheckboxDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  line-height: 1.4;
`;

const PriceHint = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.semantic.info.light};
  border-left: 3px solid ${({ theme }) => theme.colors.semantic.info.main};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.semantic.info.dark};

  svg {
    flex-shrink: 0;
    color: ${({ theme }) => theme.colors.semantic.info.main};
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

const HelpText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: ${({ theme }) => theme.spacing[1]} 0 0 0;
`;


export interface Store {
  id: string;
  name: string;
}

export interface AddToListModalProps {
  isOpen: boolean;
  product: Product;
  stores: Store[];
  onClose: () => void;
  onAdd: (data: {
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
    store_id: string;
    store_name: string;
    savePrice: boolean;
  }) => void;
  isSubmitting?: boolean;
  /** If provided, the store selector will be locked to this store (from active session) */
  sessionStoreId?: string | null;
  sessionStoreName?: string | null;
}

export const AddToListModal: React.FC<AddToListModalProps> = ({
  isOpen,
  product,
  stores,
  onClose,
  onAdd,
  isSubmitting = false,
  sessionStoreId = null,
  sessionStoreName = null,
}) => {
  // Form state
  const [price, setPrice] = useState(0); // Store price in dollars
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [savePrice, setSavePrice] = useState(true);

  // Ref for price input
  const priceInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with product data
  useEffect(() => {
    if (isOpen) {
      // Pre-fill price if available
      if (product.lowest_price) {
        setPrice(product.lowest_price);
      } else {
        setPrice(0);
      }

      // Pre-select store based on priority:
      // 1. Session store (from active shopping session)
      // 2. Product's lowest price store
      // 3. First available store
      if (sessionStoreId) {
        // Lock to session's store
        setSelectedStoreId(sessionStoreId);
      } else if (product.store_with_lowest_price?.id) {
        setSelectedStoreId(product.store_with_lowest_price.id);
      } else if (stores.length > 0) {
        setSelectedStoreId(stores[0].id);
      }

      // Reset quantity
      setQuantity('1');

      // Check savePrice by default
      setSavePrice(true);

      // Focus price input after modal opens
      setTimeout(() => {
        priceInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, product, stores, sessionStoreId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const quantityValue = parseInt(quantity, 10);
    const selectedStore = stores.find((s) => s.id === selectedStoreId);

    if (!price || price <= 0) {
      return;
    }

    if (!quantityValue || quantityValue <= 0) {
      return;
    }

    if (!selectedStore) {
      return;
    }

    onAdd({
      product_id: product.id,
      product_name: product.name,
      price: price,
      quantity: quantityValue,
      store_id: selectedStore.id,
      store_name: selectedStore.name,
      savePrice,
    });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setPrice(0);
      setSelectedStoreId('');
      setQuantity('1');
      setSavePrice(true);
      onClose();
    }
  };

  const showPriceHint = product.lowest_price && price > 0;
  const priceDifference =
    showPriceHint ? ((price - product.lowest_price!) / product.lowest_price!) * 100 : 0;
  const isSignificantDifference = Math.abs(priceDifference) > 20;

  return (
    <Modal open={isOpen} onClose={handleClose} size="md">
      <Modal.Header>
        <FiShoppingCart size={24} />
        Agregar a tu lista
      </Modal.Header>

      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <ModalContent>
            {/* Product Preview */}
            <ProductPreview>
              <ProductImage
                src={product.image || productPlaceholder}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.src = productPlaceholder;
                }}
              />
              <ProductInfo>
                <ProductName title={product.name}>{product.name}</ProductName>
                <ProductMeta>
                  {product.brand && `${product.brand} • `}
                  {product.unit && product.measurement_value
                    ? formatProductMeasurement(product.measurement_value, product.unit)
                    : product.category}
                </ProductMeta>
              </ProductInfo>
            </ProductPreview>

            <FormSection>
              {/* Price and Quantity Row */}
              <Row>
                <FormGroup>
                  <Label htmlFor="price">
                    <FiDollarSign size={16} />
                    Precio <span style={{ color: 'red' }}>*</span>
                  </Label>
                  <PriceInput
                    id="price"
                    value={price}
                    onChange={setPrice}
                    placeholder="$0.00"
                    disabled={isSubmitting}
                    autoFocus={true}
                    required={true}
                    ref={priceInputRef}
                  />
                  {product.lowest_price && (
                    <HelpText>Último precio: ${product.lowest_price.toFixed(2)}</HelpText>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="quantity">
                    <FiPackage size={16} />
                    Cantidad
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                    step="1"
                    required
                    disabled={isSubmitting}
                  />
                </FormGroup>
              </Row>

              {/* Price difference hint */}
              {isSignificantDifference && (
                <PriceHint>
                  <FiAlertCircle size={18} />
                  <span>
                    {priceDifference > 0
                      ? `Este precio es ${Math.abs(priceDifference).toFixed(0)}% más alto que el último reportado.`
                      : `Este precio es ${Math.abs(priceDifference).toFixed(0)}% más bajo que el último reportado.`}
                    {' '}¿Es correcto?
                  </span>
                </PriceHint>
              )}

              {/* Store Selector */}
              <FormGroup>
                <Label htmlFor="store">
                  Tienda {!sessionStoreId && <span style={{ color: 'red' }}>*</span>}
                  {sessionStoreId && <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: '#6B7280' }}> (bloqueada por sesión activa)</span>}
                </Label>
                <Select
                  id="store"
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  required
                  disabled={isSubmitting || stores.length === 0 || !!sessionStoreId}
                >
                  {stores.length === 0 ? (
                    <option value="">No hay tiendas disponibles</option>
                  ) : sessionStoreId ? (
                    <option value={sessionStoreId}>
                      {sessionStoreName || 'Tienda de la sesión'}
                    </option>
                  ) : (
                    <>
                      <option value="">Selecciona una tienda</option>
                      {stores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </>
                  )}
                </Select>
                {sessionStoreId && (
                  <HelpText>
                    ✓ Usando la tienda de tu lista de compras actual
                  </HelpText>
                )}
              </FormGroup>

              {/* Save Price Checkbox */}
              <CheckboxWrapper>
                <Checkbox
                  type="checkbox"
                  checked={savePrice}
                  onChange={(e) => setSavePrice(e.target.checked)}
                  disabled={isSubmitting}
                />
                <CheckboxLabel>
                  <CheckboxTitle>Guardar este precio para otros usuarios</CheckboxTitle>
                  <CheckboxDescription>
                    Ayuda a la comunidad compartiendo el precio actual. Otros usuarios podrán ver
                    precios más precisos y actualizados.
                  </CheckboxDescription>
                </CheckboxLabel>
              </CheckboxWrapper>
            </FormSection>

            {/* Action Buttons */}
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
                disabled={!price || !selectedStoreId || !quantity || isSubmitting}
                loading={isSubmitting}
                fullWidth
              >
                Agregar a lista
              </Button>
            </ButtonGroup>
          </ModalContent>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default AddToListModal;
