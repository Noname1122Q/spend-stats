export const runtime = "nodejs";

import PDFParser from "pdf2json";

/* ---------------- ROW RECONSTRUCTION ---------------- */

function extractStructuredRows(data: any): string[] {
  const lines: string[] = [];

  data.Pages.forEach((page: any) => {
    const items: { x: number; y: number; text: string }[] = [];

    page.Texts.forEach((t: any) => {
      items.push({
        x: t.x,
        y: t.y,
        text: decodeURIComponent(t.R[0].T),
      });
    });

    items.sort((a, b) => {
      if (Math.abs(a.y - b.y) > 0.5) return a.y - b.y;
      return a.x - b.x;
    });

    const rows: { x: number; text: string }[][] = [];
    let currentRow: { x: number; text: string }[] = [];
    let lastY: number | null = null;

    const Y_THRESHOLD = 0.5;

    items.forEach((item) => {
      if (lastY === null || Math.abs(item.y - lastY) <= Y_THRESHOLD) {
        currentRow.push({ x: item.x, text: item.text });
      } else {
        rows.push(currentRow);
        currentRow = [{ x: item.x, text: item.text }];
      }
      lastY = item.y;
    });

    if (currentRow.length) rows.push(currentRow);

    rows.forEach((row) => {
      const line = row
        .sort((a, b) => a.x - b.x)
        .map((cell) => cell.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      lines.push(line);
    });
  });

  return lines;
}

/* ---------------- MERGE CONTINUATION ROWS ---------------- */

function mergeTransactionRows(rows: string[]): string[] {
  const merged: string[] = [];
  const dateRegex = /^\d{1,2}-\d{1,2}-\d{4}/;

  rows.forEach((row) => {
    if (dateRegex.test(row)) {
      merged.push(row);
    } else if (merged.length > 0) {
      merged[merged.length - 1] += " " + row;
    }
  });

  return merged;
}

/* ---------------- STRUCTURED PARSER ---------------- */

function parseTransaction(line: string) {
  const dateMatch = line.match(/^(\d{1,2}-\d{1,2}-\d{4})/);
  if (!dateMatch) return null;

  const date = dateMatch[1];

  // Extract all decimal numbers
  const numbers = [...line.matchAll(/\d+\.\d{2}/g)].map((m) =>
    parseFloat(m[0]),
  );

  // We need at least amount + balance
  if (numbers.length < 2) return null;

  const balance = numbers[numbers.length - 1];
  const amount = numbers[numbers.length - 2];

  const description = line
    .replace(date, "")
    .replace(/\d+\.\d{2}/g, "")
    .replace(/\b(Cr|Dr)\b/gi, "")
    .trim();

  return {
    date,
    description,
    amount,
    balance,
    type: null, // will be assigned later
  };
}

/* ---------------- BALANCE RECONCILIATION ---------------- */

function assignTransactionTypes(transactions: any[]) {
  if (transactions.length === 0) return transactions;

  // First transaction assumed opening
  transactions[0].type = "OPENING";

  for (let i = 1; i < transactions.length; i++) {
    const prevBalance = Number(transactions[i - 1].balance);
    const currBalance = Number(transactions[i].balance);

    if (currBalance > prevBalance) {
      transactions[i].type = "CREDIT";
    } else if (currBalance < prevBalance) {
      transactions[i].type = "DEBIT";
    } else {
      transactions[i].type = "NO_CHANGE";
    }
  }

  return transactions;
}

function reconcileTransactions(transactions: any[]) {
  for (let i = 1; i < transactions.length; i++) {
    const prev = transactions[i - 1];
    const curr = transactions[i];

    if (curr.type === "OPENING") continue;

    const expected =
      curr.type === "CREDIT"
        ? prev.balance + curr.amount
        : prev.balance - curr.amount;

    if (Math.abs(expected - curr.balance) > 0.01) {
      console.error("Balance mismatch at:", curr.date);
      return false;
    }
  }

  return true;
}
/* ---------------- ROUTE ---------------- */

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("Step 1: file received");

    const buffer = Buffer.from(await file.arrayBuffer());

    console.log("Step 2: buffer created");

    const parsedData = await new Promise<any>((resolve, reject) => {
      const pdfParser = new PDFParser();

      pdfParser.on("pdfParser_dataError", (err: any) => {
        console.log("PDF ERROR EVENT");
        reject(err);
      });

      pdfParser.on("pdfParser_dataReady", (data: any) => {
        console.log("PDF READY EVENT");
        resolve(data);
      });

      pdfParser.parseBuffer(buffer);
    });

    console.log("Step 3: parsedData resolved");

    const rows = extractStructuredRows(parsedData);
    console.log("Total reconstructed rows:", rows.length);
    console.log("First 20 rows:", rows.slice(0, 20));
    const mergedRows = mergeTransactionRows(rows);
    console.log("Merged rows:", mergedRows.length);
    console.log("First 20 merged:", mergedRows.slice(0, 20));

    const transactions = mergedRows.map(parseTransaction).filter(Boolean);
    console.log("Parsed transactions:", transactions.length);
    console.log("First 10 parsed:", transactions.slice(0, 10));

    const assignedTransactions = assignTransactionTypes(transactions);
    console.log("First 10 assigned:");
    console.log(assignedTransactions.slice(0, 3));

    const isBalanced = reconcileTransactions(assignedTransactions);

    return Response.json({
      success: true,
      totalRows: rows.length,
      mergedTransactions: mergedRows.length,
      parsedTransactions: assignedTransactions.length,
      balanceCheckPassed: isBalanced,
      preview: assignedTransactions.slice(0, 10),
    });
  } catch (error) {
    console.error("PDF Parse Error:", error);
    return Response.json({ error: "Failed to parse PDF" }, { status: 500 });
  }
}
