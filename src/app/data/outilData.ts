export interface Outil {
    id: number;
    nom: string;
    type: string;
    quantite: number;
    disponible: number;
    enUse: number;
    etat: "bon" | "usure" | "reparation";
    derniereVerification: string;
    prochaineVerification: string;
}

export const defaultOutilsData: Outil[] = [
    {
      id: 1,
      nom: "Clé dynamométrique #3",
      type: "Outil spécialisé",
      quantite: 2,
      disponible: 1,
      enUse: 1,
      etat: "bon",
      derniereVerification: "2024-02-01",
      prochaineVerification: "2024-04-01"
    },
    {
      id: 2,
      nom: "Pistolet à peinture",
      type: "Équipement peinture",
      quantite: 3,
      disponible: 3,
      enUse: 0,
      etat: "bon",
      derniereVerification: "2024-01-15",
      prochaineVerification: "2024-03-15"
    },
    {
      id: 3,
      nom: "Cric hydraulique",
      type: "Équipement levage",
      quantite: 4,
      disponible: 2,
      enUse: 2,
      etat: "usure",
      derniereVerification: "2024-01-10",
      prochaineVerification: "2024-03-10"
    },
    {
      id: 4,
      nom: "Scanner diagnostic",
      type: "Outil électronique",
      quantite: 1,
      disponible: 0,
      enUse: 1,
      etat: "reparation",
      derniereVerification: "2024-01-05",
      prochaineVerification: "2024-03-05"
    }
  ];

  export const getOutilById = (id: number): Outil | undefined => {
    return defaultOutilsData.find(outil => outil.id === id);
  };
  