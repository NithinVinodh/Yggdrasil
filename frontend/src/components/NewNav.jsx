import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaSignInAlt, FaUserPlus, FaInfoCircle, FaEnvelope } from 'react-icons/fa';
import styled from 'styled-components';

const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: transparent;
  z-index: 1000;
  padding: 0 2rem;
  height: 80px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2.5rem;
  align-items: center;
  padding-right: 2rem;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  font-size: 1.1rem;
  position: relative;
  padding: 0.5rem 0;
  transition: all 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: white;
    transition: width 0.3s ease;
  }
  
  &:hover::after {
    width: 100%;
  }
  
  ${({ active }) => active && `
    &::after {
      width: 100%;
    }
  `}
`;

const Navigation = () => {
  const location = useLocation();

  return (
    <>
    </>
    // <Nav>
    //   <NavContainer>
    //     <NavLinks>
    //       <NavLink to="/" active={location.pathname === '/' ? 1 : 0}>
    //         Home
    //       </NavLink>
    //       <NavLink to="/about" active={location.pathname === '/about' ? 1 : 0}>
    //         About
    //       </NavLink>
    //       <NavLink to="/contact" active={location.pathname === '/contact' ? 1 : 0}>
    //         Contact
    //       </NavLink>
    //     </NavLinks>
    //   </NavContainer>
    // </Nav>
  );
};

export default Navigation;
