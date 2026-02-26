// src/components/ui/card.jsx
export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white border rounded-xl shadow ${className}`}>
      {children}
    </div>
  );
}