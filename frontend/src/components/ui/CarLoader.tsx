import React from "react";

const CarLoader: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div className="relative w-32 h-16 overflow-hidden">
      {/* Car body */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-8 bg-blue-600 rounded-lg relative">
          {/* Car top */}
          <div className="absolute -top-2 left-4 w-16 h-4 bg-blue-500 rounded-md"></div>
          {/* Wheels */}
          <div className="absolute -bottom-2 left-2 w-4 h-4 bg-gray-800 rounded-full"></div>
          <div className="absolute -bottom-2 right-2 w-4 h-4 bg-gray-800 rounded-full"></div>
          {/* Headlights */}
          <div className="absolute left-1 top-2 w-2 h-2 bg-yellow-300 rounded-full"></div>
          <div className="absolute right-1 top-2 w-2 h-2 bg-yellow-300 rounded-full"></div>
        </div>
      </div>
      
      {/* Animation trail */}
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default CarLoader; 