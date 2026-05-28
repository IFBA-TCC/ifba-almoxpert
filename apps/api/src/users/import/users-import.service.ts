import { Injectable, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { UsersService } from '../users.service';
import { EmailService } from '../../email/email.service';
import { StudentAid, EducationLevel, StudentModality, UserType } from 'shared';

export interface ImportRowError {
  row: number;
  field: string;
  message: string;
}

export interface ImportValidationResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  errorRows: number;
  errors: ImportRowError[];
}

export interface ImportResult {
  created: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

const VALID_AIDS   = new Set(Object.values(StudentAid));
const VALID_LEVELS = new Set(Object.values(EducationLevel));
const VALID_MOD    = new Set(Object.values(StudentModality));

const REQUIRED_HEADERS = [
  'Matricula',
  'Nome Completo',
];

const HEADER_MAP: Record<string, string> = {
  'Matricula':                          'registrationNumber',
  'Nome Completo':                      'name',
  'E-mail':                             'email',
  'Campus':                             'campus',
  'Curso':                              'course',
  'Nível Ensino':                       'educationLevel',
  'Modalidade':                         'modality',
  'Bolsas Auxilios Aprovados':          'aids',
  'Tipos de Refeição (caso seja auxílio alimentação)': 'mealTypes',
};

interface ParsedRow {
  rowIndex:           number;
  registrationNumber: string;
  name:               string;
  email?:             string;
  campus?:            string;
  course?:            string;
  educationLevel?:    string;
  modality?:          string;
  aids?:              string[];
  mealTypes?:         string;
}

@Injectable()
export class UsersImportService {
  private readonly logger = new Logger(UsersImportService.name);

  constructor(
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}

  private parseWorkbook(buffer: Buffer): ParsedRow[] {
    const wb    = XLSX.read(buffer, { type: 'buffer' });
    const ws    = wb.Sheets[wb.SheetNames[0]];
    const raw   = XLSX.utils.sheet_to_json<Record<string, any>>(ws, {
      defval: '',
      raw:    false,
    });

    return raw.map((row, i) => {
      const r: ParsedRow = {
        rowIndex:           i + 2, // +2 because row 1 = header, data starts at 2
        registrationNumber: String(row['Matricula'] ?? '').trim(),
        name:               String(row['Nome Completo'] ?? '').trim(),
        email:              String(row['E-mail'] ?? '').trim() || undefined,
        campus:             String(row['Campus'] ?? '').trim() || undefined,
        course:             String(row['Curso'] ?? '').trim() || undefined,
        educationLevel:     String(row['Nível Ensino'] ?? '').trim() || undefined,
        modality:           String(row['Modalidade'] ?? '').trim() || undefined,
        mealTypes:          String(row['Tipos de Refeição (caso seja auxílio alimentação)'] ?? '').trim() || undefined,
      };

      const aidRaw = String(row['Bolsas Auxilios Aprovados'] ?? '').trim();
      if (aidRaw && aidRaw !== '-') {
        r.aids = aidRaw.split(',').map((s) => s.trim()).filter(Boolean);
      }

      return r;
    });
  }

  validate(buffer: Buffer): ImportValidationResult {
    const rows   = this.parseWorkbook(buffer);
    const errors: ImportRowError[] = [];

    for (const row of rows) {
      const { rowIndex: ri } = row;

      if (!row.registrationNumber) {
        errors.push({ row: ri, field: 'Matricula', message: 'Matrícula é obrigatória' });
      }

      if (!row.name) {
        errors.push({ row: ri, field: 'Nome Completo', message: 'Nome é obrigatório' });
      }

      if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        errors.push({ row: ri, field: 'E-mail', message: `E-mail inválido: "${row.email}"` });
      }

      if (row.educationLevel && !VALID_LEVELS.has(row.educationLevel as EducationLevel)) {
        errors.push({
          row: ri,
          field: 'Nível Ensino',
          message: `Valor inválido: "${row.educationLevel}". Esperado: ${Object.values(EducationLevel).join(' | ')}`,
        });
      }

      if (row.modality && !VALID_MOD.has(row.modality as StudentModality)) {
        errors.push({
          row: ri,
          field: 'Modalidade',
          message: `Valor inválido: "${row.modality}". Esperado: ${Object.values(StudentModality).join(' | ')}`,
        });
      }

      if (row.aids) {
        for (const aid of row.aids) {
          if (!VALID_AIDS.has(aid as StudentAid)) {
            errors.push({
              row: ri,
              field: 'Bolsas Auxilios Aprovados',
              message: `Auxílio inválido: "${aid}"`,
            });
          }
        }
      }

    }

    const errorRowNumbers = new Set(errors.map((e) => e.row));
    return {
      valid:     errors.length === 0,
      totalRows: rows.length,
      validRows: rows.length - errorRowNumbers.size,
      errorRows: errorRowNumbers.size,
      errors,
    };
  }

  async import(buffer: Buffer): Promise<ImportResult> {
    const rows    = this.parseWorkbook(buffer);
    let created   = 0;
    let skipped   = 0;
    const errors: { row: number; message: string }[] = [];
    const toEmail: { name: string; email: string; password: string }[] = [];

    for (const row of rows) {
      if (!row.registrationNumber || !row.name) {
        errors.push({ row: row.rowIndex, message: 'Matrícula e nome são obrigatórios' });
        continue;
      }

      const email    = row.email || `${row.registrationNumber.toLowerCase()}@aluno.ifba.edu.br`;
      const password = `ifba.${row.registrationNumber}`;

      try {
        await this.usersService.create({
          name:               row.name,
          email,
          password,
          userType:           UserType.STUDENT,
          registrationNumber: row.registrationNumber,
          course:         row.course,
          campus:         row.campus,
          educationLevel: row.educationLevel as EducationLevel,
          modality:       row.modality as StudentModality,
          aids:           row.aids as StudentAid[],
          mealTypes:      row.mealTypes,
        });
        created++;
        toEmail.push({ name: row.name, email, password });
      } catch (err: any) {
        if (err?.status === 409 || err?.code === 'ER_DUP_ENTRY') {
          skipped++;
        } else {
          errors.push({ row: row.rowIndex, message: err?.message ?? 'Erro desconhecido' });
        }
      }
    }

    // Dispara welcome emails em paralelo sem bloquear a resposta
    if (toEmail.length > 0) {
      Promise.allSettled(
        toEmail.map((u) => this.emailService.sendWelcome(u.email, u.name, u.password)),
      ).then((results) => {
        const failed = results.filter((r) => r.status === 'rejected').length;
        if (failed > 0) {
          this.logger.warn(`${failed} de ${toEmail.length} e-mails de boas-vindas falharam.`);
        } else {
          this.logger.log(`${toEmail.length} e-mail(s) de boas-vindas enviado(s).`);
        }
      });
    }

    return { created, skipped, errors };
  }

  generateTemplate(): Buffer {
    const wb = XLSX.utils.book_new();

    // ── Sheet 1: dados ────────────────────────────────────────────────────────
    const dataRows = [
      [
        'Matricula',
        'Nome Completo',
        'E-mail',
        'Campus',
        'Curso',
        'Nível Ensino',
        'Modalidade',
        'Bolsas Auxilios Aprovados',
        'Tipos de Refeição (caso seja auxílio alimentação)',
      ],
      [
        '20240001',
        'Exemplo da Silva',
        '20240001@aluno.ifba.edu.br',
        'VC',
        '119 - Bacharelado em Sistemas de Informação',
        EducationLevel.GRADUACAO,
        StudentModality.BACHARELADO,
        `${StudentAid.AUXILIO_ALIMENTACAO}, ${StudentAid.AUXILIO_TRANSPORTE_MUNICIPAL}`,
        'Almoço',
      ],
    ];

    const ws1 = XLSX.utils.aoa_to_sheet(dataRows);
    ws1['!cols'] = [
      { wch: 15 }, { wch: 40 }, { wch: 35 }, { wch: 8 }, { wch: 60 },
      { wch: 15 }, { wch: 22 }, { wch: 60 }, { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(wb, ws1, 'Alunos');

    // ── Sheet 2: instruções ───────────────────────────────────────────────────
    const helpRows: string[][] = [
      ['Campo', 'Obrigatório', 'Valores aceitos / Descrição'],
      ['Matricula', 'Sim', 'Número de matrícula único do aluno'],
      ['Nome Completo', 'Sim', 'Nome completo do aluno'],
      ['E-mail', 'Não', 'E-mail do aluno. Se não informado, será gerado como matricula@aluno.ifba.edu.br'],
      ['Campus', 'Não', 'Sigla do campus (ex: VC)'],
      ['Curso', 'Não', 'Código e nome do curso'],
      ['Nível Ensino', 'Não', Object.values(EducationLevel).join(' | ')],
      ['Modalidade', 'Não', Object.values(StudentModality).join(' | ')],
      ['Bolsas Auxilios Aprovados', 'Não', `Separe múltiplos valores com vírgula:\n${Object.values(StudentAid).join('\n')}`],
      ['Tipos de Refeição', 'Não', 'Almoço | Jantar | Café da manhã | Almoço, Café da manhã'],
    ];

    const ws2 = XLSX.utils.aoa_to_sheet(helpRows);
    ws2['!cols'] = [{ wch: 35 }, { wch: 12 }, { wch: 100 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Instruções');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}
