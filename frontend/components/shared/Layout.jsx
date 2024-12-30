// Layout.jsx
"use client";

import Header from "./Header";
import Footer from "./Footer";
import Aside from "./Aside";

export default function Layout({ children }) {

    return (
        <div className="flex min-h-screen text-gray-900">
            <Aside />

            {/* 
         -- BLOC PRINCIPAL (droite) --
         On y place:
         1) le Header existant tout en haut 
         2) la zone main (children)
         3) le Footer en bas (optionnel)
      */}
            <div className="flex flex-col flex-1">
                {/* Le "Header" existant tout en haut */}
                <Header />

                {/* Contenu principal */}
                <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
                    {children}
                </main>

                {/* Footer existant tout en bas */}
                <Footer />
            </div>
        </div>
    );
}
