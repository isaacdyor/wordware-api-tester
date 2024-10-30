import { AppLayout } from "@/components/app-layout";

const RootLayout: React.FC<{ children: React.ReactNode }> = async ({
  children,
}) => {
  return <AppLayout>{children}</AppLayout>;
};

export default RootLayout;
