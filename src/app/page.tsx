// app/[...not-found]/page.tsx
import { redirect } from "next/navigation";

export default function CatchAllRedirectPage() {
  redirect("/add-region");
}
