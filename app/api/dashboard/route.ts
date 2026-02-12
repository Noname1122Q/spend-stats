import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/nextauth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const page = Number(req.nextUrl.searchParams.get("page") || 1);
  const TAKE = 20;
  const SKIP = (page - 1) * TAKE;

  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");

  let dateFilter: any = {};

  if (from || to) {
    dateFilter.date = {};

    if (from) {
      dateFilter.date.gte = new Date(from);
    }

    if (to) {
      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999); // include full day
      dateFilter.date.lte = endDate;
    }
  }

  const userId = session.user.id;

  const [latestBalanceTx, creditAgg, debitAgg] = await Promise.all([
    prisma.transaction.findFirst({
      where: {
        statement: { userId },
        balance: { not: null },
        ...dateFilter,
      },
      orderBy: { date: "desc" },
      select: { balance: true },
    }),

    prisma.transaction.aggregate({
      where: {
        statement: { userId },
        type: "CREDIT",
        ...dateFilter,
      },
      _sum: { amount: true },
    }),

    prisma.transaction.aggregate({
      where: {
        statement: { userId },
        type: "DEBIT",
        ...dateFilter,
      },
      _sum: { amount: true },
    }),
  ]);

  const summary = {
    currentBalance: latestBalanceTx?.balance ?? 0,
    totalCredits: creditAgg._sum.amount ?? 0,
    totalDebits: debitAgg._sum.amount ?? 0,
  };

  const balanceSeries = await prisma.transaction.findMany({
    where: {
      statement: { userId },
      balance: { not: null },
      ...dateFilter,
    },
    orderBy: { date: "asc" },
    select: {
      date: true,
      balance: true,
    },
  });

  const bankSplitRaw = await prisma.transaction.groupBy({
    by: ["statementId"],
    where: {
      statement: { userId },
      ...dateFilter,
    },
    _count: true,
  });

  const statementBanks = await prisma.bankStatement.findMany({
    where: { userId },
    select: { id: true, bankName: true },
  });

  const bankMap = new Map(
    statementBanks.map((s) => [s.id, s.bankName || "Unknown"]),
  );

  const bankTotals: Record<string, number> = {};

  for (const row of bankSplitRaw) {
    const bank = bankMap.get(row.statementId) || "Unknown";
    bankTotals[bank] = (bankTotals[bank] || 0) + row._count;
  }

  const bankSplit = Object.entries(bankTotals).map(([bank, value]) => ({
    bank,
    value,
  }));

  const topCredits = await prisma.transaction.findMany({
    where: {
      statement: { userId },
      type: "CREDIT",
      ...dateFilter,
    },
    orderBy: { amount: "desc" },
    take: 10,
    select: {
      id: true,
      date: true,
      description: true,
      amount: true,
    },
  });

  const topDebits = await prisma.transaction.findMany({
    where: {
      statement: { userId },
      type: "DEBIT",
      ...dateFilter,
    },
    orderBy: { amount: "desc" },
    take: 10,
    select: {
      id: true,
      date: true,
      description: true,
      amount: true,
    },
  });

  const transactions = await prisma.transaction.findMany({
    where: {
      statement: { userId },
      ...dateFilter,
    },
    orderBy: { date: "desc" },
    skip: SKIP,
    take: TAKE,
    select: {
      id: true,
      date: true,
      description: true,
      amount: true,
      type: true,
      statement: {
        select: { bankName: true },
      },
    },
  });

  const formattedTransactions = transactions.map((t) => ({
    ...t,
    bankName: t.statement.bankName,
  }));

  return NextResponse.json({
    summary,
    balanceSeries,
    bankSplit,
    topCredits,
    topDebits,
    transactions: formattedTransactions,
  });
}
