import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/nextauth";

export async function GET() {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const statements = await prisma.bankStatement.findMany({
    where: { userId: session.user.id },
    orderBy: { uploadedAt: "desc" },
    select: {
      id: true,
      bankName: true,
      periodFrom: true,
      periodTo: true,
      uploadedAt: true,
      _count: {
        select: { transactions: true },
      },
    },
  });

  return NextResponse.json(statements);
}

export async function DELETE(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  await prisma.bankStatement.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ success: true });
}
