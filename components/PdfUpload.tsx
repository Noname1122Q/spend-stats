"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Upload, Loader2 } from "lucide-react";

const PdfUpload = () => {
  const [loading, setLoading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    await fetch("/api/parse-statement", {
      method: "POST",
      body: formData,
    });

    setLoading(false);
    alert("Statement processed.");
  }

  return (
    <Card className="w-96">
      <CardHeader className="text-center">
        <CardTitle>Upload Bank Statement</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-4">
        {!loading ? (
          <>
            <Input
              type="file"
              accept="application/pdf"
              onChange={handleUpload}
              className="cursor-pointer"
            />

            <Button className="w-full" disabled>
              <Upload className="mr-2 h-4 w-4" />
              PDF Only
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Parsing your statement…
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PdfUpload;
