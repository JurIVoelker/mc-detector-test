import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const ContentLayout = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("w-full h-full min-h-screen p-8 pt-8", className)}>
      {children}
    </div>
  );
};

export default ContentLayout;
