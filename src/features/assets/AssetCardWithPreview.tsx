"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/packages/ui/shadcn/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/packages/ui/shadcn/dialog'
import { Button } from '@/packages/ui/shadcn/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/packages/ui/shadcn/dropdown-menu'
import { Copy, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteAssetAction, renameAssetAction } from '@/src/server/actions/assetLibrary.actions'
import { useRouter } from 'next/navigation'

type Asset = {
  id: string
  name: string
  url: string
  bucketId: string
}

function isVideo(name: string) {
  return /\.(mp4|mov|webm|mkv|avi)$/i.test(name)
}

function isAudio(name: string) {
  return /\.(mp3|wav|m4a|aac|ogg)$/i.test(name)
}

export function AssetCardWithPreview({ asset }: { asset: Asset }) {
  const filename = asset.name.split('/').slice(-1)[0]
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const thumb = (
    <Card className="overflow-hidden cursor-pointer">
      <CardHeader className="p-3">
        <CardTitle className="text-xs font-normal truncate" title={asset.name}>{filename}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isVideo(asset.name) ? (
          <video src={asset.url} className="w-full h-40 object-cover" muted playsInline />
        ) : isAudio(asset.name) ? (
          <div className="p-3">
            <audio src={asset.url} className="w-full" controls />
          </div>
        ) : (
          <img src={asset.url} alt={asset.name} className="w-full h-40 object-cover" />
        )}
        {/* Action row */}
        <div className="flex items-center justify-between gap-2 p-2 border-t">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              navigator.clipboard.writeText(asset.url)
                .then(() => toast.success('URL copied to clipboard'))
                .catch(() => toast.error('Failed to copy URL'))
            }}
            className="transition-colors hover:bg-gray-600 active:bg-gray-800 hover:text-white active:text-white"
          >
            <Copy className="h-4 w-4 mr-2" /> Copy URL
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem
                disabled={busy}
                onClick={async () => {
                  const current = asset.name
                  const next = window.prompt('Rename or move asset (path within bucket):', current)
                  if (!next || next === current) return
                  try {
                    setBusy(true)
                    const res = await renameAssetAction({ bucketId: asset.bucketId, fromObjectName: current, toObjectName: next })
                    if (res?.success) {
                      toast.success('Asset renamed')
                      router.refresh()
                    } else {
                      toast.error(res?.error || 'Failed to rename asset')
                    }
                  } catch (err: any) {
                    toast.error(err?.message || 'Failed to rename asset')
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                <Pencil className="h-4 w-4 mr-2" /> Edit name/path
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                disabled={busy}
                onClick={async () => {
                  if (!window.confirm('Delete this asset from storage? This cannot be undone.')) return
                  try {
                    setBusy(true)
                    const res = await deleteAssetAction({ bucketId: asset.bucketId, objectName: asset.name })
                    if (res?.success) {
                      toast.success('Asset deleted')
                      router.refresh()
                    } else {
                      toast.error(res?.error || 'Failed to delete asset')
                    }
                  } catch (err: any) {
                    toast.error(err?.message || 'Failed to delete asset')
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        {thumb}
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="truncate" title={asset.name}>{filename}</DialogTitle>
        </DialogHeader>
        <div className="w-full flex items-center justify-center">
          {isVideo(asset.name) ? (
            <video src={asset.url} className="max-h-[80vh] w-auto" controls autoPlay />
          ) : isAudio(asset.name) ? (
            <audio src={asset.url} className="w-full" controls />
          ) : (
            <img src={asset.url} alt={asset.name} className="max-h-[80vh] w-auto" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AssetCardWithPreview
