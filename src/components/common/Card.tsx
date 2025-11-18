/**
 * Card Component
 *
 * A flexible container component for grouping related content.
 * Supports multiple variants, hover effects, and optional sections.
 *
 * @example
 * ```tsx
 * // Basic card
 * <Card>
 *   <p>Card content</p>
 * </Card>
 *
 * // Elevated card with sections
 * <Card variant="elevated">
 *   <Card.Header>
 *     <h3>Título</h3>
 *   </Card.Header>
 *   <Card.Body>
 *     <p>Contenido principal</p>
 *   </Card.Body>
 *   <Card.Footer>
 *     <Button>Acción</Button>
 *   </Card.Footer>
 * </Card>
 *
 * // Clickable card
 * <Card clickable onClick={() => navigate('/producto/123')}>
 *   <CardProducto data={product} />
 * </Card>
 *
 * // Card with image
 * <Card>
 *   <Card.Image src="/product.jpg" alt="Producto" />
 *   <Card.Body>Content</Card.Body>
 * </Card>
 * ```
 */

import React from 'react';
import * as S from './Card.styles';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual style variant
   * - default: Standard flat card with subtle border
   * - elevated: Card with shadow, stands out from background
   * - outlined: Emphasized border, no shadow
   */
  variant?: 'default' | 'elevated' | 'outlined';

  /**
   * Makes card clickable with hover effects
   */
  clickable?: boolean;

  /**
   * Padding size for the card
   */
  padding?: 'sm' | 'md' | 'lg';

  /**
   * Card children
   */
  children?: React.ReactNode;

  /**
   * Click handler (automatically makes card clickable)
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * Card container component
 */
const CardRoot = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      clickable = false,
      padding = 'md',
      children,
      onClick,
      ...rest
    },
    ref
  ) => {
    const isClickable = clickable || !!onClick;

    return (
      <S.StyledCard
        ref={ref}
        variant={variant}
        clickable={isClickable}
        padding={padding}
        onClick={onClick}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        {...rest}
      >
        {children}
      </S.StyledCard>
    );
  }
);

CardRoot.displayName = 'Card';

/**
 * Card Header Section
 */
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, ...rest }, ref) => (
    <S.CardHeader ref={ref} {...rest}>
      {children}
    </S.CardHeader>
  )
);

CardHeader.displayName = 'Card.Header';

/**
 * Card Body Section
 */
interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, ...rest }, ref) => (
    <S.CardBody ref={ref} {...rest}>
      {children}
    </S.CardBody>
  )
);

CardBody.displayName = 'Card.Body';

/**
 * Card Footer Section
 */
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, ...rest }, ref) => (
    <S.CardFooter ref={ref} {...rest}>
      {children}
    </S.CardFooter>
  )
);

CardFooter.displayName = 'Card.Footer';

/**
 * Card Image Component
 */
interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

const CardImage = React.forwardRef<HTMLImageElement, CardImageProps>(
  ({ src, alt, ...rest }, ref) => (
    <S.CardImageWrapper>
      <S.CardImage ref={ref} src={src} alt={alt} {...rest} />
    </S.CardImageWrapper>
  )
);

CardImage.displayName = 'Card.Image';

/**
 * Composite Card Component with sub-components
 */
export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Image: CardImage,
});

export default Card;
