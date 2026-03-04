export const runtime = "nodejs";

import { getAuthSession } from "@/lib/nextauth";
import prisma from "@/lib/prisma";
import PDFParser from "pdf2json";
import { callLLM } from "@/lib/genAi";

function extractText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", reject);

    pdfParser.on("pdfParser_dataReady", (data: any) => {
      const text = data.Pages.map((page: any) =>
        page.Texts.map((t: any) => decodeURIComponent(t.R[0].T)).join(" "),
      ).join("\n");

      resolve(text);
    });

    pdfParser.parseBuffer(buffer);
  });
}

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user) {
    return Response.json({ error: "You must be logged in!" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const buffer = Buffer.from(await file.arrayBuffer());

  const rawText = await extractText(buffer);

  /* ---------------- TEXT → OPENAI (JSON MODE) ---------------- */

  const prompt = `
You are a bank statement parser.

Extract structured data from the following bank statement text.

Return ONLY valid JSON.
Do not include markdown.
Do not include explanations.

Schema:
{
  "bankName": string,
  "periodFrom": string | null,
  "periodTo": string | null,
  "transactions": [
    {
      "date": string,
      "description": string,
      "amount": number,
      "balance": number | null,
      "type": "CREDIT" | "DEBIT",
      "reference": string | null
    }
  ]
}

Bank Statement Text:
${rawText}
`;

  const structured = await callLLM(prompt);

  /* ---------------- SAVE TO DB ---------------- */

  const statement = await prisma.bankStatement.create({
    data: {
      userId: session.user.id,
      fileName: file.name,
      bankName: structured.bankName,
      periodFrom: structured.periodFrom
        ? new Date(structured.periodFrom)
        : null,
      periodTo: structured.periodTo ? new Date(structured.periodTo) : null,
      transactions: {
        create: structured.transactions.map((t: any) => ({
          date: new Date(t.date),
          description: t.description,
          amount: t.amount,
          balance: t.balance,
          type: t.type,
          reference: t.reference,
        })),
      },
    },
  });

  return Response.json({ success: true, id: statement.id });
}
