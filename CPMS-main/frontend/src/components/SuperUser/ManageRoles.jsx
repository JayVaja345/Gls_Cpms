import React, { useEffect, useState } from "react";
import { PERMS, ROLES } from "../Permissions";
import { BASE_URL } from "../../config/backend_url";
import axios from "axios";

function ManageRoles() {
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedAccess, setSelectedAccess] = useState([]);
  const [roles, setRoles] = useState([]);           // list from backend
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null); // if set -> update instead of create
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ===== Helpers =====
  const handlePermissionToggle = (value) => {
    setSelectedAccess((prev) =>
      prev.includes(value)
        ? prev.filter((perm) => perm !== value)
        : [...prev, value]
    );
  };

  const resetForm = () => {
    setSelectedRole("");
    setSelectedAccess([]);
    setEditingId(null);
  };

  // Try to turn stored keys like "students_list" into human labels using PERMS
  const permKeyToLabel = (permKey) => {
    // attempt reverse lookup by transforming "students_list" -> "STUDENTS_LIST"
    const guessKey = permKey.toUpperCase();
    if (PERMS[guessKey]) return PERMS[guessKey];
    // fallback: show raw key prettified
    return permKey.replace(/[:_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // ===== API Calls =====
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
          `${BASE_URL}/admin/viewRolePer`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(res)
        // Normalize: support array or single object payloads
        const data = await res?.data?.findRolePer;
        console.log(data)
        setRoles(Array.isArray(data?.data) ? data.data : data); // support either {data:[]} or []
        } catch (err) {
        console.error(err);
        alert(err.message || "Error loading roles");
        } finally {
        setLoading(false);
        }
  };

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    if (!selectedRole) {
      alert("Please select a role.");
      return;
    }

    const payload = { role: selectedRole, access: selectedAccess };
    const url = editingId
      ? `${BASE_URL}/admin/updateRole/${editingId}`
      : `${BASE_URL}/admin/addRolePer`;
    const method = editingId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.msg || "Request failed");

      alert(data?.msg || (editingId ? "Role updated!" : "Role created!"));
      resetForm();
      fetchRoles();
    } catch (error) {
      console.log(error);
      alert(error.message || "Error saving data");
    }
  };

  const handleEdit = (roleDoc) => {
    setSelectedRole(roleDoc.role);          // backend stores lowercase role like "tpo_admin"
    setSelectedAccess(roleDoc.access || []); // array of strings
    setEditingId(roleDoc._id);
    // scroll to form (optional)
    document.getElementById("manage-role-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this role?")) return;
    try {
      const res = await fetch(`${BASE_URL}/admin/deleteRole/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.msg || "Delete failed");
      fetchRoles();
    } catch (err) {
      console.error(err);
      alert(err.message || "Error deleting role");
    }
  };

  // ===== UI =====
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      {/* Manage Role Card */}
      <div id="manage-role-form" className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-lg mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {editingId ? "Edit Role" : "Manage Roles"}
          </h2>
          {editingId && (
            <button
              onClick={resetForm}
              className="text-sm px-3 py-1 rounded border hover:bg-gray-50"
              title="Cancel editing"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <p className="font-semibold text-gray-700 mb-2">Select Role:</p>
          <div className="space-y-2">
            {Object.entries(ROLES).map(([key, label]) => {
              const value = key.toLowerCase().replace(/:/g, "_");
; // e.g., "TPO" -> "tpo"
              return (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value={value}
                    checked={selectedRole === value}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="accent-indigo-600"
                  />
                  <span className="text-gray-700">{label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Permissions */}
        <div className="mb-6">
          <p className="font-semibold text-gray-700 mb-2">Give Permissions:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(PERMS).map(([key, label]) => {
              const value = key.toLowerCase().replace(/:/g, "_");
; // e.g., "STUDENTS_LIST" -> "students_list"
              return (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedAccess.includes(value)}
                    onChange={() => handlePermissionToggle(value)}
                    className="accent-indigo-600"
                  />
                    <span className="text-gray-700">{label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700"
          >
            {editingId ? "Update Role Access" : "Save Role Access"}
          </button>
          <button
            onClick={resetForm}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Roles Table */}
      <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Roles & Permissions</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Permissions</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6" colSpan={3}>Loading...</td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={3}>No roles found.</td>
                </tr>
              ) : (
                roles.map((r) => (
                  <tr key={r._id} className="border-t">
                    <td className="px-4 py-3 font-medium">
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-500" />
                        {r.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {(r.access || []).map((p) => (
                          <span
                            key={p}
                            className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs"
                          >
                            {permKeyToLabel(p)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(r)}
                          className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(r._id)}
                          className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ManageRoles;
