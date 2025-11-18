import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../config/backend_url";

export default function RoleCustomization() {
  const [rows, setRows] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [roleMap, setRoleMap] = useState({});
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Floating box state
  const [showRoleBox, setShowRoleBox] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserAccess, setSelectedUserAccess] = useState([]);

  const [working, setWorking] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const authHeader = { Authorization: `Bearer ${token}` };

  const formatPerm = (p) =>
    p.replace(/_/g, " ").replace(/\b\w/g, (x) => x.toUpperCase());

  // ===== API =====
  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await axios.get(
        `${BASE_URL}/admin/get-tpo_management_admin-Users`,
        { headers: authHeader }
      );
      const data = res?.data?.findData;
      const arr = Array.isArray(data) ? data : data ? [data] : [];
      setRows(arr);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadRoleAccess = async () => {
    try {
      setLoadingRoles(true);
      const res = await axios.get(`${BASE_URL}/admin/viewRolePer`, {
        headers: authHeader,
      });
      const list = res?.data?.findRolePer || [];
      const map = {};
      list.forEach((r) => {
        map[r.role] = Array.isArray(r.access) ? r.access : [];
      });
      setRoleMap(map);
    } catch (e) {
      console.error(e);
      setRoleMap({});
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadRoleAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = loadingUsers || loadingRoles;

  // ===== Floating Card =====
  const openRoleBox = (user) => {
    setSelectedUserId(user._id);
    setSelectedRole(user.role);
    setSelectedUserAccess(Array.isArray(user.UserRoleAccess) ? user.UserRoleAccess : []);
    setSelectedPerms(roleMap[user.role] || []);
    setShowRoleBox(true);
  };

  const closeRoleBox = () => {
    setShowRoleBox(false);
    setSelectedRole("");
    setSelectedPerms([]);
    setSelectedUserId(null);
    setSelectedUserAccess([]);
  };

  // ===== Grant / Revoke (using dedicated endpoints) =====
  const handleGrant = async (perm) => {
    if (!selectedUserId || working) return;
    try {
      setWorking(true);
      await axios.patch(
        `${BASE_URL}/admin/users/${selectedUserId}/access/grant`,
        { permission: perm },
        { headers: { ...authHeader, "Content-Type": "application/json" } }
      );
      // Optimistic update
      const next = Array.from(new Set([...(selectedUserAccess || []), perm]));
      setSelectedUserAccess(next);
      setRows((prev) =>
        prev.map((u) => (u._id === selectedUserId ? { ...u, UserRoleAccess: next } : u))
      );
    } catch (e) {
      console.error(e);
      alert("Failed to grant permission.");
    } finally {
      setWorking(false);
    }
  };

  const handleRevoke = async (perm) => {
    if (!selectedUserId || working) return;
    try {
      setWorking(true);
      await axios.patch(
        `${BASE_URL}/admin/users/${selectedUserId}/access/revoke`,
        { permission: perm },
        { headers: { ...authHeader, "Content-Type": "application/json" } }
      );
      const next = (selectedUserAccess || []).filter((p) => p !== perm);
      setSelectedUserAccess(next);
      setRows((prev) =>
        prev.map((u) => (u._id === selectedUserId ? { ...u, UserRoleAccess: next } : u))
      );
    } catch (e) {
      console.error(e);
      alert("Failed to revoke permission.");
    } finally {
      setWorking(false);
    }
  };

  const handleDelete = (id) => {
    console.log("delete user", id);
  };

  return (
    <div className="relative">
      {/* Floating compare box */}
      {showRoleBox && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[460px] bg-white border shadow-xl rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              Role: <span className="text-indigo-600">{selectedRole}</span>
            </h3>
            <button
              onClick={closeRoleBox}
              className="p-1 rounded hover:bg-gray-100"
              disabled={working}
              title="Close"
            >
              ✕
            </button>
          </div>

          <p className="font-semibold text-gray-700 mb-2">
            Permissions (role vs user):
          </p>

          <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded bg-green-100 border border-green-300" />
              User Has
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded bg-gray-100 border border-gray-300" />
              Not Added
            </span>
          </div>

          {selectedPerms.length === 0 ? (
            <p className="text-gray-500">
              No permissions defined for this role.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedPerms.map((perm) => {
                const hasIt = (selectedUserAccess || []).includes(perm);
                return (
                  <div
                    key={perm}
                    className={
                      "flex items-center gap-1 rounded-full border px-2 py-1 text-xs " +
                      (hasIt
                        ? "bg-green-100 border-green-300 text-green-800"
                        : "bg-gray-100 border-gray-300 text-gray-700")
                    }
                  >
                    <span>{formatPerm(perm)}</span>
                    {hasIt ? (
                      <button
                        onClick={() => handleRevoke(perm)}
                        disabled={working}
                        className="ml-1 leading-none rounded hover:bg-green-200 px-1"
                        title="Revoke from user"
                      >
                        ✕
                      </button>
                    ) : (
                      <button
                        onClick={() => handleGrant(perm)}
                        disabled={working}
                        className="ml-1 leading-none rounded hover:bg-gray-200 px-1"
                        title="Grant to user"
                      >
                        +
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Users table */}
      <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
        {(loadingUsers || loadingRoles) && (
          <div className="h-1 w-full bg-gray-200 animate-pulse" />
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr className="text-left text-gray-700">
                <th className="px-4 py-3 w-20 font-semibold">Sr. No.</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 w-36 font-semibold">Role</th>
                <th className="px-4 py-3 w-[360px] font-semibold">
                  User Permissions
                </th>
                <th className="px-4 py-3 w-20 font-semibold text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              )}

              {rows.map((u, i) => (
                <tr key={u._id || i} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{i + 1}</td>

                  <td className="px-4 py-3 capitalize">
                    <span className="text-blue-600 hover:underline cursor-pointer">
                      {u.first_name}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${u.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {u.email}
                    </a>
                  </td>

                  <td className="px-4 py-3">{u.role}</td>

                  {/* Show ONLY user's own access */}
                  <td className="px-4 py-3">
                    <div className="flex items-center flex-wrap gap-2">
                      {(u.UserRoleAccess || []).slice(0, 4).map((p) => (
                        <span
                          key={p}
                          className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs"
                        >
                          {formatPerm(p)}
                        </span>
                      ))}

                      {(u.UserRoleAccess?.length || 0) > 4 && (
                        <span className="text-gray-600 text-xs">
                          +{u.UserRoleAccess.length - 4} more
                        </span>
                      )}

                      {/* ℹ️ Compare & edit */}
                      <button
                        onClick={() => openRoleBox(u)}
                        className="px-2 py-1 rounded border hover:bg-gray-50 text-xs"
                        title="View & edit permissions"
                      >
                        ℹ️
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => console.log("delete user", u._id)}
                      className="p-2 rounded hover:bg-gray-100"
                      title="Delete user"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        className="h-5 w-5 text-gray-700"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 3a1 1 0 0 0-1 1v1H5.5a1 1 0 1 0 0 2h.7l.8 11.2A3 3 0 0 0 10 21h4a3 3 0 0 0 2.99-2.78L17.8 7h.7a1 1 0 1 0 0-2H16V4a1 1 0 0 0-1-1H9Zm2 0h2v1h-2V3Zm-1.97 5h7.94l-.78 10.9a1 1 0 0 1-1 .9h-4a1 1 0 0 1-1-.9L9.03 8Z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}

              {isLoading &&
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx}>
                    {[...Array(6)].map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
