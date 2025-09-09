'use client';

import { HospitalEditForm } from './HospitalEditForm';

interface HospitalEditProps {
  hospitalId: string;
}

export function HospitalEdit({ hospitalId }: HospitalEditProps) {
  return <HospitalEditForm hospitalId={hospitalId} />;
}
