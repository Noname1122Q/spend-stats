import PdfUpload from "@/components/PdfUpload";
import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Upload | Spend Stats",
};

const UploadPage = async () => {
  const session = await getAuthSession();

  if (!session) {
    return redirect("/");
  }
  return (
    <div className="flex items-center justify-center h-screen">
      <PdfUpload />
    </div>
  );
};

export default UploadPage;
