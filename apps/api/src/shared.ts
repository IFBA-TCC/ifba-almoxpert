// Shared types used across the monorepo

export enum UserType {
  ADMIN = 'admin',
  STUDENT = 'student',
}

export enum OrderStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DELIVERED = 'delivered',
}

export enum ShipmentStatus {
  OPEN = 'open',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum MovementType {
  IN = 'in',
  OUT = 'out',
}

export enum MovementOrigin {
  SHIPMENT = 'shipment',
  ORDER = 'order',
}

export enum SizeType {
  NONE     = 'none',
  CLOTHING = 'clothing',
  SHOES    = 'shoes',
}

export enum StudentAid {
  AUXILIO_ALIMENTACAO        = 'Auxílio Alimentação (VC)',
  AUXILIO_TRANSPORTE_MUNICIPAL = 'Auxílio Transporte Municipal (VC)',
  AUXILIO_COPIA_IMPRESSAO    = 'Auxílio Cópia e Impressão (VC)',
  BOLSA_ESTUDO               = 'Bolsa de Estudo (VC)',
  AUXILIO_MORADIA            = 'Auxílio Moradia (VC)',
  AUXILIO_TRANSPORTE_INTERMUNICIPAL = 'Auxílio Transporte Intermunicipal (VC)',
}

export enum EducationLevel {
  GRADUACAO = 'Graduação',
  MEDIO     = 'Médio',
}

export enum StudentModality {
  BACHARELADO          = 'Bacharelado',
  LICENCIATURA         = 'Licenciatura',
  TECNICO_INTEGRADO    = 'Técnico Integrado',
  TECNICO_SUBSEQUENTE  = 'Técnico Subsequente',
}

export const CLOTHING_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'GGG'] as const;
export const SHOE_SIZES     = ['33','34','35','36','37','38','39','40','41','42','43','44','45'] as const;
export const NO_SIZE        = 'none' as const;

export interface JwtPayload {
  sub: number;       // user id
  email: string;
  userType: UserType;
  iat?: number;
  exp?: number;
}
