import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="card max-w-md mx-auto text-center">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Sistema SGMM
        </h1>
        <p className="text-neutral mb-6">
          Sistema de Gestión de Gastos Médicos Mayores
        </p>
        
        {/* Test component */}
        <div className="space-y-4">
          <button
            className="btn-primary w-full"
            onClick={() => setCount((count) => count + 1)}
          >
            Count is {count}
          </button>
          
          <button
            className="btn-secondary w-full"
            onClick={async () => {
              try {
                const response = await fetch('/api/health');
                const data = await response.json();
                console.log('Backend health:', data);
                alert(`Backend Status: ${data.status}\nDatabase: ${data.database}`);
              } catch (error) {
                console.error('Backend connection failed:', error);
                alert('Backend connection failed via /api proxy.');
              }
            }}
          >
            Test Backend Connection
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-6">
          Frontend: React + Vite + TailwindCSS<br />
          Backend: Node.js + TypeScript + Fastify
        </p>
      </div>
    </div>
  );
}

export default App;