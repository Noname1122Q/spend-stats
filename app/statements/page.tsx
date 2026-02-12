"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Statement = {
  id: string;
  bankName: string | null;
  periodFrom: string | null;
  periodTo: string | null;
  uploadedAt: string;
  _count: {
    transactions: number;
  };
};

export default function StatementsPage() {
  const [statements, setStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatements = async () => {
    const res = await fetch("/api/statements");
    const data = await res.json();
    setStatements(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStatements();
  }, []);

  const deleteStatement = async (id: string) => {
    const confirmDelete = confirm(
      "Are you sure? This will permanently delete the statement and all its transactions.",
    );

    if (!confirmDelete) return;

    await fetch("/api/statements", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    fetchStatements(); // refresh list
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 space-y-6 bg-muted min-h-screen">
      <h1 className="text-2xl font-bold">Your Statements</h1>

      {statements.length === 0 && (
        <div className="text-muted-foreground">No statements uploaded yet.</div>
      )}

      {statements.map((s) => (
        <Card key={s.id}>
          <CardHeader>
            <CardTitle>{s.bankName || "Unknown Bank"}</CardTitle>
          </CardHeader>

          <CardContent className="flex justify-between items-center">
            <div className="space-y-1 text-sm">
              <div>
                Period:{" "}
                {s.periodFrom ? new Date(s.periodFrom).toDateString() : "N/A"} →{" "}
                {s.periodTo ? new Date(s.periodTo).toDateString() : "N/A"}
              </div>
              <div>Transactions: {s._count.transactions}</div>
              <div>Uploaded: {new Date(s.uploadedAt).toDateString()}</div>
            </div>

            <Button variant="destructive" onClick={() => deleteStatement(s.id)}>
              Delete
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
