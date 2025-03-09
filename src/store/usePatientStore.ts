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
  collectionDate: string;
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
  // Campos para FASE 1 - Testes e Questionários
  satAtRestStartTC6: string; // SAT EM REPOUSO (%) - INÍCIO TC6
  satAtRestEndTC6: string; // SAT (%) FINAL TC6
  o2DuringTestTC6: string; // O2 DURANTE O TESTE (TC6)
  litersO2TC6: string; // LITROS DE O2 (TC6)
  tc6_1: string; // TC6-1
  tc6_2: string; // TC6-2
  satAtRestStartTSL: string; // SAT EM REPOUSO (%) - INÍCIO TSL
  satAtRestEndTSL: string; // SAT (%) FINAL TSL
  o2DuringTestTSL: string; // O2 DURANTE O TESTE (TSL)
  litersO2TSL: string; // LITROS DE O2 (TSL)
  tsl5RepSeconds: string; // TSL 5rep em segundos
  tpp: string; // TPP
  randomizationOrder: string; // Ordem randomização
  mrc: string; // MRC
  pgiQualitative: string; // PGI (qualitativo)
  pgiD1IntraScore: string; // PGI (D1 Intra) (escore total)
  pgiD1InterScore: string; // PGI (D1 inter) (escore total)
  pgiD2IntraScore: string; // PGI (D2 Intra) (escore total)
  kbildSimpleSum: string; // KBILD (Soma simples)
  kbildScale0_100: string; // KBILD (escala de 0-100)
  whodas: string; // WHODAS
  pahD1EMA: string; // PAH (D1) EMA
  pahD1EAA: string; // PAH (D1) EAA
  pahD1ActivityLevel: string; // Nivel de atividade (PAH) D1
  pahD2EMA: string; // PAH(D2) EMA
  pahD2EAA: string; // PAH(D2) EAA
  pahD2ActivityLevel: string; // Nivel de atividade (PAH) D2
  participationScale: string; // Escala de Participação
  participationScaleClassification: string; // Classificação Escala de Participação
  vef1CVF: string; // VEF1/CVF
  vef1CVFPred: string; // VEF1/CVF - %PRED
  vef1: string; // VEF1
  vef1Pred: string; // VEF1 - %PRED
  cvf: string; // CVF
  cvfPred: string; // CVF - %PRED
  pef: string; // PEF
  pefPred: string; // PEF - %PRED
  fef2575: string; // FEF2575
  fef257Pred: string; // FEF257 - %PRED
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
