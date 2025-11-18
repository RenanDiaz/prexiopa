import styled from 'styled-components';
import { Link } from 'react-router-dom';

/**
 * Footer Styles - Prexiopá
 * Estilos completos para el footer con diseño responsive y profesional
 */

export const FooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.colors.neutral[900]};
  color: ${({ theme }) => theme.colors.neutral[200]};
  padding-top: ${({ theme }) => theme.spacing[12]};
  padding-bottom: ${({ theme }) => theme.spacing[4]};
  margin-top: auto;
  width: 100%;
`;

export const FooterContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing[4]};

  @media (min-width: 640px) {
    padding: 0 ${({ theme }) => theme.spacing[6]};
  }

  @media (min-width: 1024px) {
    padding: 0 ${({ theme }) => theme.spacing[8]};
  }
`;

export const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing[8]};
  margin-bottom: ${({ theme }) => theme.spacing[8]};

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${({ theme }) => theme.spacing[6]};
  }

  @media (min-width: 1024px) {
    grid-template-columns: 2fr repeat(4, 1fr);
    gap: ${({ theme }) => theme.spacing[8]};
  }
`;

export const FooterBrand = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};

  @media (min-width: 1024px) {
    grid-column: span 1;
  }
`;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const Logo = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary[500]};
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  line-height: 1;
`;

export const Tagline = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral[400]};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  max-width: 280px;
`;

export const SocialLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

export const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: ${({ theme }) => theme.colors.neutral[800]};
  color: ${({ theme }) => theme.colors.neutral[300]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  text-decoration: none;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary[500]};
    color: ${({ theme }) => theme.colors.neutral[0]};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

export const ColumnTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.neutral[0]};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
  margin: 0;
`;

export const LinkList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

export const LinkItem = styled.li`
  margin: 0;
`;

export const FooterLink = styled(Link)`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral[400]};
  text-decoration: none;
  transition: color 0.2s ease-in-out;
  display: inline-block;

  &:hover {
    color: ${({ theme }) => theme.colors.primary[500]};
    padding-left: ${({ theme }) => theme.spacing[1]};
  }
`;

export const ExternalLink = styled.a`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral[400]};
  text-decoration: none;
  transition: color 0.2s ease-in-out;
  display: inline-block;

  &:hover {
    color: ${({ theme }) => theme.colors.primary[500]};
    padding-left: ${({ theme }) => theme.spacing[1]};
  }
`;

export const FooterDivider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.neutral[800]};
  margin: ${({ theme }) => theme.spacing[8]} 0 ${({ theme }) => theme.spacing[6]};
`;

export const FooterBottom = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  text-align: center;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

export const Copyright = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.neutral[500]};
  margin: 0;
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};

  span {
    display: inline-block;
    margin: 0 ${({ theme }) => theme.spacing[1]};
  }
`;

export const BottomLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  flex-wrap: wrap;
  justify-content: center;

  @media (min-width: 768px) {
    justify-content: flex-end;
  }
`;

export const BottomLink = styled(Link)`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.neutral[500]};
  text-decoration: none;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: ${({ theme }) => theme.colors.primary[500]};
  }
`;
