"use client";
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl lg:text-center text-white">
      <h2 className="text-3xl font-semibold">À propos</h2>
      <div className="mx-auto max-w-2xl text-center">
        <section className="text-center">
          <p className="mt-8 text-pretty text-lg font-medium sm:text-xl/8">
            Eusko3 est un stablecoin adossé à l’EURC, conçu pour valoriser le
            bénévolat et encourager le commerce local.
          </p>
          <p className="mt-8 text-pretty text-lg font-medium  sm:text-xl/8">
            En offrant des récompenses en EUS aux bénévoles, nous soutenons
            l’économie sociale et solidaire, tout en permettant aux commerçants
            partenaires de bénéficier de nouveaux clients engagés.
          </p>
        </section>
      </div>
    </div>
  );
}
