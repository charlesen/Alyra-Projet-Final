import VolunteeringList from "@/components/VolunteeringList";

export default function VolunteeringPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-8">
          <h2 className="text-3xl font-semibold text-indigo-600">Bénévolats</h2>
          <p className="mt-2 text-gray-600">
            Liste des opportunités de bénévolat
          </p>
        </div>
        <VolunteeringList />
      </div>
    </div>
  );
}
