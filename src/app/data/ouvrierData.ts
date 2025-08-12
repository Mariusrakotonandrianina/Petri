export interface Ouvrier {
    id: number;
    nom: string;
    specialite: string;
    niveau: "Expert" | "Confirmé" | "Débutant";
    statut: "disponible" | "occupe" | "pause";
    tacheActuelle?: string | null;
    heuresJour: number;
    heuresMax: number;
    competences: string[];
}

export const defaultOuvriersData: Ouvrier[] = [
    {
      id: 1,
      nom: "Jean Dupont",
      specialite: "Assemblage",
      niveau: "Expert",
      statut: "disponible",
      tacheActuelle: null,
      heuresJour: 6.5,
      heuresMax: 8,
      competences: ["Assemblage", "Montage moteur", "Contrôle qualité"]
    },
    {
      id: 2,
      nom: "Marie Martin",
      specialite: "Peinture",
      niveau: "Confirmé",
      statut: "occupe",
      tacheActuelle: "Peinture voiture #142",
      heuresJour: 7,
      heuresMax: 8,
      competences: ["Peinture", "Préparation surface", "Finition"]
    },
    {
      id: 3,
      nom: "Pierre Durand",
      specialite: "Diagnostic",
      niveau: "Expert",
      statut: "pause",
      tacheActuelle: null,
      heuresJour: 4,
      heuresMax: 8,
      competences: ["Diagnostic électronique", "Réparation", "Tests"]
    },
    {
      id: 4,
      nom: "Sophie Lemaire",
      specialite: "Contrôle qualité",
      niveau: "Confirmé",
      statut: "disponible",
      tacheActuelle: null,
      heuresJour: 5.5,
      heuresMax: 8,
      competences: ["Contrôle qualité", "Tests", "Documentation"]
    },
    {
      id: 5,
      nom: "Lucas Bernard",
      specialite: "Assemblage",
      niveau: "Débutant",
      statut: "occupe",
      tacheActuelle: "Assemblage châssis #89",
      heuresJour: 3,
      heuresMax: 8,
      competences: ["Assemblage de base", "Aide montage"]
    }
];

export const getOperateurById = (id: number): Ouvrier | undefined => {
    return defaultOuvriersData.find(operateur => operateur.id === id);
  };