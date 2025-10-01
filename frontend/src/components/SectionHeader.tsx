import { type ReactNode } from 'react'

type Props = {
  title: string
  breadcrumb?: ReactNode
  actions?: ReactNode
}

export default function SectionHeader({ title, breadcrumb, actions }: Props) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {breadcrumb ? <div className="text-xs text-gray-500">{breadcrumb}</div> : null}
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="flex items-center gap-2">
        {actions}
      </div>
    </div>
  )}


