import { Suspense } from 'react';
import LoginPage from './LoginPage';

export default function Page(): React.JSX.Element {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}