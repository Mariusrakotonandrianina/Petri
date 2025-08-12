export interface Machine {
    id: number;
    nom: string;
    type: string;
    capacite: number;
    status: "active" | "panne" | "maintenance";
    utilisation: number;
    derniereRevision: string;
    prochaineMaintenance: string;
  }

export const defaultMachinesData: Machine[] = [
    {
      id: 1,
      nom: "Presse d'assemblage #1",
      type: "Presse hydraulique",
      capacite: 2,
      status: "active",
      utilisation: 75,
      derniereRevision: "2024-01-15",
      prochaineMaintenance: "2024-03-15"
    },
    {
      id: 2,
      nom: "Cabine de peinture #1",
      type: "Cabine automatique",
      capacite: 1,
      status: "maintenance",
      utilisation: 0,
      derniereRevision: "2024-02-01",
      prochaineMaintenance: "2024-04-01"
    },
    {
      id: 3,
      nom: "Station de montage moteur",
      type: "Poste manuel",
      capacite: 3,
      status: "active",
      utilisation: 60,
      derniereRevision: "2024-01-20",
      prochaineMaintenance: "2024-03-20"
    }
  ];

export const getMachineById = (id: number): Machine | undefined => {
    return defaultMachinesData.find(machine => machine.id === id);
  };