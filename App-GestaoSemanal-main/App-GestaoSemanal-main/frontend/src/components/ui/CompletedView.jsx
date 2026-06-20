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
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterSubgroup, setFilterSubgroup] = useState("all");
  const [filterResponsible, setFilterResponsible] = useState("all");
  const [demands, setDemands] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [periodFilter, setPeriodFilter] = useState("all");
  const [exactDate, setExactDate] = useState("");

const allSubgroups = useMemo(() => {
  const set = new Set();

  demands.forEach(d => {

    const groups =
      typeof d.subgroup === "string"
        ? d.subgroup.split(", ")
        : d.subgroup || [];

    groups.forEach(g => set.add(g));
  });

  return [...set];

}, [demands]);
  
const allResponsibles = useMemo(() => {
  const set = new Set();

  demands.forEach(d => {
const people =
  typeof d.responsible === "string"
    ? d.responsible.split(", ")
    : d.responsible || [];
    people.forEach(p => set.add(p));
  });

  return [...set];
}, [demands]);

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

  let result = [...demands];

  if (periodFilter !== "all") {

  const now = new Date();

  result = result.filter(item => {

    const completed =
      new Date(item.completed_at);

    const diffDays =
      (now - completed) /
      (1000 * 60 * 60 * 24);

    if (periodFilter === "today") {
      return (
        completed.toDateString() ===
        now.toDateString()
      );
    }

    if (periodFilter === "7days") {
      return diffDays <= 7;
    }

    if (periodFilter === "30days") {
      return diffDays <= 30;
    }

    return true;

  });

}

  if (exactDate) {
  result = result.filter(item => {
    const completedDate =
      new Date(item.completed_at)
        .toISOString()
        .split("T")[0];

    return completedDate === exactDate;
  });
}

  if (search) {
    result = result.filter(d =>
      (
        d.description +
        " " +
        (d.observation || "")
      )
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }

  if (filterPriority !== "all") {
    result = result.filter(
      d => d.priority === filterPriority
    );
  }

  if (filterSubgroup !== "all") {
    result = result.filter(d => {

const groups =
  typeof d.subgroup === "string"
    ? d.subgroup.split(", ")
    : d.subgroup || [];

      return groups.includes(
        filterSubgroup
      );
    });
  }

  if (filterResponsible !== "all") {

    result = result.filter(d => {

     const people =
  typeof d.responsible === "string"
    ? d.responsible.split(", ")
    : d.responsible || [];

      return people.includes(
        filterResponsible
      );
    });
  }

  return result;

}, [
  demands,
  search,
  filterPriority,
  filterSubgroup,
  filterResponsible,
  periodFilter,
  exactDate
]);

const grouped = useMemo(() => {

  const groups = {};

  filtered.forEach(item => {

    const dateObj = new Date(item.completed_at);

    const rawDate =
      dateObj.toLocaleDateString("pt-BR");

    if (!groups[rawDate]) {
      groups[rawDate] = [];
    }

    groups[rawDate].push(item);

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

          <div
  className="
    bg-[#004C97]
    rounded-xl
    p-4
    mt-6
    mb-6
    w-full
  "
>

 <div className="grid grid-cols-6 gap-4 w-full">

    <select
      value={filterPriority}
      onChange={(e) =>
        setFilterPriority(e.target.value)
      }
      className="border rounded-lg p-2"
    >
      <option value="all">
        Todas prioridades
      </option>

      <option value="alta">
        Alta
      </option>

      <option value="media">
        Média
      </option>

      <option value="baixa">
        Baixa
      </option>

    </select>

    <select
      value={filterSubgroup}
      onChange={(e) =>
        setFilterSubgroup(e.target.value)
      }
      className="border rounded-lg p-2"
    >
      <option value="all">
        Todos os grupos
      </option>

      {allSubgroups.map(group => (
        <option
          key={group}
          value={group}
        >
          {group}
        </option>
      ))}
    </select>

    <select
      value={filterResponsible}
      onChange={(e) =>
        setFilterResponsible(e.target.value)
      }
      className="border rounded-lg p-2"
    >
      <option value="all">
        Todos responsáveis
      </option>

      {allResponsibles.map(person => (
        <option
          key={person}
          value={person}
        >
          {person}
        </option>
      ))}
    </select>

    <select
  value={periodFilter}
  onChange={(e) =>
    setPeriodFilter(e.target.value)
  }
  className="border rounded-lg p-2"
>
  <option value="all">
    Todo período
  </option>

  <option value="today">
    Hoje
  </option>

  <option value="7days">
    Últimos 7 dias
  </option>

  <option value="30days">
    Últimos 30 dias
  </option>

</select>

   <div className="flex flex-col">
  <label className="text-white text-xs mb-1">
    Data exata
  </label>

  <input
    type="date"
    value={exactDate}
    onChange={(e) =>
      setExactDate(e.target.value)
    }
    className="bg-white border rounded-lg p-2"
  />
</div>

   <Button
  variant="secondary"
  onClick={() => {
    setFilterPriority("all");
    setFilterSubgroup("all");
    setFilterResponsible("all");
    setPeriodFilter("all");
    setExactDate("");
    setSearch("");
  }}
>
  Limpar filtros
</Button>

  </div>

</div>

<p className="text-slate-600">
  Total geral: {demands.length}
</p>

<p className="text-slate-600 font-medium">
  Resultado dos filtros: {filtered.length}
</p>

        </div>

        <div className="flex gap-3">

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

      <div className="flex justify-end mb-4">

  <Input
    placeholder="Pesquisar..."
    value={search}
    onChange={(e) =>
      setSearch(e.target.value)
    }
    className="w-80"
  />

</div>

      <div className="space-y-8">

{Object.entries(grouped)
  .sort((a, b) => {

    const [d1, m1, y1] = a[0].split("/");
    const [d2, m2, y2] = b[0].split("/");

    return (
      new Date(y2, m2 - 1, d2) -
      new Date(y1, m1 - 1, d1)
    );

  })
          .map(([date, items]) => (

            <div key={date}>

<h2 className="text-lg font-bold mb-4 text-slate-700">
  {date}
  {" "}
  ({items.length} demanda{items.length > 1 ? "s" : ""})
</h2>

              <div className="space-y-3">

                {items.map(item => (

<div
  key={item.id}
  className="
    bg-white
    border-l-4
    border-l-emerald-500
    rounded-xl
    p-5
    shadow-sm
  "
>

                    <div className="flex justify-between">

                      <div>

<div>

  <div className="flex flex-wrap gap-2 mb-3">

    <span className="
      text-xs
      font-semibold
      px-2
      py-1
      rounded
      bg-emerald-50
      text-emerald-700
    ">
      PRIORIDADE {item.priority.toUpperCase()}
    </span>

    {(
       typeof item.subgroup === "string"
    ? item.subgroup.split(", ")
    : item.subgroup || []
    ).map((sg, idx) => (

      <span
        key={idx}
        className="
          text-xs
          px-2
          py-1
          rounded
          bg-slate-100
          text-slate-600
        "
      >
        {sg}
      </span>

    ))}

  </div>

  <p className="font-medium text-slate-800">
    {item.description}
  </p>

  <div className="
    mt-3
    text-xs
    text-slate-500
  ">
    <span className="font-medium">
      Responsáveis:
    </span>{" "}

    {
    typeof item.responsible === "string"
      ? item.responsible
      : item.responsible.join(", ")
    }
  </div>

  <p className="
    text-xs
    text-emerald-600
    mt-2
    font-medium
  ">
    Concluído em{" "}
    {new Date(
      item.completed_at
    ).toLocaleString("pt-BR")}
  </p>

</div>


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
