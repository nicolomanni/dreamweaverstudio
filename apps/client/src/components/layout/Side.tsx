import React from 'react';
import authSide from '/auth-side-bg.png';

const Side: React.FC = () => {
  return (
    <div className="relative hidden h-screen items-center justify-center p-6 lg:flex lg:w-[55%] dw-fade-in">
      <div
        className="h-full w-full bg-right bg-no-repeat"
        style={{
          backgroundImage: `url(${authSide})`,
          backgroundSize: 'auto 100%',
        }}
        aria-hidden="true"
      />
    </div>
  );
};

export default Side;
