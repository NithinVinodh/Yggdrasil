export const theme = {
  colors: {
    primary: '#4f46e5',
    primaryHover: '#4338ca',
    text: '#ffffff',
    textMuted: 'rgba(255, 255, 255, 0.8)',
    bgGradient: 'radial-gradient(circle at top, #2a5a6f, #000000)',
    bgOverlay: 'rgba(0, 0, 0, 0.2)',
    border: 'rgba(255, 255, 255, 0.1)',
    error: '#ef4444',
    success: '#10b981'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  },
  transition: 'all 0.3s ease',
  input: {
    height: '2.75rem',
    padding: '0.75rem 1rem',
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    focus: {
      borderColor: '#4f46e5',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.3)'
    }
  },
  button: {
    primary: {
      background: '#4f46e5',
      hover: '#4338ca',
      text: '#ffffff',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem'
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.1)',
      hover: 'rgba(255, 255, 255, 0.15)',
      text: '#ffffff',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem'
    }
  },
  card: {
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  }
};

export const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background: ${theme.colors.bgGradient} fixed;
    color: ${theme.colors.text};
    line-height: 1.6;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: ${theme.transition};
    
    &:hover {
      color: ${theme.colors.primaryHover};
    }
  }

  button, input, select, textarea {
    font-family: inherit;
    font-size: 1rem;
  }

  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${theme.spacing.md};
  }
`;
