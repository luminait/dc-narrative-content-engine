import { listAssetsGroupedAction } from '@/src/server/actions/assetLibrary.actions'
import { AddAssetPopover } from '@/src/features/assets/AddAssetPopover'
import { listCampaignNamesForUser } from '@/src/server/actions/campaigns.actions'
import { AssetCardWithPreview } from '@/src/features/assets/AssetCardWithPreview'
import type { AssetCategory } from '@/src/features/assets/categories'
import type { LibraryAsset } from '@/src/server/actions/assetLibrary.actions'

export default async function AssetsPage() {
  const grouped = await listAssetsGroupedAction()
  const campaignNames = await listCampaignNamesForUser()

  const categories = Object.entries(grouped) as [AssetCategory, LibraryAsset[]][];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Asset Library</h1>
      </div>

      <div className="space-y-12">
        {categories.map(([category, assets]) => (
          <section key={category} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium capitalize">{category}</h2>
              <span className="text-sm text-muted-foreground">{assets.length} items</span>
            </div>
            {assets.length === 0 ? (
              <div className="text-sm text-muted-foreground">No assets yet.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {assets.map((a) => (
                  <AssetCardWithPreview key={a.id} asset={{ id: a.id, name: a.name, url: a.url, bucketId: a.bucketId }} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Bottom action bar with Add Asset button */}
      <div className="flex justify-end">
        <AddAssetPopover campaignNames={campaignNames} />
      </div>
    </div>
  )
}
