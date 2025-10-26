"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import { FileText } from "lucide-react"
import { UploadMinuta } from "./components/UploadMinuta"
import { PreviewMinuta } from "./components/PreviewMinuta"
import { MinutasExistentes } from "./components/MinutasExistentes"
import type { Menu } from "@/types/database"

export default function MinutasPage() {
  const [previewData, setPreviewData] = useState<Menu[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handlePreviewReady = (data: Menu[]) => {
    setPreviewData(data)
  }

  const handleInsertComplete = () => {
    setPreviewData([])
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleCancelPreview = () => {
    setPreviewData([])
  }

  return (
    <div className="space-y-4">
      <Card className="border border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-indigo-600" />
            <div>
              <CardTitle className="text-xl text-slate-900">Gestión de Minutas</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Carga y administra los menús mensuales desde Excel</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <UploadMinuta onPreviewReady={handlePreviewReady} disabled={previewData.length > 0} />

      {previewData.length > 0 && (
        <PreviewMinuta data={previewData} onInsertComplete={handleInsertComplete} onCancel={handleCancelPreview} />
      )}

      <MinutasExistentes refreshTrigger={refreshTrigger} />
    </div>
  )
}
