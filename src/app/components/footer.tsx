export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-blue-400 to-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">
              Réseau de Pétri
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Plateforme avancée pour la modélisation et l'analyse des réseaux
              de Pétri, offrant des outils puissants pour la simulation et la
              visualisation.
            </p>
            <div className="flex space-x-4 mt-6">
              <div className="w-8 h-8 bg-blue-300/20 hover:bg-blue-300/40 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110">
                <span className="text-xs font-bold">f</span>
              </div>
              <div className="w-8 h-8 bg-blue-300/20 hover:bg-blue-300/40 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110">
                <span className="text-xs font-bold">t</span>
              </div>
              <div className="w-8 h-8 bg-blue-300/20 hover:bg-blue-300/40 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110">
                <span className="text-xs font-bold">in</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4">
              Navigation
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#application"
                  className="text-gray-300 hover:text-blue-200 transition-colors duration-300 text-sm hover:translate-x-1 transform inline-block"
                >
                  Application
                </a>
              </li>
              <li>
                <a
                  href="#graph"
                  className="text-gray-300 hover:text-blue-200 transition-colors duration-300 text-sm hover:translate-x-1 transform inline-block"
                >
                  Graph
                </a>
              </li>
              <li>
                <a
                  href="#documentation"
                  className="text-gray-300 hover:text-blue-200 transition-colors duration-300 text-sm hover:translate-x-1 transform inline-block"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#support"
                  className="text-gray-300 hover:text-blue-200 transition-colors duration-300 text-sm hover:translate-x-1 transform inline-block"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="py-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-400">
            © 2024 Réseau de Pétri. Tous droits réservés.
          </div>
          <div className="flex space-x-6 text-sm">
            <a
              href="#privacy"
              className="text-gray-400 hover:text-blue-200 transition-colors duration-300"
            >
              Politique de confidentialité
            </a>
            <a
              href="#terms"
              className="text-gray-400 hover:text-blue-200 transition-colors duration-300"
            >
              Conditions d'utilisation
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
