import AIAssistant from '@/components/AIAssistant';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <AIAssistant />
    </>
  );
}