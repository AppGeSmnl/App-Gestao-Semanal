import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Filter, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const API =
  "https://app-gestao-semanal-plus-version.onrender.com/api";

export default function CompletedView({
  sidebarOpen
}) {
  const [filterSubgroup, setFilterSubgroup] = useState("all");
  const [filterResponsible, setFilterResponsible] = useState("all");
  const [demands, setDemands] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [exactDate, setExactDate] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const dateInputRef = useRef(null);
  

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

  useEffect(() => {
  if (selectedMonth && selectedYear) {

    const month =
      String(selectedMonth).padStart(2, "0");

    setMonthFilter(
      `${selectedYear}-${month}`
    );

    setExactDate("");

  } else {
    setMonthFilter("");
  }

}, [selectedMonth, selectedYear]);


const filtered = useMemo(() => {

  let result = [...demands];

  

  if (exactDate) {
  result = result.filter(item => {
    const completedDate =
      new Date(item.completed_at)
        .toISOString()
        .split("T")[0];

    return completedDate === exactDate;
  });
}

if (monthFilter) {
  result = result.filter(item => {

    const itemMonth =
      item.completed_at.substring(0, 7);

    return itemMonth === monthFilter;

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
  filterSubgroup,
  filterResponsible,
  exactDate,
  monthFilter
]);

const grouped = useMemo(() => {

  const groups = {};

  filtered.forEach(item => {

const rawDate =
  item.completed_at.split("T")[0];

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

  const months = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ"
];

const years = [];

for (let y = 2024; y <= 2030; y++) {
  years.push(y);
}

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      <div className="mb-8 flex justify-between items-center">

        <div>

          <h1 className="text-3xl font-bold mb-8">
            Demandas Concluídas
          </h1>

<div className="bg-[#004C97] rounded-xl border border-[#003D7A] p-4 shadow-lg mb-6">
  <div className="flex flex-wrap items-center gap-4">

<div className="flex items-center gap-2 text-white">
  <Filter className="w-4 h-4" />
  <span className="font-medium text-sm">
    Filtros:
  </span>
</div>

    <div className="flex flex-wrap items-center gap-4">
      <label className="text-sm text-white font-medium whitespace-nowrap flex-shrink-0">
        Sub-grupo:
      </label>

<div className="flex flex-wrap items-center gap-4">
  <label className="text-sm text-white font-medium whitespace-nowrap">
    Sub-grupo:
  </label>

<Select
value={filterSubgroup}
onValueChange={setFilterSubgroup}

>

<SelectTrigger className="h-9 w-[250px] bg-white text-sm">

  <SelectValue placeholder="Todos" />
</SelectTrigger>

<SelectContent className="min-w-[350px]">
  <SelectItem value="all">
    Todos
  </SelectItem>

  {allSubgroups.map(group => (
    <SelectItem
      key={group}
      value={group}
    >
      {group}
    </SelectItem>
  ))}
</SelectContent>

  </Select>
</div>


      </div>

    <div className="flex flex-wrap items-center gap-4">
      <label className="text-sm text-white font-medium">
        Responsável:
      </label>

<div className="flex flex-wrap items-center gap-4">
  <label className="text-sm text-white font-medium whitespace-nowrap">
    Responsável:
  </label>

<Select
value={filterResponsible}
onValueChange={setFilterResponsible}
>

<SelectTrigger className="h-9 w-[250px] bg-white text-sm">

  <SelectValue placeholder="Todos" />
</SelectTrigger>

<SelectContent className="min-w-[350px]">
  <SelectItem value="all">
    Todos
  </SelectItem>

  {allResponsibles.map(person => (
    <SelectItem
      key={person}
      value={person}
    >
      {person}
    </SelectItem>
  ))}
</SelectContent>

  </Select>
</div>

    </div>

<div className="flex items-center gap-4">
  <label className="text-sm text-white font-medium whitespace-nowrap">
    Data:
  </label>

  <div
    className="
      w-40
      bg-white
      border
      rounded-md
      px-3
      py-2
      cursor-pointer
      flex
      items-center
    "
    onClick={() => {
      if (dateInputRef.current?.showPicker) {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current?.focus();
        dateInputRef.current?.click();
      }
    }}
  >
    <input
      ref={dateInputRef}
      type="date"
      value={exactDate}
      onChange={(e) => {
  setExactDate(e.target.value);
  setMonthFilter("");
}}
      className="
        w-full
        cursor-pointer
        border-0
        outline-none
        bg-transparent
      "
    />
  </div>
</div>

    <div className="flex flex-wrap items-center gap-4">
  <label className="text-sm text-white font-medium whitespace-nowrap">
    Mês:
  </label>

  <div className="flex flex-wrap items-center gap-4">

  <Select
  value={selectedMonth}
  onValueChange={setSelectedMonth}
>
  <SelectTrigger className="w-[90px] bg-white">
    <SelectValue placeholder="Mês" />
  </SelectTrigger>

  <SelectContent>
    {months.map((m, index) => (
      <SelectItem
        key={m}
        value={String(index + 1)}
      >
        {m}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
   

<Select
  value={selectedYear}
  onValueChange={setSelectedYear}
>
  <SelectTrigger className="w-[90px] bg-white">
    <SelectValue placeholder="Ano" />
  </SelectTrigger>

  <SelectContent>
    {years.map(year => (
      <SelectItem
        key={year}
        value={String(year)}
      >
        {String(year).slice(-2)}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

</div>
</div>

   {(filterSubgroup !== "all" ||
  filterResponsible !== "all" ||
  exactDate ||
 monthFilter ||
  search) ? (
  <Button
    variant="ghost"
    size="sm"
    onClick={() => {
      setFilterSubgroup("all");
      setFilterResponsible("all");
      setExactDate("");
      setSearch("");
      setMonthFilter("");
      setSelectedMonth("");
      setSelectedYear("");
    }}
    className="ml-auto text-white hover:bg-white/20 whitespace-nowrap"
  >
    Limpar filtros
  </Button>
) : (
  <div className="ml-auto w-[130px] h-9" />
)}
  </div>
</div>

<p className="text-slate-600">
  Total geral: {demands.length}
</p>

<p className="text-slate-600 font-medium">
  Resultado dos filtros: {filtered.length}
</p>

     </div>
      </div>

    <div className="flex justify-end mb-4">

  <div className="relative w-80">

    <Search
      className="
        absolute
        left-3
        top-1/2
        -translate-y-1/2
        w-5
        h-5
        text-[#004C97]
      "
    />

    <Input
      placeholder="Pesquisar..."
      value={search}
      onChange={(e) =>
        setSearch(e.target.value)
      }
      className="
        pl-10
        border-2
        border-[#004C97]/20
        focus:border-[#004C97]
      "
    />

  </div>

</div>

      <div className="space-y-8">

{Object.entries(grouped)
.sort(
  (a, b) =>
    new Date(b[0]).getTime() -
    new Date(a[0]).getTime()
)
          .map(([date, items]) => (

            <div key={date}>

<h2 className="text-lg font-bold mb-4 text-slate-700">
  {new Date(date + "T12:00:00")
  .toLocaleDateString("pt-BR")}
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

<div
  className={`
    fixed
    bottom-8
    right-8
    z-30
    flex
    flex-col
    gap-3
    transition-all
    duration-300
    ${sidebarOpen
      ? "opacity-0 pointer-events-none"
      : "opacity-100"}
  `}
>

  {!isDeleteMode ? (

    <Button
      variant="destructive"
      onClick={() => {
        setIsDeleteMode(true);
        setSelectedIds([]);
      }}
      className="
        rounded-full
        px-6
        py-6
        shadow-lg
        flex
        items-center
        gap-2
        font-semibold
        transition-transform
        hover:scale-105
      "
    >
      <Trash2 className="w-5 h-5" />
      Excluir Demandas
    </Button>

  ) : (

    <div className="flex gap-3">

      <Button
        variant="outline"
        className="
          rounded-full
          px-6
          py-6
          shadow-lg
          bg-white
        "
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
        className="
          rounded-full
          px-6
          py-6
          shadow-lg
          flex
          items-center
          gap-2
        "
        onClick={deleteSelected}
      >
        <Trash2 className="w-5 h-5" />
        Excluir ({selectedIds.length})
      </Button>

    </div>

  )}

</div>

    </div>
  );
}
