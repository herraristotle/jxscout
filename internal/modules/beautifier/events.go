package beautifier

const (
	TopicBeautifierAssetSaved = "beautifier.asset_saved"
)

type EventBeautifierAssetSaved struct {
	AssetID int64 `json:"asset_id"`
	// Updated is true when the source asset content changed (forces re-analysis)
	Updated bool `json:"updated,omitempty"`
}
