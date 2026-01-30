import React from 'react';
import logo from '/logo-dw.png';

const Side: React.FC = () => {
  return (
    <div className="hidden lg:flex items-center justify-center flex-1 bg-white text-black">
      <div className="max-w-md text-center">
        <img src={logo} alt="DreamWeaver Logo" className="w-full" />
      </div>
    </div>
  );
};

export default Side;
