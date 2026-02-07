"use client";

import BalanceOverTime from "@/components/dashboard/BalanceOverTime";
import BankWise from "@/components/dashboard/BankWise";
import TopCards from "@/components/dashboard/TopCards";
import TopTable from "@/components/dashboard/TopTable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

// ---------------- types ----------------

type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  balance: number | null;
  type: "CREDIT" | "DEBIT";
  bankName: string;
};

// ---------------- dashboard ----------------

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [balanceSeries, setBalanceSeries] = useState<any[]>([]);
  const [bankSplit, setBankSplit] = useState<any[]>([]);
  const [topCredits, setTopCredits] = useState<Transaction[]>([]);
  const [topDebits, setTopDebits] = useState<Transaction[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`/api/dashboard?page=${page}`)
      .then((res) => res.json())
      .then((data) => {
        setSummary(data.summary);
        setBalanceSeries(data.balanceSeries);
        setBankSplit(data.bankSplit);
        setTopCredits(data.topCredits);
        setTopDebits(data.topDebits);
        setTransactions(data.transactions);
      });
  }, [page]);

  if (!summary) return <div className="p-10">Loading dashboard…</div>;

  return (
    <div className="p-8 space-y-8 bg-muted min-h-screen">
      <TopCards summary={summary} />

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceOverTime balanceSeries={balanceSeries} />
        <BankWise bankSplit={bankSplit} />
      </div>

      {/* TOP TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopTable title="Top 10 Credits" rows={topCredits} positive />
        <TopTable title="Top 10 Debits" rows={topDebits} />
      </div>

      {/* ALL TRANSACTIONS */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionTable rows={transactions} />
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext onClick={() => setPage((p) => p + 1)} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>
    </div>
  );
}

function TransactionTable({ rows }: { rows: Transaction[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Bank</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((t) => (
          <TableRow key={t.id}>
            <TableCell>{new Date(t.date).toDateString()}</TableCell>
            <TableCell>{t.description}</TableCell>
            <TableCell>{t.bankName}</TableCell>
            <TableCell>
              <Badge
                variant={t.type === "CREDIT" ? "secondary" : "destructive"}
              >
                {t.type}
              </Badge>
            </TableCell>
            <TableCell className="text-right">₹{t.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
