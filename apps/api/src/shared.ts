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
