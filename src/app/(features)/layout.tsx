import Sidebar from "@/components/ResponsiveSideBar";


export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white"> 
      <Sidebar />
      <main className="flex-1 w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}