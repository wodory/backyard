import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TagForm from "@/components/tags/TagForm";
import TagList from "@/components/tags/TagList";

export const metadata: Metadata = {
  title: "태그 관리 | Backyard",
  description: "태그를 생성하고 관리하는 페이지입니다.",
};

export default async function TagsPage() {
  let tags = [];
  
  try {
    tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: { cardTags: true }
        }
      }
    });
  } catch (error) {
    console.error("태그 조회 오류:", error);
    // 오류 발생 시 빈 배열 사용
  }

  const formattedTags = tags.map(tag => ({
    id: tag.id,
    name: tag.name,
    count: tag._count.cardTags,
    createdAt: formatDate(tag.createdAt)
  }));

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">태그 관리</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>새 태그 추가</CardTitle>
            </CardHeader>
            <CardContent>
              <TagForm />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>태그 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <TagList initialTags={formattedTags} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 