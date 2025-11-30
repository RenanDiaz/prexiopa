/**
 * BarcodeScanner Styled Components
 *
 * Styles for the full-screen barcode scanner modal.
 * Includes animations for loading, success, and scanning states.
 */

import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';

// ============================================
// ANIMATIONS
// ============================================

/**
 * Fade in animation for overlay
 */
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

/**
 * Slide up animation for content
 */
const slideUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

/**
 * Spinner rotation animation
 */
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

/**
 * Pulse animation for scanning guide
 */
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
`;

/**
 * Scan line animation
 */
const scanLine = keyframes`
  0%, 100% {
    transform: translateY(-100%);
  }
  50% {
    transform: translateY(100%);
  }
`;

/**
 * Success checkmark animation
 */
const checkmarkDraw = keyframes`
  0% {
    transform: scale(0) rotate(45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(45deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(45deg);
    opacity: 1;
  }
`;

/**
 * Success circle animation
 */
const successCircle = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

// ============================================
// MAIN COMPONENTS
// ============================================

/**
 * Full-screen overlay backdrop
 */
export const ScannerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${theme.zIndex.modal};
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  animation: ${fadeIn} 0.3s ease-out;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  overflow: hidden;

  /* Focus outline */
  &:focus {
    outline: none;
  }
`;

/**
 * Scanner content container
 */
export const ScannerContent = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/**
 * Close button (top-right corner)
 */
export const CloseButton = styled.button`
  position: fixed;
  top: ${theme.spacing[4]};
  right: ${theme.spacing[4]};
  z-index: ${theme.zIndex.modal + 10};
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: ${theme.borderRadius.full};
  color: ${theme.colors.text.inverse};
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    border-color: rgba(255, 255, 255, 0.4);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus {
    outline: 2px solid ${theme.colors.primary[500]};
    outline-offset: 2px;
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    top: ${theme.spacing[3]};
    right: ${theme.spacing[3]};
    width: 44px;
    height: 44px;
  }
`;

/**
 * Toggle camera button (bottom-right)
 */
export const ToggleCameraButton = styled.button`
  position: fixed;
  bottom: ${theme.spacing[8]};
  right: ${theme.spacing[4]};
  z-index: ${theme.zIndex.modal + 5};
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.primary[500]};
  border: none;
  border-radius: ${theme.borderRadius.full};
  color: ${theme.colors.primary.contrast};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${theme.shadows.lg};

  &:hover {
    background: ${theme.colors.primary[600]};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus {
    outline: 2px solid ${theme.colors.primary[300]};
    outline-offset: 2px;
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    bottom: ${theme.spacing[6]};
    right: ${theme.spacing[3]};
    width: 52px;
    height: 52px;
  }
`;

/**
 * Torch/Flashlight button (bottom-left)
 */
export const TorchButton = styled.button<{ $isActive?: boolean }>`
  position: fixed;
  bottom: ${theme.spacing[8]};
  left: ${theme.spacing[4]};
  z-index: ${theme.zIndex.modal + 5};
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $isActive }) =>
    $isActive ? '#f59e0b' : theme.colors.neutral[700]};
  border: none;
  border-radius: ${theme.borderRadius.full};
  color: ${({ $isActive }) =>
    $isActive ? theme.colors.neutral[900] : theme.colors.neutral[100]};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${theme.shadows.lg};

  &:hover {
    background: ${({ $isActive }) =>
      $isActive ? '#d97706' : theme.colors.neutral[600]};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus {
    outline: 2px solid ${({ $isActive }) =>
      $isActive ? '#fbbf24' : theme.colors.neutral[400]};
    outline-offset: 2px;
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    bottom: ${theme.spacing[6]};
    left: ${theme.spacing[3]};
    width: 52px;
    height: 52px;
  }
`;

// ============================================
// WEBCAM CONTAINER
// ============================================

/**
 * Webcam video container
 */
export const WebcamContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: ${theme.colors.neutral[900]};
`;

// ============================================
// SCAN OVERLAY & GUIDE
// ============================================

/**
 * Scan overlay with guide frame
 */
export const ScanOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal + 1};
  pointer-events: none;
`;

/**
 * Scanning guide container
 */
export const ScanGuide = styled.div`
  position: relative;
  width: 80%;
  max-width: 400px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Mobile adjustments */
  @media (max-width: 768px) {
    width: 85%;
    max-width: 320px;
  }
`;

/**
 * Scanning frame with corners
 */
export const ScanFrame = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: ${theme.borderRadius.lg};
  animation: ${pulse} 2s ease-in-out infinite;
  overflow: hidden;

  /* Corner decorations */
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 40px;
    height: 40px;
    border: 3px solid ${theme.colors.primary[500]};
  }

  /* Top-left corner */
  &::before {
    top: -2px;
    left: -2px;
    border-right: none;
    border-bottom: none;
    border-top-left-radius: ${theme.borderRadius.lg};
  }

  /* Bottom-right corner */
  &::after {
    bottom: -2px;
    right: -2px;
    border-left: none;
    border-top: none;
    border-bottom-right-radius: ${theme.borderRadius.lg};
  }

  /* Scanning line */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      ${theme.colors.primary[500]},
      transparent
    );
    animation: ${scanLine} 2s ease-in-out infinite;
    box-shadow: 0 0 10px ${theme.colors.primary[500]};
  }
`;

/**
 * Scanning instructions text
 */
export const ScanInstructions = styled.p`
  margin-top: ${theme.spacing[6]};
  padding: ${theme.spacing[3]} ${theme.spacing[6]};
  background: rgba(0, 0, 0, 0.7);
  border-radius: ${theme.borderRadius.full};
  color: ${theme.colors.text.inverse};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  text-align: center;
  backdrop-filter: blur(10px);
  max-width: 90%;

  /* Mobile adjustments */
  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.xs};
    padding: ${theme.spacing[2]} ${theme.spacing[4]};
    margin-top: ${theme.spacing[4]};
  }
`;

// ============================================
// LOADING STATE
// ============================================

/**
 * Loading container
 */
export const LoadingContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[4]};
  background: rgba(0, 0, 0, 0.8);
  z-index: 10;
  animation: ${slideUp} 0.3s ease-out;
`;

/**
 * Loading spinner
 */
export const LoadingSpinner = styled.div`
  width: 64px;
  height: 64px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: ${theme.colors.primary[500]};
  border-radius: ${theme.borderRadius.full};
  animation: ${spin} 1s linear infinite;
`;

/**
 * Loading text
 */
export const LoadingText = styled.p`
  color: ${theme.colors.text.inverse};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  text-align: center;
`;

// ============================================
// SUCCESS STATE
// ============================================

/**
 * Success container
 */
export const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[4]};
  padding: ${theme.spacing[6]};
  animation: ${slideUp} 0.3s ease-out;
`;

/**
 * Success icon container
 */
export const SuccessIcon = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.semantic.success.main};
  border-radius: ${theme.borderRadius.full};
  animation: ${successCircle} 0.5s ease-out;
  box-shadow: 0 0 40px rgba(76, 175, 80, 0.5);
`;

/**
 * Checkmark icon
 */
export const CheckmarkIcon = styled.div`
  font-size: 64px;
  color: ${theme.colors.text.inverse};
  font-weight: ${theme.typography.fontWeight.bold};
  animation: ${checkmarkDraw} 0.5s ease-out 0.2s both;
`;

/**
 * Success title
 */
export const SuccessTitle = styled.h2`
  color: ${theme.colors.text.inverse};
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  text-align: center;
  margin: 0;
`;

/**
 * Success code display
 */
export const SuccessCode = styled.p`
  color: ${theme.colors.primary[300]};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  font-family: ${theme.typography.fontFamily.mono};
  text-align: center;
  margin: 0;
  padding: ${theme.spacing[3]} ${theme.spacing[6]};
  background: rgba(0, 0, 0, 0.5);
  border-radius: ${theme.borderRadius.base};
  border: 1px solid ${theme.colors.primary[500]};
`;

// ============================================
// ERROR STATE
// ============================================

/**
 * Error container
 */
export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[4]};
  padding: ${theme.spacing[6]};
  max-width: 500px;
  text-align: center;
  animation: ${slideUp} 0.3s ease-out;
`;

/**
 * Error icon
 */
export const ErrorIcon = styled.div`
  color: ${theme.colors.semantic.error.main};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${theme.spacing[2]};
`;

/**
 * Error title
 */
export const ErrorTitle = styled.h2`
  color: ${theme.colors.text.inverse};
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  margin: 0;
`;

/**
 * Error description
 */
export const ErrorDescription = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.base};
  line-height: ${theme.typography.lineHeight.relaxed};
  margin: 0;
  max-width: 400px;
`;

/**
 * Retry button
 */
export const RetryButton = styled.button`
  margin-top: ${theme.spacing[4]};
  padding: ${theme.spacing[3]} ${theme.spacing[8]};
  background: ${theme.colors.primary[500]};
  color: ${theme.colors.primary.contrast};
  border: none;
  border-radius: ${theme.borderRadius.button};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${theme.shadows.md};

  &:hover {
    background: ${theme.colors.primary[600]};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: 2px solid ${theme.colors.primary[300]};
    outline-offset: 2px;
  }
`;
