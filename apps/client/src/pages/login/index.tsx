import React from 'react';
import LoginForm from './LoginForm';
import Side from '../../components/layout/Side';

const LoginPage: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="relative flex w-full flex-col items-center justify-center px-8 py-12 sm:px-12 lg:w-3/4 lg:px-24 xl:px-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,92,255,0.14),_transparent_55%)]" />
        <div className="relative z-10">
          <LoginForm />
        </div>
      </div>
      <Side />
    </div>
  );
};

export default LoginPage;
