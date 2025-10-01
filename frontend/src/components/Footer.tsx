export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between text-xs">
        <span>Administración SGMM</span>
        <span className="text-white/70">© {new Date().getFullYear()}</span>
      </div>
    </footer>
  )
}


