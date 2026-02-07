import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  balance: number | null;
  type: "CREDIT" | "DEBIT";
  bankName: string;
};

export default function TopTable({ title, rows, positive }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((t: Transaction) => (
              <TableRow key={t.id}>
                <TableCell>{new Date(t.date).toDateString()}</TableCell>
                <TableCell>{t.description}</TableCell>
                <TableCell
                  className={`text-right ${positive ? "text-green-600" : "text-red-600"}`}
                >
                  ₹{t.amount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
