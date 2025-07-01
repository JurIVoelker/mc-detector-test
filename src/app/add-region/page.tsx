import ContentLayout from "@/components/content-layout";
import { McaDropzone } from "@/components/mca-dropzone";
import Sidebar from "@/components/sidebar/sidebar";

export const dynamic = "force-dynamic";

const AddRegionPage = () => {
  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <ContentLayout>
        <h1 className="text-3xl font-semibold mb-6">Region Hinzufügen</h1>
        <McaDropzone className="h-full" />
      </ContentLayout>
    </div>
  );
};

export default AddRegionPage;
