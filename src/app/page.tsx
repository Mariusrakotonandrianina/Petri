import PetriGraph from "./components/petriGraph";
import PetriMatrix from "./components/petriMatrix";

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="">Réseau de Pétrie</h1>
      <PetriGraph />
      <PetriMatrix />
    </div>
  );
}
