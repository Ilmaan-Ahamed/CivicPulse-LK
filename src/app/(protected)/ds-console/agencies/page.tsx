"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Plus, Edit, Trash2, Search, Filter, CheckCircle2, X, Phone, Mail, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function DsConsoleAgencies() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [agencies, setAgencies] = useState<any[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterDistrict, setFilterDistrict] = useState("ALL");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAgency, setDeletingAgency] = useState<any | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    type: "GOVERNMENT",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    district: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAgencies();
  }, []);

  useEffect(() => {
    let filtered = agencies;

    if (searchTerm) {
      filtered = filtered.filter(
        (agency) =>
          agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agency.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "ALL") {
      filtered = filtered.filter((agency) => agency.type === filterType);
    }

    if (filterDistrict !== "ALL") {
      filtered = filtered.filter((agency) => agency.district === filterDistrict);
    }

    setFilteredAgencies(filtered);
  }, [agencies, searchTerm, filterType, filterDistrict]);

  const fetchAgencies = async () => {
    try {
      const response = await fetch("/api/agencies");
      const data = await response.json();
      if (data.success) {
        setAgencies(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch agencies:", error);
    }
  };

  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/agencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("Create failed:", result.error);
        return;
      }

      await fetchAgencies();
      setIsCreateModalOpen(false);
      setFormData({
        name: "",
        type: "GOVERNMENT",
        contactName: "",
        contactPhone: "",
        contactEmail: "",
        district: "",
      });
    } catch (error) {
      console.error("Create submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAgency = (agency: any) => {
    setEditingAgency(agency);
    setFormData({
      name: agency.name,
      type: agency.type,
      contactName: agency.contactName || "",
      contactPhone: agency.contactPhone || "",
      contactEmail: agency.contactEmail || "",
      district: agency.district || "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgency) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/agencies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingAgency.id,
          ...formData,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("Update failed:", result.error);
        return;
      }

      await fetchAgencies();
      setIsEditModalOpen(false);
      setEditingAgency(null);
    } catch (error) {
      console.error("Update submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAgency = (agency: any) => {
    setDeletingAgency(agency);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAgency = async () => {
    if (!deletingAgency) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/agencies?id=${deletingAgency.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("Delete failed:", result.error);
        return;
      }

      await fetchAgencies();
      setIsDeleteModalOpen(false);
      setDeletingAgency(null);
    } catch (error) {
      console.error("Delete submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const districts = Array.from(new Set(agencies.map((a) => a.district).filter(Boolean)));

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8 space-y-8 transition-colors duration-300">
      {/* Header */}
      <div className="max-w-7xl mx-auto card-light dark:bg-[#0a0a0a] dark:border-[#333333] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 icon-orange dark:text-orange-400" />
            <h1 className="text-2xl page-title dark:text-white">Agencies Management</h1>
          </div>
          <p className="text-xs body-text dark:text-[#B0B0B0]">
            {currentUser.organization} • Manage government agencies, NGOs, and field teams
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/ds-officer"
            className="card-light dark:bg-slate-950 dark:border-slate-800 px-4 py-2 rounded-2xl border text-xs flex items-center gap-1.5 hover:border-orange-500 transition-colors"
          >
            <span>Back to Console</span>
          </Link>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-glass-orange-solid px-4 py-2 text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Agency</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search agencies by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 dark:bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-950 dark:bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
            >
              <option value="ALL">All Types</option>
              <option value="GOVERNMENT">Government</option>
              <option value="NGO">NGO</option>
              <option value="VOLUNTEER_TEAM">Volunteer Team</option>
              <option value="CSR">CSR</option>
            </select>

            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="bg-slate-950 dark:bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
            >
              <option value="ALL">All Districts</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Agencies List */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg page-title dark:text-white">
            Registered Agencies ({filteredAgencies.length})
          </h2>
        </div>

        {filteredAgencies.length === 0 ? (
          <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base card-heading dark:text-white">No Agencies Found</h3>
            <p className="text-xs body-text dark:text-slate-400">
              {agencies.length === 0
                ? "No agencies registered yet. Add your first agency to get started."
                : "Try adjusting your search or filter criteria."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgencies.map((agency) => (
              <div
                key={agency.id}
                className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-orange-950/60 text-orange-400 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold card-heading dark:text-white">
                        {agency.name}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400">{agency.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {agency.isActive !== false ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <X className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {agency.contactName && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="font-medium">Contact:</span>
                      <span>{agency.contactName}</span>
                    </div>
                  )}
                  {agency.contactPhone && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone className="w-3 h-3" />
                      <span>{agency.contactPhone}</span>
                    </div>
                  )}
                  {agency.contactEmail && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{agency.contactEmail}</span>
                    </div>
                  )}
                  {agency.district && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-3 h-3" />
                      <span>{agency.district}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleEditAgency(agency)}
                    className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteAgency(agency)}
                    className="flex-1 py-2 px-3 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateAgency}
            className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-bold text-white">Add New Agency</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Agency Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500"
                  placeholder="e.g. Road Development Authority"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Agency Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="GOVERNMENT">Government</option>
                  <option value="NGO">NGO</option>
                  <option value="VOLUNTEER_TEAM">Volunteer Team</option>
                  <option value="CSR">CSR</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500"
                  placeholder="Contact person name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500"
                  placeholder="+94 XX XXX XXXX"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500"
                  placeholder="contact@agency.lk"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  District
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500"
                  placeholder="e.g. Colombo"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-glass-orange-solid px-6 py-2 text-xs"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Agency"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingAgency && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleUpdateAgency}
            className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-bold text-white">Edit Agency</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingAgency(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Agency Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Agency Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="GOVERNMENT">Government</option>
                  <option value="NGO">NGO</option>
                  <option value="VOLUNTEER_TEAM">Volunteer Team</option>
                  <option value="CSR">CSR</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  District
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingAgency(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-glass-orange-solid px-6 py-2 text-xs"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingAgency && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-full bg-rose-950/60 text-rose-400 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Agency?</h3>
            </div>

            <div className="space-y-3">
              <p className="text-xs body-text dark:text-slate-400">
                Are you sure you want to delete <strong>{deletingAgency.name}</strong>? This action cannot be undone.
              </p>
              <p className="text-[11px] text-slate-500">
                Agencies with existing assignments cannot be deleted.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingAgency(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAgency}
                className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-rose-600/30"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete Agency"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
