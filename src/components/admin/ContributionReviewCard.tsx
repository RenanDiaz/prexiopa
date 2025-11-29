/**
 * ContributionReviewCard - Tarjeta de revisión de contribución
 * Muestra los datos de una contribución pendiente con acciones de aprobar/rechazar
 */

import styled from 'styled-components';
import { FiCheck, FiX, FiUser, FiCalendar, FiHash, FiImage, FiDollarSign, FiInfo } from 'react-icons/fi';
import { Button } from '@/components/common/Button';
import type { PendingContributionForReview } from '@/types/role';
import type {
  BarcodeContributionData,
  ImageContributionData,
  PriceContributionData,
  InfoContributionData,
} from '@/types/contribution';

interface ContributionReviewCardProps {
  contribution: PendingContributionForReview;
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
}

const Card = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[5]};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.main};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  padding-bottom: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const ProductName = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const MetaInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[4]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};

  svg {
    color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

const TypeBadge = styled.div<{ $type: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  background: ${({ theme, $type }) => {
    switch ($type) {
      case 'barcode':
        return theme.colors.primary[100];
      case 'image':
        return theme.colors.secondary[100];
      case 'price':
        return '#E8F5E9';
      case 'info':
        return '#FFF3E0';
      default:
        return theme.colors.neutral[100];
    }
  }};
  color: ${({ theme, $type }) => {
    switch ($type) {
      case 'barcode':
        return theme.colors.primary[700];
      case 'image':
        return theme.colors.secondary[700];
      case 'price':
        return '#2E7D32';
      case 'info':
        return '#E65100';
      default:
        return theme.colors.text.primary;
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};

  svg {
    font-size: 16px;
  }
`;

const CardBody = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const DataSection = styled.div`
  background: ${({ theme }) => theme.colors.background.default};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
`;

const DataLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DataValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.primary};
  word-break: break-word;
`;

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
`;

const DataItem = styled.div``;

const ImagePreview = styled.img`
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const CardFooter = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  justify-content: flex-end;
`;

const TYPE_LABELS: Record<string, string> = {
  barcode: 'Código de Barras',
  image: 'Imagen',
  price: 'Precio',
  info: 'Información',
};

const TYPE_ICONS: Record<string, React.ComponentType> = {
  barcode: FiHash,
  image: FiImage,
  price: FiDollarSign,
  info: FiInfo,
};

export const ContributionReviewCard: React.FC<ContributionReviewCardProps> = ({
  contribution,
  onApprove,
  onReject,
  isProcessing,
}) => {
  const TypeIcon = TYPE_ICONS[contribution.contributionType] || FiInfo;

  const renderContributionData = () => {
    const { contributionType, data } = contribution;

    switch (contributionType) {
      case 'barcode': {
        const barcodeData = data as BarcodeContributionData;
        return (
          <DataSection>
            <DataLabel>Código de Barras</DataLabel>
            <DataValue>{barcodeData.barcode}</DataValue>
          </DataSection>
        );
      }

      case 'image': {
        const imageData = data as ImageContributionData;
        return (
          <DataSection>
            <DataLabel>URL de Imagen</DataLabel>
            <DataValue>{imageData.imageUrl}</DataValue>
            <ImagePreview src={imageData.imageUrl} alt="Contribución de imagen" />
          </DataSection>
        );
      }

      case 'price': {
        const priceData = data as PriceContributionData;
        return (
          <DataSection>
            <DataGrid>
              <DataItem>
                <DataLabel>Precio</DataLabel>
                <DataValue>${priceData.value.toFixed(2)}</DataValue>
              </DataItem>
              <DataItem>
                <DataLabel>Tienda</DataLabel>
                <DataValue>{priceData.storeId}</DataValue>
              </DataItem>
              <DataItem>
                <DataLabel>Fecha</DataLabel>
                <DataValue>{new Date(priceData.date).toLocaleDateString('es-PA')}</DataValue>
              </DataItem>
            </DataGrid>
          </DataSection>
        );
      }

      case 'info': {
        const infoData = data as InfoContributionData;
        return (
          <DataSection>
            <DataGrid>
              {infoData.brand && (
                <DataItem>
                  <DataLabel>Marca</DataLabel>
                  <DataValue>{infoData.brand}</DataValue>
                </DataItem>
              )}
              {infoData.category && (
                <DataItem>
                  <DataLabel>Categoría</DataLabel>
                  <DataValue>{infoData.category}</DataValue>
                </DataItem>
              )}
            </DataGrid>
            {infoData.description && (
              <>
                <DataLabel style={{ marginTop: '16px' }}>Descripción</DataLabel>
                <DataValue>{infoData.description}</DataValue>
              </>
            )}
          </DataSection>
        );
      }

      default:
        return (
          <DataSection>
            <DataLabel>Datos sin formato</DataLabel>
            <DataValue>{JSON.stringify(data, null, 2)}</DataValue>
          </DataSection>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <HeaderLeft>
          <ProductName>{contribution.productName}</ProductName>
          <MetaInfo>
            <MetaItem>
              <FiUser />
              {contribution.contributorName || 'Usuario'}
            </MetaItem>
            <MetaItem>
              <FiCalendar />
              {formatDate(contribution.createdAt)}
            </MetaItem>
          </MetaInfo>
        </HeaderLeft>
        <TypeBadge $type={contribution.contributionType}>
          <TypeIcon />
          {TYPE_LABELS[contribution.contributionType]}
        </TypeBadge>
      </CardHeader>

      <CardBody>{renderContributionData()}</CardBody>

      <CardFooter>
        <Button
          variant="outline"
          iconLeft={<FiX />}
          onClick={onReject}
          disabled={isProcessing}
        >
          Rechazar
        </Button>
        <Button
          variant="primary"
          iconLeft={<FiCheck />}
          onClick={onApprove}
          loading={isProcessing}
        >
          Aprobar
        </Button>
      </CardFooter>
    </Card>
  );
};
