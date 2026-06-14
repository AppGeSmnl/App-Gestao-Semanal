import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const API =
  "https://app-gestao-semanal-plus-version.onrender.com/api";

export default function CompletedView() {

  const [demands, setDemands] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const loadDemands = async () => {
    try {

      const res = await axios.get(
        `${API}/completed-demands`
      );

      setDemands(res.data);

    } catch {

      toast.error(
        "Erro ao carregar concluídos"
      );

    }
  };

  useEffect(() => {
    loadDemands();
  }, []);

  const filtered = useMemo(() => {

    return demands.filter(d =>
      (
        d.description +
        " " +
        (d.observation || "")
      )
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  }, [demands, search]);

  const grouped = useMemo(() => {

    const groups = {};

    filtered.forEach(item => {

      const date = new Date(
        item.completed_at
      ).toLocaleDateString("pt-BR");

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(item);

    });

    return groups;

  }, [filtered]);

  const deleteSelected = async () => {

    if (selectedIds.length === 0) {
      toast.error(
        "Selecione ao menos uma demanda"
      );
      return;
    }

    try {

      await axios.post(
        `${API}/completed-demands/bulk-delete`,
        {
          ids: selectedIds
        }
      );

      toast.success(
        "Demandas removidas"
      );

      setSelectedIds([]);
      setIsDeleteMode(false);

      loadDemands();

    } catch {

      toast.error(
        "Erro ao excluir"
      );

    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      <div className="mb-8 flex justify-between items-center">

        <div>

          <h1 className="text-3xl font-bold">
            Demandas Concluídas
          </h1>

          <p className="text-slate-500">
            Total: {demands.length}
          </p>

        </div>

        <div className="flex gap-3">

          <Input
            placeholder="Pesquisar..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-80"
          />

          {!isDeleteMode ? (

            <Button
              variant="destructive"
              onClick={() =>
                setIsDeleteMode(true)
              }
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>

          ) : (

            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteMode(false);
                  setSelectedIds([]);
                }}
              >
                Cancelar
              </Button>

              <Button
                variant="destructive"
                disabled={
                  selectedIds.length === 0
                }
                onClick={deleteSelected}
              >
                Excluir ({selectedIds.length})
              </Button>
            </>

          )}

        </div>

      </div>

      <div className="space-y-8">

        {Object.entries(grouped)
          .sort(
            (a, b) =>
              new Date(b[0]) -
              new Date(a[0])
          )
          .map(([date, items]) => (

            <div key={date}>

              <h2 className="text-lg font-bold mb-4 text-slate-700">
                {date}
              </h2>

              <div className="space-y-3">

                {items.map(item => (

                  <div
                    key={item.id}
                    className="bg-white border rounded-xl p-5 shadow-sm"
                  >

                    <div className="flex justify-between">

                      <div>

                        <p className="font-medium">
                          {item.description}
                        </p>

                        <p className="text-xs text-slate-500 mt-2">
                          Concluído em{" "}
                          {new Date(
                            item.completed_at
                          ).toLocaleString(
                            "pt-BR"
                          )}
                        </p>

                      </div>

                      {isDeleteMode && (

                        <Checkbox
                          checked={selectedIds.includes(
                            item.id
                          )}
                          onCheckedChange={() => {

                            if (
                              selectedIds.includes(
                                item.id
                              )
                            ) {

                              setSelectedIds(
                                selectedIds.filter(
                                  i =>
                                    i !== item.id
                                )
                              );

                            } else {

                              setSelectedIds([
                                ...selectedIds,
                                item.id
                              ]);

                            }

                          }}
                        />

                      )}

                    </div>

                  </div>

                ))}

              </div>

            </div>

          ))}

      </div>

    </div>
  );
}
