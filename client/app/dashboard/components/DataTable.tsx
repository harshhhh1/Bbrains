"use client"

import React from 'react'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface Column<T> {
    key: string
    header: string
    render?: (row: T) => React.ReactNode
    className?: string
}

interface DataTableProps<T> {
    columns: Column<T>[]
    data: T[]
    emptyMessage?: string
    className?: string
}

export default function DataTable<T extends Record<string, any>>({ columns, data, emptyMessage = 'No data available', className }: DataTableProps<T>) {
    return (
        <div className={cn('rounded-lg border border-gray-100 overflow-hidden', className)}>
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50">
                        {columns.map((col) => (
                            <TableHead key={col.key} className={cn('text-xs font-semibold text-gray-600 uppercase tracking-wide', col.className)}>
                                {col.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="text-center text-sm text-gray-400 py-8">
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((row, i) => (
                            <TableRow key={i} className="hover:bg-gray-50 transition-colors">
                                {columns.map((col) => (
                                    <TableCell key={col.key} className={cn('text-sm text-gray-700', col.className)}>
                                        {col.render ? col.render(row) : row[col.key]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
