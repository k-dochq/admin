import { DoctorForm } from 'features/doctor-edit';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DoctorEditPage({ params }: PageProps) {
  const { id } = await params;

  return <DoctorForm mode='edit' doctorId={id} />;
}
