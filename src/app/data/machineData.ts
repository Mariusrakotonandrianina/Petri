// src/app/data/machineData.ts - Version corrigée
export interface MachineData {
  id: number;
  nom: string;
  type: string;
  capacite: number;
  status: "active" | "panne" | "maintenance";
  utilisation: number;
  derniereRevision: string;
  prochaineMaintenance: string;
}

export const defaultMachinesData: MachineData[] = [
  {
    id: 1,
    nom: "Presse d'assemblage #1",
    type: "Presse hydraulique",
    capacite: 150,
    status: "active",
    utilisation: 75,
    derniereRevision: "2024-01-15",
    prochaineMaintenance: "2024-04-15"
  },
  {
    id: 2,
    nom: "Cabine de peinture #1",
    type: "Cabine automatique",
    capacite: 50,
    status: "maintenance",
    utilisation: 0,
    derniereRevision: "2024-02-01",
    prochaineMaintenance: "2024-05-01"
  },
  {
    id: 3,
    nom: "Station de montage moteur",
    type: "Poste manuel",
    capacite: 80,
    status: "active",
    utilisation: 60,
    derniereRevision: "2024-01-20",
    prochaineMaintenance: "2024-04-20"
  },
  {
    id: 4,
    nom: "Robot de soudure #2",
    type: "Soudure automatique",
    capacite: 120,
    status: "panne",
    utilisation: 0,
    derniereRevision: "2024-01-10",
    prochaineMaintenance: "2024-03-25"
  },
  {
    id: 5,
    nom: "Chaîne d'assemblage principale",
    type: "Chaîne d'assemblage",
    capacite: 200,
    status: "active",
    utilisation: 85,
    derniereRevision: "2024-02-05",
    prochaineMaintenance: "2024-05-05"
  }
];

export const getMachineById = (id: number): MachineData | undefined => {
  return defaultMachinesData.find(machine => machine.id === id);
};

export const getMachinesByStatus = (status: "active" | "panne" | "maintenance"): MachineData[] => {
  return defaultMachinesData.filter(machine => machine.status === status);
};

export const getMachinesByType = (type: string): MachineData[] => {
  return defaultMachinesData.filter(machine => machine.type === type);
};

export const getAvailableTypes = (): string[] => {
  const types = new Set(defaultMachinesData.map(machine => machine.type));
  return Array.from(types).sort();
};

export const getMachineStats = () => {
  const total = defaultMachinesData.length;
  const active = defaultMachinesData.filter(m => m.status === 'active').length;
  const maintenance = defaultMachinesData.filter(m => m.status === 'maintenance').length;
  const panne = defaultMachinesData.filter(m => m.status === 'panne').length;
  
  const averageUtilisation = total > 0 
    ? defaultMachinesData.reduce((acc, m) => acc + m.utilisation, 0) / total 
    : 0;
  
  const totalCapacity = defaultMachinesData.reduce((acc, m) => acc + m.capacite, 0);
  const effectiveCapacity = defaultMachinesData.reduce((acc, m) => acc + (m.capacite * m.utilisation / 100), 0);
  
  return {
    total,
    active,
    maintenance,
    panne,
    averageUtilisation,
    totalCapacity,
    effectiveCapacity
  };
};