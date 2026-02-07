import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";

type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  balance: number | null;
  type: "CREDIT" | "DEBIT";
  bankName: string;
};

type Props = {
  rows: Transaction[];
  page: number;
  setPage: (page: number) => void;
};

export default function Transactions({ rows, page, setPage }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <TransactionTable rows={rows} />
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p: number) => Math.max(1, p - 1))}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext onClick={() => setPage((p: number) => p + 1)} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardContent>
    </Card>
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
