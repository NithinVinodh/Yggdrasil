import styled from 'styled-components';
import { theme } from '../styles/theme';

export const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: ${theme.colors.bgOverlay};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 1000;
  padding: 0 ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
`;

export const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
`;

export const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${theme.colors.text};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

export const NavLinks = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  align-items: center;
`;

export const NavLink = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  color: ${theme.colors.textMuted};
  text-decoration: none;
  border-radius: ${theme.borderRadius.full};
  transition: ${theme.transition};
  font-weight: 500;
  cursor: pointer;
  background: ${({ active }) => active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  color: ${({ active }) => active ? theme.colors.text : theme.colors.textMuted};

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${theme.colors.text};
  }
`;

export const NavIcon = styled.span`
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;
