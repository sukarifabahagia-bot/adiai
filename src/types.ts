export type Subject = 'Pendidikan Agama' | 'PPKn' | 'Bahasa Indonesia' | 'Matematika' | 'Seni Budaya' | 'PLH' | 'Bahasa Inggris';

export type Religion = 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Khonghucu';

export interface IdentitasModul {
  namaPenyusun: string;
  satuanPendidikan: string;
  fase: string;
  kelas: string;
  mataPelajaran: string;
  alokasiWaktu: string;
}

export interface AssessmentResult {
  id: string;
  studentName: string;
  subject: string;
  score: number;
  totalQuestions: number;
  date: string;
  type: string;
}
