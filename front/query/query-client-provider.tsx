"use client";
import React from 'react'
import { dehydrate, HydrationBoundary, QueryClientProvider } from '@tanstack/react-query'
import { getQueryClient } from './get-query-client';

type Props = {
  children: React.ReactNode
}
export const QueryProvider = ({ children }:Props) => {
  const queryClient = getQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        {children}
      </HydrationBoundary>
    </QueryClientProvider>
  )
}