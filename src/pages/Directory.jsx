// // src/pages/Directory.jsx
// import React, { useEffect, useState } from "react";
// import {
//   collection,
//   getDocs,
//   setDoc,
//   doc,
//   query
// } from "firebase/firestore";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { db, auth } from "../firebase";
// import { useAuth } from "../context/AuthContext";

// export default function Directory() {
//   const { user, role } = useAuth();
//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [sortBy, setSortBy] = useState({ field: "name", dir: "asc" });
//   const [search, setSearch] = useState("");
//   const [selectedCollege, setSelectedCollege] = useState("");
//   const [selectedProfession, setSelectedProfession] = useState("");
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [newUserRole, setNewUserRole] = useState("alumni");
//   const [form, setForm] = useState({});
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchUsers();
//     // eslint-disable-next-line
//   }, []);

//   useEffect(() => {
//     applyFilters();
//     // eslint-disable-next-line
//   }, [search, selectedCollege, selectedProfession, users]);

//   async function fetchUsers() {
//     setLoading(true);
//     try {
//       const q = query(collection(db, "users"));
//       const snap = await getDocs(q);
//       const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
//       setUsers(list);
//       setFilteredUsers(list);
//     } catch (err) {
//       console.error("Error fetching users:", err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   function sortUsers(field) {
//     const dir = sortBy.field === field && sortBy.dir === "asc" ? "desc" : "asc";
//     setSortBy({ field, dir });
//     const sorted = [...filteredUsers].sort((a, b) => {
//       const va = (a[field] || "").toString().toLowerCase();
//       const vb = (b[field] || "").toString().toLowerCase();
//       if (va < vb) return dir === "asc" ? -1 : 1;
//       if (va > vb) return dir === "asc" ? 1 : -1;
//       return 0;
//     });
//     setFilteredUsers(sorted);
//   }

//   function applyFilters() {
//     let data = [...users];

//     // Search filter (matches multiple fields)
//     if (search.trim()) {
//       const s = search.toLowerCase();
//       data = data.filter(
//         (u) =>
//           (u.name || "").toLowerCase().includes(s) ||
//           (u.email || "").toLowerCase().includes(s) ||
//           (u.role || "").toLowerCase().includes(s) ||
//           (u.collegeName || "").toLowerCase().includes(s) ||
//           (u.profession || "").toLowerCase().includes(s)
//       );
//     }

//     // College filter
//     if (selectedCollege) {
//       data = data.filter((u) => u.collegeName === selectedCollege);
//     }

//     // Profession filter
//     if (selectedProfession) {
//       data = data.filter((u) => u.profession === selectedProfession);
//     }

//     setFilteredUsers(data);
//   }

//   function handleFormChange(e) {
//     setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
//   }

//   async function handleAddUser(e) {
//     e.preventDefault();
//     setError("");

//     if (!user || role !== "admin") {
//       setError("Only admins can add users.");
//       return;
//     }

//     const { email, name } = form;
//     if (!email || !name) {
//       setError("Name and email are required.");
//       return;
//     }

//     try {
//       const tempPassword = form.tempPassword || "ChangeMe123!";
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         email,
//         tempPassword
//       );
//       const uid = userCredential.user.uid;

//       const docData = {
//         role: newUserRole,
//         email,
//         name,
//         dob: form.dob || "",
//         profession: form.profession || "",
//         createdBy: user.uid,
//         createdAt: new Date().toISOString(),
//         ...(newUserRole === "student"
//           ? {
//               registrationNo: form.registrationNo || "",
//               batch: form.batch || "",
//               yearToGraduate: form.yearToGraduate || "",
//               collegeName: form.collegeName || ""
//             }
//           : {}),
//         ...(newUserRole === "alumni"
//           ? {
//               graduateYear: form.graduateYear || "",
//               collegeName: form.collegeName || ""
//             }
//           : {}),
//         ...(newUserRole === "admin"
//           ? {
//               employeeId: form.employeeId || ""
//             }
//           : {})
//       };

//       await setDoc(doc(db, "users", uid), docData);

//       await fetchUsers();
//       setShowAddModal(false);
//       setForm({});
//       alert(
//         `${newUserRole} added successfully. Temp password for ${email}: ${tempPassword}`
//       );
//     } catch (err) {
//       console.error(err);
//       setError(
//         err.message || "Failed to create user. Email may already be in use."
//       );
//     }
//   }

//   // Extract unique colleges and professions for dropdowns
//   const colleges = [...new Set(users.map((u) => u.collegeName).filter(Boolean))];
//   const professions = [
//     ...new Set(users.map((u) => u.profession).filter(Boolean))
//   ];

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Directory</h1>

//       {/* Search + Filter */}
//       <div className="flex flex-wrap gap-3 mb-4 items-center">
//         <input
//           type="text"
//           placeholder="Search by name, email, role..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="border p-2 rounded w-64 "
//           //
//         />

//         <select
//           value={selectedCollege}
//           onChange={(e) => setSelectedCollege(e.target.value)}
//           className="border p-2 rounded"
//         >
//           <option value="">All Colleges</option>
//           {colleges.map((c, i) => (
//             <option key={i} value={c}>
//               {c}
//             </option>
//           ))}
//         </select>

//         <select
//           value={selectedProfession}
//           onChange={(e) => setSelectedProfession(e.target.value)}
//           className="border p-2 rounded"
//         >
//           <option value="">All Professions</option>
//           {professions.map((p, i) => (
//             <option key={i} value={p}>
//               {p}
//             </option>
//           ))}
//         </select>

//         <div className="ml-auto flex gap-2">
//           <button
//             className="underline"
//             onClick={() => sortUsers("name")}
//           >
//             Sort by Name
//           </button>
//           <button
//             className="underline"
//             onClick={() => sortUsers("role")}
//           >
//             Sort by Role
//           </button>
//           <button
//             className="underline"
//             onClick={() => sortUsers("graduateYear")}
//           >
//             Sort by Graduate Year
//           </button>
//         </div>

//         {role === "admin" && (
//           <button
//             className="ml-auto bg-blue-600 text-white px-3 py-1 rounded"
//             onClick={() => {
//               setNewUserRole("alumni");
//               setShowAddModal(true);
//             }}
//           >
//             + Add User
//           </button>
//         )}
//       </div>

//       {loading ? (
//         <p>Loading...</p>
//       ) : (
//         <div className="overflow-auto border rounded">
//           <table className="min-w-full">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="p-2 text-black">Name </th>
//                 <th className="p-2 text-black">Email</th>
//                 <th className="p-2 text-black">Role</th>
//                 <th className="p-2 text-black">College</th>
//                 <th className="p-2 text-black">Profession</th>
//                 <th className="p-2 text-black">Details</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredUsers.map((u) => (
//                 <tr key={u.id} className="border-t">
//                   <td className="p-2">{u.name}</td>
//                   <td className="p-2">{u.email}</td>
//                   <td className="p-2">{u.role}</td>
//                   <td className="p-2">{u.collegeName || "-"}</td>
//                   <td className="p-2">{u.profession || "-"}</td>
//                   <td className="p-2">
//                     {u.role === "student" && (
//                       <div>
//                         Reg: {u.registrationNo} • Batch: {u.batch} • Year:{" "}
//                         {u.yearToGraduate}
//                       </div>
//                     )}
//                     {u.role === "alumni" && (
//                       <div>
//                         Grad: {u.graduateYear} • College: {u.collegeName}
//                       </div>
//                     )}
//                     {u.role === "admin" && (
//                       <div>Employee ID: {u.employeeId}</div>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Add User Modal */}
//       {showAddModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/40">
//           <div className="bg-white p-6 rounded w-96 text-black">
//             <h2 className="text-lg font-bold mb-3">Add User</h2>

//             <label className="block mb-2">Role</label>
//             <select
//               value={newUserRole}
//               onChange={(e) => setNewUserRole(e.target.value)}
//               className="w-full mb-3 p-2 border"
//             >
//               <option value="alumni">Alumni</option>
//               <option value="student">Student</option>
//               <option value="admin">Admin</option>
//             </select>

//             <input
//               name="name"
//               placeholder="Full Name"
//               onChange={handleFormChange}
//               className="w-full mb-2 p-2 border"
//             />
//             <input
//               name="email"
//               placeholder="Email"
//               onChange={handleFormChange}
//               className="w-full mb-2 p-2 border"
//             />
//             <input
//               name="dob"
//               type="date"
//               onChange={handleFormChange}
//               className="w-full mb-2 p-2 border"
//             />
//             <input
//               name="profession"
//               placeholder="Profession"
//               onChange={handleFormChange}
//               className="w-full mb-2 p-2 border"
//             />

//             {newUserRole === "student" && (
//               <>
//                 <input
//                   name="registrationNo"
//                   placeholder="Registration No"
//                   onChange={handleFormChange}
//                   className="w-full mb-2 p-2 border"
//                 />
//                 <input
//                   name="batch"
//                   placeholder="Batch"
//                   onChange={handleFormChange}
//                   className="w-full mb-2 p-2 border"
//                 />
//                 <input
//                   name="yearToGraduate"
//                   placeholder="Year to Graduate"
//                   onChange={handleFormChange}
//                   className="w-full mb-2 p-2 border"
//                 />
//                 <input
//                   name="collegeName"
//                   placeholder="College Name"
//                   onChange={handleFormChange}
//                   className="w-full mb-2 p-2 border"
//                 />
//               </>
//             )}

//             {newUserRole === "alumni" && (
//               <>
//                 <input
//                   name="graduateYear"
//                   placeholder="Graduation Year"
//                   onChange={handleFormChange}
//                   className="w-full mb-2 p-2 border"
//                 />
//                 <input
//                   name="collegeName"
//                   placeholder="College Name"
//                   onChange={handleFormChange}
//                   className="w-full mb-2 p-2 border"
//                 />
//               </>
//             )}

//             {newUserRole === "admin" && (
//               <input
//                 name="employeeId"
//                 placeholder="Employee ID"
//                 onChange={handleFormChange}
//                 className="w-full mb-2 p-2 border"
//               />
//             )}

//             <input
//               name="tempPassword"
//               type="text"
//               placeholder="Temporary password (optional)"
//               onChange={handleFormChange}
//               className="w-full mb-2 p-2 border"
//             />

//             {error && <p className="text-red-500 mb-2">{error}</p>}

//             <div className="flex gap-2">
//               <button
//                 className="bg-green-600 text-white px-3 py-1 rounded"
//                 onClick={handleAddUser}
//               >
//                 Create
//               </button>
//               <button
//                 className="bg-gray-300 px-3 py-1 rounded"
//                 onClick={() => setShowAddModal(false)}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// src/pages/Directory.jsx
// src/pages/Directory.jsx
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function Directory() {
  const { role, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedProfession, setSelectedProfession] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [sortBy, setSortBy] = useState({ field: "name", dir: "asc" });

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // if null → add mode
  const [form, setForm] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, selectedRole, selectedProfession, selectedCollege, users]);

  // ---- FETCH + NORMALIZE ----
  async function fetchUsers() {
    setLoading(true);
    try {
      const q = query(collection(db, "users"));
      const snap = await getDocs(q);

      const list = snap.docs.map((d) => {
        const data = d.data() || {};

        // Normalize grad year (support many possible keys)
        const rawGrad =
          data.gradYear ??
          data.graduateYear ??
          data.yearToGraduate ??
          data.year_to_graduate ??
          data.graduationYear ??
          data.grad_year ??
          "";

        // Normalize college
        const rawCollege =
          data.college ??
          data.collegeName ??
          data.college_name ??
          data.institution ??
          "";

        // Normalize profession
        const rawProfession =
          data.profession ?? data.job ?? data.occupation ?? data.title ?? "";

        // Normalize batch
        const rawBatch =
          data.batch ?? data.batchYear ?? data.yearBatch ?? data.batch_name ?? "";

        return {
          id: d.id,
          ...data, // keep original fields (so editing won't lose unknown fields)
          // add normalized fields for UI usage (table, filters)
          gradYear: rawGrad !== null && rawGrad !== undefined ? String(rawGrad) : "",
          college: rawCollege || "",
          profession: rawProfession || "",
          batch: rawBatch || "",
        };
      });

      setUsers(list);
      setFiltered(list);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }

  // ---- FILTER / SEARCH (uses normalized fields) ----
  function applyFilters() {
    let data = [...users];

    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(
        (u) =>
          (u.name || "").toLowerCase().includes(s) ||
          (u.email || "").toLowerCase().includes(s) ||
          (u.profession || "").toLowerCase().includes(s) ||
          (u.college || "").toLowerCase().includes(s) ||
          (u.batch || "").toLowerCase().includes(s) ||
          (u.gradYear || "").toLowerCase().includes(s)
      );
    }

    if (selectedRole) data = data.filter((u) => u.role === selectedRole);
    if (selectedProfession)
      data = data.filter((u) => u.profession === selectedProfession);
    if (selectedCollege) data = data.filter((u) => u.college === selectedCollege);

    setFiltered(data);
  }

  function sortUsers(field) {
    const dir =
      sortBy.field === field && sortBy.dir === "asc" ? "desc" : "asc";
    setSortBy({ field, dir });

    const sorted = [...filtered].sort((a, b) => {
      const va = (a[field] || "").toString().toLowerCase();
      const vb = (b[field] || "").toString().toLowerCase();
      if (va < vb) return dir === "asc" ? -1 : 1;
      if (va > vb) return dir === "asc" ? 1 : -1;
      return 0;
    });
    setFiltered(sorted);
  }

  function handleFormChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSaveUser(e) {
    e.preventDefault();
    setError("");

    if (!user || role !== "admin") {
      setError("Only admins can manage users.");
      return;
    }

    if (!form.name || !form.email || !form.role) {
      setError("Name, Email, and Role are required.");
      return;
    }

    try {
      if (editingUser) {
        // Update existing user
        await updateDoc(doc(db, "users", editingUser.id), form);
      } else {
        // Add new user
        const id = Date.now().toString();
        await setDoc(doc(db, "users", id), {
          ...form,
          createdAt: new Date().toISOString(),
          createdBy: user.uid,
        });
      }

      await fetchUsers();
      setShowModal(false);
      setForm({});
      setEditingUser(null);
    } catch (err) {
      console.error(err);
      setError("Failed to save user.");
    }
  }

  async function handleDeleteUser(id) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  }

  // build dropdown lists from normalized fields
  const roles = [...new Set(users.map((u) => u.role).filter(Boolean))];
  const professions = [...new Set(users.map((u) => u.profession).filter(Boolean))];
  const colleges = [...new Set(users.map((u) => u.college).filter(Boolean))];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Directory</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-64 text-black"
        />

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="border p-2 rounded text-black"
        >
          <option value="">All Roles</option>
          {roles.map((r, i) => (
            <option key={i} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={selectedProfession}
          onChange={(e) => setSelectedProfession(e.target.value)}
          className="border p-2 rounded text-black"
        >
          <option value="">All Professions</option>
          {professions.map((p, i) => (
            <option key={i} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={selectedCollege}
          onChange={(e) => setSelectedCollege(e.target.value)}
          className="border p-2 rounded text-black"
        >
          <option value="">All Colleges</option>
          {colleges.map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Sorting */}
        <div className="ml-auto flex gap-2">
          <button className="underline" onClick={() => sortUsers("name")}>
            Sort by Name
          </button>
          <button className="underline" onClick={() => sortUsers("college")}>
            Sort by College
          </button>
          <button className="underline" onClick={() => sortUsers("profession")}>
            Sort by Profession
          </button>
        </div>

        {/* Admin-only add button */}
        {role === "admin" && (
          <button
            className="ml-auto bg-blue-600 text-white px-3 py-1 rounded"
            onClick={() => {
              setEditingUser(null);
              setForm({});
              setShowModal(true);
            }}
          >
            + Add Member
          </button>
        )}
      </div>

      {/* Directory Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-auto border rounded">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-black">Name</th>
                <th className="p-2 text-black">Email</th>
                <th className="p-2 text-black">Role</th>
                <th className="p-2 text-black">Profession</th>
                <th className="p-2 text-black">College</th>
                <th className="p-2 text-black">Batch</th>
                <th className="p-2 text-black">Grad Year</th>
                {role === "admin" && <th className="p-2">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2">{u.profession}</td>
                  <td className="p-2">{u.college}</td>
                  <td className="p-2">{u.batch}</td>
                  <td className="p-2">{u.gradYear}</td>
                  {role === "admin" && (
                    <td className="p-2 flex gap-2">
                      <button
                        className="bg-yellow-500 text-white px-2 py-1 rounded"
                        onClick={() => {
                          setEditingUser(u);
                          setForm(u);
                          setShowModal(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-600 text-white px-2 py-1 rounded"
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded w-96 text-black">
            <h2 className="text-lg font-bold mb-3">
              {editingUser ? "Edit User" : "Add User"}
            </h2>

            <input
              name="name"
              value={form.name || ""}
              placeholder="Name"
              onChange={handleFormChange}
              className="w-full mb-2 p-2 border"
            />
            <input
              name="email"
              value={form.email || ""}
              placeholder="Email"
              onChange={handleFormChange}
              className="w-full mb-2 p-2 border"
            />
            <select
              name="role"
              value={form.role || ""}
              onChange={handleFormChange}
              className="w-full mb-2 p-2 border"
            >
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
              <option value="admin">Admin</option>
            </select>
            <input
              name="profession"
              value={form.profession || ""}
              placeholder="Profession"
              onChange={handleFormChange}
              className="w-full mb-2 p-2 border"
            />
            <input
              name="college"
              value={form.college || ""}
              placeholder="College"
              onChange={handleFormChange}
              className="w-full mb-2 p-2 border"
            />
            <input
              name="batch"
              value={form.batch || ""}
              placeholder="Batch (e.g. 2022-2026)"
              onChange={handleFormChange}
              className="w-full mb-2 p-2 border"
            />
            <input
              name="gradYear"
              value={form.gradYear || ""}
              placeholder="Graduation Year"
              onChange={handleFormChange}
              className="w-full mb-2 p-2 border"
            />

            {error && <p className="text-red-500 mb-2">{error}</p>}

            <div className="flex gap-2">
              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={handleSaveUser}
              >
                Save
              </button>
              <button
                className="bg-gray-300 px-3 py-1 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
