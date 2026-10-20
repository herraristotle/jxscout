package assetservice

const (
	TopicAssetSaved = "asset_service.asset_saved"
)

type EventAssetSaved struct {
	AssetID int64 `json:"asset_id"`
	// Updated is true when an existing asset's content changed (drives *_updated hooks)
	Updated bool `json:"updated,omitempty"`
}
