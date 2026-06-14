import { Menu, ClipboardList, CheckCircle2, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function Sidebar({ currentView, setCurrentView }) {
  const items = [
    {
      id: "demands",
      label: "Gestão de Demandas",
      icon: ClipboardList
    },
    {
      id: "completed",
      label: "Concluídos",
      icon: CheckCircle2
    },
    {
      id: "admin",
      label: "Administração",
      icon: Settings
    }
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[320px] p-0">
        <div className="h-full flex flex-col">
          <div className="border-b p-6">
            <h2 className="font-bold text-lg">
              Gestão Semanal
            </h2>
          </div>

          <div className="flex-1 p-4 space-y-2">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    currentView === item.id
                      ? "bg-sky-50 text-sky-700 border border-sky-200"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />

                  <span className="font-medium">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
