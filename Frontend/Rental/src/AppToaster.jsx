import { Toaster } from 'react-hot-toast';

/* Put <AppToaster /> ONCE in App.jsx (outside <Routes>) so a toast survives the
   redirect from Register to Login. */
export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={10}
      toastOptions={{
        duration: 3500,
        style: {
          background: '#112b25',
          color: '#f4f1ea',
          padding: '14px 18px',
          borderRadius: '12px',
          fontSize: '0.92rem',
          fontWeight: 600,
          boxShadow: '0 18px 44px rgba(17,43,37,0.35)',
          border: '1px solid rgba(255,255,255,0.08)',
          maxWidth: '420px',
        },
        success: { iconTheme: { primary: '#db9e4f', secondary: '#112b25' } },
        error:   { iconTheme: { primary: '#ff7b6e', secondary: '#112b25' },
                   style: { borderLeft: '4px solid #ff7b6e' } },
        loading: { iconTheme: { primary: '#db9e4f', secondary: '#112b25' } },
      }}
    />
  );
}