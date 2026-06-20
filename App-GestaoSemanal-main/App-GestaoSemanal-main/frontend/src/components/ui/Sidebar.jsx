import { useState } from "react";
import { Menu, ClipboardList, CheckCircle2, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const MENU_ITEMS = [
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

export default function Sidebar({
  currentView,
  setCurrentView
}) {
  const [open, setOpen] = useState(false);

  const currentLabel =
    MENU_ITEMS.find(item => item.id === currentView)?.label ||
    "Gestão de Demandas";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[85vw] max-w-[320px] p-0"
      >
        <div className="h-full flex flex-col">
          <div className="border-b p-6">
            <h2 className="font-bold text-lg">
              Gestão Semanal
            </h2>

            <p className="text-xs text-slate-500 mt-2">
              Tela atual
            </p>

            <p className="font-semibold text-[#004C97]">
              {currentLabel}
            </p>
          </div>

          <div className="flex-1 p-4 space-y-2">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCurrentView(item.id);
                    setOpen(false);
                  }}
                  className={
                    currentView === item.id
                      ? "w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer bg-[#004C97] text-white shadow-md"
                      : "w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-slate-100 text-slate-700 transition-all duration-200"
                  }
                >
                  <Icon className="w-5 h-5" />

                  <span className="font-medium">
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
