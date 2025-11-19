/**
 * Products Demo Page
 *
 * Demonstration page showing ProductCard and ProductGrid components in action.
 * You can navigate to this page at /products-demo to see the components.
 *
 * To add this page to your app:
 * 1. Add route in src/routes/index.tsx
 * 2. Add navigation link in your menu/navbar
 */

import React from 'react';
import styled from 'styled-components';
import { ProductGridExample } from '@/components/products/ProductCard.example';

const DemoContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: ${props => props.theme.colors.background.default};
`;

const DemoHeader = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary[500]} 0%, ${props => props.theme.colors.secondary[500]} 100%);
  color: white;
  padding: ${props => props.theme.spacing[12]} ${props => props.theme.spacing[6]};
  text-align: center;

  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing[8]} ${props => props.theme.spacing[4]};
  }
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.variants.h1.fontSize};
  font-weight: ${props => props.theme.typography.variants.h1.fontWeight};
  margin-bottom: ${props => props.theme.spacing[4]};
  line-height: ${props => props.theme.typography.variants.h1.lineHeight};

  @media (max-width: 768px) {
    font-size: ${props => props.theme.typography.fontSize['3xl']};
  }
`;

const Subtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.regular};
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  line-height: ${props => props.theme.typography.lineHeight.relaxed};

  @media (max-width: 768px) {
    font-size: ${props => props.theme.typography.fontSize.base};
  }
`;

const DemoContent = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing[8]} ${props => props.theme.spacing[6]};

  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing[6]} ${props => props.theme.spacing[4]};
  }
`;

const Section = styled.section`
  margin-bottom: ${props => props.theme.spacing[12]};
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.variants.h2.fontSize};
  font-weight: ${props => props.theme.typography.variants.h2.fontWeight};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const SectionDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.base};
  color: ${props => props.theme.colors.text.secondary};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: ${props => props.theme.spacing[6]} 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${props => props.theme.spacing[4]};
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: start;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const FeatureIcon = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.primary[50]};
  color: ${props => props.theme.colors.primary[500]};
  border-radius: ${props => props.theme.borderRadius.base};
  font-size: ${props => props.theme.typography.fontSize.xl};
`;

const FeatureText = styled.div`
  flex: 1;

  h3 {
    font-size: ${props => props.theme.typography.fontSize.base};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.theme.colors.text.primary};
    margin-bottom: ${props => props.theme.spacing[1]};
  }

  p {
    font-size: ${props => props.theme.typography.fontSize.sm};
    color: ${props => props.theme.colors.text.secondary};
    line-height: ${props => props.theme.typography.lineHeight.normal};
  }
`;

const CodeBlock = styled.pre`
  background: ${props => props.theme.colors.neutral[900]};
  color: ${props => props.theme.colors.neutral[100]};
  padding: ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.borderRadius.md};
  overflow-x: auto;
  font-family: ${props => props.theme.typography.fontFamily.mono};
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
  margin: ${props => props.theme.spacing[4]} 0;
`;

/**
 * ProductsDemo Page Component
 */
export const ProductsDemo: React.FC = () => {
  return (
    <DemoContainer>
      <DemoHeader>
        <Title>Product Components Demo</Title>
        <Subtitle>
          Professional, responsive product display components built for Prexiopa's
          price comparison platform
        </Subtitle>
      </DemoHeader>

      <DemoContent>
        {/* Features Section */}
        <Section>
          <SectionTitle>Key Features</SectionTitle>
          <SectionDescription>
            Our product components are designed for rapid development with enterprise-grade
            quality and user experience.
          </SectionDescription>

          <FeatureList>
            <FeatureItem>
              <FeatureIcon>📱</FeatureIcon>
              <FeatureText>
                <h3>Mobile-First Responsive</h3>
                <p>Adapts seamlessly from 1 to 4 columns based on screen size</p>
              </FeatureText>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>❤️</FeatureIcon>
              <FeatureText>
                <h3>Animated Interactions</h3>
                <p>Smooth heart animations, hover effects, and micro-interactions</p>
              </FeatureText>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>💰</FeatureIcon>
              <FeatureText>
                <h3>Smart Price Display</h3>
                <p>Highlights best prices, discounts, and store information</p>
              </FeatureText>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>⚡</FeatureIcon>
              <FeatureText>
                <h3>Performance Optimized</h3>
                <p>Lazy loading, skeleton states, and minimal re-renders</p>
              </FeatureText>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>♿</FeatureIcon>
              <FeatureText>
                <h3>Fully Accessible</h3>
                <p>WCAG compliant with ARIA labels and keyboard navigation</p>
              </FeatureText>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>🎨</FeatureIcon>
              <FeatureText>
                <h3>Theme Integration</h3>
                <p>Uses design tokens for consistent styling across the app</p>
              </FeatureText>
            </FeatureItem>
          </FeatureList>
        </Section>

        {/* Usage Example */}
        <Section>
          <SectionTitle>Usage Example</SectionTitle>
          <SectionDescription>
            Here's how simple it is to use the ProductGrid component:
          </SectionDescription>

          <CodeBlock>{`import { ProductGrid } from '@/components/products';

<ProductGrid
  products={products}
  bestPrices={pricesMap}
  favorites={new Set(favoriteIds)}
  onFavoriteToggle={handleToggle}
  loading={isLoading}
  emptyMessage="No products found"
  onEmptyAction={handleExplore}
/>`}</CodeBlock>
        </Section>

        {/* Live Demo */}
        <Section>
          <SectionTitle>Live Demo</SectionTitle>
          <SectionDescription>
            Interact with the components below. Try clicking the heart icon to favorite
            products, hover over cards, and click to see navigation behavior.
          </SectionDescription>

          <ProductGridExample />
        </Section>

        {/* Implementation Notes */}
        <Section>
          <SectionTitle>Implementation Notes</SectionTitle>
          <SectionDescription>
            To integrate these components into your pages:
          </SectionDescription>

          <FeatureList>
            <FeatureItem>
              <FeatureIcon>1️⃣</FeatureIcon>
              <FeatureText>
                <h3>Import Components</h3>
                <p>Use barrel exports from @/components/products</p>
              </FeatureText>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>2️⃣</FeatureIcon>
              <FeatureText>
                <h3>Fetch Data</h3>
                <p>Load products and prices from your API</p>
              </FeatureText>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>3️⃣</FeatureIcon>
              <FeatureText>
                <h3>Manage State</h3>
                <p>Handle favorites with local state or Redux</p>
              </FeatureText>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>4️⃣</FeatureIcon>
              <FeatureText>
                <h3>Connect Callbacks</h3>
                <p>Wire up favorite toggles and navigation</p>
              </FeatureText>
            </FeatureItem>
          </FeatureList>
        </Section>

        {/* Documentation Link */}
        <Section>
          <SectionTitle>Full Documentation</SectionTitle>
          <SectionDescription>
            For complete API reference, examples, and implementation guides, see the
            README.md file in the components/products directory.
          </SectionDescription>
        </Section>
      </DemoContent>
    </DemoContainer>
  );
};

export default ProductsDemo;
