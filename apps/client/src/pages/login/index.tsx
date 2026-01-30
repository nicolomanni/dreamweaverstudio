import React from 'react';
import Side from '../../components/layout/Side';
import LoginForm from './LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <LoginForm />
      </div>
      <Side />
    </div>
  );
};

export default LoginPage;
