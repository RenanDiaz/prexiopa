/**
 * AddToListModal Component
 *
 * Modal para agregar productos a la lista de compras con verificación de precio.
 * Permite a los usuarios:
 * - Ingresar/verificar el precio del producto
 * - Seleccionar la tienda
 * - Ajustar la cantidad
 * - Seleccionar si el precio incluye ITBMS o no
 * - Seleccionar la tasa de ITBMS aplicable
 * - Opcionalmente contribuir el precio para otros usuarios
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { FiShoppingCart, FiDollarSign, FiPackage, FiAlertCircle, FiPercent, FiTag } from 'react-icons/fi';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { PriceInput } from '@/components/common/PriceInput';
import { Button } from '@/components/common/Button';
import type { Product } from '@/types/product.types';
import productPlaceholder from '@/assets/images/product-placeholder.svg';
import { formatProductMeasurement } from '@/types/product.types';
import type { TaxRateCode } from '@/types/tax';
import {
  PANAMA_TAX_RATES,
  getDefaultTaxRateForCategory,
  calculateBasePrice,
  calculateTaxAmount,
  formatCurrency,
} from '@/types/tax';
import { useProductPromotions } from '@/hooks/usePromotions';
import { calculatePromotionDiscount, formatPromotionDescription } from '@/utils/promotions';
import type { ProductPromotion } from '@/types/promotion';

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

// ITBMS Section Styles
const TaxSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const TaxSectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};

  svg {
    color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};

  @media (max-width: 480px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[2]};
  }
`;

const RadioLabel = styled.label<{ $checked?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  background: ${({ theme, $checked }) =>
    $checked ? theme.colors.primary[50] : theme.colors.background.default};
  border: 2px solid ${({ theme, $checked }) =>
    $checked ? theme.colors.primary[500] : theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary[400]};
  }

  input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  span {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const TaxRateRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TaxRateLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
`;

const TaxBreakdownBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border: 1px dashed ${({ theme }) => theme.colors.border.main};
`;

const TaxBreakdownRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};

  &:last-child {
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text.primary};
    padding-top: ${({ theme }) => theme.spacing[2]};
    border-top: 1px solid ${({ theme }) => theme.colors.border.light};
    margin-top: ${({ theme }) => theme.spacing[1]};
  }
`;

// Promotion Section Styles
const PromotionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const PromotionSectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};

  svg {
    color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

const PromotionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  max-height: 300px;
  overflow-y: auto;
`;

const PromotionChip = styled.button<{ $selected?: boolean; $verified?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary[50] : theme.colors.background.default};
  border: 2px solid ${({ theme, $selected, $verified }) =>
    $selected
      ? theme.colors.primary[500]
      : $verified
      ? '#10B981' // Green for verified
      : '#F59E0B'}; // Amber for unverified
  border-radius: ${({ theme }) => theme.borderRadius.base};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary[400]};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PromotionChipHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const PromotionChipTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const PromotionChipBadge = styled.span<{ $verified?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  background: ${({ $verified }) =>
    $verified ? '#D1FAE5' : '#FEF3C7'}; // Green/Amber light
  color: ${({ $verified }) =>
    $verified ? '#065F46' : '#92400E'}; // Green/Amber dark
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  flex-shrink: 0;
`;

const PromotionChipSaving = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: #059669; // Green 600
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

const EmptyPromotions = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
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
    // Tax fields
    taxRateCode: TaxRateCode;
    taxRate: number;
    priceIncludesTax: boolean;
    // Promotion fields
    appliedPromotionId?: string | null;
    originalPrice?: number;
    discountAmount?: number;
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

  // Tax state
  const [priceIncludesTax, setPriceIncludesTax] = useState(true);
  const [taxRateCode, setTaxRateCode] = useState<TaxRateCode>('general');
  const [taxRate, setTaxRate] = useState(7);

  // Promotion state
  const [selectedPromotion, setSelectedPromotion] = useState<ProductPromotion | null>(null);
  const [couponCode, setCouponCode] = useState('');

  // Ref for price input
  const priceInputRef = useRef<HTMLInputElement>(null);

  // Fetch active promotions for this product + store
  const { data: promotions = [], isLoading: isLoadingPromotions } = useProductPromotions(
    product.id,
    selectedStoreId || undefined,
    { enabled: !!selectedStoreId }
  );

  // Calculate promotion discount
  const promotionCalculation = useMemo(() => {
    if (!selectedPromotion || price <= 0) {
      return null;
    }

    const quantityNum = parseFloat(quantity) || 1;
    return calculatePromotionDiscount(selectedPromotion, price, quantityNum, {
      couponCode: couponCode || undefined,
      hasLoyaltyCard: false, // TODO: Implement loyalty card tracking
      hasRequiredProducts: false, // TODO: Check cart for required products
    });
  }, [selectedPromotion, price, quantity, couponCode]);

  // Calculate tax breakdown in real-time (with promotion applied)
  const taxBreakdown = useMemo(() => {
    const quantityNum = parseFloat(quantity) || 1;

    // Use discounted price if promotion is applicable
    const effectivePrice = promotionCalculation?.isApplicable
      ? promotionCalculation.finalPrice / quantityNum
      : price;

    const basePrice = calculateBasePrice(effectivePrice, taxRate, priceIncludesTax);
    const taxAmount = calculateTaxAmount(basePrice, taxRate, quantityNum);
    const subtotal = effectivePrice * quantityNum;

    return {
      basePrice,
      taxAmount,
      subtotal,
      basePriceTotal: basePrice * quantityNum,
      // Include promotion info
      originalPrice: price * quantityNum,
      discountAmount: promotionCalculation?.isApplicable ? promotionCalculation.discountAmount : 0,
    };
  }, [price, quantity, taxRate, priceIncludesTax, promotionCalculation]);

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

      // Initialize tax rate based on product category
      const defaultTaxRate = getDefaultTaxRateForCategory(product.category || '');
      setTaxRateCode(defaultTaxRate.code);
      setTaxRate(defaultTaxRate.rate);
      setPriceIncludesTax(true); // Default: price includes tax

      // Focus price input after modal opens
      setTimeout(() => {
        priceInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, product, stores, sessionStoreId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const quantityValue = parseFloat(quantity);
    const selectedStore = stores.find((s) => s.id === selectedStoreId);

    if (!price || price <= 0) {
      return;
    }

    if (!quantityValue || quantityValue <= 0 || isNaN(quantityValue)) {
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
      // Tax fields
      taxRateCode,
      taxRate,
      priceIncludesTax,
      // Promotion fields
      appliedPromotionId: selectedPromotion?.id || null,
      originalPrice: promotionCalculation?.isApplicable ? promotionCalculation.originalPrice : undefined,
      discountAmount: promotionCalculation?.isApplicable ? promotionCalculation.discountAmount : undefined,
    });
  };

  // Handle tax rate change from selector
  const handleTaxRateChange = (code: TaxRateCode) => {
    setTaxRateCode(code);
    const selectedRate = PANAMA_TAX_RATES.find((r) => r.code === code);
    if (selectedRate) {
      setTaxRate(selectedRate.rate);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setPrice(0);
      setSelectedStoreId('');
      setQuantity('1');
      setSavePrice(true);
      // Reset tax fields
      setPriceIncludesTax(true);
      setTaxRateCode('general');
      setTaxRate(7);
      // Reset promotion fields
      setSelectedPromotion(null);
      setCouponCode('');
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
                    min="0.001"
                    step="0.001"
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
                      ? `Este precio es ${Math.abs(priceDifference).toFixed(0)}% mas alto que el ultimo reportado.`
                      : `Este precio es ${Math.abs(priceDifference).toFixed(0)}% mas bajo que el ultimo reportado.`}
                    {' '}Es correcto?
                  </span>
                </PriceHint>
              )}

              {/* ITBMS Section */}
              <TaxSection>
                <TaxSectionTitle>
                  <FiPercent size={16} />
                  ITBMS (Impuesto)
                </TaxSectionTitle>

                {/* Price includes tax toggle */}
                <RadioGroup>
                  <RadioLabel $checked={priceIncludesTax}>
                    <input
                      type="radio"
                      name="priceIncludesTax"
                      checked={priceIncludesTax}
                      onChange={() => setPriceIncludesTax(true)}
                      disabled={isSubmitting}
                    />
                    <span>Precio incluye ITBMS</span>
                  </RadioLabel>
                  <RadioLabel $checked={!priceIncludesTax}>
                    <input
                      type="radio"
                      name="priceIncludesTax"
                      checked={!priceIncludesTax}
                      onChange={() => setPriceIncludesTax(false)}
                      disabled={isSubmitting}
                    />
                    <span>Precio sin ITBMS</span>
                  </RadioLabel>
                </RadioGroup>

                {/* Tax rate selector */}
                <TaxRateRow>
                  <TaxRateLabel>Tasa de ITBMS:</TaxRateLabel>
                  <Select
                    value={taxRateCode}
                    onChange={(e) => handleTaxRateChange(e.target.value as TaxRateCode)}
                    disabled={isSubmitting}
                    style={{ flex: 1 }}
                  >
                    {PANAMA_TAX_RATES.map((rate) => (
                      <option key={rate.code} value={rate.code}>
                        {rate.label}
                      </option>
                    ))}
                  </Select>
                </TaxRateRow>

                {/* Tax breakdown preview */}
                {price > 0 && (
                  <TaxBreakdownBox>
                    <TaxBreakdownRow>
                      <span>Precio base (sin ITBMS):</span>
                      <span>{formatCurrency(taxBreakdown.basePrice)}</span>
                    </TaxBreakdownRow>
                    <TaxBreakdownRow>
                      <span>ITBMS ({taxRate}%):</span>
                      <span>{formatCurrency(taxBreakdown.taxAmount)}</span>
                    </TaxBreakdownRow>
                    <TaxBreakdownRow>
                      <span>Subtotal ({quantity} x {formatCurrency(price)}):</span>
                      <span>{formatCurrency(taxBreakdown.subtotal)}</span>
                    </TaxBreakdownRow>
                  </TaxBreakdownBox>
                )}
              </TaxSection>

              {/* Promotions Section */}
              {selectedStoreId && price > 0 && (
                <PromotionSection>
                  <PromotionSectionTitle>
                    <FiTag size={16} />
                    Descuentos y Promociones (Opcional)
                  </PromotionSectionTitle>

                  {isLoadingPromotions ? (
                    <EmptyPromotions>Buscando promociones...</EmptyPromotions>
                  ) : promotions.length === 0 ? (
                    <EmptyPromotions>
                      No hay promociones activas para este producto en esta tienda
                    </EmptyPromotions>
                  ) : (
                    <PromotionsList>
                      {promotions.map((promo) => {
                        const calculation = calculatePromotionDiscount(
                          promo,
                          price,
                          parseFloat(quantity) || 1
                        );

                        return (
                          <PromotionChip
                            key={promo.id}
                            type="button"
                            $selected={selectedPromotion?.id === promo.id}
                            $verified={promo.status === 'verified'}
                            onClick={() => {
                              if (selectedPromotion?.id === promo.id) {
                                setSelectedPromotion(null);
                              } else {
                                setSelectedPromotion(promo);
                              }
                            }}
                            disabled={!calculation.isApplicable}
                          >
                            <PromotionChipHeader>
                              <PromotionChipTitle>
                                {formatPromotionDescription(promo)}
                              </PromotionChipTitle>
                              <PromotionChipBadge $verified={promo.status === 'verified'}>
                                {promo.status === 'verified' ? '✓ Verificada' : '⚠ No verificada'}
                              </PromotionChipBadge>
                            </PromotionChipHeader>
                            {calculation.isApplicable && calculation.discountAmount > 0 && (
                              <PromotionChipSaving>
                                💰 Ahorras: {formatCurrency(calculation.discountAmount)} (
                                {calculation.discountPercent.toFixed(0)}% OFF)
                              </PromotionChipSaving>
                            )}
                            {!calculation.isApplicable && calculation.notApplicableReason && (
                              <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '4px' }}>
                                {calculation.notApplicableReason}
                              </div>
                            )}
                          </PromotionChip>
                        );
                      })}
                    </PromotionsList>
                  )}

                  {/* Show discount in summary */}
                  {promotionCalculation?.isApplicable && promotionCalculation.discountAmount > 0 && (
                    <TaxBreakdownBox style={{ background: '#F0FDF4', borderColor: '#86EFAC' }}>
                      <TaxBreakdownRow>
                        <span>Precio original:</span>
                        <span style={{ textDecoration: 'line-through' }}>
                          {formatCurrency(taxBreakdown.originalPrice)}
                        </span>
                      </TaxBreakdownRow>
                      <TaxBreakdownRow>
                        <span style={{ color: '#16A34A' }}>Descuento aplicado:</span>
                        <span style={{ color: '#16A34A', fontWeight: 600 }}>
                          -{formatCurrency(taxBreakdown.discountAmount)}
                        </span>
                      </TaxBreakdownRow>
                      <TaxBreakdownRow>
                        <span>Precio final:</span>
                        <span>{formatCurrency(taxBreakdown.subtotal)}</span>
                      </TaxBreakdownRow>
                    </TaxBreakdownBox>
                  )}
                </PromotionSection>
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
