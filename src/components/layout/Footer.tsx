import React from 'react';
import { FaFacebook, FaInstagram, FaTwitter, FaHeart } from 'react-icons/fa';
import {
  FooterContainer,
  FooterContent,
  FooterGrid,
  FooterBrand,
  LogoContainer,
  Logo,
  Tagline,
  SocialLinks,
  SocialLink,
  FooterColumn,
  ColumnTitle,
  LinkList,
  LinkItem,
  FooterLink,
  ExternalLink,
  FooterDivider,
  FooterBottom,
  Copyright,
  BottomLinks,
  BottomLink,
} from './Footer.styles';

/**
 * Footer Component - Prexiopá
 * Footer profesional con navegación completa, redes sociales y diseño responsive
 *
 * Características:
 * - 5 secciones: Branding, Productos, Tiendas, Usuario, Ayuda
 * - Enlaces de redes sociales con hover effects
 * - Diseño responsive: 1 columna (mobile), 2 columnas (tablet), 5 columnas (desktop)
 * - Copyright con mensaje de Panamá
 * - Integración completa con React Router
 */

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        {/* Main Footer Grid */}
        <FooterGrid>
          {/* Brand Section */}
          <FooterBrand>
            <LogoContainer>
              <Logo>Prexiopá</Logo>
            </LogoContainer>
            <Tagline>
              Compara precios, ahorra dinero. La mejor herramienta para encontrar las mejores ofertas en Panamá.
            </Tagline>
            <SocialLinks>
              <SocialLink
                href="https://facebook.com/prexiopa"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en Facebook"
              >
                <FaFacebook />
              </SocialLink>
              <SocialLink
                href="https://instagram.com/prexiopa"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en Instagram"
              >
                <FaInstagram />
              </SocialLink>
              <SocialLink
                href="https://twitter.com/prexiopa"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en Twitter"
              >
                <FaTwitter />
              </SocialLink>
            </SocialLinks>
          </FooterBrand>

          {/* Productos Column */}
          <FooterColumn>
            <ColumnTitle>Productos</ColumnTitle>
            <LinkList>
              <LinkItem>
                <FooterLink to="/dashboard">Dashboard</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink to="/buscar">Buscar Productos</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink to="/categorias">Categorías</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink to="/ofertas">Ofertas</FooterLink>
              </LinkItem>
            </LinkList>
          </FooterColumn>

          {/* Tiendas Column */}
          <FooterColumn>
            <ColumnTitle>Tiendas</ColumnTitle>
            <LinkList>
              <LinkItem>
                <FooterLink to="/tiendas">Ver Tiendas</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink to="/tiendas/cercanas">Tiendas Cercanas</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink to="/comparar">Comparar Tiendas</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink to="/tiendas/registrar">Registrar Tienda</FooterLink>
              </LinkItem>
            </LinkList>
          </FooterColumn>

          {/* Usuario Column */}
          <FooterColumn>
            <ColumnTitle>Usuario</ColumnTitle>
            <LinkList>
              <LinkItem>
                <FooterLink to="/perfil">Mi Perfil</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink to="/favoritos">Mis Favoritos</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink to="/alertas">Mis Alertas</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink to="/configuracion">Configuración</FooterLink>
              </LinkItem>
            </LinkList>
          </FooterColumn>

          {/* Ayuda Column */}
          <FooterColumn>
            <ColumnTitle>Ayuda</ColumnTitle>
            <LinkList>
              <LinkItem>
                <FooterLink to="/faq">Preguntas Frecuentes</FooterLink>
              </LinkItem>
              <LinkItem>
                <FooterLink to="/contacto">Contacto</FooterLink>
              </LinkItem>
              <LinkItem>
                <ExternalLink href="/terminos" target="_blank" rel="noopener noreferrer">
                  Términos de Uso
                </ExternalLink>
              </LinkItem>
              <LinkItem>
                <ExternalLink href="/privacidad" target="_blank" rel="noopener noreferrer">
                  Política de Privacidad
                </ExternalLink>
              </LinkItem>
            </LinkList>
          </FooterColumn>
        </FooterGrid>

        {/* Divider */}
        <FooterDivider />

        {/* Bottom Section */}
        <FooterBottom>
          <Copyright>
            © {currentYear} Prexiopá. Hecho con <FaHeart style={{ color: '#EF4444', verticalAlign: 'middle' }} /> en Panamá 🇵🇦
          </Copyright>
          <BottomLinks>
            <BottomLink to="/terminos">Términos</BottomLink>
            <BottomLink to="/privacidad">Privacidad</BottomLink>
            <BottomLink to="/cookies">Cookies</BottomLink>
            <BottomLink to="/accesibilidad">Accesibilidad</BottomLink>
          </BottomLinks>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
