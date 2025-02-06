// components/ui/card.js
export const Card = ({ children, className }) => (
    <div className={`bg-white shadow-md rounded-xl ${className}`}>{children}</div>
  );
  
  export const CardContent = ({ children, className }) => (
    <div className={`p-4 ${className}`}>{children}</div>
  );
  