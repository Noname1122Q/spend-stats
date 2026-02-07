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
    <div>
      <PdfUpload />
    </div>
  );
};

export default UploadPage;
