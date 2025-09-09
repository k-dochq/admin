import { HospitalEdit } from '@/features/hospital-edit';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function HospitalEditPage({ params }: PageProps) {
  const { id } = await params;

  return <HospitalEdit hospitalId={id} />;
}
