// src/components/layout/PageContainer.tsx
interface PageContainerProps {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}

export function PageContainer({ title, action, children }: PageContainerProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#fafafa]">{title}</h1>
        {action}
      </div>
      {children}
    </div>
  )
}
