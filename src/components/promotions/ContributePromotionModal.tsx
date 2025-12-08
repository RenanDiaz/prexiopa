/**
 * ContributePromotionModal Component
 *
 * Modal para permitir a usuarios contribuir promociones de productos.
 * Soporta los 7 tipos de promociones:
 * - percentage: Descuento porcentual (15% OFF)
 * - fixed_amount: Precio especial ($6.99 a $4.99)
 * - buy_x_get_y: Lleva X, paga Y (3x2, 2x1)
 * - bulk_price: Precio por volumen (Ahorra 4)
 * - bundle_free: Producto gratis al comprar
 * - coupon: Requiere cupón
 * - loyalty: Requiere cartilla/stickers
 */

import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { FiX, FiPercent, FiDollarSign, FiGift, FiTag, FiShoppingBag, FiAlertCircle } from 'react-icons/fi';
import { Button } from '@/components/common';
import { useCreatePromotion } from '@/hooks/usePromotions';
import { useStoresQuery } from '@/hooks/useStores';
import type {
  PromotionType,
  PercentageDetails,
  FixedAmountDetails,
  BuyXGetYDetails,
  BulkPriceDetails,
  CouponDetails,
  LoyaltyDetails,
  CreatePromotionInput,
} from '@/types/promotion';
import {
  PROMOTION_TYPE_LABELS,
  PROMOTION_TYPE_DESCRIPTIONS,
} from '@/types/promotion';

// =====================================================
// TYPES
// =====================================================

interface ContributePromotionModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

// =====================================================
// STYLED COMPONENTS
// =====================================================

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
  max-width: 500px;
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
  align-items: flex-start;
  padding: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const ModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const ProductName = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: ${({ theme }) => theme.spacing[1]} 0 0 0;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing[4]};
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[4]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const FormSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const Label = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  background: ${({ theme }) => theme.colors.background.default};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[500]};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.hint};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  background: ${({ theme }) => theme.colors.background.default};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing[2]};

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`;

const TypeButton = styled.button<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: ${({ theme }) => theme.spacing[3]};
  border: 2px solid ${({ theme, $selected }) =>
    $selected ? theme.colors.primary[500] : theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  background: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary[50] : theme.colors.background.default};
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary[400]};
  }

  svg {
    color: ${({ theme, $selected }) =>
      $selected ? theme.colors.primary[600] : theme.colors.text.secondary};
    margin-bottom: ${({ theme }) => theme.spacing[1]};
  }
`;

const TypeLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TypeDescription = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};

  > * {
    flex: 1;
  }
`;

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;

  input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const WarningBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[3]};
  background: #FFF8E1;
  border: 1px solid #FFE082;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  margin-bottom: ${({ theme }) => theme.spacing[4]};

  svg {
    color: #F57C00;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const WarningText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: #E65100;
  margin: 0;
`;

// =====================================================
// COMPONENT
// =====================================================

export const ContributePromotionModal: React.FC<ContributePromotionModalProps> = ({
  open,
  onClose,
  productId,
  productName,
}) => {
  // State
  const [promotionType, setPromotionType] = useState<PromotionType>('percentage');
  const [storeName, setStoreName] = useState('');
  const [storeId, setStoreId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isIndefinite, setIsIndefinite] = useState(false);

  // Type-specific state
  const [discountPercent, setDiscountPercent] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [promoPrice, setPromoPrice] = useState('');
  const [buyQuantity, setBuyQuantity] = useState('');
  const [payQuantity, setPayQuantity] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [regularPrice, setRegularPrice] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [stickersRequired, setStickersRequired] = useState('');

  // Queries & Mutations
  const { data: stores = [] } = useStoresQuery();
  const createPromotion = useCreatePromotion();

  // Get type icon
  const getTypeIcon = (type: PromotionType) => {
    switch (type) {
      case 'percentage':
        return <FiPercent size={20} />;
      case 'fixed_amount':
        return <FiDollarSign size={20} />;
      case 'buy_x_get_y':
        return <FiShoppingBag size={20} />;
      case 'bulk_price':
        return <FiTag size={20} />;
      case 'bundle_free':
        return <FiGift size={20} />;
      case 'coupon':
        return <FiTag size={20} />;
      case 'loyalty':
        return <FiGift size={20} />;
      default:
        return <FiPercent size={20} />;
    }
  };

  // Build promotion details based on type
  const buildDetails = (): PercentageDetails | FixedAmountDetails | BuyXGetYDetails | BulkPriceDetails | CouponDetails | LoyaltyDetails => {
    switch (promotionType) {
      case 'percentage':
        return { discount_percent: parseFloat(discountPercent) || 0 };

      case 'fixed_amount':
        return {
          original_price: parseFloat(originalPrice) || undefined,
          promo_price: parseFloat(promoPrice) || undefined,
        };

      case 'buy_x_get_y': {
        const buy = parseInt(buyQuantity) || 2;
        const pay = parseInt(payQuantity) || 1;
        return {
          buy_quantity: buy,
          get_quantity: buy - pay, // e.g., buy 3, pay 2 -> get 1 free
          pay_quantity: pay,
        };
      }

      case 'bulk_price':
        return {
          min_quantity: parseInt(minQuantity) || 4,
          unit_price: parseFloat(unitPrice) || 0,
          regular_price: parseFloat(regularPrice) || 0,
        };

      case 'coupon':
        return {
          coupon_code: couponCode,
          discount_percent: parseFloat(discountPercent) || undefined,
        };

      case 'loyalty':
        return {
          stickers_required: parseInt(stickersRequired) || undefined,
          discount_percent: parseFloat(discountPercent) || undefined,
        };

      default:
        return { discount_percent: 0 };
    }
  };

  // Generate promotion name
  const generateName = (): string => {
    switch (promotionType) {
      case 'percentage':
        return `${discountPercent}% de descuento`;
      case 'fixed_amount':
        return promoPrice ? `Precio especial $${promoPrice}` : 'Precio especial';
      case 'buy_x_get_y':
        return `${buyQuantity || 3}x${payQuantity || 2}`;
      case 'bulk_price':
        return `Lleva ${minQuantity || 4}+ a $${unitPrice} c/u`;
      case 'coupon':
        return `Cupón: ${couponCode}`;
      case 'loyalty':
        return `${stickersRequired} stickers`;
      default:
        return 'Promoción';
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    const input: CreatePromotionInput = {
      name: generateName(),
      description: undefined,
      promotion_type: promotionType,
      store_id: storeId || undefined,
      store_name: storeName || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      is_indefinite: isIndefinite,
      details: buildDetails(),
      product_ids: [productId],
    };

    try {
      await createPromotion.mutateAsync(input);
      handleClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Reset form and close
  const handleClose = useCallback(() => {
    setPromotionType('percentage');
    setStoreName('');
    setStoreId('');
    setStartDate('');
    setEndDate('');
    setIsIndefinite(false);
    setDiscountPercent('');
    setOriginalPrice('');
    setPromoPrice('');
    setBuyQuantity('');
    setPayQuantity('');
    setMinQuantity('');
    setUnitPrice('');
    setRegularPrice('');
    setCouponCode('');
    setStickersRequired('');
    onClose();
  }, [onClose]);

  // Handle store selection
  const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setStoreId(selectedId);
    const store = stores.find((s) => s.id === selectedId);
    setStoreName(store?.name || '');
  };

  // Validate form
  const isValid = (): boolean => {
    if (!storeId) return false;

    switch (promotionType) {
      case 'percentage':
        return !!discountPercent && parseFloat(discountPercent) > 0;
      case 'fixed_amount':
        return !!promoPrice && parseFloat(promoPrice) > 0;
      case 'buy_x_get_y':
        return !!buyQuantity && !!payQuantity;
      case 'bulk_price':
        return !!minQuantity && !!unitPrice && !!regularPrice;
      case 'coupon':
        return !!couponCode;
      case 'loyalty':
        return !!stickersRequired || !!discountPercent;
      default:
        return false;
    }
  };

  // Render type-specific fields
  const renderTypeFields = () => {
    switch (promotionType) {
      case 'percentage':
        return (
          <FormSection>
            <Label>Porcentaje de descuento</Label>
            <Input
              type="number"
              placeholder="Ej: 15"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              min="1"
              max="100"
            />
          </FormSection>
        );

      case 'fixed_amount':
        return (
          <Row>
            <FormSection>
              <Label>Precio original (opcional)</Label>
              <Input
                type="number"
                placeholder="Ej: 6.99"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                step="0.01"
                min="0"
              />
            </FormSection>
            <FormSection>
              <Label>Precio promoción</Label>
              <Input
                type="number"
                placeholder="Ej: 4.99"
                value={promoPrice}
                onChange={(e) => setPromoPrice(e.target.value)}
                step="0.01"
                min="0"
              />
            </FormSection>
          </Row>
        );

      case 'buy_x_get_y':
        return (
          <Row>
            <FormSection>
              <Label>Llevas (total)</Label>
              <Input
                type="number"
                placeholder="Ej: 3"
                value={buyQuantity}
                onChange={(e) => setBuyQuantity(e.target.value)}
                min="2"
              />
            </FormSection>
            <FormSection>
              <Label>Pagas</Label>
              <Input
                type="number"
                placeholder="Ej: 2"
                value={payQuantity}
                onChange={(e) => setPayQuantity(e.target.value)}
                min="1"
              />
            </FormSection>
          </Row>
        );

      case 'bulk_price':
        return (
          <>
            <FormSection>
              <Label>Cantidad mínima</Label>
              <Input
                type="number"
                placeholder="Ej: 4"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                min="2"
              />
            </FormSection>
            <Row>
              <FormSection>
                <Label>Precio regular (c/u)</Label>
                <Input
                  type="number"
                  placeholder="Ej: 0.80"
                  value={regularPrice}
                  onChange={(e) => setRegularPrice(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </FormSection>
              <FormSection>
                <Label>Precio promoción (c/u)</Label>
                <Input
                  type="number"
                  placeholder="Ej: 0.76"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </FormSection>
            </Row>
          </>
        );

      case 'coupon':
        return (
          <>
            <FormSection>
              <Label>Código del cupón</Label>
              <Input
                type="text"
                placeholder="Ej: VERANO20"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              />
            </FormSection>
            <FormSection>
              <Label>Descuento (%)</Label>
              <Input
                type="number"
                placeholder="Ej: 20"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                min="1"
                max="100"
              />
            </FormSection>
          </>
        );

      case 'loyalty':
        return (
          <>
            <FormSection>
              <Label>Stickers requeridos (opcional)</Label>
              <Input
                type="number"
                placeholder="Ej: 10"
                value={stickersRequired}
                onChange={(e) => setStickersRequired(e.target.value)}
                min="1"
              />
            </FormSection>
            <FormSection>
              <Label>Descuento (%)</Label>
              <Input
                type="number"
                placeholder="Ej: 50"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                min="1"
                max="100"
              />
            </FormSection>
          </>
        );

      default:
        return null;
    }
  };

  // Filtrar solo los tipos principales (excluir bundle_free por complejidad)
  const mainTypes: PromotionType[] = [
    'percentage',
    'fixed_amount',
    'buy_x_get_y',
    'bulk_price',
    'coupon',
    'loyalty',
  ];

  return (
    <>
      <Overlay $isOpen={open} onClick={handleClose} />
      <ModalContainer $isOpen={open}>
        <ModalHeader>
          <HeaderContent>
            <ModalTitle>Agregar Promoción</ModalTitle>
            <ProductName>{productName}</ProductName>
          </HeaderContent>
          <CloseButton onClick={handleClose}>
            <FiX size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <WarningBox>
            <FiAlertCircle size={18} />
            <WarningText>
              Las promociones se muestran sin verificar hasta que un moderador las apruebe o 3 usuarios las confirmen.
            </WarningText>
          </WarningBox>

          {/* Promotion Type Selection */}
          <FormSection>
            <Label>Tipo de promoción</Label>
            <TypeGrid>
              {mainTypes.map((type) => (
                <TypeButton
                  key={type}
                  $selected={promotionType === type}
                  onClick={() => setPromotionType(type)}
                  type="button"
                >
                  {getTypeIcon(type)}
                  <TypeLabel>{PROMOTION_TYPE_LABELS[type]}</TypeLabel>
                  <TypeDescription>{PROMOTION_TYPE_DESCRIPTIONS[type]}</TypeDescription>
                </TypeButton>
              ))}
            </TypeGrid>
          </FormSection>

          {/* Store Selection */}
          <FormSection>
            <Label>Tienda</Label>
            <Select value={storeId} onChange={handleStoreChange}>
              <option value="">Selecciona una tienda</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </Select>
          </FormSection>

          {/* Type-specific fields */}
          {renderTypeFields()}

          {/* Date range */}
          <FormSection>
            <Checkbox>
              <input
                type="checkbox"
                checked={isIndefinite}
                onChange={(e) => setIsIndefinite(e.target.checked)}
              />
              No sé las fechas / Es permanente
            </Checkbox>
          </FormSection>

          {!isIndefinite && (
            <Row>
              <FormSection>
                <Label>Fecha inicio (opcional)</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </FormSection>
              <FormSection>
                <Label>Fecha fin (opcional)</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </FormSection>
            </Row>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={createPromotion.isPending}
            disabled={!isValid()}
          >
            Agregar Promoción
          </Button>
        </ModalFooter>
      </ModalContainer>
    </>
  );
};

export default ContributePromotionModal;
