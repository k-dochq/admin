import { Card, CardContent } from '@/components/ui/card';

export function EmptyLocalesCard() {
  return (
    <Card>
      <CardContent className="py-8 text-center text-muted-foreground">
        이 버전에 대한 로케일 데이터가 없습니다.
      </CardContent>
    </Card>
  );
}
