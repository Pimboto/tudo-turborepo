// app/components/MultisessionAppSupport.tsx
'use client'
import React from 'react'
import { useSession } from '@clerk/nextjs'

export default function MultisessionAppSupport({
  children,
}: {
  children: React.ReactNode
}) {
  const { session } = useSession()
  return <React.Fragment key={session ? session.id : 'no-users'}>{children}</React.Fragment>
}
