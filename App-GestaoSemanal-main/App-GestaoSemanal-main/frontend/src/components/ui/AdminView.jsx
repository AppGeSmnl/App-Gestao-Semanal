import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

const API =
"https://app-gestao-semanal-plus-version.onrender.com/api";

export default function AdminView() {

  const [members, setMembers] = useState([]);
  const [subgroups, setSubgroups] = useState([]);

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

  useEffect(() => {
    loadData();
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
    loadData();
  };

const createSubgroup = async () => {
  if (!newSubgroup.trim()) return;

  try {
    await axios.post(`${API}/subgroups`, {
      name: newSubgroup
    });

    await loadData();

    // IMPORTANTE
    if (window.fetchAdminDataGlobal) {
      await window.fetchAdminDataGlobal();
    }

    setNewSubgroup("");

    toast.success("Subgrupo criado");
  } catch {
    toast.error("Erro ao criar subgrupo");
  }
};

  const deleteMember = async (id) => {

    await axios.delete(
      `${API}/team-members/${id}`
    );

    loadData();
  };

  const deleteSubgroup = async (id) => {

    await axios.delete(
      `${API}/subgroups/${id}`
    );

    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      <h1 className="text-3xl font-bold mb-8">
        Administração
      </h1>

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
            Subgrupos
          </h2>

          <div className="flex gap-2 mb-6">

            <Input
              value={newSubgroup}
              onChange={(e) =>
                setNewSubgroup(e.target.value)
              }
              placeholder="Novo subgrupo"
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
