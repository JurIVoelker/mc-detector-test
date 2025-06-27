// app/[...not-found]/page.tsx
import ContentLayout from "@/components/content-layout";
import Sidebar from "@/components/sidebar/sidebar";

export default function CatchAllRedirectPage() {
  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <ContentLayout>
        <h1 className="text-3xl font-semibold mb-6">Seite nicht gefunden</h1>
        <p className="text-muted-foreground max-w-[600px]">
          Die angeforderte Seite konnte nicht gefunden werden. Bitte überprüfe
          die URL oder navigiere über das Menü.
        </p>
      </ContentLayout>
    </div>
  );
}
