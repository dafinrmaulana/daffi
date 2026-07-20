"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"

import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import { CardGrid } from "@/components/admin/CardGrid"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { EntityCard } from "@/components/admin/EntityCard"
import { Modal } from "@/components/admin/Modal"
import {
  simpleEntityConfigs,
  type SimpleEntityKind,
  type SimpleEntityRecord,
} from "@/lib/admin/simple-entities"

type SimpleFormValues = Record<string, string>

export function SimpleCrudPage({ kind }: { kind: SimpleEntityKind }) {
  const config = simpleEntityConfigs[kind]
  const [records, setRecords] = useState(() => config.records.map((record) => ({ ...record })))
  const [editing, setEditing] = useState<SimpleEntityRecord | null>(null)
  const [deleting, setDeleting] = useState<SimpleEntityRecord | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm<SimpleFormValues>()

  const emptyValues = Object.fromEntries(config.fields.map((field) => [field.name, ""]))

  const openCreate = () => {
    setEditing(null)
    reset(emptyValues)
    setIsFormOpen(true)
  }

  const openEdit = (record: SimpleEntityRecord) => {
    setEditing(record)
    reset(Object.fromEntries(config.fields.map((field) => [field.name, record[field.name] ?? ""])))
    setIsFormOpen(true)
  }

  const saveRecord = (values: SimpleFormValues) => {
    if (editing) {
      setRecords((current) =>
        current.map((record) => (record.id === editing.id ? { ...record, ...values } : record)),
      )
    } else {
      setRecords((current) => [...current, { id: `local-${Date.now()}`, ...values }])
    }
    setIsFormOpen(false)
    setEditing(null)
  }

  const confirmDelete = () => {
    if (!deleting) return
    setRecords((current) => current.filter((record) => record.id !== deleting.id))
    setDeleting(null)
  }

  const addButton = (
    <button
      type="button"
      onClick={openCreate}
      className="inline-flex items-center gap-2 border border-fg bg-fg px-4 py-3 text-sm text-bg"
    >
      <Plus size={16} aria-hidden="true" />
      Add {config.singular}
    </button>
  )

  return (
    <>
      <AdminPageHeader eyebrow={config.eyebrow} title={config.title} count={records.length} action={addButton} />
      <CardGrid
        isEmpty={records.length === 0}
        emptyTitle={`No ${config.title.toLowerCase()} yet`}
        emptyDescription={`Create the first ${config.singular} to populate this index.`}
        emptyAction={addButton}
      >
        {records.map((record) => {
          const title = record[config.cardTitleField]
          return (
            <EntityCard
              key={record.id}
              eyebrow={config.singular}
              title={title}
              description={config.cardDescriptionField ? record[config.cardDescriptionField] : undefined}
              meta={config.cardMetaFields.map((item) => ({
                label: item.label,
                value: record[item.field] || "—",
              }))}
              actions={
                <>
                  <button
                    type="button"
                    aria-label={`Edit ${title}`}
                    onClick={() => openEdit(record)}
                    className="border border-border px-3 py-2 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${title}`}
                    onClick={() => setDeleting(record)}
                    className="border border-border px-3 py-2 text-sm text-muted"
                  >
                    Delete
                  </button>
                </>
              }
            />
          )
        })}
      </CardGrid>

      <Modal
        open={isFormOpen}
        title={editing ? `Edit ${config.singular}` : `Create ${config.singular}`}
        onClose={() => setIsFormOpen(false)}
        footer={
          <>
            <button type="button" onClick={() => setIsFormOpen(false)} className="border border-border px-4 py-3 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              form="simple-crud-form"
              className="border border-fg bg-fg px-4 py-3 text-sm text-bg"
            >
              {editing ? "Save changes" : `Save ${config.singular}`}
            </button>
          </>
        }
      >
        <form id="simple-crud-form" className="space-y-4" noValidate onSubmit={handleSubmit(saveRecord)}>
          {config.fields.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className="font-mono text-[10px] uppercase tracking-[0.14em]">
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  rows={4}
                  placeholder={field.placeholder}
                  className="mt-2 w-full border border-border bg-bg px-3 py-3 outline-none focus:border-fg"
                  {...register(field.name)}
                />
              ) : (
                <input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  className="mt-2 min-h-12 w-full border border-border bg-bg px-3 outline-none focus:border-fg"
                  {...register(field.name)}
                />
              )}
            </div>
          ))}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete ${config.singular}?`}
        description={deleting ? `Remove ${deleting[config.cardTitleField]} from the current list.` : ""}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </>
  )
}
