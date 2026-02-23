import { Card, CardContent } from '@/components/ui/card';

export function ErrorMessageCard({ message }: { message: string }) {
  return (
    <Card className="border-destructive bg-destructive/10">
      <CardContent className="pt-6">
        <p className="text-destructive">{message}</p>
      </CardContent>
    </Card>
  );
}
