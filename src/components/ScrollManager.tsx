import { Outlet } from 'react-router-dom';
import { useScrollRestoration } from '../hooks/useScrollRestoration';

export const ScrollManager = () => {
  useScrollRestoration();
  return <Outlet />;
};