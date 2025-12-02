import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function BannerTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>제목</TableHead>
        <TableHead>이미지</TableHead>
        <TableHead>링크</TableHead>
        <TableHead>배너 타입</TableHead>
        <TableHead>순서</TableHead>
        <TableHead>기간</TableHead>
        <TableHead>상태</TableHead>
        <TableHead>생성일</TableHead>
        <TableHead className='text-right'>액션</TableHead>
      </TableRow>
    </TableHeader>
  );
}
