"use client"

import { type ReactNode } from "react"
import { usePermissions, type Permission } from "@/hooks/use-permissions"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldX } from "lucide-react"

interface PermissionGateProps {
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean
  fallback?: ReactNode
  children: ReactNode
  showAccessDenied?: boolean
}

export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
  showAccessDenied = false,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions()

  if (loading) {
    return null
  }

  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
  } else {
    hasAccess = true
  }

  if (!hasAccess) {
    if (showAccessDenied) {
      return (
        <Card className="border-destructive/50">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <ShieldX className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold">Acesso Negado</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Voce nao tem permissao para acessar este recurso.
            </p>
          </CardContent>
        </Card>
      )
    }
    return <>{fallback}</>
  }

  return <>{children}</>
}
