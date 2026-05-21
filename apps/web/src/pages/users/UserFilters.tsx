import React from 'react';
import { FilterBar, type FilterFieldDef } from '../../components/ui/FilterBar';

export interface UserFiltersState {
  name: string;
  isActive: string;
  createdFrom: string;
  createdTo: string;
  registrationNumber: string;
  course: string;
  position: string;
}

export const defaultFilters: UserFiltersState = {
  name: '',
  isActive: '',
  createdFrom: '',
  createdTo: '',
  registrationNumber: '',
  course: '',
  position: '',
};

const baseFields: FilterFieldDef[] = [
  { key: 'name',        label: 'Nome',        type: 'text',   placeholder: 'Buscar por nome...' },
  { key: 'isActive',    label: 'Status',      type: 'select', placeholder: 'Todos os status', options: [{ value: 'true', label: 'Ativo' }, { value: 'false', label: 'Inativo' }] },
  { key: 'createdFrom', label: 'A partir de', type: 'date' },
  { key: 'createdTo',   label: 'Até',         type: 'date' },
];

const studentFields: FilterFieldDef[] = [
  { key: 'registrationNumber', label: 'Matrícula', type: 'text', placeholder: 'Matrícula...' },
  { key: 'course',             label: 'Curso',     type: 'text', placeholder: 'Curso...' },
];

const adminFields: FilterFieldDef[] = [
  { key: 'position', label: 'Cargo', type: 'text', placeholder: 'Cargo...' },
];

interface Props {
  filters: UserFiltersState;
  onChange: (filters: UserFiltersState) => void;
  typeFilter: 'all' | 'admin' | 'student';
}

export const UserFilters: React.FC<Props> = ({ filters, onChange, typeFilter }) => {
  const extraFields =
    typeFilter === 'student' ? studentFields :
    typeFilter === 'admin'   ? adminFields   :
    [];

  // Intercala os campos extras entre Status e as datas
  const fields: FilterFieldDef[] = [
    ...baseFields.slice(0, 2),
    ...extraFields,
    ...baseFields.slice(2),
  ];

  return (
    <FilterBar
      filters={filters}
      defaults={defaultFilters}
      fields={fields}
      onChange={onChange}
    />
  );
};
