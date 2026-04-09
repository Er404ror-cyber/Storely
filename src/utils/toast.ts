import toast from 'react-hot-toast';

export const notify = {
  success: (msg: string) => toast.success(msg, {
    id: 'admin-success',
    style: {
      border: '1px solid #6366f1',
      padding: '16px',
      color: '#fff',
      background: 'rgba(15, 23, 42, 0.95)',
      borderRadius: '24px',
      fontWeight: '900',
      fontSize: '13px',
      letterSpacing: '0.025em',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
    },
    iconTheme: { primary: '#6366f1', secondary: '#fff' },
  }),
  error: (msg: string) => toast.error(msg, {
    id: 'admin-error',
    style: {
      border: '1px solid #ef4444',
      padding: '16px',
      color: '#fff',
      background: 'rgba(127, 29, 29, 0.95)',
      borderRadius: '24px',
      fontWeight: '900',
      fontSize: '13px',
    },
    iconTheme: { primary: '#fff', secondary: '#ef4444' },
  })
};