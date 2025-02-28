import { create } from "zustand";
import { supabase } from "../services/supabaseClient.js";

export interface Patient {
  id: string;
  name: string;
  diagnosis: string;
  phase: string;
  phone: string;
  callComments: string;
  transportation: "próprio" | "não próprio";
  recruitmentCity: string;
  nextCollectionDate: string;
  sex: string;
  age: string;
  heightMeters: string;
  weight: string;
  imc: string;
  imcClassification: string;
  education: string;
  race: string;
  maritalStatus: string;
  profession: string;
  smokingHistory: string;
  passiveSmokingHistory: string;
  stoveExposureHistory: string;
  medications: string;
  satAtRest: string;
  associatedComorbidities: string;
  charlsonComorbidityIndex: string;
  healthCondition: string;
}

interface PatientStore {
  patients: Patient[];
  fetchPatients: () => Promise<void>;
  addPatient: (patient: Omit<Patient, "id">) => Promise<boolean>;
  deletePatient: (id: string) => Promise<boolean>;
  updatePatient: (id: string, patient: Partial<Patient>) => Promise<boolean>;
}

export const usePatientStore = create<PatientStore>((set) => ({
  patients: [],

  fetchPatients: async () => {
    const { data, error } = await supabase.from("patients").select("*");
    if (!error) {
      set({ patients: data || [] });
    }
  },

  addPatient: async (patient) => {
    const { data, error } = await supabase
      .from("patients")
      .insert([patient])
      .select();

    if (error) {
      console.error("Erro ao adicionar paciente:", error);
      return false;
    }

    if (data) {
      set((state) => ({ patients: [...state.patients, ...data] }));
      return true;
    }

    return false;
  },

  deletePatient: async (id) => {
    console.log("Deletando paciente com ID:", id);
    const { error } = await supabase.from("patients").delete().eq("id", id);
    if (error) {
      console.error("Erro ao deletar paciente:", error);
      return false;
    }
    set((state) => ({ patients: state.patients.filter((p) => p.id !== id) }));
    return true;
  },

  updatePatient: async (id, patient) => {
    console.log("Atualizando paciente com ID:", id);
    const { error } = await supabase
      .from("patients")
      .update(patient)
      .eq("id", id);
    if (error) {
      console.error("Erro ao atualizar paciente:", error);
      return false;
    }
    set((state) => ({
      patients: state.patients.map((p) =>
        p.id === id ? { ...p, ...patient } : p
      ),
    }));
    return true;
  },
}));
