BUILDER_IMAGE="ghcr.io/subratamondal1029/ns-player-builder:1.0"

if [[ -f "./.env.development" ]]; then
	source "./.env.development"
fi

echo "Using $BUILDER_IMAGE for builder environment"