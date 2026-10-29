import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Pencil, Save } from "lucide-react";
import { toast } from "sonner";

const API =
"https://app-gestao-semanal-plus-version.onrender.com/api";

export default function AdminView({
  onDataChanged,
  onTeamNameChanged
}) {

  const [members, setMembers] = useState([]);
  const [subgroups, setSubgroups] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [editingTeamName, setEditingTeamName] = useState(false);
  const [savingTeamName, setSavingTeamName] = useState(false);
  const [newMember, setNewMember] = useState("");
  const [newSubgroup, setNewSubgroup] = useState("");

  const loadData = async () => {
    try {

      const [membersRes, subgroupsRes] =
        await Promise.all([
          axios.get(`${API}/team-members`),
          axios.get(`${API}/subgroups`)
        ]);

      setMembers(membersRes.data);
      setSubgroups(subgroupsRes.data);

    } catch {
      toast.error("Erro ao carregar dados");
    }
  };

  
const loadTeamName = async () => {
  try {
    const response = await axios.get(`${API}/team-name`);
    setTeamName(response.data.name || "");
  } catch (error) {
    console.error("Erro ao carregar nome do time:", error);
    toast.error("Erro ao carregar o nome do time");
  }
};


const saveTeamName = async () => {
  const name = teamName.trim();

  if (!name) {
    toast.error("Informe um nome para o time");
    return;
  }

  try {
    setSavingTeamName(true);

    const response = await axios.put(`${API}/team-name`, {
      name
    });

    setTeamName(response.data.name);
    if (onTeamNameChanged) {
    onTeamNameChanged(response.data.name);
    }
    setEditingTeamName(false);

    toast.success("Nome do time atualizado");
    
    if (onDataChanged) {
      await onDataChanged();
    }
  } catch (error) {
    console.error("Erro ao salvar nome do time:", error);
    toast.error("Erro ao salvar o nome do time");
  } finally {
    setSavingTeamName(false);
  }
};


  useEffect(() => {
    loadData();
    loadTeamName();
  }, []);

const createMember = async () => {

  if (!newMember.trim()) return;

  await axios.post(
    `${API}/team-members`,
    {
      name: newMember
    }
  );

  setNewMember("");

  await loadData();

  if (onDataChanged) {
    await onDataChanged();
  }

  toast.success("Responsável criado");

};

const createSubgroup = async () => {

  if (!newSubgroup.trim()) return;

  await axios.post(
    `${API}/subgroups`,
    {
      name: newSubgroup
    }
  );

  setNewSubgroup("");

  await loadData();

  if (onDataChanged) {
    await onDataChanged();
  }

  toast.success("Subgrupo criado");

};

const deleteMember = async (id) => {

  await axios.delete(
    `${API}/team-members/${id}`
  );

  await loadData();

  if (onDataChanged) {
    await onDataChanged();
  }

  toast.success("Responsável removido");
};

const deleteSubgroup = async (id) => {

  await axios.delete(
    `${API}/subgroups/${id}`
  );

  await loadData();

  if (onDataChanged) {
    await onDataChanged();
  }

  toast.success("Subgrupo removido");
};

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      <h1 className="text-3xl font-bold mb-8">
        Gestão de Time
      </h1>

      
<div className="bg-white rounded-2xl border p-6 mb-8">
  <h2 className="font-bold text-xl mb-4">
    Nome do Time
  </h2>

  <div className="flex flex-col sm:flex-row gap-3">
    <Input
      value={teamName}
      onChange={(e) => setTeamName(e.target.value)}
      placeholder="Nome do time"
      disabled={!editingTeamName || savingTeamName}
      maxLength={100}
    />

    {!editingTeamName ? (
      <Button
        onClick={() => setEditingTeamName(true)}
        className="shrink-0"
      >
        <Pencil className="w-4 h-4 mr-2" />
        Editar
      </Button>
    ) : (
      <Button
        onClick={saveTeamName}
        disabled={savingTeamName || !teamName.trim()}
        className="shrink-0"
      >
        <Save className="w-4 h-4 mr-2" />
        {savingTeamName ? "Salvando..." : "Salvar"}
      </Button>
    )}
  </div>
</div>
      
      <div className="grid grid-cols-2 gap-8">

        <div className="bg-white rounded-2xl border p-6">

          <h2 className="font-bold text-xl mb-4">
            Responsáveis
          </h2>

          <div className="flex gap-2 mb-6">

            <Input
              value={newMember}
              onChange={(e) =>
                setNewMember(e.target.value)
              }
              placeholder="Novo responsável"
            />

            <Button onClick={createMember}>
              <Plus className="w-4 h-4" />
            </Button>

          </div>

          <div className="space-y-2">

            {members.map(member => (

              <div
                key={member.id}
                className="flex justify-between items-center p-3 border rounded-xl"
              >
                <span>{member.name}</span>

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() =>
                    deleteMember(member.id)
                  }
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

              </div>

            ))}

          </div>

        </div>

        <div className="bg-white rounded-2xl border p-6">

          <h2 className="font-bold text-xl mb-4">
            Sub-grupos
          </h2>

          <div className="flex gap-2 mb-6">

            <Input
              value={newSubgroup}
              onChange={(e) =>
                setNewSubgroup(e.target.value)
              }
              placeholder="Novo sub-grupo"
            />

            <Button onClick={createSubgroup}>
              <Plus className="w-4 h-4" />
            </Button>

          </div>

          <div className="space-y-2">

            {subgroups.map(group => (

              <div
                key={group.id}
                className="flex justify-between items-center p-3 border rounded-xl"
              >
                <span>{group.name}</span>

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() =>
                    deleteSubgroup(group.id)
                  }
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}
