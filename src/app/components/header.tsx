"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-blue-400 to-gray-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white hover:text-blue-200 transition-colors duration-300 cursor-pointer">
              Réseau de Pétri
            </h1>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                href="/"
                className="relative text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-blue-300/30 group"
              >
                Application
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-300 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="/graph"
                className="relative text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-blue-300/30 group"
              >
                Graph
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-300 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>
          </div>

          {/* Bouton Mobile Menu */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-blue-300/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-300 transition-all duration-200"
            >
              <span className="sr-only">Ouvrir le menu principal</span>
              <div className="relative w-6 h-6">
                <span
                  className={`absolute block h-0.5 w-6 bg-current transform transition-all duration-300 ${
                    isMenuOpen ? "rotate-45 translate-y-0" : "-translate-y-2"
                  }`}
                ></span>
                <span
                  className={`absolute block h-0.5 w-6 bg-current transform transition-all duration-300 ${
                    isMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                ></span>
                <span
                  className={`absolute block h-0.5 w-6 bg-current transform transition-all duration-300 ${
                    isMenuOpen ? "-rotate-45 translate-y-0" : "translate-y-2"
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700">
          <Link
            href="/"
            className="text-gray-300 hover:text-white hover:bg-blue-300/40 block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 transform hover:translate-x-1"
            onClick={() => setIsMenuOpen(false)}
          >
            Application
          </Link>
          <Link
            href="/graph"
            className="text-gray-300 hover:text-white hover:bg-blue-300/40 block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 transform hover:translate-x-1"
            onClick={() => setIsMenuOpen(false)}
          >
            Graph
          </Link>
        </div>
      </div>
    </nav>
  );
}
