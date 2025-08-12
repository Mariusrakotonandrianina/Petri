import { Machine } from "../../entities/Machines";

export interface IMachineRepository {
  findAll(): Promise<Machine[]>;
  findById(id: number): Promise<Machine | null>;
  save(machine: Machine): Promise<Machine>;
  update(id: number, machine: Partial<Machine>): Promise<Machine | null>;
  delete(id: number): Promise<boolean>;
  findByStatus(status: "active" | "panne" | "maintenance"): Promise<Machine[]>;
}