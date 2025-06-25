import ContentLayout from "@/components/content-layout";
import Sidebar from "@/components/sidebar/sidebar";

export default function Home() {
  return (
    <div className="flex h-full w-full gap-4">
      <Sidebar />
      <ContentLayout>awe</ContentLayout>
    </div>
  );
}
